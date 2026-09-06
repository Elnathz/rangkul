import assert from "node:assert/strict";
import test from "node:test";
import { validateUploadFile } from "../src/lib/storage/file-validation.ts";

const file = (name, type, size) => ({ name, type, size });

test("dokumen identitas menerima JPG, PNG, dan PDF sampai 5MB", () => {
  assert.equal(validateUploadFile(file("ktp.jpg", "image/jpeg", 1024), { kind: "document", label: "KTP" }), null);
  assert.equal(validateUploadFile(file("kk.pdf", "application/pdf", 1024), { kind: "document", label: "KK" }), null);
  assert.equal(validateUploadFile(file("kk.pdf", "", 1024), { kind: "document", label: "KK" }), null);
});

test("foto hanya menerima format gambar", () => {
  assert.equal(validateUploadFile(file("wajah.png", "image/png", 1024), { kind: "image", label: "Foto" }), null);
  assert.match(validateUploadFile(file("wajah.pdf", "application/pdf", 1024), { kind: "image", label: "Foto" }) ?? "", /JPG atau PNG/);
});

test("validator menolak tipe yang tidak didukung dan file di atas 5MB", () => {
  assert.match(validateUploadFile(file("dokumen.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 1024), { kind: "document", label: "Dokumen" }) ?? "", /JPG, PNG, atau PDF/);
  assert.match(validateUploadFile(file("ktp.jpg", "image/jpeg", 5 * 1024 * 1024 + 1), { kind: "document", label: "KTP" }) ?? "", /maksimal 5MB/i);
});

test("pendaftaran lansia memakai kontrak dokumen wajib yang sama di UI dan API", async () => {
  const page = await (await import("node:fs/promises")).readFile("src/app/(keluarga)/lansia/tambah/page.tsx", "utf8");
  const route = await (await import("node:fs/promises")).readFile("src/app/api/lansia/profile/route.ts", "utf8");
  const canonicalRoute = await (await import("node:fs/promises")).readFile("src/app/api/lansia/route.ts", "utf8");
  assert.match(page, /DOCUMENT_ACCEPT/);
  assert.match(page, /IMAGE_ACCEPT/);
  assert.match(page, /KTP lansia wajib diunggah/);
  assert.match(page, /Bukti hubungan keluarga wajib diunggah/);
  assert.match(route, /KTP lansia dan bukti hubungan keluarga wajib diunggah/);
  assert.match(canonicalRoute, /hubungan_keluarga,[\s\S]*hubungan_keluarga,/);
});
