/**
 * Design tokens shared by mobile and admin.
 * Navy/indigo palette inspired by the prototype, adjusted for WCAG AA contrast.
 */
export const colors = {
  navy900: '#070F2B',
  navy800: '#1B1A55',
  navy600: '#535C91',
  navy300: '#9290C3',
  surface: '#FFFFFF',
  surfaceMuted: '#F3F4F8',
  text: '#0F172A',
  textMuted: '#475569',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: '#C7CAE6',
  primary: '#3B3F8F',
  primaryPressed: '#2D3070',
  accent: '#F5B700',
  success: '#15803D',
  warning: '#B45309',
  danger: '#B91C1C',
  border: '#E2E8F0',
  sampleBg: '#FEF3C7',
  sampleText: '#78350F',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

/** Body text is never smaller than 16 (low-literacy / low-vision users). */
export const typography = {
  caption: 14,
  body: 16,
  bodyLarge: 18,
  title: 22,
  heading: 28,
  display: 34,
} as const;

/** Minimum touch target in dp. */
export const touchTarget = 48;

export type ColorToken = keyof typeof colors;
