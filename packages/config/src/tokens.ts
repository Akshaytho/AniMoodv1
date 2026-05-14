/**
 * AniMood design tokens.
 *
 * The single source of truth for colors, spacing, radii, shadows, typography,
 * and breakpoints. Tailwind preset (./tailwind-preset.ts) consumes these,
 * so both `apps/web` and `apps/dashboard` style identically — change a token
 * once, both apps update.
 *
 * Values are derived from the AniMood design mockups (deep navy/violet UI
 * with glow accents on a near-black background).
 */

export const color = {
  // Surfaces
  bg: '#0a0a0b',          // page background, almost-black
  surface: '#141416',     // primary card / sidebar surface
  surface2: '#1a1a1f',    // raised surface (modal, hover)
  surface3: '#22222a',    // popover, deepest layer
  border: '#26262a',      // hairline borders
  borderStrong: '#3a3a44',

  // Text
  text: '#f3f3f5',
  textMuted: '#8e8e94',
  textFaint: '#5e5e66',

  // Brand accent (violet)
  accent: '#7c5cff',
  accentSoft: '#9b85ff',
  accentDeep: '#5b3eff',
  accentGlow: 'rgba(124, 92, 255, 0.35)',

  // Semantic
  success: '#3ddc84',
  successSoft: 'rgba(61, 220, 132, 0.15)',
  warning: '#ffb547',
  warningSoft: 'rgba(255, 181, 71, 0.15)',
  danger: '#ff5c5c',
  dangerSoft: 'rgba(255, 92, 92, 0.15)',

  // Emotion palette (sampled from the discovery-by-emotion page chips)
  // Used for emotion-tag chips, network-graph nodes, and category accents.
  emotion: {
    loneliness: '#5b8def',
    healing: '#3ddc84',
    revenge: '#ff5c5c',
    redemption: '#ffb547',
    ambition: '#f37dd6',
    grief: '#8a7dff',
    hope: '#5dd2ff',
    existential: '#9d6bff',
    peace: '#7adfb8',
    devastation: '#ff5c8a',
    identity: '#b78dff',
    moralAmbiguity: '#c9c9d4',
    burnout: '#e2806a',
    rebuilding: '#62c7ff',
    nostalgia: '#ffb993',
    freedom: '#7df0c4',
  },
} as const;

export const space = {
  px: '1px',
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const radius = {
  none: '0',
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '20px',
  '2xl': '28px',
  pill: '999px',
} as const;

export const shadow = {
  // Card lift
  card: '0 1px 0 rgba(255,255,255,0.02) inset, 0 8px 24px rgba(0,0,0,0.35)',
  // Accent glow (used behind hex radar, primary buttons)
  accentGlow: '0 0 40px rgba(124, 92, 255, 0.35), 0 0 80px rgba(124, 92, 255, 0.2)',
  popover: '0 16px 48px rgba(0,0,0,0.55)',
} as const;

export const font = {
  family: {
    sans: 'var(--font-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    display: 'var(--font-display), var(--font-sans), ui-sans-serif, system-ui, sans-serif',
    mono: 'var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  size: {
    xs: '11px',
    sm: '13px',
    base: '14px',
    md: '15px',
    lg: '17px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '38px',
    '5xl': '48px',
    '6xl': '60px',
  },
  lineHeight: {
    tight: '1.15',
    snug: '1.3',
    normal: '1.5',
    relaxed: '1.65',
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const breakpoint = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Layout dimensions — same on web and dashboard so the user's spatial memory
 * is preserved across the two surfaces.
 */
export const layout = {
  sidebarWidth: '224px',
  rightRailWidth: '300px',
  topbarHeight: '64px',
  maxContentWidth: '1440px',
} as const;
