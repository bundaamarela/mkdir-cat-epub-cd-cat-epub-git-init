import { type FC, useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { usePrefs } from '@/lib/store/prefs';
import { cn } from '@/lib/utils/cn';
import settingsStyles from '@/routes/Settings.module.css';
import styles from './LibraryFolderSection.module.css';

const isTauri = (): boolean => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

interface EpubFile {
  path: string;
  name: string;
}

export const LibraryFolderSection: FC = () => {
  const { libraryFolder, setLibraryFolder } = usePrefs(
    useShallow((s) => ({
      libraryFolder: s.libraryFolder,
      setLibraryFolder: s.setLibraryFolder,
    })),
  );

  const [epubs, setEpubs] = useState<EpubFile[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState<string | null>(null);

  const scan = useCallback(async (folder: string): Promise<void> => {
    setScanning(true);
    setScanMsg(null);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const files = await invoke<EpubFile[]>('scan_library_folder', { path: folder });
      setEpubs(files);
      setScanMsg(`${files.length} livro(s) encontrado(s).`);
    } catch (err) {
      setScanMsg(`Erro ao analisar pasta: ${String(err)}`);
    } finally {
      setScanning(false);
    }
  }, []);

  // Start watcher whenever folder changes.
  useEffect(() => {
    if (!libraryFolder || !isTauri()) return;
    const t = setTimeout(() => { void scan(libraryFolder); }, 0);

    let unlisten: (() => void) | null = null;
    void (async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const { listen } = await import('@tauri-apps/api/event');
      await invoke('watch_library_folder', { path: libraryFolder });
      unlisten = await listen<EpubFile>('library-folder-changed', (ev) => {
        setEpubs((prev) => {
          if (prev.some((f) => f.path === ev.payload.path)) return prev;
          return [...prev, ev.payload];
        });
        setScanMsg(`Novo livro detectado: ${ev.payload.name}`);
      });
    })();

    return () => {
      clearTimeout(t);
      unlisten?.();
    };
  }, [libraryFolder, scan]);

  const pickFolder = useCallback(async (): Promise<void> => {
    const { invoke } = await import('@tauri-apps/api/core');
    const folder = await invoke<string | null>('pick_folder', {});
    if (folder) setLibraryFolder(folder);
  }, [setLibraryFolder]);

  if (!isTauri()) {
    return (
      <div className={cn(settingsStyles.card)}>
        <h2 className={cn(settingsStyles.cardTitle)}>Biblioteca local</h2>
        <p className={cn(settingsStyles.notice)}>
          A importação automática de uma pasta local está disponível apenas na app desktop (Tauri).
          Na versão web, importa livros manualmente através da Biblioteca.
        </p>
      </div>
    );
  }

  return (
    <div className={cn(settingsStyles.card)}>
      <h2 className={cn(settingsStyles.cardTitle)}>Biblioteca local</h2>
      <p className={cn(settingsStyles.notice)}>
        Aponta para uma pasta de EPUB no teu sistema. A app deteta novos ficheiros automaticamente.
      </p>

      <div className={cn(styles.row)}>
        <input
          type="text"
          className={cn(settingsStyles.input)}
          placeholder="/Users/ti/Books"
          value={libraryFolder ?? ''}
          onChange={(e) => setLibraryFolder(e.target.value || undefined)}
          spellCheck={false}
        />
        <button type="button" className={cn(styles.btn)} onClick={() => void pickFolder()}>
          Escolher pasta
        </button>
      </div>

      {libraryFolder && (
        <button
          type="button"
          className={cn(styles.btn, styles.btnScan)}
          onClick={() => void scan(libraryFolder)}
          disabled={scanning}
        >
          {scanning ? 'A analisar…' : 'Reanalisar'}
        </button>
      )}

      {scanMsg && <p className={cn(styles.msg)}>{scanMsg}</p>}

      {epubs.length > 0 && (
        <ul className={cn(styles.list)}>
          {epubs.map((f) => (
            <li key={f.path} className={cn(styles.item)}>
              {f.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
