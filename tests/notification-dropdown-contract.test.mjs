import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const dropdown = fs.readFileSync(new URL("../src/components/notifications/NotificationDropdown.tsx", import.meta.url), "utf8");
const navbar = fs.readFileSync(new URL("../src/components/layout/Navbar.tsx", import.meta.url), "utf8");
const notificationPage = fs.readFileSync(new URL("../src/components/notifications/NotificationPageClient.tsx", import.meta.url), "utf8");
const proxySource = fs.readFileSync(new URL("../src/proxy.ts", import.meta.url), "utf8");
const tugasPage = fs.readFileSync(new URL("../src/app/(helper)/tugas/page.tsx", import.meta.url), "utf8");

test("NotificationDropdown menyediakan preview ber-scroll dan aksi navigasi penuh", () => {
  // Verifikasi kontainer scroll dan pembatas ketinggian
  assert.match(dropdown, /max-h-80/);
  assert.match(dropdown, /custom-scrollbar/);
  assert.match(dropdown, /overflow-y-auto/);

  // Verifikasi tombol Lihat Semua Notifikasi mengarah ke /notifikasi
  assert.match(dropdown, /href="\/notifikasi"/);
  assert.match(dropdown, /Lihat Semua Notifikasi/);

  // Verifikasi trigger API endpoint
  assert.match(dropdown, /\/api\/notifications\?limit=20/);
  assert.match(dropdown, /\/api\/notifications\/\$\{id\}\/read/);
});

test("NotificationDropdown mendukung tab filter Layanan dan Umum serta adaptasi role", () => {
  // Verifikasi tab segmented
  assert.match(dropdown, /Semua/);
  assert.match(dropdown, /Layanan/);
  assert.match(dropdown, /Umum/);

  // Verifikasi pemisahan jenis notifikasi
  assert.match(dropdown, /item\.type === "task"/);
  assert.match(dropdown, /item\.type === "emergency"/);
  assert.match(dropdown, /item\.type === "system"/);
  assert.match(dropdown, /item\.type === "payment"/);

  // Verifikasi target role navigation
  assert.match(dropdown, /\/helper\/tugas/);
  assert.match(dropdown, /\/kunjungan/);
  assert.match(dropdown, /\/koordinator\/persetujuan/);
});

test("NotificationDropdown menerapkan penataan responsif mobile-first", () => {
  // Di mobile: fixed inset-x-3 dengan max-w-sm; di desktop: sm:absolute sm:right-0 sm:w-96
  assert.match(dropdown, /fixed inset-x-3/);
  assert.match(dropdown, /sm:absolute/);
  assert.match(dropdown, /sm:right-0/);
  assert.match(dropdown, /sm:w-96/);

  // Backdrop untuk menutup saat klik luar
  assert.match(dropdown, /bg-slate-950\/20 sm:bg-transparent/);

  // Navbar mengintegrasikan NotificationDropdown
  assert.match(navbar, /<NotificationDropdown/);
});

test("halaman /notifikasi menyediakan tabs filter Layanan dan Umum serta tombol aksi kontekstual role", () => {
  // Verifikasi tab segmented di halaman penuh
  assert.match(notificationPage, /Semua Notifikasi/);
  assert.match(notificationPage, /Layanan & Tugas/);
  assert.match(notificationPage, /Umum & Sistem/);

  // Verifikasi tombol aksi spesifik role (tidak hardcode ke /tugas untuk semua role)
  assert.match(notificationPage, /getRoleActionLink/);
  assert.match(notificationPage, /Buka daftar kunjungan/);
  assert.match(notificationPage, /Buka persetujuan tugas/);
  assert.match(notificationPage, /Buka papan tugas/);
});

test("rute /tugas diproteksi agar non-helper tidak dapat melihat task board helper", () => {
  // Proteksi di proxy middleware
  assert.match(proxySource, /'\/tugas'/);
  assert.match(proxySource, /pathname\.startsWith\('\/tugas'\)/);

  // Proteksi di server component jika user bukan helper
  assert.match(tugasPage, /if \(!profile\) \{\s*redirect\("\/beranda"\);/);
});
