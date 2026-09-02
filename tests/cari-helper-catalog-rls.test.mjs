import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("migration katalog memperbaiki RLS helper_profiles verified untuk role authenticated", async () => {
  const migration = await read("supabase/migrations/20260831165000_cari_helper_public_catalog_rls.sql");
  assert.match(migration, /DROP POLICY IF EXISTS "Verified helper profiles readable"/);
  assert.match(migration, /CREATE POLICY "Verified helper profiles readable"[\s\S]*FOR SELECT TO authenticated/);
  assert.match(migration, /status = 'verified' OR auth\.uid\(\) = user_id/);
});

test("migration katalog menambah policy sempit profil publik Helper pada users", async () => {
  const migration = await read("supabase/migrations/20260831165000_cari_helper_public_catalog_rls.sql");
  assert.match(migration, /CREATE POLICY "Authenticated can read public helper user profiles"[\s\S]*FOR SELECT TO authenticated/);
  assert.match(migration, /FROM public\.helper_profiles hp[\s\S]*WHERE hp\.user_id = public\.users\.id[\s\S]*AND hp\.status = 'verified'/);
  assert.doesNotMatch(migration, /USING \(true\)/);
});

test("/api/helpers tetap memakai sesi RLS (createClient) dan proyeksi field publik", async () => {
  const route = await read("src/app/api/helpers/route.ts");
  assert.match(route, /createClient\(\)/);
  assert.match(route, /\.select\(/);
  assert.match(route, /users!inner/);
  assert.doesNotMatch(route, /createAdminClient/);
});
