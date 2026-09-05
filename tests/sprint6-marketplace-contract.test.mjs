import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("marketplace Sprint 6 mengambil Helper dari sesi, bukan parameter yang dapat dipalsukan", () => {
  const migrationPath = "supabase/migrations/20260905100000_harden_sprint6_marketplace_session_scope.sql";
  assert.ok(existsSync(migrationPath), "migration hardening marketplace harus ada");

  const migration = read(migrationPath);
  assert.match(migration, /DROP FUNCTION IF EXISTS public\.get_task_marketplace\(uuid, text, integer\)/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.get_task_marketplace\(\s*p_mode text DEFAULT NULL,\s*p_limit integer DEFAULT 20/s);
  assert.match(migration, /v_user_id uuid := auth\.uid\(\)/);
  assert.match(migration, /WHERE user_id = v_user_id/);
  assert.doesNotMatch(migration, /p_helper_user_id/);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.get_task_marketplace\(text, integer\) FROM PUBLIC/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.get_task_marketplace\(text, integer\) TO authenticated/);
});

test("route marketplace memakai token sesi Helper, bukan service role", () => {
  const route = read("src/app/api/tasks/marketplace/route.ts");
  assert.doesNotMatch(route, /createAdminClient/);
  assert.match(route, /userProfile\?\.role !== "helper"/);
  assert.match(route, /\.rpc\("get_task_marketplace", \{\s*p_mode: mode,\s*p_limit: limit,?\s*\}\)/s);
  assert.doesNotMatch(route, /p_helper_user_id/);
});
