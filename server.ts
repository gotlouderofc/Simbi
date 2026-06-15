import express from 'express';
import path from 'path';
import crypto from 'crypto';

const app = express();
const PORT = 3000;

// Middleware to parse JSON with increased limit to handle large screenplay PDFs/documents
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

interface DownloadItem {
  filename: string;
  content: string; // Base64-encoded file or plain raw text
  isBase64: boolean;
  contentType: string;
  createdAt: number;
}

// In-memory registry to hold temporary file exports
const downloadsRegistry = new Map<string, DownloadItem>();

// Clean up expired downloads (retains files for 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [token, item] of downloadsRegistry.entries()) {
    if (now - item.createdAt > 10 * 60 * 1000) {
      downloadsRegistry.delete(token);
    }
  }
}, 60 * 1000); // Check every minute

// API endpoint to store a generated script PDF or .simbidoc file for external system browser download
app.post('/api/prepare-download', (req, res) => {
  try {
    const { filename, content, isBase64, contentType } = req.body;

    if (!filename || !content) {
      return res.status(400).json({ error: 'Missing mandatory file data.' });
    }

    // Generate secure random download token
    const token = crypto.randomBytes(16).toString('hex');
    
    downloadsRegistry.set(token, {
      filename,
      content,
      isBase64: !!isBase64,
      contentType: contentType || 'application/octet-stream',
      createdAt: Date.now()
    });

    const downloadUrl = `/api/download?token=${token}`;
    return res.json({ success: true, token, downloadUrl });
  } catch (error: any) {
    console.error('Failure inside prepare-download API:', error);
    return res.status(500).json({ error: 'Failed to prepare download session.' });
  }
});

// GET endpoint accessed via the external system default web browser
app.get('/api/download', (req, res) => {
  try {
    const token = req.query.token as string;

    if (!token) {
      return res.status(400).send('<html><body><h3>Error: Missing secure download token.</h3></body></html>');
    }

    const item = downloadsRegistry.get(token);

    if (!item) {
      return res.status(404).send(
        `<html>
           <head>
             <meta name="viewport" content="width=device-width, initial-scale=1">
             <style>
               body { font-family: -apple-system, sans-serif; text-align: center; padding: 40px 20px; color: #333; background: #faf8f5; }
               .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 400px; margin: 0 auto; border: 1px solid #e7eaec; }
               h3 { color: #5d8f25; margin-top: 0; }
               p { font-size: 14px; line-height: 1.5; color: #666; }
             </style>
           </head>
           <body>
             <div class="card">
               <h3>Link Expired or Invalid</h3>
               <p>Your Simbi download ticket has expired or is invalid. Please go back to the app and export again to generate a fresh link.</p>
             </div>
           </body>
         </html>`
      );
    }

    // Set standard attachment response headers to trigger external browser download
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.filename)}"`);
    res.setHeader('Content-Type', item.contentType);

    if (item.isBase64) {
      const fileBuffer = Buffer.from(item.content, 'base64');
      return res.send(fileBuffer);
    } else {
      return res.send(item.content);
    }
  } catch (error: any) {
    console.error('Download retrieval failed:', error);
    return res.status(500).send('<html><body><h3>Internal download processing failure. Please try again.</h3></body></html>');
  }
});

async function startServer() {
  // Vite dev server mounting in non-production mode
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend assets from dist in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Simbi Server] running on http://localhost:${PORT}`);
  });
}

startServer();
