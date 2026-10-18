import app from '../server.ts';

/**
 * Opportunity Ghana Vercel Serverless Function entry point.
 * Normalizes incoming request paths across all Vercel rewrite schemes and delegates to Express.
 */
export default function handler(req: any, res: any) {
  const forwardedUri = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
  if (forwardedUri && typeof forwardedUri === 'string' && forwardedUri.startsWith('/api')) {
    req.url = forwardedUri;
  } else if (req.query && req.query.path) {
    const subpath = Array.isArray(req.query.path) ? req.query.path.join('/') : String(req.query.path);
    const queryIdx = req.url.indexOf('?');
    const search = queryIdx >= 0 ? req.url.slice(queryIdx) : '';
    req.url = '/api/' + subpath.replace(/^\/+/, '') + search;
  }
  return app(req, res);
}
