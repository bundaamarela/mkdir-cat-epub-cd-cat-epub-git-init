import { useParams } from 'react-router-dom';

const Reader = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <section>
      <h1>Leitor</h1>
      <p>Livro: {id ?? '—'}</p>
      <p>Renderização do EPUB — Fase 4.</p>
    </section>
  );
};

export default Reader;
