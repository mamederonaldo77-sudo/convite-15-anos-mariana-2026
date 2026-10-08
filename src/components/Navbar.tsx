import React, { useState, useEffect } from 'react';
import { Music, VolumeX, Shield, Menu, X, CalendarHeart } from 'lucide-react';
import { MarianaLogo } from './MarianaLogo';

interface NavbarProps {
  onOpenAdmin: () => void;
  onOpenCustomizer?: () => void;
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  musicEnabled: boolean;
  isAdmin?: boolean;
  customLogoUrl?: string;
  debutanteName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdmin,
  isPlayingMusic,
  onToggleMusic,
  musicEnabled,
  customLogoUrl,
  debutanteName = 'Mariana Amorim',
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'INÍCIO', href: '#inicio' },
    { label: 'HISTÓRIA', href: '#historia' },
    { label: 'CONVITE/TEASER', href: '#videos' },
    { label: 'LOCAL', href: '#local' },
    { label: 'CONFIRMAR PRESENÇA', href: '#rsvp', highlight: true },
    { label: 'PRESENTES', href: '#presentes' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`transition-all duration-300 z-40 ${
        scrolled
          ? 'fixed top-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-b border-purple-400/20 shadow-xl shadow-purple-950/50 py-2 sm:py-2.5'
          : 'relative pt-3 sm:pt-4 pb-2 w-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* ============================================================ */}
        {/* COMPOSIÇÃO PRIORITÁRIA DO CABEÇALHO (QUANDO NO TOPO)         */}
        {/* 1. XV DA MARI (Tamanho reduzido, elegante e proporcional)     */}
        {/* 2. NOVA ARTE MARIANA AMORIM (Destaque principal, sem cortes)  */}
        {/* 3. CONTROLES / NAVEGAÇÃO (Abaixo da arte, sem sobreposição)   */}
        {/* ============================================================ */}
        {!scrolled && (
          <div className="flex flex-col items-center justify-center text-center w-full max-w-3xl mx-auto">
            {/* 1. TÍTULO REDUZIDO: XV DA MARI */}
            <div className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-1.5 animate-in fade-in duration-300">
              <span className="h-[1px] w-5 sm:w-10 bg-gradient-to-r from-transparent to-purple-400/60" />
              <h1 className="font-cinzel text-xs sm:text-sm md:text-base font-semibold tracking-[0.28em] sm:tracking-[0.32em] text-purple-200/90 uppercase select-none drop-shadow-sm">
                XV DA MARI
              </h1>
              <span className="h-[1px] w-5 sm:w-10 bg-gradient-to-l from-transparent to-purple-400/60" />
            </div>

            {/* 2. NOVA ARTE MARIANA AMORIM (Destaque absoluto, proporção original 1264x848 preservada) */}
            <div className="w-full flex items-center justify-center my-1 sm:my-2 animate-in fade-in zoom-in-95 duration-400">
              <a
                href="#inicio"
                onClick={(e) => handleLinkClick(e, '#inicio')}
                className="inline-block transition-transform duration-300 hover:scale-[1.02] focus:outline-none"
                aria-label="Mariana Amorim 15 Anos - Início"
              >
                <MarianaLogo customLogoUrl={customLogoUrl} size="header" showGlow={true} />
              </a>
            </div>

            {/* 3. CONTROLES / NAVEGAÇÃO (Posicionados exclusivamente abaixo da arte) */}
            <div className="w-full mt-2 sm:mt-3 flex flex-col items-center gap-2 sm:gap-3">
              {/* Desktop Nav Links Pill */}
              <nav className="hidden lg:flex items-center gap-1 sm:gap-2 px-6 py-2 rounded-full bg-slate-950/75 backdrop-blur-md border border-purple-400/30 shadow-xl shadow-purple-950/50">
                {navLinks.map((link, index) => (
                  <React.Fragment key={link.href}>
                    {index > 0 && (
                      <span className="text-purple-400/30 text-xs font-light select-none px-1" aria-hidden="true">
                        |
                      </span>
                    )}
                    <a
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className={`text-xs font-semibold tracking-[0.16em] uppercase transition-all duration-200 whitespace-nowrap ${
                        link.highlight
                          ? 'px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-purple-600/30 hover:brightness-110 active:scale-95 border border-purple-300/40'
                          : 'text-slate-200 hover:text-purple-200 px-2 py-1'
                      }`}
                    >
                      {link.label}
                    </a>
                  </React.Fragment>
                ))}
              </nav>

              {/* Action Controls Row (Discreto, compacto e elegante tanto em mobile quanto em desktop) */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                {musicEnabled && (
                  <button
                    type="button"
                    onClick={onToggleMusic}
                    title={isPlayingMusic ? 'Pausar música ambiente' : 'Tocar música ambiente'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950/70 border border-purple-400/30 text-purple-200 text-xs font-medium hover:bg-purple-900/60 hover:border-purple-300 transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    {isPlayingMusic ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                        <span className="text-[11px] sm:text-xs">Pausar Música</span>
                      </>
                    ) : (
                      <>
                        <Music className="w-3.5 h-3.5 text-purple-300" />
                        <span className="text-[11px] sm:text-xs">Tocar Música</span>
                      </>
                    )}
                  </button>
                )}

                {/* Mobile Quick RSVP Button */}
                <a
                  href="#rsvp"
                  onClick={(e) => handleLinkClick(e, '#rsvp')}
                  className="lg:hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-700 to-indigo-600 border border-purple-400/40 text-white text-[11px] sm:text-xs font-semibold shadow-md active:scale-95 transition-transform"
                >
                  <CalendarHeart className="w-3.5 h-3.5" />
                  <span>Presença</span>
                </a>

                {/* Painel de Controle */}
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  title="Painel de Controle"
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-slate-900/60 border border-purple-400/20 text-slate-300 hover:text-purple-200 hover:border-purple-300/40 transition-colors cursor-pointer flex items-center gap-1.5 text-xs shadow-sm"
                  aria-label="Acesso ao Painel de Controle"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-300" />
                  <span className="hidden sm:inline text-[11px]">Painel</span>
                </button>

                {/* Mobile Hamburger Drawer Trigger */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-1.5 rounded-full bg-slate-900/60 border border-purple-400/20 text-slate-200 hover:text-purple-200 cursor-pointer"
                  aria-label="Abrir menu de navegação"
                >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* NAVEGAÇÃO FIXA QUANDO A PÁGINA É ROLADA (SCROLLED)           */}
        {/* ============================================================ */}
        {scrolled && (
          <div className="flex items-center justify-between">
            {/* Left Brand: Compact official logo medallion + Name */}
            <a
              href="#inicio"
              onClick={(e) => handleLinkClick(e, '#inicio')}
              className="flex items-center gap-2.5 group"
            >
              <MarianaLogo customLogoUrl={customLogoUrl} size="sm" variant="compact" showGlow={false} />
              <div className="flex flex-col text-left">
                <span className="font-cinzel text-xs sm:text-sm tracking-[0.16em] font-bold text-white group-hover:text-purple-200 transition-colors">
                  MARIANA AMORIM
                </span>
                <span className="text-[10px] text-purple-300/80 font-medium tracking-widest uppercase -mt-0.5">
                  XV Anos
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 sm:gap-2 px-4 py-1.5 rounded-full bg-transparent">
              {navLinks.map((link, index) => (
                <React.Fragment key={link.href}>
                  {index > 0 && (
                    <span className="text-purple-400/30 text-xs font-light select-none px-1" aria-hidden="true">
                      |
                    </span>
                  )}
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={`text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-200 whitespace-nowrap ${
                      link.highlight
                        ? 'px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-600/30 hover:brightness-110 active:scale-95'
                        : 'text-slate-200 hover:text-purple-200 px-2 py-1'
                    }`}
                  >
                    {link.label}
                  </a>
                </React.Fragment>
              ))}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {musicEnabled && (
                <button
                  type="button"
                  onClick={onToggleMusic}
                  title={isPlayingMusic ? 'Pausar música' : 'Tocar música'}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950/70 border border-purple-400/30 text-purple-200 text-xs font-medium hover:bg-purple-900/60 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  {isPlayingMusic ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                      <span className="hidden sm:inline">Pausar</span>
                    </>
                  ) : (
                    <>
                      <Music className="w-3.5 h-3.5 text-purple-300" />
                      <span className="hidden sm:inline">Música</span>
                    </>
                  )}
                </button>
              )}

              <a
                href="#rsvp"
                onClick={(e) => handleLinkClick(e, '#rsvp')}
                className="lg:hidden flex items-center justify-center p-2 rounded-full bg-purple-700/80 text-white shadow-md"
                title="Confirmar Presença"
              >
                <CalendarHeart className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onOpenAdmin}
                title="Painel de Controle"
                className="p-2 rounded-full text-slate-400 hover:text-purple-300 hover:bg-purple-950/40 transition-colors cursor-pointer"
                aria-label="Painel de Controle"
              >
                <Shield className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-200 hover:text-purple-200 cursor-pointer"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[60px] bg-slate-950/98 backdrop-blur-2xl border-b border-purple-500/30 px-6 py-6 shadow-2xl animate-in slide-in-from-top-4 z-50">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`text-xs font-semibold tracking-wider py-2.5 px-4 rounded-xl transition-colors uppercase ${
                  link.highlight
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-bold text-center shadow-md'
                    : 'text-slate-200 hover:bg-purple-950/50 hover:text-purple-200'
                }`}
              >
                {link.label}
              </a>
            ))}

            <div className="pt-3 border-t border-purple-900/40 flex items-center justify-between">
              <span className="text-xs text-slate-400">Acesso Restrito</span>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="text-xs font-medium text-purple-300 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" /> Painel de Controle
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
