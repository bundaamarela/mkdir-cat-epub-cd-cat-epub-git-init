# Prompt Mestre para Claude Code — Construção do Cat Epub

> **Como usar este documento:** copia-o integralmente para o ficheiro `CLAUDE.md` na raiz do teu novo repositório, ou anexa-o à primeira mensagem em Claude Code com o prefixo "Lê este documento na íntegra antes de qualquer acção e segue as fases pela ordem em que estão definidas. Não passes para a fase seguinte sem confirmação explícita do utilizador."

> **Idioma operacional:** Todas as strings de UI, comentários relevantes ao utilizador final e mensagens de erro visíveis devem estar em português europeu. Comentários técnicos internos podem ser em inglês.

---

## 0. Contexto Estratégico (LER PRIMEIRO)

### 0.1 Quem é o utilizador
Solo founder a operar entre Moçambique, Angola e Portugal. Construtor de múltiplas plataformas (BizBlueprint, Baooba, Scaraab). Familiarizado com Next.js, Supabase, Stripe, Cursor e ambientes de desenvolvimento agentic. Esta aplicação é primariamente para **uso pessoal próprio** — não há roadmap comercial imediato, mas a arquitectura deve permitir extensão futura sem reescrita.

### 0.2 O que é o Cat Epub
Aplicação de leitura de ficheiros EPUB com identidade visual estabelecida ("Cat Epub" — gato como mascote), três temas tipográficos (claro, sépia, escuro) e foco extremo em minimalismo durante a leitura. Existe um protótipo HTML+React-CDN funcional como referência visual e arquitectónica que **não deve ser ignorado nem reescrito a partir do zero**: o teu trabalho é converter esse protótipo num produto real, preservando a identidade.

### 0.3 Princípios não-negociáveis
1. **Minimalismo durante a leitura.** Quando um livro está aberto, zero chrome por defeito. Toda a UI esconde-se.
2. **Personalização profunda.** Tipografia, espaçamento, margens, tema, comportamento de páginação — tudo configurável.
3. **Offline-first.** A aplicação tem de funcionar sem rede. Sync é opcional e secundária.
4. **Cross-platform com codebase única.** Desktop (macOS, Windows, Linux) via Tauri 2. Mobile via PWA instalável (iOS Safari + Android Chrome).
5. **Performance.** Abrir um EPUB de 5 MB tem de levar menos de 1 segundo no desktop. Mudar de página tem de ser instantâneo.
6. **Privacidade.** Dados de leitura (highlights, notas, posição) ficam no dispositivo por defeito. Sync é opt-in.

### 0.4 O que NÃO construir (e porquê)
- ❌ Loja integrada de livros — não é o negócio.
- ❌ DRM proprietário — fricção desnecessária.
- ❌ Streaks, badges, gamificação social — psicologia predatória que distorce o propósito.
- ❌ Recomendações algorítmicas — o utilizador escolhe o que lê.
- ❌ Mais de 6 fontes ou 4 temas — paralisia de escolha mata atenção.
- ❌ Onboarding extenso — a app deve ser auto-evidente em 30 segundos.
- ❌ Bionic Reading como funcionalidade principal — dados empíricos recentes mostram que prejudica leitores típicos. Implementa apenas como toggle opcional na fase final.

---

## 1. Stack Técnico (decisões já tomadas — não questionar sem motivo forte)

### 1.1 Núcleo
| Camada | Tecnologia | Justificação |
|---|---|---|
| Linguagem | TypeScript 5.4+ (strict) | Refactor seguro, autocomplete, contratos explícitos |
| Framework UI | React 18 | Já no protótipo; ecossistema maduro |
| Build tool | Vite 5 | Mais rápido que Webpack, ideal para Tauri |
| Desktop runtime | Tauri 2 (Rust + WebView) | Bundle <10 MB vs ~150 MB do Electron |
| Mobile | PWA (Vite + vite-plugin-pwa) | Instalável em iOS/Android sem stores |
| Roteamento | React Router 6 (modo `data router`) | Padrão de facto |
| Estado global | Zustand | Sem boilerplate, persistência via middleware |
| Estado servidor | TanStack Query 5 | Cache, retry, sync apenas quando necessário |
| Base de dados local | Dexie.js sobre IndexedDB | Funciona em browser e Tauri webview |
| EPUB parsing/render | foliate-js | Motor open-source do Foliate; usado pela Readest; suporte EPUB 3, ficção fixed-layout, bidi |
| Estilização | CSS Modules + CSS Variables | Já usadas no protótipo; sem runtime de Tailwind |
| Ícones | Inline SVG (existentes em `icons.jsx`) | Já estão definidos; converter para `.tsx` |
| Tipografia | Pixelify Sans (display) + Lora (corpo serif) + Inter (corpo sans) + Atkinson Hyperlegible (acessibilidade) | 4 fontes, suficiente |
| Sync (opcional, fase 11) | Supabase | Stack já familiar ao utilizador |
| Spaced repetition | ts-fsrs | Implementação open-source do algoritmo FSRS-4.5 (estado-da-arte) |
| TTS | Web Speech API (default) + ElevenLabs (opcional) | Fallback nativo + premium opcional |
| AI / RAG | API Anthropic (Claude) + transformers.js para embeddings locais | Privacidade: embeddings sem sair do dispositivo; chat envia apenas o relevante |

### 1.2 Versões mínimas
- Node.js: 20 LTS
- pnpm: 9+ (não usar npm nem yarn — pnpm é mais rápido e correcto com workspaces)
- Rust: 1.77+ (apenas para Tauri, instalado uma vez)

### 1.3 NÃO usar
- Tailwind CSS (mantém CSS variables — já estão estabelecidas no protótipo)
- Redux / MobX (Zustand é suficiente)
- styled-components / emotion (CSS-in-JS pesa em runtime)
- Material UI / Chakra / Ant Design (impõem identidade visual; temos a nossa)

