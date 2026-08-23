import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("edit Helper mengambil kategori aktif beserta tingkat dari database", () => {
  const source = read("src/app/(helper)/helper/profil/edit/page.tsx");
  assert.match(source, /select\(['"]id, nama, tingkat['"]\)/);
  assert.doesNotMatch(source, /catNames:/);
  assert.match(source, /c\.tingkat === activeTier\.id/);
  assert.match(source, /helper\/profile/);
  assert.match(source, /Tidak ada perubahan/);
});

test("form profil keluarga dan koordinator memuat data akun database dan mencegah no-op submit", () => {
  for (const path of [
    "src/app/(keluarga)/beranda/profil/edit/page.tsx",
    "src/app/(koordinator)/koordinator/profil/edit/page.tsx",
  ]) {
    const source = read(path);
    assert.match(source, /from\(['"]users['"]\)/);
    assert.match(source, /parseRegionAddress/);
    assert.match(source, /Tidak ada perubahan/);
    assert.match(source, /initialRegion=\{form\.region\}/);
  }
});

test("edit lansia memakai endpoint kepemilikan dan mempertahankan koordinat kosong", () => {
  const source = read("src/app/(keluarga)/lansia/[id]/edit/page.tsx");
  assert.match(source, /fetch\(`\/api\/lansia\/\$\{id\}`/);
  assert.doesNotMatch(source, /\.from\(['"]lansia_profiles['"]\)\.update/);
  assert.match(source, /domisili_lat: data\.lat \?\? null/);
  assert.match(source, /Tidak ada perubahan/);
});

test("suspend Helper mencabut verifikasi fallback Admin", () => {
  const source = read("src/app/api/admin/helpers/[id]/route.ts");
  const suspendSource = read("src/app/api/admin/helpers/[id]/suspend/route.ts");
  assert.match(source, /verified_by_admin_fallback\s*=\s*false/);
  assert.match(suspendSource, /verified_by_admin_fallback: false/);
});
