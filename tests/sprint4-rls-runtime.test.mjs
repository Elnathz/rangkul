import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import test from "node:test";

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
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const credentialsAvailable = Boolean(url && anonKey);
const serviceRoleAvailable = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
const password = "Rangkul2026*";

async function signIn(email) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  assert.equal(error, null, error?.message);
  return { client, userId: data.user.id };
}

test(
  "Family A tidak dapat membaca row user Family B",
  { skip: !integrationEnabled || !credentialsAvailable },
  async () => {
    const [familyA, familyB] = await Promise.all([
      signIn("demokeluarga@rangkul.id"),
      signIn("demokeluarga2@rangkul.id"),
    ]);

    const { data: leakedUsers, error: leakedUsersError } = await familyA.client
      .from("users")
      .select("id, email, phone, alamat_detail")
      .eq("id", familyB.userId);
    assert.equal(leakedUsersError, null, leakedUsersError?.message);
    assert.deepEqual(leakedUsers, []);
  },
);

test(
  "Family A tidak dapat membaca lansia, task, evidence, snapshot, atau payment keluarga lain",
  { skip: !integrationEnabled || !credentialsAvailable || !serviceRoleAvailable },
  async () => {
    const [{ client: familyA }, service] = await Promise.all([
      signIn("demokeluarga@rangkul.id"),
      Promise.resolve(createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })),
    ]);

    const { data: otherFamily, error: otherFamilyError } = await service
      .from("users")
      .select("id")
      .eq("email", "demokeluarga4@rangkul.id")
      .single();
    assert.equal(otherFamilyError, null, otherFamilyError?.message);

    const { data: otherLansia, error: otherLansiaError } = await service
      .from("lansia_profiles")
      .select("id")
      .eq("keluarga_id", otherFamily.id)
      .single();
    assert.equal(otherLansiaError, null, otherLansiaError?.message);

    const { data: otherTask, error: otherTaskError } = await service
      .from("tasks")
      .select("id")
      .eq("keluarga_id", otherFamily.id)
      .eq("status", "selesai")
      .single();
    assert.equal(otherTaskError, null, otherTaskError?.message);

    const resources = [
      ["lansia_profiles", "id", otherLansia.id],
      ["tasks", "id", otherTask.id],
      ["task_evidence", "task_id", otherTask.id],
      ["health_snapshots", "task_id", otherTask.id],
      ["payments", "task_id", otherTask.id],
    ];

    for (const [table, column, value] of resources) {
      const { data, error } = await familyA.from(table).select("*").eq(column, value);
      assert.equal(error, null, `${table}: ${error?.message}`);
      assert.deepEqual(data, [], `${table} keluarga lain tidak boleh terbaca`);
    }
  },
);

test(
  "Helper hanya membaca lansia setelah menjadi participant task",
  { skip: !integrationEnabled || !credentialsAvailable || !serviceRoleAvailable },
  async () => {
    const [{ client: helper, userId: helperUserId }, service] = await Promise.all([
      signIn("demohelper2@rangkul.id"),
      Promise.resolve(createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })),
    ]);

    const { data: helperProfile, error: helperProfileError } = await service
      .from("helper_profiles")
      .select("id")
      .eq("user_id", helperUserId)
      .single();
    assert.equal(helperProfileError, null, helperProfileError?.message);

    const [lansiaResult, priorAssignmentsResult] = await Promise.all([
      service.from("lansia_profiles").select("id").is("deleted_at", null).limit(50),
      service.from("tasks").select("lansia_id").eq("helper_id", helperProfile.id),
    ]);
    assert.equal(lansiaResult.error, null, lansiaResult.error?.message);
    assert.equal(priorAssignmentsResult.error, null, priorAssignmentsResult.error?.message);

    const assignedLansiaIds = new Set(priorAssignmentsResult.data?.map((task) => task.lansia_id));
    const unrelatedLansiaFixture = lansiaResult.data?.find((lansia) => !assignedLansiaIds.has(lansia.id));
    const assignedLansiaId = priorAssignmentsResult.data?.find((task) => task.lansia_id)?.lansia_id;
    assert.ok(unrelatedLansiaFixture, "fixture membutuhkan lansia yang belum pernah ditangani Helper");
    assert.ok(assignedLansiaId, "fixture membutuhkan lansia yang pernah ditangani Helper");

    const [{ data: unrelatedLansia, error: unrelatedError }, { data: assignedLansia, error: assignedLansiaError }] = await Promise.all([
      helper.from("lansia_profiles").select("id, alamat, catatan_kondisi").eq("id", unrelatedLansiaFixture.id),
      helper.from("lansia_profiles").select("id, alamat, catatan_kondisi").eq("id", assignedLansiaId),
    ]);
    assert.equal(unrelatedError, null, unrelatedError?.message);
    assert.deepEqual(unrelatedLansia, []);
    assert.equal(assignedLansiaError, null, assignedLansiaError?.message);
    assert.equal(assignedLansia?.length, 1);
  },
);

