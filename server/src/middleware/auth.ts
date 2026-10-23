import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/errors.js';
import { verifyToken } from '../services/token.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authorization = req.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError(401, 'Authentication required', 'UNAUTHORIZED'));
    return;
  }

  try {
    req.userId = verifyToken(authorization.slice(7)).sub;
    next();
  } catch {
    next(new AppError(401, 'Your session is invalid or has expired', 'INVALID_TOKEN'));
  }
}
