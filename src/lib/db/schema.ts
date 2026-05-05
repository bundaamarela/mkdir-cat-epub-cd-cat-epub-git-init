import Dexie, { type Table } from 'dexie';

import type { Book, ReadingPosition } from '@/types/book';
import type { Bookmark, Note } from '@/types/note';
import type { Flashcard, ReadingSession } from '@/types/flashcard';
import type { Highlight } from '@/types/highlight';
import type { Preferences } from '@/types/prefs';

/**
 * Linha persistida no `prefs`: as preferências canónicas + metadados internos
 * usados pelo middleware persist do Zustand.
 *
 * Os campos `_persistVersion` / `_persistEnvelopeKey` ficam fora do tipo
 * `Preferences` para não vazarem para o resto da app.
 */
export interface PreferencesRow extends Preferences {
  _persistVersion?: number;
  _persistEnvelopeKey?: string;
}

export class CatEpubDB extends Dexie {
  books!: Table<Book, string>;
  positions!: Table<ReadingPosition, string>;
  highlights!: Table<Highlight, string>;
  notes!: Table<Note, string>;
  bookmarks!: Table<Bookmark, string>;
  flashcards!: Table<Flashcard, string>;
  sessions!: Table<ReadingSession, string>;
  prefs!: Table<PreferencesRow, 'singleton'>;

  constructor(name = 'CatEpub') {
    super(name);
    this.version(1).stores({
      books: 'id, title, author, addedAt, lastReadAt, fileHash',
      positions: 'bookId, updatedAt',
      highlights: 'id, bookId, color, createdAt, *tags',
      notes: 'id, bookId, highlightId, createdAt, *tags',
      bookmarks: 'id, bookId, createdAt',
      flashcards: 'id, bookId, due, state, highlightId',
      sessions: 'id, bookId, startedAt',
      prefs: 'id',
    });
  }
}

export const db = new CatEpubDB();
