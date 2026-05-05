import { type FC } from 'react';
import { NavLink } from 'react-router-dom';

import { CatLogo, ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { usePrefs } from '@/lib/store/prefs';
import { cn } from '@/lib/utils/cn';
import { NAV_ITEMS } from './nav-items';
import styles from './Sidebar.module.css';

interface Props {
  /** Quando o utilizador clica num item (útil para fechar overlays no mobile). */
  onNavigate?: () => void;
}

export const Sidebar: FC<Props> = ({ onNavigate }) => {
  const collapsed = usePrefs((s) => s.sidebarCollapsed);
  const setCollapsed = usePrefs((s) => s.setSidebarCollapsed);

  return (
    <aside
      className={cn(styles.root, collapsed && styles.collapsed)}
      aria-label="Navegação principal"
    >
      <NavLink to="/" className={cn(styles.brand)} onClick={onNavigate} end>
        <CatLogo size={28} />
        <span className={cn(styles.brandText)}>Cat Epub</span>
      </NavLink>

      <nav className={cn(styles.nav)}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) => cn(styles.item, isActive && styles.itemActive)}
            aria-label={label}
            title={collapsed ? label : ''}
          >
            <Icon size={20} />
            <span className={cn(styles.itemLabel)}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={cn(styles.footer)}>
        <button
          type="button"
          className={cn(styles.collapseButton)}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
        >
          {collapsed ? <ChevronRightIcon size={16} /> : <ChevronLeftIcon size={16} />}
          {!collapsed && <span>Recolher</span>}
        </button>
      </div>
    </aside>
  );
};
