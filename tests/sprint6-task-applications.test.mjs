import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("Sprint 6 database migration and atomic RPCs contract", () => {
  const migrationPath = "supabase/migrations/20260904120000_sprint6_task_applications.sql";
  assert.ok(existsSync(migrationPath), "Migration file Sprint 6 harus ada");

  const migration = read(migrationPath);

  // Verifikasi tabel dan constraint
  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.task_applications/);
  assert.match(migration, /CONSTRAINT task_applications_task_helper_unique UNIQUE \(task_id, helper_id\)/);
  assert.match(migration, /task_applications_single_selected/);
  assert.match(migration, /WHERE \(status = 'selected'\)/);

  // Verifikasi atomic RPC functions
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.apply_to_task/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.withdraw_task_application/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.select_task_application/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.accept_quick_task/);

  // Verifikasi anti-race condition locking
  assert.match(migration, /SELECT id, status, keluarga_id.*FOR UPDATE/s);
  assert.match(migration, /UPDATE public\.task_applications.*SET status = CASE WHEN id = p_application_id THEN 'selected'/s);
});

test("Sprint 6 API routes contract and feature flag protection", () => {
  const applyRoute = read("src/app/api/tasks/[id]/applications/route.ts");
  const withdrawRoute = read("src/app/api/tasks/[id]/applications/me/route.ts");
  const selectRoute = read("src/app/api/tasks/[id]/applications/[application_id]/select/route.ts");
  const quickAcceptRoute = read("src/app/api/tasks/[id]/accept/route.ts");

  // Semua route harus dilindungi feature flag fail-closed
  for (const [name, content] of [
    ["apply", applyRoute],
    ["withdraw", withdrawRoute],
    ["select", selectRoute],
  ]) {
    assert.match(content, /isSprint6MatchingEnabled/, `${name} harus cek feature flag`);
    assert.match(content, /createApiError\(["']not_found["'], ["']Fitur belum tersedia["'], 404\)/);
  }

  // Verifikasi pemanggilan RPC yang tepat
  assert.match(applyRoute, /\.rpc\(\s*["']apply_to_task["']/);
  assert.match(withdrawRoute, /\.rpc\(\s*["']withdraw_task_application["']/);
  assert.match(selectRoute, /\.rpc\(\s*["']select_task_application["']/);
  assert.match(quickAcceptRoute, /\.rpc\(\s*["']accept_quick_task["'],\s*\{\s*p_task_id:\s*taskId,?\s*\}\)/);

  // Verifikasi role protection
  assert.match(applyRoute, /userProfile\?\.role !== ["']helper["']/);
  assert.match(withdrawRoute, /userProfile\?\.role !== ["']helper["']/);
  assert.match(selectRoute, /userProfile\?\.role !== ["']keluarga["']/);
});

test("Sprint 6 frontend pages and components mobile-first contract", () => {
  const applicantsPage = read("src/app/(keluarga)/kunjungan/[id]/pelamar/page.tsx");
  const applicantsClient = read("src/components/keluarga/TaskApplicantsClient.tsx");
  const applyButton = read("src/components/helper/ApplyTaskButton.tsx");
  const detailKeluarga = read("src/components/keluarga/RealTaskDetailClient.tsx");
  const detailHelper = read("src/app/(helper)/tugas/[id]/page.tsx");

  assert.match(applicantsPage, /isSprint6MatchingEnabled/);
  assert.match(applicantsPage, /task_applications/);

  // Target sentuh mobile-first minimal 44px
  assert.match(applicantsClient, /min-h-\[44px\]/);
  assert.match(applyButton, /min-h-\[44px\]|min-h-\[48px\]/);

  // Link integrasi antrean pelamar pada detail keluarga
  assert.match(detailKeluarga, /\/kunjungan\/\$\{task\.id\}\/pelamar/);
  assert.match(detailKeluarga, /Pilih dari Pelamar/);

  // Integrasi ApplyTaskButton pada detail tugas helper
  assert.match(detailHelper, /ApplyTaskButton/);
  assert.match(detailHelper, /rawTask\.mode_penugasan === ["']pelamar["']/);
});
