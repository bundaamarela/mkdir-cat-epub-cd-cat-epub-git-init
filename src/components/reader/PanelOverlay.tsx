import { type FC, type ReactNode } from 'react';

import { CloseIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import styles from './PanelOverlay.module.css';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export const PanelOverlay: FC<Props> = ({ title, onClose, children }) => (
  <aside className={cn(styles.panel)} aria-label={title}>
    <div className={cn(styles.header)}>
      <span className={cn(styles.title)}>{title}</span>
      <button
        type="button"
        className={cn(styles.closeButton)}
        onClick={onClose}
        aria-label="Fechar painel"
      >
        <CloseIcon size={16} />
      </button>
    </div>
    <div className={cn(styles.body)}>{children}</div>
  </aside>
);