---

## 2. Estrutura de Directórios

```
cat-epub/
├── CLAUDE.md                          # Este documento
├── README.md                          # Documentação pública
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── .gitignore
├── .editorconfig
├── .prettierrc
├── .eslintrc.cjs
├── index.html
├── src/
│   ├── main.tsx                       # Entry point
│   ├── App.tsx                        # Root component
│   ├── routes/                        # React Router routes
│   │   ├── index.tsx                  # Layout root
│   │   ├── home.tsx
│   │   ├── library.tsx
│   │   ├── reader.tsx
│   │   ├── search.tsx
│   │   ├── notes.tsx
│   │   ├── review.tsx                 # Spaced repetition daily review
│   │   └── settings.tsx
│   ├── components/
│   │   ├── shared/                    # Botões, sliders, toggles, modais
│   │   │   ├── Button.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Segmented.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   ├── reader/
│   │   │   ├── ReaderSurface.tsx      # Onde o EPUB é renderizado
│   │   │   ├── ReaderTopBar.tsx
│   │   │   ├── ReaderBottomBar.tsx
│   │   │   ├── HighlightToolbar.tsx   # Aparece ao seleccionar texto
│   │   │   ├── PanelTOC.tsx
│   │   │   ├── PanelBookmarks.tsx
│   │   │   ├── PanelNotes.tsx
│   │   │   ├── PanelChat.tsx          # Chat with book
│   │   │   └── PanelSettings.tsx
│   │   ├── library/
│   │   │   ├── BookCover.tsx
│   │   │   ├── BookCard.tsx
│   │   │   ├── BookGrid.tsx
│   │   │   ├── BookList.tsx
│   │   │   ├── ImportDropzone.tsx
│   │   │   └── FilterBar.tsx
│   │   ├── home/
│   │   │   ├── Greeting.tsx
│   │   │   ├── StatsBlock.tsx
│   │   │   ├── ContinueReading.tsx
│   │   │   └── RecentlyRead.tsx
│   │   ├── nav/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── MobileTopBar.tsx
│   │   └── icons/
│   │       └── index.tsx              # Re-export tipado de todos os SVG
│   ├── lib/
│   │   ├── epub/
│   │   │   ├── parser.ts              # Wrapper sobre foliate-js
│   │   │   ├── renderer.ts            # Render lifecycle
│   │   │   ├── pagination.ts          # Cálculo de páginas/CFI
│   │   │   └── search.ts              # Busca dentro do livro
│   │   ├── db/
│   │   │   ├── schema.ts              # Definição Dexie
│   │   │   ├── books.ts               # Repositório books
│   │   │   ├── highlights.ts          # Repositório highlights
│   │   │   ├── notes.ts
│   │   │   ├── flashcards.ts
│   │   │   └── sessions.ts            # Sessões de leitura
│   │   ├── store/
│   │   │   ├── prefs.ts               # Zustand store de preferências
│   │   │   ├── reader.ts              # Estado do leitor activo
│   │   │   ├── library.ts
│   │   │   └── ui.ts                  # Estado de UI (sidebar, modal aberto…)
│   │   ├── srs/
│   │   │   ├── scheduler.ts           # Wrapper sobre ts-fsrs
│   │   │   └── card-generator.ts      # Highlight → flashcard
│   │   ├── ai/
│   │   │   ├── client.ts              # Cliente Anthropic
│   │   │   ├── rag.ts                 # Embeddings + retrieval
│   │   │   ├── embeddings.ts          # transformers.js wrapper
│   │   │   └── prompts.ts             # System prompts
│   │   ├── tts/
│   │   │   ├── webspeech.ts
│   │   │   └── elevenlabs.ts
│   │   ├── sync/
│   │   │   ├── supabase.ts
│   │   │   └── conflict.ts
│   │   ├── theme/
│   │   │   ├── tokens.ts              # Definições de tema
│   │   │   └── apply.ts
│   │   └── utils/
│   │       ├── date.ts
│   │       ├── debounce.ts
│   │       ├── markdown.ts
│   │       └── id.ts
│   ├── types/
│   │   ├── book.ts
│   │   ├── highlight.ts
│   │   ├── note.ts
│   │   ├── prefs.ts
│   │   └── flashcard.ts
│   ├── styles/
│   │   ├── globals.css                # Reset + variables base
│   │   ├── themes.css                 # Light/sepia/dark/black-OLED
│   │   └── reader.css                 # Estilos específicos do conteúdo EPUB
│   └── assets/
│       ├── fonts/                     # Pixelify Sans, Lora, Inter, Atkinson
│       └── icons/                     # Favicon, logo
├── src-tauri/                         # Tauri backend (Rust)
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── icons/
│   └── src/
│       └── main.rs
├── public/
│   └── manifest.webmanifest
└── tests/
    ├── unit/
    │   ├── srs.test.ts
    │   ├── pagination.test.ts
    │   └── db.test.ts
    └── e2e/
        ├── reader.spec.ts
        └── library.spec.ts
```

---

## 3. Sistema de Design (preservar do protótipo)

### 3.1 Tokens de cor (CSS Variables)

Manter exactamente como definido no protótipo HTML, com adições. Em `src/styles/themes.css`:

