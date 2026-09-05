import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";

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
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const credentialsAvailable = Boolean(url && anonKey && serviceKey);
const password = "Rangkul2026*";

const marker = {
  applicantOpen: "[DEMO_SPRINT6] Task pelamar terbuka",
  quickActive: "[DEMO_SPRINT6] Task cepat aktif",
};

async function signIn(email) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  assert.equal(error, null, error?.message);
  return { client, userId: data.user.id };
}

async function fixtureTask(service, catatan) {
  const { data, error } = await service
    .from("tasks")
    .select("id, lansia_id")
    .eq("catatan", catatan)
    .single();
  assert.equal(error, null, error?.message);
  return data;
}

test(
  "runtime Sprint 6: marketplace tereduksi dan task application tetap role-scoped",
  { skip: !integrationEnabled || !credentialsAvailable },
  async () => {
    const service = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const [rini, ratna, applicantTask] = await Promise.all([
      signIn("rinihelper@rangkul.id"),
      signIn("ratnakeluarga@rangkul.id"),
      fixtureTask(service, marker.applicantOpen),
    ]);

    const [{ data: marketplace, error: marketplaceError }, { data: familyMarketplace, error: familyMarketplaceError }] = await Promise.all([
      rini.client.rpc("get_task_marketplace", { p_mode: "pelamar", p_limit: 20 }),
      ratna.client.rpc("get_task_marketplace", { p_mode: "pelamar", p_limit: 20 }),
    ]);
    assert.equal(marketplaceError, null, marketplaceError?.message);
    assert.equal(familyMarketplaceError, null, familyMarketplaceError?.message);
    assert.deepEqual(familyMarketplace, [], "Keluarga tidak boleh memakai RPC marketplace Helper");

    const projectedTask = marketplace.find((task) => task.task_id === applicantTask.id);
    assert.ok(projectedTask, "Helper eligible harus melihat task pelamar aktif");
    for (const forbiddenField of ["lansia_id", "nama", "alamat", "lat", "lng", "catatan_kondisi", "dokumen_url"]) {
      assert.equal(forbiddenField in projectedTask, false, `${forbiddenField} tidak boleh ada pada marketplace`);
    }

    const [{ data: directTaskRead, error: directTaskReadError }, { data: helperApplications, error: helperApplicationsError }, { data: familyApplications, error: familyApplicationsError }] = await Promise.all([
      rini.client.from("tasks").select("id, lansia_id, catatan").eq("id", applicantTask.id),
      rini.client.from("task_applications").select("helper_id, status").eq("task_id", applicantTask.id),
      ratna.client.from("task_applications").select("helper_id, status").eq("task_id", applicantTask.id),
    ]);
    assert.equal(directTaskReadError, null, directTaskReadError?.message);
    assert.deepEqual(directTaskRead, [], "Helper belum dipilih tidak boleh membaca task private langsung");
    assert.equal(helperApplicationsError, null, helperApplicationsError?.message);
    assert.equal(helperApplications?.length, 1, "Helper hanya boleh membaca application miliknya");
    assert.equal(familyApplicationsError, null, familyApplicationsError?.message);
    assert.equal(familyApplications?.length, 3, "Keluarga pemilik task dapat membandingkan semua pelamar");
  },
);

test(
  "runtime Sprint 6: dua Helper terpercaya berebut Cari Cepat dan hanya satu menang",
  { skip: !integrationEnabled || !credentialsAvailable },
  async () => {
    const service = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const [rini, dedi, quickTask] = await Promise.all([
      signIn("rinihelper@rangkul.id"),
      signIn("dedihelper@rangkul.id"),
      fixtureTask(service, marker.quickActive),
    ]);

    const [{ data: riniResult, error: riniError }, { data: dediResult, error: dediError }] = await Promise.all([
      rini.client.rpc("accept_quick_task", { p_task_id: quickTask.id }),
      dedi.client.rpc("accept_quick_task", { p_task_id: quickTask.id }),
    ]);
    assert.equal(riniError, null, riniError?.message);
    assert.equal(dediError, null, dediError?.message);

    const outcomes = [riniResult, dediResult];
    assert.equal(outcomes.filter((result) => result?.success === true).length, 1);
    assert.equal(outcomes.filter((result) => result?.success === false).length, 1);

    const { data: persisted, error: persistedError } = await service
      .from("tasks")
      .select("helper_id, status")
      .eq("id", quickTask.id)
      .single();
    assert.equal(persistedError, null, persistedError?.message);
    assert.equal(persisted.status, "dikonfirmasi");
    assert.ok(persisted.helper_id, "task harus memiliki tepat satu Helper pemenang");
  },
);

test(
  "runtime Sprint 6: Helper dapat menarik lalu mengajukan ulang lamarannya sendiri",
  { skip: !integrationEnabled || !credentialsAvailable },
  async () => {
    const service = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const [sari, applicantTask] = await Promise.all([
      signIn("sarihelper@rangkul.id"),
      fixtureTask(service, marker.applicantOpen),
    ]);

    const { data: withdrawal, error: withdrawalError } = await sari.client.rpc("withdraw_task_application", {
      p_task_id: applicantTask.id,
    });
    assert.equal(withdrawalError, null, withdrawalError?.message);
    assert.equal(withdrawal?.success, true, withdrawal?.message);

    const { data: reapplication, error: reapplicationError } = await sari.client.rpc("apply_to_task", {
      p_task_id: applicantTask.id,
    });
    assert.equal(reapplicationError, null, reapplicationError?.message);
    assert.equal(reapplication?.success, true, reapplication?.message);

    const { data: pendingApplication, error: pendingApplicationError } = await service
      .from("task_applications")
      .select("status")
      .eq("id", reapplication.application_id)
      .single();
    assert.equal(pendingApplicationError, null, pendingApplicationError?.message);
    assert.equal(pendingApplication.status, "pending");
  },
);

