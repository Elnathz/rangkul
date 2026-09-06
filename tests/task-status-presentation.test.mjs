import assert from "node:assert/strict";
import test from "node:test";

import {
  TASK_STATUS_PRESENTATION,
  canRolePerformTaskAction,
  getTaskStatusPresentation,
} from "../src/lib/tasks/task-status-presentation.ts";

const allStatuses = [
  "diajukan",
  "menunggu_persetujuan_koordinator",
  "dikonfirmasi",
  "dikerjakan",
  "menunggu_persetujuan_keluarga",
  "selesai",
  "dibatalkan",
];

test("semua status task memiliki presentasi Bahasa Indonesia yang lengkap", () => {
  assert.deepEqual(Object.keys(TASK_STATUS_PRESENTATION), allStatuses);

  for (const status of allStatuses) {
    const presentation = getTaskStatusPresentation(status);
    assert.ok(presentation.label.length > 0);
    assert.ok(presentation.description.length > 0);
    assert.ok(["neutral", "info", "warning", "success", "danger"].includes(presentation.tone));
  }
});

test("keluarga tidak dapat membatalkan kunjungan setelah sedang dikerjakan", () => {
  assert.equal(canRolePerformTaskAction("dikonfirmasi", "keluarga", "cancel"), true);
  assert.equal(canRolePerformTaskAction("dikerjakan", "keluarga", "cancel"), false);
  assert.equal(canRolePerformTaskAction("selesai", "keluarga", "cancel"), false);
});
