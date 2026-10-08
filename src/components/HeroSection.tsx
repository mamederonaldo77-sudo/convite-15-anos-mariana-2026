import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Shirt } from 'lucide-react';
import confetti from 'canvas-confetti';
import { OrnamentalDivider } from './OrnamentalDivider';

interface HeroSectionProps {
  debutanteName: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  dressCode?: string;
  heroPhotos?: string[];
  heroAutoPlay?: boolean;
  heroInterval?: number;
  fontTitle?: string;
  onEnterCelebration: () => void;
}

const DEFAULT_HERO_PHOTOS = [
  '/images/regenerated_image_1791396965326.jpg',
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1920&q=85',
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  debutanteName,
  venueName,
  dressCode,
  heroPhotos,
  heroAutoPlay = true,
  heroInterval = 4.5,
  onEnterCelebration,
}) => {
  const photos = heroPhotos && heroPhotos.length > 0 ? heroPhotos : DEFAULT_HERO_PHOTOS;
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(heroAutoPlay);

  useEffect(() => {
    setIsAutoPlay(heroAutoPlay);
  }, [heroAutoPlay]);

  // Slideshow transition interval based on admin settings
  useEffect(() => {
    if (!isAutoPlay || photos.length <= 1) return;
    const intervalMs = Math.max(2, heroInterval || 4.5) * 1000;
    const timer = setInterval(() => {
      setCurrentPhotoIdx((prev) => (prev + 1) % photos.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isAutoPlay, photos.length, heroInterval]);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsAutoPlay(false);
    setCurrentPhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsAutoPlay(false);
    setCurrentPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const triggerEntry = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#c084fc', '#e9d5ff', '#ffffff', '#a855f7', '#d8b4fe'],
      ticks: 200,
    });
    onEnterCelebration();
  };

  return (
    <section
      id="inicio"
      className="relative flex flex-col items-center justify-center text-center px-2 sm:px-4 pt-2 sm:pt-4 pb-12 sm:pb-16 overflow-hidden w-full max-w-6xl mx-auto"
    >
      {/* Delicado Divisor Ornamental entre cabeçalho e fotos */}
      <OrnamentalDivider className="my-2 sm:my-3 opacity-80" />

      {/* Espaço de Ponta a Ponta para Fotos com Proporção Otimizada */}
      <div className="w-full my-3 px-0 sm:px-2 md:px-4">
        <div className="relative w-full h-[280px] xs:h-[320px] sm:h-[440px] md:h-[520px] lg:h-[580px] rounded-2xl sm:rounded-3xl overflow-hidden border border-purple-400/30 shadow-2xl shadow-purple-950/60 group bg-slate-950">
          {/* Fotos Slides */}
          {photos.map((photoUrl, idx) => (
            <div
              key={photoUrl + idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentPhotoIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={photoUrl}
                alt={`${debutanteName || 'Mariana Amorim'} - Foto ${idx + 1}`}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
            </div>
          ))}

          {/* Navegação Manual: Setas Esquerda & Direita */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Foto anterior"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950/75 border border-purple-400/40 text-purple-200 flex items-center justify-center backdrop-blur-md opacity-85 sm:opacity-0 group-hover:opacity-100 hover:bg-purple-900/90 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xl"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Próxima foto"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950/75 border border-purple-400/40 text-purple-200 flex items-center justify-center backdrop-blur-md opacity-85 sm:opacity-0 group-hover:opacity-100 hover:bg-purple-900/90 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xl"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Indicadores / Pontos */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-purple-400/30 shadow-lg">
                {photos.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => {
                      setIsAutoPlay(false);
                      setCurrentPhotoIdx(dotIdx);
                    }}
                    aria-label={`Ir para foto ${dotIdx + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      dotIdx === currentPhotoIdx
                        ? 'w-6 bg-gradient-to-r from-purple-400 to-indigo-300'
                        : 'w-2 bg-purple-300/40 hover:bg-purple-300/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Faixa com Data, Horário, Local e Traje */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-5 text-xs sm:text-sm text-slate-200 my-4 max-w-4xl mx-auto py-2.5 px-4 sm:px-6 rounded-2xl bg-slate-900/50 border border-purple-400/20 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300" />
          <span className="font-medium">13 de novembro de 2026</span>
        </div>
        <div className="hidden sm:block text-purple-400/40">•</div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300" />
          <span className="font-medium">20:00h</span>
        </div>
        <div className="hidden sm:block text-purple-400/40">•</div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300" />
          <span className="font-medium">{venueName || 'Espaço 277'}</span>
        </div>
        {dressCode && (
          <>
            <div className="hidden sm:block text-purple-400/40">•</div>
            <div className="flex items-center gap-1.5">
              <Shirt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300" />
              <span className="font-medium">{dressCode}</span>
            </div>
          </>
        )}
      </div>

      {/* Botões de Ação Principal */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mt-2">
        <button
          type="button"
          onClick={triggerEntry}
          className="w-full sm:w-auto px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm tracking-wider shadow-lg shadow-purple-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-purple-400/30"
        >
          Entrar na Celebração
        </button>

        <a
          href="#rsvp"
          className="w-full sm:w-auto px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-slate-900/80 hover:bg-purple-950/80 text-purple-200 border border-purple-400/30 hover:border-purple-300 font-semibold text-xs sm:text-sm tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md text-center"
        >
          Confirmar Presença
        </a>
      </div>
    </section>
  );
};
