import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("expiry Sprint 6 membatalkan task tidak terisi dan menutup lamaran pending", () => {
  const migrationPath = "supabase/migrations/20260905110000_expire_sprint6_task_applications.sql";
  assert.ok(existsSync(migrationPath), "migration expiry Sprint 6 harus ada");

  const migration = readFileSync(migrationPath, "utf8");
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.expire_unassigned_tasks\(\)/);
  assert.match(migration, /status = 'dibatalkan'/);
  assert.match(migration, /status = 'expired'::public\.task_application_status/);
  assert.match(migration, /WHERE application\.task_id IN \(SELECT id FROM expired\)/);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.expire_unassigned_tasks\(\) FROM PUBLIC/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.expire_unassigned_tasks\(\) TO service_role/);
});
