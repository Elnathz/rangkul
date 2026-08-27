import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const migration = await readFile("supabase/seed.sql", "utf8");

test("demo seed includes the TDD role and trust matrix", () => {
  assert.match(migration, /koordinator_rt_2_id/);
  assert.match(migration, /koordinator_rt_3_id/);
  assert.match(migration, /koordinator_rw_id/);
  assert.match(migration, /'rt'/);
  assert.match(migration, /'rw'/);
  assert.match(migration, /'terpercaya'/);
  assert.match(migration, /'probation'/);
  assert.match(migration, /'under_review'/);
  assert.match(migration, /verified_by_admin_fallback/);
  assert.match(migration, /Laporan pertama untuk moderasi Helper/);
  assert.match(migration, /Laporan kedua untuk memicu under_review/);
  assert.match(migration, /ON CONFLICT \(user_id\) DO UPDATE/);
  assert.match(migration, /LOWER\(username\) = 'mbahburgas'/);
  assert.match(migration, /LOWER\(u\.username\) = 'masburgas'/);
  assert.match(migration, /Kelurahan Pleburan, Kecamatan Semarang Selatan/);
});

test("demo seed covers task statuses and declining snapshots", () => {
  for (const status of ["diajukan", "dikonfirmasi", "dikerjakan", "selesai", "dibatalkan"]) {
    assert.match(migration, new RegExp(`'${status}'`));
  }

  assert.match(migration, /Riwayat kunjungan 1/);
  assert.match(migration, /Riwayat kunjungan 4/);
  assert.match(migration, /energi, mobilitas, mood, nafsu_makan, kualitas_tidur/);
  assert.match(migration, /history\.score/);
  assert.match(migration, /Mbah Demo Satu masih bersemangat berkebun/);
  assert.match(migration, /Mbah Demo Satu perlu perhatian keluarga/);
  assert.match(migration, /ringan_category_id/);
  assert.match(migration, /sedang_category_id/);
  assert.match(migration, /berat_category_id/);
  assert.match(migration, /'tingkat' = 'ringan'|tingkat = 'ringan'/);
  assert.match(migration, /'tingkat' = 'sedang'|tingkat = 'sedang'/);
  assert.match(migration, /'tingkat' = 'berat'|tingkat = 'berat'/);
});

test("demo seed resolves the main Helper profile by username before using it", () => {
  assert.match(migration, /existing_helper_id UUID;/);
  assert.match(migration, /SELECT hp\.id INTO existing_helper_id[\s\S]*LOWER\(u\.username\) = 'masburgas'/);
  assert.match(migration, /IF existing_helper_id IS NULL THEN[\s\S]*existing_helper_id := helper_1_id;/);
});

test("demo seed membuat akun Auth dengan UUID dari database", () => {
  const authSeed = migration.slice(
    migration.indexOf("INSERT INTO auth.users"),
    migration.indexOf("INSERT INTO public.koordinator_profiles"),
  );
  assert.match(authSeed, /gen_random_uuid\(\)/);
  assert.doesNotMatch(authSeed, /keluarga_2_id\s*,\s*'00000000-0000-0000-0000-000000000000'/);
  assert.doesNotMatch(
    migration,
    /VALUES\s*\(\s*'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/i,
  );
});

test("demo seed menyamakan password akun Auth existing", () => {
  assert.match(migration, /demo_password_hash TEXT := '\$2b\$10\$/);
  assert.match(migration, /UPDATE auth\.users[\s\S]*encrypted_password = demo_password_hash/);
  assert.match(migration, /email_confirmed_at = COALESCE\(email_confirmed_at, NOW\(\)\)/);
});
