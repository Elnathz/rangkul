import assert from "node:assert/strict";
import test from "node:test";
import {
  getHelperActivityStatus,
  selectCurrentTask,
} from "../src/lib/koordinator/helper-activity.ts";

const task = (id, status, jadwal_waktu) => ({
  id,
  status,
  jadwal_waktu,
  checkin_time: null,
});

test("status Helper menjadi sedang bertugas saat ada task dikerjakan", () => {
  const currentTask = selectCurrentTask([
    task("scheduled", "dikonfirmasi", "2026-08-21T10:00:00.000Z"),
    task("working", "dikerjakan", "2026-08-21T12:00:00.000Z"),
  ]);

  assert.equal(currentTask?.id, "working");
  assert.equal(getHelperActivityStatus(currentTask, true), "sedang_bertugas");
});

test("status Helper menjadi ada jadwal jika task aktif belum dimulai", () => {
  const currentTask = selectCurrentTask([
    task("scheduled", "dikonfirmasi", "2026-08-21T10:00:00.000Z"),
  ]);

  assert.equal(getHelperActivityStatus(currentTask, true), "memiliki_jadwal");
});

test("Helper tanpa task mengikuti availability", () => {
  assert.equal(getHelperActivityStatus(null, true), "siap_menerima_tugas");
  assert.equal(getHelperActivityStatus(null, false), "tidak_tersedia");
});
