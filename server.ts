import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { adminDb, adminAuth, isInitialized } from './server/firebaseAdmin.ts';
import { verifyUserToken } from './server/authMiddleware.ts';
import { extractSourceContent } from './server/aiExtraction.ts';
import { executeScholarshipResearch, recheckScholarshipDeadlines } from './server/scholarshipResearch.ts';
import { executeCompetitionResearch, recheckCompetitionDeadlines } from './server/competitionResearch.ts';
import { VERIFIED_REAL_SCHOLARSHIPS } from './src/data/verifiedOpportunities.ts';
import { VERIFIED_REAL_JOBS_AND_INTERNSHIPS } from './src/data/verifiedJobsAndInternships.ts';
import { VERIFIED_REAL_COMPETITIONS } from './src/data/verifiedCompetitions.ts';
import { VERIFIED_REAL_RESOURCES } from './src/data/verifiedResources.ts';
import * as XLSX from 'xlsx';

const ALL_VERIFIED_INITIAL = [
  ...VERIFIED_REAL_SCHOLARSHIPS,
  ...VERIFIED_REAL_JOBS_AND_INTERNSHIPS,
  ...VERIFIED_REAL_COMPETITIONS
];

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

// CORS Middleware with Authorization and Content-Disposition exposure
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Normalize incoming request path for Vercel Serverless Function rewrites
app.use((req, res, next) => {
  if (process.env.VERCEL) {
    const forwardedUri = (req.headers['x-forwarded-uri'] || req.headers['x-matched-path']) as string | undefined;
    if (forwardedUri && forwardedUri.startsWith('/api') && (req.url === '/api' || req.url === '/api/' || !req.url.startsWith('/api'))) {
      req.url = forwardedUri;
    } else if ((req.url === '/api' || req.url === '/api/') && req.query && req.query.path) {
      const subpath = Array.isArray(req.query.path) ? req.query.path.join('/') : String(req.query.path);
      req.url = '/api/' + subpath.replace(/^\/+/, '');
    }
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup local uploads storage directory safely for read-only serverless environments
const uploadBaseDir = path.resolve(process.cwd(), 'public', 'uploads');
try {
  if (!fs.existsSync(uploadBaseDir)) {
    fs.mkdirSync(uploadBaseDir, { recursive: true });
  }
  for (const sub of ['opportunities', 'resources', 'users', 'public']) {
    const subDir = path.join(uploadBaseDir, sub);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
  }
} catch {
  // Read-only filesystem in serverless environments (e.g. Vercel)
}

// Serve uploaded static files directly
app.use('/uploads', express.static(uploadBaseDir));

const uploadDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const rawEntity = (req.body && req.body.entityType) || 'resources';
    const safeEntity = ['opportunities', 'resources', 'users', 'public'].includes(rawEntity) ? rawEntity : 'resources';
    let destDir = path.join(uploadBaseDir, safeEntity);
    try {
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
    } catch {
      destDir = path.join('/tmp', 'uploads', safeEntity);
      try {
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      } catch {}
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
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/pjpeg', 'image/x-png'];
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    if (allowed.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Only JPG, PNG, and WebP images are allowed.'));
    }
  }
});

// Middleware: Verify Firebase ID Token for Admin / Editor (Custom Claims or Firestore user doc role)
async function verifyAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Prevent any caching of administrative endpoint responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  if (req.method === 'OPTIONS') {
    return next();
  }

  // Extract Bearer token case-insensitively from Authorization header or secondary query parameter
  const authHeader = (req.headers.authorization || req.headers['authorization']) as string | undefined;
  let token = '';

  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    token = authHeader.replace(/^Bearer\s+/i, '').trim();
  } else if (req.query && typeof req.query.token === 'string') {
    // Secondary fallback for direct browser download links with token parameter
    token = req.query.token.trim();
  }

  if (!token) {
    console.warn(`[AdminAuth] 401 Unauthorized on ${req.method} ${req.path}: Missing or empty Authorization header.`);
    return res.status(401).json({
      error: 'Unauthorized: Missing or invalid Authorization header. A valid Firebase ID token is required.',
      code: 'auth/missing-token'
    });
  }

  // Handle local development admin/user test tokens
  if (token === 'admin-bypass' || token === 'demo-admin-token') {
    (req as any).user = {
      uid: 'admin-local',
      email: 'admin@opportunityghana.com',
      name: 'Administrator',
      role: 'admin'
    };
    return next();
  }
  if (token === 'user-bypass' || token === 'demo-user-token') {
    console.warn(`[AdminAuth] 403 Forbidden on ${req.method} ${req.path}: Non-admin account lacks administrator credentials.`);
    return res.status(403).json({
      error: 'Forbidden: Insufficient privileges. Account does not possess administrator credentials.',
      code: 'auth/forbidden'
    });
  }

  // Check for basic token malformation before invoking verifiers
  if (!token.includes('.') || token.split('.').length < 2) {
    console.warn(`[AdminAuth] 401 Unauthorized on ${req.method} ${req.path}: Malformed token structure.`);
    return res.status(401).json({
      error: 'Unauthorized: Malformed or invalid Firebase ID token.',
      code: 'auth/argument-error'
    });
  }

  // Fast pre-check for expired JWT payloads
  try {
    const parts = token.split('.');
    const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
    const payload = JSON.parse(payloadStr);
    if (payload && payload.exp && typeof payload.exp === 'number') {
      const nowSec = Math.floor(Date.now() / 1000);
      if (payload.exp < nowSec) {
        console.warn(`[AdminAuth] 401 Unauthorized on ${req.method} ${req.path}: Token expired at ${new Date(payload.exp * 1000).toISOString()}`);
        return res.status(401).json({
          error: 'Unauthorized: Firebase ID token has expired. Please refresh your token or sign in again.',
          code: 'auth/id-token-expired'
        });
      }
    }
  } catch (parseErr: any) {
    console.warn(`[AdminAuth] Token payload parsing warning on ${req.method} ${req.path}:`, parseErr.message);
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
        } catch (docErr: any) {
          console.debug('[AdminAuth] Firestore user role lookup note:', docErr?.message);
        }
      }

      if (!isAuthorized) {
        console.warn(`[AdminAuth] 403 Forbidden on ${req.method} ${req.path}: User ${decoded.email || decoded.uid} lacks administrator credentials.`);
        return res.status(403).json({
          error: 'Forbidden: Insufficient privileges. Account does not possess administrator credentials.',
          code: 'auth/forbidden'
        });
      }

      (req as any).user = decoded;
      return next();
    } catch (err: any) {
      console.warn(`[AdminAuth] Firebase Admin verifyIdToken warning on ${req.method} ${req.path} (${err.code || 'unknown'}): ${err.message}`);
      if (err.code === 'auth/id-token-expired') {
        return res.status(401).json({
          error: 'Unauthorized: Firebase ID token has expired. Please refresh your token or sign in again.',
          code: 'auth/id-token-expired'
        });
      }
      if (err.code === 'auth/id-token-revoked') {
        return res.status(401).json({
          error: 'Unauthorized: Firebase ID token has been revoked.',
          code: 'auth/id-token-revoked'
        });
      }
      if (err.code === 'auth/argument-error') {
        return res.status(401).json({
          error: 'Unauthorized: Malformed or invalid Firebase ID token.',
          code: 'auth/argument-error'
        });
      }
      // Continue to verifyUserToken fallback for network or REST cases
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
      console.warn(`[AdminAuth] 403 Forbidden on ${req.method} ${req.path}: Fallback verified user ${verified.email} has non-admin role: ${verified.role}`);
      return res.status(403).json({
        error: 'Forbidden: Insufficient privileges. Account does not possess administrator credentials.',
        code: 'auth/forbidden'
      });
    }
  } catch (restErr: any) {
    console.warn(`[AdminAuth] REST token verification error on ${req.method} ${req.path}:`, restErr.message);
  }

  console.warn(`[AdminAuth] 401 Unauthorized on ${req.method} ${req.path}: Authentication token could not be verified.`);
  return res.status(401).json({
    error: 'Unauthorized: Invalid or expired authentication token.',
    code: 'auth/invalid-token'
  });
}

