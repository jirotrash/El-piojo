// El Piojo Web · Adaptive Palette v2 — Light + Dark Mode
// Tokens: HSL design system converted to hex

// ─── Light Mode ───────────────────────────────────────────────────────────────
export const lightColors = {
  background:  '#FAF8F5',   // hsl(40, 30%, 97%)   crema cálido
  foreground:  '#1A1F30',   // hsl(220, 25%, 14%)  azul pizarra
  card:        '#FFFFFF',   // hsl(0, 0%, 100%)
  cardHover:   '#F5F0EC',
  border:      '#DCE5E5',   // hsl(180, 15%, 88%)  borde suave
  surface:     '#EBEFEF',   // hsl(180, 12%, 93%)  fondo input

  primary:     '#1EA6B8',   // hsl(187, 72%, 42%)  turquesa
  primaryDark: '#187D8C',
  secondary:   '#E77A55',   // hsl(15,  75%, 62%)  coral
  accent:      '#EFC139',   // hsl(45,  85%, 58%)  sunshine

  mint:        '#43B28D',   // hsl(160, 45%, 48%)  verde menta
  lavender:    '#AD91CA',   // hsl(270, 35%, 68%)  lavanda
  warmBrown:   '#6E4D35',   // hsl(25,  35%, 32%)  café cálido
  muted:       '#EBEFEF',   // hsl(180, 12%, 93%)

  // Backward-compat aliases
  neonCyan:    '#1EA6B8',   // = primary
  neonMagenta: '#E77A55',   // = secondary (coral)
  neonYellow:  '#EFC139',   // = accent   (sunshine)
  neonGreen:   '#43B28D',   // = mint
  neonPink:    '#AD91CA',   // = lavender

  success:     '#43B28D',
  warning:     '#EFC139',
  error:       '#EF4343',   // hsl(0, 84%, 60%)
  info:        '#1EA6B8',

  textPrimary:   '#1A1F30',
  textSecondary: '#434F60',
  textMuted:     '#6C7689',   // hsl(220, 12%, 48%)

  // gradient-hero: primary→mint | gradient-warm: coral→sunshine
  // gradient-fun:  sunshine→mint | gradient-donate: lavender→primary
  gradientCyan:     ['#1EA6B8', '#43B28D'] as [string, string],   // hero
  gradientMagenta:  ['#E77A55', '#CC5138'] as [string, string],
  gradientSunset:   ['#E77A55', '#EFC139'] as [string, string],   // warm
  gradientMint:     ['#EFC139', '#43B28D'] as [string, string],   // fun
  gradientLavender: ['#AD91CA', '#1EA6B8'] as [string, string],   // donate
};

// ─── Dark Mode ────────────────────────────────────────────────────────────────
export const darkColors = {
  background:  '#14181F',   // hsl(220, 20%, 10%)  fondo oscuro azulado
  foreground:  '#EFECE7',   // hsl(40,  20%, 92%)  texto crema
  card:        '#1D212A',   // hsl(220, 18%, 14%)  tarjetas oscuras
  cardHover:   '#252A33',
  border:      '#2B303B',   // hsl(220, 15%, 20%)  bordes oscuros
  surface:     '#272C35',   // hsl(220, 15%, 18%)  fondo input oscuro

  primary:     '#2DBFD2',   // hsl(187, 65%, 50%)  turquesa brillante
  primaryDark: '#25A0B2',
  secondary:   '#E07552',   // hsl(15,  70%, 60%)  coral ajustado
  accent:      '#E8BA30',   // hsl(45,  80%, 55%)  amarillo ajustado

  mint:        '#45A182',   // hsl(160, 40%, 45%)
  lavender:    '#A68BC1',   // hsl(270, 30%, 65%)
  warmBrown:   '#A67959',   // hsl(25,  30%, 50%)
  muted:       '#272C35',   // hsl(220, 15%, 18%)

  neonCyan:    '#2DBFD2',
  neonMagenta: '#E07552',
  neonYellow:  '#E8BA30',
  neonGreen:   '#45A182',
  neonPink:    '#A68BC1',

  success:     '#45A182',
  warning:     '#E8BA30',
  error:       '#C32222',   // hsl(0, 70%, 45%)
  info:        '#2DBFD2',

  textPrimary:   '#EFECE7',
  textSecondary: '#ADB4C2',
  textMuted:     '#8D95A5',   // hsl(220, 12%, 60%)

  gradientCyan:     ['#2DBFD2', '#45A182'] as [string, string],
  gradientMagenta:  ['#E07552', '#C44D2B'] as [string, string],
  gradientSunset:   ['#E07552', '#E8BA30'] as [string, string],
  gradientMint:     ['#E8BA30', '#45A182'] as [string, string],
  gradientLavender: ['#A68BC1', '#2DBFD2'] as [string, string],
};

export type ColorPalette = typeof lightColors;

// Legacy static alias — used only as fallback; prefer useColors() hook
export const colors = lightColors;

// Category accent colors (brand — same across modes)
export const categoryColors: Record<string, string> = {
  sudaderas:  '#E77A55',   // coral
  playeras:   '#1EA6B8',   // turquesa
  pantalones: '#AD91CA',   // lavanda
  chamarras:  '#EFC139',   // sunshine
  zapatos:    '#43B28D',   // mint
  accesorios: '#6E4D35',   // café cálido
};
