import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import test from "node:test";

const migrationPath = "supabase/migrations/20260828120000_helper_trust_tier_automation.sql";

async function loadLocalEnv() {
  const content = await readFile(".env.local", "utf8").catch(() => "");
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
}

await loadLocalEnv();
const integrationEnabled = process.env.RUN_SUPABASE_INTEGRATION === "1";
const serviceCredentialsAvailable = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

test("task completion memutasi counter dan trust tier tepat sekali di database", async () => {
  const sql = await readFile(migrationPath, "utf8");

  assert.match(sql, /OLD\.status IS DISTINCT FROM 'selesai'/);
  assert.match(sql, /NEW\.status = 'selesai'/);
  assert.match(sql, /FOR UPDATE/);
  assert.match(sql, /tugas_selesai_berturut\s*=\s*LEAST\(/);
  assert.match(sql, /total_tugas_selesai\s*=\s*total_tugas_selesai\s*\+\s*1/);
  assert.match(sql, /tingkat_kepercayaan\s*=\s*CASE[\s\S]+>= 5[\s\S]+THEN 'terpercaya'/);
  assert.match(sql, /AFTER UPDATE OF status ON public\.tasks/);
});

test("laporan formal memutus rangkaian bersih dalam transaksi trigger", async () => {
  const sql = await readFile(migrationPath, "utf8");

  assert.match(sql, /tugas_selesai_berturut\s*=\s*0/);
  assert.match(sql, /tingkat_kepercayaan\s*=\s*'probation'/);
  assert.match(sql, /active_report_count\s*>=\s*2/);
  assert.match(sql, /active_report_count\s*>=\s*2\s+THEN 'under_review'/);
  assert.match(sql, /pg_advisory_xact_lock/);
});

test("fungsi trigger trust tier memiliki privilege minimum", async () => {
  const sql = await readFile(migrationPath, "utf8");

  assert.match(sql, /SECURITY DEFINER SET search_path = public/);
  assert.match(sql, /REVOKE ALL ON FUNCTION public\.handle_task_completion_trust_tier\(\) FROM PUBLIC/);
  assert.match(sql, /REVOKE ALL ON FUNCTION public\.handle_report_accumulation\(\) FROM PUBLIC/);
});

test("seed menyediakan skenario promosi dari counter empat", async () => {
  const seed = await readFile("supabase/seed.sql", "utf8");

  assert.match(seed, /\[DEMO_TRUST_PROMOTION\][^\n]+,\s*4,\s*4\)/);
});

test("katalog dan booking menegakkan batas jadwal Helper probation di server", async () => {
  const [catalogRoute, bookingRoute] = await Promise.all([
    readFile("src/app/api/helpers/route.ts", "utf8"),
    readFile("src/app/api/booking/task/route.ts", "utf8"),
  ]);

  assert.match(catalogRoute, /searchParams\.get\('jadwal_waktu'\)/);
  assert.match(catalogRoute, /isUrgentProbationBooking\(helper\.tingkat_kepercayaan, jadwalWaktu\)/);
  assert.match(bookingRoute, /isUrgentProbationBooking\(helperData\.tingkat_kepercayaan, jadwal_waktu\)/);
  assert.match(bookingRoute, /probation_helper_urgent_booking/);
});

