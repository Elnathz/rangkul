import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import test from "node:test";

const migrationPath = "supabase/migrations/20260828140000_trust_safety_decisions.sql";

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
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const integrationCredentialsAvailable = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && anonKey);

test("review laporan mengunci state, scope wilayah, alasan, Helper, dan audit dalam satu RPC", async () => {
  const sql = await readFile(migrationPath, "utf8");

  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.review_report/);
  assert.match(sql, /FOR UPDATE/);
  assert.match(sql, /status NOT IN \('menunggu', 'ditindak'\)/);
  assert.match(sql, /Reviewer tidak memiliki scope/);
  assert.match(sql, /decision_reason/);
  assert.match(sql, /'review_report'/);
  assert.match(sql, /'restore_helper'/);
  assert.match(sql, /'suspend_helper'/);
});

test("fallback Admin menolak assignment saat Koordinator RT atau RW verified tersedia", async () => {
  const sql = await readFile(migrationPath, "utf8");

  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.assign_admin_fallback/);
  assert.match(sql, /kp\.tingkat = 'rt'/);
  assert.match(sql, /kp\.tingkat = 'rw'/);
  assert.match(sql, /kp\.status = 'verified'/);
  assert.match(sql, /Koordinator RT atau RW aktif tersedia/);
  assert.match(sql, /'assign_admin_fallback'/);
});

test("appeal pending unik dan review appeal atomik", async () => {
  const sql = `${await readFile(migrationPath, "utf8")}\n${await readFile("supabase/migrations/20260828141000_trust_safety_user_status_guard.sql", "utf8")}\n${await readFile("supabase/migrations/20260828142000_trust_safety_appeal_parameter.sql", "utf8")}`;

  assert.match(sql, /CREATE UNIQUE INDEX[^;]+ON public\.appeals \(user_id\)[^;]+WHERE status = 'menunggu'/s);
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.admin_review_appeal/);
  assert.match(sql, /status = 'menunggu'/);
  assert.match(sql, /FOR UPDATE/);
  assert.match(sql, /review_reason/);
  assert.match(sql, /'resolve_appeal'/);
  assert.match(sql, /set_config\('rangkul\.allow_sensitive_user_update', 'on', TRUE\)/);
  assert.match(sql, /review_reason = BTRIM\(admin_review_appeal\.review_reason\)/);
});

