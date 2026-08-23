import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const helperSource = fs.readFileSync("src/app/(helper)/helper/verifikasi/page.tsx", "utf8");

test("verifikasi Helper mengelompokkan semua kategori aktif berdasarkan tingkat database", () => {
  assert.match(helperSource, /select\(['"]id, nama, tingkat['"]\)/);
  assert.match(helperSource, /c\.tingkat === activeTier\.id/);
  assert.doesNotMatch(helperSource, /catNames:/);
});
