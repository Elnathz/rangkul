import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const migrations = fs
  .readdirSync("supabase/migrations")
  .map((file) => fs.readFileSync(`supabase/migrations/${file}`, "utf8"))
  .join("\n");

test("tasks menyediakan timestamp konfirmasi dan mulai sesuai TDD", () => {
  assert.match(migrations, /ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ/);
  assert.match(migrations, /ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ/);
});