```css
:root {
  /* Light (default) */
  --bg: #ffffff;
  --surface: #f7f7f7;
  --surface-2: #efefef;
  --border: #e8e8e8;
  --border-strong: #d0d0d0;
  --text: #111111;
  --text-2: #555555;
  --text-3: #999999;
  --accent: #111111;             /* monocromático por design */
  --highlight-yellow: #fff3a8;
  --highlight-green:  #c8e6b8;
  --highlight-blue:   #b8d8f0;
  --highlight-pink:   #f0c8d8;
  --highlight-purple: #d8c8f0;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.12);
  --radius-sm: 8px;
  --radius: 12px;
  --radius-lg: 16px;
  --sidebar-w: 240px;
  --sidebar-w-collapsed: 60px;
}

.theme-sepia {
  --bg: #f4efe6;
  --surface: #ede8df;
  --surface-2: #e3ddd1;
  --border: #d8d0c0;
  --border-strong: #c8c0b0;
  --text: #2c2418;
  --text-2: #6b5c48;
  --text-3: #9c8c78;
  --accent: #2c2418;
}

.theme-dark {
  --bg: #1c1c1e;                 /* NÃO #000 puro — minimiza halação */
  --surface: #232325;
  --surface-2: #2a2a2c;
  --border: #2f2f31;
  --border-strong: #3a3a3c;
  --text: #e8ddc8;               /* off-white quente */
  --text-2: #999999;
  --text-3: #6a6a6a;
  --accent: #e8ddc8;
}

.theme-black {                   /* OLED extremo, opt-in */
  --bg: #000000;
  --surface: #0a0a0a;
  --surface-2: #121212;
  --border: #1a1a1a;
  --border-strong: #2a2a2a;
  --text: #e5c07b;               /* âmbar para preservar adaptação à escuridão */
  --text-2: #a08850;
  --text-3: #5a4830;
  --accent: #e5c07b;
}
```

### 3.2 Tipografia

```css
:root {
  --font-display: 'Pixelify Sans', system-ui, sans-serif;
  --font-serif: 'Lora', Georgia, 'Times New Roman', serif;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  --font-dyslexic: 'Atkinson Hyperlegible', 'OpenDyslexic', sans-serif;
  --font-mono: ui-monospace, 'SF Mono', Menlo, monospace;
}
```

Carregar localmente via `@font-face` em `src/assets/fonts/` — **não via Google Fonts CDN** (privacidade + offline).

### 3.3 Escala tipográfica do leitor (defaults baseados em investigação)

| Variável | Mobile default | Desktop default | Min | Max |
|---|---|---|---|---|
| `fontSize` | 18 px | 19 px | 14 px | 28 px |
| `lineHeight` | 1.6 | 1.65 | 1.4 | 2.2 |
| `pageWidth` (medida) | 92% viewport | 680 px | 480 px | 900 px |
| `paragraphSpacing` | 0.9em | 1em | 0.5em | 2em |
| `letterSpacing` | 0 | 0 | -0.02em | 0.05em |

### 3.4 Componente `CatLogo`
Já existe no protótipo. Converter para `.tsx` em `src/components/icons/CatLogo.tsx`. Manter as três variantes: `CatLogo`, `CatEmpty`, `CatReading`.

---

## 4. Modelo de Dados (Dexie / IndexedDB)

### 4.1 Schema (`src/lib/db/schema.ts`)

```ts
import Dexie, { type Table } from 'dexie';

export interface Book {
  id: string;                       // ulid
  title: string;
  author: string;
  language?: string;
  publisher?: string;
  publishedAt?: string;
  isbn?: string;
  fileBlob: Blob;                   // EPUB original
  fileSize: number;
  fileHash: string;                 // sha-256 para detectar duplicados
  coverBlob?: Blob;                 // capa extraída
  coverHue: number;                 // fallback se sem capa
  totalCfi?: string;                // CFI da última página
  spineLength: number;              // num. de capítulos
  category?: string;                // utilizador-definida
  tags: string[];
  rating?: number;                  // 0–5
  description?: string;
  addedAt: string;                  // ISO
  lastReadAt?: string;
  finishedAt?: string;
  estimatedMinutes?: number;        // tempo estimado de leitura total
}

export interface ReadingPosition {
  bookId: string;                   // PK
  cfi: string;                      // EPUB CFI
  chapterIndex: number;
  percentage: number;               // 0–100
  updatedAt: string;
}

export interface Highlight {
  id: string;
  bookId: string;
  cfiRange: string;                 // CFI start-end
  text: string;                     // texto seleccionado
  context?: string;                 // ~50 chars antes e depois
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  semanticTag?: 'fact' | 'argue' | 'concept' | 'question' | 'quote';
  note?: string;                    // markdown
  tags: string[];                   // hierárquicas: "estratégia/jogos"
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  bookId: string;
  cfi?: string;                     // pode estar associada a posição
  highlightId?: string;             // ou a highlight
  title?: string;
  body: string;                     // markdown
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  bookId: string;
  cfi: string;
  label?: string;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  bookId: string;
  highlightId?: string;
  front: string;
  back: string;
  // Estado FSRS
  due: string;                      // ISO
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  last_review?: string;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  startCfi: string;
  endCfi?: string;
  startedAt: string;
  endedAt?: string;
  pagesRead: number;
  wordsRead?: number;
  fixationCount?: number;           // métricas avançadas (fase 12)
}

export interface Preferences {
  id: 'singleton';                  // sempre 'singleton'
  theme: 'light' | 'sepia' | 'dark' | 'black' | 'auto';
  themeAutoSchedule: { lightStart: string; darkStart: string };
  fontFamily: 'serif' | 'sans' | 'dyslexic';
  fontSize: number;
  lineHeight: number;
  pageWidth: number;
  paragraphSpacing: number;
  letterSpacing: number;
  paginationMode: 'paginated' | 'scroll';
  showProgress: boolean;
  sidebarCollapsed: boolean;
  bionicReading: boolean;           // default false
  focusModeEnabled: boolean;
  focusCheckinInterval: number;     // minutos; 0 = desligado
  ttsProvider: 'webspeech' | 'elevenlabs';
  ttsRate: number;                  // 0.5–2.0
  syncEnabled: boolean;
  aiProvider: 'anthropic' | 'none';
  aiApiKey?: string;                // armazenada localmente
}

export class CatEpubDB extends Dexie {
  books!: Table<Book, string>;
  positions!: Table<ReadingPosition, string>;
  highlights!: Table<Highlight, string>;
  notes!: Table<Note, string>;
  bookmarks!: Table<Bookmark, string>;
  flashcards!: Table<Flashcard, string>;
  sessions!: Table<ReadingSession, string>;
  prefs!: Table<Preferences, 'singleton'>;

  constructor() {
    super('CatEpub');
    this.version(1).stores({
      books: 'id, title, author, addedAt, lastReadAt, fileHash',
      positions: 'bookId, updatedAt',
      highlights: 'id, bookId, color, createdAt, *tags',
      notes: 'id, bookId, highlightId, createdAt, *tags',
      bookmarks: 'id, bookId, createdAt',
      flashcards: 'id, bookId, due, state, highlightId',
      sessions: 'id, bookId, startedAt',
      prefs: 'id',
    });
  }
}

export const db = new CatEpubDB();
```

