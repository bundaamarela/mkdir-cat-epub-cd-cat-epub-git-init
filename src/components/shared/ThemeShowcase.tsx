import { type FC } from 'react';

import { THEME_CLASS, THEMES, type Theme } from '@/lib/theme/tokens';
import { usePrefs } from '@/lib/store/prefs';
import styles from './ThemeShowcase.module.css';

const THEME_LABEL: Record<Theme, string> = {
  light: 'Claro',
  sepia: 'Sépia',
  dark: 'Escuro',
  black: 'Preto (OLED)',
};

const SAMPLE_TEXT =
  'O gato lê pacientemente. Cada página é um mundo, cada parágrafo um respirar.';

const HIGHLIGHTS = [
  'var(--highlight-yellow)',
  'var(--highlight-green)',
  'var(--highlight-blue)',
  'var(--highlight-pink)',
  'var(--highlight-purple)',
];

export const ThemeShowcase: FC = () => {
  const theme = usePrefs((s) => s.theme);
  const setTheme = usePrefs((s) => s.setTheme);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.logo}>Cat Epub</span>
        <span className={styles.subtitle}>
          Fase 1 — sistema de design e tema. Selecciona um tema para ver as variáveis CSS a mudar
          em tempo real.
        </span>
      </header>

      <div className={styles.themeBar}>
        <span className={styles.themeBarLabel}>Tema activo:</span>
        {THEMES.map((t) => {
          const isActive = theme === t;
          const cls = isActive
            ? `${styles.themeButton} ${styles.themeButtonActive}`
            : styles.themeButton;
          return (
            <button
              key={t}
              type="button"
              className={cls}
              aria-pressed={isActive}
              onClick={() => setTheme(t)}
            >
              {THEME_LABEL[t]}
            </button>
          );
        })}
      </div>

      <section className={styles.grid} aria-label="Pré-visualização dos temas">
        {THEMES.map((t) => {
          const themeClass = THEME_CLASS[t];
          return (
            <article
              key={t}
              className={`${styles.card} ${themeClass}`.trim()}
              aria-label={`Tema ${THEME_LABEL[t]}`}
            >
              <span className={styles.cardName}>Cat Epub</span>
              <span className={styles.cardMeta}>Tema {THEME_LABEL[t]}</span>

              <div className={styles.sample}>
                <span className={styles.sampleLabel}>Lora — serif</span>
                <span className={styles.sampleSerif}>{SAMPLE_TEXT}</span>
              </div>
              <div className={styles.sample}>
                <span className={styles.sampleLabel}>Inter — sans</span>
                <span className={styles.sampleSans}>{SAMPLE_TEXT}</span>
              </div>
              <div className={styles.sample}>
                <span className={styles.sampleLabel}>Atkinson — acessível</span>
                <span className={styles.sampleDyslexic}>{SAMPLE_TEXT}</span>
              </div>

              <div className={styles.swatches} aria-label="Cores de marcação">
                {HIGHLIGHTS.map((color) => (
                  <span key={color} className={styles.swatch} style={{ background: color }} />
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};
