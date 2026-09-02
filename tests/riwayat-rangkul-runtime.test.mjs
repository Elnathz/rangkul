import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  calculateIndicatorTrends,
  calculateRiwayatTrend,
  createRiwayatRangkulHandler,
  mapRiwayatTasks,
  RiwayatDataAccessError,
} from "../src/lib/riwayat-rangkul.ts";

const snapshot = (tanggal, score, overrides = {}) => ({
  tanggal,
  energi: score,
  mobilitas: score,
  mood: score,
  nafsu_makan: score,
  kualitas_tidur: score,
  ...overrides,
});

test("strict decline memakai tiga snapshot valid terbaru dalam urutan waktu", () => {
  const result = calculateRiwayatTrend([
    snapshot("2026-08-30T03:00:00.000Z", 3),
    snapshot("2026-08-28T03:00:00.000Z", 5),
    snapshot("2026-08-29T03:00:00.000Z", 4),
  ]);

  assert.equal(result.perlu_perhatian, true);
  assert.equal(result.rata_rata_terakhir, 3);
});

test("nilai sama atau kenaikan di tengah membatalkan strict decline", () => {
  assert.equal(calculateRiwayatTrend([
    snapshot("2026-08-28T03:00:00.000Z", 5),
    snapshot("2026-08-29T03:00:00.000Z", 4),
    snapshot("2026-08-30T03:00:00.000Z", 4),
  ]).perlu_perhatian, false);
  assert.equal(calculateRiwayatTrend([
    snapshot("2026-08-28T03:00:00.000Z", 5),
    snapshot("2026-08-29T03:00:00.000Z", 3),
    snapshot("2026-08-30T03:00:00.000Z", 4),
  ]).perlu_perhatian, false);
});

test("kurang dari tiga snapshot dan skor di luar batas tidak memicu perhatian", () => {
  assert.equal(calculateRiwayatTrend([
    snapshot("2026-08-29T03:00:00.000Z", 5),
    snapshot("2026-08-30T03:00:00.000Z", 4),
  ]).perlu_perhatian, false);
  assert.equal(calculateRiwayatTrend([
    snapshot("2026-08-28T03:00:00.000Z", 5),
    snapshot("2026-08-29T03:00:00.000Z", 4),
    snapshot("2026-08-30T03:00:00.000Z", 3, { mood: 0 }),
  ]).perlu_perhatian, false);
  assert.equal(calculateRiwayatTrend([
    snapshot("2026-08-28T03:00:00.000Z", 5),
    snapshot("2026-08-29T03:00:00.000Z", 4),
    snapshot("2026-08-30T03:00:00.000Z", 3, { energi: 6 }),
  ]).perlu_perhatian, false);
});

test("boundary skor 1 dan 5 valid untuk seluruh indikator", () => {
  const trends = calculateIndicatorTrends([
    snapshot("2026-08-28T03:00:00.000Z", 5),
    snapshot("2026-08-29T03:00:00.000Z", 3),
    snapshot("2026-08-30T03:00:00.000Z", 1),
  ]);

  assert.equal(trends.length, 5);
  assert.ok(trends.every((trend) => trend.points[0]?.nilai === 5));
  assert.ok(trends.every((trend) => trend.points[2]?.nilai === 1));
});

test("mapper mengurutkan timeline dan tidak memasukkan snapshot invalid ke tren", () => {
  const mapped = mapRiwayatTasks([
    {
      id: "task-late",
      status: "selesai",
      lansia_id: "lansia-owner",
      keluarga_id: "family-owner",
      jadwal_waktu: "2026-08-30T03:00:00.000Z",
      completed_at: "2026-08-30T04:00:00.000Z",
      task_evidence: [{ foto_bukti_url: "evidence/task-late.jpg", catatan_kondisi: "Stabil" }],
      health_snapshots: [snapshot("unused", 3, { cerita_hari_ini: "Makan bersama" })],
    },
    {
      id: "task-early",
      status: "selesai",
      lansia_id: "lansia-owner",
      keluarga_id: "family-owner",
      jadwal_waktu: "2026-08-28T03:00:00.000Z",
      completed_at: "2026-08-28T04:00:00.000Z",
      task_evidence: [],
      health_snapshots: [snapshot("unused", 2, { energi: 9, cerita_hari_ini: null })],
    },
  ]);

  assert.deepEqual(mapped.visits.map((visit) => visit.task_id), ["task-early", "task-late"]);
  assert.equal(mapped.trendSnapshots.length, 1);
  assert.equal(mapped.visits[1]?.foto_bukti_path, "evidence/task-late.jpg");
});

