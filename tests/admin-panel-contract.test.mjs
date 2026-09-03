import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("Admin menyediakan route statistik dan pengguna nyata", () => {
  assert.ok(fs.existsSync("src/app/api/admin/stats/route.ts"));
  assert.ok(fs.existsSync("src/app/api/admin/users/route.ts"));
  assert.ok(fs.existsSync("src/app/api/admin/users/[id]/route.ts"));
  assert.match(read("src/app/api/admin/users/route.ts"), /from\(["']users["']\)/);
  assert.match(read("src/app/api/admin/stats/route.ts"), /audit_logs/);
});

test("Admin pengguna memiliki tabs berdasarkan role", () => {
  const source = read("src/app/(admin)/admin/users/page.tsx");
  for (const role of ["Semua", "Keluarga", "Helper", "Koordinator", "Admin"]) {
    assert.match(source, new RegExp(role));
  }
  assert.doesNotMatch(source, /USR-001|Siti Aminah|const users = \[/);
});

test("navigasi Admin menyediakan akses ke fallback verifikasi Helper", () => {
  const layout = read("src/app/(admin)/layout.tsx");
  assert.match(layout, /href: "\/admin\/helpers\/fallback"/);
  assert.match(layout, /label: "Fallback verifikasi"/);
});

test("mutation Admin membuat audit log dan memakai Auth Admin API untuk hapus", () => {
  const users = read("src/app/api/admin/users/[id]/route.ts");
  const helpers = read("src/app/api/admin/helpers/[id]/suspend/route.ts");
  const trustSafetyMigration = read("supabase/migrations/20260828140000_trust_safety_decisions.sql");
  assert.match(users, /auth\.admin\.deleteUser/);
  assert.match(users, /writeAuditLog/);
  assert.match(helpers, /rpc\("admin_decide_helper_status"/);
  assert.doesNotMatch(helpers, /writeAuditLog/);
  assert.match(trustSafetyMigration, /INSERT INTO public\.audit_logs/);
});

test("route kategori menyimpan semua field schema", () => {
  const source = read("src/app/api/admin/service-categories/route.ts");
  for (const field of ["tingkat", "parent_id", "jarak_min_km", "jarak_max_km"]) {
    assert.match(source, new RegExp(field));
  }
});

test("migration Admin menyediakan RPC status akun dan audit log", () => {
  const migration = fs
    .readdirSync("supabase/migrations")
    .filter((file) => file.includes("admin_panel_operations"))
    .map((file) => read(`supabase/migrations/${file}`))
    .join("\n");

  assert.match(migration, /admin_set_account_status/);
  assert.match(migration, /SECURITY DEFINER/i);
  assert.match(migration, /is_admin/);
  assert.match(migration, /audit_logs/);
});
