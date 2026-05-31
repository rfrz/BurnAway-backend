import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const formatZodError = (error) =>
  error.issues
    .map((issue) => {
      const field = issue.path.join('.') || 'body';
      return `${field}: ${issue.message}`;
    })
    .join('; ');

const getUniqueConstraintMessage = (error) => {
  const target = error.meta?.target;

  if (Array.isArray(target) && target.length > 0) {
    return `${target.join(', ')} already exists`;
  }

  return 'A record with the submitted unique value already exists';
};

export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err instanceof ZodError) {
    statusCode = 400;
    message = `Validation failed: ${formatZodError(err)}`;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = getUniqueConstraintMessage(err);
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Requested record was not found';
    } else {
      statusCode = 500;
      message = 'Database request failed';
    }
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON request body';
  }

  if (statusCode >= 500 && !err.isOperational) {
    console.error(err);
    message = 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null
  });
};
