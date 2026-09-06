import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("admin lansia tidak menawarkan verifikasi manual", () => {
  const page = readFileSync("src/app/(admin)/admin/lansia/[id]/page.tsx", "utf8");

  assert.doesNotMatch(page, /Aksi Verifikasi Admin/);
  assert.doesNotMatch(page, /Setujui Verifikasi/);
  assert.doesNotMatch(page, /Tolak Pendaftaran/);
  assert.match(page, /Dokumen berkas pendaftaran/);
});

test("admin lansia menyediakan soft delete yang dilindungi konflik kunjungan", () => {
  const route = readFileSync("src/app/api/admin/lansia/[id]/route.ts", "utf8");

  assert.match(route, /export async function DELETE/);
  assert.match(route, /deleted_at/);
  assert.match(route, /conflict/);
  assert.match(route, /activeTasks/);
});

test("daftar admin lansia memakai aksi yang jelas dan tidak menggabungkan label berkas", () => {
  const page = readFileSync("src/app/(admin)/admin/lansia/page.tsx", "utf8");

  assert.match(page, /Lihat detail/);
  assert.match(page, /Hapus/);
  assert.doesNotMatch(page, /Detail & Berkas KTP/);
});

test("pagination admin pengguna menjelaskan rentang data dan posisi halaman", () => {
  const page = readFileSync("src/app/(admin)/admin/users/page.tsx", "utf8");

  assert.match(page, /Menampilkan \$\{firstResult/);
  assert.match(page, /Halaman <span className="text-slate-900">\{page\}<\/span> dari <span className="text-slate-900">\{totalPages\}<\/span>/);
  assert.match(page, /Navigasi halaman pengguna/);
  assert.match(page, /Halaman sebelumnya/);
});
