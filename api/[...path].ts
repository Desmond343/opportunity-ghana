import app from '../server.ts';

/**
 * Catch-all Vercel Serverless Function entry point for Opportunity Ghana API.
 * Handles /api/* endpoints across all dynamic subpaths.
 */
export default function handler(req: any, res: any) {
  return app(req, res);
}
