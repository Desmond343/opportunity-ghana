import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { adminDb, adminAuth, isInitialized } from './server/firebaseAdmin';
import { extractSourceContent } from './server/aiExtraction';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// API Health & Firebase Status
app.get('/api/health', async (req, res) => {
  let authStatus = 'disconnected';
  let firestoreStatus = 'unknown';

  if (isInitialized && adminAuth) {
    try {
      await adminAuth.listUsers(1);
      authStatus = 'connected_and_verified';
    } catch (e: any) {
      authStatus = `error: ${e.message}`;
    }
  }

  if (isInitialized && adminDb) {
    try {
      await adminDb.collection('opportunities').limit(1).get();
      firestoreStatus = 'connected_and_active';
    } catch (e: any) {
      if (e.code === 5 || (e.message && e.message.includes('NOT_FOUND'))) {
        firestoreStatus = 'database_not_created_in_console_yet';
      } else {
        firestoreStatus = `error: ${e.message}`;
      }
    }
  }

  res.json({
    status: 'ok',
    app: 'Opportunity Ghana',
    firebaseAdmin: {
      initialized: isInitialized,
      projectId: 'opportunity-ghana',
      hostingSite: 'opportunity-ghana',
      auth: authStatus,
      firestore: firestoreStatus
    },
    timestamp: new Date().toISOString()
  });
});

// Get opportunities
app.get('/api/opportunities', async (req, res) => {
  if (adminDb && isInitialized) {
    try {
      const snapshot = await adminDb.collection('opportunities').get();
      if (!snapshot.empty) {
        const items = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        return res.json(items);
      }
    } catch (e) {
      console.warn('Admin Firestore read error:', e);
    }
  }
  res.json([]);
});

// Save/Update opportunity
app.post('/api/opportunities', async (req, res) => {
  const item = req.body;
  if (!item || !item.id) {
    return res.status(400).json({ error: 'Opportunity object with id is required' });
  }

  if (adminDb && isInitialized) {
    try {
      await adminDb.collection('opportunities').doc(item.id).set(item, { merge: true });
      return res.json({ success: true, opportunity: item });
    } catch (e: any) {
      console.warn('Could not persist to Firestore Admin:', e.message);
    }
  }
  return res.json({ success: true, opportunity: item, note: 'persisted_locally' });
});

// Delete opportunity
app.delete('/api/opportunities/:id', async (req, res) => {
  const { id } = req.params;
  if (adminDb && isInitialized) {
    try {
      await adminDb.collection('opportunities').doc(id).delete();
      return res.json({ success: true, id });
    } catch (e: any) {
      console.warn('Firestore admin delete error:', e.message);
    }
  }
  res.json({ success: true, id, note: 'deleted_locally' });
});

// Get resources
app.get('/api/resources', async (req, res) => {
  if (adminDb && isInitialized) {
    try {
      const snapshot = await adminDb.collection('resources').get();
      if (!snapshot.empty) {
        const items = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        return res.json(items);
      }
    } catch (e) {
      console.warn('Admin Firestore resources read error:', e);
    }
  }
  res.json([]);
});

// Save/Update resource
app.post('/api/resources', async (req, res) => {
  const item = req.body;
  if (!item || !item.id) {
    return res.status(400).json({ error: 'Resource object with id is required' });
  }

  if (adminDb && isInitialized) {
    try {
      await adminDb.collection('resources').doc(item.id).set(item, { merge: true });
      return res.json({ success: true, resource: item });
    } catch (e: any) {
      console.warn('Could not persist resource to Firestore Admin:', e.message);
    }
  }
  return res.json({ success: true, resource: item, note: 'persisted_locally' });
});

// Delete resource
app.delete('/api/resources/:id', async (req, res) => {
  const { id } = req.params;
  if (adminDb && isInitialized) {
    try {
      await adminDb.collection('resources').doc(id).delete();
      return res.json({ success: true, id });
    } catch (e: any) {
      console.warn('Firestore admin delete resource error:', e.message);
    }
  }
  res.json({ success: true, id, note: 'deleted_locally' });
});

// AI Content Extraction Assistant Route
app.post('/api/ai/extract', async (req, res) => {
  try {
    const { sourceUrl, textContent } = req.body;
    if (!textContent && !sourceUrl) {
      return res.status(400).json({ error: 'Please provide either source text or a source URL.' });
    }

    const result = await extractSourceContent(sourceUrl || '', textContent || '');
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ai/extract:', error);
    return res.status(500).json({ error: error.message || 'Failed to extract content' });
  }
});

// PWA Service Worker specific headers and direct serving
app.get('/sw.js', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Content-Type', 'application/javascript');
  const swDist = path.resolve(process.cwd(), 'dist', 'sw.js');
  if (fs.existsSync(swDist)) {
    return res.sendFile(swDist);
  }
  next();
});

// Vite Middleware for Development / Static file server for Production
async function setupVite() {
  const httpServer = http.createServer(app);

  if (!isProduction) {
    delete (globalThis as any).__dirname;
    delete (global as any).__dirname;
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Opportunity Ghana] Server listening on port ${PORT}`);
  });
}

setupVite();
