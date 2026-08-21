import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const modal = fs.readFileSync(new URL("../src/components/ui/ImagePreviewModal.tsx", import.meta.url), "utf8");

test("image preview modal memakai visual surface Rangkul yang terang", () => {
  assert.doesNotMatch(modal, /bg-slate-950/);
  assert.doesNotMatch(modal, /bg-slate-900/);
  assert.match(modal, /bg-white/);
  assert.match(modal, /bg-slate-50/);
  assert.match(modal, /border-blue-100/);
});

test("kontrol image preview tetap aksesibel dan responsif", () => {
  assert.match(modal, /aria-label="Kontrol zoom gambar"/);
  assert.match(modal, /aria-label="Perkecil gambar"/);
  assert.match(modal, /aria-label="Perbesar gambar"/);
  assert.match(modal, /max-w-full/);
  assert.match(modal, /focus-visible:ring/);
});
