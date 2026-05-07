import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { type FC } from 'react';
import { Link } from 'react-router-dom';

import { TrashIcon } from '@/components/icons';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { cn } from '@/lib/utils/cn';
import type { BookWithProgress } from '@/lib/store/library';
import { BookCover } from './BookCover';
import styles from './Library.module.css';

interface Props {
  book: BookWithProgress;
  onDelete: (book: BookWithProgress) => void;
}

const formatPages = (spineLength: number): string =>
  `${spineLength.toLocaleString('pt-PT')} cap.`;

const formatLastRead = (iso: string | undefined): string | null => {
  if (iso === undefined) return null;
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: pt });
  } catch {
    return null;
  }
};

export const BookListItem: FC<Props> = ({ book, onDelete }) => (
  <article className={cn(styles.listRow)}>
    <BookCover book={book} width={48} height={68} logoSize={14} />
    <div className={cn(styles.listBody)}>
      <h3 className={cn(styles.listTitle)}>{book.title}</h3>
      <p className={cn(styles.listAuthor)}>{book.author}</p>
      <div className={cn(styles.listMeta)}>
        {book.category !== undefined && book.category.length > 0 && (
          <span className={cn(styles.listChip)}>{book.category}</span>
        )}
        <span className={cn(styles.listInfo)}>{formatPages(book.spineLength)}</span>
        {formatLastRead(book.lastReadAt) !== null && (
          <span className={cn(styles.listInfo, styles.listLastRead)}>
            {formatLastRead(book.lastReadAt)}
          </span>
        )}
      </div>
    </div>
    <div className={cn(styles.listActions)}>
      <Link to={`/reader/${book.id}`} className={cn(styles.listOpen)}>
        Ler
      </Link>
      {book.progress > 0 && (
        <div className={cn(styles.listProgress)}>
          <ProgressBar value={book.progress} label={`${book.progress}% lido`} />
          <span className={cn(styles.listProgressLabel)}>{book.progress}%</span>
        </div>
      )}
    </div>
    <button
      type="button"
      className={cn(styles.listDelete)}
      onClick={() => onDelete(book)}
      aria-label={`Eliminar ${book.title}`}
    >
      <TrashIcon size={16} />
    </button>
  </article>
);
