/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { EventSettings, GalleryItem, TimelineStage, VideoItem } from './types';
import { api, getStoredToken, removeStoredToken } from './services/api';
import { applyThemeToDocument } from './utils/theme';

import { SparklesBackground } from './components/SparklesBackground';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CountdownSection } from './components/CountdownSection';
import { TimelineSection } from './components/TimelineSection';
import { VideoSection } from './components/VideoSection';
import { LocationSection } from './components/LocationSection';
import { RsvpSection } from './components/RsvpSection';
import { GiftsSection } from './components/GiftsSection';
import { MusicPlayer } from './components/MusicPlayer';
import { LightboxModal } from './components/LightboxModal';
import { AdminModal } from './components/AdminModal';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { Footer } from './components/Footer';
import { FadeInView } from './components/FadeInView';
import { Sparkles } from 'lucide-react';

const FALLBACK_SETTINGS: EventSettings = {
  debutanteName: 'X V da Mari',
  eventTitle: 'Meus 15 anos',
  eventDate: '2026-11-13T20:00:00',
  venueName: 'Espaço 277',
  venueAddress: 'Rua do Imperador, 277 - Viga, Nova Iguaçu - RJ',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+do+Imperador%2C+277+-+Viga%2C+Nova+Igua%C3%A7u+-+RJ',
  whatsappNumber: '5511987654321',
  whatsappMessage: 'Olá! Gostaria de confirmar minha presença no X V da Mari!',
  pixKey: 'mariana.amorim15anos@gmail.com',
  pixKeyType: 'email',
  pixBeneficiary: 'X V da Mari',
  pixBank: 'Banco Inter',
  showGiftList: true,
  enableMusic: true,
  musicTitle: 'All of Me (Piano Instrumental)',
  musicUrl: '/audio/all-of-me-piano.mp3',
  adminPin: 'mariana15',
  dressCode: 'Esporte Fino / Traje de Gala',
  themePreset: 'lilas-prata',
  bgColor: '#0b0813',
  accentLilac: '#c084fc',
  accentSecondary: '#e9d5ff',
  fontTitle: 'Cinzel',
  fontBody: 'Montserrat',
  heroSubtitle: '',
  footerQuote: 'Obrigada por fazer parte da minha história e por caminhar comigo até a realização desse grande sonho.',
};

