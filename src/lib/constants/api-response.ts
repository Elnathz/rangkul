import { NextResponse } from 'next/server';

export const API_ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  HELPER_UNAVAILABLE: 'HELPER_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  return NextResponse.json<ApiSuccessResponse<T>>(
    {
      success: true,
      ...(message ? { message } : {}),
      data,
    },
    { status }
  );
}

export function apiError(
  error: ApiErrorCode,
  message: string,
  status = 400,
  fieldErrors?: Record<string, string[]>
) {
  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      error,
      message,
      ...(fieldErrors ? { fieldErrors } : {}),
    },
    { status }
  );
}
