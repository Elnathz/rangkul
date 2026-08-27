import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (relativePath) => fs.readFileSync(relativePath, "utf8");
const paymentIntegrity = read("supabase/migrations/20260827180002_sprint3_payment_integrity.sql");
const paymentLifecycle = read("supabase/migrations/20260827180003_sprint3_payment_lifecycle.sql");
const reportReview = read("supabase/migrations/20260827180004_sprint3_report_review.sql");
const safety = read("supabase/migrations/20260827180005_sprint3_safety_notifications.sql");
const seed = read("supabase/seed.sql");
const paymentPage = read("src/app/(keluarga)/pembayaran/[task_id]/page.tsx");

test("payment intent dan webhook mengunci nominal, order, dan idempotensi", () => {
  assert.match(paymentIntegrity, /p_amount <> v_task\.harga_final/);
  assert.match(paymentIntegrity, /FOR UPDATE/);
  assert.match(paymentIntegrity, /v_payment\.status IN \('held_escrow', 'released'\)/);
  assert.match(paymentIntegrity, /v_gross_amount <> v_payment\.amount/);
  assert.match(paymentIntegrity, /p_payload->>'order_id' IS DISTINCT FROM p_order_id/);
  assert.match(paymentIntegrity, /p_payload->>'status_code' IS DISTINCT FROM '200'/);
  assert.match(paymentIntegrity, /GRANT EXECUTE ON FUNCTION public\.settle_midtrans_payment.*service_role/si);
});

test("refund kompensasi dan auto-release menjalankan split dari jumlah final", () => {
  assert.match(paymentLifecycle, /status = 'refunding'/);
  assert.match(paymentLifecycle, /v_compensation := ROUND\(v_payment\.jumlah_total \* 0\.50/);
  assert.match(paymentLifecycle, /v_helper_share := ROUND\(v_payment\.jumlah_total \* 0\.90/);
  assert.match(paymentLifecycle, /v_platform_fee := ROUND\(v_payment\.jumlah_total \* 0\.07/);
  assert.match(paymentLifecycle, /held_at <= NOW\(\) - INTERVAL '72 hours'/);
  assert.match(paymentLifecycle, /GRANT EXECUTE ON FUNCTION public\.auto_release_held_payments.*service_role/si);
});

test("review laporan dan acceptance Helper under_review punya enforcement database", () => {
  assert.match(reportReview, /status IN \('menunggu', 'ditindak'\)/);
  assert.match(reportReview, /review_report/);
  assert.match(reportReview, /decision_reason/);
  assert.match(reportReview, /prevent_under_review_acceptance/);
  assert.match(reportReview, /Task participants can read messages/);
});

test("SOS dan notifikasi punya deduplikasi serta scope recipient", () => {
  assert.match(safety, /UNIQUE INDEX.*emergency_alerts_task_active_unique/s);
  assert.match(safety, /create_emergency_alert/);
  assert.match(safety, /acknowledge_emergency_alert/);
  assert.match(safety, /notify_message_recipient/);
  assert.match(safety, /notify_task_status_change/);
  assert.match(safety, /Scoped participants can read emergency alerts/);
});

test("seed Sprint 3 menyediakan fixture yang dapat dilacak dan idempoten", () => {
  assert.match(seed, /\[DEMO_MATRIX\] Payment held escrow/);
  assert.match(seed, /\[DEMO_MATRIX\] Payment released split 90 7 3/);
  assert.match(seed, /\[DEMO_MATRIX\] Pesan task scoped/);
  assert.match(seed, /Fixture SOS aktif untuk task demo/);
  assert.match(seed, /WHERE NOT EXISTS/);
});

test("route sensitif tidak membypass RLS dengan service role", () => {
  const emergency = read("src/app/api/emergency/route.ts");
  const acknowledge = read("src/app/api/emergency/[id]/acknowledge/route.ts");
  const reportsPage = read("src/app/(admin)/admin/reports/page.tsx");
  assert.match(emergency, /rpc\("create_emergency_alert"/);
  assert.match(acknowledge, /rpc\("acknowledge_emergency_alert"/);
  assert.doesNotMatch(emergency, /createAdminClient/);
  assert.doesNotMatch(acknowledge, /createAdminClient/);
  assert.doesNotMatch(reportsPage, /createAdminClient/);
});

test("UI pembayaran Mervin memakai checkout token dari API Midtrans", () => {
  assert.match(paymentPage, /\/api\/payments\/\$\{taskId\}\/charge/);
  assert.match(paymentPage, /window\.snap\.pay\(body\.checkout\.token/);
  assert.match(paymentPage, /snap\.js/);
  assert.match(paymentPage, /addEventListener\("load", markSnapReady\)/);
  assert.match(paymentPage, /\/api\/payments\/\$\{taskId\}\/status/);
});
