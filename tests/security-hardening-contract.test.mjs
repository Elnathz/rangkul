import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const seed = read("supabase/seed.sql");
const proxy = read("src/proxy.ts");
const uploadRoute = read("src/app/api/storage/upload/route.ts");
const helperPhotoRoute = read("src/app/api/helpers/profile/photo/route.ts");
const adminDeleteRoute = read("src/app/api/admin/users/[id]/route.ts");

function collectFiles(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? collectFiles(path) : [path];
  });
}

test("seed memuat detail persona lansia yang dapat didemokan tanpa klaim diagnosis", () => {
  assert.ok((seed.match(/umur\s*=/g) ?? []).length >= 5, "setiap lansia perlu umur demo");
  assert.ok((seed.match(/tingkat_mobilitas\s*=/g) ?? []).length >= 5, "setiap lansia perlu mobilitas");
  assert.ok((seed.match(/kebutuhan_khusus\s*=/g) ?? []).length >= 5, "setiap lansia perlu kebutuhan khusus");
  assert.ok((seed.match(/catatan_kondisi\s*=\s*'[^']{80,}'/g) ?? []).length >= 5, "catatan kondisi perlu konteks, bukan satu kalimat generik");
  assert.doesNotMatch(seed, /diagnosis|resep dokter|dosis obat/i, "seed tidak boleh mengklaim diagnosis atau instruksi medis");
});

test("seed memuat narasi pengalaman Helper yang spesifik", () => {
  const bios = [...seed.matchAll(/\(gen_random_uuid\(\),\s*helper_[^,]+,\s*'[^']+',\s*'([^']+)'/g)].map((match) => match[1]);
  assert.ok(bios.length >= 9, "fixture Helper utama tidak ditemukan");
  assert.ok(bios.filter((bio) => bio.length >= 100).length >= 9, "bio Helper masih terlalu generik");
  assert.ok(bios.filter((bio) => /pengalaman|mendampingi|merawat|komunitas/i.test(bio)).length >= 9, "bio Helper belum menjelaskan pengalaman");
  assert.doesNotMatch(seed, /dokter|perawat|sertifikat medis|tenaga kesehatan/i, "seed tidak boleh mengarang kredensial klinis");
});

test("proxy menolak mutasi API terlindungi dari origin berbeda", () => {
  assert.match(proxy, /csrf_origin_mismatch|isSameOriginMutation|Origin/i);
  assert.match(proxy, /NextResponse\.json/);
});

test("avatar Helper hanya menerima object path privat milik actor", () => {
  assert.match(helperPhotoRoute, /extractOwnedPrivateObjectPath/);
  assert.match(helperPhotoRoute, /foto_helper/);
  assert.doesNotMatch(helperPhotoRoute, /z\.string\(\)\.url/);
  assert.match(uploadRoute, /extractOwnedPrivateObjectPath|privateStorageReferenceSchema/);
});

test("account deletion memakai anonymization dan soft delete", () => {
  assert.match(adminDeleteRoute, /admin_anonymize_user/);
  assert.match(adminDeleteRoute, /deleteUser\(id,\s*true\)/);
  assert.ok(statSync("src/app/api/users/me/delete/route.ts"));
  assert.match(read("supabase/migrations/20260906120000_account_anonymization.sql"), /CREATE OR REPLACE FUNCTION public\.admin_anonymize_user/);
});

test("UI tidak memakai raw HTML injection dan route API tidak menginterpolasi SQL request", () => {
  const sourceFiles = collectFiles("src").filter((path) => /\.(ts|tsx)$/.test(path));
  for (const path of sourceFiles) {
    const source = read(path);
    assert.doesNotMatch(source, /dangerouslySetInnerHTML|\.innerHTML\s*=/, `raw HTML injection di ${path}`);
  }

  const routeFiles = collectFiles("src/app/api").filter((path) => path.endsWith("route.ts"));
  for (const path of routeFiles) {
    const source = read(path);
    assert.doesNotMatch(source, /\.(?:from|select|eq|neq|or|and|rpc|filter|ilike)\([^)]*`[^`]*\$\{[^}]+\}[^`]*`/s, `indikasi interpolasi request pada query di ${path}`);
  }
});
