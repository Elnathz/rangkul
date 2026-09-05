import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("pemilihan pelamar menghitung ulang eligibility di dalam transaksi", () => {
  const migrationPath = "supabase/migrations/20260905103000_harden_sprint6_application_selection.sql";
  assert.ok(existsSync(migrationPath), "migration hardening selection harus ada");

  const migration = readFileSync(migrationPath, "utf8");
  assert.match(migration, /v_task\.mode_penugasan <> 'pelamar'/);
  assert.match(migration, /v_task\.expires_at IS NULL OR v_task\.expires_at <= NOW\(\)/);
  assert.match(migration, /public\.helper_service_categories/);
  assert.match(migration, /public\.haversine_distance_km/);
  assert.match(migration, /OVERLAPS/);
  assert.match(migration, /FOR UPDATE/);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.select_task_application\(uuid, uuid\) FROM PUBLIC/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.select_task_application\(uuid, uuid\) TO authenticated/);
});
