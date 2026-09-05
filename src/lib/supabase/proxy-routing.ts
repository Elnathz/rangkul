export type AppRole = "keluarga" | "helper" | "koordinator" | "admin";
export type FrontendRouteAccess = "public" | "authenticated" | AppRole;
export type ApiRouteAccess = "public" | "authenticated" | readonly AppRole[];

const ROLE_HOME: Record<AppRole, string> = {
  keluarga: "/beranda",
  helper: "/helper/dashboard",
  koordinator: "/koordinator/dashboard",
  admin: "/admin/dashboard",
};

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/help"];
const AUTHENTICATED_PATHS = ["/notifikasi"];
const ROLE_PATHS: Record<AppRole, readonly string[]> = {
  keluarga: [
    "/beranda",
    "/booking",
    "/cari-helper",
    "/kunjungan",
    "/lansia",
    "/pembayaran",
    "/saldo",
    "/banding",
  ],
  helper: ["/helper", "/tugas"],
  koordinator: ["/koordinator"],
  admin: ["/admin"],
};

export function isPathWithin(pathname: string, routeRoot: string) {
  return pathname === routeRoot || pathname.startsWith(`${routeRoot}/`);
}

export function getFrontendRouteAccess(pathname: string): FrontendRouteAccess | null {
  if (pathname === "/api" || pathname.startsWith("/api/")) return null;

  if (PUBLIC_PATHS.some((route) => isPathWithin(pathname, route))) return "public";
  if (AUTHENTICATED_PATHS.some((route) => isPathWithin(pathname, route))) return "authenticated";

  for (const role of Object.keys(ROLE_PATHS) as AppRole[]) {
    if (ROLE_PATHS[role].some((route) => isPathWithin(pathname, route))) return role;
  }

  return null;
}

export function getRoleHome(role: AppRole) {
  return ROLE_HOME[role];
}

export function getApiRouteAccess(pathname: string): ApiRouteAccess | null {
  if (pathname !== "/api" && !pathname.startsWith("/api/")) return null;

  if (isPathWithin(pathname, "/api/auth") || isPathWithin(pathname, "/api/payments/webhook")) {
    return "public";
  }

  if (isPathWithin(pathname, "/api/admin") || isPathWithin(pathname, "/api/debug")) {
    return ["admin"];
  }

  if (isPathWithin(pathname, "/api/helper/queue")) return ["koordinator"];
  if (/^\/api\/helper\/[^/]+\/(approve|reject)$/.test(pathname)) {
    return ["koordinator", "admin"];
  }
  if (/^\/api\/helpers\/[^/]+\/status$/.test(pathname)) {
    return ["koordinator", "admin"];
  }
  if (isPathWithin(pathname, "/api/helpers/profile/photo/approve")) return ["koordinator"];
  if (
    isPathWithin(pathname, "/api/helper") ||
    isPathWithin(pathname, "/api/helpers/apply") ||
    isPathWithin(pathname, "/api/helpers/profile/photo")
  ) {
    return ["helper"];
  }

  if (isPathWithin(pathname, "/api/koordinator")) return ["koordinator"];
  if (
    isPathWithin(pathname, "/api/lansia") ||
    isPathWithin(pathname, "/api/booking") ||
    isPathWithin(pathname, "/api/wallet") ||
    isPathWithin(pathname, "/api/appeals") ||
    isPathWithin(pathname, "/api/helpers")
  ) {
    return ["keluarga"];
  }

  return "authenticated";
}

export function isPublicRoute(pathname: string) {
  return getFrontendRouteAccess(pathname) === "public" || getApiRouteAccess(pathname) === "public";
}
