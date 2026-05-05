import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { ChevronLeftIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import styles from './ReaderTopBar.module.css';

interface Props {
  title: string;
  author?: string;
  visible: boolean;
}

export const ReaderTopBar: FC<Props> = ({ title, author, visible }) => {
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
      <span style={{ width: 36 }} />
    </header>
  );
};
