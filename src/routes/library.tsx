import { useBooks } from '@/lib/store/library';

const Library = () => {
  const { data: books, isLoading } = useBooks();

  return (
    <section>
      <h1>Biblioteca</h1>
      <p>Grelha de livros, importação e filtros — Fase 4 / 5.</p>

      {isLoading && <p style={{ color: 'var(--text-3)' }}>A carregar…</p>}

      {books && (
        <ul style={{ marginTop: '1rem', padding: 0, listStyle: 'none' }}>
          {books.length === 0 && (
            <li style={{ color: 'var(--text-3)' }}>Nenhum livro ainda.</li>
          )}
          {books.map((b) => (
            <li
              key={b.id}
              style={{
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--border)',
                fontFamily: 'var(--font-serif)',
              }}
            >
              <strong>{b.title}</strong>
              <span style={{ color: 'var(--text-2)' }}> — {b.author}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Library;
