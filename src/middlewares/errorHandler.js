/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

/**
 * Centralized error handler middleware
 * Must be placed at the end of all routes and middlewares
 */
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${new Date().toISOString()}] Error:`, err);
  }

  // Prisma validation errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(400).json({
      error: {
        status: 400,
        message: `${field} already exists`,
      },
    });
  }

  // Prisma not found errors
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: {
        status: 404,
        message: 'Resource not found',
      },
    });
  }

  res.status(status).json({
    error: {
      status,
      message,
    },
  });
};
