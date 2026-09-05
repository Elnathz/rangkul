import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const requestSchema = fs.readFileSync(new URL("../src/lib/validations/extra-service.ts", import.meta.url), "utf8");
const requestRoute = fs.readFileSync(new URL("../src/app/api/tasks/[id]/extra-service/route.ts", import.meta.url), "utf8");
const decisionRoute = fs.readFileSync(new URL("../src/app/api/tasks/[id]/extra-service/[eid]/route.ts", import.meta.url), "utf8");
const migration = fs.readFileSync(new URL("../supabase/migrations/20260801121120_initial_schema.sql", import.meta.url), "utf8");
const minimumFeeMigration = migration;
const helperPage = fs.readFileSync(new URL("../src/app/(helper)/tugas/[id]/page.tsx", import.meta.url), "utf8");
const helperForm = fs.readFileSync(new URL("../src/components/helper/ExtraServiceRequestForm.tsx", import.meta.url), "utf8");
const familyPage = fs.readFileSync(new URL("../src/app/(keluarga)/kunjungan/[id]/page.tsx", import.meta.url), "utf8");
const familyClient = fs.readFileSync(new URL("../src/components/keluarga/RealTaskDetailClient.tsx", import.meta.url), "utf8");
const bookingRoute = fs.readFileSync(new URL("../src/app/api/booking/task/route.ts", import.meta.url), "utf8");
const bookingSchema = fs.readFileSync(new URL("../src/lib/validations/booking.ts", import.meta.url), "utf8");
const directBookingPage = fs.readFileSync(new URL("../src/app/(keluarga)/booking/[helper_id]/page.tsx", import.meta.url), "utf8");
const helperTaskDetail = fs.readFileSync(new URL("../src/app/(helper)/tugas/[id]/page.tsx", import.meta.url), "utf8");
const helperTaskBoard = fs.readFileSync(new URL("../src/components/helper/TaskBoardClient.tsx", import.meta.url), "utf8");
const helperOpportunities = fs.readFileSync(new URL("../src/app/(helper)/helper/tugas/baru/CariPekerjaanClient.tsx", import.meta.url), "utf8");
const tipRoute = fs.readFileSync(new URL("../src/app/api/tasks/[id]/tip/route.ts", import.meta.url), "utf8");

test("layanan tambahan memiliki validasi dan route nyata", () => {
  assert.match(requestSchema, /nama_layanan/);
  assert.match(requestSchema, /biaya/);
  assert.match(requestSchema, /biaya:.*min\(1000/);
  assert.match(requestRoute, /export async function POST/);
  assert.match(requestRoute, /create_extra_service/);
  assert.match(migration, /dikerjakan/);
  assert.match(requestRoute, /menunggu_persetujuan_keluarga/);
});

test("biaya tambahan minimal seribu rupiah di semua lapisan", () => {
  assert.match(helperForm, /min="1000"/);
  assert.match(minimumFeeMigration, /p_biaya\s*<\s*1000/);
  assert.match(minimumFeeMigration, /CHECK \(biaya >= 1000\)/);
});

test("keputusan keluarga memakai conditional atomic RPC", () => {
  assert.match(decisionRoute, /export async function PATCH/);
  assert.match(decisionRoute, /disetujui/);
  assert.match(decisionRoute, /ditolak/);
  assert.match(decisionRoute, /decide_extra_service/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION public.decide_extra_service/);
  assert.match(migration, /harga_final/);
});

test("UI Helper dan Keluarga tidak lagi memakai mock extra service", () => {
  assert.match(helperPage, /ExtraServiceRequestForm/);
  assert.match(helperForm, /type="number"[\s\S]*step="1"/);
  assert.doesNotMatch(helperForm, /step="1000"/);
  assert.match(helperPage, /task_extra_services/);
  assert.doesNotMatch(familyPage, /MOCK_TASKS/);
  assert.match(familyClient, /ExtraServiceApprovalCard/);
  assert.match(familyPage, /task_extra_services/);
});

test("foto lansia memakai rasio tetap dan modal zoom", () => {
  assert.match(helperPage, /LansiaPhotoPreview/);
  assert.match(familyClient, /LansiaPhotoPreview/);
  assert.match(familyClient, /ImagePreviewModal/);
  const photoPreview = fs.readFileSync(new URL("../src/components/helper/LansiaPhotoPreview.tsx", import.meta.url), "utf8");
  assert.ok(photoPreview.includes("aspect-[4/3]"));
});

test("booking dimulai dari harga dasar tanpa layanan tambahan otomatis", () => {
  assert.match(bookingRoute, /const harga_final = harga_dasar/);
  assert.doesNotMatch(bookingRoute, /extra_time_price/);
  assert.doesNotMatch(bookingRoute, /\.from\('task_extra_services'\)/);
  assert.doesNotMatch(bookingSchema, /tambahan_waktu_menit/);
  assert.doesNotMatch(directBookingPage, /tambahan_waktu_menit/);
  assert.doesNotMatch(directBookingPage, /Tambahan Waktu/);
});

test("browser tidak menghitung pendapatan Helper dari harga kunjungan", () => {
  for (const source of [helperTaskDetail, helperTaskBoard, helperOpportunities]) {
    assert.doesNotMatch(source, /\*\s*0\.9/);
    assert.doesNotMatch(source, /Estimasi pendapatan|Potensi pendapatan|Pendapatan Bersih|Potensi Fee/);
  }
  assert.match(helperTaskDetail, /Harga kunjungan/);
  assert.match(helperTaskBoard, /Harga kunjungan/);
  assert.match(helperOpportunities, /Harga kunjungan/);
});

test("tip tidak dicampur ke harga kunjungan atau layanan tambahan", () => {
  assert.doesNotMatch(familyClient, /Berikan Tip untuk Helper/);
  assert.doesNotMatch(familyClient, /\/api\/tasks\/\$\{task\.id\}\/tip/);
  assert.match(familyClient, /approvedServices/);
  assert.match(familyClient, /harga_final/);
  assert.doesNotMatch(tipRoute, /task_extra_services/);
  assert.doesNotMatch(tipRoute, /\.update\(\{ harga_final/);
  assert.match(tipRoute, /Fitur tip belum tersedia/);
});
