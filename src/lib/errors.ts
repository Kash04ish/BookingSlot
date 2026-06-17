import { ZodError } from 'zod';
import type { ApiError } from './types';

export type BookingErrorCode =
  | 'SLOT_FULL'
  | 'SLOT_NOT_FOUND'
  | 'INVALID_INPUT'
  | 'INTERNAL';

export class BookingError extends Error {
  readonly code: BookingErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    code: BookingErrorCode,
    message: string,
    status: number,
    details?: unknown,
  ) {
    super(message);
    this.name = 'BookingError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function toApiErrorResponse(err: unknown): {
  status: number;
  body: ApiError;
} {
  if (err instanceof BookingError) {
    return {
      status: err.status,
      body: {
        error: { code: err.code, message: err.message, details: err.details },
      },
    };
  }
  if (err instanceof ZodError) {
    return {
      status: 400,
      body: {
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid input.',
          details: err.flatten(),
        },
      },
    };
  }
  return {
    status: 500,
    body: {
      error: {
        code: 'INTERNAL',
        message: 'Something went wrong. Please try again.',
      },
    },
  };
}
