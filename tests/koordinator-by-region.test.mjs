import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("endpoint GET /api/koordinator/by-region terdefinisi dan aman", () => {
  const file = readFileSync("src/app/api/koordinator/by-region/route.ts", "utf8");

  assert.match(file, /export async function GET/);
  assert.match(file, /auth\.getUser\(\)/);
  assert.match(file, /createAdminClient/);
  assert.match(file, /eq\("status", "verified"\)/);
  assert.match(file, /users!koordinator_profiles_user_id_fkey!inner\(full_name\)/);
  assert.doesNotMatch(file, /phone/); // Melindungi data pribadi nomor telepon
});

test("halaman helper verifikasi memanggil API by-region dan tidak query koordinator_profiles langsung", () => {
  const page = readFileSync("src/app/(helper)/helper/verifikasi/page.tsx", "utf8");

  assert.match(page, /\/api\/koordinator\/by-region/);
  assert.doesNotMatch(page, /supabase[\s\S]*?\.from\('koordinator_profiles'\)/);
});
