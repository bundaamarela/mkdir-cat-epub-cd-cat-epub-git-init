import { type FC } from 'react';

import { BookIcon, ClockIcon, StarIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import type { BookWithProgress } from '@/lib/store/library';
import styles from './Home.module.css';

interface Props {
  books: ReadonlyArray<BookWithProgress>;
}

export const StatsBlock: FC<Props> = ({ books }) => {
  const total = books.length;
  const completed = books.filter((b) => b.finishedAt !== undefined).length;
  const inProgress = books.filter((b) => b.progress > 0 && b.progress < 100).length;

  const items: Array<{ label: string; value: string; Icon: typeof BookIcon }> = [
    { label: 'Livros', value: total.toLocaleString('pt-PT'), Icon: BookIcon },
    { label: 'Concluídos', value: completed.toLocaleString('pt-PT'), Icon: StarIcon },
    { label: 'Em progresso', value: inProgress.toLocaleString('pt-PT'), Icon: ClockIcon },
  ];

  return (
    <div className={cn(styles.stats)}>
      {items.map(({ label, value, Icon }) => (
        <div key={label} className={cn(styles.statCard)}>
          <div className={cn(styles.statHeader)}>
            <Icon size={15} />
            <span className={cn(styles.statLabel)}>{label}</span>
          </div>
          <div className={cn(styles.statValue)}>{value}</div>
        </div>
      ))}
    </div>
  );
};
