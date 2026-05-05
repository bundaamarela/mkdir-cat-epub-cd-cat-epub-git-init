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

export const BookCard: FC<Props> = ({ book, onDelete }) => (
  <article className={cn(styles.gridItem)}>
    <Link to={`/reader/${book.id}`} className={cn(styles.gridLink)} aria-label={`Abrir ${book.title}`}>
      <BookCover book={book} width="100%" height={170} logoSize={32} />
      <div className={cn(styles.gridMeta)}>
        <h3 className={cn(styles.gridTitle)}>{book.title}</h3>
        <p className={cn(styles.gridAuthor)}>{book.author}</p>
        {book.progress > 0 && (
          <div className={cn(styles.gridProgress)}>
            <ProgressBar value={book.progress} label={`${book.progress}% lido`} />
          </div>
        )}
      </div>
    </Link>
    <button
      type="button"
      className={cn(styles.gridDelete)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(book);
      }}
      aria-label={`Eliminar ${book.title}`}
    >
      <TrashIcon size={14} />
    </button>
  </article>
);
