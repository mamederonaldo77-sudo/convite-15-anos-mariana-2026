export type ThemePreset =
  | 'lilas-prata'
  | 'lavanda-ametista'
  | 'noite-estrelada'
  | 'rosa-lilas'
  | 'prata-cristal';

export type TitleFontFamily = 'Cinzel' | 'Cormorant Garamond' | 'Playfair Display' | 'Great Vibes';
export type BodyFontFamily = 'Montserrat' | 'Inter' | 'Cormorant Garamond';

export interface EventSettings {
  debutanteName: string;
  eventTitle: string;
  eventDate: string; // ISO string e.g. "2026-11-13T20:00:00"
  heroSubtitle?: string;
  footerQuote?: string;
  venueName: string;
  venueAddress: string;
  mapsUrl: string;
  whatsappNumber: string;
  whatsappMessage: string;
  pixKey: string;
  pixKeyType: 'email' | 'cpf' | 'phone' | 'random';
  pixBeneficiary: string;
  pixBank: string;
  showGiftList: boolean;
  giftRegistryUrl?: string;
  enableMusic: boolean;
  musicTitle: string;
  musicUrl: string;
  adminPin: string;

  dressCode?: string;
  heroPhotos?: string[];
  heroAutoPlay?: boolean;
  heroInterval?: number;

  // Custom Arts & Branding
  customLogoUrl?: string;
  bgTextureUrl?: string;
  footerArtUrl?: string;

  // RSVP Customization
  rsvpThankYouMessage?: string;

  // Visual Customization
  themePreset?: ThemePreset;
  bgColor?: string;
  accentLilac?: string;
  accentSecondary?: string;
  fontTitle?: TitleFontFamily;
  fontBody?: BodyFontFamily;
}

export type MediaCategory =
  | 'Infância'
  | 'Família'
  | 'Amigos'
  | 'Viagens'
  | 'Adolescência'
  | 'Momentos especiais';

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  category: MediaCategory;
  order: number;
  createdAt: string;
  stageId?: string; // Optional link to retrospective stage
}

export interface TimelineStage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  order: number;
  photos: {
    id: string;
    url: string;
    caption?: string;
  }[];
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string; // URL to mp4, webm or YouTube/Vimeo embed
  thumbnailUrl?: string;
  isAiInvite?: boolean;
  order: number;
  createdAt: string;
}

export interface RSVPConfirmation {
  id: string;
  name: string;
  guestsCount: number;
  phone: string;
  message?: string;
  confirmedAt: string;
  status: 'confirmed' | 'declined';
}
