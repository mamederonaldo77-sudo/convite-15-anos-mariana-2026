import React, { useState, useEffect, useRef } from 'react';
import {
  EventSettings,
  GalleryItem,
  VideoItem,
  RSVPConfirmation,
  TimelineStage,
} from '../types';
import { api, getStoredToken, removeStoredToken } from '../services/api';
import { applyThemeToDocument, THEME_PRESETS } from '../utils/theme';
import {
  X,
  Lock,
  LogOut,
  Upload,
  Trash2,
  Settings,
  Video,
  Users,
  Calendar,
  Cloud,
  Check,
  Plus,
  RefreshCw,
  Download,
  AlertCircle,
  Eye,
  Sliders,
  Sparkles,
  Palette,
  BookOpen,
  Image as ImageIcon,
  Play,
  ExternalLink,
  Film,
  ArrowUp,
  ArrowDown,
  ImagePlus,
  Crop,
  Camera,
  Scissors,
} from 'lucide-react';
import { ImageEditorModal, ImageEditorTarget } from './ImageEditorModal';


interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomizer?: () => void;
  onLoginSuccess?: (isAuthed: boolean) => void;
  settings: EventSettings;
  onSettingsUpdated: (newSettings: EventSettings) => void;
  gallery: GalleryItem[];
  onGalleryUpdated: (newGallery: GalleryItem[]) => void;
  videos: VideoItem[];
  onVideosUpdated: (newVideos: VideoItem[]) => void;
  timeline: TimelineStage[];
  onTimelineUpdated: (newTimeline: TimelineStage[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onOpenCustomizer,
  onLoginSuccess,
  settings,
  onSettingsUpdated,
  videos,
  onVideosUpdated,
  timeline,
  onTimelineUpdated,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<
    'rsvps' | 'images' | 'heroPhotos' | 'videos' | 'timeline' | 'appearance' | 'settings' | 'cloud'
  >('rsvps');

  // Image Editor modal & Manager states
  const [editorTarget, setEditorTarget] = useState<ImageEditorTarget | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [imagesFilter, setImagesFilter] = useState<'all' | 'header_footer' | 'hero' | 'video' | 'timeline' | 'gallery'>('all');
  const [capturingFrameVideoId, setCapturingFrameVideoId] = useState<string | null>(null);
  const [videoFrameTimeInput, setVideoFrameTimeInput] = useState<{ [id: string]: number }>({});


  // RSVP state
  const [rsvps, setRsvps] = useState<RSVPConfirmation[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(false);
  const [confirmDeleteRsvpId, setConfirmDeleteRsvpId] = useState<string | null>(null);

  // Forms & Loading
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Hero Photos state (Página Inicial)
  const defaultHeroPhotos = [
    '/images/regenerated_image_1791396965326.jpg',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1920&q=85',
  ];
  const [heroPhotosList, setHeroPhotosList] = useState<string[]>(
    settings.heroPhotos && settings.heroPhotos.length > 0 ? settings.heroPhotos : defaultHeroPhotos
  );
  const [heroAutoPlay, setHeroAutoPlay] = useState<boolean>(settings.heroAutoPlay !== false);
  const [heroInterval, setHeroInterval] = useState<number>(settings.heroInterval || 4.5);
  const [newHeroPhotoUrl, setNewHeroPhotoUrl] = useState('');
  const [isUploadingHeroPhoto, setIsUploadingHeroPhoto] = useState(false);
  const [heroPhotoUploadProgress, setHeroPhotoUploadProgress] = useState(0);
  const [confirmDeleteHeroIdx, setConfirmDeleteHeroIdx] = useState<number | null>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const replaceHeroFileInputRef = useRef<HTMLInputElement>(null);
  const [replaceHeroIdx, setReplaceHeroIdx] = useState<number | null>(null);

  // Arts & Branding uploads
  const [isUploadingArt, setIsUploadingArt] = useState(false);
  const [artUploadKey, setArtUploadKey] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const bgTextureFileInputRef = useRef<HTMLInputElement>(null);
  const footerArtFileInputRef = useRef<HTMLInputElement>(null);

  // RSVP Thank You message local state
  const [rsvpThankYouInput, setRsvpThankYouInput] = useState(
    settings.rsvpThankYouMessage || 'Obrigada pelo carinho, {name}! Sua presença tornará o X V da Mari ainda mais especial e inesquecível.'
  );

  // Timeline / Story state
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [newStagePhotoFile, setNewStagePhotoFile] = useState<File | null>(null);
  const [newStagePhotoUrl, setNewStagePhotoUrl] = useState('');
  const [newStagePhotoCaption, setNewStagePhotoCaption] = useState('');
  const [isUploadingStagePhoto, setIsUploadingStagePhoto] = useState(false);
  const stageFileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDeleteStageId, setConfirmDeleteStageId] = useState<string | null>(null);

  // Video state & dedicated upload refs
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');
  const [newVideoIsAi, setNewVideoIsAi] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgressPercent, setUploadProgressPercent] = useState<number>(0);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [activeUploadingKey, setActiveUploadingKey] = useState<string | null>(null);
  const [inviteUrlInput, setInviteUrlInput] = useState('');
  const [teaserUrlInput, setTeaserUrlInput] = useState('');
  const [editingUrlMap, setEditingUrlMap] = useState<Record<string, string>>({});
  const specialInviteFileInputRef = useRef<HTMLInputElement>(null);
  const teaserFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDeleteVideoId, setConfirmDeleteVideoId] = useState<string | null>(null);

  // Settings form local state
  const [localSettings, setLocalSettings] = useState<EventSettings>(settings);
  const [newAdminPin, setNewAdminPin] = useState('');

  // Check existing token on open
  useEffect(() => {
    if (isOpen) {
      const token = getStoredToken();
      if (token) {
        api.verifyAdmin().then((isValid) => {
          setIsAuthenticated(isValid);
          onLoginSuccess?.(isValid);
          if (isValid) loadRsvps();
        });
      }
    }
  }, [isOpen]);

  useEffect(() => {
    setLocalSettings(settings);
    if (settings.heroPhotos && settings.heroPhotos.length > 0) {
      setHeroPhotosList(settings.heroPhotos);
    }
    setHeroAutoPlay(settings.heroAutoPlay !== false);
    if (settings.heroInterval) setHeroInterval(settings.heroInterval);
    if (settings.rsvpThankYouMessage) setRsvpThankYouInput(settings.rsvpThankYouMessage);
  }, [settings]);

  useEffect(() => {
    if (timeline.length > 0 && !selectedStageId) {
      setSelectedStageId(timeline[0].id);
    }
  }, [timeline, selectedStageId]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await api.loginAdmin(pinInput);
      if (res.success) {
        setIsAuthenticated(true);
        onLoginSuccess?.(true);
        setPinInput('');
        loadRsvps();
        showNotification('Acesso administrativo concedido!');
      } else {
        setLoginError(res.message || 'Senha incorreta.');
      }
    } catch {
      setLoginError('Erro de conexão ao verificar senha.');
    }
  };

  const handleLogout = () => {
    removeStoredToken();
    setIsAuthenticated(false);
    onLoginSuccess?.(false);
    showNotification('Sessão encerrada com sucesso.');
  };

  const loadRsvps = async () => {
    setLoadingRsvps(true);
    try {
      const data = await api.getRsvps();
      setRsvps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRsvps(false);
    }
  };

  // RSVP Deletion (No window.confirm, direct safe inline delete)
  const handleDeleteRsvp = async (id: string) => {
    try {
      await api.deleteRsvp(id);
      setRsvps((prev) => prev.filter((r) => r.id !== id));
      setConfirmDeleteRsvpId(null);
      showNotification('Confirmação excluída com sucesso.');
    } catch {
      showNotification('Falha ao excluir confirmação.', 'error');
    }
  };

  const handleExportRsvpsCsv = () => {
    if (rsvps.length === 0) return;
    const headers = ['Nome', 'Telefone', 'Mensagem', 'Data Confirmacao'];
    const rows = rsvps.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.phone}"`,
      `"${(r.message || '').replace(/"/g, '""')}"`,
      `"${new Date(r.confirmedAt).toLocaleString('pt-BR')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `confirmacoes-15anos-mariana-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // RSVP THANK YOU MESSAGE
  // ==========================================
  const handleSaveThankYouMessage = async () => {
    try {
      const updated = await api.updateSettings({
        rsvpThankYouMessage: rsvpThankYouInput.trim(),
      });
      setLocalSettings(updated);
      onSettingsUpdated(updated);
      showNotification('Mensagem de agradecimento salva com sucesso!');
    } catch (err: any) {
      showNotification(err.message || 'Erro ao salvar mensagem de agradecimento.', 'error');
    }
  };

  // ==========================================
  // HERO PHOTOS (PÁGINA INICIAL)
  // ==========================================
  const handleSaveHeroSettings = async (
    newPhotos = heroPhotosList,
    autoPlay = heroAutoPlay,
    interval = heroInterval
  ) => {
    try {
      const updated = await api.updateSettings({
        heroPhotos: newPhotos,
        heroAutoPlay: autoPlay,
        heroInterval: Number(interval) || 4.5,
      });
      setLocalSettings(updated);
      onSettingsUpdated(updated);
      showNotification('Fotos da página inicial salvas com sucesso!');
    } catch (err: any) {
      showNotification(err.message || 'Erro ao salvar fotos da página inicial.', 'error');
    }
  };

  const handleAddHeroPhotoUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newHeroPhotoUrl.trim();
    if (!clean) return;
    const updated = [...heroPhotosList, clean];
    setHeroPhotosList(updated);
    setNewHeroPhotoUrl('');
    await handleSaveHeroSettings(updated);
  };

  const handleUploadHeroPhoto = async (file: File) => {
    if (!file) return;
    setIsUploadingHeroPhoto(true);
    setHeroPhotoUploadProgress(0);
    try {
      const res = await api.uploadMedia(file, (percent) => {
        setHeroPhotoUploadProgress(percent);
      });
      const updated = [...heroPhotosList, res.url];
      setHeroPhotosList(updated);
      await handleSaveHeroSettings(updated);
      showNotification('Nova foto adicionada ao carrossel inicial!');
    } catch (err: any) {
      showNotification(err.message || 'Erro ao fazer upload da foto.', 'error');
    } finally {
      setIsUploadingHeroPhoto(false);
      setHeroPhotoUploadProgress(0);
      if (heroFileInputRef.current) heroFileInputRef.current.value = '';
    }
  };

  const handleReplaceHeroPhoto = async (index: number, file: File) => {
    if (!file || index < 0 || index >= heroPhotosList.length) return;
    setIsUploadingHeroPhoto(true);
    setHeroPhotoUploadProgress(0);
    try {
      const res = await api.uploadMedia(file, (percent) => {
        setHeroPhotoUploadProgress(percent);
      });
      const updated = [...heroPhotosList];
      updated[index] = res.url;
      setHeroPhotosList(updated);
      await handleSaveHeroSettings(updated);
      showNotification(`Foto ${index + 1} substituída com sucesso!`);
    } catch (err: any) {
      showNotification(err.message || 'Erro ao substituir foto.', 'error');
    } finally {
      setIsUploadingHeroPhoto(false);
      setReplaceHeroIdx(null);
      setHeroPhotoUploadProgress(0);
      if (replaceHeroFileInputRef.current) replaceHeroFileInputRef.current.value = '';
    }
  };

  const handleDeleteHeroPhoto = async (index: number) => {
    if (heroPhotosList.length <= 1) {
      showNotification('É necessário manter pelo menos uma foto no carrossel.', 'error');
      setConfirmDeleteHeroIdx(null);
      return;
    }
    const updated = heroPhotosList.filter((_, i) => i !== index);
    setHeroPhotosList(updated);
    setConfirmDeleteHeroIdx(null);
    await handleSaveHeroSettings(updated);
    showNotification('Foto removida da página inicial.');
  };

  const handleMoveHeroPhoto = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= heroPhotosList.length) return;
    const updated = [...heroPhotosList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setHeroPhotosList(updated);
    await handleSaveHeroSettings(updated);
    showNotification(`Ordem das fotos atualizada (${direction === 'up' ? 'subiu' : 'desceu'}).`);
  };

  // ==========================================
  // IMAGE MANAGER & REAL FRAME EXTRACTION
  // ==========================================
  const handleOpenEditor = (target: ImageEditorTarget) => {
    setEditorTarget(target);
    setIsEditorOpen(true);
  };

  const handleEditorSaveSuccess = async (target: ImageEditorTarget, newUrl: string) => {
    if (target.category === 'header' || target.category === 'footer') {
      const updated = await api.updateSettings({ customLogoUrl: newUrl });
      setLocalSettings(updated);
      onSettingsUpdated(updated);
      showNotification(`Identidade visual oficial ("${target.title}") atualizada com sucesso!`);
    } else if (target.category === 'hero') {
      const idx = parseInt(target.id.replace('hero-', ''), 10);
      const updatedList = [...heroPhotosList];
      if (!isNaN(idx) && idx >= 0 && idx < updatedList.length) {
        updatedList[idx] = newUrl;
      } else {
        updatedList.push(newUrl);
      }
      setHeroPhotosList(updatedList);
      await handleSaveHeroSettings(updatedList);
      showNotification(`Foto da Página Inicial atualizada com sucesso!`);
    } else if (target.category === 'video') {
      const vidId = target.id.replace('video-thumb-', '');
      const vid = videos.find((v) => v.id === vidId) || videos[0];
      if (vid) {
        const updatedVid = await api.updateVideo(vid.id, { thumbnailUrl: newUrl });
        const newVids = videos.map((v) => (v.id === vid.id ? updatedVid : v));
        setVideos(newVids);
        onVideosUpdated(newVids);
        showNotification(`Capa do vídeo "${vid.title || 'Vídeo'}" atualizada com sucesso!`);
      }
    } else if (target.category === 'gallery') {
      const galId = target.id.replace('gal-', '');
      const newGallery = gallery.map((g) => (g.id === galId ? { ...g, url: newUrl } : g));
      setGallery(newGallery);
      onGalleryUpdated(newGallery);
      showNotification(`Foto da Galeria atualizada com sucesso!`);
    } else if (target.category === 'timeline') {
      const parts = target.id.replace('timeline-', '').split('-');
      const stageId = parts[0];
      const photoId = parts.slice(1).join('-');
      const newTimeline = timeline.map((stage) => {
        if (stage.id === stageId) {
          return {
            ...stage,
            photos: stage.photos.map((p) => (p.id === photoId ? { ...p, url: newUrl } : p)),
          };
        }
        return stage;
      });
      setTimeline(newTimeline);
      onTimelineUpdated(newTimeline);
      await api.updateTimeline(newTimeline);
      showNotification(`Foto da história atualizada com sucesso!`);
    }
  };

  const handleCaptureVideoFrame = async (videoId: string, videoUrl: string, timestamp = 1) => {
    setCapturingFrameVideoId(videoId);
    try {
      const res = await api.extractVideoFrame({
        videoUrl,
        timestamp,
        videoId,
      });
      const newVids = videos.map((v) =>
        v.id === videoId ? { ...v, thumbnailUrl: res.thumbnailUrl } : v
      );
      setVideos(newVids);
      onVideosUpdated(newVids);
      showNotification('Frame real do vídeo capturado com sucesso como capa oficial!');
    } catch (err: any) {
      showNotification(err.message || 'Falha ao extrair frame real do vídeo.', 'error');
    } finally {
      setCapturingFrameVideoId(null);
    }
  };

  // ==========================================
  // ARTS & BRANDING (CUSTOM LOGO, BG TEXTURE, FOOTER ART)
  // ==========================================

  const handleUploadArt = async (type: 'logo' | 'bgTexture' | 'footerArt', file: File) => {
    if (!file) return;
    setIsUploadingArt(true);
    setArtUploadKey(type);
    try {
      const res = await api.uploadMedia(file);
      let payload: Partial<EventSettings> = {};
      if (type === 'logo') payload = { customLogoUrl: res.url };
      else if (type === 'bgTexture') payload = { bgTextureUrl: res.url };
      else if (type === 'footerArt') payload = { footerArtUrl: res.url };

      const updated = await api.updateSettings(payload);
      setLocalSettings(updated);
      onSettingsUpdated(updated);
      showNotification('Arte atualizada com sucesso!');
    } catch (err: any) {
      showNotification(err.message || 'Erro ao enviar arquivo.', 'error');
    } finally {
      setIsUploadingArt(false);
      setArtUploadKey(null);
    }
  };

  const handleRemoveArt = async (type: 'logo' | 'bgTexture' | 'footerArt') => {
    try {
      let payload: Partial<EventSettings> = {};
      if (type === 'logo') payload = { customLogoUrl: '' };
      else if (type === 'bgTexture') payload = { bgTextureUrl: '' };
      else if (type === 'footerArt') payload = { footerArtUrl: '' };

      const updated = await api.updateSettings(payload);
      setLocalSettings(updated);
      onSettingsUpdated(updated);
      showNotification('Arte removida / restaurado padrão.');
    } catch (err: any) {
      showNotification(err.message || 'Erro ao remover arte.', 'error');
    }
  };

  // ==========================================
  // TIMELINE / UMA HISTÓRIA QUE MERECE SER CONTADA
  // ==========================================
  const currentStage = timeline.find((s) => s.id === selectedStageId) || timeline[0];

  const handleUpdateCurrentStageField = (field: 'title' | 'subtitle' | 'description', value: string) => {
    if (!currentStage) return;
    const updated = timeline.map((s) => (s.id === currentStage.id ? { ...s, [field]: value } : s));
    onTimelineUpdated(updated);
  };

  const handleSaveTimelineToBackend = async (stagesToSave = timeline) => {
    try {
      await api.updateTimeline(stagesToSave);
      onTimelineUpdated(stagesToSave);
      showNotification('História atualizada com sucesso!');
    } catch {
      showNotification('Erro ao salvar história.', 'error');
    }
  };

  const handleAddStage = async () => {
    const newStage: TimelineStage = {
      id: 'stage-' + Date.now(),
      title: 'Novo Capítulo',
      subtitle: 'Memórias inesquecíveis',
      description: 'Escreva aqui a descrição deste momento marcante...',
      order: timeline.length + 1,
      photos: [],
    };
    const updated = [...timeline, newStage];
    setSelectedStageId(newStage.id);
    await handleSaveTimelineToBackend(updated);
  };

  const handleDeleteStage = async (stageId: string) => {
    if (timeline.length <= 1) {
      showNotification('Mantenha ao menos um capítulo da história.', 'error');
      return;
    }
    const updated = timeline.filter((s) => s.id !== stageId);
    setConfirmDeleteStageId(null);
    setSelectedStageId(updated[0]?.id || '');
    await handleSaveTimelineToBackend(updated);
  };

  const handleAddPhotoToStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStage) return;

    let finalUrl = newStagePhotoUrl.trim();
    if (!newStagePhotoFile && !finalUrl) {
      showNotification('Selecione um arquivo de foto ou informe o link.', 'error');
      return;
    }

    setIsUploadingStagePhoto(true);
    try {
      if (newStagePhotoFile) {
        const uploadRes = await api.uploadMedia(newStagePhotoFile);
        finalUrl = uploadRes.url;
      }

      const newPhoto = {
        id: 'p-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        url: finalUrl,
        caption: newStagePhotoCaption.trim(),
      };

      const updated = timeline.map((s) => {
        if (s.id === currentStage.id) {
          return {
            ...s,
            photos: [...s.photos, newPhoto],
          };
        }
        return s;
      });

      await handleSaveTimelineToBackend(updated);

      setNewStagePhotoFile(null);
      setNewStagePhotoUrl('');
      setNewStagePhotoCaption('');
      if (stageFileInputRef.current) stageFileInputRef.current.value = '';
      showNotification('Foto adicionada ao capítulo com sucesso!');
    } catch (err: any) {
      showNotification(err.message || 'Falha ao adicionar foto.', 'error');
    } finally {
      setIsUploadingStagePhoto(false);
    }
  };

  const handleDeletePhotoFromStage = async (photoId: string) => {
    if (!currentStage) return;
    const updated = timeline.map((s) => {
      if (s.id === currentStage.id) {
        return {
          ...s,
          photos: s.photos.filter((p) => p.id !== photoId),
        };
      }
      return s;
    });

    await handleSaveTimelineToBackend(updated);
    showNotification('Foto removida do capítulo.');
  };

  // ==========================================
  // ==========================================
  // VIDEOS ACTIONS & DEDICATED UPLOADS
  // ==========================================
  const handleUploadSpecialInvite = async (file: File) => {
    if (!file) return;
    setIsUploadingVideo(true);
    setActiveUploadingKey('invite');
    setUploadProgressPercent(0);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setUploadProgressText(`Preparando ${file.name} (${sizeMb}MB)...`);

    try {
      const uploadRes = await api.uploadMedia(file, (percent, loaded, total) => {
        setUploadProgressPercent(percent);
        const loadedMb = (loaded / (1024 * 1024)).toFixed(1);
        const totalMb = (total / (1024 * 1024)).toFixed(1);
        if (percent < 100) {
          setUploadProgressText(`Enviando vídeo do convite: ${percent}% (${loadedMb}MB de ${totalMb}MB)...`);
        } else {
          setUploadProgressText('Upload concluído! Otimizando vídeo para reprodução instantânea...');
        }
      });

      const existingInvite =
        videos.find((v) => v.isAiInvite) ||
        videos.find((v) => (v.title || '').toLowerCase().includes('convite')) ||
        videos[0];

      if (existingInvite) {
        const updated = await api.updateVideo(existingInvite.id, {
          url: uploadRes.url,
          title: 'Convite especial',
          description: 'Convite especial',
          isAiInvite: true,
        });
        onVideosUpdated(videos.map((v) => (v.id === existingInvite.id ? updated : v)));
      } else {
        const created = await api.addVideo({
          title: 'Convite especial',
          description: 'Convite especial',
          url: uploadRes.url,
          isAiInvite: true,
          order: 1,
        });
        onVideosUpdated([created, ...videos]);
      }
      showNotification('Vídeo do Convite Especial enviado e pronto para reprodução!');
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Erro ao enviar vídeo do convite especial.', 'error');
    } finally {
      setIsUploadingVideo(false);
      setActiveUploadingKey(null);
      setUploadProgressPercent(0);
      setUploadProgressText('');
      if (specialInviteFileInputRef.current) specialInviteFileInputRef.current.value = '';
    }
  };

  const handleUploadTeaser = async (file: File) => {
    if (!file) return;
    setIsUploadingVideo(true);
    setActiveUploadingKey('teaser');
    setUploadProgressPercent(0);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setUploadProgressText(`Preparando ${file.name} (${sizeMb}MB)...`);

    try {
      const uploadRes = await api.uploadMedia(file, (percent, loaded, total) => {
        setUploadProgressPercent(percent);
        const loadedMb = (loaded / (1024 * 1024)).toFixed(1);
        const totalMb = (total / (1024 * 1024)).toFixed(1);
        if (percent < 100) {
          setUploadProgressText(`Enviando teaser: ${percent}% (${loadedMb}MB de ${totalMb}MB)...`);
        } else {
          setUploadProgressText('Upload concluído! Otimizando vídeo...');
        }
      });

      const existingTeaser =
        videos.find((v) => !v.isAiInvite && (v.title || '').toLowerCase().includes('teaser')) ||
        (videos.length > 1 ? videos[1] : null);

      if (existingTeaser) {
        const updated = await api.updateVideo(existingTeaser.id, {
          url: uploadRes.url,
          title: 'Teaser',
          description: 'Teaser',
        });
        onVideosUpdated(videos.map((v) => (v.id === existingTeaser.id ? updated : v)));
      } else {
        const created = await api.addVideo({
          title: 'Teaser',
          description: 'Teaser',
          url: uploadRes.url,
          isAiInvite: false,
          order: 2,
        });
        onVideosUpdated([...videos, created]);
      }
      showNotification('Vídeo do Teaser enviado com sucesso!');
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Erro ao enviar vídeo do teaser.', 'error');
    } finally {
      setIsUploadingVideo(false);
      setActiveUploadingKey(null);
      setUploadProgressPercent(0);
      setUploadProgressText('');
      if (teaserFileInputRef.current) teaserFileInputRef.current.value = '';
    }
  };

  const handleReplaceVideoFile = async (videoId: string, file: File) => {
    if (!file) return;
    setIsUploadingVideo(true);
    setActiveUploadingKey(videoId);
    setUploadProgressPercent(0);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setUploadProgressText(`Preparando ${file.name} (${sizeMb}MB)...`);

    try {
      const uploadRes = await api.uploadMedia(file, (percent, loaded, total) => {
        setUploadProgressPercent(percent);
        const loadedMb = (loaded / (1024 * 1024)).toFixed(1);
        const totalMb = (total / (1024 * 1024)).toFixed(1);
        if (percent < 100) {
          setUploadProgressText(`Enviando: ${percent}% (${loadedMb}MB de ${totalMb}MB)...`);
        } else {
          setUploadProgressText('Upload concluído! Otimizando...');
        }
      });

      const updatedVideo = await api.updateVideo(videoId, { url: uploadRes.url });
      onVideosUpdated(videos.map((v) => (v.id === videoId ? updatedVideo : v)));
      showNotification('Vídeo enviado com sucesso e pronto para reprodução!');
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Erro ao fazer upload do vídeo.', 'error');
    } finally {
      setIsUploadingVideo(false);
      setActiveUploadingKey(null);
      setUploadProgressPercent(0);
      setUploadProgressText('');
    }
  };

  const handleSaveInviteUrl = async (url: string) => {
    const cleanUrl = url.trim();
    if (!cleanUrl) return;
    try {
      const existingInvite =
        videos.find((v) => v.isAiInvite) ||
        videos.find((v) => (v.title || '').toLowerCase().includes('convite')) ||
        videos[0];

      if (existingInvite) {
        const updated = await api.updateVideo(existingInvite.id, { url: cleanUrl });
        onVideosUpdated(videos.map((v) => (v.id === existingInvite.id ? updated : v)));
      } else {
        const created = await api.addVideo({
          title: 'Convite especial',
          description: 'Convite especial',
          url: cleanUrl,
          isAiInvite: true,
          order: 1,
        });
        onVideosUpdated([created, ...videos]);
      }
      setInviteUrlInput('');
      showNotification('Link do Convite Especial atualizado com sucesso!');
    } catch (err: any) {
      showNotification(err.message || 'Erro ao atualizar link do vídeo.', 'error');
    }
  };

  const handleSaveTeaserUrl = async (url: string) => {
    const cleanUrl = url.trim();
    if (!cleanUrl) return;
    try {
      const existingTeaser =
        videos.find((v) => !v.isAiInvite && (v.title || '').toLowerCase().includes('teaser')) ||
        (videos.length > 1 ? videos[1] : null);

      if (existingTeaser) {
        const updated = await api.updateVideo(existingTeaser.id, { url: cleanUrl });
        onVideosUpdated(videos.map((v) => (v.id === existingTeaser.id ? updated : v)));
      } else {
        const created = await api.addVideo({
          title: 'Teaser',
          description: 'Teaser',
          url: cleanUrl,
          isAiInvite: false,
          order: 2,
        });
        onVideosUpdated([...videos, created]);
      }
      setTeaserUrlInput('');
      showNotification('Link do Teaser atualizado com sucesso!');
    } catch (err: any) {
      showNotification(err.message || 'Erro ao atualizar link do teaser.', 'error');
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = newVideoUrl.trim();

    if (!newVideoFile && !finalUrl) {
      showNotification('Envie um arquivo de vídeo ou informe a URL.', 'error');
      return;
    }

    setIsUploadingVideo(true);
    setActiveUploadingKey('new_video');
    setUploadProgressPercent(0);
    try {
      if (newVideoFile) {
        const uploadRes = await api.uploadMedia(newVideoFile, (percent) => {
          setUploadProgressPercent(percent);
          setUploadProgressText(`Enviando novo vídeo: ${percent}%...`);
        });
        finalUrl = uploadRes.url;
      }

      const created = await api.addVideo({
        title: newVideoTitle.trim() || 'Vídeo Especial',
        description: newVideoDesc.trim() || '',
        url: finalUrl,
        isAiInvite: newVideoIsAi,
        order: videos.length + 1,
      });

      onVideosUpdated([...videos, created]);
      setNewVideoFile(null);
      setNewVideoUrl('');
      setNewVideoTitle('');
      setNewVideoDesc('');
      setNewVideoIsAi(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
      showNotification('Vídeo adicionado e pronto para reprodução!');
    } catch (err: any) {
      showNotification(err.message || 'Erro ao salvar vídeo.', 'error');
    } finally {
      setIsUploadingVideo(false);
      setActiveUploadingKey(null);
      setUploadProgressPercent(0);
      setUploadProgressText('');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      await api.deleteVideo(id);
      onVideosUpdated(videos.filter((v) => v.id !== id));
      setConfirmDeleteVideoId(null);
      showNotification('Vídeo excluído com sucesso.');
    } catch {
      showNotification('Falha ao excluir vídeo.', 'error');
    }
  };

  // ==========================================
  // SETTINGS SAVE
  // ==========================================
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: Partial<EventSettings> = { ...localSettings };
      if (newAdminPin.trim()) {
        payload.adminPin = newAdminPin.trim();
      }

      const updated = await api.updateSettings(payload);
      onSettingsUpdated({ ...localSettings, ...updated });
      if (newAdminPin.trim()) {
        showNotification('Configurações e nova senha salvas!');
        setNewAdminPin('');
      } else {
        showNotification('Configurações salvas com sucesso!');
      }
    } catch (err: any) {
      showNotification(err.message || 'Erro ao salvar configurações.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-purple-400/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/40 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-900/60 border border-purple-400/40 flex items-center justify-center text-purple-200">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-white">
                Painel Administrativo da Debutante
              </h3>
              <p className="text-xs text-purple-300/70">
                Gestão de Presença, História, Vídeos e Ajustes do Convite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Sair do modo administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status notification toast */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs sm:text-sm font-medium flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-purple-950/90 border-b border-purple-500/40 text-purple-200'
                : 'bg-rose-950/90 border-b border-rose-500/40 text-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-purple-300" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-300" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Content area: Login prompt or Admin tabs */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-400/30 flex items-center justify-center text-purple-300 mb-4 shadow-lg shadow-purple-900/40">
              <Lock className="w-7 h-7" />
            </div>
            <h4 className="font-cinzel text-xl sm:text-2xl font-bold text-white mb-2">
              Acesso Restrito
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 font-light">
              Digite a senha do cerimonial ou debutante para gerenciar presenças, história, vídeos e configurações.
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input
                type="password"
                required
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Digite a senha (padrão: mariana15)"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-purple-400/30 text-white placeholder-slate-500 text-center text-sm focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
              />

              {loginError && (
                <p className="text-xs text-rose-400 font-medium">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-purple-900/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Entrar no Painel
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-56 bg-slate-950/60 border-b md:border-b-0 md:border-r border-purple-900/40 p-2 sm:p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
              <button
                onClick={() => setActiveTab('rsvps')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === 'rsvps'
                    ? 'bg-purple-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4 text-purple-300" />
                <span>Presenças ({rsvps.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('heroPhotos')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === 'heroPhotos'
                    ? 'bg-purple-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-purple-300" />
                <span>Editar Fotos da Página Inicial ({heroPhotosList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('videos')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === 'videos'
                    ? 'bg-purple-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Video className="w-4 h-4 text-purple-300" />
                <span>Convite Especial & Teaser</span>
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'bg-purple-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4 text-purple-300" />
                <span>História ({timeline.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('appearance')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === 'appearance'
                    ? 'bg-purple-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Palette className="w-4 h-4 text-purple-300" />
                <span>Personalizar Convite & Aparência</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-purple-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Settings className="w-4 h-4 text-purple-300" />
                <span>Dados do Evento</span>
              </button>

              <button
                onClick={() => setActiveTab('cloud')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === 'cloud'
                    ? 'bg-purple-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Cloud className="w-4 h-4 text-purple-300" />
                <span>Nuvem & Ajuda</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {/* TAB 1: RSVPS */}
              {activeTab === 'rsvps' && (
                <div className="space-y-6">
                  {/* Top Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-400/20">
                      <span className="text-xs text-purple-300 uppercase tracking-wider font-semibold block">
                        Confirmados
                      </span>
                      <span className="text-2xl sm:text-3xl font-bold font-cinzel text-white mt-1 block">
                        {rsvps.length}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-400/20 flex flex-col justify-between">
                      <span className="text-xs text-purple-300 uppercase tracking-wider font-semibold block">
                        Exportação
                      </span>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={loadRsvps}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Atualizar lista"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loadingRsvps ? 'animate-spin' : ''}`} />
                          <span>Atualizar</span>
                        </button>
                        <button
                          onClick={handleExportRsvpsCsv}
                          disabled={rsvps.length === 0}
                          className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Baixar Planilha</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Edição da Mensagem de Agradecimento da Presença */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-purple-400/25 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-cinzel text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-300" />
                          <span>Texto de Agradecimento após Confirmar Presença</span>
                        </h4>
                        <p className="text-[11px] text-purple-300/80 mt-0.5">
                          Mensagem carinhosa exibida na tela do convidado. Use <code className="text-purple-200 bg-purple-950/60 px-1 py-0.5 rounded font-mono text-[10px]">&#123;name&#125;</code> para inserir o nome automaticamente.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveThankYouMessage}
                        className="self-start sm:self-center px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 whitespace-nowrap"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Salvar Agradecimento</span>
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      value={rsvpThankYouInput}
                      onChange={(e) => setRsvpThankYouInput(e.target.value)}
                      placeholder="Ex: Obrigada pelo carinho, {name}! Sua presença tornará o X V da Mari ainda mais especial e inesquecível."
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300 leading-relaxed"
                    />

                    {/* Preview da Mensagem */}
                    <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-400/15 text-[11px] text-purple-200 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-purple-300/80 block">
                        Prévia ao Convidado:
                      </span>
                      <p className="italic">
                        &ldquo;{rsvpThankYouInput.replace('{name}', 'Carolina Silva')}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* List of Guests */}
                  {loadingRsvps ? (
                    <div className="py-12 text-center text-slate-400">Carregando confirmações...</div>
                  ) : rsvps.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 border border-dashed border-purple-400/20 rounded-2xl">
                      Nenhuma confirmação de presença registrada ainda.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rsvps.map((rsvp) => (
                        <div
                          key={rsvp.id}
                          className="p-4 rounded-2xl bg-slate-950/80 border border-purple-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-400/40 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white text-sm sm:text-base">{rsvp.name}</h4>
                            <p className="text-xs text-slate-400 mt-1">
                              <strong>WhatsApp:</strong> {rsvp.phone} •{' '}
                              <span>
                                {new Date(rsvp.confirmedAt).toLocaleDateString('pt-BR')} às{' '}
                                {new Date(rsvp.confirmedAt).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </p>
                            {rsvp.message && (
                              <p className="text-xs text-purple-200/90 italic mt-2 bg-purple-950/30 p-2 rounded-lg border border-purple-400/10">
                                “{rsvp.message}”
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <a
                              href={`https://wa.me/${rsvp.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 hover:bg-emerald-900/60 text-xs font-medium"
                            >
                              WhatsApp
                            </a>

                            {/* Safe inline deletion without window.confirm */}
                            {confirmDeleteRsvpId === rsvp.id ? (
                              <div className="flex items-center gap-1.5 bg-rose-950/80 p-1 rounded-xl border border-rose-500/40">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRsvp(rsvp.id)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
                                >
                                  Excluir?
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteRsvpId(null)}
                                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteRsvpId(rsvp.id)}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                                title="Excluir confirmação"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: EDITAR FOTOS DA PÁGINA INICIAL */}
              {activeTab === 'heroPhotos' && (
                <div className="space-y-6">
                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-950 to-indigo-950/80 border-2 border-purple-500/30 shadow-lg">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-400/40 text-purple-200 text-[11px] font-semibold uppercase tracking-wider mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                        <span>Carrossel de Destaque</span>
                      </div>
                      <h4 className="font-cinzel text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <span>🖼️ Editar Fotos da Página Inicial</span>
                      </h4>
                      <p className="text-xs text-purple-200/80 mt-1 max-w-xl">
                        Fotos exibidas no início da página, logo abaixo de &quot;XV DA MARI&quot;. Você pode adicionar novas imagens, substituir existentes, excluir, alterar a ordem de exibição e alternar entre transição automática e manual.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveHeroSettings()}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Salvar Fotos & Ordem</span>
                      </button>
                    </div>
                  </div>

                  {/* Configurações do Carrossel (Modo Automático vs Manual e Intervalo) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-purple-400/25 space-y-4">
                    <h5 className="font-cinzel text-xs font-bold text-purple-200 uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-purple-300" />
                      <span>Comportamento do Carrossel</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Modo Automático ou Manual */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-400/20 space-y-2">
                        <label className="block text-xs font-semibold text-white">
                          Modo de Exibição
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setHeroAutoPlay(true);
                              handleSaveHeroSettings(heroPhotosList, true, heroInterval);
                            }}
                            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              heroAutoPlay
                                ? 'bg-purple-700 text-white shadow-md font-semibold'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Automático</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setHeroAutoPlay(false);
                              handleSaveHeroSettings(heroPhotosList, false, heroInterval);
                            }}
                            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              !heroAutoPlay
                                ? 'bg-purple-700 text-white shadow-md font-semibold'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Manual (Setas)</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {heroAutoPlay
                            ? 'As fotos alternam sozinhas no tempo configurado e o visitante também pode navegar manualmente.'
                            : 'O carrossel avança apenas quando o visitante clica nas setas ou indicadores.'}
                        </p>
                      </div>

                      {/* Tempo por Foto (se automático) */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-400/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-white">
                            Tempo por Foto (Segundos)
                          </label>
                          <span className="text-xs font-mono font-bold text-purple-300">
                            {heroInterval}s
                          </span>
                        </div>
                        <input
                          type="range"
                          min="2.5"
                          max="10"
                          step="0.5"
                          disabled={!heroAutoPlay}
                          value={heroInterval}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setHeroInterval(val);
                            handleSaveHeroSettings(heroPhotosList, heroAutoPlay, val);
                          }}
                          className="w-full accent-purple-500 cursor-pointer disabled:opacity-40"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Mais rápido (2.5s)</span>
                          <span>Padrão (4.5s)</span>
                          <span>Mais lento (10s)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Formulário: Adicionar Nova Foto */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-purple-400/25 space-y-4">
                    <h5 className="font-cinzel text-xs font-bold text-white flex items-center gap-2">
                      <ImagePlus className="w-4 h-4 text-purple-300" />
                      <span>Adicionar Nova Foto ao Carrossel</span>
                    </h5>

                    {/* Upload progress if active */}
                    {isUploadingHeroPhoto && replaceHeroIdx === null && (
                      <div className="p-3.5 rounded-xl bg-purple-950/90 border border-purple-400/40 space-y-1.5 animate-pulse">
                        <div className="flex items-center justify-between text-xs text-purple-200">
                          <span>Enviando nova foto...</span>
                          <span>{heroPhotoUploadProgress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-150"
                            style={{ width: `${heroPhotoUploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Hidden input for hero photo upload */}
                    <input
                      ref={heroFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadHeroPhoto(file);
                        e.target.value = '';
                      }}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-5">
                        <button
                          type="button"
                          disabled={isUploadingHeroPhoto}
                          onClick={() => heroFileInputRef.current?.click()}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-50"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Fazer Upload do Celular / PC</span>
                        </button>
                      </div>

                      <div className="sm:col-span-2 text-center text-xs text-slate-500 font-semibold uppercase">
                        ou por link
                      </div>

                      <form
                        onSubmit={handleAddHeroPhotoUrl}
                        className="sm:col-span-5 flex items-center gap-2"
                      >
                        <input
                          type="url"
                          value={newHeroPhotoUrl}
                          onChange={(e) => setNewHeroPhotoUrl(e.target.value)}
                          placeholder="https://...link-da-foto.jpg"
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-300"
                        />
                        <button
                          type="submit"
                          disabled={!newHeroPhotoUrl.trim()}
                          className="px-3.5 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-40 whitespace-nowrap"
                        >
                          Adicionar
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Hidden input for replacing a specific photo */}
                  <input
                    ref={replaceHeroFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && replaceHeroIdx !== null) {
                        handleReplaceHeroPhoto(replaceHeroIdx, file);
                      }
                      e.target.value = '';
                    }}
                  />

                  {/* Lista de Fotos Atualmente Cadastradas no Carrossel */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-cinzel text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                        <ImageIcon className="w-4 h-4 text-purple-300" />
                        <span>Fotos Cadastradas ({heroPhotosList.length})</span>
                      </h5>
                      <span className="text-[11px] text-purple-300/80">
                        Use as setas ⬆️ ⬇️ para definir a ordem
                      </span>
                    </div>

                    <div className="space-y-3">
                      {heroPhotosList.map((photoUrl, idx) => (
                        <div
                          key={photoUrl + idx}
                          className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-purple-400/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-purple-400/50 transition-colors"
                        >
                          <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
                            {/* Order Badge */}
                            <div className="flex flex-col items-center justify-center w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-400/40 text-purple-200 text-xs font-bold font-cinzel flex-shrink-0">
                              {idx + 1}
                            </div>

                            {/* Thumbnail */}
                            <div className="w-24 sm:w-32 aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-purple-400/30 flex-shrink-0 shadow-inner relative group">
                              <img
                                src={photoUrl}
                                alt={`Foto ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {idx === 0 && (
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-purple-900/90 text-purple-200 text-[9px] font-bold uppercase tracking-wider">
                                  Capa
                                </span>
                              )}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h6 className="font-semibold text-xs sm:text-sm text-white">
                                  Foto #{idx + 1} {idx === 0 ? '• Primeira Imagem (Capa)' : ''}
                                </h6>
                              </div>
                              <span className="text-[11px] text-purple-300/80 font-mono block truncate max-w-xs sm:max-w-md mt-0.5">
                                {photoUrl}
                              </span>
                            </div>
                          </div>

                          {/* Actions: Reorder, Replace, Delete */}
                          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                            {/* Move Up */}
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveHeroPhoto(idx, 'up')}
                              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-purple-400/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                              title="Subir posição (mostrar antes)"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Move Down */}
                            <button
                              type="button"
                              disabled={idx === heroPhotosList.length - 1}
                              onClick={() => handleMoveHeroPhoto(idx, 'down')}
                              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-purple-400/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                              title="Descer posição (mostrar depois)"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Substituir Foto */}
                            <button
                              type="button"
                              onClick={() => {
                                setReplaceHeroIdx(idx);
                                replaceHeroFileInputRef.current?.click();
                              }}
                              className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-400/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                              title="Substituir por outro arquivo"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Substituir</span>
                            </button>

                            {/* Excluir Foto */}
                            {confirmDeleteHeroIdx === idx ? (
                              <div className="flex items-center gap-1.5 bg-rose-950/80 p-1 rounded-xl border border-rose-500/40">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteHeroPhoto(idx)}
                                  className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                                >
                                  Confirmar?
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteHeroIdx(null)}
                                  className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[11px]"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteHeroIdx(idx)}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                                title="Excluir foto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TIMELINE (UMA HISTÓRIA QUE MERECE SER CONTADA) */}
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-purple-950/40 border border-purple-400/25">
                    <div>
                      <h4 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-300" />
                        <span>Uma história que merece ser contada</span>
                      </h4>
                      <p className="text-xs text-purple-200/80 mt-1">
                        Gerencie os capítulos, textos e adicione ou exclua fotos de cada momento.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddStage}
                      className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Novo Capítulo</span>
                    </button>
                  </div>

                  {/* Chapters Selector Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {timeline.map((stg, idx) => (
                      <button
                        key={stg.id}
                        type="button"
                        onClick={() => setSelectedStageId(stg.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                          stg.id === currentStage?.id
                            ? 'bg-purple-700 text-white shadow-md border border-purple-400/40'
                            : 'bg-slate-950 text-slate-300 hover:bg-slate-850 border border-purple-400/20'
                        }`}
                      >
                        <span>Cap. {idx + 1}: {stg.title}</span>
                        <span className="text-[10px] opacity-75">({stg.photos.length} fotos)</span>
                      </button>
                    ))}
                  </div>

                  {/* Current Chapter Editor Form */}
                  {currentStage && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-purple-400/25 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-cinzel text-sm font-bold text-purple-200">
                          Editando Capítulo: {currentStage.title}
                        </h5>

                        {confirmDeleteStageId === currentStage.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-rose-300">Excluir este capítulo?</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteStage(currentStage.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-semibold"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteStageId(null)}
                              className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteStageId(currentStage.id)}
                            className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir Capítulo</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-purple-200 mb-1">
                            Título do Capítulo
                          </label>
                          <input
                            type="text"
                            value={currentStage.title}
                            onChange={(e) => handleUpdateCurrentStageField('title', e.target.value)}
                            placeholder="Ex: Minha infância"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-purple-200 mb-1">
                            Subtítulo
                          </label>
                          <input
                            type="text"
                            value={currentStage.subtitle}
                            onChange={(e) => handleUpdateCurrentStageField('subtitle', e.target.value)}
                            placeholder="Ex: Primeiros sorrisos e descobertas"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Descrição / História
                        </label>
                        <textarea
                          rows={2}
                          value={currentStage.description}
                          onChange={(e) => handleUpdateCurrentStageField('description', e.target.value)}
                          placeholder="Conte a história deste capítulo..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSaveTimelineToBackend()}
                          className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
                        >
                          <Check className="w-4 h-4" />
                          <span>Salvar Textos do Capítulo</span>
                        </button>
                      </div>

                      {/* Photos inside this stage */}
                      <div className="pt-4 border-t border-purple-900/40 space-y-4">
                        <h5 className="font-cinzel text-xs font-bold text-white flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-purple-300" />
                          <span>Fotos deste Capítulo ({currentStage.photos.length})</span>
                        </h5>

                        {/* Add Photo Form */}
                        <form
                          onSubmit={handleAddPhotoToStage}
                          className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-400/20 space-y-3"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-purple-200 mb-1">
                                Enviar Foto do Computador / Celular
                              </label>
                              <input
                                ref={stageFileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => setNewStagePhotoFile(e.target.files?.[0] || null)}
                                className="w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-800 file:text-white hover:file:bg-purple-700 cursor-pointer"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-purple-200 mb-1">
                                Ou Link Direto da Imagem
                              </label>
                              <input
                                type="url"
                                value={newStagePhotoUrl}
                                onChange={(e) => setNewStagePhotoUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-purple-400/30 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-300"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 items-end">
                            <div className="flex-1 w-full">
                              <label className="block text-[11px] font-semibold text-purple-200 mb-1">
                                Legenda da Foto (Opcional)
                              </label>
                              <input
                                type="text"
                                value={newStagePhotoCaption}
                                onChange={(e) => setNewStagePhotoCaption(e.target.value)}
                                placeholder="Ex: Primeiro sorriso no parque..."
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-purple-400/30 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-300"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isUploadingStagePhoto}
                              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer shadow-md whitespace-nowrap self-stretch sm:self-auto justify-center"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingStagePhoto ? 'Enviando foto...' : 'Incluir Foto'}</span>
                            </button>
                          </div>
                        </form>

                        {/* Photos Grid */}
                        {currentStage.photos.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2">
                            Nenhuma foto adicionada a este capítulo ainda.
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {currentStage.photos.map((photo) => (
                              <div
                                key={photo.id}
                                className="group relative rounded-xl overflow-hidden border border-purple-400/25 bg-slate-900 aspect-square flex flex-col"
                              >
                                <img
                                  src={photo.url}
                                  alt={photo.caption || 'Foto'}
                                  className="w-full h-full object-cover"
                                />
                                {photo.caption && (
                                  <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1.5 text-[10px] text-purple-200 truncate">
                                    {photo.caption}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeletePhotoFromStage(photo.id)}
                                  className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-slate-950/80 text-rose-400 hover:bg-rose-900/80 hover:text-white transition-colors cursor-pointer shadow-md"
                                  title="Excluir foto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: VIDEOS */}
              {/* TAB 3: VIDEOS */}
              {activeTab === 'videos' && (() => {
                const specialInviteVideo =
                  videos.find((v) => v.isAiInvite) ||
                  videos.find((v) => (v.title || '').toLowerCase().includes('convite')) ||
                  videos[0];

                const teaserVideo =
                  videos.find((v) => v.id !== specialInviteVideo?.id && (v.title || '').toLowerCase().includes('teaser')) ||
                  (videos.length > 1 && videos[1].id !== specialInviteVideo?.id ? videos[1] : null);

                const extraVideos = videos.filter(
                  (v) => v.id !== specialInviteVideo?.id && v.id !== teaserVideo?.id
                );

                return (
                  <div className="space-y-6">
                    {/* DEDICATED SECTION 1: CONVITE ESPECIAL (VÍDEO PRINCIPAL) */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-950/90 to-indigo-950/80 border-2 border-purple-500/40 shadow-xl space-y-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/30 pb-4">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-400/40 text-purple-200 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                            <span>Vídeo Principal do Evento</span>
                          </div>
                          <h4 className="font-cinzel text-base sm:text-lg font-bold text-white flex items-center gap-2">
                            <span>🎬 Convite Especial</span>
                          </h4>
                          <p className="text-xs text-purple-300/80">
                            Vídeo exibido com destaque oficial no bloco &quot;CONVITE ESPECIAL / TEASER&quot;.
                          </p>
                        </div>

                        {specialInviteVideo && (
                          <div className="self-start sm:self-center">
                            <span className="px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5" />
                              <span>Pronto para Reprodução</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Video Player Preview for Convite Especial */}
                      {specialInviteVideo ? (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                          <div className="md:col-span-6 aspect-[16/9] rounded-xl bg-black overflow-hidden border border-purple-400/40 shadow-inner relative flex items-center justify-center">
                            {specialInviteVideo.url.includes('youtube') || specialInviteVideo.url.includes('vimeo') ? (
                              <iframe
                                src={specialInviteVideo.url}
                                className="w-full h-full border-0"
                                title="Convite Especial"
                              />
                            ) : (
                              <video
                                key={specialInviteVideo.url}
                                src={specialInviteVideo.url}
                                controls
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-contain bg-black"
                              />
                            )}
                          </div>

                          <div className="md:col-span-6 space-y-3">
                            <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-400/20 text-xs text-slate-300 space-y-1">
                              <div className="text-[11px] text-purple-300 font-medium">Link / Arquivo Atual:</div>
                              <div className="font-mono text-[11px] text-purple-200 truncate select-all">
                                {specialInviteVideo.url}
                              </div>
                            </div>

                            {/* Upload Progress Bar if active */}
                            {isUploadingVideo && activeUploadingKey === 'invite' && (
                              <div className="p-4 rounded-xl bg-purple-950/90 border border-purple-400/50 space-y-2 animate-pulse">
                                <div className="flex items-center justify-between text-xs text-purple-200 font-semibold">
                                  <span>{uploadProgressText || 'Enviando vídeo...'}</span>
                                  <span>{uploadProgressPercent}%</span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-200"
                                    style={{ width: `${uploadProgressPercent}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Upload Button */}
                            <input
                              ref={specialInviteFileInputRef}
                              type="file"
                              accept="video/*,video/mp4,video/quicktime,video/mov,video/webm,video/m4v,video/mkv,video/avi,.mp4,.mov,.webm,.m4v,.mkv,.avi"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadSpecialInvite(file);
                                }
                                e.target.value = '';
                              }}
                            />

                            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                              <button
                                type="button"
                                disabled={isUploadingVideo}
                                onClick={() => specialInviteFileInputRef.current?.click()}
                                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                              >
                                <Upload className="w-4 h-4" />
                                <span>
                                  {isUploadingVideo && activeUploadingKey === 'invite'
                                    ? 'Enviando Vídeo...'
                                    : 'Substituir / Fazer Upload de Novo Arquivo (MP4, MOV)'}
                                </span>
                              </button>
                            </div>

                            {/* Direct URL input */}
                            <div className="pt-2 border-t border-purple-900/40 space-y-1.5">
                              <label className="block text-[11px] font-semibold text-purple-200">
                                Ou atualizar link direto (Google Cloud, YouTube ou Vimeo):
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  value={inviteUrlInput}
                                  onChange={(e) => setInviteUrlInput(e.target.value)}
                                  placeholder="https://..."
                                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-purple-400/30 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveInviteUrl(inviteUrlInput)}
                                  className="px-3.5 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap shadow-md"
                                >
                                  Salvar Link
                                </button>
                              </div>
                            </div>

                            {/* Excluir Vídeo do Convite Especial */}
                            <div className="pt-2 border-t border-purple-900/30 flex justify-end">
                              {confirmDeleteVideoId === specialInviteVideo.id ? (
                                <div className="flex items-center gap-2 bg-rose-950/80 px-3 py-1.5 rounded-xl border border-rose-500/40">
                                  <span className="text-xs text-rose-200">Excluir este vídeo?</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteVideo(specialInviteVideo.id)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                                  >
                                    Confirmar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteVideoId(null)}
                                    className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteVideoId(specialInviteVideo.id)}
                                  className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Excluir Vídeo do Convite Especial</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center space-y-3 bg-slate-900/60 rounded-xl border border-dashed border-purple-400/40">
                          <Video className="w-10 h-10 text-purple-300 mx-auto" />
                          <p className="text-xs text-slate-300">
                            Nenhum vídeo do Convite Especial cadastrado no momento.
                          </p>
                          <input
                            ref={specialInviteFileInputRef}
                            type="file"
                            accept="video/*,video/mp4,video/quicktime,video/mov,video/webm,video/m4v,video/mkv,video/avi,.mp4,.mov,.webm,.m4v,.mkv,.avi"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadSpecialInvite(file);
                              e.target.value = '';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => specialInviteFileInputRef.current?.click()}
                            className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-md"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Enviar Vídeo do Convite Especial</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* DEDICATED SECTION 2: TEASER */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-purple-400/25 shadow-lg space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/40 pb-4">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-400/40 text-indigo-200 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                            <Film className="w-3.5 h-3.5 text-indigo-300" />
                            <span>Preparativos & Valsa</span>
                          </div>
                          <h4 className="font-cinzel text-base sm:text-lg font-bold text-white flex items-center gap-2">
                            <span>✨ Teaser</span>
                          </h4>
                          <p className="text-xs text-purple-300/80">
                            Vídeo alternativo exibido na galeria de vídeos.
                          </p>
                        </div>

                        {teaserVideo && (
                          <div className="self-start sm:self-center">
                            <span className="px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5" />
                              <span>Pronto para Reprodução</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {teaserVideo ? (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                          <div className="md:col-span-6 aspect-[16/9] rounded-xl bg-black overflow-hidden border border-purple-400/30 relative flex items-center justify-center">
                            {teaserVideo.url.includes('youtube') || teaserVideo.url.includes('vimeo') ? (
                              <iframe
                                src={teaserVideo.url}
                                className="w-full h-full border-0"
                                title="Teaser"
                              />
                            ) : (
                              <video
                                key={teaserVideo.url}
                                src={teaserVideo.url}
                                controls
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-contain bg-black"
                              />
                            )}
                          </div>

                          <div className="md:col-span-6 space-y-3">
                            <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-400/20 text-xs text-slate-300 space-y-1">
                              <div className="text-[11px] text-purple-300 font-medium">Link / Arquivo Atual:</div>
                              <div className="font-mono text-[11px] text-purple-200 truncate select-all">
                                {teaserVideo.url}
                              </div>
                            </div>

                            {/* Upload Progress Bar if active */}
                            {isUploadingVideo && activeUploadingKey === 'teaser' && (
                              <div className="p-4 rounded-xl bg-purple-950/90 border border-purple-400/50 space-y-2 animate-pulse">
                                <div className="flex items-center justify-between text-xs text-purple-200 font-semibold">
                                  <span>{uploadProgressText || 'Enviando teaser...'}</span>
                                  <span>{uploadProgressPercent}%</span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-200"
                                    style={{ width: `${uploadProgressPercent}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Teaser Upload Button */}
                            <input
                              ref={teaserFileInputRef}
                              type="file"
                              accept="video/*,video/mp4,video/quicktime,video/mov,video/webm,video/m4v,video/mkv,video/avi,.mp4,.mov,.webm,.m4v,.mkv,.avi"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadTeaser(file);
                                e.target.value = '';
                              }}
                            />

                            <button
                              type="button"
                              disabled={isUploadingVideo}
                              onClick={() => teaserFileInputRef.current?.click()}
                              className="w-full px-4 py-3 rounded-xl bg-purple-800 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Upload className="w-4 h-4" />
                              <span>
                                {isUploadingVideo && activeUploadingKey === 'teaser'
                                  ? 'Enviando Teaser...'
                                  : 'Fazer Upload / Substituir Arquivo do Teaser'}
                              </span>
                            </button>

                            {/* Direct URL input */}
                            <div className="pt-2 border-t border-purple-900/40 space-y-1.5">
                              <label className="block text-[11px] font-semibold text-purple-200">
                                Ou atualizar link direto:
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  value={teaserUrlInput}
                                  onChange={(e) => setTeaserUrlInput(e.target.value)}
                                  placeholder="https://..."
                                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-purple-400/30 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveTeaserUrl(teaserUrlInput)}
                                  className="px-3.5 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap shadow-md"
                                >
                                  Salvar Link
                                </button>
                              </div>
                            </div>

                            {/* Excluir Vídeo do Teaser */}
                            <div className="pt-2 border-t border-purple-900/30 flex justify-end">
                              {confirmDeleteVideoId === teaserVideo.id ? (
                                <div className="flex items-center gap-2 bg-rose-950/80 px-3 py-1.5 rounded-xl border border-rose-500/40">
                                  <span className="text-xs text-rose-200">Excluir este vídeo?</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteVideo(teaserVideo.id)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                                  >
                                    Confirmar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteVideoId(null)}
                                    className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteVideoId(teaserVideo.id)}
                                  className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Excluir Vídeo do Teaser</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center space-y-3 bg-slate-900/60 rounded-xl border border-dashed border-purple-400/40">
                          <Film className="w-10 h-10 text-purple-300 mx-auto" />
                          <p className="text-xs text-slate-300">
                            Nenhum vídeo do Teaser cadastrado no momento.
                          </p>
                          <input
                            ref={teaserFileInputRef}
                            type="file"
                            accept="video/*,video/mp4,video/quicktime,video/mov,video/webm,video/m4v,video/mkv,video/avi,.mp4,.mov,.webm,.m4v,.mkv,.avi"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadTeaser(file);
                              e.target.value = '';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => teaserFileInputRef.current?.click()}
                            className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-md"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Enviar Vídeo do Teaser</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* SECTION 3: ADICIONAR NOVO VÍDEO (OPCIONAL) */}
                    <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-400/25 space-y-4">
                      <h4 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                        <Plus className="w-4 h-4 text-purple-300" />
                        <span>Adicionar Outro Vídeo (Bastidores / Fotos em Vídeo)</span>
                      </h4>

                      <form onSubmit={handleAddVideo} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-purple-200 mb-1">
                              Arquivo de Vídeo (MP4, MOV, WebM até 500MB)
                            </label>
                            <input
                              ref={videoFileInputRef}
                              type="file"
                              accept="video/*,video/mp4,video/quicktime,video/mov,video/webm,video/m4v,video/mkv,video/avi,.mp4,.mov,.webm,.m4v,.mkv,.avi"
                              onChange={(e) => setNewVideoFile(e.target.files?.[0] || null)}
                              className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-800 file:text-white hover:file:bg-purple-700 cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-purple-200 mb-1">
                              Ou Link Externo (YouTube / Vimeo / Nuvem)
                            </label>
                            <input
                              type="url"
                              value={newVideoUrl}
                              onChange={(e) => setNewVideoUrl(e.target.value)}
                              placeholder="https://..."
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-300"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-purple-200 mb-1">
                            Título do Vídeo
                          </label>
                          <input
                            type="text"
                            value={newVideoTitle}
                            onChange={(e) => setNewVideoTitle(e.target.value)}
                            placeholder="Ex: Bastidores do Ensaio"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-300"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isUploadingVideo}
                          className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{isUploadingVideo && activeUploadingKey === 'new_video' ? 'Enviando...' : 'Adicionar Vídeo'}</span>
                        </button>
                      </form>
                    </div>

                    {/* SECTION 4: OUTROS VÍDEOS CADASTRADOS (SE HOUVER) */}
                    {extraVideos.length > 0 && (
                      <div className="space-y-4 pt-2">
                        <h5 className="font-cinzel text-xs font-bold text-purple-200 uppercase tracking-wider">
                          Outros Vídeos Cadastrados ({extraVideos.length})
                        </h5>

                        {extraVideos.map((vid) => (
                          <div
                            key={vid.id}
                            className="p-4 rounded-2xl bg-slate-950/80 border border-purple-400/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div className="flex flex-col sm:flex-row items-start gap-4 w-full sm:w-auto">
                              <div className="w-full sm:w-48 aspect-[16/9] rounded-xl bg-slate-900 overflow-hidden flex-shrink-0 border border-purple-400/30 relative">
                                {vid.url.includes('youtube') || vid.url.includes('vimeo') ? (
                                  <iframe src={vid.url} className="w-full h-full border-0" title={vid.title} />
                                ) : (
                                  <video
                                    src={vid.url}
                                    controls
                                    playsInline
                                    preload="metadata"
                                    className="w-full h-full object-contain bg-black"
                                  />
                                )}
                              </div>

                              <div className="min-w-0">
                                <h5 className="font-semibold text-sm text-white">{vid.title}</h5>
                                <span className="text-[10px] text-purple-300 font-mono mt-1 block truncate max-w-sm">
                                  {vid.url}
                                </span>
                              </div>
                            </div>

                            <div className="self-end sm:self-center">
                              {confirmDeleteVideoId === vid.id ? (
                                <div className="flex items-center gap-1.5 bg-rose-950/80 p-1.5 rounded-xl border border-rose-500/40">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteVideo(vid.id)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
                                  >
                                    Excluir?
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteVideoId(null)}
                                    className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteVideoId(vid.id)}
                                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                                  title="Excluir vídeo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* TAB 4: SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Visual Customizer Quick Open */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-slate-950/80 border border-purple-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-purple-300" />
                        <span>Aparência, Cores do Cenário & Fontes</span>
                      </h4>
                      <p className="text-xs text-purple-200/80 font-light mt-1">
                        Personalize paletas de cores, tipografia e tema com visualização em tempo real.
                      </p>
                    </div>
                    {onOpenCustomizer && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenCustomizer();
                        }}
                        className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold shadow-md flex items-center gap-2 flex-shrink-0 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Abrir Personalizador Visual</span>
                      </button>
                    )}
                  </div>

                  {/* Event Basic Details */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-purple-400/25 space-y-4">
                    <h4 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-300" />
                      <span>Informações do Evento</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Nome da Debutante
                        </label>
                        <input
                          type="text"
                          value={localSettings.debutanteName}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, debutanteName: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Título do Evento
                        </label>
                        <input
                          type="text"
                          value={localSettings.eventTitle}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, eventTitle: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Local do Evento
                        </label>
                        <input
                          type="text"
                          value={localSettings.venueName}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, venueName: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Endereço Completo
                        </label>
                        <input
                          type="text"
                          value={localSettings.venueAddress}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, venueAddress: e.target.value })
                          }
                          placeholder="Rua do Imperador, 277 - Viga, Nova Iguaçu - RJ"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Link Google Maps ("Como chegar")
                        </label>
                        <input
                          type="url"
                          value={localSettings.mapsUrl}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, mapsUrl: e.target.value })
                          }
                          placeholder="https://maps.google.com/..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          WhatsApp de Contato / Cerimonial
                        </label>
                        <input
                          type="text"
                          value={localSettings.whatsappNumber}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })
                          }
                          placeholder="5511987654321"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                        />
                      </div>
                    </div>

                    {/* Traje Sugerido (Dress Code) */}
                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">
                        Traje Sugerido (Dress Code)
                      </label>
                      <input
                        type="text"
                        value={localSettings.dressCode || ''}
                        onChange={(e) =>
                          setLocalSettings({ ...localSettings, dressCode: e.target.value })
                        }
                        placeholder="Ex: Esporte Fino / Traje de Gala"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Fica salvo e visível no convite para os convidados saberem o que vestir.
                      </span>
                    </div>
                  </div>

                  {/* Feature Switches: Gifts and Music (Recursos Operacionais) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-purple-400/25 space-y-4">
                    <h4 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-purple-300" />
                      <span>Recursos Operacionais</span>
                    </h4>

                    {/* Gifts Toggle */}
                    <div className="flex items-center justify-between py-2 border-b border-purple-900/40">
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          Exibir Seção de Presentes (Pix & Lojas)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Permite que os convidados visualizem sua chave Pix ou link de lojas de presentes.
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.showGiftList}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, showGiftList: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-700" />
                      </label>
                    </div>

                    {localSettings.showGiftList && (
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-purple-200 mb-1">
                              Chave Pix
                            </label>
                            <input
                              type="text"
                              value={localSettings.pixKey}
                              onChange={(e) =>
                                setLocalSettings({ ...localSettings, pixKey: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-purple-200 mb-1">
                              Nome do Beneficiário Pix
                            </label>
                            <input
                              type="text"
                              value={localSettings.pixBeneficiary}
                              onChange={(e) =>
                                setLocalSettings({ ...localSettings, pixBeneficiary: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                            />
                          </div>
                        </div>

                        {/* Campo para adicionar link de lojas de presentes */}
                        <div>
                          <label className="block text-xs font-semibold text-purple-200 mb-1">
                            Link de Lojas de Presentes / Lista Online
                          </label>
                          <input
                            type="url"
                            value={localSettings.giftRegistryUrl || ''}
                            onChange={(e) =>
                              setLocalSettings({ ...localSettings, giftRegistryUrl: e.target.value })
                            }
                            placeholder="https://exemplo-loja.com.br/minha-lista"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-300"
                          />
                          <span className="text-[11px] text-slate-400 mt-1 block">
                            Insira o link externo para a lista de presentes ou loja online parceira.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Music Toggle */}
                    <div className="flex items-center justify-between py-2 border-b border-purple-900/40">
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          Ativar Música de Fundo
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Habilita o reprodutor de valsa/trilha sonora (All of Me Instrumental).
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.enableMusic}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, enableMusic: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-700" />
                      </label>
                    </div>

                    {/* Change Admin PIN */}
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-purple-200 mb-1">
                        Alterar Senha do Painel Administrativo
                      </label>
                      <input
                        type="password"
                        value={newAdminPin}
                        onChange={(e) => setNewAdminPin(e.target.value)}
                        placeholder="Deixe em branco para manter a senha atual"
                        className="w-full max-w-sm px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-300"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-purple-900/50 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar Todas as Configurações'}
                  </button>
                </form>
              )}

              {/* TAB 5: APPEARANCE (PERSONALIZAR CONVITE & APARÊNCIA) */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  {/* Hidden inputs for Arts uploads */}
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadArt('logo', file);
                      e.target.value = '';
                    }}
                  />
                  <input
                    ref={bgTextureFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadArt('bgTexture', file);
                      e.target.value = '';
                    }}
                  />
                  <input
                    ref={footerArtFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadArt('footerArt', file);
                      e.target.value = '';
                    }}
                  />

                  {/* SEÇÃO 1: EDIÇÃO DE IMAGENS E ARTES DO CONVITE */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-950 to-indigo-950/80 border-2 border-purple-500/30 shadow-lg space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-400/40 text-purple-200 text-[11px] font-semibold uppercase tracking-wider mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                          <span>Identidade Visual & Artes</span>
                        </div>
                        <h4 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                          <span>🎨 Edição de Imagens e Artes do Convite</span>
                        </h4>
                        <p className="text-xs text-purple-200/80 mt-0.5">
                          Inclua novas artes via upload do celular ou computador, altere ou exclua quando desejar.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* CARD 1: LOGOTIPO / BRASÃO OFICIAL */}
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-400/25 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">
                              Logo / Monograma Oficial
                            </span>
                            {localSettings.customLogoUrl ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/70 text-purple-200 border border-purple-400/30">
                                Personalizado
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                Padrão (MA)
                              </span>
                            )}
                          </div>

                          {/* Preview Box */}
                          <div className="w-full h-28 rounded-lg bg-slate-950 border border-purple-400/20 flex items-center justify-center overflow-hidden p-2">
                            {localSettings.customLogoUrl ? (
                              <img
                                src={localSettings.customLogoUrl}
                                alt="Logo Personalizado"
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <div className="text-center p-2">
                                <span className="font-cinzel text-2xl font-bold silver-text tracking-widest block">
                                  MA
                                </span>
                                <span className="text-[10px] text-purple-300/70 font-light">
                                  Brasão Mariana Amorim
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Exibido na barra de navegação superior e no rodapé oficial.
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 pt-2 border-t border-purple-900/30">
                          {isUploadingArt && artUploadKey === 'logo' && (
                            <div className="text-center text-xs text-purple-300 animate-pulse">
                              Enviando logotipo...
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={isUploadingArt}
                              onClick={() => logoFileInputRef.current?.click()}
                              className="flex-1 py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm disabled:opacity-50"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{localSettings.customLogoUrl ? 'Alterar Logo' : 'Fazer Upload'}</span>
                            </button>
                            {localSettings.customLogoUrl && (
                              <button
                                type="button"
                                onClick={() => handleRemoveArt('logo')}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-purple-400/20 transition-colors cursor-pointer"
                                title="Excluir e restaurar padrão"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* CARD 2: TEXTURA / ARTE DE FUNDO */}
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-400/25 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">
                              Textura / Fundo do Convite
                            </span>
                            {localSettings.bgTextureUrl ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/70 text-purple-200 border border-purple-400/30">
                                Personalizado
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                Gradiente Noturno
                              </span>
                            )}
                          </div>

                          {/* Preview Box */}
                          <div className="w-full h-28 rounded-lg bg-slate-950 border border-purple-400/20 flex items-center justify-center overflow-hidden relative">
                            {localSettings.bgTextureUrl ? (
                              <img
                                src={localSettings.bgTextureUrl}
                                alt="Textura de Fundo"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-b from-purple-950/40 via-slate-950 to-indigo-950/40 flex items-center justify-center text-center p-2">
                                <span className="text-[10px] text-purple-300/80">
                                  Partículas cintilantes & brilho galáctico padrão
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Fundo suave aplicado nas seções com iluminação dinâmica.
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 pt-2 border-t border-purple-900/30">
                          {isUploadingArt && artUploadKey === 'bgTexture' && (
                            <div className="text-center text-xs text-purple-300 animate-pulse">
                              Enviando textura...
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={isUploadingArt}
                              onClick={() => bgTextureFileInputRef.current?.click()}
                              className="flex-1 py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm disabled:opacity-50"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{localSettings.bgTextureUrl ? 'Alterar Fundo' : 'Fazer Upload'}</span>
                            </button>
                            {localSettings.bgTextureUrl && (
                              <button
                                type="button"
                                onClick={() => handleRemoveArt('bgTexture')}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-purple-400/20 transition-colors cursor-pointer"
                                title="Excluir textura"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* CARD 3: ARTE DO RODAPÉ / BRASÃO FINAL */}
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-400/25 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">
                              Arte / Selo do Rodapé
                            </span>
                            {localSettings.footerArtUrl ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/70 text-purple-200 border border-purple-400/30">
                                Personalizado
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                Logo Oficial
                              </span>
                            )}
                          </div>

                          {/* Preview Box */}
                          <div className="w-full h-28 rounded-lg bg-slate-950 border border-purple-400/20 flex items-center justify-center overflow-hidden p-2">
                            {localSettings.footerArtUrl ? (
                              <img
                                src={localSettings.footerArtUrl}
                                alt="Arte do Rodapé"
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <div className="text-center p-2">
                                <span className="text-xs font-cinzel font-semibold text-purple-200 block">
                                  Selo Final Mariana
                                </span>
                                <span className="text-[10px] text-purple-300/70 font-light">
                                  Acima da frase de agradecimento
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Arte que finaliza a página acima da mensagem de agradecimento.
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 pt-2 border-t border-purple-900/30">
                          {isUploadingArt && artUploadKey === 'footerArt' && (
                            <div className="text-center text-xs text-purple-300 animate-pulse">
                              Enviando arte...
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={isUploadingArt}
                              onClick={() => footerArtFileInputRef.current?.click()}
                              className="flex-1 py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm disabled:opacity-50"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{localSettings.footerArtUrl ? 'Alterar Arte' : 'Fazer Upload'}</span>
                            </button>
                            {localSettings.footerArtUrl && (
                              <button
                                type="button"
                                onClick={() => handleRemoveArt('footerArt')}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-purple-400/20 transition-colors cursor-pointer"
                                title="Excluir arte"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 2: PALETA DE CORES E TEMA DO CENÁRIO */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-purple-400/25 space-y-4">
                    <h4 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                      <Palette className="w-4 h-4 text-purple-300" />
                      <span>Paleta de Cores e Tema do Cenário</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {THEME_PRESETS.map((pal) => {
                        const isSelected = localSettings.themePreset === pal.id;
                        return (
                          <button
                            type="button"
                            key={pal.id}
                            onClick={() => {
                              const updated = {
                                ...localSettings,
                                themePreset: pal.id,
                                bgColor: pal.bgColor,
                                accentLilac: pal.accentLilac,
                                accentSecondary: pal.accentSecondary,
                                fontTitle: pal.fontTitle,
                                fontBody: pal.fontBody,
                              };
                              setLocalSettings(updated);
                              applyThemeToDocument(updated);
                              onSettingsUpdated(updated);
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-purple-950/70 border-purple-400 shadow-lg'
                                : 'bg-slate-900 border-purple-400/15 hover:border-purple-400/40'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: pal.accentLilac }}
                              />
                              <span
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: pal.accentSecondary }}
                              />
                              <span
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: pal.bgColor }}
                              />
                            </div>
                            <h5 className="font-semibold text-xs text-white">{pal.name}</h5>
                            <p className="text-[10px] text-purple-300/80 font-light mt-0.5">{pal.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-400/25 space-y-3">
                    <h5 className="font-cinzel text-xs font-bold text-white">Cores Customizadas</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">Fundo da Página</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={localSettings.bgColor || '#0b0813'}
                            onChange={(e) => {
                              const updated = { ...localSettings, bgColor: e.target.value };
                              setLocalSettings(updated);
                              applyThemeToDocument(updated);
                              onSettingsUpdated(updated);
                            }}
                            className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border-0"
                          />
                          <span className="text-xs font-mono text-purple-300">{localSettings.bgColor}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">Destaque Lilás</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={localSettings.accentLilac || '#c084fc'}
                            onChange={(e) => {
                              const updated = { ...localSettings, accentLilac: e.target.value };
                              setLocalSettings(updated);
                              applyThemeToDocument(updated);
                              onSettingsUpdated(updated);
                            }}
                            className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border-0"
                          />
                          <span className="text-xs font-mono text-purple-300">{localSettings.accentLilac}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">Destaque Prata / Secundário</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={localSettings.accentSecondary || '#e9d5ff'}
                            onChange={(e) => {
                              const updated = { ...localSettings, accentSecondary: e.target.value };
                              setLocalSettings(updated);
                              applyThemeToDocument(updated);
                              onSettingsUpdated(updated);
                            }}
                            className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border-0"
                          />
                          <span className="text-xs font-mono text-purple-300">{localSettings.accentSecondary}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {onOpenCustomizer && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCustomizer();
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Abrir Modal Completo de Personalização com Visualização ao Vivo</span>
                    </button>
                  )}
                </div>
              )}

              {/* TAB 6: CLOUD & HELP */}
              {activeTab === 'cloud' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-400/25">
                    <div className="flex items-center gap-2.5 mb-3">
                      <Cloud className="w-5 h-5 text-purple-300" />
                      <h4 className="font-cinzel text-base font-bold text-white">
                        Armazenamento e Gestão de Dados
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-4">
                      O aplicativo conta com persistência completa em disco (banco de dados em <code>/data/database.json</code> e arquivos reais de vídeo e fotos em <code>/uploads</code>). Todas as alterações de texto, fotos, vídeos e confirmações são gravadas automaticamente.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-400/20">
                        <h5 className="font-semibold text-sm text-purple-200 mb-1">Vídeos e Uploads</h5>
                        <p className="text-xs text-slate-300 font-light leading-relaxed">
                          Os vídeos enviados ficam armazenados no servidor e são servidos com suporte completo a streaming de áudio e vídeo (HTTP Range requests).
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-400/20">
                        <h5 className="font-semibold text-sm text-purple-200 mb-1">Segurança de Acesso</h5>
                        <p className="text-xs text-slate-300 font-light leading-relaxed">
                          Somente quem possui a senha do cerimonial/debutante consegue excluir convidados, enviar vídeos e alterar configurações do convite.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Editor Interativo e Avançado de Imagens */}
      <ImageEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        target={editorTarget}
        onSaveSuccess={handleEditorSaveSuccess}
      />
    </div>
  );
};

