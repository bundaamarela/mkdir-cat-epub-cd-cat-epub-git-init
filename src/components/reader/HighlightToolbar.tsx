import { type FC, useMemo } from 'react';

import { TrashIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import type { HighlightColor } from '@/types/highlight';
import styles from './HighlightToolbar.module.css';

export interface HighlightSelection {
  text: string;
  cfiRange: string;
  /** Range vivo dentro do iframe — usado para posicionar a toolbar. */
  range: Range;
  doc: Document;
}

interface Props {
  /** Selecção activa do iframe (texto seleccionado pelo utilizador). */
  selection: HighlightSelection | null;
  /** Highlight existente sob a selecção (para edição/remoção). */
  existingHighlight?: { id: string; color: HighlightColor } | null;
  onApplyColor: (color: HighlightColor) => void;
  onRemove: () => void;
  onAddNote: () => void;
  onCopy: () => void;
}

const COLORS: ReadonlyArray<{ id: HighlightColor; cssVar: string; label: string }> = [
  { id: 'yellow', cssVar: 'var(--highlight-yellow)', label: 'Amarelo' },
  { id: 'green', cssVar: 'var(--highlight-green)', label: 'Verde' },
  { id: 'blue', cssVar: 'var(--highlight-blue)', label: 'Azul' },
  { id: 'pink', cssVar: 'var(--highlight-pink)', label: 'Rosa' },
  { id: 'purple', cssVar: 'var(--highlight-purple)', label: 'Roxo' },
];

interface ToolbarPosition {
  top: number;
  left: number;
}

const computePosition = (selection: HighlightSelection): ToolbarPosition | null => {
  const iframe = selection.doc.defaultView?.frameElement;
  if (!iframe) return null;
  const iframeRect = iframe.getBoundingClientRect();
  const rangeRect = selection.range.getBoundingClientRect();
  if (rangeRect.width === 0 && rangeRect.height === 0) return null;
  return {
    top: iframeRect.top + rangeRect.top,
    left: iframeRect.left + rangeRect.left + rangeRect.width / 2,
  };
};

export const HighlightToolbar: FC<Props> = ({
  selection,
  existingHighlight,
  onApplyColor,
  onRemove,
  onAddNote,
  onCopy,
}) => {
  const position = useMemo<ToolbarPosition | null>(
    () => (selection ? computePosition(selection) : null),
    [selection],
  );

  if (!selection || !position) return null;

  return (
    <div
      className={cn(styles.toolbar)}
      style={{ top: position.top, left: position.left }}
      role="toolbar"
      aria-label="Anotar selecção"
      data-testid="highlight-toolbar"
      onMouseDown={(e) => e.preventDefault()}
    >
      {COLORS.map((c) => {
        const active = existingHighlight?.color === c.id;
        return (
          <button
            key={c.id}
            type="button"
            className={cn(styles.colorButton)}
            style={{
              background: c.cssVar,
              borderColor: active ? 'var(--text)' : 'transparent',
            }}
            onClick={() => onApplyColor(c.id)}
            aria-label={`Destacar a ${c.label.toLowerCase()}`}
            data-testid={`color-${c.id}`}
          />
        );
      })}
      <span className={cn(styles.divider)} />
      <button type="button" className={cn(styles.actionButton)} onClick={onAddNote}>
        Nota
      </button>
      <button type="button" className={cn(styles.actionButton)} onClick={onCopy}>
        Copiar
      </button>
      {existingHighlight && (
        <button
          type="button"
          className={cn(styles.actionButton, styles.danger)}
          onClick={onRemove}
          aria-label="Remover highlight"
        >
          <TrashIcon size={14} />
        </button>
      )}
    </div>
  );
};
