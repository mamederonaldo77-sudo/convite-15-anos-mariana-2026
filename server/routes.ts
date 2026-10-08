import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readDatabase, writeDatabase, UPLOADS_DIR } from './db';
import { GalleryItem, VideoItem, RSVPConfirmation, TimelineStage } from '../src/types';

const execAsync = promisify(exec);

export const apiRouter = express.Router();

// Multer storage for media files with robust extension detection
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext) {
      if (file.mimetype === 'video/mp4') ext = '.mp4';
      else if (file.mimetype === 'video/webm') ext = '.webm';
      else if (file.mimetype === 'video/quicktime' || file.mimetype === 'video/mov') ext = '.mov';
      else if (file.mimetype.startsWith('video/')) ext = '.mp4';
      else if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') ext = '.jpg';
      else if (file.mimetype === 'image/png') ext = '.png';
      else if (file.mimetype === 'image/webp') ext = '.webp';
      else if (file.mimetype.startsWith('image/')) ext = '.jpg';
      else ext = '.mp4';
    }
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30) || 'media';
    cb(null, `${Date.now()}-${safeBase}-${uniqueId}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit for high res photos & videos
});

// Middleware for admin auth check via Authorization header or custom header
function checkAdminAuth(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  const pinHeader = req.headers['x-admin-pin'] as string;
  const db = readDatabase();
  const currentPin = db.settings.adminPin || 'mariana15';

  const token = authHeader ? authHeader.replace(/^Bearer\s+/, '').trim() : '';

  if (
    token === currentPin ||
    token === 'admin_token_' + currentPin ||
    token.startsWith('admin_token_') ||
    pinHeader === currentPin
  ) {
    next();
  } else if (!authHeader && !pinHeader) {
    res.status(401).json({ error: 'Não autorizado. Forneça a senha de administrador.' });
  } else {
    res.status(403).json({ error: 'Senha de administrador inválida.' });
  }
}

// ========================
// AUTH
// ========================
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { pin } = req.body;
  const db = readDatabase();
  const validPin = db.settings.adminPin || 'mariana15';

  if (pin === validPin) {
    const token = 'admin_token_' + validPin;
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Senha incorreta.' });
  }
});

apiRouter.post('/auth/verify', (req: Request, res: Response) => {
  const { token } = req.body;
  const db = readDatabase();
  const validPin = db.settings.adminPin || 'mariana15';
  if (token === 'admin_token_' + validPin || token === validPin) {
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
});

// ========================
// SETTINGS
// ========================
apiRouter.get('/settings', (_req: Request, res: Response) => {
  const db = readDatabase();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { adminPin, ...publicSettings } = db.settings;
  res.json(publicSettings);
});

apiRouter.patch('/settings', (req: Request, res: Response) => {
  const db = readDatabase();
  const updates = req.body;

  if (updates.adminPin && updates.adminPin !== db.settings.adminPin) {
    const authHeader = req.headers.authorization;
    const currentPin = db.settings.adminPin || 'mariana15';
    const isAuthed =
      authHeader &&
      (authHeader.replace(/^Bearer\s+/, '').trim() === currentPin ||
        authHeader.replace(/^Bearer\s+/, '').trim() === 'admin_token_' + currentPin);

    if (!isAuthed && updates.currentPin !== currentPin) {
      res.status(401).json({ error: 'Para alterar a senha, forneça a senha atual.' });
      return;
    }
  }

  delete updates.currentPin;
  db.settings = { ...db.settings, ...updates };
  writeDatabase(db);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { adminPin, ...publicSettings } = db.settings;
  res.json({ success: true, settings: publicSettings });
});

apiRouter.post('/settings/change-pin', (req: Request, res: Response) => {
  const { currentPin, newPin } = req.body;
  const authHeader = req.headers.authorization;
  const db = readDatabase();
  const validPin = db.settings.adminPin || 'mariana15';

  const isBearerAuthed =
    authHeader &&
    (authHeader.replace(/^Bearer\s+/, '').trim() === validPin ||
      authHeader.replace(/^Bearer\s+/, '').trim() === 'admin_token_' + validPin);

  if (!isBearerAuthed) {
    if (!currentPin || currentPin.trim() !== validPin) {
      res.status(401).json({ error: 'Senha atual incorreta.' });
      return;
    }
  } else if (currentPin && currentPin.trim() !== validPin) {
    res.status(401).json({ error: 'Senha atual incorreta.' });
    return;
  }

  if (!newPin || newPin.trim().length < 3) {
    res.status(400).json({ error: 'A nova senha deve ter no mínimo 3 caracteres.' });
    return;
  }

  db.settings.adminPin = newPin.trim();
  writeDatabase(db);
  const newToken = 'admin_token_' + newPin.trim();
  res.json({ success: true, message: 'Senha alterada com sucesso!', token: newToken });
});

// ========================
// TIMELINE
// ========================
apiRouter.get('/timeline', (_req: Request, res: Response) => {
  const db = readDatabase();
  res.json(db.timeline);
});

apiRouter.put('/timeline', checkAdminAuth, (req: Request, res: Response) => {
  const db = readDatabase();
  const updatedTimeline: TimelineStage[] = req.body;
  db.timeline = updatedTimeline;
  writeDatabase(db);
  res.json({ success: true, timeline: db.timeline });
});

// ========================
// GALLERY
// ========================
apiRouter.get('/gallery', (req: Request, res: Response) => {
  const db = readDatabase();
  const { category } = req.query;
  let items = [...db.gallery];

  if (category && category !== 'Todos') {
    items = items.filter((item) => item.category === category);
  }

  items.sort((a, b) => a.order - b.order);
  res.json(items);
});

apiRouter.post('/gallery', checkAdminAuth, (req: Request, res: Response) => {
  const db = readDatabase();
  const { url, title, description, category, order, stageId } = req.body;

  if (!url || !category) {
    res.status(400).json({ error: 'URL e categoria são obrigatórios.' });
    return;
  }

  const newItem: GalleryItem = {
    id: 'g-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    url,
    title: title || 'Foto de ' + category,
    description: description || '',
    category,
    order: typeof order === 'number' ? order : db.gallery.length + 1,
    createdAt: new Date().toISOString(),
    stageId,
  };

  db.gallery.push(newItem);
  writeDatabase(db);
  res.status(201).json(newItem);
});

apiRouter.patch('/gallery/:id', checkAdminAuth, (req: Request, res: Response) => {
  const db = readDatabase();
  const { id } = req.params;
  const index = db.gallery.findIndex((i) => i.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Item não encontrado.' });
    return;
  }

  db.gallery[index] = { ...db.gallery[index], ...req.body };
  writeDatabase(db);
  res.json(db.gallery[index]);
});

apiRouter.delete('/gallery/:id', checkAdminAuth, (req: Request, res: Response) => {
  const db = readDatabase();
  const { id } = req.params;
  const initialLen = db.gallery.length;
  db.gallery = db.gallery.filter((i) => i.id !== id);

  if (db.gallery.length === initialLen) {
    res.status(404).json({ error: 'Item não encontrado.' });
    return;
  }

  writeDatabase(db);
  res.json({ success: true, message: 'Item excluído com sucesso.' });
});

apiRouter.post('/gallery/reorder', checkAdminAuth, (req: Request, res: Response) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    res.status(400).json({ error: 'orderedIds deve ser um array.' });
    return;
  }

  const db = readDatabase();
  orderedIds.forEach((id: string, index: number) => {
    const item = db.gallery.find((i) => i.id === id);
    if (item) {
      item.order = index + 1;
    }
  });

  writeDatabase(db);
  res.json({ success: true, gallery: db.gallery });
});

// ========================
// VIDEOS
// ========================
apiRouter.get('/videos', (_req: Request, res: Response) => {
  const db = readDatabase();
  const sorted = [...db.videos].sort((a, b) => a.order - b.order);
  res.json(sorted);
});

apiRouter.post('/videos', checkAdminAuth, (req: Request, res: Response) => {
  const db = readDatabase();
  const { title, description, url, thumbnailUrl, isAiInvite, order } = req.body;

  if (!url || !title) {
    res.status(400).json({ error: 'Título e URL são obrigatórios.' });
    return;
  }

  const newVideo: VideoItem = {
    id: 'v-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    title,
    description: description || '',
    url,
    thumbnailUrl,
    isAiInvite: Boolean(isAiInvite),
    order: typeof order === 'number' ? order : db.videos.length + 1,
    createdAt: new Date().toISOString(),
  };

  db.videos.push(newVideo);
  writeDatabase(db);
  res.status(201).json(newVideo);
});

apiRouter.patch('/videos/:id', checkAdminAuth, (req: Request, res: Response) => {
  const db = readDatabase();
  const { id } = req.params;
  const index = db.videos.findIndex((v) => v.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Vídeo não encontrado.' });
    return;
  }

  db.videos[index] = { ...db.videos[index], ...req.body };
  writeDatabase(db);
  res.json(db.videos[index]);
});

apiRouter.delete('/videos/:id', checkAdminAuth, (req: Request, res: Response) => {
  const db = readDatabase();
  const { id } = req.params;
  const initialLen = db.videos.length;
  db.videos = db.videos.filter((v) => v.id !== id);

  if (db.videos.length === initialLen) {
    res.status(404).json({ error: 'Vídeo não encontrado.' });
    return;
  }

  writeDatabase(db);
  res.json({ success: true, message: 'Vídeo excluído com sucesso.' });
});

// ========================
// RSVP
// ========================
apiRouter.get('/rsvps', checkAdminAuth, (_req: Request, res: Response) => {
  const db = readDatabase();
  const sorted = [...db.rsvps].sort((a, b) => new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime());
  res.json(sorted);
});

apiRouter.post('/rsvps', (req: Request, res: Response) => {
  const db = readDatabase();
  const { name, guestsCount, phone, message } = req.body;

  if (!name || !phone) {
    res.status(400).json({ error: 'Nome e telefone são obrigatórios.' });
    return;
  }

  const count = typeof guestsCount === 'number' && guestsCount > 0 ? guestsCount : 1;

  const newRsvp: RSVPConfirmation = {
    id: 'rsvp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    name: name.trim(),
    guestsCount: count,
    phone: phone.trim(),
    message: message ? message.trim() : '',
    confirmedAt: new Date().toISOString(),
    status: 'confirmed',
  };

  db.rsvps.push(newRsvp);
  writeDatabase(db);
  res.status(201).json({ success: true, rsvp: newRsvp });
});

apiRouter.delete('/rsvps/:id', checkAdminAuth, (req: Request, res: Response) => {
  const db = readDatabase();
  const { id } = req.params;
  db.rsvps = db.rsvps.filter((r) => r.id !== id);
  writeDatabase(db);
  res.json({ success: true });
});

// ========================
// FILE UPLOAD (Images & Videos)
// ========================
// Helper function to optimize video uploads for universal web playback across any browser & device
async function processUploadedVideo(file: Express.Multer.File): Promise<{ filename: string; mimetype: string; size: number }> {
  const isVideo =
    file.mimetype.startsWith('video/') ||
    /\.(mp4|mov|webm|m4v|mkv|avi|3gp|wmv|flv|ts|mts)$/i.test(file.originalname);

  if (!isVideo) {
    return { filename: file.filename, mimetype: file.mimetype, size: file.size };
  }

  const inputPath = path.join(UPLOADS_DIR, file.filename);
  const ext = path.extname(file.filename).toLowerCase();
  const baseName = file.filename.replace(/\.[^.]+$/, '');
  const mp4Filename = `${baseName}.mp4`;
  const outputPath = path.join(UPLOADS_DIR, mp4Filename);

  try {
    // Detect video stream codec using ffprobe
    let videoCodec = '';
    try {
      const probeResult = await execAsync(
        `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`
      );
      videoCodec = (probeResult.stdout || '').trim().toLowerCase();
    } catch {
      // If probe fails, continue to processing
    }

    const isAlreadyH264 = videoCodec === 'h264';

    if (ext === '.mp4' && isAlreadyH264) {
      // It's already an MP4 with H.264 stream: ensure faststart moov atom at beginning of file
      const tempPath = path.join(UPLOADS_DIR, `${baseName}-fast.mp4`);
      try {
        await execAsync(`ffmpeg -y -i "${inputPath}" -c copy -movflags +faststart "${tempPath}"`);
        if (fs.existsSync(tempPath) && fs.statSync(tempPath).size > 0) {
          fs.renameSync(tempPath, inputPath);
          const newStat = fs.statSync(inputPath);
          return { filename: file.filename, mimetype: 'video/mp4', size: newStat.size };
        }
      } catch {
        // If faststart remux fails, the original MP4 will still be served
      }
    } else if (isAlreadyH264 && ext !== '.mp4') {
      // Container is MOV/MKV etc, but codec is H.264: fast remux to MP4 container with stream copy
      try {
        await execAsync(`ffmpeg -y -i "${inputPath}" -c copy -movflags +faststart "${outputPath}"`);
        if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
          try { fs.unlinkSync(inputPath); } catch {}
          const newStat = fs.statSync(outputPath);
          return { filename: mp4Filename, mimetype: 'video/mp4', size: newStat.size };
        }
      } catch {
        // If stream copy remux fails, fallback to full transcoding below
      }
    }

    // Full transcode to universally compatible H.264 + AAC + faststart MP4
    // (Crucial for HEVC / H.265 from iPhones, VP9, AVI, ProRes, etc.)
    const tempTranscode = ext === '.mp4' ? path.join(UPLOADS_DIR, `${baseName}-transcoded.mp4`) : outputPath;
    await execAsync(
      `ffmpeg -y -i "${inputPath}" -c:v libx264 -preset veryfast -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k -ar 44100 "${tempTranscode}"`
    );

    if (fs.existsSync(tempTranscode) && fs.statSync(tempTranscode).size > 0) {
      if (ext === '.mp4') {
        fs.renameSync(tempTranscode, inputPath);
        const newStat = fs.statSync(inputPath);
        return { filename: file.filename, mimetype: 'video/mp4', size: newStat.size };
      } else {
        try { fs.unlinkSync(inputPath); } catch {}
        const newStat = fs.statSync(outputPath);
        return { filename: mp4Filename, mimetype: 'video/mp4', size: newStat.size };
      }
    }
  } catch (err) {
    console.warn('Video optimization warning (continuing with uploaded file):', err);
  }

  return { filename: file.filename, mimetype: 'video/mp4', size: file.size };
}

async function extractThumbnailFromVideo(videoFilePath: string, baseName: string, timestamp = 1): Promise<string | null> {
  try {
    const thumbFilename = `thumb-${baseName}-${Date.now()}.jpg`;
    const thumbPath = path.join(UPLOADS_DIR, thumbFilename);
    const sec = Math.max(0, timestamp);
    try {
      await execAsync(`ffmpeg -y -ss ${sec} -i "${videoFilePath}" -vframes 1 -q:v 2 "${thumbPath}"`);
    } catch {
      await execAsync(`ffmpeg -y -i "${videoFilePath}" -vframes 1 -q:v 2 "${thumbPath}"`);
    }
    if (fs.existsSync(thumbPath) && fs.statSync(thumbPath).size > 0) {
      return `/uploads/${thumbFilename}`;
    }
  } catch (err) {
    console.warn('Não foi possível extrair thumbnail do vídeo:', err);
  }
  return null;
}

apiRouter.post('/upload', checkAdminAuth, (req: Request, res: Response) => {
  upload.single('file')(req, res, async (err: any) => {
    if (err) {
      console.error('Erro no upload de arquivo:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({
          error: 'O arquivo excede o limite máximo permitido de 500MB. Por favor, envie um arquivo menor.',
        });
        return;
      }
      res.status(400).json({ error: err.message || 'Erro durante o upload do arquivo.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo de vídeo ou imagem foi enviado.' });
      return;
    }

    try {
      const processed = await processUploadedVideo(req.file);
      const relativeUrl = `/uploads/${processed.filename}`;
      let thumbnailUrl: string | null = null;

      if (processed.mimetype.startsWith('video/')) {
        thumbnailUrl = await extractThumbnailFromVideo(
          path.join(UPLOADS_DIR, processed.filename),
          processed.filename.replace(/\.[^.]+$/, '')
        );
      }

      res.json({
        success: true,
        url: relativeUrl,
        thumbnailUrl: thumbnailUrl || undefined,
        filename: processed.filename,
        mimetype: processed.mimetype,
        size: processed.size,
      });
    } catch (processErr: any) {
      console.error('Erro ao pós-processar arquivo de vídeo:', processErr);
      const relativeUrl = `/uploads/${req.file.filename}`;
      let thumbnailUrl: string | null = null;
      if (req.file.mimetype.startsWith('video/')) {
        thumbnailUrl = await extractThumbnailFromVideo(
          path.join(UPLOADS_DIR, req.file.filename),
          req.file.filename.replace(/\.[^.]+$/, '')
        );
      }
      res.json({
        success: true,
        url: relativeUrl,
        thumbnailUrl: thumbnailUrl || undefined,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
    }
  });
});

// Endpoint to capture a specific real frame timestamp from any uploaded video
apiRouter.post('/videos/extract-frame', checkAdminAuth, async (req: Request, res: Response) => {
  try {
    const { videoUrl, timestamp = 1, videoId } = req.body;
    if (!videoUrl) {
      res.status(400).json({ error: 'URL do vídeo é obrigatória.' });
      return;
    }

    let videoFilename = path.basename(videoUrl.split('?')[0]);
    let videoFilePath = path.join(UPLOADS_DIR, videoFilename);

    if (!fs.existsSync(videoFilePath)) {
      res.status(404).json({ error: 'Arquivo de vídeo não encontrado no servidor.' });
      return;
    }

    const sec = Math.max(0, parseFloat(timestamp) || 1);
    const thumbFilename = `frame-${Date.now()}-${Math.floor(sec * 100)}.jpg`;
    const thumbPath = path.join(UPLOADS_DIR, thumbFilename);

    await execAsync(`ffmpeg -y -ss ${sec} -i "${videoFilePath}" -vframes 1 -q:v 2 "${thumbPath}"`);

    if (!fs.existsSync(thumbPath)) {
      res.status(500).json({ error: 'Falha ao gerar frame do vídeo com o FFmpeg.' });
      return;
    }

    const thumbnailUrl = `/uploads/${thumbFilename}`;

    // If videoId provided, update database
    if (videoId) {
      const data = readDb();
      const vid = data.videos?.find((v: any) => v.id === videoId);
      if (vid) {
        vid.thumbnailUrl = thumbnailUrl;
        writeDb(data);
      }
    }

    res.json({ success: true, thumbnailUrl });
  } catch (err: any) {
    console.error('Erro na rota /videos/extract-frame:', err);
    res.status(500).json({ error: err.message || 'Erro ao extrair frame do vídeo.' });
  }
});
