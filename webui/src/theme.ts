import type { ThemeKey, AccentKey, ThemeTokens, AccentTokens } from './types';

export const THEMES: Record<ThemeKey, ThemeTokens> = {
  dark: {
    bg:           'oklch(10% 0.014 225)',
    bgOuter:      'oklch(8%  0.012 225)',
    surface:      'oklch(16% 0.016 225)',
    surfaceAlt:   'oklch(20% 0.016 225)',
    border:       'oklch(24% 0.014 225)',
    borderSoft:   'oklch(20% 0.012 225)',
    text:         'oklch(91% 0.008 225)',
    textSub:      'oklch(62% 0.010 225)',
    textMuted:    'oklch(40% 0.010 225)',
    ownText:      'oklch(10% 0.010 225)',
    systemText:   'oklch(48% 0.010 225)',
    errorColor:   'oklch(64% 0.16 25)',
    successColor: 'oklch(68% 0.15 145)',
    warnColor:    'oklch(76% 0.14 75)',
  },
  light: {
    bg:           'oklch(97% 0.007 220)',
    bgOuter:      'oklch(93% 0.009 220)',
    surface:      'oklch(100% 0 0)',
    surfaceAlt:   'oklch(95% 0.007 220)',
    border:       'oklch(87% 0.010 220)',
    borderSoft:   'oklch(91% 0.008 220)',
    text:         'oklch(18% 0.010 230)',
    textSub:      'oklch(50% 0.010 230)',
    textMuted:    'oklch(68% 0.010 230)',
    ownText:      'oklch(99% 0 0)',
    systemText:   'oklch(58% 0.010 230)',
    errorColor:   'oklch(52% 0.18 25)',
    successColor: 'oklch(52% 0.16 145)',
    warnColor:    'oklch(60% 0.15 75)',
  },
};

export const ACCENTS: Record<AccentKey, AccentTokens> = {
  cyan:   { c: 'oklch(72% 0.145 192)', dim: 'oklch(72% 0.145 192 / 0.18)', dimBorder: 'oklch(72% 0.145 192 / 0.35)', label: 'Cyan'   },
  amber:  { c: 'oklch(78% 0.145 75)',  dim: 'oklch(78% 0.145 75  / 0.18)', dimBorder: 'oklch(78% 0.145 75  / 0.35)', label: 'Amber'  },
  violet: { c: 'oklch(70% 0.145 285)', dim: 'oklch(70% 0.145 285 / 0.18)', dimBorder: 'oklch(70% 0.145 285 / 0.35)', label: 'Violet' },
};
