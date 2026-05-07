import { type CSSProperties, type FC, type ReactNode } from 'react';
import { useShallow } from 'zustand/shallow';

import { cn } from '@/lib/utils/cn';
import { FONT_FAMILIES, FONT_VAR, type FontFamily } from '@/lib/theme/tokens';
import { usePrefs } from '@/lib/store/prefs';
import type { PaginationMode, ThemeChoice } from '@/types/prefs';
import styles from './Settings.module.css';

const PREVIEW_TEXT =
  'O leitor contempla a página como quem admira um horizonte de possibilidades infinitas.';

const FONT_LABELS: Record<FontFamily, string> = {
  serif: 'Serif',
  sans: 'Sans',
  dyslexic: 'Acessível',
};

const THEME_OPTIONS: Array<{ id: ThemeChoice; label: string }> = [
  { id: 'light', label: 'Claro' },
  { id: 'sepia', label: 'Sépia' },
  { id: 'dark', label: 'Escuro' },
  { id: 'black', label: 'Preto' },
  { id: 'auto', label: 'Auto' },
];

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}

const SliderRow: FC<SliderRowProps> = ({ label, value, min, max, step, display, onChange }) => (
  <div className={cn(styles.row)}>
    <div className={cn(styles.rowLabel)}>
      <span>{label}</span>
      <span className={cn(styles.value)}>{display}</span>
    </div>
    <input
      type="range"
      className={cn(styles.slider)}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
    />
  </div>
);

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: ReactNode;
}

const ToggleRow: FC<ToggleRowProps> = ({ label, checked, onChange, children }) => (
  <div>
    <label className={cn(styles.toggleRow)}>
      <span className={cn(styles.toggleLabel)}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={cn(styles.toggle, checked && styles.toggleOn)}
        onClick={() => onChange(!checked)}
      >
        <span className={cn(styles.toggleThumb)} />
      </button>
    </label>
    {children}
  </div>
);

const Settings: FC = () => {
  const p = usePrefs(
    useShallow((s) => ({
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      lineHeight: s.lineHeight,
      pageWidth: s.pageWidth,
      letterSpacing: s.letterSpacing,
      paginationMode: s.paginationMode,
      theme: s.theme,
      focusModeEnabled: s.focusModeEnabled,
      focusCheckinInterval: s.focusCheckinInterval,
      setFontFamily: s.setFontFamily,
      setFontSize: s.setFontSize,
      setLineHeight: s.setLineHeight,
      setPageWidth: s.setPageWidth,
      setPaginationMode: s.setPaginationMode,
      setTheme: s.setTheme,
      setFocusModeEnabled: s.setFocusModeEnabled,
      setFocusCheckinInterval: s.setFocusCheckinInterval,
    })),
  );

  const previewStyle: CSSProperties = {
    fontFamily: FONT_VAR[p.fontFamily],
    fontSize: `${p.fontSize}px`,
    lineHeight: p.lineHeight,
    letterSpacing: `${p.letterSpacing}em`,
    maxWidth: `min(${p.pageWidth}px, 100%)`,
  };

  return (
    <section className={cn(styles.page)}>
      <h1 className={cn(styles.title)}>Definições</h1>

      <div className={cn(styles.card)}>
        <h2 className={cn(styles.cardTitle)}>Leitura</h2>

        <div className={cn(styles.preview)} style={previewStyle} aria-label="Pré-visualização">
          {PREVIEW_TEXT}
        </div>

        <div className={cn(styles.field)}>
          <span className={cn(styles.fieldLabel)}>Tema</span>
          <div className={cn(styles.themeGrid)}>
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={cn(styles.themeChip, p.theme === t.id && styles.themeChipActive)}
                onClick={() => p.setTheme(t.id)}
                aria-pressed={p.theme === t.id}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className={cn(styles.field)}>
          <span className={cn(styles.fieldLabel)}>Tipografia</span>
          <div className={cn(styles.segmented)}>
            {FONT_FAMILIES.map((f) => (
              <button
                key={f}
                type="button"
                className={cn(styles.segChip, p.fontFamily === f && styles.segChipActive)}
                onClick={() => p.setFontFamily(f)}
                aria-pressed={p.fontFamily === f}
              >
                {FONT_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div className={cn(styles.field)}>
          <span className={cn(styles.fieldLabel)}>Modo de paginação</span>
          <div className={cn(styles.segmented)}>
            {(['paginated', 'scroll'] as PaginationMode[]).map((m) => (
              <button
                key={m}
                type="button"
                className={cn(styles.segChip, p.paginationMode === m && styles.segChipActive)}
                onClick={() => p.setPaginationMode(m)}
                aria-pressed={p.paginationMode === m}
              >
                {m === 'paginated' ? 'Paginado' : 'Scroll'}
              </button>
            ))}
          </div>
        </div>

        <SliderRow
          label="Tamanho do texto"
          value={p.fontSize}
          min={14}
          max={28}
          step={1}
          display={`${p.fontSize}px`}
          onChange={p.setFontSize}
        />
        <SliderRow
          label="Entrelinhamento"
          value={p.lineHeight}
          min={1.4}
          max={2.2}
          step={0.05}
          display={p.lineHeight.toFixed(2)}
          onChange={p.setLineHeight}
        />
        <SliderRow
          label="Largura da página"
          value={p.pageWidth}
          min={480}
          max={900}
          step={10}
          display={`${p.pageWidth}px`}
          onChange={p.setPageWidth}
        />
      </div>

      <div className={cn(styles.card)}>
        <h2 className={cn(styles.cardTitle)}>Foco</h2>
        <ToggleRow
          label="Modo foco"
          checked={p.focusModeEnabled}
          onChange={p.setFocusModeEnabled}
        >
          {p.focusModeEnabled && (
            <div className={cn(styles.subRow)}>
              <SliderRow
                label="Check-in de atenção"
                value={p.focusCheckinInterval}
                min={0}
                max={30}
                step={5}
                display={
                  p.focusCheckinInterval === 0 ? 'Desligado' : `${p.focusCheckinInterval} min`
                }
                onChange={(v) => p.setFocusCheckinInterval(Math.round(v))}
              />
            </div>
          )}
        </ToggleRow>
      </div>
    </section>
  );
};

export default Settings;
