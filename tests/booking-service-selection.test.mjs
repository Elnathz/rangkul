import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const selector = readFileSync("src/components/keluarga/booking/CustomServiceTierSelect.tsx", "utf8");
const quickForm = readFileSync("src/components/keluarga/booking/QuickBookingForm.tsx", "utf8");

test("pemilih layanan menjelaskan pilihan tanpa label teknis atau tanda kurung", () => {
  assert.match(selector, /Layanan terpilih/);
  assert.match(selector, /Estimasi durasi/);
  assert.match(selector, /Harga dasar/);
  assert.match(selector, /Perlu persetujuan Koordinator/);
  assert.doesNotMatch(quickForm, /Kategori Layanan \(Non-High Risk\)/);
  assert.doesNotMatch(quickForm, /non-high risk \(Tingkat Ringan atau Sedang\)/i);
});

test("ServiceSelectionModal memakai grid 3 kolom pada desktop dan 1 kolom pada mobile", () => {
  const modal = readFileSync("src/components/services/ServiceSelectionModal.tsx", "utf8");
  assert.match(modal, /grid-cols-1/);
  assert.match(modal, /sm:grid-cols-2/);
  assert.match(modal, /lg:grid-cols-3/);
  assert.match(modal, /max-w-5xl/);
});

test("Cari Helper mengadopsi DateTimePicker, LansiaSelect, dan CustomServiceTierSelect", () => {
  const cariHelper = readFileSync("src/app/(keluarga)/cari-helper/page.tsx", "utf8");
  assert.match(cariHelper, /<DateTimePicker/);
  assert.match(cariHelper, /<LansiaSelect/);
  assert.match(cariHelper, /allowEmpty=\{true\}/);
  assert.match(cariHelper, /<CustomServiceTierSelect/);
  assert.doesNotMatch(cariHelper, /<input[^>]*type="datetime-local"/);
});

test("TaskScheduleActions mengadopsi DateTimePicker", () => {
  const reschedule = readFileSync("src/components/keluarga/TaskScheduleActions.tsx", "utf8");
  assert.match(reschedule, /<DateTimePicker/);
  assert.doesNotMatch(reschedule, /type="datetime-local"/);
});

