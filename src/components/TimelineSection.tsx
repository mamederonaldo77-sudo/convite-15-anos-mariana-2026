import React, { useState, useEffect } from 'react';
import { TimelineStage } from '../types';
import { ChevronLeft, ChevronRight, Sparkles, ZoomIn } from 'lucide-react';

interface TimelineSectionProps {
  stages: TimelineStage[];
  onOpenLightbox: (imageUrl: string, title?: string, caption?: string) => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({ stages, onOpenLightbox }) => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [photoIndices, setPhotoIndices] = useState<Record<string, number>>({});
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto transition photos in active stage every 4 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      const currentStage = stages[activeStageIndex];
      if (!currentStage || currentStage.photos.length <= 1) return;

      setPhotoIndices((prev) => {
        const currentPhotoIndex = prev[currentStage.id] || 0;
        const nextIndex = (currentPhotoIndex + 1) % currentStage.photos.length;
        return { ...prev, [currentStage.id]: nextIndex };
      });
    }, 4200);

    return () => clearInterval(interval);
  }, [activeStageIndex, stages, isAutoPlaying]);

  const activeStage = stages[activeStageIndex] || stages[0];
  const currentPhotoIndex = (activeStage && photoIndices[activeStage.id]) || 0;
  const currentPhoto = activeStage?.photos[currentPhotoIndex] || activeStage?.photos[0];

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoPlaying(false);
    if (!activeStage || activeStage.photos.length <= 1) return;
    setPhotoIndices((prev) => ({
      ...prev,
      [activeStage.id]: (currentPhotoIndex + 1) % activeStage.photos.length,
    }));
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoPlaying(false);
    if (!activeStage || activeStage.photos.length <= 1) return;
    setPhotoIndices((prev) => ({
      ...prev,
      [activeStage.id]:
        (currentPhotoIndex - 1 + activeStage.photos.length) % activeStage.photos.length,
    }));
  };

  const selectPhotoDirectly = (index: number) => {
    setIsAutoPlaying(false);
    if (!activeStage) return;
    setPhotoIndices((prev) => ({
      ...prev,
      [activeStage.id]: index,
    }));
  };

  if (!stages || stages.length === 0) return null;

  return (
    <section id="historia" className="py-20 px-4 relative z-10 max-w-6xl mx-auto">
      {/* Title */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/70 border border-purple-400/30 text-purple-200 text-xs uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>Retrospectiva</span>
        </div>
        <h2 className="font-cormorant text-4xl sm:text-6xl font-bold silver-text mb-3">
          Uma história que merece ser contada
        </h2>
        <p className="font-script text-2xl sm:text-3xl text-purple-300/90">
          De cada passo na infância ao brilho inesquecível dos 15 anos
        </p>
      </div>

      {/* Stage Selector Tabs (Horizontal pill scroll for mobile) */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-8 sm:mb-12 no-scrollbar justify-start sm:justify-center">
        {stages.map((stage, idx) => {
          const isActive = idx === activeStageIndex;
          return (
            <button
              key={stage.id}
              onClick={() => {
                setActiveStageIndex(idx);
                setIsAutoPlaying(true);
              }}
              className={`whitespace-nowrap px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-lg shadow-purple-800/40 border border-purple-300/40 scale-105'
                  : 'bg-slate-900/60 border border-purple-400/15 text-slate-300 hover:text-purple-200 hover:border-purple-300/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-purple-200' : 'bg-slate-500'}`} />
              {stage.title}
            </button>
          );
        })}
      </div>

      {/* Main Feature Display Card for Active Stage */}
      {activeStage && (
        <div className="silver-card rounded-3xl p-5 sm:p-8 md:p-10 border border-purple-400/25 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Stage Text and Narrative */}
            <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-300 mb-2">
                <span>Capítulo {activeStage.order} de {stages.length}</span>
              </div>

              <h3 className="font-cinzel text-2xl sm:text-4xl font-bold text-white mb-2 leading-tight">
                {activeStage.title}
              </h3>

              <p className="font-script text-xl sm:text-2xl text-purple-300/90 mb-4">
                {activeStage.subtitle}
              </p>

              <div className="w-12 h-[2px] bg-gradient-to-r from-purple-400 to-transparent mb-5" />

              <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6 font-light">
                {activeStage.description}
              </p>

              {/* Photos miniature thumbnail bar */}
              {activeStage.photos.length > 1 && (
                <div className="flex flex-col gap-2 pt-2 border-t border-purple-900/30">
                  <span className="text-xs text-purple-300/80 uppercase tracking-wider font-medium">
                    Fotos desta etapa ({currentPhotoIndex + 1}/{activeStage.photos.length}):
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {activeStage.photos.map((p, pIdx) => (
                      <button
                        key={p.id}
                        onClick={() => selectPhotoDirectly(pIdx)}
                        className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                          pIdx === currentPhotoIndex
                            ? 'border-purple-300 ring-2 ring-purple-500/50 scale-105'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={p.url}
                          alt={p.caption || activeStage.title}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Visual Photo Presentation with Auto & Manual Controls */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden border border-purple-300/30 shadow-2xl group bg-slate-950">
                {currentPhoto ? (
                  <>
                    <img
                      key={currentPhoto.id}
                      src={currentPhoto.url}
                      alt={currentPhoto.caption || activeStage.title}
                      className="w-full h-full object-cover transition-all duration-700 ease-out transform group-hover:scale-105"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-black/20 pointer-events-none" />

                    {/* Photo Caption Badge */}
                    {currentPhoto.caption && (
                      <div className="absolute bottom-4 left-4 right-16 sm:right-20 bg-slate-950/70 backdrop-blur-md border border-purple-400/20 rounded-xl px-4 py-2 text-xs sm:text-sm text-purple-100 font-medium">
                        {currentPhoto.caption}
                      </div>
                    )}

                    {/* Zoom / Lightbox Trigger */}
                    <button
                      onClick={() => onOpenLightbox(currentPhoto.url, activeStage.title, currentPhoto.caption)}
                      title="Ampliar foto"
                      className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-900/75 border border-purple-400/30 text-purple-200 hover:text-white hover:bg-purple-800 transition-colors shadow-lg"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>

                    {/* Navigation Arrows for Manual Navigation */}
                    {activeStage.photos.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevPhoto}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 border border-purple-400/30 text-white hover:bg-purple-700/80 transition-all opacity-80 hover:opacity-100 active:scale-90"
                          aria-label="Foto anterior"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleNextPhoto}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 border border-purple-400/30 text-white hover:bg-purple-700/80 transition-all opacity-80 hover:opacity-100 active:scale-90"
                          aria-label="Próxima foto"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Indicator Dots */}
                        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 z-10">
                          {activeStage.photos.map((_, i) => (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                selectPhotoDirectly(i);
                              }}
                              className={`h-2 rounded-full transition-all ${
                                i === currentPhotoIndex
                                  ? 'w-5 bg-purple-300'
                                  : 'w-2 bg-white/40 hover:bg-white/70'
                              }`}
                              aria-label={`Ir para foto ${i + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    Nenhuma foto cadastrada para esta etapa
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
