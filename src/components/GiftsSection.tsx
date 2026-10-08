import React, { useState } from 'react';
import { Gift, Copy, Check, Sparkles, ExternalLink, QrCode } from 'lucide-react';

interface GiftsSectionProps {
  showGiftList: boolean;
  pixKey: string;
  pixBeneficiary: string;
  pixBank: string;
  giftRegistryUrl?: string;
}

export const GiftsSection: React.FC<GiftsSectionProps> = ({
  showGiftList,
  pixKey,
  pixBeneficiary,
  pixBank,
  giftRegistryUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!showGiftList) return null;

  const handleCopyPix = () => {
    if (!pixKey) return;
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="presentes" className="py-20 px-4 relative z-10 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/70 border border-purple-400/30 text-purple-200 text-xs uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>Lista de Presentes</span>
        </div>
        <h2 className="font-cormorant text-4xl sm:text-6xl font-bold silver-text mb-3">
          Seu carinho é o meu melhor presente
        </h2>
        <p className="font-script text-2xl sm:text-3xl text-purple-300/90 max-w-md mx-auto">
          Estar ao seu lado nessa noite é tudo o que mais desejo
        </p>
      </div>

      <div className="silver-card rounded-3xl p-6 sm:p-10 border border-purple-400/30 shadow-2xl relative text-center">
        <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8 font-light">
          Para quem deseja me presentear e contribuir com meus sonhos para os próximos passos e viagens, disponibilizo a chave Pix e sugestões abaixo:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-2xl mx-auto">
          {/* Card Pix */}
          <div className="rounded-2xl bg-slate-950/80 border border-purple-400/25 p-6 flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-bold tracking-wider text-purple-300 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-purple-400" /> Chave Pix
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-400/20">
                  Instantâneo
                </span>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-400/20 mb-4 break-all font-mono text-xs text-purple-200">
                {pixKey || 'mariana.amorim15anos@gmail.com'}
              </div>

              <div className="text-xs text-slate-300 space-y-1 mb-6">
                <div>
                  <strong className="text-slate-100">Favorecida:</strong> {pixBeneficiary || 'X V da Mari'}
                </div>
                {pixBank && (
                  <div>
                    <strong className="text-slate-100">Instituição:</strong> {pixBank}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleCopyPix}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-700/80 border border-purple-300/40 text-white font-medium text-xs sm:text-sm hover:bg-purple-600 transition-all active:scale-95 shadow-md cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Chave Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Chave Pix</span>
                </>
              )}
            </button>
          </div>

          {/* Card Lista de Lojas / Presentes Físicos */}
          <div className="rounded-2xl bg-slate-950/80 border border-purple-400/25 p-6 flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-bold tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-purple-400" /> Lista Online
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-400/20">
                  Lojas Parceiras
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-light">
                {giftRegistryUrl
                  ? 'Acesse a lista completa de produtos selecionados em lojas parceiras para entrega direta.'
                  : 'Acesse sugestões especiais preparadas com carinho em nossas lojas parceiras.'}
              </p>
            </div>

            {giftRegistryUrl && (
              <a
                href={giftRegistryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-medium text-xs sm:text-sm hover:brightness-110 transition-all active:scale-95 shadow-md"
              >
                <span>Acessar Lista de Presentes</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