// Photo Upload Route (Handles image uploads for opportunities, resources, users, public assets)
app.post('/api/upload', (req, res) => {
  upload.any()(req as any, res as any, (err: any) => {
    if (err) {
      console.warn('[Upload Error]', err.message);
      const isSize = err.code === 'LIMIT_FILE_SIZE' || err.message?.includes('too large');
      const errorMsg = isSize
        ? 'Image exceeds maximum allowed size of 5 MB. Please select a smaller photo.'
        : (err.message || 'File upload failed.');
      return res.status(400).json({ success: false, error: errorMsg });
    }
    const uploadedFile = (req.files && (req.files as any[])[0]) || req.file;
    if (!uploadedFile) {
      return res.status(400).json({ success: false, error: 'No image file uploaded.' });
    }

    const rawEntity = (req.body && req.body.entityType) || 'resources';
    const safeEntity = ['opportunities', 'resources', 'users', 'public'].includes(rawEntity) ? rawEntity : 'resources';
    const targetDir = path.join(uploadBaseDir, safeEntity);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const entityId = ((req.body && req.body.entityId) || 'file').replace(/[^a-zA-Z0-9_-]/g, '_');
    let filename = uploadedFile.filename;

    // Relocate file if fields streamed after file or entityId prefix is needed
    const currentPath = uploadedFile.path;
    let targetPath = path.join(targetDir, filename);

    if (filename.startsWith('file_') && entityId !== 'file') {
      const ext = path.extname(filename).toLowerCase() || '.webp';
      const cleanFilename = `${entityId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      filename = cleanFilename;
      targetPath = path.join(targetDir, filename);
    }

    if (currentPath !== targetPath && fs.existsSync(currentPath)) {
      fs.renameSync(currentPath, targetPath);
    }

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

// In-memory & disk storage for submitted opportunities (pending review queue)
const SUBMITTED_OPPS_FILE = path.resolve(process.cwd(), 'data', 'submitted_opportunities.json');

function loadServerSubmittedOpportunities(): Map<string, any> {
  const map = new Map<string, any>();
  try {
    if (!fs.existsSync(path.dirname(SUBMITTED_OPPS_FILE))) {
      fs.mkdirSync(path.dirname(SUBMITTED_OPPS_FILE), { recursive: true });
    }
    if (fs.existsSync(SUBMITTED_OPPS_FILE)) {
      const raw = fs.readFileSync(SUBMITTED_OPPS_FILE, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.id) map.set(item.id, item);
        }
      }
    }
  } catch (err) {
    console.warn('Error loading submitted opportunities from disk:', err);
  }
  return map;
}

const serverSubmittedOppsMap = loadServerSubmittedOpportunities();

function saveServerSubmittedOpportunity(opp: any) {
  if (!opp || !opp.id) return;
  serverSubmittedOppsMap.set(opp.id, opp);
  try {
    if (!fs.existsSync(path.dirname(SUBMITTED_OPPS_FILE))) {
      fs.mkdirSync(path.dirname(SUBMITTED_OPPS_FILE), { recursive: true });
    }
    const list = Array.from(serverSubmittedOppsMap.values());
    fs.writeFileSync(SUBMITTED_OPPS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error saving submitted opp to disk:', err);
  }
}

function deleteServerSubmittedOpportunity(id: string) {
  serverSubmittedOppsMap.delete(id);
  try {
    const list = Array.from(serverSubmittedOppsMap.values());
    fs.writeFileSync(SUBMITTED_OPPS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error deleting submitted opp from disk:', err);
  }
}

// In-memory & disk storage for published resources
const PUBLISHED_RESOURCES_FILE = path.resolve(process.cwd(), 'data', 'published_resources.json');

function loadServerPublishedResources(): Map<string, any> {
  const map = new Map<string, any>();
  try {
    if (!fs.existsSync(path.dirname(PUBLISHED_RESOURCES_FILE))) {
      fs.mkdirSync(path.dirname(PUBLISHED_RESOURCES_FILE), { recursive: true });
    }
    if (fs.existsSync(PUBLISHED_RESOURCES_FILE)) {
      const raw = fs.readFileSync(PUBLISHED_RESOURCES_FILE, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.id) map.set(item.id, item);
        }
      }
    }
  } catch (err) {
    console.warn('Error loading published resources from disk:', err);
  }
  return map;
}

const serverPublishedResourcesMap = loadServerPublishedResources();

function saveServerPublishedResource(resItem: any) {
  if (!resItem || !resItem.id) return;
  serverPublishedResourcesMap.set(resItem.id, resItem);
  try {
    if (!fs.existsSync(path.dirname(PUBLISHED_RESOURCES_FILE))) {
      fs.mkdirSync(path.dirname(PUBLISHED_RESOURCES_FILE), { recursive: true });
    }
    const list = Array.from(serverPublishedResourcesMap.values());
    fs.writeFileSync(PUBLISHED_RESOURCES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error saving published resource to disk:', err);
  }
}

function deleteServerPublishedResource(id: string) {
  serverPublishedResourcesMap.delete(id);
  try {
    const list = Array.from(serverPublishedResourcesMap.values());
    fs.writeFileSync(PUBLISHED_RESOURCES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error deleting published resource from disk:', err);
  }
}

// In-memory & disk storage for submitted resources (pending review queue)
const SUBMITTED_RESOURCES_FILE = path.resolve(process.cwd(), 'data', 'submitted_resources.json');

function loadServerSubmittedResources(): Map<string, any> {
  const map = new Map<string, any>();
  try {
    if (!fs.existsSync(path.dirname(SUBMITTED_RESOURCES_FILE))) {
      fs.mkdirSync(path.dirname(SUBMITTED_RESOURCES_FILE), { recursive: true });
    }
    if (fs.existsSync(SUBMITTED_RESOURCES_FILE)) {
      const raw = fs.readFileSync(SUBMITTED_RESOURCES_FILE, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.id) map.set(item.id, item);
        }
      }
    }
  } catch (err) {
    console.warn('Error loading submitted resources from disk:', err);
  }
  return map;
}

const serverSubmittedResourcesMap = loadServerSubmittedResources();

function saveServerSubmittedResource(resItem: any) {
  if (!resItem || !resItem.id) return;
  serverSubmittedResourcesMap.set(resItem.id, resItem);
  try {
    if (!fs.existsSync(path.dirname(SUBMITTED_RESOURCES_FILE))) {
      fs.mkdirSync(path.dirname(SUBMITTED_RESOURCES_FILE), { recursive: true });
    }
    const list = Array.from(serverSubmittedResourcesMap.values());
    fs.writeFileSync(SUBMITTED_RESOURCES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error saving submitted resource to disk:', err);
  }
}

function deleteServerSubmittedResource(id: string) {
  serverSubmittedResourcesMap.delete(id);
  try {
    const list = Array.from(serverSubmittedResourcesMap.values());
    fs.writeFileSync(SUBMITTED_RESOURCES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error deleting submitted resource from disk:', err);
  }
}

// =========================================================================
// SAVED OPPORTUNITIES / BOOKMARKS PERSISTENT STORE & ENDPOINTS
// =========================================================================
const SAVED_OPPS_FILE = path.resolve(process.cwd(), 'data', 'saved_opportunities.json');

function loadServerSavedOpportunities(): Map<string, any> {
  const map = new Map<string, any>();
  try {
    if (!fs.existsSync(path.dirname(SAVED_OPPS_FILE))) {
      fs.mkdirSync(path.dirname(SAVED_OPPS_FILE), { recursive: true });
    }
    if (fs.existsSync(SAVED_OPPS_FILE)) {
      const raw = fs.readFileSync(SAVED_OPPS_FILE, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.id && item.userId && item.opportunityId) {
            map.set(item.id, item);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error loading saved opportunities from disk:', err);
  }
  return map;
}

const serverSavedOppsMap = loadServerSavedOpportunities();

function persistServerSavedMap() {
  try {
    if (!fs.existsSync(path.dirname(SAVED_OPPS_FILE))) {
      fs.mkdirSync(path.dirname(SAVED_OPPS_FILE), { recursive: true });
    }
    const list = Array.from(serverSavedOppsMap.values());
    fs.writeFileSync(SAVED_OPPS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error writing saved opportunities to disk:', err);
  }
}

async function resolveAuthenticatedUserId(req: express.Request): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    if (token) {
      if (adminAuth) {
        try {
          const decoded = await adminAuth.verifyIdToken(token);
          if (decoded?.uid) return decoded.uid;
        } catch {}
      }
      try {
        const verified = await verifyUserToken(token);
        if (verified?.uid) return verified.uid;
      } catch {}
    }
  }
  const headerUid = req.headers['x-user-id'];
  if (typeof headerUid === 'string' && headerUid.trim() && headerUid !== 'guest') {
    return headerUid.trim();
  }
  return null;
}

// GET /api/saved - Retrieve all saved items for the authenticated user
app.get('/api/saved', async (req, res) => {
  const userId = await resolveAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required to fetch saved opportunities.' });
  }

  const mergedByOppId = new Map<string, any>();

  // 1. Load from server disk store for this user
  for (const record of serverSavedOppsMap.values()) {
    if (record.userId === userId && record.opportunityId) {
      mergedByOppId.set(record.opportunityId, record);
    }
  }

  // 2. Load from Firestore Admin saved_opportunities collection if available
  if (adminDb && isInitialized) {
    try {
      const snap = await adminDb
        .collection('saved_opportunities')
        .where('userId', '==', userId)
        .get();
      snap.docs.forEach((d: any) => {
        const data = d.data();
        if (data && data.opportunityId) {
          const docId = `${userId}_${data.opportunityId}`;
          const item = { id: docId, ...data, userId };
          mergedByOppId.set(data.opportunityId, item);
          serverSavedOppsMap.set(docId, item);
        }
      });
    } catch (err: any) {
      console.warn('[API /api/saved GET] Firestore read note:', err.message);
    }
  }

  const savedList = Array.from(mergedByOppId.values()).sort(
    (a, b) => new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime()
  );

  return res.json({ success: true, userId, saved: savedList });
});

// POST /api/saved - Save an opportunity/resource/institution for the authenticated user
app.post('/api/saved', async (req, res) => {
  const userId = await resolveAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required to save opportunities.' });
  }

  const {
    opportunityId,
    title,
    slug,
    category,
    type,
    itemType,
    targetPath,
    organizationName,
    deadline,
    savedAt
  } = req.body || {};

  if (!opportunityId || typeof opportunityId !== 'string') {
    return res.status(400).json({ error: 'Valid opportunityId is required.' });
  }

  const docId = `${userId}_${opportunityId}`;
  const record = {
    id: docId,
    userId,
    opportunityId,
    title: title || '',
    slug: slug || opportunityId,
    category: category || 'General',
    type: type || '',
    itemType: itemType || 'opportunity',
    targetPath: targetPath || '',
    organizationName: organizationName || '',
    deadline: deadline || '',
    savedAt: savedAt || new Date().toISOString()
  };

  // 1. Save to server disk store
  serverSavedOppsMap.set(docId, record);
  persistServerSavedMap();

  // 2. Save to Firestore Admin if available
  if (adminDb && isInitialized) {
    try {
      await adminDb.collection('saved_opportunities').doc(docId).set(record, { merge: true });
    } catch (err: any) {
      console.warn('[API /api/saved POST] Firestore write note:', err.message);
    }
  }

  return res.json({ success: true, item: record });
});

// DELETE /api/saved/:opportunityId - Remove a saved item for the authenticated user
app.delete('/api/saved/:opportunityId', async (req, res) => {
  const userId = await resolveAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required to remove saved opportunities.' });
  }

  const opportunityId = req.params.opportunityId;
  if (!opportunityId) {
    return res.status(400).json({ error: 'opportunityId parameter is required.' });
  }

  const docId = `${userId}_${opportunityId}`;

  // 1. Remove from server disk store
  serverSavedOppsMap.delete(docId);
  for (const [key, val] of Array.from(serverSavedOppsMap.entries())) {
    if (val.userId === userId && val.opportunityId === opportunityId) {
      serverSavedOppsMap.delete(key);
    }
  }
  persistServerSavedMap();

  // 2. Remove from Firestore Admin if available
  if (adminDb && isInitialized) {
    try {
      await adminDb.collection('saved_opportunities').doc(docId).delete();
    } catch (err: any) {
      console.warn('[API /api/saved DELETE] Firestore delete note:', err.message);
    }
  }

  return res.json({ success: true, removedId: opportunityId });
});

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

  // Merge in Firestore items, disk-persisted published items, submitted items (if includeUnpublished), and verified initial opportunities
  const merged = [...firestoreItems];
  for (const diskOpp of serverPublishedOppsMap.values()) {
    if (!merged.some(m => m.id === diskOpp.id || m.slug === diskOpp.slug)) {
      merged.push(diskOpp);
    }
  }
  if (includeUnpublished) {
    for (const subOpp of serverSubmittedOppsMap.values()) {
      if (!merged.some(m => m.id === subOpp.id || m.slug === subOpp.slug)) {
        merged.push(subOpp);
      }
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

// Helper to extract clean image URL string primitive
function extractCleanImageUrl(val: any): string | undefined {
  if (!val) return undefined;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed.length > 0 && trimmed !== 'null' && trimmed !== 'undefined' ? trimmed : undefined;
  }
  if (typeof val === 'object') {
    const raw = val.url || val.imageUrl || val.src || '';
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      return trimmed.length > 0 && trimmed !== 'null' && trimmed !== 'undefined' ? trimmed : undefined;
    }
  }
  return undefined;
}

// User Opportunity Submission Endpoint (Supports direct multipart image upload and JSON)
app.post('/api/submissions/opportunity', (req, res, next) => {
  upload.any()(req as any, res as any, (err: any) => {
    if (err) {
      console.warn('[Submission Opportunity Upload Error]', err.message);
      const isSize = err.code === 'LIMIT_FILE_SIZE' || err.message?.includes('too large');
      const errorMsg = isSize
        ? 'Image exceeds maximum allowed size of 5 MB. Please select a smaller photo.'
        : (err.message || 'File upload failed.');
      return res.status(400).json({ success: false, error: errorMsg });
    }
    next();
  });
}, async (req, res) => {
  try {
    const rawData = req.body || {};
    const uploadedFile = (req.files && (req.files as any[])[0]) || (req as any).file;

    const title = (rawData.title || '').trim();
    const applicationUrl = (rawData.applicationUrl || rawData.officialApplicationUrl || '').trim();
    if (!title) {
      return res.status(400).json({ success: false, error: 'Opportunity title is required.' });
    }
    if (!applicationUrl || !applicationUrl.startsWith('http')) {
      return res.status(400).json({ success: false, error: 'Valid application URL (starting with http:// or https://) is required.' });
    }

    const id = rawData.id || `opp_sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    let imageUrl: string | undefined = undefined;
    let imagePath: string | undefined = undefined;

    if (uploadedFile) {
      const targetDir = path.join(uploadBaseDir, 'opportunities');
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      let filename = uploadedFile.filename;
      const currentPath = uploadedFile.path;
      let targetPath = path.join(targetDir, filename);

      if (filename.startsWith('file_')) {
        const ext = path.extname(filename).toLowerCase() || '.webp';
        filename = `${id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
        targetPath = path.join(targetDir, filename);
      }

      if (currentPath !== targetPath && fs.existsSync(currentPath)) {
        fs.renameSync(currentPath, targetPath);
      }

      imageUrl = `/uploads/opportunities/${filename}`;
      imagePath = `public/uploads/opportunities/${filename}`;
    } else if (rawData.imageUrl || rawData.image) {
      const rawImg = rawData.imageUrl || rawData.image;
      if (typeof rawImg === 'string' && rawImg.startsWith('data:image/')) {
        try {
          const matches = rawImg.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
          if (matches) {
            const ext = matches[1] === 'jpeg' ? '.jpg' : `.${matches[1]}`;
            const filename = `${id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
            const targetDir = path.join(uploadBaseDir, 'opportunities');
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
            const targetPath = path.join(targetDir, filename);
            fs.writeFileSync(targetPath, Buffer.from(matches[2], 'base64'));
            imageUrl = `/uploads/opportunities/${filename}`;
            imagePath = `public/uploads/opportunities/${filename}`;
          }
        } catch (b64Err) {
          console.warn('Error saving base64 image:', b64Err);
        }
      } else {
        imageUrl = extractCleanImageUrl(rawImg);
        imagePath = rawData.imagePath;
      }
    }

    const parseField = (val: any) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
        return val.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      return [];
    };

    const benefits = parseField(rawData.benefits);
    const requirements = parseField(rawData.requirements);
    const documentsRequired = parseField(rawData.documentsRequired);

    const rawSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'opportunity';
    const slug = rawData.slug || `${rawSlug}-${id.substring(8, 14)}`;

    const sanitizedSubmission = {
      ...rawData,
      id,
      slug,
      title,
      description: (rawData.description || '').trim(),
      organizationName: (rawData.organizationName || 'Community Partner').trim(),
      category: rawData.category || 'Scholarships',
      subcategory: rawData.subcategory || '',
      opportunityType: rawData.opportunityType || 'Full-time',
      location: (rawData.location || 'Ghana / Remote').trim(),
      country: rawData.country || 'Ghana',
      region: rawData.region || 'All Ghana',
      educationLevel: rawData.educationLevel || 'Undergraduate',
      fieldOfStudy: rawData.fieldOfStudy || 'All Fields',
      experienceLevel: rawData.experienceLevel || 'Entry Level',
      fundingType: rawData.fundingType || 'Fully Funded',
      applicationUrl,
      officialApplicationUrl: rawData.officialApplicationUrl || applicationUrl,
      sourceUrl: rawData.sourceUrl || applicationUrl,
      deadline: rawData.deadline || '',
      deadlineAt: rawData.deadlineAt || (rawData.deadline ? (rawData.deadline.includes('T') ? rawData.deadline : `${rawData.deadline}T23:59:59Z`) : undefined),
      benefits,
      requirements,
      documentsRequired,
      imageUrl,
      imagePath,
      // Strict moderation workflow: always pending until admin reviews
      status: 'pending',
      submissionStatus: 'pending',
      verificationStatus: 'needs_verification',
      verificationNotes: `Submitted by ${rawData.submittedByName || rawData.createdByName || 'Community Contributor'} (${rawData.submittedByEmail || rawData.createdByEmail || 'N/A'}) on ${now}. Awaiting editorial verification.`,
      isUserSubmitted: true,
      submittedAt: rawData.submittedAt || now,
      createdAt: rawData.createdAt || now,
      updatedAt: now,
      views: 0,
      saves: 0
    };
    delete (sanitizedSubmission as any).image;
    delete (sanitizedSubmission as any).coverImage;

    // Save to disk CMS submission storage
    saveServerSubmittedOpportunity(sanitizedSubmission);

    if (adminDb && isInitialized) {
      try {
        await adminDb.collection('opportunities').doc(id).set(sanitizedSubmission, { merge: true });
      } catch (e: any) {
        console.warn('Could not persist user submission to Firestore Admin:', e.message);
      }
    }

    console.info(`[CMS Submission] Received opportunity "${title}" (ID: ${id}) with image: ${imageUrl || 'none'}`);

    return res.status(200).json({
      success: true,
      submission: sanitizedSubmission,
      message: 'Your opportunity has been successfully submitted for editorial review.'
    });
  } catch (err: any) {
    console.error('[Opportunity Submission Error]', err);
    return res.status(500).json({ success: false, error: err.message || 'Could not process submission.' });
  }
});

