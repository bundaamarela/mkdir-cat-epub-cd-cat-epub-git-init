import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { CatEmpty } from '@/components/icons';
import * as books from '@/lib/db/books';
import * as flashcardsDb from '@/lib/db/flashcards';
import * as highlightsDb from '@/lib/db/highlights';
import { getDueCards, scheduleCard, type ReviewRating } from '@/lib/srs/scheduler';
import { cn } from '@/lib/utils/cn';
import type { Flashcard } from '@/types/flashcard';
import styles from './Review.module.css';

const RATINGS: ReadonlyArray<{ id: ReviewRating; label: string; hint: string }> = [
  { id: 'again', label: 'Outra vez', hint: 'Esqueci' },
  { id: 'hard', label: 'Difícil', hint: 'Custou' },
  { id: 'good', label: 'Bom', hint: 'Lembrei' },
  { id: 'easy', label: 'Fácil', hint: 'Imediato' },
];

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const Review: FC = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<Flashcard[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [bookTitles, setBookTitles] = useState<Record<string, string>>({});
  const [nextDueAt, setNextDueAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const due = await getDueCards();
      if (cancelled) return;
      setQueue(due);
      setIndex(0);
      setRevealed(false);

      const ids = Array.from(new Set(due.map((c) => c.bookId)));
      const titles: Record<string, string> = {};
      await Promise.all(
        ids.map(async (id) => {
          const b = await books.getById(id);
          if (b) titles[id] = b.title;
        }),
      );
      if (!cancelled) setBookTitles(titles);

      if (due.length === 0) {
        const all = await flashcardsDb.getAll();
        if (cancelled) return;
        const future = all
          .map((c) => c.due)
          .filter((d) => new Date(d).getTime() > Date.now())
          .sort();
        setNextDueAt(future[0] ?? null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = queue && index < queue.length ? queue[index] : null;

  const handleRate = useCallback(
    async (rating: ReviewRating): Promise<void> => {
      if (!current) return;
      const updated = scheduleCard(current, rating);
      await flashcardsDb.update(updated.id, updated);
      setRevealed(false);
      setIndex((i) => i + 1);
    },
    [current],
  );

  const handleOpenInBook = useCallback(async (): Promise<void> => {
    if (!current?.highlightId) {
      if (current) navigate(`/reader/${current.bookId}`);
      return;
    }
    const h = await highlightsDb.getById(current.highlightId);
    if (!h) {
      navigate(`/reader/${current.bookId}`);
      return;
    }
    navigate(`/reader/${current.bookId}`, { state: { cfi: h.cfiRange } });
  }, [current, navigate]);

  const totalCount = queue?.length ?? 0;
  const progress = useMemo(() => {
    if (!queue || queue.length === 0) return 0;
    return Math.min(100, Math.round((index / queue.length) * 100));
  }, [queue, index]);

  if (queue === null) {
    return (
      <section className={cn(styles.page)}>
        <h1 className={cn(styles.title)}>Revisão</h1>
        <p className={cn(styles.loading)}>A carregar cards…</p>
      </section>
    );
  }

  if (queue.length === 0) {
    return (
      <section className={cn(styles.page)}>
        <h1 className={cn(styles.title)}>Revisão</h1>
        <div className={cn(styles.empty)}>
          <CatEmpty size={120} />
          <h2 className={cn(styles.emptyTitle)}>Nada para hoje</h2>
          <p className={cn(styles.emptySub)}>
            {nextDueAt
              ? `Próxima revisão: ${formatDate(nextDueAt)}.`
              : 'Cria flashcards a partir dos teus highlights para começar.'}
          </p>
          <Link to="/library" className={cn(styles.action)}>
            Ir para a biblioteca
          </Link>
        </div>
      </section>
    );
  }

  if (!current) {
    return (
      <section className={cn(styles.page)}>
        <h1 className={cn(styles.title)}>Revisão</h1>
        <div className={cn(styles.empty)}>
          <CatEmpty size={120} />
          <h2 className={cn(styles.emptyTitle)}>Sessão completa</h2>
          <p className={cn(styles.emptySub)}>
            Reviste {totalCount} {totalCount === 1 ? 'card' : 'cards'}.
          </p>
          <Link to="/" className={cn(styles.action)}>
            Voltar ao início
          </Link>
        </div>
      </section>
    );
  }

  const bookTitle = bookTitles[current.bookId] ?? '—';

  return (
    <section className={cn(styles.page)}>
      <header className={cn(styles.header)}>
        <h1 className={cn(styles.title)}>Revisão</h1>
        <span className={cn(styles.counter)}>
          {index + 1} / {totalCount}
        </span>
      </header>

      <div className={cn(styles.progressTrack)} aria-hidden>
        <div className={cn(styles.progressFill)} style={{ width: `${progress}%` }} />
      </div>

      <article className={cn(styles.card)}>
        <div className={cn(styles.cardMeta)}>
          <span className={cn(styles.cardBook)}>{bookTitle}</span>
          <button
            type="button"
            className={cn(styles.linkButton)}
            onClick={() => void handleOpenInBook()}
          >
            Ver no livro
          </button>
        </div>

        <div className={cn(styles.cardFront)}>{current.front}</div>

        {revealed ? (
          <div className={cn(styles.cardBack)}>{current.back}</div>
        ) : (
          <button
            type="button"
            className={cn(styles.revealButton)}
            onClick={() => setRevealed(true)}
            data-testid="reveal-button"
          >
            Mostrar resposta
          </button>
        )}
      </article>

      {revealed && (
        <div className={cn(styles.ratings)} data-testid="rating-bar">
          {RATINGS.map((r) => (
            <button
              key={r.id}
              type="button"
              className={cn(styles.ratingButton, styles[`rating-${r.id}` as const])}
              onClick={() => void handleRate(r.id)}
              data-testid={`rating-${r.id}`}
            >
              <span className={cn(styles.ratingLabel)}>{r.label}</span>
              <span className={cn(styles.ratingHint)}>{r.hint}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default Review;