export default function App() {
  const [settings, setSettings] = useState<EventSettings>(FALLBACK_SETTINGS);
  const [timeline, setTimeline] = useState<TimelineStage[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Music state
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Lightbox state
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title?: string;
    caption?: string;
  }>({
    isOpen: false,
    imageUrl: '',
  });

  // Admin auth state - exclusively enables customizer button
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return Boolean(getStoredToken());
  });

  // Admin modal state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, timelineRes, galleryRes, videosRes] = await Promise.all([
          api.getSettings().catch(() => FALLBACK_SETTINGS),
          api.getTimeline().catch(() => []),
          api.getGallery().catch(() => []),
          api.getVideos().catch(() => []),
        ]);

        setSettings(settingsRes);
        applyThemeToDocument(settingsRes);
        setTimeline(timelineRes);
        setGallery(galleryRes);
        setVideos(videosRes);
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    // Verify admin token if present
    const token = getStoredToken();
    if (token) {
      api.verifyAdmin().then((isValid) => {
        setIsAdminAuthenticated(isValid);
        if (!isValid) removeStoredToken();
      }).catch(() => {
        setIsAdminAuthenticated(false);
      });
    }

    // Check if URL has #admin or #config/#personalizar hash
    if (window.location.hash === '#admin') {
      setIsAdminOpen(true);
    } else if (window.location.hash === '#config' || window.location.hash === '#personalizar') {
      if (getStoredToken()) {
        setIsCustomizerOpen(true);
      } else {
        // If not authenticated, open admin login modal so only admin has access
        setIsAdminOpen(true);
      }
    }
  }, []);

  // Whenever settings change, ensure dynamic theme is propagated to document
  useEffect(() => {
    applyThemeToDocument(settings);
  }, [settings]);

  const handleEnterCelebration = () => {
    // If music is enabled and not yet playing, start music on user interaction
    if (settings.enableMusic && !isPlayingMusic) {
      setIsPlayingMusic(true);
    }

    // Smooth scroll down to countdown / content
    const nextElem = document.querySelector('#contagem');
    if (nextElem) {
      nextElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openLightbox = (imageUrl: string, title?: string, caption?: string) => {
    setLightboxState({
      isOpen: true,
      imageUrl,
      title,
      caption,
    });
  };

  const closeLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="w-16 h-16 rounded-full border-2 border-purple-400/30 border-t-purple-300 animate-spin flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-purple-300 animate-pulse" />
        </div>
        <h2 className="font-cormorant text-2xl silver-text tracking-wide">
          X V da Mari • 15 Anos
        </h2>
        <p className="text-xs text-purple-300/70 tracking-widest uppercase mt-1">
          Preparando celebração...
        </p>
      </main>
    );
  }

  return (
    <div
      className="relative min-h-screen text-slate-100 transition-colors duration-500 selection:bg-purple-400 selection:text-purple-950"
      style={{
        backgroundColor: settings.bgColor || '#0b0813',
        fontFamily: settings.fontBody || 'Montserrat, sans-serif',
      }}
    >
      {/* Background ambient lighting and sparkles */}
      <SparklesBackground
        accentColor={settings.accentLilac}
        secondaryColor={settings.accentSecondary}
      />

      {/* Header Navigation with Admin-exclusive customizer access */}
      <Navbar
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        isPlayingMusic={isPlayingMusic}
        onToggleMusic={() => setIsPlayingMusic(!isPlayingMusic)}
        musicEnabled={settings.enableMusic}
        isAdmin={isAdminAuthenticated}
        customLogoUrl={settings.customLogoUrl}
        debutanteName={settings.debutanteName}
      />

      {/* Main Content Sections */}
      <main className="relative z-10">
        {/* Hero Opening Curtain */}
        <HeroSection
          debutanteName={settings.debutanteName}
          eventTitle={settings.eventTitle}
          eventDate={settings.eventDate}
          venueName={settings.venueName}
          venueAddress={settings.venueAddress}
          dressCode={settings.dressCode}
          heroPhotos={settings.heroPhotos}
          heroAutoPlay={settings.heroAutoPlay}
          heroInterval={settings.heroInterval}
          fontTitle={settings.fontTitle}
          onEnterCelebration={handleEnterCelebration}
        />

        {/* Realtime Countdown */}
        <FadeInView direction="up">
          <CountdownSection targetDateStr={settings.eventDate} />
        </FadeInView>

        {/* Retrospective Timeline Stages - Uma história que merece ser contada */}
        <FadeInView direction="up">
          <TimelineSection stages={timeline} onOpenLightbox={openLightbox} />
        </FadeInView>

        {/* AI & Memory Videos */}
        <FadeInView direction="up">
          <VideoSection videos={videos} />
        </FadeInView>

        {/* Venue Location & Directions */}
        <FadeInView direction="up">
          <LocationSection
            venueName={settings.venueName}
            venueAddress={settings.venueAddress}
            mapsUrl={settings.mapsUrl}
            eventDateStr={settings.eventDate}
            dressCode={settings.dressCode}
          />
        </FadeInView>

        {/* RSVP Confirmation */}
        <FadeInView direction="up">
          <RsvpSection
            whatsappNumber={settings.whatsappNumber}
            debutanteName={settings.debutanteName}
            thankYouMessage={settings.rsvpThankYouMessage}
          />
        </FadeInView>

        {/* Gift List / Pix */}
        <FadeInView direction="up">
          <GiftsSection
            showGiftList={settings.showGiftList}
            pixKey={settings.pixKey}
            pixBeneficiary={settings.pixBeneficiary}
            pixBank={settings.pixBank}
            giftRegistryUrl={settings.giftRegistryUrl}
          />
        </FadeInView>
      </main>

      {/* Footer */}
      <FadeInView direction="up">
        <Footer
          debutanteName={settings.debutanteName}
          venueName={settings.venueName}
          footerQuote={settings.footerQuote}
          customLogoUrl={settings.customLogoUrl}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
      </FadeInView>

      {/* Ambient Background Music Player */}
      <MusicPlayer
        musicUrl={settings.musicUrl}
        musicTitle={settings.musicTitle}
        isPlaying={isPlayingMusic}
        onTogglePlay={() => setIsPlayingMusic(!isPlayingMusic)}
        enabled={settings.enableMusic}
      />

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxState.isOpen}
        imageUrl={lightboxState.imageUrl}
        title={lightboxState.title}
        caption={lightboxState.caption}
        onClose={closeLightbox}
      />

      {/* Protected Admin Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onLoginSuccess={(isAuthed) => setIsAdminAuthenticated(isAuthed)}
        settings={settings}
        onSettingsUpdated={(newSettings) => setSettings(newSettings)}
        gallery={gallery}
        onGalleryUpdated={(newGallery) => setGallery(newGallery)}
        videos={videos}
        onVideosUpdated={(newVideos) => setVideos(newVideos)}
        timeline={timeline}
        onTimelineUpdated={(newTimeline) => setTimeline(newTimeline)}
      />

      {/* Visual Theme & Texts Customizer Modal */}
      <ThemeCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        settings={settings}
        onSettingsUpdated={(newSettings) => setSettings(newSettings)}
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminAuthenticated={(authed) => setIsAdminAuthenticated(authed)}
      />
    </div>
  );
}
