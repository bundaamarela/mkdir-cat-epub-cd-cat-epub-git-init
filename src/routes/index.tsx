import { createBrowserRouter } from 'react-router-dom';

import Home from './home';
import Library from './library';
import Notes from './notes';
import Reader from './reader';
import Review from './review';
import { RootLayout } from './RootLayout';
import Search from './search';
import Settings from './settings';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: 'library', Component: Library },
      { path: 'reader/:id', Component: Reader },
      { path: 'search', Component: Search },
      { path: 'notes', Component: Notes },
      { path: 'review', Component: Review },
      { path: 'settings', Component: Settings },
    ],
  },
]);
