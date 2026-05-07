import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ChatIcon,
  ChevronLeftIcon,
  NotesIcon,
  SearchIcon,
  SettingsIcon,
  TocIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import styles from './ReaderTopBar.module.css';

interface Props {
  title: string;
  author?: string;
  visible: boolean;
  /** Quantidade de highlights/notas — exibida como badge no botão. */
  notesCount?: number;
  onToggleToc?: () => void;
  onToggleSearch?: () => void;
  onToggleChat?: () => void;
  /** Apenas adiciona o botão de chat se a IA estiver disponível. */
  chatAvailable?: boolean;
  onToggleNotes?: () => void;
  onToggleSettings?: () => void;
}

export const ReaderTopBar: FC<Props> = ({
  title,
  author,
  visible,
  notesCount = 0,
  onToggleToc,
  onToggleSearch,
  onToggleChat,
  chatAvailable = false,
  onToggleNotes,
  onToggleSettings,
}) => {
  const navigate = useNavigate();

  return (
    <header className={cn(styles.bar, !visible && styles.barHidden)}>
      <button
        type="button"
        className={cn(styles.iconButton)}
        onClick={() => navigate('/library')}
        aria-label="Voltar à biblioteca"
      >
        <ChevronLeftIcon size={20} />
      </button>
      <div className={cn(styles.center)}>
        <span className={cn(styles.title)}>{title}</span>
        {author && <span className={cn(styles.subtitle)}>{author}</span>}
      </div>
      <div className={cn(styles.rightButtons)}>
        {onToggleToc && (
          <button
            type="button"
            className={cn(styles.iconButton)}
            onClick={onToggleToc}
            aria-label="Índice do livro"
            data-testid="open-toc-panel"
          >
            <TocIcon size={20} />
          </button>
        )}
        {onToggleSearch && (
          <button
            type="button"
            className={cn(styles.iconButton)}
            onClick={onToggleSearch}
            aria-label="Procurar no livro"
            data-testid="open-search-panel"
          >
            <SearchIcon size={20} />
          </button>
        )}
        {onToggleChat && chatAvailable && (
          <button
            type="button"
            className={cn(styles.iconButton)}
            onClick={onToggleChat}
            aria-label="Conversar com o livro"
            data-testid="open-chat-panel"
          >
            <ChatIcon size={20} />
          </button>
        )}
        {onToggleNotes && (
          <button
            type="button"
            className={cn(styles.iconButton, styles.notesButton)}
            onClick={onToggleNotes}
            aria-label={`Anotações${notesCount > 0 ? ` (${notesCount})` : ''}`}
            data-testid="open-notes-panel"
          >
            <NotesIcon size={20} />
            {notesCount > 0 && <span className={cn(styles.badge)}>{notesCount}</span>}
          </button>
        )}
        {onToggleSettings && (
          <button
            type="button"
            className={cn(styles.iconButton)}
            onClick={onToggleSettings}
            aria-label="Configurações de leitura"
            data-testid="open-settings-panel"
          >
            <SettingsIcon size={20} />
          </button>
        )}
      </div>
    </header>
  );
};
