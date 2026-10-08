import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Music, Volume2, VolumeX, AlertCircle } from 'lucide-react';

interface MusicPlayerProps {
  musicUrl: string;
  musicTitle: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  enabled: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  musicUrl,
  musicTitle,
  isPlaying,
  onTogglePlay,
  enabled,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.75;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      setLoadError(false);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay prevented or playback issue:', err);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  if (!enabled) return null;

  const displayTitle = musicTitle || 'All of Me (Piano Instrumental)';

  return (
    <aside
      aria-label="Controle de música de fundo"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-slate-950/95 border border-purple-400/35 backdrop-blur-xl p-2 sm:p-2.5 rounded-full shadow-2xl shadow-purple-950/90 group hover:border-purple-300/70 transition-all duration-300"
    >
      <audio
        ref={audioRef}
        loop
        preload="auto"
        onEnded={() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          }
        }}
        onError={() => {
          console.error('Audio load error, trying fallback');
          setLoadError(true);
        }}
      >
        <source src={musicUrl || '/audio/all-of-me-piano.mp3'} type="audio/mpeg" />
        <source src="/uploads/all-of-me-piano.mp3" type="audio/mpeg" />
        <source src="https://archive.org/download/john-legend-all-of-me-piano-cover/john-legend-all-of-me-piano-cover.mp3" type="audio/mpeg" />
      </audio>

      {/* Main Play/Pause Button */}
      <button
        onClick={onTogglePlay}
        className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-700 via-fuchsia-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-900/50 hover:scale-105 active:scale-95 transition-all cursor-pointer flex-shrink-0"
        title={isPlaying ? 'Pausar All of Me' : 'Tocar All of Me (Piano)'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-white" />
        ) : (
          <Play className="w-4 h-4 fill-white translate-x-0.5" />
        )}
      </button>

      {/* Track info & soundwave indicator */}
      <div className="flex flex-col text-left pr-3 max-w-[190px]">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300">
            {isPlaying ? 'Tocando' : 'Música de Fundo'}
          </span>
          {/* Animated sound equalizer bars */}
          {isPlaying && (
            <div className="flex items-end gap-[2px] h-3">
              <span className="w-0.5 bg-purple-300 rounded-full h-2 animate-bounce" />
              <span className="w-0.5 bg-purple-400 rounded-full h-3 animate-pulse" />
              <span className="w-0.5 bg-purple-200 rounded-full h-1.5 animate-bounce" />
            </div>
          )}
        </div>
        <span className="text-xs font-semibold text-slate-100 truncate" title={displayTitle}>
          {displayTitle}
        </span>
      </div>
    </aside>
  );
};
