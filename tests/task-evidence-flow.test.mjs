import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const evidenceRoute = fs.readFileSync(new URL("../src/app/api/tasks/[id]/evidence/route.ts", import.meta.url), "utf8");
const evidenceSchema = fs.readFileSync(new URL("../src/lib/validations/task-evidence.ts", import.meta.url), "utf8");
const evidenceMigration = fs.readFileSync(new URL("../supabase/migrations/20260801121120_initial_schema.sql", import.meta.url), "utf8");
const helperReport = fs.readFileSync(new URL("../src/app/(helper)/tugas/[id]/lapor/page.tsx", import.meta.url), "utf8");
const helperTaskDetail = fs.readFileSync(new URL("../src/app/(helper)/tugas/[id]/page.tsx", import.meta.url), "utf8");
const familyList = fs.readFileSync(new URL("../src/app/(keluarga)/kunjungan/page.tsx", import.meta.url), "utf8");
const familyDetail = fs.readFileSync(new URL("../src/components/keluarga/RealTaskDetailClient.tsx", import.meta.url), "utf8");
const familyDetailPage = fs.readFileSync(new URL("../src/app/(keluarga)/kunjungan/[id]/page.tsx", import.meta.url), "utf8");
const confirmRoute = fs.readFileSync(new URL("../src/app/api/tasks/[id]/confirm-completion/route.ts", import.meta.url), "utf8");

test("laporan Helper memakai endpoint evidence atomic dan validasi lima snapshot", () => {
  assert.match(evidenceRoute, /export async function POST/);
  assert.match(evidenceRoute, /submit_task_evidence/);
  assert.match(evidenceRoute, /client_submission_id/);
  assert.match(evidenceSchema, /skor_energi/);
  assert.match(evidenceSchema, /skor_mobilitas/);
  assert.match(evidenceSchema, /skor_mood/);
  assert.match(evidenceSchema, /skor_nafsu_makan/);
  assert.match(evidenceSchema, /skor_tidur/);
  assert.match(evidenceMigration, /CREATE OR REPLACE FUNCTION public\.submit_task_evidence/);
  assert.match(evidenceMigration, /status = 'selesai'/);
  assert.match(evidenceMigration, /notify_family_of_task_evidence/);
  assert.match(evidenceMigration, /FOR UPDATE/);
});

test("UI laporan Helper tidak lagi memakai mock atau simulasi timeout", () => {
  assert.doesNotMatch(helperReport, /MOCK_TASKS/);
  assert.doesNotMatch(helperReport, /setTimeout/);
  assert.match(helperReport, /api\/storage\/upload/);
  assert.match(helperReport, /api\/tasks\/\$\{taskId\}\/evidence/);
});

test("detail task Helper memakai URL laporan tanpa route group", () => {
  assert.match(helperTaskDetail, /href=\{`\/tugas\/\$\{rawTask\.id\}\/lapor`\}/);
  assert.doesNotMatch(helperTaskDetail, /href=\{`\/helper\/tugas\/\$\{rawTask\.id\}\/lapor`\}/);
});

test("daftar kunjungan keluarga membaca task nyata dan detail menampilkan hasil laporan", () => {
  assert.doesNotMatch(familyList, /MOCK_TASKS/);
  assert.match(familyList, /from\(["']tasks["']\)/);
  assert.match(familyDetailPage, /task_evidence/);
  assert.match(familyDetailPage, /health_snapshots/);
  assert.match(confirmRoute, /release_task_payment/);
  assert.match(confirmRoute, /status: "released"/);
});

test("detail kunjungan menandatangani foto private setelah ownership dan membaca status payment", () => {
  assert.match(familyDetailPage, /\.eq\("keluarga_id", user\.id\)/);
  assert.match(familyDetailPage, /resolvePrivatePhotoUrl/);
  assert.match(familyDetailPage, /createSignedUrl/);
  assert.match(familyDetailPage, /payments \( status, payment_method, held_at, released_at \)/);
  assert.match(familyDetail, /task\.payment\?\.status === "released"/);
  assert.match(familyDetail, /Dana kunjungan sudah dicairkan/);
});

test("migration demo mengarahkan Helper ke akun masburgas", () => {
  const demoMigration = fs.readFileSync(new URL("../supabase/seed.sql", import.meta.url), "utf8");
  assert.match(demoMigration, /LOWER\(u\.username\) = 'masburgas'/);
  assert.match(demoMigration, /Semarang Selatan/);
});