test(
  "Koordinator RT dibatasi wilayah dan Koordinator RW dapat membaca scope RW",
  { skip: !integrationEnabled || !credentialsAvailable || !serviceRoleAvailable },
  async () => {
    const [{ client: coordinatorRt }, { client: coordinatorRw }, service] = await Promise.all([
      signIn("demokoordinator2@rangkul.id"),
      signIn("demokoordinator4@rangkul.id"),
      Promise.resolve(createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })),
    ]);

    const [{ data: rtThreeHelperUser, error: helperUserError }, { data: reportedHelperUser, error: reportedHelperError }] = await Promise.all([
      service
      .from("users")
      .select("id")
      .eq("email", "demohelper3@rangkul.id")
      .single(),
      service
        .from("users")
        .select("id")
        .eq("email", "demohelper8@rangkul.id")
        .single(),
    ]);
    assert.equal(helperUserError, null, helperUserError?.message);
    assert.equal(reportedHelperError, null, reportedHelperError?.message);

    const { data: rtThreeHelperProfile, error: helperProfileError } = await service
      .from("helper_profiles")
      .select("id")
      .eq("user_id", rtThreeHelperUser.id)
      .single();
    assert.equal(helperProfileError, null, helperProfileError?.message);

    const { data: scopedTask, error: scopedTaskError } = await service
      .from("tasks")
      .select("id")
      .eq("helper_id", rtThreeHelperProfile.id)
      .limit(1)
      .single();
    assert.equal(scopedTaskError, null, scopedTaskError?.message);

    const { data: scopedReport, error: scopedReportError } = await service
      .from("reports")
      .select("id")
      .eq("reported_helper_id", reportedHelperUser.id)
      .limit(1)
      .single();
    assert.equal(scopedReportError, null, scopedReportError?.message);

    const [rtUserResult, rwUserResult, rtTaskResult, rwTaskResult, rtReportResult, rwReportResult] = await Promise.all([
      coordinatorRt.from("users").select("id, email, phone").eq("id", rtThreeHelperUser.id),
      coordinatorRw.from("users").select("id, email, phone").eq("id", rtThreeHelperUser.id),
      coordinatorRt.from("tasks").select("id").eq("id", scopedTask.id),
      coordinatorRw.from("tasks").select("id").eq("id", scopedTask.id),
      coordinatorRt.from("reports").select("id").eq("id", scopedReport.id),
      coordinatorRw.from("reports").select("id").eq("id", scopedReport.id),
    ]);
    assert.equal(rtUserResult.error, null, rtUserResult.error?.message);
    assert.deepEqual(rtUserResult.data, []);
    assert.equal(rwUserResult.error, null, rwUserResult.error?.message);
    assert.equal(rwUserResult.data?.length, 1);
    assert.equal(rtTaskResult.error, null, rtTaskResult.error?.message);
    assert.deepEqual(rtTaskResult.data, []);
    assert.equal(rwTaskResult.error, null, rwTaskResult.error?.message);
    assert.equal(rwTaskResult.data?.length, 1);
    assert.equal(rtReportResult.error, null, rtReportResult.error?.message);
    assert.deepEqual(rtReportResult.data, []);
    assert.equal(rwReportResult.error, null, rwReportResult.error?.message);
    assert.equal(rwReportResult.data?.length, 1);
  },
);

