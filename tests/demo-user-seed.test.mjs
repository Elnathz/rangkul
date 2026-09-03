import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const seed = await readFile("supabase/seed.sql", "utf8");

test("seed memakai email utama demo yang singkat", () => {
  assert.match(seed, /'demokeluarga@rangkul\.id'/);
  assert.match(seed, /'demohelper@rangkul\.id'/);
  assert.match(seed, /'demokoordinator@rangkul\.id'/);
});

test("seed mengisi nomor telepon demo dengan format seluler Indonesia", () => {
  assert.match(seed, /phone_value/);
  const userRows = seed.slice(seed.indexOf("FROM (VALUES"), seed.indexOf(") AS data("));
  const phoneLiterals = [...userRows.matchAll(/'08\d{9,12}'/g)].map(([phone]) => phone);
  assert.ok(phoneLiterals.length >= 3, "seed harus punya minimal tiga nomor demo");
  assert.equal(new Set(phoneLiterals).size, phoneLiterals.length, "nomor demo tidak boleh duplikat");
});

test("seed mengisi alamat detail untuk akun demo termasuk pasangan Burgas", () => {
  assert.match(seed, /alamat_detail_value/);
  assert.match(seed, /rt_value/);
  assert.match(seed, /rw_value/);
  assert.match(seed, /kelurahan_value/);
  assert.match(seed, /kecamatan_value/);
  assert.match(seed, /kabupaten_kota_value/);
  assert.match(seed, /provinsi_value/);
  assert.match(seed, /'demokoordinator@rangkul\.id'[^\n]*'mbahburgas'[^\n]*'Jl\. Pleburan Barat No\. 18'[^\n]*3[^\n]*5/i);
  assert.match(seed, /'demohelper@rangkul\.id'[^\n]*'masburgas'[^\n]*'Jl\. Pleburan Barat No\. 28'[^\n]*3[^\n]*5/i);
});

test("seed menempatkan Koordinator dan Helper Burgas sebagai akun demo aktif", () => {
  const coreSeed = seed.slice(seed.indexOf("SELECT id INTO core_koordinator_user_id"));
  assert.match(coreSeed, /core_koordinator_user_id[\s\S]*'verified'/i);
  assert.match(coreSeed, /core_helper_user_id[\s\S]*'verified'/i);
  assert.match(coreSeed, /core_helper_user_id[\s\S]*is_available = TRUE/i);
});

test("seed tidak menabrak nomor unik milik akun lama", () => {
  assert.match(seed, /NOT EXISTS \([\s\S]*other_auth_user\.phone = user_data\.phone_value[\s\S]*other_auth_user\.id <> existing_user_id/i);
  assert.match(seed, /NOT EXISTS \([\s\S]*other_public_user\.phone = user_data\.phone_value[\s\S]*other_public_user\.id <> existing_user_id/i);
});
