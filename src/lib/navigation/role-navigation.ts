export type AppRole = "keluarga" | "helper" | "koordinator" | "admin";

export type NavigationIcon =
  | "home"
  | "calendar"
  | "users"
  | "wallet"
  | "message"
  | "shield"
  | "clipboard"
  | "alert"
  | "file"
  | "settings";

export type NavigationItem = {
  href: string;
  label: string;
  icon: NavigationIcon;
  aliases?: readonly string[];
  group?: string;
  mobileLabel?: string;
};

export const ROLE_NAVIGATION: Record<AppRole, readonly NavigationItem[]> = {
  keluarga: [
    { href: "/beranda", label: "Beranda", icon: "home" },
    { href: "/booking/new", label: "Buat Kunjungan", mobileLabel: "Buat", icon: "calendar" },
    { href: "/kunjungan", label: "Kunjungan", icon: "clipboard" },
    { href: "/lansia", label: "Lansia", icon: "users" },
    { href: "/beranda/pesan", label: "Pesan", icon: "message" },
  ],
  helper: [
    { href: "/helper/dashboard", label: "Beranda", icon: "home" },
    { href: "/helper/tugas/baru", label: "Cari Tugas", icon: "calendar" },
    { href: "/helper/tugas", label: "Tugas Saya", icon: "clipboard", aliases: ["/tugas"] },
    { href: "/helper/penghasilan", label: "Penghasilan", icon: "wallet" },
    { href: "/helper/pesan", label: "Pesan", icon: "message" },
  ],
  koordinator: [
    { href: "/koordinator/dashboard", label: "Ringkasan", icon: "home", group: "Ringkasan" },
    { href: "/koordinator/pengajuan", label: "Verifikasi Helper", icon: "users", aliases: ["/koordinator/antrean"], group: "Operasional" },
    { href: "/koordinator/persetujuan", label: "Persetujuan Kunjungan", icon: "clipboard", aliases: ["/koordinator/antrean-persetujuan"], group: "Operasional" },
    { href: "/koordinator/helper", label: "Helper Wilayah", icon: "shield", group: "Operasional" },
    { href: "/koordinator/darurat", label: "Darurat", icon: "alert", group: "Risiko & Laporan" },
    { href: "/koordinator/laporan", label: "Laporan", icon: "file", group: "Risiko & Laporan" },
    { href: "/koordinator/komisi", label: "Komisi", icon: "wallet", group: "Keuangan" },
    { href: "/koordinator/pesan", label: "Pesan", icon: "message", group: "Lainnya" },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Ringkasan", icon: "home", group: "Ringkasan" },
    { href: "/admin/users", label: "Pengguna", icon: "users", group: "Pengguna & Akses" },
    { href: "/admin/koordinator/pengajuan", label: "Koordinator", icon: "shield", group: "Pengguna & Akses" },
    { href: "/admin/helpers", label: "Helper", icon: "users", group: "Pengguna & Akses" },
    { href: "/admin/helpers/fallback", label: "Fallback verifikasi", icon: "shield", group: "Pengguna & Akses" },
    { href: "/admin/categories", label: "Kategori", icon: "settings", group: "Layanan" },
    { href: "/admin/reports", label: "Laporan", icon: "file", group: "Moderasi" },
    { href: "/admin/banding", label: "Banding", icon: "clipboard", group: "Moderasi" },
    { href: "/admin/demo-wallet", label: "Demo Wallet", icon: "wallet", group: "Keuangan" },
    { href: "/admin/audit-logs", label: "Audit Log", icon: "file", group: "Keuangan" },
  ],
};

function pathMatches(pathname: string, target: string) {
  return pathname === target || pathname.startsWith(`${target}/`);
}

function getItemMatchLength(pathname: string, item: NavigationItem) {
  const matchingPath = [item.href, ...(item.aliases ?? [])]
    .filter((target) => pathMatches(pathname, target))
    .sort((left, right) => right.length - left.length)[0];

  return matchingPath?.length ?? 0;
}

export function isNavigationItemActive(pathname: string, item: NavigationItem) {
  const itemMatchLength = getItemMatchLength(pathname, item);
  if (!itemMatchLength) return false;

  const longestMatch = Object.values(ROLE_NAVIGATION)
    .flat()
    .reduce((longest, candidate) => Math.max(longest, getItemMatchLength(pathname, candidate)), 0);

  return itemMatchLength === longestMatch;
}
