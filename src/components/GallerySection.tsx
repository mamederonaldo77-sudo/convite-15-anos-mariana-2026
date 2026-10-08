import React, { useState, useEffect } from 'react';
import { GalleryItem, MediaCategory } from '../types';
import {
  Sparkles,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Grid,
  Layers,
} from 'lucide-react';

interface GallerySectionProps {
  items: GalleryItem[];
  onOpenLightbox: (imageUrl: string, title?: string, caption?: string) => void;
}

const CATEGORIES: ('Todos' | MediaCategory)[] = [
  'Todos',
  'Infância',
  'Família',
  'Amigos',
  'Viagens',
  'Adolescência',
  'Momentos especiais',
];

export const GallerySection: React.FC<GallerySectionProps> = ({ items, onOpenLightbox }) => {
  const [activeCategory, setActiveCategory] = useState<'Todos' | MediaCategory>('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'slideshow'>('grid');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);

  const filteredItems = items.filter((item) =>
    activeCategory === 'Todos' ? true : item.category === activeCategory
  );

  // Slideshow auto timer
  useEffect(() => {
    if (viewMode !== 'slideshow' || !isSlideshowPlaying || filteredItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % filteredItems.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [viewMode, isSlideshowPlaying, filteredItems.length]);

  // Keep slide index in bounds when category changes
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [activeCategory]);

  const activeSlide = filteredItems[currentSlideIndex] || filteredItems[0];

  const handleNextSlide = () => {
    if (filteredItems.length <= 1) return;
    setCurrentSlideIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handlePrevSlide = () => {
    if (filteredItems.length <= 1) return;
    setCurrentSlideIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  return (
    <section id="galeria" className="py-20 px-4 relative z-10 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/70 border border-purple-400/30 text-purple-200 text-xs uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>Álbum de Memórias</span>
        </div>
        <h2 className="font-cormorant text-4xl sm:text-6xl font-bold silver-text mb-3">
          Galeria de Fotos
        </h2>
        <p className="font-script text-2xl sm:text-3xl text-purple-300/90 max-w-xl mx-auto">
          Cores, sorrisos e lembranças que brilharão para sempre
        </p>
      </div>

      {/* Control Bar: Mode Toggle & Category Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar justify-start">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md shadow-purple-900/40 border border-purple-300/40'
                  : 'bg-slate-900/60 border border-purple-400/15 text-slate-300 hover:text-purple-200 hover:border-purple-300/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View Mode Toggle: Grid vs Slideshow */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-full border border-purple-400/20 backdrop-blur-md self-end md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-purple-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Mosaico</span>
          </button>
          <button
            onClick={() => setViewMode('slideshow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              viewMode === 'slideshow'
                ? 'bg-purple-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Apresentação</span>
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="silver-card rounded-2xl p-12 text-center text-slate-400">
          Nenhuma foto encontrada nesta categoria.
        </div>
      ) : viewMode === 'slideshow' ? (
        /* SLIDESHOW VIEW */
        <div className="silver-card rounded-3xl p-4 sm:p-6 border border-purple-400/30 shadow-2xl relative max-w-4xl mx-auto">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950">
            {activeSlide && (
              <>
                <img
                  key={activeSlide.id}
                  src={activeSlide.url}
                  alt={activeSlide.title}
                  className="w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
                />

                {/* Ambient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/20 pointer-events-none" />

                {/* Slide Info Banner */}
                <div className="absolute bottom-6 left-6 right-20 sm:right-32 text-left pointer-events-none">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-purple-900/80 border border-purple-400/30 text-purple-200 text-xs font-medium mb-1.5">
                    {activeSlide.category}
                  </span>
                  <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white mb-1">
                    {activeSlide.title}
                  </h3>
                  {activeSlide.description && (
                    <p className="text-xs sm:text-sm text-slate-300 font-light line-clamp-2">
                      {activeSlide.description}
                    </p>
                  )}
                </div>

                {/* Enlarge Button */}
                <button
                  onClick={() =>
                    onOpenLightbox(activeSlide.url, activeSlide.title, activeSlide.description)
                  }
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-900/70 border border-purple-400/30 text-purple-200 hover:text-white hover:bg-purple-800 transition-colors"
                  title="Tela cheia"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Navigation Arrows */}
                <button
                  onClick={handlePrevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-950/70 border border-purple-400/30 text-white hover:bg-purple-700/80 transition-all opacity-80 hover:opacity-100 active:scale-95"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-950/70 border border-purple-400/30 text-white hover:bg-purple-700/80 transition-all opacity-80 hover:opacity-100 active:scale-95"
                  aria-label="Próximo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Slideshow Bottom Bar with Play/Pause & Thumbnails */}
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/70 border border-purple-400/30 text-purple-200 text-xs font-medium hover:bg-purple-900/80 transition-colors"
              >
                {isSlideshowPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-purple-300" />
                    <span>Pausar Slideshow</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-purple-300" />
                    <span>Iniciar Slideshow</span>
                  </>
                )}
              </button>

              <span className="text-xs text-purple-300/80">
                {currentSlideIndex + 1} de {filteredItems.length}
              </span>
            </div>

            {/* Quick slide dots */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] no-scrollbar">
              {filteredItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlideIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentSlideIndex ? 'w-5 bg-purple-300' : 'w-2 bg-purple-900/60'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* GRID / MASONRY VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenLightbox(item.url, item.title, item.description)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border border-purple-400/20 bg-slate-900 shadow-md hover:shadow-xl hover:shadow-purple-900/30 hover:border-purple-300/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <img
                src={item.url}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Category chip */}
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-purple-950/80 backdrop-blur-md border border-purple-400/20 text-[10px] uppercase font-semibold tracking-wider text-purple-200">
                {item.category}
              </span>

              {/* Bottom text info */}
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <h4 className="font-cinzel text-xs sm:text-sm font-semibold text-white truncate group-hover:text-purple-200 transition-colors">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-[11px] text-slate-300 font-light truncate mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
