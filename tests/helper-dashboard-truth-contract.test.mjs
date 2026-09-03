import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/(helper)/helper/dashboard/page.tsx", "utf8");

test("dashboard Helper menggunakan availability dan status task yang dibagikan", () => {
  assert.match(page, /is_available/);
  assert.match(page, /AvailabilityToggle/);
  assert.match(page, /getTaskStatusPresentation/);
  assert.match(page, /Tugas berikutnya/);
  assert.match(page, /Ringkasan kerja/);
  assert.ok(page.indexOf("Tugas berikutnya") < page.indexOf("Ringkasan kerja"));
  assert.doesNotMatch(page, /Estimasi Fee/);
  assert.doesNotMatch(page, /href: '#'/);
});

test("dashboard Helper menjelaskan jangkauan aktual tanpa copy teknis", () => {
  assert.match(page, /radius_layanan_km/);
  assert.match(page, /wilayah_domisili/);
  assert.match(page, /helper_service_categories/);
  assert.match(page, /Jangkauan layanan/);
  assert.match(page, /Atur jangkauan/);
  assert.doesNotMatch(page, /Aksi mengikuti status kunjungan dari server\./);
  assert.doesNotMatch(page, /Eligibility tetap diperiksa oleh server\./);
});
