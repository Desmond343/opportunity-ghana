import app from '../server.ts';

/**
 * Vercel Serverless Function entry point for Opportunity Ghana API.
 * Delegates incoming requests to Express app.
 */
export default function handler(req: any, res: any) {
  return app(req, res);
}
