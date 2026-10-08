import React, { useState, useEffect } from 'react';
import { Sparkles, PartyPopper } from 'lucide-react';

interface CountdownSectionProps {
  targetDateStr: string; // e.g. "2026-11-13T20:00:00"
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  hasStarted: boolean;
}

export const CountdownSection: React.FC<CountdownSectionProps> = ({ targetDateStr }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    hasStarted: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const targetTime = new Date(targetDateStr).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          hasStarted: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        hasStarted: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  return (
    <section id="contagem" className="py-16 sm:py-20 px-4 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        {/* Subtle heading */}
        <div className="inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-widest text-purple-300 font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Faltam poucos passos para o grande dia</span>
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        </div>

        <h2 className="font-cinzel text-2xl sm:text-4xl font-semibold silver-text mb-8">
          Contagem Regressiva
        </h2>

        {timeLeft.hasStarted ? (
          <div className="silver-card rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto border border-purple-400/40 shadow-2xl">
            <PartyPopper className="w-14 h-14 text-purple-300 mx-auto mb-4 animate-bounce" />
            <h3 className="font-cormorant text-3xl sm:text-5xl text-white font-bold mb-3">
              A celebração começou!
            </h3>
            <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
              Hoje celebramos o X V da Mari com muito amor, música e alegria no Espaço 277! Seja bem-vindo à nossa festa inesquecível!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 max-w-3xl mx-auto">
            {/* Dias */}
            <div className="silver-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-purple-300/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-cinzel text-4xl sm:text-6xl font-bold silver-text tracking-tight mb-1">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-xs sm:text-sm font-medium tracking-wider uppercase text-purple-300/80">
                Dias
              </span>
            </div>

            {/* Horas */}
            <div className="silver-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-purple-300/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-cinzel text-4xl sm:text-6xl font-bold silver-text tracking-tight mb-1">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-xs sm:text-sm font-medium tracking-wider uppercase text-purple-300/80">
                Horas
              </span>
            </div>

            {/* Minutos */}
            <div className="silver-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-purple-300/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-cinzel text-4xl sm:text-6xl font-bold silver-text tracking-tight mb-1">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-xs sm:text-sm font-medium tracking-wider uppercase text-purple-300/80">
                Minutos
              </span>
            </div>

            {/* Segundos */}
            <div className="silver-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-purple-300/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-cinzel text-4xl sm:text-6xl font-bold silver-text tracking-tight mb-1 text-purple-300">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-xs sm:text-sm font-medium tracking-wider uppercase text-purple-300/80">
                Segundos
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
