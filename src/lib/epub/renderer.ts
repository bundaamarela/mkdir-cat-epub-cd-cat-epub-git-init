import type { FoliateBook, RelocateDetail, View } from 'foliate-js/view.js';

import type { FontFamily } from '@/lib/theme/tokens';

let registered = false;
/**
 * Garante que o custom element `<foliate-view>` está registado. O módulo
 * `view.js` regista-o como side-effect no `import` — chamamos uma vez por
 * ciclo de vida do bundle.
 */
const ensureRegistered = async (): Promise<void> => {
  if (registered) return;
  registered = true;
  // Side-effect import: regista `customElements.define('foliate-view', View)`.
  await import('foliate-js/view.js');
};

export interface RendererStyles {
  fontFamily: FontFamily;
  /** px */
  fontSize: number;
  lineHeight: number;
  /** px — coluna máxima */
  pageWidth: number;
  /** Multiplicador, aplicado como `${value}em` no `margin-block-end` dos parágrafos. */
  paragraphSpacing: number;
  /** em (positivo ou negativo). */
  letterSpacing: number;
  /** Cor de fundo derivada do tema activo (hex/rgb/var resolvida). */
  background: string;
  /** Cor de texto derivada do tema activo. */
  text: string;
}

export interface RendererOptions extends RendererStyles {
  paginationMode: 'paginated' | 'scroll';
}

export type RelocateListener = (info: RelocateDetail) => void;
export type SelectionListener = (info: {
  text: string;
  cfiRange: string | null;
  range: Range | null;
  doc: Document | null;
}) => void;

export interface EpubRenderer {
  /** Substitui completamente o conjunto de estilos aplicados ao iframe. */
  applyStyles(styles: RendererStyles): void;
  setPaginationMode(mode: 'paginated' | 'scroll'): void;
  goToCfi(cfi: string): Promise<void>;
  nextPage(): Promise<void>;
  prevPage(): Promise<void>;
  /** CFI da localização visível actual (ou `undefined` antes do primeiro relocate). */
  getCurrentCfi(): string | undefined;
  /** Subscreve mudanças de posição. Devolve unsubscribe. */
  onLocationChange(listener: RelocateListener): () => void;
  /** Subscreve mudanças de selecção dentro do iframe. Devolve unsubscribe. */
  onSelectionChange(listener: SelectionListener): () => void;
  /** Liberta recursos e remove o `<foliate-view>` do host. */
  destroy(): void;
}

const FONT_STACK: Record<FontFamily, string> = {
  serif: "'Lora', Georgia, 'Times New Roman', serif",
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  dyslexic: "'Atkinson Hyperlegible', 'OpenDyslexic', sans-serif",
};

/**
 * Gera o CSS a injectar no iframe do renderer. Usa `!important` para vencer
 * estilos inline do EPUB (foliate dá prioridade ao CSS do livro por defeito).
 */
const buildIframeCss = (s: RendererStyles): string => {
  const family = FONT_STACK[s.fontFamily];
  return `
@namespace epub "http://www.idpf.org/2007/ops";
html, body {
  background: ${s.background} !important;
  color: ${s.text} !important;
  font-family: ${family} !important;
  font-size: ${s.fontSize}px !important;
  line-height: ${s.lineHeight} !important;
  letter-spacing: ${s.letterSpacing}em !important;
}
p, li, blockquote {
  font-family: inherit !important;
  font-size: inherit !important;
  line-height: inherit !important;
}
p { margin-block-end: ${s.paragraphSpacing}em !important; }
a { color: ${s.text} !important; text-decoration: underline; text-underline-offset: 2px; }
img, svg, video { max-width: 100% !important; height: auto !important; }
::selection { background: rgba(255, 220, 0, 0.35); }
`;
};

interface MountOpts {
  host: HTMLElement;
  book: FoliateBook;
  options: RendererOptions;
  /** CFI inicial — se ausente, abre na primeira página. */
  startCfi?: string;
}

