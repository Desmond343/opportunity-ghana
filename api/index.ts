// @ts-ignore
import bundledHandler from './index.js';

export default function handler(req: any, res: any) {
  const fn = (bundledHandler && (bundledHandler as any).default) ? (bundledHandler as any).default : bundledHandler;
  return fn(req, res);
}
