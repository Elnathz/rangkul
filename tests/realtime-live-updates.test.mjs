import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("task applications are published for realtime invalidation", () => {
  const migrationPath = "supabase/migrations/20260906210000_enable_realtime_for_task_applications.sql";
  assert.ok(existsSync(migrationPath), "Migration realtime task applications harus ada");

  const migration = read(migrationPath);
  assert.match(migration, /pg_publication_tables/);
  assert.match(migration, /tablename\s*=\s*'task_applications'/);
  assert.match(migration, /ALTER PUBLICATION supabase_realtime ADD TABLE public\.task_applications/);
});

test("family applicant queue invalidates through Supabase Realtime and keeps polling out", () => {
  const component = read("src/components/keluarga/TaskApplicantsClient.tsx");

  assert.match(component, /createClient/);
  assert.match(component, /postgres_changes/);
  assert.match(component, /table:\s*["']task_applications["']/);
  assert.match(component, /filter:\s*`task_id=eq\.\$\{taskId\}`/);
  assert.match(component, /fetchApplicants\(\)/);
  assert.doesNotMatch(component, /setInterval\(/);
  assert.match(component, /removeChannel/);
});

test("task chat already subscribes to inserts without a full browser reload", () => {
  const component = read("src/components/chat/ChatRoomClient.tsx");

  assert.match(component, /postgres_changes/);
  assert.match(component, /table:\s*["']messages["']/);
  assert.match(component, /filter:\s*`task_id=eq\.\$\{taskId\}`/);
  assert.match(component, /removeChannel/);
});

test("inbox subscribes to incoming and outgoing message inserts", () => {
  const component = read("src/components/ui/InboxUI.tsx");

  assert.match(component, /createClient/);
  assert.match(component, /postgres_changes/);
  assert.match(component, /table:\s*["']messages["']/);
  assert.match(component, /receiver_id=eq\.\$\{viewerId\}/);
  assert.match(component, /sender_id=eq\.\$\{viewerId\}/);
  assert.match(component, /removeChannel/);
});

test("authenticated navbar refreshes notification badges from live inserts", () => {
  const component = read("src/components/layout/Navbar.tsx");

  assert.match(component, /table:\s*["']notifications["']/);
  assert.match(component, /user_id=eq\.\$\{user\.id\}/);
  assert.match(component, /loadNotifications\(\)/);
  assert.match(component, /removeChannel/);
});
