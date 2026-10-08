import { EventSettings, ThemePreset, TitleFontFamily, BodyFontFamily } from '../types';

export interface ThemePresetOption {
  id: ThemePreset;
  name: string;
  desc: string;
  bgColor: string;
  accentLilac: string;
  accentSecondary: string;
  fontTitle: TitleFontFamily;
  fontBody: BodyFontFamily;
}

export const THEME_PRESETS: ThemePresetOption[] = [
  {
    id: 'lilas-prata',
    name: 'Lilás & Prata',
    desc: 'O clássico sofisticado com nuances lilases e prateadas.',
    bgColor: '#0b0813',
    accentLilac: '#c084fc',
    accentSecondary: '#e9d5ff',
    fontTitle: 'Cinzel',
    fontBody: 'Montserrat',
  },
  {
    id: 'lavanda-ametista',
    name: 'Lavanda & Ametista',
    desc: 'Tons florais de lavanda com roxo profundo e nobre.',
    bgColor: '#110920',
    accentLilac: '#d8b4fe',
    accentSecondary: '#f3e8ff',
    fontTitle: 'Cormorant Garamond',
    fontBody: 'Montserrat',
  },
  {
    id: 'noite-estrelada',
    name: 'Noite Estrelada',
    desc: 'Fundo escuro profundo com brilho violeta reluzente.',
    bgColor: '#06040a',
    accentLilac: '#a855f7',
    accentSecondary: '#d8b4fe',
    fontTitle: 'Playfair Display',
    fontBody: 'Inter',
  },
  {
    id: 'rosa-lilas',
    name: 'Rosa Doce & Lilás',
    desc: 'Toque romântico e delicado com transição lilás-rosé.',
    bgColor: '#130919',
    accentLilac: '#e879f9',
    accentSecondary: '#fbcfe8',
    fontTitle: 'Great Vibes',
    fontBody: 'Montserrat',
  },
  {
    id: 'prata-cristal',
    name: 'Prata & Cristal',
    desc: 'Pureza cintilante com tons metálicos e reflexos de cristal.',
    bgColor: '#0a0a14',
    accentLilac: '#cbd5e1',
    accentSecondary: '#f1f5f9',
    fontTitle: 'Cinzel',
    fontBody: 'Montserrat',
  },
];

export const TITLE_FONTS: { id: TitleFontFamily; name: string; sample: string }[] = [
  { id: 'Cinzel', name: 'Cinzel', sample: 'Majestoso, nobre e refinado' },
  { id: 'Cormorant Garamond', name: 'Cormorant Garamond', sample: 'Clássico poético de realeza' },
  { id: 'Playfair Display', name: 'Playfair Display', sample: 'Editorial contemporâneo e luxuoso' },
  { id: 'Great Vibes', name: 'Great Vibes', sample: 'Caligrafia suave e romântica' },
];

export const BODY_FONTS: { id: BodyFontFamily; name: string; sample: string }[] = [
  { id: 'Montserrat', name: 'Montserrat', sample: 'Moderna, limpa e nítida no celular' },
  { id: 'Inter', name: 'Inter', sample: 'Minimalista e contemporânea' },
  { id: 'Cormorant Garamond', name: 'Cormorant Garamond', sample: 'Serifada com ar de conto de fadas' },
];

export function getFontFamilyString(font?: string, isTitle: boolean = true): string {
  switch (font) {
    case 'Cinzel':
      return "'Cinzel', Georgia, serif";
    case 'Cormorant Garamond':
      return "'Cormorant Garamond', Georgia, serif";
    case 'Playfair Display':
      return "'Playfair Display', Georgia, serif";
    case 'Great Vibes':
      return "'Great Vibes', cursive";
    case 'Montserrat':
      return "'Montserrat', system-ui, -apple-system, sans-serif";
    case 'Inter':
      return "'Inter', system-ui, -apple-system, sans-serif";
    default:
      return isTitle ? "'Cinzel', Georgia, serif" : "'Montserrat', system-ui, -apple-system, sans-serif";
  }
}

/**
 * Applies the given theme parameters to CSS variables on :root,
 * dynamically restyling fonts, background colors, accents, and glows throughout the entire page.
 */
export function applyThemeToDocument(settings: Partial<EventSettings>): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const bg = settings.bgColor || '#0b0813';
  const accent = settings.accentLilac || '#c084fc';
  const secondary = settings.accentSecondary || '#e9d5ff';
  const fontTitleStr = getFontFamilyString(settings.fontTitle || 'Cinzel', true);
  const fontBodyStr = getFontFamilyString(settings.fontBody || 'Montserrat', false);

  root.style.setProperty('--theme-bg', bg);
  root.style.setProperty('--theme-accent', accent);
  root.style.setProperty('--theme-secondary', secondary);
  root.style.setProperty('--theme-font-title', fontTitleStr);
  root.style.setProperty('--theme-font-body', fontBodyStr);

  root.setAttribute('data-theme-active', 'true');
  root.style.backgroundColor = bg;

  if (document.body) {
    document.body.style.backgroundColor = bg;
    document.body.style.fontFamily = fontBodyStr;
  }
}
