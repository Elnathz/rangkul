import assert from "node:assert/strict";
import test from "node:test";
import {
  canHelperAcceptTask,
  getTaskApprovalReasons,
  getTaskAcceptanceStatus,
  isUrgentProbationBooking,
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

test("Helper probation tidak dapat dipilih untuk jadwal kurang dari tiga jam", () => {
  const now = new Date("2026-08-30T03:00:00.000Z");

  assert.equal(
    isUrgentProbationBooking("probation", "2026-08-30T05:59:59.999Z", now),
    true,
  );
  assert.equal(
    isUrgentProbationBooking("probation", "2026-08-30T06:00:00.000Z", now),
    false,
  );
  assert.equal(
    isUrgentProbationBooking("terpercaya", "2026-08-30T04:00:00.000Z", now),
    false,
  );
});

test("alasan approval menjelaskan setiap kondisi khusus yang aktif", () => {
  assert.deepEqual(
    getTaskApprovalReasons({
      ...trustedHelper,
      tingkatKepercayaan: "probation",
      totalTugasSelesai: 0,
      suspendReason: "Pernah dinonaktifkan sementara",
      isHighRisk: true,
    }),
    [
      "Helper masih dalam masa probation",
      "Ini tugas pertama Helper",
      "Helper pernah mendapat sanksi",
      "Kategori layanan berisiko tinggi",
    ],
  );
});
