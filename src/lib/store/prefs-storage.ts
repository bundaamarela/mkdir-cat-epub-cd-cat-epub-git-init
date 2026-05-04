import Dexie, { type Table } from 'dexie';
import type { StateStorage } from 'zustand/middleware';

// Standalone KV store apenas para o middleware persist do Zustand.
// Fase 3 implementa o schema canónico em src/lib/db/schema.ts.

interface KvRow {
  key: string;
  value: string;
}

class PrefsKvDB extends Dexie {
  kv!: Table<KvRow, string>;

  constructor() {
    super('CatEpubPrefs');
    this.version(1).stores({ kv: 'key' });
  }
}

const kvDb = new PrefsKvDB();

export const dexieStorage: StateStorage = {
  getItem: async (name) => {
    const row = await kvDb.kv.get(name);
    return row ? row.value : null;
  },
  setItem: async (name, value) => {
    await kvDb.kv.put({ key: name, value });
  },
  removeItem: async (name) => {
    await kvDb.kv.delete(name);
  },
};
