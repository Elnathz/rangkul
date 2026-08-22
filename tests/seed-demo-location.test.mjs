import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const alignmentMigration = fs.readFileSync(new URL("../supabase/migrations/20260822110000_align_demo_to_mbahburgas.sql", import.meta.url), "utf8");

test("seed demo memakai akun mbahburgas jika akun itu sudah ada", () => {
  assert.match(alignmentMigration, /username\) = ["']mbahburgas["']/i);
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