---

## 5. Fases de Implementação (sequenciais — não saltar)

### Convenção de gates entre fases
No final de cada fase, executa o seguinte e pára à espera de aprovação:

```bash
pnpm typecheck && pnpm lint && pnpm test --run && pnpm build
```

Reporta ao utilizador:
1. O que foi feito (resumo de 5 linhas máximo)
2. Comandos para verificar manualmente (`pnpm dev`)
3. Critérios de aceitação cumpridos da lista da fase
4. Pergunta explícita: "Posso prosseguir para a Fase X?"

**Não inicies a fase seguinte sem resposta afirmativa.**

---

### FASE 0 — Bootstrap do projecto
**Objectivo:** repositório funcional, dependências instaladas, dev server a correr, Tauri arranca.

**Acções:**
1. `pnpm create vite cat-epub --template react-ts`
2. `cd cat-epub && pnpm install`
3. `pnpm add -D @tauri-apps/cli` e `pnpm tauri init` com bundle identifier `com.kouran.catepub`
4. `pnpm add react-router-dom zustand dexie @tanstack/react-query foliate-js ts-fsrs ulid date-fns marked dompurify`
5. `pnpm add -D vitest @testing-library/react @testing-library/jest-dom @vitest/ui playwright eslint prettier eslint-config-prettier eslint-plugin-react-hooks @typescript-eslint/parser @typescript-eslint/eslint-plugin vite-plugin-pwa`
6. Configurar `tsconfig.json` com `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`.
7. Configurar ESLint + Prettier (regras: sem default exports excepto routes, sem `any` excepto em `@ts-expect-error` justificado).
8. Criar `.editorconfig` (LF, 2 espaços, UTF-8).
9. Criar estrutura de directórios da Secção 2 (apenas pastas + `index.ts` placeholders).
10. `git init`, primeiro commit: `chore: bootstrap cat-epub`.

**Critérios de aceitação:**
- [ ] `pnpm dev` abre Vite em `http://localhost:5173` com página em branco
- [ ] `pnpm tauri dev` abre janela desktop
- [ ] `pnpm typecheck` passa sem erros
- [ ] `pnpm lint` passa sem erros
- [ ] Estrutura de directórios da Secção 2 existe

**NÃO fazer nesta fase:** começar a portar componentes do protótipo. Apenas bootstrap.

---

### FASE 1 — Sistema de design e tema
**Objectivo:** todos os tokens CSS aplicados, troca de tema funcional, fontes carregadas localmente.

**Acções:**
1. Descarregar fontes Pixelify Sans (Google Fonts), Lora, Inter, Atkinson Hyperlegible para `src/assets/fonts/` (formatos .woff2).
2. Escrever `src/styles/globals.css` com reset + `@font-face` + variáveis base.
3. Escrever `src/styles/themes.css` com as 4 classes de tema da Secção 3.1.
4. Escrever `src/lib/theme/tokens.ts` exportando os nomes das variáveis tipados.
5. Escrever `src/lib/theme/apply.ts` com função `applyTheme(theme: Theme): void` que adiciona/remove classes ao `<html>`.
6. Implementar Zustand store em `src/lib/store/prefs.ts` com persist middleware (Dexie via custom storage adapter).
7. Implementar componente de teste `<ThemeShowcase />` em `src/components/shared/ThemeShowcase.tsx` que exibe 4 quadrados (um por tema) com texto de amostra em cada tipografia.
8. Render essa showcase em `App.tsx` temporariamente.

**Critérios de aceitação:**
- [ ] As 4 fontes carregam sem flash (FOUT mínimo via `font-display: swap`)
- [ ] Trocar tema via botões altera todas as cores em <50 ms
- [ ] Pixelify Sans mostra-se no logo "Cat Epub"
- [ ] `pnpm test` passa um teste unitário sobre `applyTheme()`

---

### FASE 2 — Layout e navegação
**Objectivo:** estrutura de rotas, sidebar desktop, bottom nav mobile, breakpoints funcionais.

**Acções:**
1. Configurar React Router 6 com layout root `src/routes/index.tsx`.
2. Portar `Sidebar.tsx` do protótipo (linhas 128–209 do `Cat Epub Reader.html`) para `src/components/nav/Sidebar.tsx` em TS.
3. Portar `MobileNav.tsx` (linhas 868–893) para `src/components/nav/MobileNav.tsx`.
4. Implementar hook `useBreakpoint()` em `src/lib/utils/useBreakpoint.ts` com breakpoint mobile a 768 px.
5. Implementar `MobileTopBar.tsx`.
6. Criar páginas vazias para cada rota (Home, Library, Search, Notes, Review, Settings) com apenas um `<h1>`.
7. Implementar lógica: se rota === `/reader/:id`, esconder sidebar e bottom nav.

