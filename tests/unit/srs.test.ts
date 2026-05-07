import { beforeEach, describe, expect, it } from 'vitest';

import * as flashcardsDb from '@/lib/db/flashcards';
import { db } from '@/lib/db/schema';
import { createCard, getDueCards, getDueCount, scheduleCard } from '@/lib/srs/scheduler';

beforeEach(async () => {
  await db.flashcards.clear();
});

describe('createCard', () => {
  it('produz um card com estado inicial "new" e due ~= now', () => {
    const now = new Date('2026-05-01T12:00:00Z');
    const card = createCard({ bookId: 'b1', front: 'Q?', back: 'A.', now });
    expect(card.state).toBe('new');
    expect(card.reps).toBe(0);
    expect(card.lapses).toBe(0);
    expect(card.stability).toBeGreaterThanOrEqual(0);
    expect(card.difficulty).toBeGreaterThanOrEqual(0);
    expect(new Date(card.due).getTime()).toBeGreaterThanOrEqual(now.getTime() - 60_000);
    expect(card.front).toBe('Q?');
    expect(card.back).toBe('A.');
    expect(card.bookId).toBe('b1');
    expect(card.highlightId).toBeUndefined();
  });

  it('inclui highlightId quando fornecido', () => {
    const card = createCard({ bookId: 'b1', front: 'Q', back: 'A', highlightId: 'h1' });
    expect(card.highlightId).toBe('h1');
  });

  it('gera ids distintos a cada chamada', () => {
    const a = createCard({ bookId: 'b1', front: 'Q', back: 'A' });
    const b = createCard({ bookId: 'b1', front: 'Q', back: 'A' });
    expect(a.id).not.toBe(b.id);
  });
});

describe('scheduleCard', () => {
  const now = new Date('2026-05-01T12:00:00Z');

  it('"again" mantém o card vivo (stability >= 0) e regista uma rep', () => {
    const card = createCard({ bookId: 'b1', front: 'Q', back: 'A', now });
    const next = scheduleCard(card, 'again', now);
    expect(next.reps).toBe(card.reps + 1);
    expect(next.last_review).toBeDefined();
    expect(next.stability).toBeGreaterThanOrEqual(0);
    expect(['learning', 'relearning']).toContain(next.state);
  });

  it('"good" agenda um intervalo positivo (scheduled_days > 0 ou state avança)', () => {
    const card = createCard({ bookId: 'b1', front: 'Q', back: 'A', now });
    const next = scheduleCard(card, 'good', now);
    expect(next.reps).toBe(1);
    expect(next.state).not.toBe('new');
    const dueDelta = new Date(next.due).getTime() - now.getTime();
    expect(dueDelta).toBeGreaterThan(0);
  });

  it('"easy" agenda um intervalo maior do que "good"', () => {
    const card = createCard({ bookId: 'b1', front: 'Q', back: 'A', now });
    const good = scheduleCard(card, 'good', now);
    const easy = scheduleCard(card, 'easy', now);
    expect(new Date(easy.due).getTime()).toBeGreaterThanOrEqual(new Date(good.due).getTime());
  });

  it('"hard" produz um intervalo menor ou igual a "good"', () => {
    const card = createCard({ bookId: 'b1', front: 'Q', back: 'A', now });
    const hard = scheduleCard(card, 'hard', now);
    const good = scheduleCard(card, 'good', now);
    expect(new Date(hard.due).getTime()).toBeLessThanOrEqual(new Date(good.due).getTime());
  });

  it('preserva id, bookId, front, back e highlightId', () => {
    const card = createCard({
      bookId: 'b1',
      front: 'Q',
      back: 'A',
      highlightId: 'h1',
      now,
    });
    const next = scheduleCard(card, 'good', now);
    expect(next.id).toBe(card.id);
    expect(next.bookId).toBe(card.bookId);
    expect(next.front).toBe(card.front);
    expect(next.back).toBe(card.back);
    expect(next.highlightId).toBe('h1');
  });
});

describe('getDueCount', () => {
  it('retorna 0 com a DB vazia', async () => {
    const n = await getDueCount();
    expect(n).toBe(0);
  });

  it('conta cards com due <= now', async () => {
    const now = new Date('2026-05-01T12:00:00Z');
    const past = createCard({ bookId: 'b1', front: 'Q1', back: 'A1', now });
    past.due = new Date('2026-04-01T12:00:00Z').toISOString();
    const future = createCard({ bookId: 'b1', front: 'Q2', back: 'A2', now });
    future.due = new Date('2026-06-01T12:00:00Z').toISOString();
    await flashcardsDb.add(past);
    await flashcardsDb.add(future);
    const n = await getDueCount(now);
    expect(n).toBe(1);
  });
});

describe('getDueCards', () => {
  it('retorna [] com a DB vazia', async () => {
    const list = await getDueCards();
    expect(list).toEqual([]);
  });

  it('filtra por bookId quando fornecido', async () => {
    const now = new Date('2026-05-01T12:00:00Z');
    const a = createCard({ bookId: 'b1', front: 'Q', back: 'A', now });
    a.due = new Date('2026-04-01T12:00:00Z').toISOString();
    const b = createCard({ bookId: 'b2', front: 'Q', back: 'A', now });
    b.due = new Date('2026-04-01T12:00:00Z').toISOString();
    await flashcardsDb.add(a);
    await flashcardsDb.add(b);
    const onlyB1 = await getDueCards('b1', now);
    expect(onlyB1.map((c) => c.bookId)).toEqual(['b1']);
  });
});
