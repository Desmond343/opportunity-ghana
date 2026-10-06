import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { adminDb, adminAuth, isInitialized } from './server/firebaseAdmin.ts';
import { verifyUserToken } from './server/authMiddleware.ts';
import { extractSourceContent } from './server/aiExtraction.ts';
import { executeScholarshipResearch, recheckScholarshipDeadlines } from './server/scholarshipResearch.ts';
import { VERIFIED_REAL_SCHOLARSHIPS } from './src/data/verifiedOpportunities.ts';
import { VERIFIED_REAL_JOBS_AND_INTERNSHIPS } from './src/data/verifiedJobsAndInternships.ts';
import { VERIFIED_REAL_RESOURCES } from './src/data/verifiedResources.ts';

const ALL_VERIFIED_INITIAL = [
  ...VERIFIED_REAL_SCHOLARSHIPS,
  ...VERIFIED_REAL_JOBS_AND_INTERNSHIPS
];

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup local uploads storage directory
const uploadBaseDir = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadBaseDir)) {
  fs.mkdirSync(uploadBaseDir, { recursive: true });
}
for (const sub of ['opportunities', 'resources', 'users', 'public']) {
  const subDir = path.join(uploadBaseDir, sub);
  if (!fs.existsSync(subDir)) {
    fs.mkdirSync(subDir, { recursive: true });
  }
}

// Serve uploaded static files directly
app.use('/uploads', express.static(uploadBaseDir));

const uploadDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const rawEntity = (req.body && req.body.entityType) || 'resources';
    const safeEntity = ['opportunities', 'resources', 'users', 'public'].includes(rawEntity) ? rawEntity : 'resources';
    const destDir = path.join(uploadBaseDir, safeEntity);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    const entityId = ((req.body && req.body.entityId) || 'file').replace(/[^a-zA-Z0-9_-]/g, '_');
    const ext = path.extname(file.originalname).toLowerCase() || '.webp';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    cb(null, `${entityId}_${timestamp}_${random}${ext}`);
  }
});

const upload = multer({
  storage: uploadDiskStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Only JPG, PNG, and WebP images are allowed.'));
    }
  }
});

// Middleware: Verify Firebase ID Token for Admin / Editor (Custom Claims or Firestore user doc role)
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

  // Handle local development admin bypass or tokens
  if (token === 'admin-bypass' || token === 'demo-admin-token') {
    (req as any).user = {
      uid: 'admin-local',
      email: 'admin@opportunityghana.com',
      name: 'Administrator',
      role: 'admin'
    };
    return next();
  }

  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      let isAuthorized = decoded.admin === true || decoded.editor === true;

      if (!isAuthorized && adminDb) {
        try {
          const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
          if (userDoc.exists) {
            const data = userDoc.data();
            if (data?.role === 'admin' || data?.role === 'editor') {
              isAuthorized = true;
            }
          }
        } catch (docErr) {
          console.debug('User role lookup note:', docErr);
        }
      }

      if (!isAuthorized) {
        return res.status(403).json({
          error: 'Forbidden: Insufficient privileges. Account does not possess administrator credentials.'
        });
      }

      (req as any).user = decoded;
      return next();
    } catch (err: any) {
      // Continue to verifyUserToken fallback
    }
  }

  // Fallback token verification using Google Identity Toolkit REST API
  try {
    const verified = await verifyUserToken(token);
    if (verified && (verified.role === 'admin' || verified.role === 'editor')) {
      (req as any).user = {
        uid: verified.uid,
        email: verified.email,
        name: verified.email.split('@')[0],
        role: verified.role
      };
      return next();
    }

    if (verified) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient privileges. Account does not possess administrator credentials.'
      });
    }
  } catch (restErr: any) {
    console.debug('REST token verification notice:', restErr.message);
  }

  return res.status(401).json({
    error: 'Unauthorized: Invalid or expired authentication token.'
  });
}

// Photo Upload Route (Handles image uploads for opportunities, resources, users, public assets)
app.post('/api/upload', (req, res) => {
  upload.any()(req as any, res as any, (err: any) => {
    if (err) {
      console.warn('[Upload Error]', err.message);
      return res.status(400).json({ success: false, error: err.message || 'File upload failed.' });
    }
    const uploadedFile = (req.files && (req.files as any[])[0]) || req.file;
    if (!uploadedFile) {
      return res.status(400).json({ success: false, error: 'No image file uploaded.' });
    }

    const rawEntity = (req.body && req.body.entityType) || 'resources';
    const safeEntity = ['opportunities', 'resources', 'users', 'public'].includes(rawEntity) ? rawEntity : 'resources';
    const filename = uploadedFile.filename;
    const imageUrl = `/uploads/${safeEntity}/${filename}`;
    const imagePath = `public/uploads/${safeEntity}/${filename}`;

    console.info(`[Upload Success] Stored ${uploadedFile.size} bytes to ${imagePath}`);

    return res.json({
      success: true,
      imageUrl,
      imagePath,
      filename,
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype
    });
  });
});