export const createRenderer = async ({
  host,
  book,
  options,
  startCfi,
}: MountOpts): Promise<EpubRenderer> => {
  await ensureRegistered();

  // Limpa o host antes de inserir.
  host.replaceChildren();
  const view = document.createElement('foliate-view') as View;
  view.style.width = '100%';
  view.style.height = '100%';
  view.style.display = 'block';
  host.appendChild(view);

  await view.open(book);

  const applyAttrs = (mode: 'paginated' | 'scroll', width: number): void => {
    if (!view.renderer) return;
    view.renderer.setAttribute('flow', mode);
    // O nosso chrome é externo: deixamos margin = 0 dentro do iframe.
    view.renderer.setAttribute('margin', '0px');
    view.renderer.setAttribute('gap', '6%');
    view.renderer.setAttribute('max-inline-size', `${width}px`);
    view.renderer.setAttribute('animated', '');
  };

  applyAttrs(options.paginationMode, options.pageWidth);

  // Inicializa posição. `init()` aplica `lastLocation` se for fornecido,
  // senão começa no início linear.
  if (startCfi !== undefined) {
    await view.init({ lastLocation: startCfi });
  } else {
    await view.init();
  }

  const applyStyles = (styles: RendererStyles): void => {
    const css = buildIframeCss(styles);
    type Styler = HTMLElement & { setStyles?: (css: string) => void };
    const renderer = view.renderer as Styler | undefined;
    renderer?.setStyles?.(css);
    applyAttrs(currentMode, styles.pageWidth);
  };

  let currentMode: 'paginated' | 'scroll' = options.paginationMode;
  applyStyles(options);

  let currentCfi: string | undefined;
  const locationListeners = new Set<RelocateListener>();
  const selectionListeners = new Set<SelectionListener>();

  const relocateHandler = (e: Event): void => {
    const detail = (e as CustomEvent<RelocateDetail>).detail;
    if (typeof detail?.cfi === 'string') currentCfi = detail.cfi;
    for (const fn of locationListeners) fn(detail);
  };
  view.addEventListener('relocate', relocateHandler);

  // Selecção dentro do iframe — escutamos `selectionchange` no documento do
  // capítulo activo. Foliate emite o evento `load` quando carrega uma section.
  const onLoad = (e: Event): void => {
    const detail = (e as CustomEvent<{ doc: Document; index: number }>).detail;
    const doc = detail?.doc;
    if (!doc) return;
    doc.addEventListener('selectionchange', () => {
      const sel = doc.getSelection();
      const text = sel?.toString() ?? '';
      const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
      let cfiRange: string | null = null;
      try {
        if (range && typeof view.getCFI === 'function' && typeof detail.index === 'number') {
          cfiRange = view.getCFI(detail.index, range);
        }
      } catch {
        cfiRange = null;
      }
      for (const fn of selectionListeners) fn({ text, cfiRange, range, doc });
    });
  };
  view.addEventListener('load', onLoad);

  const renderer: EpubRenderer = {
    applyStyles,
    setPaginationMode(mode) {
      currentMode = mode;
      applyAttrs(mode, options.pageWidth);
    },
    async goToCfi(cfi) {
      await view.goTo(cfi);
    },
    async nextPage() {
      await view.next();
    },
    async prevPage() {
      await view.prev();
    },
    getCurrentCfi() {
      return currentCfi;
    },
    onLocationChange(listener) {
      locationListeners.add(listener);
      return () => locationListeners.delete(listener);
    },
    onSelectionChange(listener) {
      selectionListeners.add(listener);
      return () => selectionListeners.delete(listener);
    },
    destroy() {
      view.removeEventListener('relocate', relocateHandler);
      view.removeEventListener('load', onLoad);
      locationListeners.clear();
      selectionListeners.clear();
      try {
        view.close();
      } catch {
        // best-effort
      }
      view.remove();
    },
  };

  return renderer;
};
