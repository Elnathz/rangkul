import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const startRoute = fs.readFileSync(new URL("../src/app/api/tasks/[id]/start/route.ts", import.meta.url), "utf8");
const detailPage = fs.readFileSync(new URL("../src/app/(helper)/tugas/[id]/page.tsx", import.meta.url), "utf8");
const startButton = fs.readFileSync(new URL("../src/components/helper/StartTaskButton.tsx", import.meta.url), "utf8");
const startRls = fs.readFileSync(new URL("../supabase/migrations/20260822100000_add_helper_start_rls.sql", import.meta.url), "utf8");

test("Helper dapat memulai task yang sudah dikonfirmasi", () => {
  assert.match(startRoute, /export async function PATCH/);
  assert.match(startRoute, /\.eq\(["']status["'], ["']dikonfirmasi["']\)/);
  assert.match(startRoute, /status: ["']dikerjakan["']/);
  assert.match(startRoute, /checkin_time/);
  assert.match(startRoute, /helper_id/);
});

test("CTA mulai tugas hanya tampil untuk status dikonfirmasi", () => {
  assert.match(detailPage, /rawTask\.status === ["']dikonfirmasi["']/);
  assert.match(detailPage, /StartTaskButton/);
  assert.match(startButton, /\/api\/tasks\/\$\{taskId\}\/start/);
  assert.match(startButton, /Mulai tugas/);
});

test("RLS start hanya memberi akses kepada Helper pemilik task", () => {
  assert.match(startRls, /ON public\.tasks/);
  assert.match(startRls, /status = ["']dikonfirmasi["']/);
  assert.match(startRls, /status = ["']dikerjakan["']/);
  assert.match(startRls, /hp\.user_id = auth\.uid\(\)/);
});
