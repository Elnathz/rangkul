import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const migration = fs.readFileSync(new URL("../supabase/migrations/20260801121120_initial_schema.sql", import.meta.url), "utf8");
const cancelRoute = fs.readFileSync(new URL("../src/app/api/tasks/[id]/cancel/route.ts", import.meta.url), "utf8");
const rescheduleRoute = fs.readFileSync(new URL("../src/app/api/tasks/[id]/reschedule/route.ts", import.meta.url), "utf8");
const validation = fs.readFileSync(new URL("../src/lib/validations/task-scheduling.ts", import.meta.url), "utf8");

test("cancel task wajib memakai alasan dan conditional status", () => {
  assert.match(validation, /cancellation_reason/);
  assert.match(cancelRoute, /export async function POST/);
  assert.match(cancelRoute, /cancel_task/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.cancel_task/);
  assert.match(migration, /status IN \('diajukan', 'menunggu_persetujuan_koordinator', 'dikonfirmasi'\)/);
});

test("reschedule task membatasi dua kali dan aturan 3 jam atau 2 jam", () => {
  assert.match(validation, /jadwal_waktu/);
  assert.match(rescheduleRoute, /export async function PATCH/);
  assert.match(rescheduleRoute, /reschedule_task/);
  assert.match(migration, /reschedule_count >= 2/);
  assert.match(migration, /INTERVAL '3 hours'/);
  assert.match(migration, /INTERVAL '2 hours'/);
});