**Critérios de aceitação:**
- [ ] No desktop (>=768 px): sidebar visível, navegável, colapsável
- [ ] No mobile: bottom nav com 4 itens, hamburger abre overlay com sidebar
- [ ] Navegar entre rotas mantém o tema
- [ ] No reader, ambos sidebar e bottom nav desaparecem

---

### FASE 3 — Camada de base de dados
**Objectivo:** Dexie operacional, repositórios CRUD com testes.

**Acções:**
1. Implementar `src/lib/db/schema.ts` exactamente como na Secção 4.1.
2. Implementar repositórios em `src/lib/db/{books,highlights,notes,bookmarks,flashcards,sessions}.ts` com funções: `getAll`, `getById`, `add`, `update`, `delete`, `query`. Cada repositório exporta apenas funções puras async — sem classes.
3. Escrever testes unitários para cada repositório em `tests/unit/db.test.ts` usando `fake-indexeddb`.
4. Criar seed inicial em `src/lib/db/seed.ts` que popula 3 livros de exemplo (apenas em modo `import.meta.env.DEV`).
5. Criar hook `useBooks()` em `src/lib/store/library.ts` que usa TanStack Query para fetch reativo.

**Critérios de aceitação:**
- [ ] Todos os testes de DB passam (>=15 testes)
- [ ] DevTools do browser mostram database `CatEpub` em IndexedDB
- [ ] Em modo dev, 3 livros aparecem ao iniciar pela primeira vez
- [ ] Reload da página preserva estado

---

### FASE 4 — Importação e renderização de EPUB (CORE)
**Objectivo:** importar `.epub` por drag-and-drop, parsear metadata, extrair capa, renderizar conteúdo.

**Acções:**
1. Estudar a API de `foliate-js`. Cria `src/lib/epub/parser.ts` que expõe:
   - `parseEpub(file: File): Promise<{ metadata, spine, manifest, coverBlob }>`
   - `openEpubBook(blob: Blob): Promise<EpubInstance>`
2. Implementar `src/components/library/ImportDropzone.tsx`:
   - Aceita drop de ficheiros `.epub`
   - Aceita selecção via input
   - Mostra progresso (parsing, extracção de capa, gravação)
   - Detecta duplicados via `fileHash` (SHA-256)
   - Erro graceful para ficheiros inválidos
3. Implementar `src/lib/epub/renderer.ts` que monta um `<iframe>` controlado dentro de `<ReaderSurface />`:
   - Aplica CSS dinâmico baseado em prefs (font, size, line-height, theme)
   - Expõe API: `goToCfi(cfi)`, `nextPage()`, `prevPage()`, `getCurrentCfi()`, `onLocationChange(cb)`, `onSelectionChange(cb)`
4. Implementar `src/components/reader/ReaderSurface.tsx` que monta o renderer.
5. Implementar página `src/routes/reader.tsx`:
   - Carrega o livro pelo `:id` da URL
   - Restaura posição (`ReadingPosition`) ou começa do início
   - Persiste posição em cada mudança de location (debounced 1s)

**Critérios de aceitação:**
- [ ] Importar um EPUB de teste (e.g., um livro do Project Gutenberg) cria entrada na DB
- [ ] Capa é extraída e mostrada na biblioteca
- [ ] Abrir o livro renderiza o conteúdo do primeiro capítulo
- [ ] Mudar de página com setas, gestos (mobile swipe), e cliques laterais funciona
- [ ] Fechar e reabrir restaura a posição exacta
- [ ] Mudar tipografia em `Settings` reflecte no leitor sem reload

**Recursos:**
- foliate-js docs: https://github.com/johnfactotum/foliate-js
- Estuda como Readest implementa: https://github.com/readest/readest

---

### FASE 5 — Ecrãs Home e Biblioteca
**Objectivo:** portar Home e Library do protótipo para arquitectura real, ligados à DB.

**Acções:**
1. Portar `HomeScreen` (linhas 211–310) para `src/routes/home.tsx`:
   - "Continuar a ler" puxa livros com `progress > 0 && progress < 100`
   - "Lidos recentemente" puxa por `lastReadAt desc`
   - Estatísticas calculadas a partir da DB (não hardcoded)
   - Saudação dependente da hora local: "Bom dia/tarde/noite, leitor"
2. Portar `LibraryScreen` (linhas 312–500ish) para `src/routes/library.tsx`:
   - Grid + List view toggle (preservar preferência)
   - Filtros por categoria (extraídos dinamicamente das tags)
   - Ordenação: por título, autor, progresso, último acesso, data de adição
   - Drag-and-drop de EPUB para importar
   - Click numa capa abre `/reader/:id`
   - Botão "..." abre menu: editar metadados, mover para categoria, eliminar (com confirmação dupla)
3. Implementar `src/components/library/BookCover.tsx`:
   - Se `coverBlob` existe, mostra-a
   - Caso contrário, gera capa procedural com `coverHue` (como no protótipo)

**Critérios de aceitação:**
- [ ] Home mostra dados reais da DB
- [ ] Library renderiza grid responsivo (4 cols desktop, 3 tablet, 2 mobile)
- [ ] Importar 5 livros via drag-and-drop funciona
- [ ] Filtros e ordenação funcionam sem reload
- [ ] Eliminar um livro pede confirmação e remove da DB

---

### FASE 6 — Sistema de anotações (highlights e notas)
**Objectivo:** anotação como cidadã de primeira classe — 5 cores semânticas, notas em markdown, exportação.

**Acções:**
1. Implementar `src/components/reader/HighlightToolbar.tsx`:
   - Aparece flutuante quando há texto seleccionado (event `selectionchange` no iframe)
   - 5 botões circulares de cor (yellow, green, blue, pink, purple)
   - Botão de "Adicionar nota" (abre modal com textarea markdown)
   - Botão de "Copiar"
   - Botão de "Definir" (placeholder, fase 9)
   - Botão de "Traduzir" (placeholder, fase 9)
