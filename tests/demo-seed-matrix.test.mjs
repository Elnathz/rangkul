import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
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
  assert.match(migration, /Giorno masih bersemangat berkebun/);
  assert.match(migration, /Giorno perlu perhatian keluarga/);
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
  const hash = migration.match(/demo_password_hash TEXT := '([^']+)'/)?.[1];
  assert.ok(hash, "hash password demo wajib tersedia");
  assert.equal(bcrypt.compareSync("Rangkul2026*", hash), true);
  assert.match(migration, /UPDATE auth\.users[\s\S]*encrypted_password = demo_password_hash/);
  assert.match(migration, /email_confirmed_at = COALESCE\(email_confirmed_at, NOW\(\)\)/);
});

test("demo seed memakai akun Admin marker dan tidak mengambil Admin pertama", () => {
  assert.match(migration, /'demoadmin@rangkul\.id'[\s\S]*?'demoadmin'/);
  assert.match(migration, /LOWER\(username\) = 'demoadmin'/);
  assert.doesNotMatch(migration, /WHERE role = 'admin'\s+ORDER BY created_at\s+LIMIT 1/);
});

test("fixture utama Keluarga adalah mbakburgas dengan lansia Giorno", () => {
  assert.match(migration, /'demokeluarga@rangkul\.id'[\s\S]*?'mbakburgas'/);
  assert.match(migration, /'Giorno'/);
  assert.match(migration, /demo\/identitas_lansia\/identitas-lansia-demo\.png/);
  assert.match(migration, /demo\/hubungan_keluarga\/hubungan-keluarga-demo\.pdf/);
  assert.match(migration, /UPDATE public\.lansia_profiles lp[\s\S]*u\.id = lp\.keluarga_id/);
  assert.doesNotMatch(migration, /u\.id = lp\.user_id/);
});

test("fixture mencakup matriks approval dan object path evidence private", () => {
  assert.match(migration, /'menunggu_persetujuan_koordinator'/);
  assert.match(migration, /'menunggu_persetujuan_keluarga'/);
  assert.match(migration, /demo\/foto_bukti\/bukti-kunjungan-demo\.jpg/);
  assert.doesNotMatch(migration, /https:\/\/demo\.invalid/);
});

test("seed mengembalikan state marker yang dapat berubah selama demo", () => {
  assert.match(migration, /UPDATE public\.tasks[\s\S]+WHERE catatan = '\[DEMO_MATRIX\] Task diajukan marketplace'/);
  assert.match(migration, /UPDATE public\.tasks[\s\S]+WHERE catatan = '\[DEMO_MATRIX\] Task menunggu Koordinator'/);
  assert.match(migration, /UPDATE public\.reports\s+SET status = 'menunggu'[\s\S]+Laporan pertama untuk moderasi Helper/);
  assert.match(migration, /UPDATE public\.payments[\s\S]+task\.catatan = '\[DEMO_MATRIX\] Task dikerjakan'/);
  assert.match(migration, /DELETE FROM public\.emergency_alerts[\s\S]+task_id = v_task_id/);
});
