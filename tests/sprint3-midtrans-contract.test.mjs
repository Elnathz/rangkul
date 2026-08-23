import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("Sprint 3 menyediakan route Midtrans charge, webhook, status, dan refund", () => {
  const routes = [
    "src/app/api/payments/[task_id]/charge/route.ts",
    "src/app/api/payments/[task_id]/status/route.ts",
    "src/app/api/payments/[task_id]/refund/route.ts",
    "src/app/api/payments/webhook/route.ts",
  ];

  for (const route of routes) {
    assert.equal(fs.existsSync(path.join(root, route)), true, `${route} belum tersedia`);
  }
});

test("migration Sprint 3 memiliki kolom payment canonical dan RPC atomik", () => {
  const migration = read("supabase/migrations/20260801121120_initial_schema.sql");

  assert.match(migration, /CREATE TABLE public\.payments/i);
  assert.match(migration, /gateway_ref/i);
  assert.match(migration, /jumlah_total/i);
  assert.match(migration, /create_midtrans_payment/i);
  assert.match(migration, /settle_midtrans_payment/i);
  assert.match(migration, /refund_midtrans_payment/i);
  assert.match(migration, /cancel_task_with_compensation/i);
});

test("halaman pembayaran tidak memakai nominal atau saldo hardcode", () => {
  const page = read("src/app/(keluarga)/pembayaran/[task_id]/page.tsx");
  assert.doesNotMatch(page, /useState\(500000\)|useState\(75000\)|Mock data|setTimeout/);
  assert.match(page, /\/api\/payments/);
});

test("route webhook memvalidasi signature Midtrans sebelum mengubah status", () => {
  const route = read("src/app/api/payments/webhook/route.ts");
  const verifier = read("src/lib/midtrans.ts");
  assert.match(route, /signature/i);
  assert.match(verifier, /sha512/i);
  assert.match(route, /settle_midtrans_payment|rpc\(/i);
});

test("route completion canonical merilis pembayaran lewat RPC", () => {
  const route = read("src/app/api/tasks/[id]/complete/route.ts");
  assert.match(route, /release|settle|confirm_task_completion/i);
  assert.match(route, /rpc\(/i);
});

test("halaman pembayaran menyediakan konfirmasi pencairan setelah settlement", () => {
  const page = read("src/app/(keluarga)/pembayaran/[task_id]/page.tsx");
  assert.match(page, /api\/tasks\/\$\{taskId\}\/complete/);
  assert.match(page, /Konfirmasi selesai dan cairkan dana/);
});

test("Sprint 3 menyediakan route komunikasi dan SOS nyata", () => {
  const routes = [
    "src/app/api/reports/route.ts",
    "src/app/api/reports/[id]/route.ts",
    "src/app/api/messages/conversations/route.ts",
    "src/app/api/messages/[id]/route.ts",
    "src/app/api/messages/route.ts",
    "src/app/api/messages/[id]/read/route.ts",
    "src/app/api/emergency/route.ts",
    "src/app/api/emergency/[id]/acknowledge/route.ts",
  ];
  for (const route of routes) assert.equal(fs.existsSync(path.join(root, route)), true, `${route} belum tersedia`);
});

test("SOS dan inbox tidak memakai API simulasi atau data hardcode", () => {
  const sos = read("src/components/ui/SOSDialog.tsx");
  const inbox = read("src/components/ui/InboxUI.tsx");
  assert.doesNotMatch(sos, /MOCK API|setTimeout\(.*2000/);
  assert.match(sos, /\/api\/emergency/);
  assert.doesNotMatch(inbox, /const contacts =|Budi|Rina|Siti|Bambang/);
  assert.match(inbox, /\/api\/messages/);
});