2. Persistir highlight: `cfiRange`, `text`, `context` (50 chars antes/depois), `color`, `bookId`.
3. Renderizar highlights ao reabrir o livro: aplicar overlay coloridos por CFI no iframe (foliate-js suporta isto via `addAnnotation`).
4. Implementar `src/components/reader/PanelNotes.tsx`:
   - Lista todos os highlights/notas do livro corrente
   - Filtros por cor, por tag
   - Edição inline da nota (markdown com preview)
   - Click salta para CFI no leitor
5. Implementar página `src/routes/notes.tsx`:
   - Vista global de todas as notas, agrupadas por livro
   - Busca textual full-text
   - Exportação: botão "Exportar tudo" → gera ficheiro `.md` por livro com formato:
     ```markdown
     # {Título}
     *{Autor}*
     
     > {texto do highlight}
     
     **Nota:** {nota}
     **Tags:** {tags}
     **Data:** {createdAt}
     ```
6. Configuração de tags:
   - Input com autocomplete baseado em tags existentes
   - Suporte a hierarquia via `/`: `estratégia/jogos/poker`

**Critérios de aceitação:**
- [ ] Seleccionar texto faz aparecer o toolbar em <100 ms
- [ ] Aplicar uma cor cria highlight visível e persistente
- [ ] Reabrir o livro mostra os highlights anteriores
- [ ] Adicionar nota markdown funciona com preview
- [ ] Exportar gera `.md` válido com todas as notas
- [ ] Tags hierárquicas funcionam: filtrar por `estratégia` mostra também `estratégia/jogos`

---

### FASE 7 — Modos de leitura e personalização avançada
**Objectivo:** controlo fino sobre tipografia, modos de paginação, modo foco.

**Acções:**
1. Implementar `src/components/reader/PanelSettings.tsx` (overlay no leitor):
   - Sliders: fonte (px), entrelinhamento, largura de página, espaçamento de parágrafo
   - Segmented control: tipografia (Serif / Sans / Acessível) e modo de paginação (Paginado / Scroll)
   - Toggle: progresso visível, números de página, justificação do texto
   - Aplicação imediata (live preview)
2. Implementar **modo foco**:
   - Toggle em `PanelSettings`
   - Quando activo: esconde tudo excepto texto. Apenas gestos disponíveis.
   - Check-ins de atenção: a cada N minutos (configurável, default 0 = off), pausa o leitor e mostra dialog: "O que reteve nos últimos {N} minutos?" — campo de texto livre que cria automaticamente uma nota.
3. Implementar **transição automática de tema**:
   - Pref `themeAutoSchedule` permite configurar hora de transição light→dark
   - Hook `useAutoTheme()` que monitoriza hora local e aplica tema gradualmente (transição CSS de 15 minutos)
4. Implementar **modo Bionic Reading** (toggle opcional, default off):
   - Função utilitária que processa o HTML do iframe e adiciona `<b>` aos primeiros 30–50% das letras de cada palavra
   - Aviso na UI: "Funcionalidade experimental. Investigação recente sugere que pode prejudicar leitores típicos."

**Critérios de aceitação:**
- [ ] Slider de fonte ajusta texto em tempo real, sem reload
- [ ] Modo scroll vs paginado funciona
- [ ] Modo foco esconde 100% do chrome
- [ ] Check-in dispara à hora certa e cria nota
- [ ] Transição automática funciona ao chegar à hora configurada
- [ ] Bionic toggle funciona

---

### FASE 8 — Pesquisa e índice
**Objectivo:** TOC navegável, busca dentro do livro, busca global.

**Acções:**
1. Implementar `src/components/reader/PanelTOC.tsx`:
   - Extrai TOC via foliate-js (`book.toc`)
   - Hierárquica (capítulos e subcapítulos)
   - Click salta para o capítulo
   - Indicador de capítulo actual
2. Implementar busca dentro do livro em `src/lib/epub/search.ts`:
   - Procura full-text em todos os capítulos
   - Retorna excertos com 30 chars antes e depois
   - Click salta para a posição
3. Implementar `src/routes/search.tsx`:
   - Busca em todos os livros, notas e highlights
   - Resultados agrupados por origem
   - Atalho global `Ctrl/Cmd+K`

**Critérios de aceitação:**
- [ ] TOC mostra estrutura completa de um EPUB com 30+ capítulos
- [ ] Busca dentro do livro encontra todas as ocorrências de uma palavra
- [ ] Busca global retorna resultados de livros, highlights e notas
- [ ] `Cmd+K` abre busca de qualquer ecrã

---

### FASE 9 — Camada de IA
**Objectivo:** definição contextual, tradução, chat com o livro (RAG local).

**Acções:**
1. Configurar `src/lib/ai/client.ts`:
   - Cliente Anthropic API (modelo `claude-opus-4-7` ou `claude-sonnet-4-6`)
   - API key armazenada apenas localmente em `Preferences.aiApiKey`
   - Toggle em settings para activar/desactivar IA
2. Definição contextual (em `HighlightToolbar`):
   - Botão "Definir" envia: palavra seleccionada + parágrafo de contexto
   - Prompt: "Define {palavra} considerando o contexto: {parágrafo}. Responde em português europeu, 2 frases."
   - Resposta exibida em popover
3. Tradução in-place:
   - Botão "Traduzir" envia o texto seleccionado
   - Prompt: "Traduz para português europeu preservando o tom literário: {texto}"
   - Toggle de idiomas se necessário
