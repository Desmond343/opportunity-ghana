import app from '../server.ts';

/**
 * Catch-all Vercel Serverless Function entry point for Opportunity Ghana API.
 * Handles /api/* endpoints across all dynamic subpaths with safe URL mapping and JSON error trapping.
 */
export default async function handler(req: any, res: any) {
  try {
    const forwardedUri =
      req.headers['x-forwarded-uri'] ||
      req.headers['x-original-url'] ||
      req.headers['x-matched-path'] ||
      req.headers['x-vercel-matched-path'];

    if (forwardedUri && typeof forwardedUri === 'string' && forwardedUri.startsWith('/api')) {
      req.url = forwardedUri;
    } else if (req.query && req.query.path) {
      const subpath = Array.isArray(req.query.path) ? req.query.path.join('/') : String(req.query.path);
      req.url = '/api/' + subpath.replace(/^\/+/, '');
    }

    return app(req, res);
  } catch (err: any) {
    console.error('[API Serverless Subpath Error]', err);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({
        success: false,
        error: err?.message || 'Server error occurred',
        code: 'serverless-error'
      });
    }
  }
}
