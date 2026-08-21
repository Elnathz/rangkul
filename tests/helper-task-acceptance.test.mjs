import assert from "node:assert/strict";
import test from "node:test";
import {
  canHelperAcceptTask,
  getTaskAcceptanceStatus,
} from "../src/lib/helper/task-acceptance.ts";

const trustedHelper = {
  helperStatus: "verified",
  tingkatKepercayaan: "terpercaya",
  totalTugasSelesai: 12,
  suspendReason: null,
  isHighRisk: false,
};

test("Helper terpercaya dapat langsung dikonfirmasi untuk tugas biasa", () => {
  assert.equal(getTaskAcceptanceStatus(trustedHelper), "dikonfirmasi");
});

test("Helper probation harus menunggu persetujuan Koordinator", () => {
  assert.equal(
    getTaskAcceptanceStatus({ ...trustedHelper, tingkatKepercayaan: "probation" }),
    "menunggu_persetujuan_koordinator",
  );
});

test("tugas pertama dan kategori berisiko tinggi selalu meminta approval", () => {
  assert.equal(
    getTaskAcceptanceStatus({ ...trustedHelper, totalTugasSelesai: 0 }),
    "menunggu_persetujuan_koordinator",
  );
  assert.equal(
    getTaskAcceptanceStatus({ ...trustedHelper, isHighRisk: true }),
    "menunggu_persetujuan_koordinator",
  );
});

test("Helper yang belum verified tidak dapat menerima tugas", () => {
  assert.equal(
    getTaskAcceptanceStatus({ ...trustedHelper, helperStatus: "under_review" }),
    null,
  );
});

test("Helper yang dituju dapat mengonfirmasi booking direct", () => {
  assert.equal(canHelperAcceptTask("diajukan", "helper-1", "helper-1"), true);
  assert.equal(canHelperAcceptTask("diajukan", null, "helper-1"), true);
  assert.equal(canHelperAcceptTask("diajukan", "helper-2", "helper-1"), false);
  assert.equal(canHelperAcceptTask("dikonfirmasi", "helper-1", "helper-1"), false);
});