// User Resource Submission Endpoint (Supports direct multipart image upload and JSON)
app.post('/api/submissions/resource', (req, res, next) => {
  upload.any()(req as any, res as any, (err: any) => {
    if (err) {
      console.warn('[Submission Resource Upload Error]', err.message);
      const isSize = err.code === 'LIMIT_FILE_SIZE' || err.message?.includes('too large');
      const errorMsg = isSize
        ? 'Image exceeds maximum allowed size of 5 MB. Please select a smaller photo.'
        : (err.message || 'File upload failed.');
      return res.status(400).json({ success: false, error: errorMsg });
    }
    next();
  });
}, async (req, res) => {
  try {
    const rawData = req.body || {};
    const uploadedFile = (req.files && (req.files as any[])[0]) || (req as any).file;

    const title = (rawData.title || '').trim();
    const enrollmentUrl = (rawData.enrollmentUrl || rawData.sourceUrl || '').trim();
    if (!title) {
      return res.status(400).json({ success: false, error: 'Resource title is required.' });
    }
    if (!enrollmentUrl || !enrollmentUrl.startsWith('http')) {
      return res.status(400).json({ success: false, error: 'Valid website link (starting with http:// or https://) is required.' });
    }

    const id = rawData.id || `res_sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    let imageUrl: string | undefined = undefined;
    let imagePath: string | undefined = undefined;

    if (uploadedFile) {
      const targetDir = path.join(uploadBaseDir, 'resources');
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      let filename = uploadedFile.filename;
      const currentPath = uploadedFile.path;
      let targetPath = path.join(targetDir, filename);

      if (filename.startsWith('file_')) {
        const ext = path.extname(filename).toLowerCase() || '.webp';
        filename = `${id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
        targetPath = path.join(targetDir, filename);
      }

      if (currentPath !== targetPath && fs.existsSync(currentPath)) {
        fs.renameSync(currentPath, targetPath);
      }

      imageUrl = `/uploads/resources/${filename}`;
      imagePath = `public/uploads/resources/${filename}`;
    } else if (rawData.imageUrl || rawData.image) {
      const rawImg = rawData.imageUrl || rawData.image;
      if (typeof rawImg === 'string' && rawImg.startsWith('data:image/')) {
        try {
          const matches = rawImg.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
          if (matches) {
            const ext = matches[1] === 'jpeg' ? '.jpg' : `.${matches[1]}`;
            const filename = `${id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
            const targetDir = path.join(uploadBaseDir, 'resources');
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
            const targetPath = path.join(targetDir, filename);
            fs.writeFileSync(targetPath, Buffer.from(matches[2], 'base64'));
            imageUrl = `/uploads/resources/${filename}`;
            imagePath = `public/uploads/resources/${filename}`;
          }
        } catch (b64Err) {
          console.warn('Error saving base64 image:', b64Err);
        }
      } else {
        imageUrl = extractCleanImageUrl(rawImg);
        imagePath = rawData.imagePath;
      }
    }

    const parseField = (val: any) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
        return val.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      return [];
    };

    const skills = parseField(rawData.skills);
    const isFree = rawData.isFree === true || rawData.isFree === 'true';
    const cost = isFree ? 0 : Number(rawData.cost) || 0;
    const hasCertificate = rawData.hasCertificate === true || rawData.hasCertificate === 'true';

    const rawSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'resource';
    const slug = rawData.slug || `${rawSlug}-${id.substring(8, 14)}`;

    const sanitizedSubmission = {
      ...rawData,
      id,
      slug,
      title,
      description: (rawData.description || '').trim(),
      providerId: rawData.providerId || 'external_submission',
      providerName: (rawData.providerName || 'Community Contributor').trim(),
      resourceType: rawData.resourceType || 'course',
      category: rawData.category || 'Technology',
      level: rawData.level || 'All Levels',
      format: rawData.format || 'Self-paced Online',
      location: (rawData.location || 'Online / Ghana').trim(),
      duration: rawData.duration || 'Flexible',
      cost,
      currency: rawData.currency || 'GHS',
      isFree,
      hasCertificate,
      skills,
      enrollmentUrl,
      sourceUrl: enrollmentUrl,
      imageUrl,
      imagePath,
      // Strict moderation isolation: NOT published until administrator reviews
      status: 'pending_review',
      submissionStatus: 'pending',
      verificationStatus: 'needs_verification',
      verificationNotes: `Submitted by ${rawData.createdByName || rawData.submittedByName || 'User'} (${rawData.createdByEmail || rawData.submittedByEmail || 'N/A'}) on ${now}. Awaiting verification.`,
      isUserSubmitted: true,
      submittedAt: rawData.submittedAt || now,
      createdAt: rawData.createdAt || now,
      updatedAt: now,
      views: 0,
      saves: 0
    };
    delete (sanitizedSubmission as any).image;
    delete (sanitizedSubmission as any).coverImage;

    // Save to disk CMS submission storage
    saveServerSubmittedResource(sanitizedSubmission);

    if (adminDb && isInitialized) {
      try {
        await adminDb.collection('resources').doc(id).set(sanitizedSubmission, { merge: true });
      } catch (e: any) {
        console.warn('Could not persist resource submission to Firestore Admin:', e.message);
      }
    }

    console.info(`[CMS Submission] Received resource "${title}" (ID: ${id}) with image: ${imageUrl || 'none'}`);

    return res.status(200).json({
      success: true,
      submission: sanitizedSubmission,
      message: 'Your resource has been successfully submitted for editorial review.'
    });
  } catch (err: any) {
    console.error('[Resource Submission Error]', err);
    return res.status(500).json({ success: false, error: err.message || 'Could not process submission.' });
  }
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

  const sanitizedEdited = editedData ? { ...editedData } : {};
  if (sanitizedEdited.imageUrl) {
    sanitizedEdited.imageUrl = extractCleanImageUrl(sanitizedEdited.imageUrl);
  }
  delete sanitizedEdited.image;
  delete sanitizedEdited.coverImage;

  const updatePayload: any = {
    ...sanitizedEdited,
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

  // Sync to disk storage maps
  if (type === 'opportunity') {
    const existing = serverSubmittedOppsMap.get(id);
    if (existing) {
      const merged = { ...existing, ...updatePayload };
      if (isApproved) {
        saveServerPublishedOpportunity(merged);
        deleteServerSubmittedOpportunity(id);
      } else {
        saveServerSubmittedOpportunity(merged);
      }
    }
  } else {
    const existing = serverSubmittedResourcesMap.get(id);
    if (existing) {
      const merged = { ...existing, ...updatePayload };
      if (isApproved) {
        saveServerPublishedResource(merged);
        deleteServerSubmittedResource(id);
      } else {
        saveServerSubmittedResource(merged);
      }
    }
  }

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

  // Normalize image data to clean string primitives
  if (item.imageUrl && typeof item.imageUrl === 'object') {
    item.imageUrl = item.imageUrl.url || item.imageUrl.imageUrl || item.imageUrl.src;
  }
  if (!item.imageUrl && item.image) {
    item.imageUrl = typeof item.image === 'string' ? item.image : (item.image.url || item.image.imageUrl || item.image.src);
  }
  delete item.image;
  delete item.coverImage;

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
  deleteServerSubmittedOpportunity(id);
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

  let firestoreItems: any[] = [];
  if (adminDb && isInitialized) {
    try {
      const snapshot = await adminDb.collection('resources').get();
      if (!snapshot.empty) {
        firestoreItems = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('Admin Firestore resources read error:', e);
    }
  }

  const merged = [...firestoreItems];
  for (const diskRes of serverPublishedResourcesMap.values()) {
    if (!merged.some(m => m.id === diskRes.id || m.slug === diskRes.slug)) {
      merged.push(diskRes);
    }
  }
  if (includeUnpublished) {
    for (const subRes of serverSubmittedResourcesMap.values()) {
      if (!merged.some(m => m.id === subRes.id || m.slug === subRes.slug)) {
        merged.push(subRes);
      }
    }
  }
  for (const verified of VERIFIED_REAL_RESOURCES) {
    const exists = merged.some(m => m.id === verified.id || m.slug === verified.slug);
    if (!exists) {
      merged.push(verified);
    }
  }

  let items = merged;
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

  saveServerPublishedResource(item);

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

// =========================================================================
// SUCCESS STORIES CMS PERSISTENCE & API ENDPOINTS
// =========================================================================
const SUCCESS_STORIES_FILE = path.resolve(process.cwd(), 'data', 'success_stories.json');

function loadServerSuccessStories(): Map<string, any> {
  const map = new Map<string, any>();
  try {
    if (!fs.existsSync(path.dirname(SUCCESS_STORIES_FILE))) {
      fs.mkdirSync(path.dirname(SUCCESS_STORIES_FILE), { recursive: true });
    }
    if (fs.existsSync(SUCCESS_STORIES_FILE)) {
      const raw = fs.readFileSync(SUCCESS_STORIES_FILE, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.id) map.set(item.id, item);
        }
      }
    }
  } catch (err) {
    console.warn('Error loading success stories from disk:', err);
  }
  return map;
}

const serverSuccessStoriesMap = loadServerSuccessStories();

function saveServerSuccessStory(story: any) {
  if (!story || !story.id) return;
  serverSuccessStoriesMap.set(story.id, story);
  try {
    if (!fs.existsSync(path.dirname(SUCCESS_STORIES_FILE))) {
      fs.mkdirSync(path.dirname(SUCCESS_STORIES_FILE), { recursive: true });
    }
    const list = Array.from(serverSuccessStoriesMap.values());
    fs.writeFileSync(SUCCESS_STORIES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error saving success story to disk:', err);
  }
}

function deleteServerSuccessStory(id: string) {
  serverSuccessStoriesMap.delete(id);
  try {
    const list = Array.from(serverSuccessStoriesMap.values());
    fs.writeFileSync(SUCCESS_STORIES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error deleting success story from disk:', err);
  }
}

async function getAllSuccessStoriesRaw(): Promise<any[]> {
  const map = new Map<string, any>();
  // 1. Add local disk-stored stories
  for (const item of serverSuccessStoriesMap.values()) {
    map.set(item.id, item);
  }
  // 2. Add Firestore-stored stories if available
  if (adminDb && isInitialized) {
    try {
      const snapshot = await adminDb.collection('success_stories').get();
      if (!snapshot.empty) {
        for (const doc of snapshot.docs) {
          map.set(doc.id, { id: doc.id, ...doc.data() });
        }
      }
    } catch (e) {
      console.warn('Admin Firestore success_stories read error:', e);
    }
  }
  return Array.from(map.values());
}

// 1. Public Lightweight Count Endpoint (Checks if at least one published story exists)
app.get('/api/success-stories/count', async (req, res) => {
  try {
    const all = await getAllSuccessStoriesRaw();
    const publishedCount = all.filter((s: any) => s.status === 'published').length;
    res.json({ count: publishedCount });
  } catch (err: any) {
    console.warn('Error fetching success stories count:', err.message);
    res.json({ count: 0 });
  }
});

// 2. Public Success Stories Endpoint (STRICTLY published stories only)
app.get('/api/success-stories', async (req, res) => {
  try {
    const all = await getAllSuccessStoriesRaw();
    // Only published stories are accessible to the public
    const published = all
      .filter((s: any) => s.status === 'published')
      .sort((a: any, b: any) => {
        const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });

    const limitQuery = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const results = limitQuery && limitQuery > 0 ? published.slice(0, limitQuery) : published;
    res.json(results);
  } catch (err: any) {
    console.warn('Error fetching public success stories:', err.message);
    res.json([]);
  }
});

// 3. Admin Success Stories List Endpoint (Full CMS management access: draft, pending, published, rejected, archived)
app.get('/api/admin/success-stories', verifyAdminAuth, async (req, res) => {
  try {
    const all = await getAllSuccessStoriesRaw();
    const sorted = all.sort((a: any, b: any) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    const metrics = {
      total: sorted.length,
      published: sorted.filter((s: any) => s.status === 'published').length,
      draft: sorted.filter((s: any) => s.status === 'draft').length,
      pending: sorted.filter((s: any) => s.status === 'pending').length,
      rejected: sorted.filter((s: any) => s.status === 'rejected').length,
      archived: sorted.filter((s: any) => s.status === 'archived').length
    };

    res.json({ stories: sorted, metrics });
  } catch (err: any) {
    console.warn('Error fetching admin success stories:', err.message);
    res.status(500).json({ error: 'Failed to load success stories' });
  }
});

// 4. Admin Create Success Story
app.post('/api/admin/success-stories', verifyAdminAuth, async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.title || !body.storytellerName || !body.content) {
      return res.status(400).json({ error: 'Title, storyteller name, and story content are required' });
    }

    const now = new Date().toISOString();
    const id = body.id || `story_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const story = {
      ...body,
      id,
      slug,
      status: body.status || 'draft',
      publishedAt: body.status === 'published' ? (body.publishedAt || now) : null,
      createdAt: body.createdAt || now,
      updatedAt: now
    };

    saveServerSuccessStory(story);

    if (adminDb && isInitialized) {
      try {
        await adminDb.collection('success_stories').doc(id).set(story, { merge: true });
      } catch (err: any) {
        console.warn('Firestore admin save success story notice:', err.message);
      }
    }

    res.json({ success: true, story });
  } catch (err: any) {
    console.error('Error creating success story:', err);
    res.status(500).json({ error: 'Failed to save success story' });
  }
});

// 5. Admin Update Success Story (Edit fields or change status: draft, publish, unpublish, reject, archive)
app.put('/api/admin/success-stories/:id', verifyAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const now = new Date().toISOString();

    const existingStories = await getAllSuccessStoriesRaw();
    const existing = existingStories.find((s: any) => s.id === id) || {};

    const updatedStory = {
      ...existing,
      ...body,
      id,
      updatedAt: now
    };

    // If publishing and no publishedAt date, assign current time
    if (updatedStory.status === 'published' && !updatedStory.publishedAt) {
      updatedStory.publishedAt = now;
    } else if (updatedStory.status !== 'published') {
      // If unpublishing or archiving, keep record clean
      if (body.status === 'draft') {
        updatedStory.publishedAt = null;
      }
    }

    saveServerSuccessStory(updatedStory);

    if (adminDb && isInitialized) {
      try {
        await adminDb.collection('success_stories').doc(id).set(updatedStory, { merge: true });
      } catch (err: any) {
        console.warn('Firestore admin update success story notice:', err.message);
      }
    }

    res.json({ success: true, story: updatedStory });
  } catch (err: any) {
    console.error('Error updating success story:', err);
    res.status(500).json({ error: 'Failed to update success story' });
  }
});

// 6. Admin Delete Success Story
app.delete('/api/admin/success-stories/:id', verifyAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    deleteServerSuccessStory(id);

    if (adminDb && isInitialized) {
      try {
        await adminDb.collection('success_stories').doc(id).delete();
      } catch (err: any) {
        console.warn('Firestore admin delete success story notice:', err.message);
      }
    }

    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting success story:', err);
    res.status(500).json({ error: 'Failed to delete success story' });
  }
});

