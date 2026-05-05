import type { ReadingSession } from '@/types/flashcard';
import { db } from './schema';

export interface SessionQuery {
  bookId?: string;
  /** Inclusive: sessões iniciadas em `from` ou depois (ISO). */
  from?: string;
  /** Inclusive: sessões iniciadas em `to` ou antes (ISO). */
  to?: string;
  sort?: 'startedAt' | 'pagesRead';
  order?: 'asc' | 'desc';
  limit?: number;
}

export const getAll = async (): Promise<ReadingSession[]> => db.sessions.toArray();

export const getById = async (id: string): Promise<ReadingSession | undefined> =>
  db.sessions.get(id);

export const getByBook = async (bookId: string): Promise<ReadingSession[]> =>
  db.sessions.where('bookId').equals(bookId).toArray();

export const add = async (s: ReadingSession): Promise<string> => db.sessions.add(s);

export const update = async (id: string, patch: Partial<ReadingSession>): Promise<number> =>
  db.sessions.update(id, patch);

export const remove = async (id: string): Promise<void> => {
  await db.sessions.delete(id);
};

export const query = async (q: SessionQuery = {}): Promise<ReadingSession[]> => {
  let items: ReadingSession[];
  if (q.bookId !== undefined) {
    items = await db.sessions.where('bookId').equals(q.bookId).toArray();
  } else {
    items = await db.sessions.toArray();
  }

  if (q.from !== undefined) {
    const from = q.from;
    items = items.filter((s) => s.startedAt >= from);
  }
  if (q.to !== undefined) {
    const to = q.to;
    items = items.filter((s) => s.startedAt <= to);
  }

  const sort = q.sort ?? 'startedAt';
  const order = q.order ?? 'desc';
  const sign = order === 'desc' ? -1 : 1;
  items.sort((a, b) => {
    const av = a[sort];
    const bv = b[sort];
    if (av === undefined && bv === undefined) return 0;
    if (av === undefined) return 1;
    if (bv === undefined) return -1;
    if (av < bv) return -1 * sign;
    if (av > bv) return 1 * sign;
    return 0;
  });

  if (q.limit !== undefined) items = items.slice(0, q.limit);
  return items;
};

export const count = async (): Promise<number> => db.sessions.count();