4. Chat com o livro (RAG):
   - Implementar `src/lib/ai/embeddings.ts` usando `@xenova/transformers` (modelo `all-MiniLM-L6-v2`, runs in-browser, ~25 MB)
   - Ao importar um livro, gerar embeddings de cada capítulo (background job, com progress bar)
   - Persistir embeddings em IndexedDB
   - Implementar `src/lib/ai/rag.ts`:
     - Recebe pergunta do utilizador
     - Gera embedding da pergunta
     - Calcula cosine similarity contra todos os chunks do livro
     - Retorna top-K (K=5) chunks mais relevantes
   - Implementar `src/components/reader/PanelChat.tsx`:
     - Painel lateral direito
     - Conversa com o livro: utilizador pergunta, IA responde citando passagens com âncoras navegáveis (`[Cap. 3, pág. 47]`)
     - System prompt: "És um assistente que responde APENAS com base nas passagens fornecidas. Se a resposta não está nas passagens, diz que não encontraste. Cita sempre o capítulo."

**Critérios de aceitação:**
- [ ] Definir uma palavra retorna definição em <2s
- [ ] Traduzir um parágrafo funciona
- [ ] Importar um livro gera embeddings (com indicador de progresso)
- [ ] Pergunta no chat retorna resposta citando passagens
- [ ] Click numa citação salta para o CFI correcto
- [ ] Sem API key configurada, todas as funcionalidades de IA estão desactivadas com mensagem clara

**Aviso de privacidade:** Documentar em `Settings > IA` que as queries de chat são enviadas para a Anthropic. Os embeddings são locais.

---

### FASE 10 — Sistema de repetição espaçada (FSRS)
**Objectivo:** transformar highlights em flashcards com agendamento óptimo.

**Acções:**
1. Implementar `src/lib/srs/scheduler.ts` como wrapper sobre `ts-fsrs`:
   - `schedule(card, rating: 'again' | 'hard' | 'good' | 'easy'): UpdatedCard`
   - `getDueToday(): Promise<Flashcard[]>`
   - Default parameters do FSRS-4.5
2. Implementar `src/lib/srs/card-generator.ts`:
   - Recebe um highlight
   - Se highlight tem `note`: usa note como `back`, primeira frase do `text` como `front`
   - Caso contrário: opcional usar IA para gerar pergunta-resposta automaticamente (botão "Gerar com IA")
3. Implementar `src/routes/review.tsx`:
   - Mostra um card de cada vez
   - Apresenta `front`, click revela `back`
   - 4 botões: Again / Hard / Good / Easy
   - Após decisão, agenda próximo review e mostra próximo card
   - Quando não há cards: mostra "Nada para hoje. Próxima revisão: {data}."
4. Notificação visual no sidebar/bottom nav: badge com número de cards due.
5. Deep-linking: cada card tem botão "Ver no livro" que salta para o CFI do highlight original.

**Critérios de aceitação:**
- [ ] Criar flashcard a partir de highlight funciona com 1 click
- [ ] Algoritmo FSRS agenda correctamente (testar com mock dates)
- [ ] Daily review mostra cards due
- [ ] Deep-link salta para a passagem correcta
- [ ] Badge mostra contagem real

---

### FASE 11 — Métricas e Text-to-Speech
**Objectivo:** métricas operacionais (não vaidade) e TTS funcional.

**Acções:**
1. Implementar tracking de sessões em `src/lib/db/sessions.ts`:
   - Cada sessão de leitura: start, end, pagesRead, wordsRead (estimado)
   - Pausada após 60s de inactividade
2. Implementar `src/components/home/StatsBlock.tsx` com métricas reais:
   - Tempo médio por sessão (últimos 7 dias)
   - Páginas lidas por dia (gráfico simples)
   - Velocidade média (wpm)
   - Livro mais lido nesta semana
3. Em `Library`, adicionar coluna "Tempo desde último contacto" (combate ao decay).
4. Implementar TTS:
   - `src/lib/tts/webspeech.ts` usando `SpeechSynthesisUtterance`
   - Voz seleccionável (pt-PT por default se disponível)
   - Velocidade configurável (0.5x–2x)
   - Sincronização com leitor: highlight da frase a ser lida
   - Botão de play no `ReaderTopBar`
5. (Opcional) `src/lib/tts/elevenlabs.ts`:
   - Cliente para ElevenLabs API
   - Apenas se utilizador configurar API key
   - Cache de áudio por capítulo em IndexedDB

**Critérios de aceitação:**
- [ ] Sessões são registadas correctamente (testar com mock setTimeout)
- [ ] Stats mostram dados reais
- [ ] Web Speech TTS lê o capítulo actual
- [ ] Frase actual fica destacada
- [ ] Pause/resume funciona

---

### FASE 12 — Sincronização (opt-in)
**Objectivo:** sync entre dispositivos via Supabase, com conflict resolution last-write-wins.

**Acções:**
1. Setup Supabase project (utilizador faz manualmente; documentar no README).
2. Schema SQL para tabelas: `books_meta`, `highlights`, `notes`, `bookmarks`, `flashcards`, `positions`, `prefs`.
3. RLS policies: cada utilizador só vê os seus dados (auth.uid() = user_id).
4. **NÃO sincronizar `fileBlob`** dos livros — apenas metadata. Os ficheiros EPUB ficam no dispositivo.
5. Implementar `src/lib/sync/supabase.ts`:
   - `signIn(email)` via magic link
   - `pushChanges()`: envia mudanças locais desde último sync
   - `pullChanges()`: descarrega mudanças remotas
   - `resolveConflicts()`: last-write-wins por `updatedAt`
6. Implementar trigger de sync:
   - On app start (se logged in)
   - Após cada mudança (debounce 30s)
   - Manual via botão em Settings
7. Indicador visual no sidebar: "Sincronizado há X minutos" / "A sincronizar..." / "Erro".

**Critérios de aceitação:**
- [ ] Login via magic link funciona
- [ ] Highlights criados num dispositivo aparecem noutro em <1 minuto
- [ ] Mudar pref num dispositivo propaga
- [ ] Modo offline mantém funcionalidade total
- [ ] Reconectar após offline sincroniza tudo

