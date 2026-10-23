import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors.js';

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.path} was not found`, 'NOT_FOUND'));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: { message: 'Please check the submitted fields', code: 'VALIDATION_ERROR', details: error.flatten() } });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: { message: 'That value is already in use', code: 'CONFLICT' } });
      return;
    }
    if (['P1001', 'P1002', 'P2024'].includes(error.code)) {
      res.status(503).json({ error: { message: 'The database is temporarily unavailable. Check that PostgreSQL is running and try again.', code: 'DATABASE_UNAVAILABLE' } });
      return;
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({ error: { message: 'The database is temporarily unavailable. Check that PostgreSQL is running and try again.', code: 'DATABASE_UNAVAILABLE' } });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: { message: error.message, code: error.code, details: error.details } });
    return;
  }

  console.error(error);
  res.status(500).json({ error: { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' } });
};
