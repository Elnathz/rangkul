import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const migration = await readFile(
  "supabase/migrations/20260801121120_initial_schema.sql",
  "utf8",
);

test("baseline memberi service_role akses database setelah public dibuat ulang", () => {
  assert.match(migration, /GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role/i);
  assert.match(migration, /GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role/i);
  assert.match(migration, /GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role/i);
  assert.match(migration, /ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public[\s\S]*GRANT ALL PRIVILEGES ON TABLES TO service_role/i);
});
