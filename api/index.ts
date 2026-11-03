import app from '../server.ts';

/**
 * Vercel Serverless Function entry point for Opportunity Ghana API.
 * Delegates incoming requests to Express app with URL reconstruction and error trapping.
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
    console.error('[API Serverless Error]', err);
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
