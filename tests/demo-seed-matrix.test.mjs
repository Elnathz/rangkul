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
  assert.match(migration, /LOWER\(username\) = 'wagimankoordinator'/);
  assert.match(migration, /LOWER\(u\.username\) = 'andihelper'/);
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
  assert.match(migration, /SELECT hp\.id INTO existing_helper_id[\s\S]*LOWER\(u\.username\) = 'andihelper'/);
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

test("fixture utama Keluarga adalah Ratna dengan lansia Giorno", () => {
  assert.match(migration, /'ratnakeluarga@rangkul\.id'[\s\S]*?'ratnakeluarga'/);
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

test("fixture persetujuan Keluarga selalu memiliki layanan tambahan pending", () => {
  assert.match(
    migration,
    /DELETE FROM public\.task_extra_services[\s\S]+\[DEMO_MATRIX\] Task menunggu Keluarga/,
  );
  assert.match(
    migration,
    /INSERT INTO public\.task_extra_services[\s\S]+menunggu_persetujuan_keluarga[\s\S]+\[DEMO_MATRIX\] Task menunggu Keluarga/,
  );
  assert.match(migration, /Task menunggu Keluarga'[\s\S]+harga_final = harga_dasar/);
});

test("blok deklarasi seed tidak mendeklarasikan variabel dua kali", () => {
  const declarationBlock = migration.match(/DO \$\$\r?\nDECLARE([\s\S]*?)\r?\nBEGIN\r?\n\s+FOR user_data/)?.[1] ?? "";
  assert.notEqual(declarationBlock, "");
  assert.equal(declarationBlock.match(/^\s*lansia_5_id UUID;$/gm)?.length, 1);
  assert.equal(declarationBlock.match(/^\s*category_id UUID;$/gm)?.length, 1);
});

test("pemulihan task marketplace tidak menetapkan kolom yang sama dua kali", () => {
  const statement = migration
    .split(";")
    .find((candidate) => candidate.includes("UPDATE public.tasks")
      && candidate.includes("WHERE catatan = '[DEMO_MATRIX] Task diajukan marketplace'"));
  assert.ok(statement, "UPDATE marker task marketplace wajib tersedia");
  const setClause = statement.slice(statement.indexOf("SET") + 3, statement.indexOf("WHERE catatan"));

  const assignedColumns = [...setClause.matchAll(/^\s*([a-z_]+)\s*=/gm)].map((match) => match[1]);
  assert.deepEqual(assignedColumns, [...new Set(assignedColumns)]);
});

test("fixture payment normal membagi 90 persen Helper, 7 persen Platform, dan 3 persen Koordinator", () => {
  const expectations = [
    {
      marker: "[DEMO_MATRIX] Task dikerjakan",
      total: 50000,
      helper: 45000,
      platform: 3500,
      koordinator: 1500,
    },
    {
      marker: "[DEMO_MATRIX] Task selesai",
      total: 70000,
      helper: 63000,
      platform: 4900,
      koordinator: 2100,
    },
  ];

  for (const expected of expectations) {
    const statement = migration
      .split(";")
      .find((candidate) => candidate.includes("UPDATE public.payments payment")
        && candidate.includes(`task.catatan = '${expected.marker}'`));
    assert.ok(statement, `fixture payment ${expected.marker} wajib tersedia`);
    const setClause = statement.slice(statement.indexOf("SET") + 3, statement.indexOf("FROM public.tasks"));

    const amount = (column) => Number(setClause.match(new RegExp(`^\\s*${column}\\s*=\\s*(\\d+)`, "m"))?.[1]);
    assert.equal(amount("jumlah_total"), expected.total);
    assert.equal(amount("helper_share"), expected.helper);
    assert.equal(amount("platform_fee"), expected.platform);
    assert.equal(amount("koordinator_share"), expected.koordinator);
  }
});
