// Minimal stroked line icons (1.6px, currentColor) — replaces emojis for a
// cleaner, more professional look. Size via className (e.g. "h-5 w-5").

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
};

export const Coins = (p) => (
  <svg {...base} {...p}>
    <ellipse cx="9" cy="7" rx="6" ry="3" />
    <path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7" />
    <path d="M9 15v3c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.5-2-2.7-4.7-2.95" />
  </svg>
);

export const Swap = (p) => (
  <svg {...base} {...p}>
    <path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5" />
  </svg>
);

export const Gift = (p) => (
  <svg {...base} {...p}>
    <path d="M4 11h16v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    <path d="M3 7h18v4H3zM12 7v13M12 7S10.5 3 8 3 5 6 7 7M12 7s1.5-4 4-4 3 3 1 4" />
  </svg>
);

export const Target = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.5" />
  </svg>
);

export const Clock = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l2.5 2.5" />
  </svg>
);

export const Lock = (p) => (
  <svg {...base} {...p}>
    <rect x="4.5" y="10" width="15" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

export const Chart = (p) => (
  <svg {...base} {...p}>
    <path d="M4 4v16h16" />
    <path d="M8 14l3-3 3 2 4-5" />
  </svg>
);

export const Arrow = (p) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const Bolt = (p) => (
  <svg {...base} {...p}>
    <path d="M13 3 5 13h6l-1 8 8-10h-6z" />
  </svg>
);

export const Shield = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const Users = (p) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17 13.6A5.5 5.5 0 0 1 20.5 19" />
  </svg>
);

export const Pause = (p) => (
  <svg {...base} {...p}>
    <rect x="7" y="5" width="3.5" height="14" rx="1" />
    <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
  </svg>
);

export const Flame = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3c1 3-1 4.5-2.5 6.5C8 11.5 7 13 7 15a5 5 0 0 0 10 0c0-2.2-1.2-4.2-3-6 .3 1.6-.4 2.6-1.3 3C12 11 11 9 12 3z" />
  </svg>
);

// X (Twitter) — filled glyph, not a stroked line icon.
export const X = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const Key = (p) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="8" r="4" />
    <path d="M11 11l9 9M17 17l2-2M14 14l2-2" />
  </svg>
);