function completedTask(id, overrides = {}) {
  return {
    id,
    status: "selesai",
    lansia_id: "lansia-owner",
    keluarga_id: "family-owner",
    jadwal_waktu: "2026-08-28T03:00:00.000Z",
    completed_at: "2026-08-28T04:00:00.000Z",
    task_evidence: [{ foto_bukti_url: `family-owner/foto_bukti/${id}.jpg`, catatan_kondisi: "Stabil" }],
    health_snapshots: [snapshot("unused", 3, { cerita_hari_ini: "Bercerita bersama" })],
    ...overrides,
  };
}

function handlerWith(overrides = {}) {
  return createRiwayatRangkulHandler({
    authenticate: async () => ({ id: "family-owner" }),
    findOwnedLansia: async () => ({ id: "lansia-owner", nama: "Giorno" }),
    findTasks: async () => [completedTask("task-owner")],
    signEvidence: async (path) => path ? `https://signed.local/${path}` : null,
    reportError: () => undefined,
    ...overrides,
  });
}

test("handler mengembalikan 200 untuk pemilik dan signed URL tanpa mengubah object path", async () => {
  const tasks = [completedTask("task-owner")];
  const originalPath = tasks[0].task_evidence[0].foto_bukti_url;
  const handler = handlerWith({ findTasks: async () => tasks });
  const response = await handler(new Request("http://localhost/api/lansia/lansia-owner/riwayat"), {
    params: Promise.resolve({ id: "lansia-owner" }),
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.lansia.nama, "Giorno");
  assert.equal(body.data.timeline[0].foto_bukti_url, `https://signed.local/${originalPath}`);
  assert.equal(tasks[0].task_evidence[0].foto_bukti_url, originalPath);
  assert.deepEqual(Object.keys(body), ["data"]);
});

test("handler menyamarkan lansia di luar ownership sebagai 404", async () => {
  let tasksQueried = false;
  const handler = handlerWith({
    findOwnedLansia: async () => null,
    findTasks: async () => {
      tasksQueried = true;
      return [];
    },
  });
  const response = await handler(new Request("http://localhost/api/lansia/lansia-other/riwayat"), {
    params: Promise.resolve({ id: "lansia-other" }),
  });
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error, "not_found");
  assert.equal(tasksQueried, false);
});

test("handler menyaring task belum selesai, lansia lain, dan keluarga lain", async () => {
  const handler = handlerWith({
    findTasks: async () => [
      completedTask("valid"),
      completedTask("unfinished", { status: "dikerjakan" }),
      completedTask("other-lansia", { lansia_id: "lansia-other" }),
      completedTask("other-family", { keluarga_id: "family-other" }),
    ],
  });
  const response = await handler(new Request("http://localhost/api/lansia/lansia-owner/riwayat"), {
    params: Promise.resolve({ id: "lansia-owner" }),
  });
  const body = await response.json();

  assert.deepEqual(body.data.timeline.map((item) => item.task_id), ["valid"]);
});

test("handler menyembunyikan detail error data dari response publik", async () => {
  const reports = [];
  const handler = handlerWith({
    findTasks: async () => {
      throw new RiwayatDataAccessError("timeline", "PGRST999");
    },
    reportError: (event) => reports.push(event),
  });
  const response = await handler(new Request("http://localhost/api/lansia/lansia-owner/riwayat"), {
    params: Promise.resolve({ id: "lansia-owner" }),
  });
  const body = await response.json();

  assert.equal(response.status, 500);
  assert.equal(body.message, "Riwayat belum dapat dimuat");
  assert.doesNotMatch(JSON.stringify(body), /PGRST999|timeline/);
  assert.equal(reports[0].stage, "timeline");
});

test("UI Riwayat menyediakan skeleton, state akses aman, dan data grafik non-visual", async () => {
  const [stateSource, pageSource, chartSource, timelineSource] = await Promise.all([
    readFile("src/components/keluarga/riwayat/RiwayatState.tsx", "utf8"),
    readFile("src/app/(keluarga)/lansia/[id]/riwayat/page.tsx", "utf8"),
    readFile("src/components/keluarga/riwayat/HealthTrendChart.tsx", "utf8"),
    readFile("src/components/keluarga/riwayat/RiwayatTimeline.tsx", "utf8"),
  ]);

  assert.match(stateSource, /kind: "not_found"/);
  assert.match(stateSource, /animate-pulse/);
  assert.match(pageSource, /response\.status === 403 \|\| response\.status === 404/);
  assert.match(chartSource, /role="img"/);
  assert.match(chartSource, /Nilai .* per kunjungan/);
  assert.match(timelineSource, /<ol/);
  assert.match(timelineSource, /<time dateTime=/);
});
