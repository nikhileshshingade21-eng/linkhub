import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { env } from '../config/env.js';

/**
 * Global error handler middleware
 * Must be registered LAST in the middleware chain
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error in dev
  if (env.isDev) {
    console.error('[ERROR]', err.message);
    if (!(err instanceof AppError)) {
      console.error(err.stack);
    }
  }

  // Known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const zodErr = err as any;
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: zodErr.errors?.map((e: any) => ({
        field: e.path?.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Unknown errors — don't leak info in production
  res.status(500).json({
    success: false,
    error: env.isProd ? 'Internal server error' : err.message,
  });
}
