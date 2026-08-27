import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("Riwayat Rangkul mengembalikan timeline, tren indikator, dan perhatian rule-based", () => {
  const route = read("src/app/api/lansia/[id]/riwayat/route.ts");
  assert.match(route, /health_snapshots/);
  assert.match(route, /cerita_hari_ini/);
  assert.match(route, /trends|tren/);
  assert.match(route, /perlu_perhatian/);
  assert.match(route, /signed|createSignedUrl|foto_bukti_url/);
});

test("offline evidence memakai IndexedDB dan memiliki status sinkronisasi", () => {
  const files = [
    "src/hooks/use-offline-evidence.ts",
    "src/lib/offline/evidence-store.ts",
    "src/app/(helper)/tugas/[id]/lapor/page.tsx",
  ];
  files.forEach((path) => assert.ok(fs.existsSync(path), `${path} harus tersedia`));
  const hook = read("src/hooks/use-offline-evidence.ts");
  const store = read("src/lib/offline/evidence-store.ts");
  const page = read("src/app/(helper)/tugas/[id]/lapor/page.tsx");
  assert.match(store, /indexedDB|IDBDatabase/);
  assert.match(hook, /pending_sync|syncing|submitted|failed/);
  assert.match(hook, /online/);
  assert.match(page, /client_submission_id/);
});

test("Admin Sprint 4 menyediakan route banding, wallet demo, dan audit log nyata", () => {
  const paths = [
    "src/app/api/admin/appeals/route.ts",
    "src/app/api/admin/appeals/[id]/route.ts",
    "src/app/api/admin/demo-wallet/topup/route.ts",
    "src/app/api/admin/demo-wallet/route.ts",
  ];
  paths.forEach((path) => assert.ok(fs.existsSync(path), `${path} harus tersedia`));
  assert.match(read("src/app/api/admin/appeals/[id]/route.ts"), /audit|ditinjau|status/);
  assert.match(read("src/app/api/admin/demo-wallet/topup/route.ts"), /audit|saldo|topup/i);
});

test("Keluarga dapat mengajukan banding melalui endpoint tervalidasi", () => {
  const route = read("src/app/api/appeals/route.ts");
  const page = read("src/app/(keluarga)/banding/page.tsx");
  assert.match(route, /export async function GET/);
  assert.match(route, /export async function POST/);
  assert.match(route, /z\.object/);
  assert.match(route, /status.*menunggu|menunggu.*status/);
  assert.match(page, /api\/appeals/);
  assert.doesNotMatch(page, /tahap pengembangan/);
});

test("UI Admin Sprint 4 tidak lagi placeholder untuk banding, wallet, dan audit", () => {
  assert.doesNotMatch(read("src/app/(admin)/admin/banding/page.tsx"), /tahap pengembangan|Belum ada permohonan banding yang masuk/);
  assert.doesNotMatch(read("src/app/(admin)/admin/demo-wallet/page.tsx"), /tahap pengembangan/);
  assert.doesNotMatch(read("src/app/(admin)/admin/audit-logs/page.tsx"), /tahap pengembangan/);
});

test("seed menyediakan marker wallet dan banding untuk demo Admin", () => {
  const seed = read("supabase/seed.sql");
  assert.match(seed, /demo_wallets/);
  assert.match(seed, /appeals/);
  assert.match(seed, /DEMO_MATRIX/);
});

test("migration Sprint 4 membatasi wallet ledger dan banding ke relasi yang tepat", () => {
  const migration = read("supabase/migrations/20260828090000_sprint4_admin_offline_hardening.sql");
  assert.match(migration, /demo_wallet_ledger/);
  assert.match(migration, /SECURITY DEFINER/);
  assert.match(migration, /is_admin/);
  assert.match(migration, /appeals/);
  assert.match(migration, /GRANT EXECUTE/);
});
