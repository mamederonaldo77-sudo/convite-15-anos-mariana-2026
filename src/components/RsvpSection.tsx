import React, { useState } from 'react';
import { api } from '../services/api';
import { Sparkles, CheckCircle2, Send, Phone, User, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RsvpSectionProps {
  whatsappNumber: string;
  debutanteName: string;
  thankYouMessage?: string;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({ debutanteName, thankYouMessage }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const formatPhoneNumber = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 2) return raw;
    if (raw.length <= 7) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Por favor, informe o seu nome completo.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Por favor, informe seu telefone ou WhatsApp.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      // Persist to backend database
      await api.submitRsvp({
        name: name.trim(),
        guestsCount: 1,
        phone: phone.trim(),
        message: message.trim(),
      });

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#c084fc', '#e9d5ff', '#ffffff', '#a855f7'],
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao registrar confirmação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="rsvp" className="py-20 px-4 relative z-10 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/70 border border-purple-400/30 text-purple-200 text-xs uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>Sua presença é essencial</span>
        </div>
        <h2 className="font-cormorant text-4xl sm:text-6xl font-bold silver-text mb-3">
          Confirme sua presença
        </h2>
        <p className="font-script text-2xl sm:text-3xl text-purple-300/90 max-w-md mx-auto">
          Por favor, confirme até 25 de outubro de 2026 para que possamos recebê-lo com carinho
        </p>
      </div>

      <div className="silver-card rounded-3xl p-6 sm:p-10 border border-purple-400/30 shadow-2xl relative">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-purple-900/50 border border-purple-300 flex items-center justify-center text-purple-200 mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="font-cormorant text-3xl sm:text-4xl font-bold text-white mb-2">
              Presença Confirmada com Sucesso!
            </h3>
            <p className="text-purple-200 text-sm sm:text-base max-w-md mx-auto mb-6">
              {thankYouMessage ? (
                thankYouMessage.includes('{name}') ? (
                  thankYouMessage.split('{name}').map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && <strong>{name}</strong>}
                    </React.Fragment>
                  ))
                ) : (
                  <>
                    <strong>{name}</strong>, {thankYouMessage}
                  </>
                )
              ) : (
                <>
                  Obrigada pelo carinho, <strong>{name}</strong>! Sua presença tornará o {debutanteName || 'X V da Mari'} ainda mais especial e inesquecível.
                </>
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setSuccess(false);
                  setName('');
                  setPhone('');
                  setMessage('');
                }}
                className="px-6 py-2.5 rounded-full bg-purple-950/70 border border-purple-400/30 text-purple-200 text-xs uppercase tracking-wider font-semibold hover:bg-purple-900 transition-colors"
              >
                Confirmar Outro Convidado
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs sm:text-sm">
                {errorMsg}
              </div>
            )}

            {/* Nome Completo */}
            <div>
              <label className="block text-xs uppercase font-semibold tracking-wider text-purple-200 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Nome Completo *</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Carolina Silva"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-purple-400/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all text-sm sm:text-base"
              />
            </div>

            {/* Telefone / WhatsApp */}
            <div>
              <label className="block text-xs uppercase font-semibold tracking-wider text-purple-200 mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                <span>Telefone / WhatsApp *</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(11) 98765-4321"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-purple-400/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all text-sm sm:text-base"
              />
            </div>

            {/* Mensagem carinhosa (opcional) */}
            <div>
              <label className="block text-xs uppercase font-semibold tracking-wider text-purple-200 mb-2 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-purple-400" />
                <span>Mensagem ou Recadinho para a Mariana (opcional)</span>
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Deixe uma mensagem de carinho, votos ou aviso..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-purple-400/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all text-sm"
              />
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-indigo-600 text-white font-medium text-base shadow-xl shadow-purple-900/40 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4 text-purple-200" />
                <span>{isSubmitting ? 'Confirmando...' : 'Confirmar presença'}</span>
              </button>
            </div>

            <p className="text-center text-[11px] text-slate-400">
              Sua confirmação fica salva com segurança para a organização do cerimonial.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};
