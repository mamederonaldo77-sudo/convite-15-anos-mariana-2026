import fs from 'fs';
import path from 'path';
import { EventSettings, GalleryItem, TimelineStage, VideoItem, RSVPConfirmation } from '../src/types';

interface DatabaseSchema {
  settings: EventSettings;
  timeline: TimelineStage[];
  gallery: GalleryItem[];
  videos: VideoItem[];
  rsvps: RSVPConfirmation[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const DEFAULT_SETTINGS: EventSettings = {
  debutanteName: 'X V da Mari',
  eventTitle: 'Meus 15 anos',
  eventDate: '2026-11-13T20:00:00',
  venueName: 'Espaço 277',
  venueAddress: 'Rua do Imperador, 277 - Viga, Nova Iguaçu - RJ',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+do+Imperador%2C+277+-+Viga%2C+Nova+Igua%C3%A7u+-+RJ',
  whatsappNumber: '5511987654321',
  whatsappMessage: 'Olá! Gostaria de confirmar minha presença no X V da Mari!',
  pixKey: 'mariana.amorim15anos@gmail.com',
  pixKeyType: 'email',
  pixBeneficiary: 'X V da Mari',
  pixBank: 'Banco Inter',
  showGiftList: true,
  giftRegistryUrl: '',
  enableMusic: true,
  musicTitle: 'All of Me (Piano Instrumental)',
  musicUrl: '/audio/all-of-me-piano.mp3',
  adminPin: 'mariana15',
  dressCode: 'Esporte Fino / Traje de Gala',
  heroPhotos: [
    '/images/regenerated_image_1791396965326.jpg',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1920&q=85'
  ],
  heroAutoPlay: true,
  heroInterval: 4.5,
  rsvpThankYouMessage: 'Obrigada pelo carinho, {name}! Sua presença tornará o X V da Mari ainda mais especial e inesquecível.',
  themePreset: 'lilas-prata',
  bgColor: '#0b0813',
  accentLilac: '#c084fc',
  accentSecondary: '#e9d5ff',
  fontTitle: 'Cinzel',
  fontBody: 'Montserrat',
  heroSubtitle: '',
  footerQuote: 'Obrigada, Senhor, por fazer parte da minha história e por caminhar comigo até a realização desse grande sonho.',
};

const DEFAULT_TIMELINE: TimelineStage[] = [
  {
    id: 'stage-1',
    title: 'Minha infância',
    subtitle: 'Primeiros sorrisos e descobertas',
    description: 'O início de tudo: brincadeiras sem fim no jardim, bonecas espalhadas pela sala e o carinho que moldou meus primeiros passos.',
    order: 1,
    photos: [
      {
        id: 'p-infancia-1',
        url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
        caption: 'Descobrindo o mundo com olhos cheios de curiosidade',
      },
      {
        id: 'p-infancia-2',
        url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
        caption: 'Alegria pura em cada pequena aventura',
      },
      {
        id: 'p-infancia-3',
        url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80',
        caption: 'Laços no cabelo e imaginação sem limites',
      },
    ],
  },
  {
    id: 'stage-2',
    title: 'Momentos especiais',
    subtitle: 'Lembranças guardadas no coração',
    description: 'Viagens inesquecíveis, o mar tocando os pés pela primeira vez e momentos que viraram fotos cheias de afeto.',
    order: 2,
    photos: [
      {
        id: 'p-momentos-1',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Pôr do sol dourado em família',
      },
      {
        id: 'p-momentos-2',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
        caption: 'Comemorações que marcaram minha história',
      },
    ],
  },
  {
    id: 'stage-3',
    title: 'Família',
    subtitle: 'Meu porto seguro e maior amor',
    description: 'Onde o amor é incondicional. Pais, avós e irmãos que me deram raízes profundas e me ensinaram a voar.',
    order: 3,
    photos: [
      {
        id: 'p-familia-1',
        url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
        caption: 'Abraço que cura e acolhe qualquer tempestade',
      },
      {
        id: 'p-familia-2',
        url: 'https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?auto=format&fit=crop&w=1200&q=80',
        caption: 'A união que é o verdadeiro tesouro da minha vida',
      },
    ],
  },
  {
    id: 'stage-4',
    title: 'Amigos',
    subtitle: 'Parcerias e risadas infinitas',
    description: 'Conversas que varam noites, confissões secretas, dancinhas e a cumplicidade que deixa qualquer dia mais leve.',
    order: 4,
    photos: [
      {
        id: 'p-amigos-1',
        url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
        caption: 'Amizade verdadeira é para a vida toda',
      },
      {
        id: 'p-amigos-2',
        url: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=1200&q=80',
        caption: 'Risadas e planos que sonhamos juntos',
      },
    ],
  },
  {
    id: 'stage-5',
    title: 'Adolescência',
    subtitle: 'Florescer e descobrir novos sonhos',
    description: 'Transformações, músicas que tocam a alma, paixão pela dança e a vontade imensa de desbravar o mundo com leveza.',
    order: 5,
    photos: [
      {
        id: 'p-adol-1',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
        caption: 'Novas perspectivas e confiança crescendo',
      },
      {
        id: 'p-adol-2',
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
        caption: 'Brilho no olhar e coração pronto para sonhar alto',
      },
    ],
  },
  {
    id: 'stage-6',
    title: 'Os meus 15 anos',
    subtitle: 'O grande sonho se realizando',
    description: 'O vestido lilás com toques prateados, a valsa esperada com carinho e a contagem regressiva para viver uma noite de conto de fadas.',
    order: 6,
    photos: [
      {
        id: 'p-15-1',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        caption: 'Ensaio fotográfico oficial em tons de lilás e prata',
      },
      {
        id: 'p-15-2',
        url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
        caption: 'Cada detalhe planejado com todo o amor do mundo',
      },
      {
        id: 'p-15-3',
        url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=80',
        caption: 'Uma noite inesquecível feita para celebrar juntos',
      },
    ],
  },
];

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'g-1',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    title: 'Ensaio Debutante 15 Anos',
    description: 'Vestido lilás com bordados prateados e luz suave de entardecer.',
    category: 'Momentos especiais',
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'g-2',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    title: 'Sorriso de Menina',
    description: 'Três aninhos e toda a doçura do mundo.',
    category: 'Infância',
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'g-3',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    title: 'Almoço em Família',
    description: 'A união que fortalece cada passo da minha trajetória.',
    category: 'Família',
    order: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'g-4',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    title: 'Melhores Amigas',
    description: 'Parceria incondicional nas risadas e nos sonhos.',
    category: 'Amigos',
    order: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'g-5',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    title: 'Férias de Verão',
    description: 'Litoral, brisa fresca e memórias inesquecíveis.',
    category: 'Viagens',
    order: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'g-6',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    title: 'Retrato de Adolescência',
    description: 'Descobrindo a própria essência com brilho e personalidade.',
    category: 'Adolescência',
    order: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'g-7',
    url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    title: 'Flores Lilases & Elegância',
    description: 'A delicadeza do lilás e a sofisticação da prata em harmonia.',
    category: 'Momentos especiais',
    order: 7,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'g-8',
    url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
    title: 'Brincando na Praça',
    description: 'Primeiros passinhos cheios de animação.',
    category: 'Infância',
    order: 8,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: 'v-1',
    title: 'Convite especial',
    description: 'Convite especial',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    isAiInvite: true,
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'v-2',
    title: 'Teaser',
    description: 'Teaser',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=80',
    isAiInvite: false,
    order: 2,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_RSVPS: RSVPConfirmation[] = [
  {
    id: 'rsvp-1',
    name: 'Tia Helena e Família',
    guestsCount: 3,
    phone: '(11) 99123-4567',
    message: 'Mariana linda, mal podemos esperar por esse dia mágico! Parabéns!',
    confirmedAt: '2026-10-01T14:30:00.000Z',
    status: 'confirmed',
  },
  {
    id: 'rsvp-2',
    name: 'Beatriz Lima (Melhor Amiga)',
    guestsCount: 1,
    phone: '(11) 98877-6655',
    message: 'A melhor festa do ano! Estarei na primeira fila pra te ver dançar a valsa!',
    confirmedAt: '2026-10-03T18:15:00.000Z',
    status: 'confirmed',
  },
];

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function readDatabase(): DatabaseSchema {
  ensureDirs();
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      settings: DEFAULT_SETTINGS,
      timeline: DEFAULT_TIMELINE,
      gallery: DEFAULT_GALLERY,
      videos: DEFAULT_VIDEOS,
      rsvps: DEFAULT_RSVPS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      timeline: parsed.timeline || DEFAULT_TIMELINE,
      gallery: parsed.gallery || DEFAULT_GALLERY,
      videos: parsed.videos || DEFAULT_VIDEOS,
      rsvps: parsed.rsvps || DEFAULT_RSVPS,
    };
  } catch (error) {
    console.error('Error reading database, restoring defaults:', error);
    return {
      settings: DEFAULT_SETTINGS,
      timeline: DEFAULT_TIMELINE,
      gallery: DEFAULT_GALLERY,
      videos: DEFAULT_VIDEOS,
      rsvps: DEFAULT_RSVPS,
    };
  }
}

export function writeDatabase(data: DatabaseSchema): void {
  ensureDirs();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