test("runtime cloud: completion concurrent, duplicate update, dan laporan mengubah trust tier atomik", { skip: !integrationEnabled || !serviceCredentialsAvailable }, async () => {
  const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const createdTaskIds = [];
  const createdReportIds = [];

  const { data: helperUser, error: helperUserError } = await service.from("users").select("id").eq("email", "arifhelper@rangkul.id").single();
  assert.equal(helperUserError, null, helperUserError?.message);
  const { data: helper, error: helperError } = await service.from("helper_profiles").select("id, status, tingkat_kepercayaan, tugas_selesai_berturut, total_tugas_selesai").eq("user_id", helperUser.id).single();
  assert.equal(helperError, null, helperError?.message);
  const backup = { status: helper.status, tingkat_kepercayaan: helper.tingkat_kepercayaan, tugas_selesai_berturut: helper.tugas_selesai_berturut, total_tugas_selesai: helper.total_tugas_selesai };

  try {
    const { data: family, error: familyError } = await service.from("users").select("id").eq("email", "ratnakeluarga@rangkul.id").single();
    assert.equal(familyError, null, familyError?.message);
    const [{ data: lansia, error: lansiaError }, { data: category, error: categoryError }] = await Promise.all([
      service.from("lansia_profiles").select("id").eq("keluarga_id", family.id).limit(1).single(),
      service.from("service_categories").select("id, harga_dasar").eq("is_active", true).limit(1).single(),
    ]);
    assert.equal(lansiaError, null, lansiaError?.message);
    assert.equal(categoryError, null, categoryError?.message);

    async function createTask(marker) {
      const { data, error } = await service.from("tasks").insert({ keluarga_id: family.id, lansia_id: lansia.id, helper_id: helper.id, service_category_id: category.id, jadwal_waktu: new Date(Date.now() + 86_400_000).toISOString(), catatan: marker, status: "dikerjakan", harga_dasar: category.harga_dasar, harga_final: category.harga_dasar }).select("id").single();
      assert.equal(error, null, error?.message);
      createdTaskIds.push(data.id);
      return data.id;
    }

    await service.from("helper_profiles").update({ status: "verified", tingkat_kepercayaan: "probation", tugas_selesai_berturut: 4, total_tugas_selesai: 4 }).eq("id", helper.id);
    const fifthTaskId = await createTask("[RUNTIME_TRUST] completion kelima");
    const { error: completionError } = await service.from("tasks").update({ status: "selesai" }).eq("id", fifthTaskId);
    assert.equal(completionError, null, completionError?.message);
    let { data: afterFifth } = await service.from("helper_profiles").select("tingkat_kepercayaan, tugas_selesai_berturut, total_tugas_selesai").eq("id", helper.id).single();
    assert.deepEqual(afterFifth, { tingkat_kepercayaan: "terpercaya", tugas_selesai_berturut: 5, total_tugas_selesai: 5 });
    await service.from("tasks").update({ status: "selesai" }).eq("id", fifthTaskId);
    ({ data: afterFifth } = await service.from("helper_profiles").select("tingkat_kepercayaan, tugas_selesai_berturut, total_tugas_selesai").eq("id", helper.id).single());
    assert.equal(afterFifth.total_tugas_selesai, 5);

    await service.from("helper_profiles").update({ status: "verified", tingkat_kepercayaan: "probation", tugas_selesai_berturut: 3, total_tugas_selesai: 3 }).eq("id", helper.id);
    const concurrentTaskIds = await Promise.all([createTask("[RUNTIME_TRUST] concurrent A"), createTask("[RUNTIME_TRUST] concurrent B")]);
    const completionResults = await Promise.all(concurrentTaskIds.map((id) => service.from("tasks").update({ status: "selesai" }).eq("id", id)));
    completionResults.forEach(({ error }) => assert.equal(error, null, error?.message));
    const { data: afterConcurrent } = await service.from("helper_profiles").select("tingkat_kepercayaan, tugas_selesai_berturut, total_tugas_selesai").eq("id", helper.id).single();
    assert.deepEqual(afterConcurrent, { tingkat_kepercayaan: "terpercaya", tugas_selesai_berturut: 5, total_tugas_selesai: 5 });

    const reportResults = await Promise.all([
      service.from("reports").insert({ reported_helper_id: helperUser.id, reporter_id: family.id, alasan: "[RUNTIME_TRUST] laporan formal pertama" }).select("id").single(),
      service.from("reports").insert({ reported_helper_id: helperUser.id, reporter_id: family.id, alasan: "[RUNTIME_TRUST] laporan formal kedua" }).select("id").single(),
    ]);
    reportResults.forEach(({ data, error }) => { assert.equal(error, null, error?.message); createdReportIds.push(data.id); });
    const { data: afterReports } = await service.from("helper_profiles").select("status, tingkat_kepercayaan, tugas_selesai_berturut").eq("id", helper.id).single();
    assert.deepEqual(afterReports, { status: "under_review", tingkat_kepercayaan: "probation", tugas_selesai_berturut: 0 });
  } finally {
    if (createdReportIds.length) await service.from("reports").delete().in("id", createdReportIds);
    if (createdTaskIds.length) await service.from("tasks").delete().in("id", createdTaskIds);
    await service.from("helper_profiles").update(backup).eq("id", helper.id);
  }
});
