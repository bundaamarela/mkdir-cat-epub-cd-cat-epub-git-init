import { type FC, type SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const baseProps = (size = 20, rest: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
  ...rest,
});

export const HomeIcon: FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size, rest)}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

export const LibraryIcon: FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size, rest)}>
    <rect x="4" y="3" width="4" height="18" rx="0.5" />
    <rect x="10" y="3" width="4" height="18" rx="0.5" />
    <path d="m17 4 3 1-4 16-3-1z" />
  </svg>
);

export const SearchIcon: FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size, rest)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.3-4.3" />
  </svg>
);

export const NotesIcon: FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size, rest)}>
    <path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
    <path d="M16 4v3h3" />
    <path d="M8 12h8M8 16h6" />
  </svg>
);

export const ReviewIcon: FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size, rest)}>
    <path d="M3 12a9 9 0 0 1 15.5-6.3" />
    <path d="M21 4v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.5 6.3" />
    <path d="M3 20v-5h5" />
  </svg>
);

export const SettingsIcon: FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size, rest)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

export const MenuIcon: FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size, rest)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const CloseIcon: FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size, rest)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const ChevronLeftIcon: FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size, rest)}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);

export const ChevronRightIcon: FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size, rest)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

/* ============================================================
   Logos do Cat Epub — três variantes: padrão, vazio, a ler.
   Pixel-art deliberado para combinar com a Pixelify Sans.
   ============================================================ */
type LogoProps = SVGProps<SVGSVGElement> & { size?: number };

const logoBase = (size = 28, rest: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 32 32',
  fill: 'currentColor',
  shapeRendering: 'crispEdges',
  'aria-hidden': true,
  focusable: false,
  ...rest,
});

export const CatLogo: FC<LogoProps> = ({ size, ...rest }) => (
  <svg {...logoBase(size, rest)}>
    {/* orelhas */}
    <rect x="6" y="6" width="4" height="4" />
    <rect x="22" y="6" width="4" height="4" />
    <rect x="8" y="8" width="2" height="2" />
    <rect x="22" y="8" width="2" height="2" />
    {/* cabeça */}
    <rect x="6" y="10" width="20" height="14" />
    {/* olhos */}
    <rect x="10" y="14" width="3" height="3" fill="var(--bg)" />
    <rect x="19" y="14" width="3" height="3" fill="var(--bg)" />
    {/* nariz */}
    <rect x="15" y="18" width="2" height="2" fill="var(--bg)" />
    {/* boca */}
    <rect x="13" y="20" width="2" height="1" fill="var(--bg)" />
    <rect x="17" y="20" width="2" height="1" fill="var(--bg)" />
  </svg>
);

export const CatEmpty: FC<LogoProps> = ({ size, ...rest }) => (
  <svg {...logoBase(size, rest)}>
    <rect x="6" y="6" width="4" height="4" />
    <rect x="22" y="6" width="4" height="4" />
    <rect x="6" y="10" width="20" height="14" />
    <rect x="10" y="14" width="3" height="1" fill="var(--bg)" />
    <rect x="19" y="14" width="3" height="1" fill="var(--bg)" />
    <rect x="14" y="20" width="4" height="1" fill="var(--bg)" />
  </svg>
);

export const CatReading: FC<LogoProps> = ({ size, ...rest }) => (
  <svg {...logoBase(size, rest)}>
    <rect x="6" y="6" width="4" height="4" />
    <rect x="22" y="6" width="4" height="4" />
    <rect x="6" y="10" width="20" height="10" />
    {/* olhos baixos (a ler) */}
    <rect x="10" y="14" width="3" height="2" fill="var(--bg)" />
    <rect x="19" y="14" width="3" height="2" fill="var(--bg)" />
    {/* livro */}
    <rect x="6" y="20" width="20" height="6" />
    <rect x="15" y="20" width="2" height="6" fill="var(--bg)" />
  </svg>
);
