import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  getHealthScorePresentation,
  getPaymentPresentation,
  paymentRequiresCompletion,
  getTaskDetailPresentation,
  sanitizeUserFacingText,
  shortTaskReference,
} from "../src/components/keluarga/task-detail/task-detail-presentation.ts";

const detailSource = () => fs.readFileSync("src/components/keluarga/RealTaskDetailClient.tsx", "utf8");
const applicantSource = () => fs.readFileSync("src/app/(keluarga)/kunjungan/[id]/pelamar/page.tsx", "utf8");
const paymentPageSource = () => fs.readFileSync("src/app/(keluarga)/pembayaran/[task_id]/page.tsx", "utf8");
const dashboardSource = () => fs.readFileSync("src/app/(keluarga)/beranda/page.tsx", "utf8");
const visitListSource = () => fs.readFileSync("src/components/keluarga/KunjunganListClient.tsx", "utf8");
const visitPageSource = () => fs.readFileSync("src/app/(keluarga)/kunjungan/page.tsx", "utf8");

test("reference kunjungan ringkas dan marker demo tidak pernah tampil", () => {
  assert.equal(shortTaskReference("8f95e654-8f92-45f3-8b18-29c19d656921"), "#8F95E654");
  assert.equal(sanitizeUserFacingText("[DEMO_MATRIX] Task menunggu Koordinator"), "Kunjungan menunggu Koordinator");
  assert.equal(sanitizeUserFacingText("[DEMO_SPRINT6]   Catatan keluarga"), "Catatan keluarga");
});

test("state persetujuan Koordinator menjelaskan proses dan mengunci jadwal", () => {
  const presentation = getTaskDetailPresentation({
    status: "menunggu_persetujuan_koordinator",
    modePenugasan: "langsung",
    isHighRisk: true,
    applicantCount: 0,
    hasHelper: true,
  });

  assert.equal(presentation.currentStep, "coordinator_review");
  assert.equal(presentation.steps.some((step) => step.id === "coordinator_review"), true);
  assert.equal(presentation.showCancel, true);
  assert.equal(presentation.showScheduleEditor, false);
  assert.match(presentation.explanation, /Koordinator wilayah/);
  assert.match(presentation.supportingText, /tidak perlu/);
});

test("state pelamar menampilkan jumlah nyata tanpa mengarang ETA", () => {
  const withApplicants = getTaskDetailPresentation({
    status: "diajukan",
    modePenugasan: "pelamar",
    isHighRisk: false,
    applicantCount: 3,
    hasHelper: false,
  });
  const empty = getTaskDetailPresentation({
    status: "diajukan",
    modePenugasan: "pelamar",
    isHighRisk: false,
    applicantCount: 0,
    hasHelper: false,
  });

  assert.equal(withApplicants.primaryAction?.label, "Lihat 3 Pelamar");
  assert.match(withApplicants.headline, /3 Helper/);
  assert.equal(empty.primaryAction?.label, "Lihat Pelamar");
  assert.match(empty.headline, /Belum ada Helper/);
});

test("state selesai mengutamakan outcome dan Riwayat Rangkul", () => {
  const presentation = getTaskDetailPresentation({
    status: "selesai",
    modePenugasan: "langsung",
    isHighRisk: false,
    applicantCount: 0,
    hasHelper: true,
  });

  assert.equal(presentation.outcomeFirst, true);
  assert.equal(presentation.showReport, true);
  assert.equal(presentation.showContactHelper, false);
  assert.equal(presentation.primaryAction?.label, "Buka Riwayat Rangkul");
});

test("state dibatalkan menjadi arsip tanpa aksi live", () => {
  const presentation = getTaskDetailPresentation({
    status: "dibatalkan",
    modePenugasan: "langsung",
    isHighRisk: false,
    applicantCount: 0,
    hasHelper: true,
  });

  assert.equal(presentation.showCancellationSummary, true);
  assert.equal(presentation.showContactHelper, false);
  assert.equal(presentation.showScheduleEditor, false);
  assert.equal(presentation.showCancel, false);
  assert.equal(presentation.steps.at(-1)?.id, "cancelled");
});

test("stepper pembatalan berhenti pada milestone terakhir yang benar", () => {
  const presentation = getTaskDetailPresentation({
    status: "dibatalkan",
    modePenugasan: "langsung",
    isHighRisk: false,
    applicantCount: 0,
    hasHelper: true,
    confirmedAt: "2026-09-05T08:00:00.000Z",
  });

  assert.equal(presentation.steps.find((step) => step.id === "confirmed")?.state, "complete");
  assert.equal(presentation.steps.find((step) => step.id === "in_progress")?.state, "upcoming");
  assert.equal(presentation.steps.find((step) => step.id === "completed")?.state, "upcoming");
});

