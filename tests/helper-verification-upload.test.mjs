import assert from "node:assert/strict";
import test from "node:test";
import {
  VERIFICATION_UPLOADS,
  getUploadFailureMessage,
} from "../src/lib/verification/upload.ts";

test("Helper hanya mengunggah KTP dan foto wajah", () => {
  assert.deepEqual(
    VERIFICATION_UPLOADS.map((document) => document.docType),
    ["ktp", "foto_helper"],
  );
});

test("pesan upload menyebut dokumen yang gagal", () => {
  assert.equal(
    getUploadFailureMessage("Foto Profil", "File maksimal 5MB", "foto-helper.png"),
    "Gagal mengunggah Foto Profil (foto-helper.png): File maksimal 5MB",
  );
});

test("pesan upload punya fallback yang jelas", () => {
  assert.equal(
    getUploadFailureMessage("KTP", ""),
    "Gagal mengunggah KTP: Periksa format dan ukuran file lalu coba lagi.",
  );
});
