import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationPath = "supabase/migrations/20260906190000_expire_pending_approval_tasks.sql";
const hardeningMigrationPath = "supabase/migrations/20260906200000_backfill_approval_expiry.sql";
const approvalRoutePath = "src/app/api/tasks/[id]/koordinator-approve/route.ts";
const seedPath = "supabase/seed.sql";

test("scheduler membatalkan approval Koordinator yang sudah kedaluwarsa", () => {
  assert.ok(existsSync(migrationPath), "migration expiry approval harus ada");
  const migration = readFileSync(migrationPath, "utf8");

  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.expire_pending_tasks\(\)/);
  assert.match(migration, /status IN \('diajukan', 'menunggu_persetujuan_koordinator'\)/);
  assert.match(migration, /expires_at IS NOT NULL/);
  assert.match(migration, /expires_at <= NOW\(\)/);
  assert.match(migration, /status = 'dibatalkan'/);
  assert.match(migration, /persetujuan Koordinator melewati batas/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.expire_pending_tasks\(\) TO service_role/);
});

test("endpoint approval menolak task yang sudah melewati expires_at", () => {
  const route = readFileSync(approvalRoutePath, "utf8");

  assert.match(route, /expires_at/);
  assert.match(route, /!task\.expires_at|new Date\(.*expires_at.*\)\.getTime\(\) <= Date\.now\(\)/s);
  assert.match(route, /kedaluwarsa|Batas waktu/i);
});

test("approval lama tanpa deadline dibackfill dan policy expiry fail-closed", () => {
  assert.ok(existsSync(hardeningMigrationPath), "migration backfill expiry harus ada");
  const migration = readFileSync(hardeningMigrationPath, "utf8");
  const seed = readFileSync(seedPath, "utf8");

  assert.match(migration, /UPDATE public\.tasks/);
  assert.match(migration, /status = 'menunggu_persetujuan_koordinator'/);
  assert.match(migration, /expires_at IS NULL/);
  assert.match(migration, /DROP POLICY IF EXISTS "Koordinator can approve assigned tasks"/);
  assert.match(migration, /expires_at > NOW\(\)/);
  assert.match(seed, /Task menunggu Koordinator[\s\S]*expires_at/);
});
