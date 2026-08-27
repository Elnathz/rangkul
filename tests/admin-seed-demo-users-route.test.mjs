import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const route = await readFile("src/app/api/admin/seed-demo-users/route.ts", "utf8");

test("route memakai akun demo dengan email utama tanpa underscore", () => {
  assert.match(route, /demokeluarga@rangkul\.id/);
  assert.match(route, /mbahburgas@gmail\.com/);
  assert.match(route, /masburgas@gmail\.com/);
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
    "mbahburgas@gmail.com",
    "demokoordinator2@rangkul.id",
    "demokoordinator3@rangkul.id",
    "demokoordinator4@rangkul.id",
    "masburgas@gmail.com",
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
  assert.match(route, /\.from\('users'\)/);
  assert.doesNotMatch(route, /auth\.admin\.listUsers/);
});

test("route memakai username demo tanpa underscore", () => {
  for (const username of [
    "demokeluarga",
    "demokeluarga2",
    "demokeluarga3",
    "demokeluarga4",
    "demokoordinator2",
    "demokoordinator3",
    "demokoordinator4",
    "demohelper2",
    "demohelper3",
    "demohelper4",
    "demohelper5",
    "demohelper6",
    "demohelper7",
    "demohelper8",
    "demoadmin",
  ]) {
    assert.match(route, new RegExp(`username: '${username}'`));
  }

  assert.doesNotMatch(route, /demo_(keluarga|helper|koord|admin)/);
});

test("route mengisi nomor dan alamat rinci, kecuali dua akun Burgas", () => {
  assert.match(route, /phone: '08\d+'/);
  assert.match(route, /const authPhone = toAuthPhone\(demo\.phone\)/);
  assert.match(route, /phone: authPhone/);
  assert.match(route, /return `\+62\$\{phone\.slice\(1\)\}`/);
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
