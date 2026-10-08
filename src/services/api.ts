import {
  EventSettings,
  GalleryItem,
  TimelineStage,
  VideoItem,
  RSVPConfirmation,
} from '../types';

const ADMIN_TOKEN_KEY = 'mariana15_admin_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

const authHeaders = (): Record<string, string> => {
  const token = getStoredToken() || 'mariana15';
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'x-admin-pin': token.replace(/^admin_token_/, '') || 'mariana15',
  };
  return headers;
};

export const api = {
  // Settings
  async getSettings(): Promise<EventSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Falha ao carregar configurações');
    return res.json();
  },

  async updateSettings(settings: Partial<EventSettings>): Promise<EventSettings> {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao atualizar configurações');
    }
    const data = await res.json();
    if (data.token) {
      setStoredToken(data.token);
    }
    return data.settings;
  },

  async changePin(currentPin: string, newPin: string): Promise<{ success: boolean; message?: string; token?: string }> {
    const res = await fetch('/api/settings/change-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ currentPin, newPin }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao alterar senha');
    }
    const data = await res.json();
    if (data.token) {
      setStoredToken(data.token);
    }
    return data;
  },

  // Timeline
  async getTimeline(): Promise<TimelineStage[]> {
    const res = await fetch('/api/timeline');
    if (!res.ok) throw new Error('Falha ao carregar linha do tempo');
    return res.json();
  },

  async updateTimeline(stages: TimelineStage[]): Promise<TimelineStage[]> {
    const res = await fetch('/api/timeline', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(stages),
    });
    if (!res.ok) throw new Error('Falha ao atualizar linha do tempo');
    const data = await res.json();
    return data.timeline;
  },

  // Gallery
  async getGallery(category?: string): Promise<GalleryItem[]> {
    const url = category && category !== 'Todos'
      ? `/api/gallery?category=${encodeURIComponent(category)}`
      : '/api/gallery';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar galeria');
    return res.json();
  },

  async addGalleryItem(item: Partial<GalleryItem>): Promise<GalleryItem> {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Falha ao adicionar item na galeria');
    return res.json();
  },

  async updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem> {
    const res = await fetch(`/api/gallery/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Falha ao atualizar item');
    return res.json();
  },

  async deleteGalleryItem(id: string): Promise<void> {
    const res = await fetch(`/api/gallery/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error('Falha ao excluir foto');
  },

  async reorderGallery(orderedIds: string[]): Promise<GalleryItem[]> {
    const res = await fetch('/api/gallery/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ orderedIds }),
    });
    if (!res.ok) throw new Error('Falha ao reordenar fotos');
    const data = await res.json();
    return data.gallery;
  },

  // Videos
  async getVideos(): Promise<VideoItem[]> {
    const res = await fetch('/api/videos');
    if (!res.ok) throw new Error('Falha ao carregar vídeos');
    return res.json();
  },

  async addVideo(video: Partial<VideoItem>): Promise<VideoItem> {
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(video),
    });
    if (!res.ok) throw new Error('Falha ao adicionar vídeo');
    return res.json();
  },

  async updateVideo(id: string, updates: Partial<VideoItem>): Promise<VideoItem> {
    const res = await fetch(`/api/videos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Falha ao atualizar vídeo');
    return res.json();
  },

  async deleteVideo(id: string): Promise<void> {
    const res = await fetch(`/api/videos/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error('Falha ao excluir vídeo');
  },

  // RSVP
  async submitRsvp(rsvp: { name: string; guestsCount: number; phone: string; message?: string }): Promise<RSVPConfirmation> {
    const res = await fetch('/api/rsvps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rsvp),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao confirmar presença');
    }
    const data = await res.json();
    return data.rsvp;
  },

  async getRsvps(): Promise<RSVPConfirmation[]> {
    const res = await fetch('/api/rsvps', {
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error('Falha ao carregar lista de presença');
    return res.json();
  },

  async deleteRsvp(id: string): Promise<void> {
    const res = await fetch(`/api/rsvps/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error('Falha ao excluir confirmação');
  },

  // Auth
  async loginAdmin(pin: string): Promise<{ success: boolean; token?: string; message?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (data.token) {
      setStoredToken(data.token);
    }
    return data;
  },

  async verifyAdmin(): Promise<boolean> {
    const token = getStoredToken();
    if (!token) return false;
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    return Boolean(data.valid);
  },

  // Media Upload (Photos & Videos with progress support)
  uploadMedia(
    file: File,
    onProgress?: (percent: number, loaded: number, total: number) => void
  ): Promise<{ url: string; filename: string }> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);

      const token = getStoredToken() || 'mariana15';
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('x-admin-pin', token.replace(/^admin_token_/, '') || 'mariana15');

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent, event.loaded, event.total);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch {
            resolve({ url: xhr.responseText, filename: file.name });
          }
        } else {
          let errorMsg = 'Falha no upload do arquivo.';
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.error) errorMsg = data.error;
          } catch {
            if (xhr.status === 413) {
              errorMsg = 'O arquivo excede o limite máximo de 500MB.';
            } else if (xhr.status === 401 || xhr.status === 403) {
              errorMsg = 'Acesso não autorizado. Por favor, confirme a senha de administrador.';
            }
          }
          reject(new Error(errorMsg));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Erro de conexão durante o envio. Verifique a rede e tente novamente.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Tempo limite excedido ao enviar o vídeo.'));
      };

      xhr.send(formData);
    });
  },

  async extractVideoFrame(params: {
    videoUrl: string;
    timestamp?: number;
    videoId?: string;
  }): Promise<{ thumbnailUrl: string }> {
    const res = await fetch('/api/videos/extract-frame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao capturar frame real do vídeo.');
    }
    return res.json();
  },
};

