import type { NextRequest } from 'next/server';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function isMutationMethod(method: string) {
  return MUTATION_METHODS.has(method.toUpperCase());
}

/**
 * Binds browser mutations to the same origin as the request URL. This is the
 * lightweight CSRF boundary used by the app before a route handler runs.
 * Server-to-server callers can omit browser headers, while cross-site browser
 * requests are rejected unless the browser proves a same-origin request.
 */
export function isSameOriginMutation(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin) return origin === request.nextUrl.origin;

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).origin === request.nextUrl.origin;
    } catch {
      return false;
    }
  }

  return request.headers.get('sec-fetch-site') !== 'cross-site';
}
