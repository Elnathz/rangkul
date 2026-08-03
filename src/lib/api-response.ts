import { NextResponse } from 'next/server';
import { TaskStatus } from './constants';

/**
 * Standardized API response helper
 */
export function apiResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Standardized API error helper
 */
export function createApiError(errorCode: string, message: string, status: number = 400) {
  return apiResponse({ error: errorCode, message }, status);
}

/**
 * Standardized task status response
 */
export function taskStatusResponse(status: TaskStatus, additionalData: Record<string, any> = {}) {
  return apiResponse({ status, ...additionalData });
}