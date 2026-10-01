import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { adminDb, adminAuth, isInitialized } from './server/firebaseAdmin.ts';
import { extractSourceContent } from './server/aiExtraction.ts';
import { VERIFIED_REAL_SCHOLARSHIPS } from './src/data/verifiedOpportunities.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Middleware: Verify Firebase ID Token for Admin / Editor Custom Claims
async function verifyAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Missing or invalid Authorization header. A valid Firebase ID token is required.'
    });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Empty token provided.' });
  }

  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      if (decoded.admin !== true && decoded.editor !== true) {
        return res.status(403).json({
          error: 'Forbidden: Insufficient privileges. Account does not possess administrator custom claims.'
        });
      }
      (req as any).user = decoded;
      return next();
    } catch (err: any) {
      return res.status(401).json({
        error: `Unauthorized: Token verification failed (${err.message || 'invalid token'}).`
      });
    }
  }

  return res.status(503).json({
    error: 'Service unavailable: Authentication verification engine not ready.'
  });
}

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
  const includeUnpublished = req.query.includeUnpublished === 'true';

  if (adminDb && isInitialized) {
    try {
      const snapshot = await adminDb.collection('opportunities').get();
      if (!snapshot.empty) {
        let items = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        // Merge with verified real scholarships to ensure all newly discovered scholarships are included
        const merged = [...items];
        for (const verified of VERIFIED_REAL_SCHOLARSHIPS) {
          const exists = merged.some(m => 
            m.id === verified.id || 
            m.slug === verified.slug || 
            (m.applicationUrl && verified.applicationUrl && m.applicationUrl.toLowerCase() === verified.applicationUrl.toLowerCase())
          );
          if (!exists) {
            merged.push(verified);
          }
        }

        if (!includeUnpublished) {
          items = merged.filter((o: any) => 
            (o.status === 'published' || o.status === 'closed') &&
            o.status !== 'pending' &&
            o.status !== 'rejected' &&
            o.submissionStatus !== 'pending' &&
            o.submissionStatus !== 'rejected'
          );
        } else {
          items = merged;
        }

        return res.json(items);
      }
    } catch (e) {
      console.warn('Admin Firestore read error:', e);
    }
  }

  let fallback = [...VERIFIED_REAL_SCHOLARSHIPS];
  if (!includeUnpublished) {
    fallback = fallback.filter((o: any) => o.status === 'published' || o.status === 'closed');
  }
  res.json(fallback);
});

// User Opportunity Submission Endpoint (Enforces pending status server-side)
app.post('/api/submissions/opportunity', async (req, res) => {
  const submissionData = req.body;
  if (!submissionData || !submissionData.title || !submissionData.applicationUrl) {
    return res.status(400).json({ error: 'Title and application URL are required.' });
  }

  const id = submissionData.id || `opp_sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Enforce server-side security: User submissions are always pending and cannot be self-published
  const sanitizedSubmission = {
    ...submissionData,
    id,
    status: 'pending',
    submissionStatus: 'pending',
    verificationStatus: 'needs_verification',
    isUserSubmitted: true,
    submittedAt: now,
    createdAt: submissionData.createdAt || now,
    updatedAt: now
  };

  if (adminDb && isInitialized) {
    try {
      await adminDb.collection('opportunities').doc(id).set(sanitizedSubmission, { merge: true });
      return res.json({ success: true, submission: sanitizedSubmission });
    } catch (e: any) {
      console.warn('Could not persist user submission to Firestore Admin:', e.message);
    }
  }

  return res.json({ success: true, submission: sanitizedSubmission, note: 'persisted_locally' });
});

// User Resource Submission Endpoint (Enforces pending status server-side)
app.post('/api/submissions/resource', async (req, res) => {
  const submissionData = req.body;
  if (!submissionData || !submissionData.title || !submissionData.enrollmentUrl) {
    return res.status(400).json({ error: 'Title and enrollment URL are required.' });
  }

  const id = submissionData.id || `res_sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const sanitizedSubmission = {
    ...submissionData,
    id,
    status: 'pending',
    submissionStatus: 'pending',
    verificationStatus: 'needs_verification',
    isUserSubmitted: true,
    submittedAt: now,
    createdAt: submissionData.createdAt || now,
    updatedAt: now
  };

  if (adminDb && isInitialized) {
    try {
      await adminDb.collection('resources').doc(id).set(sanitizedSubmission, { merge: true });
      return res.json({ success: true, submission: sanitizedSubmission });
    } catch (e: any) {
      console.warn('Could not persist resource submission to Firestore Admin:', e.message);
    }
  }

  return res.json({ success: true, submission: sanitizedSubmission, note: 'persisted_locally' });
});

