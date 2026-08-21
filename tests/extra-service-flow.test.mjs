import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const requestSchema = fs.readFileSync(new URL("../src/lib/validations/extra-service.ts", import.meta.url), "utf8");
const requestRoute = fs.readFileSync(new URL("../src/app/api/tasks/[id]/extra-service/route.ts", import.meta.url), "utf8");
const decisionRoute = fs.readFileSync(new URL("../src/app/api/tasks/[id]/extra-service/[eid]/route.ts", import.meta.url), "utf8");
const migration = fs.readFileSync(new URL("../supabase/migrations/20260822120000_extra_service_atomic_flow.sql", import.meta.url), "utf8");
const helperPage = fs.readFileSync(new URL("../src/app/(helper)/tugas/[id]/page.tsx", import.meta.url), "utf8");
const familyPage = fs.readFileSync(new URL("../src/app/(keluarga)/kunjungan/[id]/page.tsx", import.meta.url), "utf8");
const familyClient = fs.readFileSync(new URL("../src/components/keluarga/RealTaskDetailClient.tsx", import.meta.url), "utf8");

test("layanan tambahan memiliki validasi dan route nyata", () => {
  assert.match(requestSchema, /nama_layanan/);
  assert.match(requestSchema, /biaya/);
  assert.match(requestRoute, /export async function POST/);
  assert.match(requestRoute, /create_extra_service/);
  assert.match(migration, /dikerjakan/);
  assert.match(requestRoute, /menunggu_persetujuan_keluarga/);
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
