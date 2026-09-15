export const BAPOLES_CATEGORIES = [
  'Kesehatan Masyarakat',
  'Pelayanan Kesehatan',
  'Pencegahan dan Pengendalian Penyakit',
  'Tenaga Kesehatan',
  'Sekertariat',
  'Mitra',
  'Pelatihan Tenaga Kesehatan',
  'Laboratorium Kesehatan',
  'RSKD Jiwa Naimata',
] as const;

export type BapolesCategory = (typeof BAPOLES_CATEGORIES)[number];

export const FILTER_CATEGORIES = ['Semua', ...BAPOLES_CATEGORIES] as const;

export interface PodcastEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  category: BapolesCategory | string;
  date: string;
  duration: string;
  speakerName: string;
  speakerRole: string;
  coverImage: string;
  description: string;
  audioUrl?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  listensCount: number;
  featured?: boolean;
  galleryId?: string;
}

export interface PodcastSchedule {
  id: string;
  title: string;
  date: string; // e.g. "Kamis, 18 September 2026"
  time: string; // e.g. "15:00 - 16:30 WITA"
  topic: string;
  guestName: string;
  guestRole: string;
  platform: 'YouTube & FB Live' | 'Studio BAPOLES' | 'RRI Kupang' | 'Live TikTok';
  streamUrl?: string;
  status: 'upcoming' | 'live' | 'completed';
}

export interface GalleryItem {
  id: string;
  title: string;
  category: BapolesCategory | string;
  imageUrl: string;
  date: string;
  description: string;
  youtubeUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  institution: string;
  photoUrl: string;
  bio: string;
}

export interface MenuLabels {
  beranda: string;
  jadwal: string;
  galeri: string;
  tentang: string;
  tim: string;
  kontak: string;
}

export interface NavMenuItem {
  id: string;
  label: string;
  iconName: string; // 'Radio' | 'Calendar' | 'ImageIcon' | 'Info' | 'Users' | 'Phone' | 'FileText' | 'Heart' | 'Activity' | 'Sparkles' | 'Link' | 'Globe'
  targetType: 'section' | 'external' | 'modal';
  targetValue: string; // e.g. 'beranda', 'jadwal', or URL
  isVisible: boolean;
  order: number;
  editTab?: string;
  modalContent?: string;
}

export interface PillarItem {
  id: string;
  title: string;
  desc: string;
}

export interface LogoSymbolItem {
  id: string;
  title: string;
  desc: string;
  iconType?: string;
}

export interface ContactChannelItem {
  id: string;
  platform: string;
  handleOrNumber?: string;
  linkUrl?: string;
  description?: string;
  handle?: string;
  url?: string;
  note?: string;
  iconType?: string;
}

export interface AboutSectionData {
  badge: string;
  title: string;
  subtitle: string;
  philosophyTitle: string;
  philosophyP1: string;
  philosophyP2: string;
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Desc: string;
  logoSectionTitle: string;
  symbol1Title: string;
  symbol1Desc: string;
  symbol2Title: string;
  symbol2Desc: string;
  symbol3Title: string;
  symbol3Desc: string;
  symbol4Title: string;
  symbol4Desc: string;
}

export interface HomePillarsData {
  tickerText?: string;
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Desc: string;
  pillar3Title: string;
  pillar3Desc: string;
}

export interface SiteConfig {
  siteName: string;
  tagline: string;
  subTagline: string;
  description: string;
  whatsappNumber: string;
  whatsappMessage: string;
  instagramHandle: string;
  facebookHandle: string;
  tiktokHandle: string;
  youtubeHandle: string;
  email: string;
  address: string;
  logoUrl?: string;
  bannerImageUrl: string;
  bannerOverlayOpacity: number; // 0 - 1
  primaryColor: string;
  tealColor: string;
  menuLabels: MenuLabels;
  aboutData: AboutSectionData;
  homeData: HomePillarsData;
  navMenus?: NavMenuItem[];
  homePillarsList?: PillarItem[];
  aboutPillarsList?: PillarItem[];
  aboutLogoSymbolsList?: LogoSymbolItem[];
  contactChannelsList?: ContactChannelItem[];
}

export interface UserQuestionSubmission {
  id: string;
  name: string;
  city: string; // e.g. Kupang, Ende, Manggarai, Alor, etc.
  whatsapp: string;
  topicSuggestion: string;
  questionText: string;
  submittedAt: string;
}
