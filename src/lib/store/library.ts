import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as books from '@/lib/db/books';
import type { Book } from '@/types/book';

export const BOOK_QUERY_KEYS = {
  all: ['books'] as const,
  list: (params?: books.BookQuery): readonly unknown[] =>
    [...BOOK_QUERY_KEYS.all, 'list', params ?? {}] as const,
  byId: (id: string): readonly unknown[] => [...BOOK_QUERY_KEYS.all, 'byId', id] as const,
};

/** Lista reactiva de livros (com filtros/ordenação). */
export const useBooks = (params?: books.BookQuery) =>
  useQuery({
    queryKey: BOOK_QUERY_KEYS.list(params),
    queryFn: () => books.query(params),
  });

export const useBook = (id: string | undefined) =>
  useQuery({
    queryKey: id ? BOOK_QUERY_KEYS.byId(id) : ['books', 'byId', 'noop'],
    queryFn: () => (id ? books.getById(id) : Promise.resolve(undefined)),
    enabled: id !== undefined,
  });

export const useAddBook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (book: Book) => books.add(book),
    onSuccess: () => qc.invalidateQueries({ queryKey: BOOK_QUERY_KEYS.all }),
  });
};

export const useUpdateBook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Book> }) => books.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: BOOK_QUERY_KEYS.all }),
  });
};

export const useRemoveBook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => books.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: BOOK_QUERY_KEYS.all }),
  });
};
