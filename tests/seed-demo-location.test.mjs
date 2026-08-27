import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const alignmentMigration = fs.readFileSync(new URL("../supabase/seed.sql", import.meta.url), "utf8");

test("seed demo membuat atau memakai akun inti mbahburgas dan masburgas", () => {
  assert.match(alignmentMigration, /username\) = ["']mbahburgas["']/i);
  assert.match(alignmentMigration, /demokoordinator@rangkul\.id/);
  assert.match(alignmentMigration, /demohelper@rangkul\.id/);
  assert.match(alignmentMigration, /pending_verification/);
  assert.match(alignmentMigration, /raw_user_meta_data ->> 'username'/i);
  assert.match(alignmentMigration, /IF .*NULL/i);
  assert.match(alignmentMigration, /IF NOT EXISTS/i);
});

test("seed demo approval berada di Semarang Selatan", () => {
  assert.match(alignmentMigration, /masburgas/i);
  assert.match(alignmentMigration, /Pleburan/i);
  assert.match(alignmentMigration, /Semarang Selatan/i);
  assert.match(alignmentMigration, /Kota Semarang/i);
  assert.match(alignmentMigration, /UPDATE public\.lansia_profiles/);
  assert.match(alignmentMigration, /UPDATE public\.helper_profiles/);
});
