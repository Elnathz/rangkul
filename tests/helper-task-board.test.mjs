import assert from "node:assert/strict";
import test from "node:test";
import { getTaskBoardBucket } from "../src/lib/helper/task-board.ts";

test("booking direct berstatus diajukan masuk tab aktif Helper yang dituju", () => {
  assert.equal(getTaskBoardBucket("diajukan", "helper-1", "helper-1"), "aktif");
});

test("task marketplace berstatus diajukan masuk tab tersedia", () => {
  assert.equal(getTaskBoardBucket("diajukan", null, "helper-1"), "tersedia");
});

test("task selesai milik Helper masuk tab riwayat", () => {
  assert.equal(getTaskBoardBucket("selesai", "helper-1", "helper-1"), "riwayat");
});

test("task milik Helper lain tidak muncul di papan Helper", () => {
  assert.equal(getTaskBoardBucket("diajukan", "helper-2", "helper-1"), null);
});
