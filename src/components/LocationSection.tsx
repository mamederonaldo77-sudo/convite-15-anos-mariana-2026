import React from 'react';
import { MapPin, Navigation, Calendar, Clock, Sparkles } from 'lucide-react';

interface LocationSectionProps {
  venueName: string;
  venueAddress: string;
  mapsUrl: string;
  eventDateStr: string;
  dressCode?: string;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  venueName,
  venueAddress,
  mapsUrl,
  eventDateStr,
  dressCode,
}) => {
  const handleAddToCalendar = () => {
    // Generate Google Calendar Event Link
    const title = encodeURIComponent('X V da Mari - Meus 15 Anos');
    const details = encodeURIComponent(
      `Celebração inesquecível do X V da Mari no ${venueName}. Esperamos você!`
    );
    const location = encodeURIComponent(`${venueName}, ${venueAddress}`);
    // 2026-11-13 20:00 to 2026-11-14 03:00 (UTC approx or local)
    const dates = '20261113T230000Z/20261114T060000Z';
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
    window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenMaps = () => {
    const url = mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venueName} ${venueAddress}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="local" className="py-20 px-4 relative z-10 max-w-5xl mx-auto">
      {/* Title */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/70 border border-purple-400/30 text-purple-200 text-xs uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>Onde e Quando</span>
        </div>
        <h2 className="font-cormorant text-4xl sm:text-6xl font-bold silver-text mb-3">
          Espero você lá!
        </h2>
        <p className="font-script text-2xl sm:text-3xl text-purple-300/90 max-w-lg mx-auto">
          Um espaço preparado para receber quem mais amamos com muito requinte
        </p>
      </div>

      {/* Main Venue Card */}
      <div className="silver-card rounded-3xl p-6 sm:p-10 border border-purple-400/30 shadow-2xl relative overflow-hidden">
        {/* Decorative corner glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Info Details */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-purple-300">
                Local da Celebração
              </span>
              <h3 className="font-cinzel text-3xl sm:text-4xl font-bold text-white mt-1">
                {venueName || 'Espaço 277'}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base mt-2 flex items-start gap-2">
                <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>{venueAddress || 'Rua do Imperador, 277 - Viga, Nova Iguaçu - RJ'}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-purple-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-purple-300/80 uppercase font-medium">Data</span>
                  <span className="text-sm sm:text-base font-semibold text-white">13 Nov 2026</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-purple-300/80 uppercase font-medium">Início</span>
                  <span className="text-sm sm:text-base font-semibold text-white">20:00 Pontual</span>
                </div>
              </div>
            </div>

            {/* Dress code advisory */}
            <div className="rounded-xl bg-purple-950/40 border border-purple-400/20 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 block mb-1">
                Traje Sugerido
              </span>
              <p className="text-xs sm:text-sm text-slate-200">
                <strong>{dressCode || 'Passeio Completo / Social Elegante'}.</strong>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleOpenMaps}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-medium text-sm sm:text-base shadow-lg shadow-purple-900/40 hover:shadow-purple-700/50 hover:brightness-110 active:scale-95 transition-all"
              >
                <Navigation className="w-4 h-4 text-purple-200" />
                <span>Como chegar</span>
              </button>

              <button
                onClick={handleAddToCalendar}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-slate-900/80 border border-purple-400/30 text-purple-200 hover:text-white hover:bg-purple-950 transition-colors text-sm font-medium"
              >
                <Calendar className="w-4 h-4" />
                <span>Salvar na Agenda</span>
              </button>
            </div>
          </div>

          {/* Visual Map / Venue Card Preview */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-square bg-slate-950 border border-purple-400/20 shadow-xl group">
            {/* Elegant map illustration or static mockup */}
            <div className="w-full h-full bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 p-[2px] shadow-lg shadow-purple-600/40 mb-3 animate-bounce">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-purple-300" />
                </div>
              </div>

              <h4 className="font-cinzel text-xl font-bold text-white mb-1">
                {venueName || 'Espaço 277'}
              </h4>
              <p className="text-xs text-purple-300/80 max-w-xs mb-4">
                {venueAddress || 'Pronto para receber você e sua família'}
              </p>

              <button
                onClick={handleOpenMaps}
                className="px-4 py-2 rounded-full bg-purple-900/60 border border-purple-400/40 text-purple-200 text-xs font-semibold hover:bg-purple-800 transition-colors"
              >
                Abrir no Google Maps / Waze
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
