import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync("src/app/(helper)/helper/verifikasi/page.tsx", "utf8");
const apiSource = fs.readFileSync("src/app/api/koordinator/by-region/route.ts", "utf8");

test("katalog Koordinator memakai wilayah profil dan empty state yang informatif", () => {
  assert.match(apiSource, /\.ilike\(["']users\.kelurahan["']/);
  assert.match(apiSource, /selectEligibleCoordinatorCandidates/);
  assert.match(source, /by-region/);
  assert.match(source, /role="status"/);
  assert.match(source, /Admin akan memeriksa/);
  assert.match(source, /Daftar Koordinator belum dapat dimuat/);
  assert.doesNotMatch(source, /-- Tidak ada Koordinator Tersedia --/);
});
