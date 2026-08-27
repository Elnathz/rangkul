import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync("src/app/(admin)/admin/categories/page.tsx", "utf8");

test("Admin menampilkan kontrol risiko dengan dampak approval yang jelas", () => {
  assert.match(source, /Risiko tinggi, wajib approval Koordinator/);
  assert.match(source, /is_high_risk: form\.is_high_risk/);
});

test("Admin menyediakan tabs filter untuk semua tingkat layanan", () => {
  assert.match(source, /role="tablist"/);
  assert.match(source, /Semua/);
  assert.match(source, /Ringan/);
  assert.match(source, /Sedang/);
  assert.match(source, /Berat/);
  assert.match(source, /visibleCategories/);
});
