const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/help",
]);

export function isPublicRoute(pathname: string) {
  return (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/help/") ||
    pathname === "/api/auth" ||
    pathname.startsWith("/api/auth/")
  );
}
