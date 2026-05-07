import { type FC } from 'react';
import { Link } from 'react-router-dom';

import { CatEmpty } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import styles from './Review.module.css';

const Review: FC = () => (
  <section className={cn(styles.page)}>
    <h1 className={cn(styles.title)}>Revisão</h1>
    <div className={cn(styles.empty)}>
      <CatEmpty size={120} />
      <h2 className={cn(styles.emptyTitle)}>Nenhum flashcard ainda</h2>
      <p className={cn(styles.emptySub)}>
        Selecciona texto num livro, faz highlight e clica em &ldquo;Criar flashcard&rdquo;.
      </p>
      <Link to="/library" className={cn(styles.action)}>
        Ir para a biblioteca
      </Link>
    </div>
  </section>
);

export default Review;
