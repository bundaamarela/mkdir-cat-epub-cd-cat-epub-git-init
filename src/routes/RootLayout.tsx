import { type FC, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { MobileNav } from '@/components/nav/MobileNav';
import { MobileTopBar } from '@/components/nav/MobileTopBar';
import { Sidebar } from '@/components/nav/Sidebar';
import { useSyncTrigger } from '@/lib/sync/useSyncTrigger';
import { cn } from '@/lib/utils/cn';
import { useBreakpoint } from '@/lib/utils/useBreakpoint';
import { isReaderRoute } from './route-utils';
import styles from './RootLayout.module.css';

export const RootLayout: FC = () => {
  const { pathname } = useLocation();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  // Mount sync trigger globally — no-op when sync is disabled.
  useSyncTrigger();

  // Global Cmd/Ctrl+K → open search from any screen, including inside the reader.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (!((e.metaKey || e.ctrlKey) && e.key === 'k')) return;
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      }
      e.preventDefault();
      void navigate('/search');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

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