test("route sensitif memakai RPC canonical dan memetakan conflict tanpa raw database error", async () => {
  const [reportRoute, fallbackRoute, appealRoute, genericRoute, suspendRoute, legacyStatusRoute, legacyApprovalRoute, familyAppealRoute] = await Promise.all([
    readFile("src/app/api/reports/[id]/route.ts", "utf8"),
    readFile("src/app/api/admin/helpers/[id]/assign-fallback/route.ts", "utf8"),
    readFile("src/app/api/admin/appeals/[id]/route.ts", "utf8"),
    readFile("src/app/api/admin/helpers/[id]/route.ts", "utf8"),
    readFile("src/app/api/admin/helpers/[id]/suspend/route.ts", "utf8"),
    readFile("src/app/api/helpers/[id]/status/route.ts", "utf8"),
    readFile("src/app/api/helper/[id]/approve/route.ts", "utf8"),
    readFile("src/app/api/appeals/route.ts", "utf8"),
  ]);

  assert.match(reportRoute, /rpc\("review_report"/);
  assert.match(reportRoute, /conflict/);
  assert.doesNotMatch(reportRoute, /error\.message/);
  assert.match(fallbackRoute, /rpc\("assign_admin_fallback"/);
  assert.match(appealRoute, /rpc\("admin_review_appeal"/);
  assert.doesNotMatch(genericRoute, /updates\.status|assign_fallback/);
  assert.doesNotMatch(genericRoute, /verified_by_admin_fallback/);
  assert.match(suspendRoute, /rpc\("admin_decide_helper_status"/);
  assert.doesNotMatch(suspendRoute, /verified_by_admin_fallback\s*:/);
  assert.doesNotMatch(suspendRoute, /writeAuditLog/);
  assert.match(legacyStatusRoute, /admin\/helpers\/\[id\]\/suspend/);
  assert.doesNotMatch(legacyStatusRoute, /createAdminClient|helper_profiles['"]\)\.update/);
  assert.match(legacyApprovalRoute, /rpc\(['"]assign_admin_fallback['"]/);
  assert.doesNotMatch(legacyApprovalRoute, /isAdminFallback\s*=\s*true/);
  assert.match(familyAppealRoute, /account_status\s*!==\s*["']restricted["']/);
  assert.doesNotMatch(familyAppealRoute, /account_status\s*!==\s*["']suspended["']/);
});

test("runtime cloud: wrong region, fallback aktif, alasan wajib, dan review appeal concurrent ditolak", { skip: !integrationEnabled || !integrationCredentialsAvailable }, async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const admin = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const wrongCoordinator = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const password = "Rangkul2026*";
  const [{ error: adminAuthError }, { error: coordinatorAuthError }] = await Promise.all([
    admin.auth.signInWithPassword({ email: "demoadmin@rangkul.id", password }),
    wrongCoordinator.auth.signInWithPassword({ email: "demokoordinator2@rangkul.id", password }),
  ]);
  assert.equal(adminAuthError, null, adminAuthError?.message);
  assert.equal(coordinatorAuthError, null, coordinatorAuthError?.message);

  const [{ data: helperUser }, { data: reporter }, { data: fallbackUser }] = await Promise.all([
    service.from("users").select("id").eq("email", "demohelper3@rangkul.id").single(),
    service.from("users").select("id").eq("email", "demokeluarga@rangkul.id").single(),
    service.from("users").select("id").eq("email", "demohelper6@rangkul.id").single(),
  ]);
  const { data: reportedHelper } = await service.from("helper_profiles").select("id, status, tingkat_kepercayaan, tugas_selesai_berturut").eq("user_id", helperUser.id).single();
  const reportedHelperBackup = { status: reportedHelper.status, tingkat_kepercayaan: reportedHelper.tingkat_kepercayaan, tugas_selesai_berturut: reportedHelper.tugas_selesai_berturut };
  const { data: fallbackHelper } = await service.from("helper_profiles").select("id, status, verified_by_admin_fallback, koordinator_id, tingkat_kepercayaan, tugas_selesai_berturut").eq("user_id", fallbackUser.id).single();
  const fallbackBackup = { status: fallbackHelper.status, verified_by_admin_fallback: fallbackHelper.verified_by_admin_fallback, koordinator_id: fallbackHelper.koordinator_id, tingkat_kepercayaan: fallbackHelper.tingkat_kepercayaan, tugas_selesai_berturut: fallbackHelper.tugas_selesai_berturut };
  let reportId;
  let appealId;
  let tempUserId;

  try {
    const { data: report, error: reportInsertError } = await service.from("reports").insert({ reported_helper_id: helperUser.id, reporter_id: reporter.id, alasan: "[RUNTIME_SAFETY] laporan lintas wilayah" }).select("id").single();
    assert.equal(reportInsertError, null, reportInsertError?.message);
    reportId = report.id;
    const { error: wrongRegionError } = await wrongCoordinator.rpc("review_report", { p_report_id: report.id, p_status: "ditindak", p_decision_reason: "Meninjau laporan dari wilayah yang tidak sesuai" });
    assert.equal(wrongRegionError?.code, "42501");

    await service.from("helper_profiles").update({ status: "pending_verification", verified_by_admin_fallback: false }).eq("id", fallbackHelper.id);
    const { error: fallbackError } = await admin.rpc("assign_admin_fallback", { p_helper_id: fallbackHelper.id, p_reason: "Pengujian fallback dengan Koordinator aktif" });
    assert.equal(fallbackError?.code, "P0001");
    const { error: missingReasonError } = await admin.rpc("admin_decide_helper_status", { p_helper_id: fallbackHelper.id, p_status: "suspended", p_reason: "" });
    assert.equal(missingReasonError?.code, "22023");

    const tempEmail = `runtime-appeal-${randomUUID()}@rangkul.invalid`;
    const { data: authData, error: authCreateError } = await service.auth.admin.createUser({ email: tempEmail, password, email_confirm: true, user_metadata: { role: "keluarga", full_name: "Runtime Appeal" } });
    assert.equal(authCreateError, null, authCreateError?.message);
    tempUserId = authData.user.id;
    const { error: profileError } = await service.from("users").upsert({ id: tempUserId, email: tempEmail, username: `runtime_${tempUserId.slice(0, 8)}`, full_name: "Runtime Appeal", role: "keluarga" });
    assert.equal(profileError, null, profileError?.message);
    const { data: appeal, error: appealInsertError } = await service.from("appeals").insert({ user_id: tempUserId, alasan: "[RUNTIME_SAFETY] banding concurrent" }).select("id").single();
    assert.equal(appealInsertError, null, appealInsertError?.message);
    appealId = appeal.id;

    const decisions = await Promise.all([
      admin.rpc("admin_review_appeal", { appeal_id: appeal.id, next_status: "disetujui", review_reason: "Bukti pemulihan akun dinilai cukup lengkap" }),
      admin.rpc("admin_review_appeal", { appeal_id: appeal.id, next_status: "ditolak", review_reason: "Bukti pemulihan akun belum dinilai memadai" }),
    ]);
    assert.equal(decisions.filter(({ error }) => error === null).length, 1);
    assert.equal(decisions.filter(({ error }) => error?.code === "P0001").length, 1);

    const duplicateAppeals = await Promise.all([
      service.from("appeals").insert({ user_id: tempUserId, alasan: "[RUNTIME_SAFETY] pending satu" }),
      service.from("appeals").insert({ user_id: tempUserId, alasan: "[RUNTIME_SAFETY] pending dua" }),
    ]);
    assert.equal(duplicateAppeals.filter(({ error }) => error === null).length, 1);
    assert.equal(duplicateAppeals.filter(({ error }) => error?.code === "23505").length, 1);
  } finally {
    if (reportId) await service.from("reports").delete().eq("id", reportId);
    await service.from("helper_profiles").update(reportedHelperBackup).eq("id", reportedHelper.id);
    await service.from("helper_profiles").update(fallbackBackup).eq("id", fallbackHelper.id);
    if (tempUserId) {
      await service.from("audit_logs").delete().eq("entity_id", appealId);
      await service.auth.admin.deleteUser(tempUserId);
    }
  }
});
