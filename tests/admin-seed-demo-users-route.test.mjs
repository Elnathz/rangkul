import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const route = await readFile("src/app/api/admin/seed-demo-users/route.ts", "utf8");

test("route memakai akun demo dengan email utama tanpa underscore", () => {
  assert.match(route, /demokeluarga@rangkul\.id/);
  assert.match(route, /demohelper@rangkul\.id/);
  assert.match(route, /demokoordinator@rangkul\.id/);
  assert.doesNotMatch(route, /demo_keluarga@rangkul\.id/);
  assert.doesNotMatch(route, /demo_helper@rangkul\.id/);
  assert.doesNotMatch(route, /demo_koordinator@rangkul\.id/);
});

test("route memiliki matrix akun demo dan password yang sama", () => {
  for (const email of [
    "demokeluarga@rangkul.id",
    "demokeluarga2@rangkul.id",
    "demokeluarga3@rangkul.id",
    "demokeluarga4@rangkul.id",
    "demokoordinator@rangkul.id",
    "demokoordinator2@rangkul.id",
    "demokoordinator3@rangkul.id",
    "demokoordinator4@rangkul.id",
    "demohelper@rangkul.id",
    "demohelper2@rangkul.id",
    "demohelper3@rangkul.id",
    "demohelper4@rangkul.id",
    "demohelper5@rangkul.id",
    "demohelper6@rangkul.id",
    "demohelper7@rangkul.id",
    "demohelper8@rangkul.id",
    "demoadmin@rangkul.id",
  ]) {
    assert.match(route, new RegExp(email.replaceAll(".", "\\.")));
  }

  assert.match(route, /Rangkul2026\*/);
  assert.match(route, /auth\.admin\.createUser/);
  assert.match(route, /auth\.admin\.updateUserById/);
});

test("route mengisi nomor dan alamat rinci, kecuali dua akun Burgas", () => {
  assert.match(route, /phone: '08\d+'/);
  assert.match(route, /alamat_detail/);
  assert.match(route, /rt:/);
  assert.match(route, /rw:/);
  assert.match(route, /kelurahan:/);
  assert.match(route, /kecamatan:/);
  assert.match(route, /kabupaten_kota:/);
  assert.match(route, /provinsi:/);
  assert.match(route, /username: 'mbahburgas'[\s\S]*alamat_detail: null/);
  assert.match(route, /username: 'masburgas'[\s\S]*alamat_detail: null/);
});

test("route mempertahankan dua akun Burgas sebagai belum terverifikasi", () => {
  const burgasSection = route.slice(route.indexOf("mbahburgas"));
  assert.match(burgasSection, /pending_verification/);
  assert.match(burgasSection, /is_available: false/);
});