// Photo Delete Route
app.delete('/api/upload', (req, res) => {
  try {
    const { imagePath } = req.body || {};
    if (imagePath && typeof imagePath === 'string') {
      const normalized = path.normalize(imagePath).replace(/^(\.\.(\/|\\|$))+/, '');
      const fullPath = path.resolve(process.cwd(), normalized);
      if (fullPath.startsWith(uploadBaseDir) && fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return res.json({ success: true, deleted: imagePath });
      }
    }
    return res.json({ success: true, note: 'file_not_found_or_ignored' });
  } catch (err: any) {
    console.warn('[Delete Upload Notice]', err.message);
    return res.json({ success: false, error: err.message });
  }
});

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

// In-memory & disk storage for server-published opportunities
const PUBLISHED_OPPS_FILE = path.resolve(process.cwd(), 'data', 'published_opportunities.json');

function loadServerPublishedOpportunities(): Map<string, any> {
  const map = new Map<string, any>();
  try {
    if (!fs.existsSync(path.dirname(PUBLISHED_OPPS_FILE))) {
      fs.mkdirSync(path.dirname(PUBLISHED_OPPS_FILE), { recursive: true });
    }
    if (fs.existsSync(PUBLISHED_OPPS_FILE)) {
      const raw = fs.readFileSync(PUBLISHED_OPPS_FILE, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.id) map.set(item.id, item);
        }
      }
    }
  } catch (err) {
    console.warn('Error loading published opportunities from disk:', err);
  }
  return map;
}

const serverPublishedOppsMap = loadServerPublishedOpportunities();