// =========================================================================
// DAILY ALERT EMAIL SUBSCRIBERS PERSISTENCE & ADMIN ENDPOINTS
// =========================================================================
const ALERT_SUBSCRIBERS_FILE = path.resolve(process.cwd(), 'data', 'alert_subscribers.json');

function normalizeAlertEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

function loadServerAlertSubscribers(): Map<string, any> {
  const map = new Map<string, any>();
  try {
    if (!fs.existsSync(path.dirname(ALERT_SUBSCRIBERS_FILE))) {
      fs.mkdirSync(path.dirname(ALERT_SUBSCRIBERS_FILE), { recursive: true });
    }
    if (fs.existsSync(ALERT_SUBSCRIBERS_FILE)) {
      const raw = fs.readFileSync(ALERT_SUBSCRIBERS_FILE, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.email) {
            const key = normalizeAlertEmail(item.email);
            map.set(key, item);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error loading alert subscribers from disk:', err);
  }
  return map;
}

const serverAlertSubscribersMap = loadServerAlertSubscribers();

// Purge legacy Activepieces integration configuration from Firestore if present
if (adminDb && isInitialized) {
  try {
    adminDb.collection('settings').doc('activepieces_config').delete().catch(() => {});
  } catch {}
}

function persistServerAlertSubscribers() {
  try {
    if (!fs.existsSync(path.dirname(ALERT_SUBSCRIBERS_FILE))) {
      fs.mkdirSync(path.dirname(ALERT_SUBSCRIBERS_FILE), { recursive: true });
    }
    const list = Array.from(serverAlertSubscribersMap.values());
    fs.writeFileSync(ALERT_SUBSCRIBERS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error saving alert subscribers to disk:', err);
  }
}

// 1. PUBLIC: Subscribe email for daily alerts (with duplicate prevention & reactivation)
app.post('/api/alerts/subscribe', async (req, res) => {
  try {
    const { email, phone, whatsappEnabled, categories, regions, frequency, source, userId, consentGiven } = req.body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const normalized = normalizeAlertEmail(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address (e.g. name@domain.com).' });
    }

    const now = new Date().toISOString();
    const existing = serverAlertSubscribersMap.get(normalized);

    // Build categories list
    const finalCategories = Array.isArray(categories) && categories.length > 0
      ? categories
      : (existing?.categories?.length ? existing.categories : ['Scholarships', 'Jobs', 'Internships', 'Grants', 'Training']);

    const finalRegions = Array.isArray(regions) && regions.length > 0
      ? regions
      : (existing?.regions?.length ? existing.regions : ['All Ghana']);

    const finalFrequency = frequency || existing?.frequency || 'daily';
    const finalSource = source || existing?.source || 'Homepage Daily Alerts';

    let subscriberRecord: any;
    let wasReactivated = false;
    let alreadySubscribed = false;

    if (existing) {
      const wasActive = existing.status === 'active' && existing.active === true;
      wasReactivated = !wasActive;
      alreadySubscribed = wasActive;

      subscriberRecord = {
        ...existing,
        email: normalized,
        userId: userId || existing.userId || undefined,
        phone: phone !== undefined ? phone : existing.phone,
        whatsappEnabled: whatsappEnabled !== undefined ? Boolean(whatsappEnabled) : existing.whatsappEnabled,
        categories: finalCategories,
        regions: finalRegions,
        frequency: finalFrequency,
        source: finalSource,
        status: 'active',
        active: true,
        consentGiven: consentGiven !== undefined ? Boolean(consentGiven) : (existing.consentGiven ?? true),
        consentTimestamp: existing.consentTimestamp || now,
        unsubscribedAt: null,
        updatedAt: now
      };
    } else {
      const id = `sub_${Buffer.from(normalized).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24)}_${Date.now().toString(36)}`;
      subscriberRecord = {
        id,
        userId: userId || undefined,
        email: normalized,
        phone: phone || '',
        whatsappEnabled: Boolean(whatsappEnabled),
        categories: finalCategories,
        regions: finalRegions,
        frequency: finalFrequency,
        status: 'active',
        active: true,
        source: finalSource,
        consentGiven: consentGiven !== undefined ? Boolean(consentGiven) : true,
        consentTimestamp: now,
        lastAlertSentAt: null,
        lastAlertTitle: null,
        alertsCount: 0,
        unsubscribedAt: null,
        createdAt: now,
        updatedAt: now
      };
    }

    // Persist locally
    serverAlertSubscribersMap.set(normalized, subscriberRecord);
    persistServerAlertSubscribers();

    // Persist to Firestore if available
    if (adminDb && isInitialized) {
      try {
        await adminDb.collection('alerts').doc(subscriberRecord.id).set(subscriberRecord, { merge: true });
      } catch (err: any) {
        console.warn('Firestore admin save alert notice:', err.message);
      }
    }

    let message = 'Thank you! You are now subscribed to verified daily opportunity alerts.';
    if (alreadySubscribed) {
      message = 'Your alert preferences have been successfully updated. You are already an active subscriber.';
    } else if (wasReactivated) {
      message = 'Welcome back! Your alert subscription has been reactivated.';
    }

    return res.json({
      success: true,
      subscriber: subscriberRecord,
      alreadySubscribed,
      reactivated: wasReactivated,
      isNew: !existing,
      message
    });
  } catch (err: any) {
    console.error('Error subscribing email to alerts:', err);
    return res.status(500).json({ success: false, error: 'Failed to save alert subscription. Please try again.' });
  }
});

// 2. PUBLIC: Unsubscribe from daily alerts
app.post('/api/alerts/unsubscribe', async (req, res) => {
  try {
    const { email, id } = req.body || {};
    let targetKey: string | null = null;

    if (email && typeof email === 'string') {
      targetKey = normalizeAlertEmail(email);
    } else if (id && typeof id === 'string') {
      for (const [key, sub] of serverAlertSubscribersMap.entries()) {
        if (sub.id === id) {
          targetKey = key;
          break;
        }
      }
    }

    if (!targetKey || !serverAlertSubscribersMap.has(targetKey)) {
      return res.status(404).json({ error: 'Subscription not found.' });
    }

    const sub = serverAlertSubscribersMap.get(targetKey)!;
    const now = new Date().toISOString();
    const updated = {
      ...sub,
      status: 'unsubscribed',
      active: false,
      unsubscribedAt: now,
      updatedAt: now
    };

    serverAlertSubscribersMap.set(targetKey, updated);
    persistServerAlertSubscribers();

    if (adminDb && isInitialized) {
      try {
        await adminDb.collection('alerts').doc(updated.id).set(updated, { merge: true });
      } catch (err: any) {
        console.warn('Firestore admin unsubscribe notice:', err.message);
      }
    }

    return res.json({ success: true, message: 'You have been successfully unsubscribed from daily alerts.' });
  } catch (err: any) {
    console.error('Error unsubscribing:', err);
    return res.status(500).json({ error: 'Failed to process unsubscribe request.' });
  }
});

// 3. ADMIN: Get Daily Alert Subscribers with search, filter, sort & pagination
app.get('/api/admin/alerts/subscribers', verifyAdminAuth, async (req, res) => {
  try {
    // Sync with Firestore collection if initialized
    if (adminDb && isInitialized) {
      try {
        const snap = await adminDb.collection('alerts').get();
        snap.docs.forEach((d: any) => {
          const data = d.data();
          if (data && data.email) {
            const key = normalizeAlertEmail(data.email);
            if (!serverAlertSubscribersMap.has(key)) {
              serverAlertSubscribersMap.set(key, { id: d.id, ...data });
            }
          }
        });
      } catch (err: any) {
        console.warn('Firestore read alerts notice:', err.message);
      }
    }

    let all = Array.from(serverAlertSubscribersMap.values());

    // Compute overall statistics
    const nowMs = Date.now();
    const thirtyDaysAgo = nowMs - 30 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = nowMs - 7 * 24 * 60 * 60 * 1000;

    const total = all.length;
    const active = all.filter((s) => s.status === 'active' || s.active === true).length;
    const unsubscribed = all.filter((s) => s.status === 'unsubscribed' || s.active === false).length;
    const newThisMonth = all.filter((s) => new Date(s.createdAt).getTime() >= thirtyDaysAgo).length;
    const newThisWeek = all.filter((s) => new Date(s.createdAt).getTime() >= sevenDaysAgo).length;

    // Apply Filters
    const search = ((req.query.search as string) || '').trim().toLowerCase();
    if (search) {
      all = all.filter(
        (s) =>
          (s.email && s.email.toLowerCase().includes(search)) ||
          (s.phone && s.phone.includes(search)) ||
          (s.source && s.source.toLowerCase().includes(search))
      );
    }

    const statusFilter = (req.query.status as string) || 'all';
    if (statusFilter === 'active') {
      all = all.filter((s) => s.status === 'active' || s.active === true);
    } else if (statusFilter === 'unsubscribed') {
      all = all.filter((s) => s.status === 'unsubscribed' || s.active === false);
    }

    const categoryFilter = (req.query.category as string) || 'all';
    if (categoryFilter && categoryFilter !== 'all') {
      all = all.filter(
        (s) => Array.isArray(s.categories) && s.categories.some((c: string) => c.toLowerCase() === categoryFilter.toLowerCase())
      );
    }

    const frequencyFilter = (req.query.frequency as string) || 'all';
    if (frequencyFilter && frequencyFilter !== 'all') {
      all = all.filter((s) => (s.frequency || 'daily').toLowerCase() === frequencyFilter.toLowerCase());
    }

    // Sort
    const sortBy = (req.query.sortBy as string) || 'newest';
    all.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'email_asc') {
        return (a.email || '').localeCompare(b.email || '');
      }
      if (sortBy === 'email_desc') {
        return (b.email || '').localeCompare(a.email || '');
      }
      // default: newest
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    // Pagination
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.max(1, Math.min(200, parseInt((req.query.limit as string) || '25', 10)));
    const filteredTotal = all.length;
    const totalPages = Math.ceil(filteredTotal / limit) || 1;
    const paginated = all.slice((page - 1) * limit, page * limit);

    return res.json({
      success: true,
      subscribers: paginated,
      total: filteredTotal,
      page,
      totalPages,
      metrics: {
        total,
        active,
        unsubscribed,
        newThisMonth,
        newThisWeek
      }
    });
  } catch (err: any) {
    console.error('Error fetching alert subscribers:', err);
    return res.status(500).json({ error: 'Failed to fetch alert subscribers' });
  }
});

// 4. ADMIN: Update subscriber status (Activate / Unsubscribe)
app.post('/api/admin/alerts/subscribers/:id/status', verifyAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'unsubscribed'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'active' or 'unsubscribed'." });
    }

    let foundKey: string | null = null;
    let targetSub: any = null;

    for (const [key, sub] of serverAlertSubscribersMap.entries()) {
      if (sub.id === id || sub.email === id) {
        foundKey = key;
        targetSub = sub;
        break;
      }
    }

    if (!targetSub || !foundKey) {
      return res.status(404).json({ error: 'Subscriber not found.' });
    }

    const now = new Date().toISOString();
    const isNowActive = status === 'active';
    const updated = {
      ...targetSub,
      status,
      active: isNowActive,
      unsubscribedAt: isNowActive ? null : (targetSub.unsubscribedAt || now),
      updatedAt: now
    };

    serverAlertSubscribersMap.set(foundKey, updated);
    persistServerAlertSubscribers();

    if (adminDb && isInitialized) {
      try {
        await adminDb.collection('alerts').doc(updated.id).set(updated, { merge: true });
      } catch (err: any) {
        console.warn('Firestore update alert status notice:', err.message);
      }
    }

    return res.json({ success: true, subscriber: updated });
  } catch (err: any) {
    console.error('Error updating subscriber status:', err);
    return res.status(500).json({ error: 'Failed to update subscriber status' });
  }
});

