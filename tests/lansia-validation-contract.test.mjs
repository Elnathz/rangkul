import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("lansia validation schema enforces realistic upper limits on umur, nama, alamat, rt, rw, catatan", () => {
  const schemaFile = readFileSync("src/lib/validations/lansia.ts", "utf8");

  // Umur bounds
  assert.match(schemaFile, /umur:.*min\(50/);
  assert.match(schemaFile, /max\(130/);

  // Nama bounds
  assert.match(schemaFile, /nama:.*min\(2/);
  assert.match(schemaFile, /max\(100/);

  // RT and RW bounds
  assert.match(schemaFile, /rt:.*min\(1/);
  assert.match(schemaFile, /rt:.*max\(999/);
  assert.match(schemaFile, /rw:.*min\(1/);
  assert.match(schemaFile, /rw:.*max\(999/);

  // Alamat bounds
  assert.match(schemaFile, /alamat:.*max\(255/);

  // Catatan & kebutuhan khusus bounds
  assert.match(schemaFile, /catatan_kondisi:.*max\(1000/);
  assert.match(schemaFile, /kebutuhan_khusus:.*max\(1000/);
});

test("tambah lansia page enforces input max/maxLength and range validation", () => {
  const page = readFileSync("src/app/(keluarga)/lansia/tambah/page.tsx", "utf8");

  // Input attributes
  assert.match(page, /id="nama"[^>]*maxLength=\{100\}/);
  assert.match(page, /id="umur"[^>]*min=\{50\}[^>]*max=\{130\}/);
  assert.match(page, /id="rt"[^>]*min=\{1\}[^>]*max=\{999\}/);
  assert.match(page, /id="rw"[^>]*min=\{1\}[^>]*max=\{999\}/);
  assert.match(page, /id="alamat"[^>]*maxLength=\{255\}/);

  // Step 1 JS validation
  assert.match(page, /umurNum < 50 \|\| umurNum > 130/);
  assert.match(page, /form\.nama\.trim\(\)\.length < 2 \|\| form\.nama\.trim\(\)\.length > 100/);
});

test("edit lansia page enforces input max/maxLength and range validation", () => {
  const page = readFileSync("src/app/(keluarga)/lansia/[id]/edit/page.tsx", "utf8");

  // Input attributes
  assert.match(page, /value=\{form\.nama\}[^>]*maxLength=\{100\}/);
  assert.match(page, /type="number"[^>]*min=\{50\}[^>]*max=\{130\}/);
  assert.match(page, /max=\{999\}[^>]*value=\{form\.rt\}/);
  assert.match(page, /max=\{999\}[^>]*value=\{form\.rw\}/);
  assert.match(page, /value=\{form\.alamat\}[^>]*maxLength=\{255\}/);

  // Submit JS validation
  assert.match(page, /umurNum < 50 \|\| umurNum > 130/);
  assert.match(page, /form\.nama\.trim\(\)\.length < 2 \|\| form\.nama\.trim\(\)\.length > 100/);
});