**Aviso:** Esta fase é opt-in. Por defeito, `syncEnabled: false`.

---

### FASE 13 — Polish e build de produção
**Objectivo:** testes e2e, build optimizado, distribuíveis Tauri.

**Acções:**
1. Escrever testes Playwright para fluxos críticos:
   - Importar livro → abrir → ler → fazer highlight → fechar → reabrir (verifica persistência)
   - Trocar tema → verificar todas as variáveis CSS
   - Daily review com 3 cards
2. Otimização de bundle: lazy loading de rotas (`React.lazy`), code splitting.
3. Configurar PWA: manifest, service worker, offline shell.
4. Configurar build Tauri para macOS (universal binary), Windows (.msi), Linux (.AppImage e .deb).
5. README completo com:
   - Screenshots
   - Instalação (desktop e PWA)
   - Configuração de IA / Sync
   - Atalhos de teclado
6. Atalhos de teclado globais:
   - `Cmd/Ctrl+K`: busca global
   - `Cmd/Ctrl+,`: settings
   - `Cmd/Ctrl+B`: toggle sidebar
   - No reader: `←/→`: páginas; `Espaço`: toggle UI; `H`: highlight amarelo; `B`: bookmark; `N`: nova nota; `F`: focus mode
7. Logging mínimo: errors graves → console + Sentry (opcional).

**Critérios de aceitação:**
- [ ] Todos os testes e2e passam
- [ ] Bundle inicial <300 KB gzipped
- [ ] Lighthouse score >=95 em Performance/Accessibility/Best Practices
- [ ] PWA instala no iOS Safari e Android Chrome
- [ ] Build Tauri produz `.dmg`, `.msi` e `.AppImage` funcionais
- [ ] Todos os atalhos de teclado documentados em Settings

---

## 6. Convenções de código

### 6.1 Naming
- Componentes: PascalCase (`ReaderSurface.tsx`)
- Hooks: camelCase com prefixo `use` (`useBreakpoint.ts`)
- Funções utilitárias: camelCase (`debounce.ts`)
- Tipos/Interfaces: PascalCase, sem prefixo `I`
- Constantes: SCREAMING_SNAKE_CASE
- CSS classes: kebab-case com BEM ligeiro (`.reader__bottom-bar--hidden`)

### 6.2 Estrutura de componente
```tsx
import { type FC, useState } from 'react';
import styles from './Component.module.css';

interface Props {
  // ordem: required → optional → callbacks
  bookId: string;
  variant?: 'compact' | 'expanded';
  onSelect?: (id: string) => void;
}

export const Component: FC<Props> = ({ bookId, variant = 'compact', onSelect }) => {
  const [open, setOpen] = useState(false);
  // hooks first, handlers next, render last
  return <div className={styles.root}>...</div>;
};
```

### 6.3 Commits (Conventional Commits)
- `feat:` nova funcionalidade
- `fix:` bug
- `refactor:` refactor sem mudança de comportamento
- `style:` apenas CSS
- `test:` apenas testes
- `docs:` documentação
- `chore:` tooling

### 6.4 Git workflow
- `main`: sempre estável
- Cada fase em branch `phase/N-nome` (ex.: `phase/4-epub-reader`)
- Merge via squash commit no fim da fase
- Tag `v0.{fase}.0` no fim de cada fase

---

## 7. Checklist final de qualidade (executar antes de cada PR)

```bash
pnpm typecheck                # Sem erros
pnpm lint                     # Sem warnings
pnpm test --run               # Todos passam
pnpm test:e2e                 # Críticos passam
pnpm build                    # Build sucede
pnpm tauri build --debug      # Build Tauri sucede
```

---

## 8. Recursos de referência

- **Protótipo original:** ler integralmente `Cat Epub Reader.html`, `store.jsx`, `icons.jsx`, `tweaks-panel.jsx`. Tudo o que está visualmente lá deve ser preservado em essência.
- **foliate-js:** https://github.com/johnfactotum/foliate-js
- **Readest (referência arquitectónica):** https://github.com/readest/readest
- **ts-fsrs:** https://github.com/open-spaced-repetition/ts-fsrs
- **Tauri 2:** https://v2.tauri.app
- **Dexie.js:** https://dexie.org
- **transformers.js:** https://huggingface.co/docs/transformers.js
- **EPUB CFI spec:** https://idpf.org/epub/linking/cfi/

---

## 9. Política de comportamento durante o desenvolvimento

1. **Lê antes de escrever.** Antes de modificar um ficheiro existente, lê-o na íntegra.
2. **Pequenos commits.** Um commit = uma ideia atómica.
3. **Testa o que não é trivial.** SRS, parsing, sync, conflict resolution → todos com testes.
4. **Não introduzas dependências sem aprovação.** Se uma fase precisa de uma lib que não está na Secção 1.1, pergunta primeiro.
5. **Não optimizes prematuramente.** Funcione primeiro. Optimizar na Fase 13.
6. **Não silences erros.** `try/catch` apenas para erros esperados; errors verdadeiros propagam.
7. **Pergunta quando ambíguo.** Melhor uma pergunta do que uma decisão errada.
8. **Não toques nas fases futuras.** Se a Fase 4 está em curso, não escrevas código da Fase 9 "porque é fácil".

---

## 10. Comando inicial

Quando estiveres pronto, executa o seguinte para começar:

> "Li o `CLAUDE.md` na íntegra. Vou começar pela Fase 0. Antes de iniciar, confirmas que o nome do projecto é `cat-epub` e o bundle identifier é `com.kouran.catepub`?"

Aguarda confirmação. Depois executa a Fase 0 e pára no gate.

---

**Fim do prompt mestre.**

> Versão 1.0 — Maio de 2026
> Para Kouran, solo founder
