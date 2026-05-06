import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { ChevronLeftIcon, NotesIcon, SettingsIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import styles from './ReaderTopBar.module.css';

interface Props {
  title: string;
  author?: string;
  visible: boolean;
  /** Quantidade de highlights/notas — exibida como badge no botão. */
  notesCount?: number;
  onToggleNotes?: () => void;
  onToggleSettings?: () => void;
}

export const ReaderTopBar: FC<Props> = ({
  title,
  author,
  visible,
  notesCount = 0,
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
