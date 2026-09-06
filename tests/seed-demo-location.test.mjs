import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const alignmentMigration = fs.readFileSync(new URL("../supabase/seed.sql", import.meta.url), "utf8");

test("seed demo membuat atau memakai akun inti Wagiman dan Andi", () => {
  assert.match(alignmentMigration, /username\) = ["']wagimankoordinator["']/i);
  assert.match(alignmentMigration, /wagimankoordinator@rangkul\.id/);
  assert.match(alignmentMigration, /andihelper@rangkul\.id/);
  assert.match(alignmentMigration, /core_koordinator_user_id[\s\S]*'verified'/i);
  assert.match(alignmentMigration, /raw_user_meta_data ->> 'username'/i);
  assert.match(alignmentMigration, /IF .*NULL/i);
  assert.match(alignmentMigration, /IF NOT EXISTS/i);
});

test("seed demo approval berada di Semarang Selatan", () => {
  assert.match(alignmentMigration, /andihelper/i);
  assert.match(alignmentMigration, /Pleburan/i);
  assert.match(alignmentMigration, /Semarang Selatan/i);
  assert.match(alignmentMigration, /Kota Semarang/i);
  assert.match(alignmentMigration, /UPDATE public\.lansia_profiles/);
  assert.match(alignmentMigration, /UPDATE public\.helper_profiles/);
});
