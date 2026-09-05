import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const route = await readFile("src/app/api/admin/seed-demo-users/route.ts", "utf8");

test("route seed hanya dapat dijalankan oleh Admin yang terautentikasi", () => {
  assert.match(route, /await requireAdmin\(\)/);
  assert.match(route, /adminAuthErrorResponse/);
});

test("route memakai persona demo utama dengan username dan email yang mudah dibaca", () => {
  assert.match(route, /ratnakeluarga@rangkul\.id/);
  assert.match(route, /wagimankoordinator@rangkul\.id/);
  assert.match(route, /andihelper@rangkul\.id/);
  assert.doesNotMatch(route, /demo_keluarga@rangkul\.id/);
  assert.doesNotMatch(route, /demo_helper@rangkul\.id/);
  assert.doesNotMatch(route, /demo_koordinator@rangkul\.id/);
});

test("route memiliki matrix akun demo dan password yang sama", () => {
  for (const email of [
    "ratnakeluarga@rangkul.id",
    "mayakeluarga@rangkul.id",
    "rintokeluarga@rangkul.id",
    "dewikeluarga@rangkul.id",
    "suryakeluarga@rangkul.id",
    "wagimankoordinator@rangkul.id",
    "budikoordinator@rangkul.id",
    "sulikoordinator@rangkul.id",
    "aguskoordinator@rangkul.id",
    "rahmatkoordinator@rangkul.id",
    "darmokoordinator@rangkul.id",
    "andihelper@rangkul.id",
    "rinihelper@rangkul.id",
    "dedihelper@rangkul.id",
    "sarihelper@rangkul.id",
    "yusufhelper@rangkul.id",
    "dewihelper@rangkul.id",
    "arifhelper@rangkul.id",
    "linahelper@rangkul.id",
    "fajarhelper@rangkul.id",
    "bagushelper@rangkul.id",
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
    "ratnakeluarga",
    "mayakeluarga",
    "rintokeluarga",
    "dewikeluarga",
    "suryakeluarga",
    "budikoordinator",
    "sulikoordinator",
    "aguskoordinator",
    "rahmatkoordinator",
    "darmokoordinator",
    "wagimankoordinator",
    "andihelper",
    "rinihelper",
    "dedihelper",
    "sarihelper",
    "yusufhelper",
    "dewihelper",
    "arifhelper",
    "linahelper",
    "fajarhelper",
    "bagushelper",
    "demoadmin",
  ]) {
    assert.match(route, new RegExp(`username: '${username}'`));
  }

  assert.doesNotMatch(route, /demo_(keluarga|helper|koord|admin)/);
});

test("route mengisi nomor dan alamat rinci, kecuali Helper dan Koordinator utama", () => {
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
  assert.match(route, /username: 'wagimankoordinator'[\s\S]*alamat_detail: null/);
  assert.match(route, /username: 'andihelper'[\s\S]*alamat_detail: null/);
});

test("route mempertahankan persona utama keluarga, Helper, dan Koordinator", () => {
  assert.match(route, /Ratna Wulandari/);
  assert.match(route, /Andi Sudarto/);
  assert.match(route, /Wagiman Popo/);
});
