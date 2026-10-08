import React, { useState } from 'react';
import { VideoItem } from '../types';
import { Sparkles, Video, ExternalLink } from 'lucide-react';

interface VideoSectionProps {
  videos: VideoItem[];
}

export const VideoSection: React.FC<VideoSectionProps> = ({ videos }) => {
  const [videoError, setVideoError] = useState(false);

  if (!videos || videos.length === 0) return null;

  // Active video: prefers AI / main special invite, or the first available video
  const activeVideo = videos.find((v) => v.isAiInvite) || videos[0];

  const isEmbeddable = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      try {
        const v = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${v}?autoplay=0`;
      } catch {
        return url;
      }
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=0`;
    }
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${id}?autoplay=0`;
    }
    return url;
  };

  const getVideoDisplayTitle = (vid: VideoItem) => {
    const lower = (vid.title || '').toLowerCase();
    if (vid.isAiInvite || lower.includes('convite')) {
      return 'Convite Especial';
    }
    if (lower.includes('teaser')) {
      return 'Teaser';
    }
    return vid.title || 'Convite Especial';
  };

  // Provide native first frame hint if no explicit thumbnail exists
  const videoSrc = activeVideo?.url
    ? activeVideo.url.includes('#')
      ? activeVideo.url
      : `${activeVideo.url}#t=0.1`
    : '';

  return (
    <section id="videos" className="py-12 sm:py-16 px-3 sm:px-4 relative z-10 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-950/70 border border-purple-400/30 text-purple-200 text-xs uppercase tracking-widest mb-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>Mensagem em Vídeo</span>
        </div>
        <h2 className="font-cormorant text-3xl sm:text-5xl font-bold silver-text mb-1.5">
          CONVITE ESPECIAL / TEASER
        </h2>
        <p className="font-script text-xl sm:text-2xl text-purple-300/90 max-w-xl mx-auto">
          Uma surpresa preparada com todo o coração para você
        </p>
      </div>

      {/* Video Container - Frame real do próprio vídeo, sem molduras ou capas artificiais criadas pelo layout */}
      {activeVideo && (
        <div className="w-full">
          <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-2xl flex items-center justify-center">
            {isEmbeddable(activeVideo.url) ? (
              <iframe
                key={activeVideo.url}
                src={getEmbedUrl(activeVideo.url)}
                title={getVideoDisplayTitle(activeVideo)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : videoError ? (
              <div className="text-center p-6 space-y-4">
                <Video className="w-12 h-12 text-purple-400 mx-auto opacity-70" />
                <p className="text-sm text-slate-300">
                  Não foi possível reproduzir este vídeo diretamente no player.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setVideoError(false)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-semibold hover:bg-purple-600 transition-colors cursor-pointer shadow-md"
                  >
                    Tentar Novamente
                  </button>
                  <a
                    href={activeVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-purple-400/30 text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir Vídeo em Nova Aba</span>
                  </a>
                </div>
              </div>
            ) : (
              <video
                key={activeVideo.url}
                src={videoSrc}
                controls
                playsInline
                preload="metadata"
                poster={activeVideo.thumbnailUrl || undefined}
                onLoadedData={() => setVideoError(false)}
                onError={(e) => {
                  if (e.currentTarget.error) {
                    console.warn('Video load error:', e.currentTarget.error.code);
                    setVideoError(true);
                  }
                }}
                className="w-full h-full object-contain bg-black"
              />
            )}
          </div>

          {/* Discreet Video Title Below Player */}
          <div className="mt-3 text-center">
            <h3 className="font-cinzel text-base sm:text-lg font-semibold text-purple-200 tracking-wide">
              {getVideoDisplayTitle(activeVideo)}
            </h3>
          </div>
        </div>
      )}
    </section>
  );
};
