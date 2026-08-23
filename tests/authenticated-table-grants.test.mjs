import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const migrationFiles = fs
  .readdirSync("supabase/migrations")
  .filter((file) => file.includes("authenticated_table_grants"));

test("authenticated memiliki privilege minimum untuk alur role dan notifikasi", () => {
  assert.equal(migrationFiles.length, 1);

  const migration = fs.readFileSync(`supabase/migrations/${migrationFiles[0]}`, "utf8");

  const selectGrants = {
    users: "SELECT, UPDATE",
    notifications: "SELECT, UPDATE",
    koordinator_profiles: "SELECT, INSERT, UPDATE",
    helper_profiles: "SELECT, INSERT, UPDATE",
    tasks: "SELECT, INSERT, UPDATE",
    audit_logs: "SELECT, INSERT",
    service_categories: "SELECT, INSERT, UPDATE, DELETE",
  };

  for (const [table, privileges] of Object.entries(selectGrants)) {
    assert.match(migration, new RegExp(`GRANT ${privileges} ON public\\.${table} TO authenticated;`));
  }

  assert.match(migration, /GRANT SELECT, UPDATE ON public\.notifications TO authenticated;/);
});

test("Admin dapat membaca tasks untuk statistik dashboard melalui RLS", () => {
  const policyMigrations = fs
    .readdirSync("supabase/migrations")
    .filter((file) => file.includes("admin_stats_task_access"));

  assert.equal(policyMigrations.length, 1);
  const migration = fs.readFileSync(`supabase/migrations/${policyMigrations[0]}`, "utf8");
  assert.match(migration, /CREATE POLICY "Admin can read all tasks" ON public\.tasks/);
  assert.match(migration, /FOR SELECT TO authenticated/);
  assert.match(migration, /USING \(public\.is_admin\(\)\)/);
});
