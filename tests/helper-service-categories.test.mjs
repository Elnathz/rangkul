import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const helperSource = fs.readFileSync("src/app/(helper)/helper/verifikasi/page.tsx", "utf8");
const multiSelectSource = fs.readFileSync("src/components/helper/HelperCategoryMultiSelect.tsx", "utf8");

test("verifikasi Helper mengelompokkan semua kategori aktif berdasarkan tingkat database", () => {
  assert.match(helperSource, /select\(['"]id, nama, tingkat, parent_id, is_active/);
  assert.match(helperSource, /HelperCategoryMultiSelect/);
  assert.match(multiSelectSource, /cat\.tingkat === activeTab/);
  assert.doesNotMatch(helperSource, /catNames:/);
  assert.doesNotMatch(multiSelectSource, /catNames:/);
  assert.match(helperSource, /\{dbCategories\.length\} layanan aktif tersedia/);
  assert.match(helperSource, /Kategori induk/);
  assert.match(helperSource, /getSelectableServiceCategories/);
});
