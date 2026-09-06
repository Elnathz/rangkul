import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationPath = "supabase/migrations/20260906180000_enforce_payment_before_visit.sql";

test("pembayaran wajib diterima sebelum Kunjungan dapat dimulai", () => {
  assert.ok(existsSync(migrationPath), "migration batas pembayaran harus ada");
  const migration = readFileSync(migrationPath, "utf8");

  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.expire_unpaid_confirmed_tasks\(\)/);
  assert.match(migration, /status = 'dikonfirmasi'/);
  assert.match(migration, /jadwal_waktu <= NOW\(\)/);
  assert.match(migration, /status IN \('held_escrow', 'released'\)/);
  assert.match(migration, /Verified helper can start confirmed tasks/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.prepare_midtrans_payment_intent/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.charge_task_with_demo_wallet/);
  assert.match(migration, /Batas pembayaran sudah lewat/);
});

test("scheduled job mengeksekusi expiry pembayaran", () => {
  const workflow = readFileSync(".github/workflows/scheduled-jobs.yml", "utf8");

  assert.match(workflow, /expire_unpaid_confirmed_tasks/);
});
