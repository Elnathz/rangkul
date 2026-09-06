import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("overview lansia terintegrasi di profil keluarga dan /lansia mengarahkan ke sana", () => {
  const route = "src/app/(keluarga)/lansia/page.tsx";

  assert.equal(existsSync(route), true);
  const page = read(route);
  assert.match(page, /redirect\("\/beranda\/profil"\)/);

  const profilePage = read("src/app/(keluarga)/beranda/profil/page.tsx");
  assert.match(profilePage, /from\("lansia_profiles"\)/);
  assert.match(profilePage, /href="\/lansia\/tambah"/);
  assert.match(profilePage, /href=\{`\/lansia\/\$\{lansia\.id\}`\}/);
});

test("route persetujuan canonical bukan placeholder", () => {
  const page = read("src/app/(koordinator)/koordinator/persetujuan/page.tsx");

  assert.doesNotMatch(page, /tahap pengembangan/i);
  assert.match(page, /antrean-persetujuan\/page/);
});