test(
  "runtime Sprint 6: Keluarga memilih satu pelamar dan server menolak seluruh pelamar lain",
  { skip: !integrationEnabled || !credentialsAvailable },
  async () => {
    const service = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const [ratna, applicantTask, sari] = await Promise.all([
      signIn("ratnakeluarga@rangkul.id"),
      fixtureTask(service, marker.applicantOpen),
      service.from("helper_profiles").select("id").eq("user_id", (await signIn("sarihelper@rangkul.id")).userId).single(),
    ]);
    assert.equal(sari.error, null, sari.error?.message);

    const { data: sariApplication, error: sariApplicationError } = await service
      .from("task_applications")
      .select("id")
      .eq("task_id", applicantTask.id)
      .eq("helper_id", sari.data.id)
      .single();
    assert.equal(sariApplicationError, null, sariApplicationError?.message);

    const { data: selection, error: selectionError } = await ratna.client.rpc("select_task_application", {
      p_task_id: applicantTask.id,
      p_application_id: sariApplication.id,
    });
    assert.equal(selectionError, null, selectionError?.message);
    assert.equal(selection?.success, true, selection?.message);
    assert.equal(selection?.status, "dikonfirmasi");

    const [{ data: taskAfterSelection, error: taskAfterSelectionError }, { data: applicationsAfterSelection, error: applicationsAfterSelectionError }] = await Promise.all([
      service.from("tasks").select("helper_id, status").eq("id", applicantTask.id).single(),
      service.from("task_applications").select("helper_id, status").eq("task_id", applicantTask.id),
    ]);
    assert.equal(taskAfterSelectionError, null, taskAfterSelectionError?.message);
    assert.equal(taskAfterSelection.status, "dikonfirmasi");
    assert.equal(taskAfterSelection.helper_id, sari.data.id);
    assert.equal(applicationsAfterSelectionError, null, applicationsAfterSelectionError?.message);
    assert.equal(applicationsAfterSelection.filter((application) => application.status === "selected").length, 1);
    assert.equal(applicationsAfterSelection.filter((application) => application.status === "rejected").length, 2);
  },
);

test(
  "runtime Sprint 6: expiry menutup task pelamar dan semua lamaran pending",
  { skip: !integrationEnabled || !credentialsAvailable },
  async () => {
    const service = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const [{ data: family, error: familyError }, { data: helper, error: helperError }, { data: category, error: categoryError }, { data: lansia, error: lansiaError }] = await Promise.all([
      service.from("users").select("id").eq("email", "ratnakeluarga@rangkul.id").single(),
      service.from("helper_profiles").select("id").eq("user_id", (await signIn("rinihelper@rangkul.id")).userId).single(),
      service.from("service_categories").select("id").eq("is_active", true).limit(1).single(),
      service.from("lansia_profiles").select("id").eq("keluarga_id", (await signIn("ratnakeluarga@rangkul.id")).userId).single(),
    ]);
    assert.equal(familyError, null, familyError?.message);
    assert.equal(helperError, null, helperError?.message);
    assert.equal(categoryError, null, categoryError?.message);
    assert.equal(lansiaError, null, lansiaError?.message);

    const { data: task, error: taskError } = await service
      .from("tasks")
      .insert({
        keluarga_id: family.id,
        lansia_id: lansia.id,
        service_category_id: category.id,
        jadwal_waktu: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        jadwal_waktu_asli: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        catatan: `[TEST_SPRINT6_EXPIRY] ${randomUUID()}`,
        mode_penugasan: "pelamar",
        status: "diajukan",
        harga_dasar: 30000,
        harga_final: 30000,
        expires_at: new Date(Date.now() - 60 * 1000).toISOString(),
      })
      .select("id")
      .single();
    assert.equal(taskError, null, taskError?.message);

    try {
      const { error: applicationError } = await service
        .from("task_applications")
        .insert({ task_id: task.id, helper_id: helper.id, status: "pending" });
      assert.equal(applicationError, null, applicationError?.message);

      const { data: expiredCount, error: expiryError } = await service.rpc("expire_unassigned_tasks");
      assert.equal(expiryError, null, expiryError?.message);
      assert.ok(expiredCount >= 1);

      const [{ data: expiredTask, error: expiredTaskError }, { data: expiredApplication, error: expiredApplicationError }] = await Promise.all([
        service.from("tasks").select("status, helper_id").eq("id", task.id).single(),
        service.from("task_applications").select("status").eq("task_id", task.id).single(),
      ]);
      assert.equal(expiredTaskError, null, expiredTaskError?.message);
      assert.equal(expiredTask.status, "dibatalkan");
      assert.equal(expiredTask.helper_id, null);
      assert.equal(expiredApplicationError, null, expiredApplicationError?.message);
      assert.equal(expiredApplication.status, "expired");
    } finally {
      await service.from("tasks").delete().eq("id", task.id);
    }
  },
);
