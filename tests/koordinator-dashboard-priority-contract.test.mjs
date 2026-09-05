import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("dashboard Koordinator mendahulukan antrean tindakan dan tidak menambah syarat SKCK", () => {
  const page = readFileSync("src/app/(koordinator)/koordinator/dashboard/page.tsx", "utf8");

  assert.match(page, /Tindakan perlu ditangani/);
  assert.match(page, /Verifikasi Helper/);
  assert.match(page, /Persetujuan kunjungan/);
  assert.match(page, /Darurat aktif/);
  assert.match(page, /Laporan menunggu/);
  assert.match(page, /Aktivitas Wilayah Terbaru/);
  assert.match(page, /Helper terverifikasi/);
  assert.doesNotMatch(page, /rounded-2xl bg-primary p-6/);
  assert.doesNotMatch(page, /SKCK/i);
});
