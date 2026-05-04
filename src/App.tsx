import { useEffect } from 'react';

import { ThemeShowcase } from '@/components/shared/ThemeShowcase';
import { applyTheme, resolveTheme } from '@/lib/theme/apply';
import { usePrefs } from '@/lib/store/prefs';

export const App = () => {
  const theme = usePrefs((s) => s.theme);

  useEffect(() => {
    applyTheme(resolveTheme(theme));
  }, [theme]);

  return <ThemeShowcase />;
};
