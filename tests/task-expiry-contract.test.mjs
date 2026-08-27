import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const migration = await readFile(
  "supabase/migrations/20260801121120_initial_schema.sql",
  "utf8",
);
const workflow = await readFile(".github/workflows/heartbeat.yml", "utf8");

test("expiry RPC only cancels unaccepted expired tasks", () => {
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.expire_pending_tasks/);
  assert.match(migration, /status = 'diajukan'/);
  assert.match(migration, /expires_at IS NOT NULL/);
  assert.match(migration, /expires_at <= NOW\(\)/);
  assert.match(migration, /status = 'dibatalkan'/);
  assert.match(migration, /cancelled_at = COALESCE\(cancelled_at, NOW\(\)\)/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.expire_pending_tasks\(\) TO service_role/);
});

test("heartbeat invokes the expiry RPC with the service role", () => {
  assert.match(workflow, /rest\/v1\/rpc\/expire_pending_tasks/);
  assert.match(workflow, /-X POST/);
  assert.match(workflow, /SUPABASE_SERVICE_ROLE_KEY/);
});
