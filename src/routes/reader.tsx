import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useShallow } from 'zustand/shallow';

import { ReaderSurface } from '@/components/reader/ReaderSurface';
import { ReaderTopBar } from '@/components/reader/ReaderTopBar';
import * as positions from '@/lib/db/positions';
import * as books from '@/lib/db/books';
import type { EpubRenderer, RendererOptions } from '@/lib/epub/renderer';
import { BOOK_QUERY_KEYS, useBook } from '@/lib/store/library';
import { usePrefs } from '@/lib/store/prefs';
import { readColorToken } from '@/lib/theme/colors';
import { debounce } from '@/lib/utils/debounce';
import type { ReadingPosition } from '@/types/book';

const Reader = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const bookQuery = useBook(id);
  const positionQuery = useQuery({
    queryKey: ['positions', id ?? 'noop'],
    // TanStack Query 5 não aceita `undefined` — devolve `null` quando não há posição.
    queryFn: () => (id ? positions.getById(id).then((p) => p ?? null) : Promise.resolve(null)),
    enabled: id !== undefined,
  });

  const [chromeVisible, setChromeVisible] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rendererRef = useRef<EpubRenderer | null>(null);
  const book = bookQuery.data;

  // Marca o livro como aberto agora (lastReadAt) numa única passagem.
  const touchedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!book || touchedRef.current === book.id) return;
    touchedRef.current = book.id;
    void books.update(book.id, { lastReadAt: new Date().toISOString() });
  }, [book]);

  // useShallow evita o loop infinito causado pelo selector de objectos inline.
  const prefs = usePrefs(
    useShallow((s) => ({
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      lineHeight: s.lineHeight,
      pageWidth: s.pageWidth,
      paragraphSpacing: s.paragraphSpacing,
      letterSpacing: s.letterSpacing,
      paginationMode: s.paginationMode,
      theme: s.theme,
    })),
  );

  const options = useMemo<RendererOptions>(
    () => ({
      fontFamily: prefs.fontFamily,
      fontSize: prefs.fontSize,
      lineHeight: prefs.lineHeight,
      pageWidth: prefs.pageWidth,
      paragraphSpacing: prefs.paragraphSpacing,
      letterSpacing: prefs.letterSpacing,
      paginationMode: prefs.paginationMode,
      // `theme` participa para forçar re-leitura das CSS vars; o lint não o sabe.
      background: (prefs.theme, readColorToken('--bg')),
      text: readColorToken('--text'),
    }),
    [
      prefs.fontFamily,
      prefs.fontSize,
      prefs.lineHeight,
      prefs.pageWidth,
      prefs.paragraphSpacing,
      prefs.letterSpacing,
      prefs.paginationMode,
      prefs.theme,
    ],
  );

  // Debounced upsert da posição (1s).
  const persistPosition = useMemo(
    () =>
      debounce(async (bookId: string, cfi: string, fraction: number, index: number) => {
        const row: ReadingPosition = {
          bookId,
          cfi,
          chapterIndex: index,
          percentage: Math.round(fraction * 100),
          updatedAt: new Date().toISOString(),
        };
        await positions.upsert(row);
      }, 1000),
    [],
  );

  // Garante flush da última posição quando saímos do leitor (route change ou unmount).
  // Invalida as queries de progresso para a Home/Biblioteca refrescarem.
  useEffect(() => {
    return () => {
      persistPosition.flush();
      void queryClient.invalidateQueries({ queryKey: BOOK_QUERY_KEYS.all });
    };
  }, [persistPosition, queryClient]);

  const handleReady = useCallback(
    (renderer: EpubRenderer) => {
      rendererRef.current = renderer;
      if (!book) return;
      renderer.onLocationChange((info) => {
        const cfi = info.cfi;
        if (typeof cfi !== 'string') return;
        const fraction = typeof info.fraction === 'number' ? info.fraction : 0;
        const index = typeof info.index === 'number' ? info.index : 0;
        persistPosition(book.id, cfi, fraction, index);
      });
    },
    [book, persistPosition],
  );

  const handleError = useCallback((err: Error) => {
    setErrorMsg(err.message);
  }, []);

  // Atalhos de teclado: setas, espaço para toggle UI.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const r = rendererRef.current;
      if (!r) return;
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        void r.nextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        void r.prevPage();
      } else if (e.key === ' ') {
        e.preventDefault();
        setChromeVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!id) return <p style={{ padding: '2rem' }}>ID de livro em falta.</p>;

  // Aguarda book + tentativa de leitura da posição (mesmo se não existir).
  if (bookQuery.isLoading || positionQuery.isLoading)
    return <p style={{ padding: '2rem', color: 'var(--text-3)' }}>A carregar livro…</p>;

  if (!book)
    return (
      <p style={{ padding: '2rem' }}>
        Livro não encontrado. <a href="/library">Voltar à biblioteca</a>
      </p>
    );

  if (errorMsg)
    return (
      <p style={{ padding: '2rem', color: '#c75050' }}>Erro a abrir EPUB: {errorMsg}</p>
    );

  const startCfi = positionQuery.data?.cfi;

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onClick={(e) => {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT') return;
        setChromeVisible((v) => !v);
      }}
    >
      <ReaderTopBar title={book.title} author={book.author} visible={chromeVisible} />
      <ReaderSurface
        blob={book.fileBlob}
        options={options}
        {...(startCfi !== undefined ? { startCfi } : {})}
        onReady={handleReady}
        onError={handleError}
      />
    </div>
  );
};

export default Reader;
