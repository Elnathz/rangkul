import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const queuePage = fs.readFileSync(new URL("../src/app/(koordinator)/koordinator/antrean-persetujuan/page.tsx", import.meta.url), "utf8");
const approvalCard = fs.readFileSync(new URL("../src/components/koordinator/ApprovalTaskCard.tsx", import.meta.url), "utf8");
const approvalRoute = fs.readFileSync(new URL("../src/app/api/tasks/[id]/koordinator-approve/route.ts", import.meta.url), "utf8");
const visibilityMigration = fs.readFileSync(new URL("../supabase/migrations/20260821120000_add_koordinator_helper_visibility.sql", import.meta.url), "utf8");
const queueRlsMigration = fs.readFileSync(new URL("../supabase/migrations/20260821160000_fix_koordinator_task_queue_rls.sql", import.meta.url), "utf8");
const demoDataMigration = fs.readFileSync(new URL("../supabase/migrations/20260821170000_seed_demo_data.sql", import.meta.url), "utf8");

test("antrean Koordinator membaca task waiting dari database", () => {
  assert.doesNotMatch(queuePage, /MOCK_TASKS/);
  assert.match(queuePage, /\.from\(["']tasks["']\)/);
  assert.match(queuePage, /menunggu_persetujuan_koordinator/);
  assert.match(queuePage, /foto_wajah_url/);
  assert.match(queuePage, /foto_url/);
  assert.match(approvalCard, /Profil Helper/);
  assert.match(approvalCard, /Profil lansia/);
  assert.match(approvalCard, /ImagePreviewModal/);
});

test("approval Koordinator memakai conditional update dan RLS scoped", () => {
  assert.match(approvalRoute, /PATCH/);
  assert.match(approvalRoute, /\.eq\(["']status["'], ["']menunggu_persetujuan_koordinator["']\)/);
  assert.match(approvalRoute, /dikonfirmasi/);
  assert.match(queueRlsMigration, /FOR UPDATE/);
  assert.match(queueRlsMigration, /menunggu_persetujuan_koordinator/);
});

test("Koordinator dapat membaca profil lansia yang terkait task dalam wilayahnya", () => {
  assert.match(queueRlsMigration, /ON public\.lansia_profiles/);
  assert.match(queueRlsMigration, /task\.lansia_id = lansia_profiles\.id/);
  assert.match(queueRlsMigration, /kp\.user_id = auth\.uid\(\)/);
});

test("migration demo memakai UUID database dan idempotency marker", () => {
  assert.match(demoDataMigration, /gen_random_uuid\(\)/);
  assert.match(demoDataMigration, /INSERT INTO auth\.users/);
  assert.match(demoDataMigration, /IF NOT EXISTS/);
  assert.match(demoDataMigration, /NOT EXISTS/);
  assert.doesNotMatch(demoDataMigration, /["'](?:[a-f0-9]{8}-){4}[a-f0-9]{12}["']/i);
});
