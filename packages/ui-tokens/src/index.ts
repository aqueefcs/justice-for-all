/**
 * Design tokens — "Justice For All · Glass" (from the Claude Design project, tuned for accessibility).
 *
 * Direction: dark glass surfaces, soft rounded shapes and one glowing accent.
 * Citizen app glows cyan → violet; the lawyer app (Phase 2) glows lime → mint so the two are
 * distinguishable at a glance.
 *
 * Accessibility adjustments vs. the mockup (all-ages / low-literacy / low-end Android):
 *  - text colours re-checked for WCAG AA on the dark ground (textMuted ≈ 8.9:1, textSubtle ≈ 5.6:1)
 *  - minimum label size 14 (mockup used 10–12), body 16, everything scales with system font size
 *  - gradient text replaced by a solid accent (legibility); no backdrop blur (performance)
 */

export const palette = {
  ink950: '#05060A',
  ink900: '#090A10',
  ink850: '#0E1018',
  ink800: '#141724',
  ink700: '#1B1F2E',
  white: '#FFFFFF',
  cyan300: '#67E8F9',
  cyan200: '#7DEBFA',
  violet400: '#A78BFA',
  lime300: '#D9F99D',
  lime400: '#C6F57A',
  mint300: '#6EE7B7',
  amber300: '#FCD34D',
  rose300: '#FDA4AF',
} as const;

/** Semantic colours for the citizen app (default theme). */
export const colors = {
  // Ground & surfaces
  bg: palette.ink900,
  bgElevated: palette.ink850,
  surface: 'rgba(255,255,255,0.055)', // "glass"
  surfaceStrong: 'rgba(255,255,255,0.10)',
  surfacePressed: 'rgba(255,255,255,0.14)',
  navBar: 'rgba(24,26,36,0.96)',
  line: 'rgba(255,255,255,0.10)',
  lineStrong: 'rgba(255,255,255,0.18)',

  // Text (on bg)
  text: '#EEF1F7',
  textMuted: '#B4BBC8',
  textSubtle: '#8F98AA',
  textOnAccent: palette.ink950, // dark text on bright gradient

  // Accent (citizen)
  accent: palette.cyan300,
  accent2: palette.violet400,
  accentText: palette.cyan200, // accent used as text
  accentSoft: 'rgba(103,232,249,0.13)', // tinted fills
  accentBorder: 'rgba(103,232,249,0.34)',
  accentGlow: 'rgba(103,232,249,0.45)',

  // Status
  warning: palette.amber300,
  warningSoft: 'rgba(252,211,77,0.12)',
  warningBorder: 'rgba(252,211,77,0.35)',
  danger: palette.rose300,
  dangerSoft: 'rgba(253,164,175,0.12)',
  success: palette.mint300,
} as const;

/** Lawyer-app accent (Phase 2): swap these into `colors` for the lawyer route group. */
export const lawyerAccent = {
  accent: palette.lime300,
  accent2: palette.mint300,
  accentText: palette.lime400,
  accentSoft: 'rgba(190,242,100,0.11)',
  accentBorder: 'rgba(190,242,100,0.30)',
  accentGlow: 'rgba(190,242,100,0.40)',
} as const;

/** Gradients as [start, end] colour stops (used with expo-linear-gradient). */
export const gradients = {
  accent: [palette.cyan300, palette.violet400] as const,
  lawyer: [palette.lime300, palette.mint300] as const,
  /** Screen background: faint violet glow top-right fading into ink. */
  ground: ['#151330', palette.ink900, palette.ink900] as const,
} as const;

/** 4/8-point spacing scale. */
export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

/** Soft, rounded shapes. */
export const radius = { sm: 12, md: 16, lg: 20, xl: 24, pill: 999 } as const;

/** Font family names (loaded with expo-font; Devanagari falls back to the system Noto font). */
export const fonts = {
  heading: 'SpaceGrotesk_600SemiBold',
  headingBold: 'SpaceGrotesk_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
} as const;

/** Type scale. Body never below 16; smallest label 14. */
export const typography = {
  label: 14,
  caption: 14,
  body: 16,
  bodyLarge: 18,
  title: 20,
  h3: 18,
  h2: 26,
  h1: 32,
  display: 40,
} as const;

/** Minimum touch target in dp (Material). */
export const touchTarget = 48;

/** Icon sizes. */
export const iconSize = { sm: 18, md: 22, lg: 26 } as const;

export type ColorToken = keyof typeof colors;