test("Health Snapshot memberi konteks non-diagnostik", () => {
  assert.deepEqual(getHealthScorePresentation(2), { score: "2/5", label: "Perlu perhatian" });
  assert.deepEqual(getHealthScorePresentation(3), { score: "3/5", label: "Perlu dipantau" });
  assert.deepEqual(getHealthScorePresentation(5), { score: "5/5", label: "Terpantau baik" });
});

test("pembayaran menjelaskan tindakan tanpa menampilkan status teknis", () => {
  assert.deepEqual(getPaymentPresentation(null, "diajukan"), {
    label: "Belum perlu dibayar",
    description: "Pembayaran tersedia setelah Kunjungan dikonfirmasi.",
    actionLabel: null,
    tone: "muted",
  });
  assert.deepEqual(getPaymentPresentation(null, "dikonfirmasi"), {
    label: "Pembayaran perlu diselesaikan",
    description: "Selesaikan pembayaran untuk mengamankan Kunjungan sesuai jadwal.",
    actionLabel: "Bayar kunjungan",
    tone: "warning",
  });
  assert.equal(getPaymentPresentation("held_escrow", "dikerjakan").label, "Pembayaran diterima");
  assert.equal(getPaymentPresentation(null, "dibatalkan").label, "Tidak ada pembayaran untuk dikembalikan");
});

test("pembayaran yang sudah diterima tidak lagi diperlakukan sebagai tagihan", () => {
  assert.equal(paymentRequiresCompletion("held_escrow", "dikerjakan"), false);
  assert.equal(paymentRequiresCompletion("released", "selesai"), false);
  assert.equal(paymentRequiresCompletion("pending", "dikonfirmasi"), true);
  assert.equal(paymentRequiresCompletion(null, "dikonfirmasi"), true);
});

test("tagihan lewat jadwal tidak menawarkan checkout yang sudah tidak layak", () => {
  const payment = getPaymentPresentation("pending", "dikonfirmasi", "2026-08-27T10:04:00.000Z");

  assert.equal(payment.label, "Batas pembayaran telah lewat");
  assert.equal(payment.actionLabel, null);
  assert.equal(payment.tone, "danger");
  assert.match(payment.description, /membatalkan/);

  const legacyStartedPayment = getPaymentPresentation("pending", "dikerjakan", "2026-08-27T10:04:00.000Z");
  assert.match(legacyStartedPayment.description, /perlu ditinjau/);
});

test("halaman pembayaran tidak menawarkan checkout sebelum kunjungan layak dibayar", () => {
  const source = paymentPageSource();

  assert.match(source, /const canStartPayment = \["dikonfirmasi", "dikerjakan", "selesai"\]\.includes\(task\.status\);/);
  assert.match(source, /Belum perlu dibayar/);
  assert.match(source, /Pembayaran tersedia setelah Kunjungan dikonfirmasi/);
  assert.match(source, /paymentRequiresCompletion/);
  assert.match(source, /paymentPresentation\.tone === "danger"/);
  assert.match(source, /\{canCheckout && \(/);
});

test("pembayaran yang perlu diselesaikan diprioritaskan di detail dan daftar Kunjungan", () => {
  const detail = detailSource();
  const dashboard = dashboardSource();
  const list = visitListSource();
  const visitPage = visitPageSource();

  assert.match(detail, /PaymentPriorityNotice/);
  assert.ok(detail.lastIndexOf("PaymentPriorityNotice") < detail.lastIndexOf("TaskLifecycleStepper"));
  assert.match(dashboard, /getPaymentPresentation/);
  assert.match(dashboard, /paymentRequiresCompletion/);
  assert.match(list, /getPaymentPresentation/);
  assert.match(list, /paymentRequiresCompletion/);
  assert.match(visitPage, /payments\?: Relation<\{ status: string \}>/);
  assert.match(visitPage, /payment_status: relation\(task\.payments\)\?\.status/);
});

test("dashboard membedakan kunjungan aktif dari kunjungan mendatang", () => {
  const dashboard = dashboardSource();

  assert.match(dashboard, /\.in\("status", \["dikerjakan", "menunggu_persetujuan_keluarga"\]\)/);
  assert.match(dashboard, /\.in\("status", \["diajukan", "menunggu_persetujuan_koordinator", "dikonfirmasi"\]\)/);
  assert.match(dashboard, /\.gte\("jadwal_waktu", now\)/);
});

test("orchestrator menggunakan shell lifecycle dan tidak memproduksi rating palsu", () => {
  const source = detailSource();
  assert.match(source, /TaskDetailHeader/);
  assert.match(source, /TaskLifecycleStepper/);
  assert.match(source, /TaskNextActionPanel/);
  assert.match(source, /TaskContextRail/);
  assert.doesNotMatch(source, /LansiaPhotoPreview/);
  assert.doesNotMatch(source, /ID:\s*\{task\.id\}/);
  assert.doesNotMatch(source, /Total saat ini/);
  assert.doesNotMatch(source, /Laporkan Helper/);
  assert.doesNotMatch(applicantSource(), /rating_avg\) \|\| 5\.0/);
});