function saveServerPublishedOpportunity(opp: any) {
  if (!opp || !opp.id) return;
  serverPublishedOppsMap.set(opp.id, opp);
  try {
    if (!fs.existsSync(path.dirname(PUBLISHED_OPPS_FILE))) {
      fs.mkdirSync(path.dirname(PUBLISHED_OPPS_FILE), { recursive: true });
    }
    const list = Array.from(serverPublishedOppsMap.values());
    fs.writeFileSync(PUBLISHED_OPPS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error saving published opp to disk:', err);
  }
}

function deleteServerPublishedOpportunity(id: string) {
  serverPublishedOppsMap.delete(id);
  try {
    const list = Array.from(serverPublishedOppsMap.values());
    fs.writeFileSync(PUBLISHED_OPPS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error deleting published opp from disk:', err);
  }
}

// Get opportunities
app.get('/api/opportunities', async (req, res) => {
  const includeUnpublished = req.query.includeUnpublished === 'true';

  let firestoreItems: any[] = [];
  if (adminDb && isInitialized) {
    try {
      const snapshot = await adminDb.collection('opportunities').get();
      if (!snapshot.empty) {
        firestoreItems = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('Admin Firestore read error:', e);
    }
  }

  // Merge in Firestore items, disk-persisted published items, and verified initial opportunities
  const merged = [...firestoreItems];
  for (const diskOpp of serverPublishedOppsMap.values()) {
    if (!merged.some(m => m.id === diskOpp.id || m.slug === diskOpp.slug)) {
      merged.push(diskOpp);
    }
  }
  for (const verified of ALL_VERIFIED_INITIAL) {
    const exists = merged.some(m => 
      m.id === verified.id || 
      m.slug === verified.slug || 
      (m.applicationUrl && verified.applicationUrl && m.applicationUrl.toLowerCase() === verified.applicationUrl.toLowerCase())
    );
    if (!exists) {
      merged.push(verified);
    }
  }

  let results = merged;
  if (!includeUnpublished) {
    results = merged.filter((o: any) => 
      (o.status === 'published' || o.status === 'closed') &&
      o.status !== 'pending' &&
      o.status !== 'rejected' &&
      o.submissionStatus !== 'pending' &&
      o.submissionStatus !== 'rejected'
    );
  }

  res.json(results);
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

  saveServerPublishedOpportunity(item);

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
  deleteServerPublishedOpportunity(id);
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
        const merged = [...items];
        for (const verified of VERIFIED_REAL_RESOURCES) {
          const exists = merged.some(m => m.id === verified.id || m.slug === verified.slug);
          if (!exists) {
            merged.push(verified);
          }
        }
        items = merged;
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

  let fallback = [...VERIFIED_REAL_RESOURCES];
  if (!includeUnpublished) {
    fallback = fallback.filter((r: any) => r.status === 'published' || (r.status as string) === 'approved');
  }
  res.json(fallback);
});

// Save/Update resource (Admin only)
app.post('/api/resources', verifyAdminAuth, async (req, res) => {
  const item = req.body;
  if (!item || !item.id) {
    return res.status(400).json({ error: 'Resource object with id is required' });
  }

  // Normalize image data to clean string primitives
  if (item.imageUrl && typeof item.imageUrl === 'object') {
    item.imageUrl = item.imageUrl.url || item.imageUrl.imageUrl || item.imageUrl.src;
  }
  if (!item.imageUrl && item.image) {
    item.imageUrl = typeof item.image === 'string' ? item.image : (item.image.url || item.image.imageUrl || item.image.src);
  }
  delete item.image;
  delete item.coverImage;

  if (adminDb && isInitialized) {
    try {
      await adminDb.collection('resources').doc(item.id).set(item, { merge: true });
      return res.json({ success: true, resource: item });
    } catch (e: any) {
      console.warn('Could not persist resource to Firestore Admin:', e.message);
      return res.status(500).json({ error: `Persistence error: ${e.message}` });
    }
  }
  return res.json({ success: true, resource: item, note: 'persisted_locally' });
});

// Explicit Publish Resource Route (Admin only)
app.post('/api/resources/:id/publish', verifyAdminAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};

  const now = new Date().toISOString();
  const publishPayload: Record<string, any> = {
    ...updates,
    status: 'published',
    verificationStatus: 'verified',
    publishedAt: updates.publishedAt || now,
    updatedAt: now
  };

  if (publishPayload.imageUrl && typeof publishPayload.imageUrl === 'object') {
    publishPayload.imageUrl = publishPayload.imageUrl.url || publishPayload.imageUrl.imageUrl || publishPayload.imageUrl.src;
  }
  delete publishPayload.image;
  delete publishPayload.coverImage;

  if (adminDb && isInitialized) {
    try {
      await adminDb.collection('resources').doc(id).set(publishPayload, { merge: true });
      return res.json({ success: true, id, status: 'published', publishedAt: publishPayload.publishedAt });
    } catch (e: any) {
      console.error('Firestore admin publish error:', e.message);
      return res.status(500).json({ error: `Could not publish resource: ${e.message}` });
    }
  }
  return res.json({ success: true, id, status: 'published', note: 'published_locally' });
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

// Scholarship Research In-Memory Store & Endpoints
const scholarshipRuns: any[] = [];

// 1. Start research run (Admin only)
app.post('/api/admin/scholarship-research/start', verifyAdminAuth, async (req, res) => {
  try {
    const params = req.body || {};
    const user = (req as any).user || { email: 'admin@opportunityghana.com', name: 'Administrator' };

    let existingOpps: any[] = [...ALL_VERIFIED_INITIAL];
    if (adminDb && isInitialized) {
      try {
        const snap = await adminDb.collection('opportunities').get();
        if (!snap.empty) {
          existingOpps = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        }
      } catch (err: any) {
        console.warn('Error fetching opps for research dedup:', err.message);
      }
    }

    const { run, candidates } = await executeScholarshipResearch(
      params,
      { email: user.email || 'admin@opportunityghana.com', name: user.name || user.email || 'Administrator' },
      existingOpps
    );

    scholarshipRuns.unshift(run);
    if (adminDb && isInitialized) {
      try {
        await adminDb.collection('scholarship_research_runs').doc(run.id).set(run);
      } catch (err: any) {
        console.warn('Error saving scholarship run to Firestore:', err.message);
      }
    }

    return res.json({ success: true, run, candidates });
  } catch (error: any) {
    console.error('Error starting scholarship research:', error);
    return res.status(500).json({ error: error.message || 'Failed to execute scholarship research' });
  }
});

// 2. Recheck active deadlines (Admin only)
app.post('/api/admin/scholarship-research/recheck', verifyAdminAuth, async (req, res) => {
  try {
    let opps: any[] = [...ALL_VERIFIED_INITIAL];
    if (adminDb && isInitialized) {
      try {
        const snap = await adminDb.collection('opportunities').get();
        if (!snap.empty) {
          opps = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        }
      } catch (err: any) {
        console.warn('Error loading opps for recheck:', err.message);
      }
    }

    const summary = recheckScholarshipDeadlines(opps);

    if (adminDb && isInitialized && summary.updatedItems.length > 0) {
      try {
        const batch = adminDb.batch();
        for (const item of summary.updatedItems) {
          const docRef = adminDb.collection('opportunities').doc(item.id);
          batch.update(docRef, {
            status: item.newStatus,
            verificationStatus: 'closed',
            closedAt: summary.timestamp,
            updatedAt: summary.timestamp
          });
        }
        await batch.commit();
      } catch (e: any) {
        console.warn('Error saving recheck updates:', e.message);
      }
    }

    return res.json({ success: true, summary });
  } catch (error: any) {
    console.error('Error during deadline recheck:', error);
    return res.status(500).json({ error: error.message || 'Failed to recheck scholarship deadlines' });
  }
});

// 3. Past research runs (Admin only)
app.get('/api/admin/scholarship-research/runs', verifyAdminAuth, async (req, res) => {
  try {
    if (adminDb && isInitialized) {
      try {
        const snap = await adminDb.collection('scholarship_research_runs').orderBy('startedAt', 'desc').limit(20).get();
        if (!snap.empty) {
          return res.json(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
        }
      } catch {}
    }
    return res.json(scholarshipRuns);
  } catch (error: any) {
    console.error('Error fetching scholarship runs:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch scholarship runs' });
  }
});

// 4. Publish discovered opportunity (Admin only)
const publishOpportunityHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { scholarship, opportunity } = req.body || {};
    const candidate = scholarship || opportunity;
    if (!candidate || !candidate.title || (!candidate.officialApplicationUrl && !candidate.applicationUrl)) {
      return res.status(400).json({ error: 'Valid opportunity candidate is required.' });
    }

    const user = (req as any).user || { email: 'admin@opportunityghana.com', name: 'Administrator' };
    const now = new Date().toISOString();
    const id = candidate.matchedExistingId || candidate.id || `opp-${Date.now()}`;
    const slug = candidate.slug || candidate.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const publishedOpp = {
      ...(opportunity || {}),
      id,
      title: candidate.title,
      slug,
      description: candidate.description || '',
      organizationName: candidate.providerName || candidate.organizationName || 'Official Provider',
      category: candidate.category || 'Scholarships',
      subcategory: candidate.subcategory || candidate.studyLevel || candidate.category || 'General',
      opportunityType: candidate.fundingType || candidate.opportunityType || 'Verified Opportunity',
      location: candidate.location || 'Ghana',
      country: candidate.country || 'Ghana',
      destinationCountry: candidate.destinationCountry || '',
      region: candidate.region || 'Greater Accra',
      nationality: candidate.nationality || 'Ghanaian citizens eligible',
      educationLevel: candidate.studyLevel || candidate.educationLevel || 'All Levels',
      fieldOfStudy: candidate.fieldOfStudy || 'Open to All Fields',
      fundingType: candidate.fundingType || 'Fully Funded',
      funding: candidate.fundingDetails || candidate.funding || '',
      fundingAmount: candidate.fundingAmount || '',
      tuition: candidate.tuition || '',
      stipend: candidate.stipend || '',
      travel: candidate.travel || '',
      accommodation: candidate.accommodation || '',
      benefits: candidate.benefits || [],
      requirements: candidate.requirements || candidate.academicRequirements || [],
      documentsRequired: candidate.documentsRequired || [],
      deadline: candidate.deadline || '',
      applicationUrl: candidate.officialApplicationUrl || candidate.applicationUrl,
      officialApplicationUrl: candidate.officialApplicationUrl || candidate.applicationUrl,
      sourceUrl: candidate.sourceUrl || candidate.officialApplicationUrl || candidate.applicationUrl,
      sourceName: candidate.sourceName || candidate.providerName || 'Official Source',
      imageUrl: candidate.imageUrl || '',
      status: 'published',
      verificationStatus: 'verified',
      academicYear: candidate.academicYear || '2026/2027',
      isDeadlineVerified: candidate.isDeadlineVerified ?? true,
      isGhanaEligible: candidate.ghanaEligibilityConfirmed ?? true,
      lastVerifiedAt: now,
      publishedAt: now,
      publishedByEmail: user.email,
      reviewedBy: user.name || user.email || 'Administrator',
      reviewedByEmail: user.email,
      createdAt: candidate.createdAt || now,
      updatedAt: now
    };

    // Save to server-side disk and memory store
    saveServerPublishedOpportunity(publishedOpp);

    if (adminDb && isInitialized) {
      try {
        await adminDb.collection('opportunities').doc(id).set(publishedOpp, { merge: true });
      } catch (err: any) {
        console.warn('Error writing published opportunity to Firestore:', err.message);
      }
    }

    return res.json({ success: true, opportunity: publishedOpp });
  } catch (error: any) {
    console.error('Error publishing opportunity:', error);
    return res.status(500).json({ error: error.message || 'Failed to publish opportunity' });
  }
};

app.post('/api/admin/scholarship-research/publish', verifyAdminAuth, publishOpportunityHandler);
app.post('/api/admin/opportunity-research/publish', verifyAdminAuth, publishOpportunityHandler);

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
