import React from 'react';
import { ChevronUp, Heart, Shield } from 'lucide-react';
import { MarianaLogo } from './MarianaLogo';

interface FooterProps {
  debutanteName: string;
  venueName: string;
  footerQuote?: string;
  customLogoUrl?: string;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  debutanteName,
  venueName,
  footerQuote,
  customLogoUrl,
  onOpenAdmin,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finalQuote =
    footerQuote ||
    'Obrigada, Senhor, por fazer parte da minha história e por caminhar comigo até a realização desse grande sonho.';

  return (
    <footer className="relative z-10 border-t border-purple-900/30 bg-slate-950/90 pt-14 pb-10 px-4 text-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Identidade Visual Oficial Idêntica ao Cabeçalho (Proporcional & Elegante) */}
        <div className="mb-4 hover:scale-105 transition-transform duration-300">
          <MarianaLogo customLogoUrl={customLogoUrl} size="footer" />
        </div>

        {/* Frase de Agradecimento Oficial */}
        <p className="font-script text-xl sm:text-2xl text-purple-200/90 max-w-xl mx-auto mb-6 font-light italic leading-relaxed px-2">
          &ldquo;{finalQuote}&rdquo;
        </p>

        {/* Botão Voltar ao topo */}
        <button
          type="button"
          onClick={scrollToTop}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-purple-950/60 border border-purple-400/25 text-purple-300 text-xs hover:bg-purple-900/70 hover:text-white transition-all mb-8 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
        >
          <ChevronUp className="w-4 h-4" />
          <span>Voltar ao topo</span>
        </button>

        {/* Informações de rodapé */}
        <div className="w-full pt-6 border-t border-purple-950/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <div className="flex items-center gap-1">
            <span>Celebrado com</span>
            <Heart className="w-3 h-3 text-purple-400 fill-purple-400 inline" />
            <span>no {venueName || 'Espaço 277'}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Painel de Controle</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
