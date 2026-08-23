import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const migration = fs.readFileSync("supabase/migrations/20260822131524_chat_messages_policies_and_realtime.sql", "utf8");
const baseline = fs.readFileSync("supabase/migrations/20260801121120_initial_schema.sql", "utf8");

test("migration chat tidak menduplikasi atau melonggarkan policy messages baseline", () => {
  assert.match(baseline, /CREATE POLICY "Users can insert own messages"/);
  assert.doesNotMatch(migration, /CREATE POLICY/);
  assert.match(migration, /pg_publication_tables/);
  assert.match(migration, /ALTER PUBLICATION supabase_realtime ADD TABLE public\.messages/);
});
