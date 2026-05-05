import { Link } from 'react-router-dom';

import { ImportDropzone } from '@/components/library/ImportDropzone';
import { useBooks } from '@/lib/store/library';

const Library = () => {
  const { data: books, isLoading } = useBooks();

  return (
    <section>
      <h1>Biblioteca</h1>
      <p style={{ color: 'var(--text-3)', marginBottom: '1.5rem' }}>
        Arrasta um EPUB para importar. Clica num livro para abrir.
      </p>

      <ImportDropzone />

      {isLoading && <p style={{ color: 'var(--text-3)' }}>A carregar…</p>}

      {books && books.length === 0 && (
        <p style={{ color: 'var(--text-3)' }}>Nenhum livro ainda.</p>
      )}

      {books && books.length > 0 && (
        <ul style={{ marginTop: '1rem', padding: 0, listStyle: 'none' }}>
          {books.map((b) => (
            <li
              key={b.id}
              style={{
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--border)',
                fontFamily: 'var(--font-serif)',
              }}
            >
              <Link
                to={`/reader/${b.id}`}
                style={{ color: 'var(--text)', textDecoration: 'none' }}
              >
                <strong>{b.title}</strong>
                <span style={{ color: 'var(--text-2)' }}> — {b.author}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Library;
