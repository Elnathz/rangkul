import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const [seed, route] = await Promise.all([
  readFile("supabase/seed.sql", "utf8"),
  readFile("src/app/api/admin/seed-demo-users/route.ts", "utf8"),
]);

const expectedPersonas = [
  "ratnakeluarga@rangkul.id",
  "mayakeluarga@rangkul.id",
  "rintokeluarga@rangkul.id",
  "dewikeluarga@rangkul.id",
  "suryakeluarga@rangkul.id",
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
  "wagimankoordinator@rangkul.id",
  "budikoordinator@rangkul.id",
  "sulikoordinator@rangkul.id",
  "aguskoordinator@rangkul.id",
  "rahmatkoordinator@rangkul.id",
  "darmokoordinator@rangkul.id",
];

test("seed SQL dan reseed Admin memakai persona natural yang sama", () => {
  for (const email of expectedPersonas) {
    const emailPattern = new RegExp(email.replaceAll(".", "\\."));
    assert.match(seed, emailPattern, `${email} harus ada di seed SQL`);
    assert.match(route, emailPattern, `${email} harus ada di reseed Admin`);
  }

  assert.doesNotMatch(seed, /demohelper\d+@rangkul\.id|demokeluarga\d+@rangkul\.id|demokoordinator\d+@rangkul\.id/);
  assert.doesNotMatch(route, /demohelper\d+@rangkul\.id|demokeluarga\d+@rangkul\.id|demokoordinator\d+@rangkul\.id/);
});

test("seed membedakan RT, RW, dan kelurahan tanpa menghapus area demo utama", () => {
  for (const rt of ["RT 01 / RW 05", "RT 02 / RW 05", "RT 03 / RW 05", "RT 04 / RW 05", "RT 05 / RW 05"]) {
    assert.match(seed, new RegExp(rt));
  }

  for (const source of [seed, route]) {
    assert.match(source, /Kelurahan Pleburan/);
    assert.match(source, /Kelurahan Kedungpane/);
    assert.match(source, /Kecamatan Mijen/);
    assert.match(source, /RT 01 \/ RW 02/);
  }
});

test("seed Auth membuat identity email agar persona baru dapat login", () => {
  assert.match(seed, /INSERT INTO auth\.identities/);
  assert.match(seed, /'email',\s*existing_user_id::text/);
  assert.match(seed, /jsonb_build_object\(\s*'sub', existing_user_id::text/);
  assert.doesNotMatch(seed, /provider_id, user_id, identity_data, provider, created_at, updated_at, email/);
  assert.match(seed, /confirmation_token, recovery_token, email_change_token_new, email_change/);
  assert.match(seed, /confirmation_token = '',\s*recovery_token = '',\s*email_change_token_new = '',\s*email_change = ''/);
});

test("fixture task utama mengikuti Keluarga dan Helper persona yang dapat login", () => {
  assert.match(seed, /SELECT id INTO keluarga_1_id[\s\S]*LOWER\(username\) = 'ratnakeluarga'/);
  assert.match(seed, /UPDATE public\.tasks[\s\S]*keluarga_id = CASE catatan/);
  assert.match(seed, /'\[DEMO_MATRIX\] Task dikonfirmasi' THEN helper_1_id/);
  assert.match(seed, /'\[DEMO_MATRIX\] Task dikerjakan' THEN helper_2_id/);
});

test("seed menyediakan fixture deterministik untuk seluruh mode penugasan Sprint 6", () => {
  for (const marker of [
    "[DEMO_SPRINT6] Task pelamar terbuka",
    "[DEMO_SPRINT6] Task pelamar terpilih",
    "[DEMO_SPRINT6] Task cepat aktif",
    "[DEMO_SPRINT6] Task cepat kedaluwarsa",
  ]) {
    assert.match(seed, new RegExp(marker.replaceAll("[", "\\[").replaceAll("]", "\\]")));
  }

  assert.match(seed, /INSERT INTO public\.task_applications/);
  assert.match(seed, /'\[DEMO_SPRINT6\] Task pelamar terbuka'/);
  assert.match(seed, /'\[DEMO_SPRINT6\] Task pelamar terpilih'/);
  assert.match(seed, /'pending'::public\.task_application_status/);
  assert.match(seed, /'selected'::public\.task_application_status/);
  assert.match(seed, /'rejected'::public\.task_application_status/);
});
