import { usePrefs } from '@/lib/store/prefs';
import { THEMES, type Theme } from '@/lib/theme/tokens';

const THEME_LABEL: Record<Theme, string> = {
  light: 'Claro',
  sepia: 'Sépia',
  dark: 'Escuro',
  black: 'Preto',
};

const Settings = () => {
  const theme = usePrefs((s) => s.theme);
  const setTheme = usePrefs((s) => s.setTheme);

  return (
    <section>
      <h1>Definições</h1>
      <p>Tipografia, tema, sincronização e IA — fases 7 / 9 / 12.</p>

      <fieldset style={{ marginTop: '1.5rem', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
        <legend>Tema (provisório)</legend>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              aria-pressed={theme === t}
              style={{
                padding: '0.5rem 0.875rem',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                background: theme === t ? 'var(--accent)' : 'var(--surface)',
                color: theme === t ? 'var(--bg)' : 'var(--text)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
              }}
            >
              {THEME_LABEL[t]}
            </button>
          ))}
        </div>
      </fieldset>
    </section>
  );
};

export default Settings;