test(
  "Helper assigned hanya membaca task, evidence, dan payment miliknya",
  { skip: !integrationEnabled || !credentialsAvailable || !serviceRoleAvailable },
  async () => {
    const [{ client: helper, userId: helperUserId }, service] = await Promise.all([
      signIn("demohelper4@rangkul.id"),
      Promise.resolve(createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })),
    ]);

    const { data: helperProfile, error: helperProfileError } = await service
      .from("helper_profiles")
      .select("id")
      .eq("user_id", helperUserId)
      .single();
    assert.equal(helperProfileError, null, helperProfileError?.message);

    const { data: assignedTasks, error: assignedTasksError } = await service
      .from("tasks")
      .select("id")
      .eq("helper_id", helperProfile.id);
    assert.equal(assignedTasksError, null, assignedTasksError?.message);
    assert.ok(assignedTasks?.length, "fixture membutuhkan task assigned");
    const assignedTaskIds = assignedTasks.map((task) => task.id);

    const [{ data: ownEvidence, error: ownEvidenceError }, { data: ownPayments, error: ownPaymentsError }] = await Promise.all([
      service.from("task_evidence").select("id, task_id").in("task_id", assignedTaskIds).limit(1),
      service.from("payments").select("id, task_id").in("task_id", assignedTaskIds).limit(1),
    ]);
    assert.equal(ownEvidenceError, null, ownEvidenceError?.message);
    assert.equal(ownPaymentsError, null, ownPaymentsError?.message);
    assert.ok(ownEvidence?.length, "fixture membutuhkan evidence task assigned");
    assert.ok(ownPayments?.length, "fixture membutuhkan payment task assigned");

    const { data: otherPayment, error: otherPaymentError } = await service
      .from("payments")
      .select("id, task_id")
      .not("task_id", "in", `(${assignedTaskIds.join(",")})`)
      .limit(1)
      .single();
    assert.equal(otherPaymentError, null, otherPaymentError?.message);

    const [ownTaskResult, ownEvidenceResult, ownPaymentResult, otherTaskResult, otherPaymentResult] = await Promise.all([
      helper.from("tasks").select("id").eq("id", ownEvidence[0].task_id),
      helper.from("task_evidence").select("id").eq("id", ownEvidence[0].id),
      helper.from("payments").select("id").eq("id", ownPayments[0].id),
      helper.from("tasks").select("id").eq("id", otherPayment.task_id),
      helper.from("payments").select("id").eq("id", otherPayment.id),
    ]);

    for (const result of [ownTaskResult, ownEvidenceResult, ownPaymentResult]) {
      assert.equal(result.error, null, result.error?.message);
      assert.equal(result.data?.length, 1);
    }
    for (const result of [otherTaskResult, otherPaymentResult]) {
      assert.equal(result.error, null, result.error?.message);
      assert.deepEqual(result.data, []);
    }
  },
);

test(
  "audit log hanya dapat dibaca Admin",
  { skip: !integrationEnabled || !credentialsAvailable },
  async () => {
    const [{ client: family }, { client: helper }, { client: coordinator }, { client: admin }] = await Promise.all([
      signIn("demokeluarga@rangkul.id"),
      signIn("demohelper2@rangkul.id"),
      signIn("demokoordinator2@rangkul.id"),
      signIn("demoadmin@rangkul.id"),
    ]);

    for (const client of [family, helper, coordinator]) {
      const { data, error } = await client.from("audit_logs").select("id").limit(1);
      assert.equal(error, null, error?.message);
      assert.deepEqual(data, []);
    }

    const { data: adminRows, error: adminError } = await admin.from("audit_logs").select("id").limit(1);
    assert.equal(adminError, null, adminError?.message);
    assert.ok(adminRows);
  },
);