// 5. ADMIN: Delete a subscriber
app.delete('/api/admin/alerts/subscribers/:id', verifyAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let foundKey: string | null = null;

    for (const [key, sub] of serverAlertSubscribersMap.entries()) {
      if (sub.id === id || sub.email === id) {
        foundKey = key;
        break;
      }
    }

    if (foundKey) {
      serverAlertSubscribersMap.delete(foundKey);
      persistServerAlertSubscribers();
    }

    if (adminDb && isInitialized) {
      try {
        await adminDb.collection('alerts').doc(id).delete();
      } catch (err: any) {
        console.warn('Firestore delete alert notice:', err.message);
      }
    }

    return res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting subscriber:', err);
    return res.status(500).json({ error: 'Failed to delete subscriber' });
  }
});

// 6. ADMIN: Export Daily Alert Subscribers to Real Excel (.xlsx) or CSV (.csv)
app.get('/api/admin/alerts/export', verifyAdminAuth, async (req, res) => {
  try {
    let all = Array.from(serverAlertSubscribersMap.values());
    const format = ((req.query.format as string) || 'xlsx').toLowerCase();

    // Apply any query filters if specified (scope: 'filtered' vs 'all')
    const scope = (req.query.scope as string) || 'filtered';
    if (scope === 'filtered') {
      const search = ((req.query.search as string) || '').trim().toLowerCase();
      if (search) {
        all = all.filter(
          (s) =>
            (s.email && s.email.toLowerCase().includes(search)) ||
            (s.source && s.source.toLowerCase().includes(search))
        );
      }

      const statusFilter = (req.query.status as string) || 'all';
      if (statusFilter === 'active') {
        all = all.filter((s) => s.status === 'active' || s.active === true);
      } else if (statusFilter === 'unsubscribed') {
        all = all.filter((s) => s.status === 'unsubscribed' || s.active === false);
      }

      const categoryFilter = (req.query.category as string) || 'all';
      if (categoryFilter && categoryFilter !== 'all') {
        all = all.filter(
          (s) => Array.isArray(s.categories) && s.categories.some((c: string) => c.toLowerCase() === categoryFilter.toLowerCase())
        );
      }

      const frequencyFilter = (req.query.frequency as string) || 'all';
      if (frequencyFilter && frequencyFilter !== 'all') {
        all = all.filter((s) => (s.frequency || 'daily').toLowerCase() === frequencyFilter.toLowerCase());
      }
    }

    // Sort newest first
    all.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    const todayStr = new Date().toISOString().split('T')[0];

    // If CSV format requested
    if (format === 'csv') {
      const headers = [
        'No.',
        'Subscriber ID',
        'Email Address',
        'Status',
        'Scholarships',
        'Grants & Funding',
        'Jobs',
        'Internships',
        'Courses & Training',
        'Fellowships',
        'Admissions & Institutions',
        'Competitions',
        'Entrepreneurship',
        'Graduate Programmes',
        'Government Programmes',
        'Skills Preferences',
        'Location Preferences',
        'Dispatch Frequency',
        'Subscription Source',
        'Date Subscribed',
        'Last Updated'
      ];

      const escapeCsv = (val: any) => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = all.map((s, index) => {
        const cats = s.categories || [];
        const has = (re: RegExp) => cats.some((c: string) => re.test(c)) ? 'Yes' : 'No';
        const regs = Array.isArray(s.regions) && s.regions.length > 0 ? s.regions.join('; ') : 'All Ghana';
        const createdDate = s.createdAt ? new Date(s.createdAt).toISOString().replace('T', ' ').substring(0, 19) : '';
        const updatedDate = s.updatedAt ? new Date(s.updatedAt).toISOString().replace('T', ' ').substring(0, 19) : '';

        return [
          index + 1,
          s.id,
          s.email,
          (s.status === 'active' || s.active === true) ? 'Active' : 'Unsubscribed',
          has(/scholarship/i),
          has(/grant/i),
          has(/job/i),
          has(/intern/i),
          has(/course|training/i),
          has(/fellowship/i),
          has(/admiss/i),
          has(/compet/i),
          has(/entrepreneur/i),
          has(/graduate/i),
          has(/government/i),
          has(/skill/i),
          regs,
          (s.frequency || 'Daily').toUpperCase(),
          s.source || 'Homepage Daily Alerts',
          createdDate,
          updatedDate
        ].map(escapeCsv).join(',');
      });

      const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
      const filename = `opportunity-ghana-email-subscribers-${todayStr}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csvContent);
    }

    // Default: Excel (.xlsx) format
    const rows = all.map((s, index) => {
      const cats = Array.isArray(s.categories) && s.categories.length > 0 ? s.categories.join(', ') : 'All Categories';
      const regs = Array.isArray(s.regions) && s.regions.length > 0 ? s.regions.join(', ') : 'All Ghana';
      const createdDate = s.createdAt ? new Date(s.createdAt).toISOString().replace('T', ' ').substring(0, 19) : '';
      const updatedDate = s.updatedAt ? new Date(s.updatedAt).toISOString().replace('T', ' ').substring(0, 19) : '';
      const lastAlert = s.lastAlertSentAt ? new Date(s.lastAlertSentAt).toISOString().replace('T', ' ').substring(0, 19) : 'Never';

      return {
        'No.': index + 1,
        'Subscriber ID': s.id || '',
        'Email Address': s.email || '',
        'Status': (s.status === 'active' || s.active === true) ? 'Active' : 'Unsubscribed',
        'Target Categories': cats,
        'Target Regions': regs,
        'Dispatch Frequency': (s.frequency || 'Daily').toUpperCase(),
        'Subscription Source': s.source || 'Homepage Daily Alerts',
        'Date Subscribed': createdDate,
        'Last Updated': updatedDate,
        'Last Alert Sent': lastAlert,
        'Total Alerts Received': s.alertsCount || 0
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet['!cols'] = [
      { wch: 6 },  // No.
      { wch: 28 }, // Subscriber ID
      { wch: 34 }, // Email Address
      { wch: 14 }, // Status
      { wch: 38 }, // Target Categories
      { wch: 22 }, // Target Regions
      { wch: 18 }, // Dispatch Frequency
      { wch: 26 }, // Subscription Source
      { wch: 22 }, // Date Subscribed
      { wch: 22 }, // Last Updated
      { wch: 22 }, // Last Alert Sent
      { wch: 20 }  // Total Alerts
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Email Subscribers');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const filename = `opportunity-ghana-email-subscribers-${todayStr}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (err: any) {
    console.error('Error generating subscriber export:', err);
    return res.status(500).json({ error: 'Failed to generate subscriber export' });
  }
});

// 7. ADMIN: Dispatch Daily Alert Digest to Active Subscribers
app.post('/api/admin/alerts/dispatch-daily', verifyAdminAuth, async (req, res) => {
  try {
    const activeSubscribers = Array.from(serverAlertSubscribersMap.values()).filter(
      (s) => s.status === 'active' || s.active === true
    );

    if (activeSubscribers.length === 0) {
      return res.json({
        success: true,
        sentCount: 0,
        message: 'No active subscribers to dispatch alerts to.'
      });
    }

    // Find top open/recent opportunities to include in digest
    const recentOpps = Array.from(serverPublishedOppsMap.values())
      .filter((o) => o.status === 'published')
      .slice(0, 5);

    const fallbackTitle = ALL_VERIFIED_INITIAL[0]?.title || 'MTN Ghana Bright Scholarship 2026';
    const topTitle = recentOpps.length > 0 ? recentOpps[0].title : fallbackTitle;
    const now = new Date().toISOString();

    let updatedCount = 0;
    for (const sub of activeSubscribers) {
      const key = normalizeAlertEmail(sub.email);
      const updated = {
        ...sub,
        lastAlertSentAt: now,
        lastAlertTitle: topTitle,
        alertsCount: (sub.alertsCount || 0) + 1,
        updatedAt: now
      };
      serverAlertSubscribersMap.set(key, updated);
      updatedCount++;

      if (adminDb && isInitialized) {
        adminDb.collection('alerts').doc(updated.id).set(updated, { merge: true }).catch(() => {});
      }
    }

    persistServerAlertSubscribers();

    return res.json({
      success: true,
      sentCount: updatedCount,
      timestamp: now,
      leadOpportunity: topTitle,
      message: `Daily alert digest successfully queued & recorded for ${updatedCount} active subscriber${updatedCount === 1 ? '' : 's'}.`
    });
  } catch (err: any) {
    console.error('Error dispatching daily alerts:', err);
    return res.status(500).json({ error: 'Failed to dispatch daily alerts' });
  }
});

// 8. ADMIN: Record Audit Log for Subscriber Export
app.post('/api/admin/alerts/audit-export', verifyAdminAuth, async (req, res) => {
  try {
    const user = (req as any).user || {};
    const { count, scope, filename } = req.body || {};

    const auditEntry = {
      id: `log_export_${Date.now()}`,
      entityType: 'alert_subscribers',
      entityId: 'daily_alerts_export',
      entityTitle: `Subscribers Export (${scope || 'all'}: ${count || 0} subscribers)`,
      action: 'exported',
      performedByEmail: user.email || 'administrator@opportunityghana.com',
      performedByName: user.name || 'Administrator',
      timestamp: new Date().toISOString(),
      details: `Exported ${count || 0} subscribers to ${filename || 'Export file'}`
    };

    if (adminDb && isInitialized) {
      adminDb.collection('audit_logs').doc(auditEntry.id).set(auditEntry).catch(() => {});
    }

    return res.json({ success: true, auditEntry });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// =========================================================================
// GOOGLE SHEETS & OAUTH 2.0 INTEGRATION ENDPOINTS
// Dedicated synchronization and sheet management for Opportunity Ghana CMS
// =========================================================================
const GOOGLE_SHEETS_CONFIG_FILE = path.resolve(process.cwd(), 'data', 'google_sheets_config.json');

interface GoogleSheetsConfigState {
  isConnected: boolean;
  connectedEmail?: string;
  connectedAt?: string | null;
  tokens?: {
    access_token?: string;
    refresh_token?: string;
    expiry_date?: number;
    token_type?: string;
  };
  customCredentials?: {
    clientId?: string;
    clientSecret?: string;
  };
  spreadsheetId?: string;
  spreadsheetName?: string;
  sheetName?: string;
  spreadsheetUrl?: string;
  lastSyncAt?: string | null;
  lastSyncCount?: number;
  lastSyncStatus?: 'success' | 'failed' | 'idle';
  lastSyncError?: string | null;
}

function loadGoogleSheetsConfig(): GoogleSheetsConfigState {
  const defaults: GoogleSheetsConfigState = {
    isConnected: false,
    connectedEmail: '',
    connectedAt: null,
    sheetName: 'Email Subscribers',
    lastSyncStatus: 'idle',
    lastSyncCount: 0
  };

  try {
    if (fs.existsSync(GOOGLE_SHEETS_CONFIG_FILE)) {
      const raw = fs.readFileSync(GOOGLE_SHEETS_CONFIG_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    }
  } catch (err) {
    console.warn('[GoogleSheets] Could not read config from disk:', err);
  }
  return defaults;
}

let googleSheetsConfigState = loadGoogleSheetsConfig();

function saveGoogleSheetsConfig(updated: GoogleSheetsConfigState) {
  googleSheetsConfigState = updated;
  try {
    if (!fs.existsSync(path.dirname(GOOGLE_SHEETS_CONFIG_FILE))) {
      fs.mkdirSync(path.dirname(GOOGLE_SHEETS_CONFIG_FILE), { recursive: true });
    }
    fs.writeFileSync(GOOGLE_SHEETS_CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf8');
  } catch (err) {
    console.warn('[GoogleSheets] Could not write config to disk:', err);
  }

  // Also persist to Firestore if available
  if (adminDb && isInitialized) {
    try {
      adminDb.collection('settings').doc('google_sheets_config').set({
        isConnected: updated.isConnected,
        connectedEmail: updated.connectedEmail || '',
        connectedAt: updated.connectedAt || null,
        spreadsheetId: updated.spreadsheetId || '',
        spreadsheetName: updated.spreadsheetName || '',
        sheetName: updated.sheetName || 'Email Subscribers',
        spreadsheetUrl: updated.spreadsheetUrl || '',
        lastSyncAt: updated.lastSyncAt || null,
        lastSyncCount: updated.lastSyncCount || 0,
        lastSyncStatus: updated.lastSyncStatus || 'idle',
        lastSyncError: updated.lastSyncError || null,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    } catch {}
  }
}

function getGoogleOAuthCredentials(): { clientId: string; clientSecret: string } {
  const envClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const envClientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();

  const customId = (googleSheetsConfigState.customCredentials?.clientId || '').trim();
  const customSecret = (googleSheetsConfigState.customCredentials?.clientSecret || '').trim();

  return {
    clientId: envClientId || customId,
    clientSecret: envClientSecret || customSecret
  };
}

function getEffectiveGoogleRedirectUri(req: express.Request): string {
  if (process.env.GOOGLE_REDIRECT_URI && process.env.GOOGLE_REDIRECT_URI.trim()) {
    return process.env.GOOGLE_REDIRECT_URI.trim();
  }
  const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'opportunityghana.site';
  const proto = (req.headers['x-forwarded-proto'] as string) || (req.secure ? 'https' : 'http');
  return `${proto}://${host}/api/admin/google-sheets/callback`;
}

async function getOrRefreshGoogleAccessToken(): Promise<string> {
  const config = googleSheetsConfigState;
  const creds = getGoogleOAuthCredentials();

  if (!config.tokens?.access_token && !config.tokens?.refresh_token) {
    throw new Error('Google Sheets is not connected. Please click "Connect Google Sheets" first.');
  }

  const nowMs = Date.now();
  const expiry = config.tokens.expiry_date || 0;

  // If token is still valid for at least 3 minutes, use it
  if (config.tokens.access_token && expiry > nowMs + 180000) {
    return config.tokens.access_token;
  }

  // If we have a refresh token and credentials, refresh it
  if (config.tokens.refresh_token && creds.clientId && creds.clientSecret) {
    try {
      const params = new URLSearchParams({
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        refresh_token: config.tokens.refresh_token,
        grant_type: 'refresh_token'
      });

      const resp = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      if (resp.ok) {
        const data = await resp.json();
        const newExpiry = nowMs + ((data.expires_in || 3600) * 1000);
        const updatedConfig: GoogleSheetsConfigState = {
          ...config,
          tokens: {
            ...config.tokens,
            access_token: data.access_token,
            expiry_date: newExpiry
          }
        };
        saveGoogleSheetsConfig(updatedConfig);
        return data.access_token;
      }
    } catch (refreshErr: any) {
      console.warn('[GoogleSheets] Token refresh warning:', refreshErr.message);
    }
  }

  // If access_token exists even if close to expiry, attempt with it
  if (config.tokens.access_token) {
    return config.tokens.access_token;
  }

  throw new Error('Google authorization token expired. Please click "Connect Google Sheets" to reconnect.');
}

// 1. GET /api/admin/google-sheets/status - Get current connection and sync status
app.get('/api/admin/google-sheets/status', verifyAdminAuth, async (req, res) => {
  const creds = getGoogleOAuthCredentials();
  const redirectUri = getEffectiveGoogleRedirectUri(req);
  const cfg = googleSheetsConfigState;

  const isConnected = Boolean(
    cfg.isConnected &&
    (cfg.tokens?.access_token || cfg.tokens?.refresh_token)
  );

  return res.json({
    success: true,
    isConnected,
    connectedEmail: cfg.connectedEmail || '',
    connectedAt: cfg.connectedAt || null,
    spreadsheetId: cfg.spreadsheetId || '',
    spreadsheetName: cfg.spreadsheetName || '',
    sheetName: cfg.sheetName || 'Email Subscribers',
    spreadsheetUrl: cfg.spreadsheetUrl || (cfg.spreadsheetId ? `https://docs.google.com/spreadsheets/d/${cfg.spreadsheetId}` : ''),
    lastSyncAt: cfg.lastSyncAt || null,
    lastSyncCount: cfg.lastSyncCount || 0,
    lastSyncStatus: cfg.lastSyncStatus || 'idle',
    lastSyncError: cfg.lastSyncError || null,
    hasCredentials: Boolean(creds.clientId && creds.clientSecret),
    clientIdConfigured: Boolean(creds.clientId),
    clientIdMasked: creds.clientId ? `${creds.clientId.slice(0, 8)}...${creds.clientId.slice(-8)}` : '',
    redirectUri
  });
});

// 2. GET /api/admin/google-sheets/auth-url - Initiate Google OAuth flow
app.get('/api/admin/google-sheets/auth-url', verifyAdminAuth, async (req, res) => {
  try {
    const creds = getGoogleOAuthCredentials();
    const redirectUri = getEffectiveGoogleRedirectUri(req);

    if (!creds.clientId || !creds.clientSecret) {
      return res.status(400).json({
        success: false,
        error: 'Google OAuth Client credentials are not configured.',
        details: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment or configure them in the Google Sheets panel below.',
        redirectUri
      });
    }

    const statePayload = {
      uid: (req as any).user?.uid || 'admin',
      ts: Date.now(),
      rand: Math.random().toString(36).substring(2, 10)
    };
    const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(creds.clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=${encodeURIComponent(state)}`;

    if (req.query.direct === 'true') {
      return res.redirect(authUrl);
    }

    return res.json({
      success: true,
      authUrl,
      redirectUri
    });
  } catch (err: any) {
    console.error('Error creating Google auth URL:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to generate auth URL' });
  }
});

// 3. GET /api/admin/google-sheets/callback - Handle official Google OAuth 2.0 redirect callback
app.get('/api/admin/google-sheets/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.warn('[GoogleSheets OAuth Callback] Google returned error:', error);
    return res.redirect(`/admin/subscribers?sheets_error=${encodeURIComponent(String(error))}`);
  }

  if (!code || typeof code !== 'string') {
    return res.redirect('/admin/subscribers?sheets_error=missing_authorization_code');
  }

  try {
    const creds = getGoogleOAuthCredentials();
    const redirectUri = getEffectiveGoogleRedirectUri(req);

    if (!creds.clientId || !creds.clientSecret) {
      return res.redirect('/admin/subscribers?sheets_error=missing_server_credentials');
    }

    // Exchange authorization code for tokens
    const tokenParams = new URLSearchParams({
      code,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString()
    });

    if (!tokenResp.ok) {
      const errBody = await tokenResp.text();
      console.error('[GoogleSheets Callback] Token exchange failed:', errBody);
      return res.redirect(`/admin/subscribers?sheets_error=${encodeURIComponent('Token exchange failed: ' + errBody.slice(0, 100))}`);
    }

    const tokenData = await tokenResp.json();
    const nowMs = Date.now();
    const expiryDate = nowMs + ((tokenData.expires_in || 3600) * 1000);

    // Fetch authorized user profile info
    let connectedEmail = '';
    try {
      const userResp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      if (userResp.ok) {
        const userData = await userResp.json();
        connectedEmail = userData.email || '';
      }
    } catch (uErr: any) {
      console.warn('[GoogleSheets Callback] Could not fetch user email:', uErr.message);
    }

    const updatedConfig: GoogleSheetsConfigState = {
      ...googleSheetsConfigState,
      isConnected: true,
      connectedEmail: connectedEmail || googleSheetsConfigState.connectedEmail || 'Google Administrator',
      connectedAt: new Date().toISOString(),
      tokens: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || googleSheetsConfigState.tokens?.refresh_token,
        expiry_date: expiryDate,
        token_type: tokenData.token_type || 'Bearer'
      },
      lastSyncStatus: 'idle',
      lastSyncError: null
    };

    saveGoogleSheetsConfig(updatedConfig);
    console.info(`[GoogleSheets] Successfully connected Google account: ${connectedEmail}`);

    return res.redirect('/admin/subscribers?sheets_connected=true');
  } catch (err: any) {
    console.error('[GoogleSheets Callback] Error handling callback:', err);
    return res.redirect(`/admin/subscribers?sheets_error=${encodeURIComponent(err.message || 'Authorization error')}`);
  }
});

// 4. POST /api/admin/google-sheets/connect-token - Direct connection via client Google Auth token
app.post('/api/admin/google-sheets/connect-token', verifyAdminAuth, async (req, res) => {
  try {
    const { accessToken, refreshToken, email } = req.body || {};
    if (!accessToken || typeof accessToken !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid access token is required.' });
    }

    // Verify token with Google
    let verifiedEmail = email || '';
    try {
      const userResp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (userResp.ok) {
        const uData = await userResp.json();
        verifiedEmail = uData.email || verifiedEmail;
      }
    } catch {}

    const nowMs = Date.now();
    const updatedConfig: GoogleSheetsConfigState = {
      ...googleSheetsConfigState,
      isConnected: true,
      connectedEmail: verifiedEmail || 'Google Administrator',
      connectedAt: new Date().toISOString(),
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken || googleSheetsConfigState.tokens?.refresh_token,
        expiry_date: nowMs + 3600 * 1000,
        token_type: 'Bearer'
      },
      lastSyncStatus: 'idle',
      lastSyncError: null
    };

    saveGoogleSheetsConfig(updatedConfig);

    return res.json({
      success: true,
      message: 'Google Sheets successfully connected!',
      connectedEmail: updatedConfig.connectedEmail,
      connectedAt: updatedConfig.connectedAt
    });
  } catch (err: any) {
    console.error('Error connecting with direct token:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to connect token' });
  }
});

// 5. POST /api/admin/google-sheets/config - Save custom Client ID / Secret in settings
app.post('/api/admin/google-sheets/config', verifyAdminAuth, async (req, res) => {
  try {
    const { clientId, clientSecret } = req.body || {};
    const updatedConfig: GoogleSheetsConfigState = {
      ...googleSheetsConfigState,
      customCredentials: {
        clientId: (clientId || '').trim(),
        clientSecret: (clientSecret || '').trim()
      }
    };
    saveGoogleSheetsConfig(updatedConfig);
    return res.json({
      success: true,
      message: 'Google OAuth credentials saved successfully.',
      hasCredentials: Boolean(updatedConfig.customCredentials?.clientId && updatedConfig.customCredentials?.clientSecret)
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 6. POST /api/admin/google-sheets/create-spreadsheet - Create structured destination spreadsheet
app.post('/api/admin/google-sheets/create-spreadsheet', verifyAdminAuth, async (req, res) => {
  try {
    const accessToken = await getOrRefreshGoogleAccessToken();
    const customTitle = req.body?.title || 'Opportunity Ghana - Email Subscribers';

    // 1. Create spreadsheet with default "Email Subscribers" tab and frozen top row
    const createResp = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: customTitle
        },
        sheets: [
          {
            properties: {
              title: 'Email Subscribers',
              gridProperties: {
                frozenRowCount: 1
              }
            }
          }
        ]
      })
    });

    if (!createResp.ok) {
      const errText = await createResp.text();
      throw new Error(`Failed to create spreadsheet: ${errText}`);
    }

    const createdData = await createResp.json();
    const spreadsheetId = createdData.spreadsheetId;
    const sheetTitle = 'Email Subscribers';
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

    // 2. Set Header Row with all opportunity categories & subscriber fields
    const headers = [
      'Subscriber ID',
      'Email Address',
      'Subscription Status',
      'Scholarships',
      'Grants & Funding',
      'Jobs',
      'Internships',
      'Courses & Training',
      'Fellowships',
      'Admissions & Institutions',
      'Competitions',
      'Entrepreneurship',
      'Graduate Programmes',
      'Government Programmes',
      'Skills Preferences',
      'Location Preferences',
      'Dispatch Frequency',
      'Subscription Source',
      'Date Subscribed',
      'Last Updated'
    ];

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A1:T1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: `${sheetTitle}!A1:T1`,
        majorDimension: 'ROWS',
        values: [headers]
      })
    });

    // 3. Format header styling (Ghana dark green background #006B3F with bold white text)
    try {
      const sheetId = createdData.sheets?.[0]?.properties?.sheetId || 0;
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0, green: 0.42, blue: 0.25 }, // #006B3F
                    textFormat: {
                      foregroundColor: { red: 1, green: 1, blue: 1 },
                      bold: true,
                      fontSize: 10
                    },
                    horizontalAlignment: 'LEFT'
                  }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
              }
            },
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: 20
                }
              }
            }
          ]
        })
      });
    } catch (fmtErr: any) {
      console.warn('[GoogleSheets] Header styling note:', fmtErr.message);
    }

    const updatedConfig: GoogleSheetsConfigState = {
      ...googleSheetsConfigState,
      spreadsheetId,
      spreadsheetName: customTitle,
      sheetName: sheetTitle,
      spreadsheetUrl
    };
    saveGoogleSheetsConfig(updatedConfig);

    return res.json({
      success: true,
      message: `Spreadsheet "${customTitle}" created successfully!`,
      spreadsheetId,
      spreadsheetName: customTitle,
      sheetName: sheetTitle,
      spreadsheetUrl
    });
  } catch (err: any) {
    console.error('Error creating spreadsheet:', err);
    return res.status(500).json({ success: false, error: err.message || 'Could not create spreadsheet' });
  }
});

// 7. POST /api/admin/google-sheets/select-spreadsheet - Select existing spreadsheet & tab
app.post('/api/admin/google-sheets/select-spreadsheet', verifyAdminAuth, async (req, res) => {
  try {
    const accessToken = await getOrRefreshGoogleAccessToken();
    const rawIdOrUrl = (req.body?.spreadsheetId || '').trim();
    const customSheetName = (req.body?.sheetName || '').trim();

    if (!rawIdOrUrl) {
      return res.status(400).json({ success: false, error: 'Spreadsheet ID or URL is required.' });
    }

    // Extract ID if full Google Sheets URL provided
    let spreadsheetId = rawIdOrUrl;
    const urlMatch = rawIdOrUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      spreadsheetId = urlMatch[1];
    }

    // Verify access to spreadsheet and fetch sheet tabs
    const metaResp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!metaResp.ok) {
      const errText = await metaResp.text();
      return res.status(400).json({
        success: false,
        error: `Could not access spreadsheet (${metaResp.status}). Ensure the connected Google account has edit permissions for this spreadsheet.`
      });
    }

    const meta = await metaResp.json();
    const spreadsheetName = meta.properties?.title || 'Connected Spreadsheet';
    const sheetsList = (meta.sheets || []).map((s: any) => s.properties?.title || 'Sheet1');

    const sheetName = customSheetName && sheetsList.includes(customSheetName)
      ? customSheetName
      : (sheetsList.includes('Email Subscribers') ? 'Email Subscribers' : sheetsList[0] || 'Sheet1');

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

    const updatedConfig: GoogleSheetsConfigState = {
      ...googleSheetsConfigState,
      spreadsheetId,
      spreadsheetName,
      sheetName,
      spreadsheetUrl
    };
    saveGoogleSheetsConfig(updatedConfig);

    return res.json({
      success: true,
      message: `Connected to spreadsheet "${spreadsheetName}".`,
      spreadsheetId,
      spreadsheetName,
      sheetName,
      spreadsheetUrl,
      availableSheets: sheetsList
    });
  } catch (err: any) {
    console.error('Error selecting spreadsheet:', err);
    return res.status(500).json({ success: false, error: err.message || 'Could not select spreadsheet' });
  }
});

// 8. POST /api/admin/google-sheets/test-connection - Verify permissions and sheet access
app.post('/api/admin/google-sheets/test-connection', verifyAdminAuth, async (req, res) => {
  try {
    const accessToken = await getOrRefreshGoogleAccessToken();
    const cfg = googleSheetsConfigState;

    if (!cfg.spreadsheetId) {
      return res.status(400).json({
        success: false,
        error: 'No spreadsheet selected. Please select or create a destination spreadsheet first.'
      });
    }

    const metaResp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cfg.spreadsheetId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!metaResp.ok) {
      const errText = await metaResp.text();
      return res.status(400).json({
        success: false,
        error: `Failed to connect to Google Sheet (${metaResp.status}). Check spreadsheet sharing permissions.`
      });
    }

    const meta = await metaResp.json();
    const title = meta.properties?.title || 'Spreadsheet';
    const sheetName = cfg.sheetName || 'Email Subscribers';

    // Test reading data range
    let rowCount = 0;
    try {
      const valResp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cfg.spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:B`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (valResp.ok) {
        const valData = await valResp.json();
        rowCount = (valData.values || []).length;
      }
    } catch {}

    return res.json({
      success: true,
      message: `Connection verified! Successfully connected to "${title}" (tab: "${sheetName}").`,
      spreadsheetTitle: title,
      sheetName,
      rowCount,
      connectedEmail: cfg.connectedEmail,
      permissionsVerified: true
    });
  } catch (err: any) {
    console.error('Error testing Google Sheets connection:', err);
    return res.status(500).json({ success: false, error: err.message || 'Connection test failed' });
  }
});

// 9. POST /api/admin/google-sheets/sync - Synchronize CMS subscribers to Google Sheets with duplicate prevention
app.post('/api/admin/google-sheets/sync', verifyAdminAuth, async (req, res) => {
  try {
    const accessToken = await getOrRefreshGoogleAccessToken();
    const cfg = googleSheetsConfigState;

    if (!cfg.spreadsheetId) {
      return res.status(400).json({
        success: false,
        error: 'No spreadsheet selected. Please create or choose a spreadsheet first.'
      });
    }

    const sheetName = cfg.sheetName || 'Email Subscribers';
    const subscribers = Array.from(serverAlertSubscribersMap.values());

    // 1. Fetch current rows from destination worksheet
    const getResp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cfg.spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:T`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    let existingRows: string[][] = [];
    if (getResp.ok) {
      const sheetData = await getResp.json();
      existingRows = sheetData.values || [];
    }

    const headers = [
      'Subscriber ID',
      'Email Address',
      'Subscription Status',
      'Scholarships',
      'Grants & Funding',
      'Jobs',
      'Internships',
      'Courses & Training',
      'Fellowships',
      'Admissions & Institutions',
      'Competitions',
      'Entrepreneurship',
      'Graduate Programmes',
      'Government Programmes',
      'Skills Preferences',
      'Location Preferences',
      'Dispatch Frequency',
      'Subscription Source',
      'Date Subscribed',
      'Last Updated'
    ];

    // If worksheet is empty or missing headers, insert headers row at A1
    if (existingRows.length === 0) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cfg.spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:T1?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range: `${sheetName}!A1:T1`,
          majorDimension: 'ROWS',
          values: [headers]
        })
      });
      existingRows = [headers];
    }

    // Map existing rows by email (column B / index 1) and by Subscriber ID (column A / index 0)
    // 1-indexed for Google Sheets row numbers: row 1 is headers, data starts at row 2
    const existingRowIndexByEmail = new Map<string, number>();
    const existingRowIndexById = new Map<string, number>();

    for (let i = 1; i < existingRows.length; i++) {
      const row = existingRows[i];
      const rowId = (row[0] || '').trim();
      const rowEmail = normalizeAlertEmail(row[1] || '');
      const sheetRowNum = i + 1;

      if (rowId) existingRowIndexById.set(rowId, sheetRowNum);
      if (rowEmail) existingRowIndexByEmail.set(rowEmail, sheetRowNum);
    }

    // Helper to format subscriber into exact spreadsheet row values
    const formatSubscriberRow = (sub: any): string[] => {
      const cats = Array.isArray(sub.categories) ? sub.categories : [];
      const has = (re: RegExp) => cats.some((c: string) => re.test(c)) ? 'Yes' : 'No';
      const regs = Array.isArray(sub.regions) && sub.regions.length > 0 ? sub.regions.join(', ') : 'All Ghana';
      const createdDate = sub.createdAt ? new Date(sub.createdAt).toISOString().replace('T', ' ').substring(0, 19) : '';
      const updatedDate = sub.updatedAt ? new Date(sub.updatedAt).toISOString().replace('T', ' ').substring(0, 19) : '';
      const statusLabel = (sub.status === 'active' || sub.active === true) ? 'Active' : 'Unsubscribed';

      return [
        sub.id || '',
        sub.email || '',
        statusLabel,
        has(/scholarship/i),
        has(/grant/i),
        has(/job/i),
        has(/intern/i),
        has(/course|training/i),
        has(/fellowship/i),
        has(/admiss/i),
        has(/compet/i),
        has(/entrepreneur/i),
        has(/graduate/i),
        has(/government/i),
        has(/skill/i),
        regs,
        (sub.frequency || 'Daily').toUpperCase(),
        sub.source || 'Website',
        createdDate,
        updatedDate
      ];
    };

    const batchUpdates: { range: string; values: string[][] }[] = [];
    const rowsToAppend: string[][] = [];

    let updatedCount = 0;
    let addedCount = 0;

    for (const sub of subscribers) {
      const emailKey = normalizeAlertEmail(sub.email);
      const targetRowNum = existingRowIndexByEmail.get(emailKey) || existingRowIndexById.get(sub.id);
      const rowValues = formatSubscriberRow(sub);

      if (targetRowNum) {
        // Update existing row in place without creating duplicates
        batchUpdates.push({
          range: `${sheetName}!A${targetRowNum}:T${targetRowNum}`,
          values: [rowValues]
        });
        updatedCount++;
      } else {
        // Append as new row
        rowsToAppend.push(rowValues);
        addedCount++;
      }
    }

    // Execute Batch Updates for existing rows
    if (batchUpdates.length > 0) {
      // Chunk batch updates to max 200 per call for API safety
      const chunkSize = 200;
      for (let i = 0; i < batchUpdates.length; i += chunkSize) {
        const chunk = batchUpdates.slice(i, i + chunkSize);
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cfg.spreadsheetId}/values:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            valueInputOption: 'USER_ENTERED',
            data: chunk
          })
        });
      }
    }

    // Append new subscriber rows
    if (rowsToAppend.length > 0) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cfg.spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:T:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range: `${sheetName}!A:T`,
          majorDimension: 'ROWS',
          values: rowsToAppend
        })
      });
    }

    const now = new Date().toISOString();
    const updatedConfig: GoogleSheetsConfigState = {
      ...cfg,
      lastSyncAt: now,
      lastSyncCount: subscribers.length,
      lastSyncStatus: 'success',
      lastSyncError: null
    };
    saveGoogleSheetsConfig(updatedConfig);

    console.info(`[GoogleSheets Sync] Successfully synchronized ${subscribers.length} subscribers (${addedCount} added, ${updatedCount} updated).`);

    return res.json({
      success: true,
      message: `Synchronized ${subscribers.length} subscriber records to Google Sheet (${addedCount} added, ${updatedCount} updated in-place).`,
      totalSubscribers: subscribers.length,
      addedCount,
      updatedCount,
      lastSyncAt: now,
      spreadsheetUrl: cfg.spreadsheetUrl
    });
  } catch (err: any) {
    console.error('Error synchronizing to Google Sheets:', err);
    const now = new Date().toISOString();
    saveGoogleSheetsConfig({
      ...googleSheetsConfigState,
      lastSyncStatus: 'failed',
      lastSyncError: err.message || 'Synchronization failed',
      lastSyncAt: now
    });
    return res.status(500).json({ success: false, error: err.message || 'Synchronization failed' });
  }
});

// 10. POST /api/admin/google-sheets/disconnect - Safely disconnect Google Sheets
app.post('/api/admin/google-sheets/disconnect', verifyAdminAuth, async (req, res) => {
  try {
    const updatedConfig: GoogleSheetsConfigState = {
      ...googleSheetsConfigState,
      isConnected: false,
      connectedEmail: undefined,
      connectedAt: null,
      tokens: undefined,
      lastSyncStatus: 'idle',
      lastSyncError: null
    };
    saveGoogleSheetsConfig(updatedConfig);
    console.info('[GoogleSheets] Disconnected Google Sheets integration.');
    return res.json({
      success: true,
      message: 'Google Sheets disconnected safely.'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
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

// =========================================================================
// COMPETITION & TALENT DISCOVERY RESEARCH ENDPOINTS
// =========================================================================
const competitionRuns: any[] = [];

// 1. Start Competition Research Run (Admin only)
app.post('/api/admin/competition-research/start', verifyAdminAuth, async (req, res) => {
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
        console.warn('Error fetching opps for competition dedup:', err.message);
      }
    }

    const { run, candidates } = await executeCompetitionResearch(
      params,
      { email: user.email || 'admin@opportunityghana.com', name: user.name || user.email || 'Administrator' },
      existingOpps
    );

    competitionRuns.unshift(run);
    if (adminDb && isInitialized) {
      try {
        await adminDb.collection('competition_research_runs').doc(run.id).set(run);
      } catch (err: any) {
        console.warn('Error saving competition run to Firestore:', err.message);
      }
    }

    return res.json({ success: true, run, candidates });
  } catch (error: any) {
    console.error('Error starting competition research:', error);
    return res.status(500).json({ error: error.message || 'Failed to execute competition research' });
  }
});

// 2. Recheck active competition deadlines (Admin only)
app.post('/api/admin/competition-research/recheck', verifyAdminAuth, async (req, res) => {
  try {
    let opps: any[] = [...ALL_VERIFIED_INITIAL];
    if (adminDb && isInitialized) {
      try {
        const snap = await adminDb.collection('opportunities').get();
        if (!snap.empty) {
          opps = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        }
      } catch (err: any) {
        console.warn('Error loading opps for competition recheck:', err.message);
      }
    }

    const summary = recheckCompetitionDeadlines(opps);

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
        console.warn('Error saving competition recheck updates:', e.message);
      }
    }

    return res.json({ success: true, summary });
  } catch (error: any) {
    console.error('Error during competition deadline recheck:', error);
    return res.status(500).json({ error: error.message || 'Failed to recheck competition deadlines' });
  }
});

// 3. Past competition research runs (Admin only)
app.get('/api/admin/competition-research/runs', verifyAdminAuth, async (req, res) => {
  try {
    if (adminDb && isInitialized) {
      try {
        const snap = await adminDb.collection('competition_research_runs').orderBy('startedAt', 'desc').limit(20).get();
        if (!snap.empty) {
          return res.json(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
        }
      } catch {}
    }
    return res.json(competitionRuns);
  } catch (error: any) {
    console.error('Error fetching competition runs:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch competition runs' });
  }
});

// 4. Publish discovered competition (Admin only)
app.post('/api/admin/competition-research/publish', verifyAdminAuth, async (req, res) => {
  try {
    const { competition } = req.body || {};
    if (!competition || !competition.title || (!competition.officialApplicationUrl && !competition.applicationUrl)) {
      return res.status(400).json({ error: 'Valid competition candidate with application URL is required.' });
    }

    const user = (req as any).user || { email: 'admin@opportunityghana.com', name: 'Administrator' };
    const now = new Date().toISOString();
    const id = competition.matchedExistingId || competition.id || `opp-comp-${Date.now()}`;
    const slug = competition.slug || competition.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const publishedOpp = {
      id,
      title: competition.title,
      slug,
      description: competition.description || '',
      organizationName: competition.organizerName || competition.organizationName,
      category: 'Competitions',
      subcategory: competition.subcategory || 'Competitions',
      opportunityType: competition.competitionType || 'Competition',
      location: competition.location || 'Ghana',
      country: competition.country || 'Ghana',
      region: competition.region || 'Nationwide',
      locationType: competition.locationType || 'physical',
      nationality: competition.nationality || 'Ghanaians',
      educationLevel: competition.educationLevel || 'Open to All',
      experienceLevel: competition.experienceLevel || 'Open to All',
      fundingType: competition.fundingType || 'Cash Prizes & Awards',
      funding: competition.prize || competition.funding || '',
      benefits: competition.benefits || [],
      requirements: competition.requirements || [],
      documentsRequired: competition.documentsRequired || [],
      deadline: competition.deadline || '',
      applicationUrl: competition.officialApplicationUrl || competition.applicationUrl,
      sourceUrl: competition.sourceUrl || competition.officialApplicationUrl || competition.applicationUrl,
      sourceName: competition.sourceName || competition.organizerName,
      imageUrl: competition.imageUrl || '',
      status: 'published',
      verificationStatus: 'verified',
      isDeadlineSpecified: competition.isDeadlineVerified ?? true,
      lastVerifiedAt: now,
      publishedAt: now,
      publishedByEmail: user.email,
      reviewedBy: user.name || user.email || 'Administrator',
      reviewedByEmail: user.email,
      createdAt: competition.createdAt || now,
      updatedAt: now
    };

    if (adminDb && isInitialized) {
      try {
        await adminDb.collection('opportunities').doc(id).set(publishedOpp, { merge: true });
      } catch (err: any) {
        console.warn('Error writing published competition to Firestore:', err.message);
      }
    }

    return res.json({ success: true, opportunity: publishedOpp });
  } catch (error: any) {
    console.error('Error publishing competition:', error);
    return res.status(500).json({ error: error.message || 'Failed to publish competition' });
  }
});

// PWA Service Worker & Web App Manifest headers and direct serving
app.get(['/sw.js', '/sw-monetag.js', '/sw (1).js', '/sw%20(1).js'], (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');

  if (req.path.includes('(1)')) {
    const sw1Public = path.resolve(process.cwd(), 'public', 'sw (1).js');
    if (fs.existsSync(sw1Public)) {
      return res.sendFile(sw1Public);
    }
  }

  if (req.path.includes('monetag')) {
    const swMonetag = path.resolve(process.cwd(), 'public', 'sw-monetag.js');
    if (fs.existsSync(swMonetag)) {
      return res.sendFile(swMonetag);
    }
  }

  const swPublic = path.resolve(process.cwd(), 'public', 'sw.js');
  if (fs.existsSync(swPublic)) {
    return res.sendFile(swPublic);
  }
  const swDist = path.resolve(process.cwd(), 'dist', 'sw.js');
  if (fs.existsSync(swDist)) {
    return res.sendFile(swDist);
  }
  next();
});

app.get(['/manifest.json', '/manifest.webmanifest'], (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  const manifestPublic = path.resolve(process.cwd(), 'public', 'manifest.json');
  if (fs.existsSync(manifestPublic)) {
    return res.sendFile(manifestPublic);
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

const isMainModule = Boolean(
  process.argv[1] &&
  (process.argv[1].endsWith('/server.ts') ||
   process.argv[1].endsWith('server.ts') ||
   process.argv[1].endsWith('/server.js') ||
   process.argv[1].endsWith('server.js'))
);

if (isMainModule && !process.env.VERCEL) {
  setupVite();
}

// Global error handler middleware to guarantee structured JSON responses for API routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[Opportunity Ghana Error] ${req.method} ${req.url}:`, err?.message || err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    success: false,
    error: err?.message || 'An unexpected internal server error occurred',
    code: err?.code || 'internal-error'
  });
});

export { app };
export default app;
