import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/routes';
import { UPLOADS_DIR } from './server/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Streaming endpoint for videos & media in /uploads with full HTTP 206 Partial Content (Range) support
  app.get('/uploads/:filename', (req, res, next) => {
    const safeName = path.basename(req.params.filename);
    const filePath = path.join(UPLOADS_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      return next();
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const lower = safeName.toLowerCase();
    let contentType = 'application/octet-stream';
    if (lower.endsWith('.mp4') || lower.endsWith('.m4v')) contentType = 'video/mp4';
    else if (lower.endsWith('.webm')) contentType = 'video/webm';
    else if (lower.endsWith('.mov')) contentType = 'video/mp4';
    else if (lower.endsWith('.ogv') || lower.endsWith('.ogg')) contentType = 'video/ogg';
    else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (lower.endsWith('.png')) contentType = 'image/png';
    else if (lower.endsWith('.webp')) contentType = 'image/webp';
    else if (lower.endsWith('.mp3')) contentType = 'audio/mpeg';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Accept-Ranges', 'bytes');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).end();
        return;
      }

      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });
      res.on('close', () => file.destroy());
      file.on('error', () => {
        if (!res.headersSent) res.status(500).end();
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      });
      const file = fs.createReadStream(filePath);
      res.on('close', () => file.destroy());
      file.on('error', () => {
        if (!res.headersSent) res.status(500).end();
      });
      file.pipe(res);
    }
  });

  // Fallback static serving for other media
  app.use('/uploads', express.static(UPLOADS_DIR));
  app.use('/audio', express.static(path.resolve(__dirname, 'public/audio')));

  // Mount API endpoints
  app.use('/api', apiRouter);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`✨ Servidor do X V da Mari rodando em http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar servidor:', err);
  process.exit(1);
});
