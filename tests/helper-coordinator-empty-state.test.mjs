import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync("src/app/(helper)/helper/verifikasi/page.tsx", "utf8");

test("katalog Koordinator memakai wilayah profil dan empty state yang informatif", () => {
  assert.match(source, /\.ilike\(['"]wilayah['"]/);
  assert.match(source, /role="status"/);
  assert.match(source, /Admin akan memeriksa/);
  assert.match(source, /Daftar Koordinator belum dapat dimuat/);
  assert.doesNotMatch(source, /-- Tidak ada Koordinator Tersedia --/);
});