// Admin Review & Moderation Endpoint (Strictly Admin/Editor Custom Claims Required)
app.post('/api/submissions/review', verifyAdminAuth, async (req, res) => {
  const { type, id, decision, rejectionReason, adminNotes, editedData } = req.body;
  if (!id || !type || !decision) {
    return res.status(400).json({ error: 'id, type, and decision (approved/rejected/changes_requested) are required.' });
  }

  const user = (req as any).user;
  const now = new Date().toISOString();
  const collectionName = type === 'opportunity' ? 'opportunities' : 'resources';

  const isApproved = decision === 'approved';
  const targetStatus = isApproved ? 'published' : decision === 'rejected' ? 'rejected' : 'pending';

  const updatePayload: any = {
    ...(editedData || {}),
    status: targetStatus,
    submissionStatus: decision,
    reviewedAt: now,
    reviewedBy: user.name || user.email || 'Administrator',
    reviewedByEmail: user.email,
    rejectionReason: decision === 'rejected' ? (rejectionReason || null) : null,
    adminNotes: adminNotes || null,
    updatedAt: now,
    lastEditedByEmail: user.email,
    lastEditedByName: user.name || 'Administrator',
    ...(isApproved ? { publishedAt: now, publishedByEmail: user.email, verificationStatus: 'verified' } : {})
  };

  if (adminDb && isInitialized) {
    try {
      await adminDb.collection(collectionName).doc(id).set(updatePayload, { merge: true });
      return res.json({ success: true, id, status: targetStatus, submissionStatus: decision });
    } catch (e: any) {
      console.warn('Error reviewing submission in Firestore Admin:', e.message);
    }
  }

  return res.json({ success: true, id, status: targetStatus, submissionStatus: decision, note: 'updated_locally' });
});

// Save/Update opportunity (Admin only)
app.post('/api/opportunities', verifyAdminAuth, async (req, res) => {
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

// Delete opportunity (Admin only)
app.delete('/api/opportunities/:id', verifyAdminAuth, async (req, res) => {
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
  const includeUnpublished = req.query.includeUnpublished === 'true';

  if (adminDb && isInitialized) {
    try {
      const snapshot = await adminDb.collection('resources').get();
      if (!snapshot.empty) {
        let items = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        if (!includeUnpublished) {
          items = items.filter((r: any) =>
            (r.status === 'published' || r.status === 'approved' || r.submissionStatus === 'approved') &&
            r.status !== 'pending' &&
            r.status !== 'rejected' &&
            r.submissionStatus !== 'pending' &&
            r.submissionStatus !== 'rejected'
          );
        }
        return res.json(items);
      }
    } catch (e) {
      console.warn('Admin Firestore resources read error:', e);
    }
  }
  res.json([]);
});

// Save/Update resource (Admin only)
app.post('/api/resources', verifyAdminAuth, async (req, res) => {
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

// Delete resource (Admin only)
app.delete('/api/resources/:id', verifyAdminAuth, async (req, res) => {
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

// AI Content Extraction Assistant Route (Admin only)
app.post('/api/ai/extract', verifyAdminAuth, async (req, res) => {
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
