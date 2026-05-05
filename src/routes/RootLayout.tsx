import { type FC } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { MobileNav } from '@/components/nav/MobileNav';
import { MobileTopBar } from '@/components/nav/MobileTopBar';
import { Sidebar } from '@/components/nav/Sidebar';
import { cn } from '@/lib/utils/cn';
import { useBreakpoint } from '@/lib/utils/useBreakpoint';
import { isReaderRoute } from './route-utils';
import styles from './RootLayout.module.css';

export const RootLayout: FC = () => {
  const { pathname } = useLocation();
  const { isMobile } = useBreakpoint();

  // No leitor não há chrome: nem Sidebar, nem MobileNav, nem MobileTopBar
  // são montados (não basta esconder com display:none — os efeitos correriam).
  if (isReaderRoute(pathname)) {
    return (
      <div className={cn(styles.readerShell)}>
        <Outlet />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={cn(styles.mobileShell)}>
        <MobileTopBar />
        <main className={cn(styles.mobileMain)}>
          <Outlet />
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className={cn(styles.shell)}>
      <Sidebar />
      <main className={cn(styles.main)}>
        <Outlet />
      </main>
    </div>
  );
};
