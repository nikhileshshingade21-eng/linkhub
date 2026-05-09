import type { Response } from 'express';

/**
 * Standardized success response
 */
export function success<T>(res: Response, data: T, statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Standardized error response
 */
export function error(res: Response, message: string, statusCode: number = 500) {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
}

/**
 * Standardized paginated response
 */
export function paginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
