import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  imageUrl: string;
  title?: string;
  caption?: string;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  imageUrl,
  title,
  caption,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 rounded-full bg-slate-900/80 border border-purple-400/30 text-purple-200 hover:text-white hover:bg-purple-900 transition-colors z-10"
        title="Fechar"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Image Container */}
      <div
        className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-2xl overflow-hidden border border-purple-400/40 shadow-2xl shadow-purple-950/80 bg-slate-950">
          <img
            src={imageUrl}
            alt={title || 'Foto de 15 anos'}
            className="max-h-[75vh] w-auto max-w-full object-contain"
          />
        </div>

        {/* Captions */}
        {(title || caption) && (
          <div className="mt-4 text-center max-w-xl px-4 py-2 rounded-2xl bg-slate-950/80 border border-purple-400/20 backdrop-blur-md">
            {title && (
              <h4 className="font-cinzel text-base sm:text-lg font-bold text-white flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>{title}</span>
              </h4>
            )}
            {caption && (
              <p className="text-xs sm:text-sm text-purple-200/90 font-light mt-0.5">
                {caption}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
