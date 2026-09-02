import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(path, "utf8");

test("form pendaftaran menyimpan object path private dari response upload", async () => {
  const [lansia, helper, koordinator] = await Promise.all([
    read("src/app/(keluarga)/lansia/tambah/page.tsx"),
    read("src/app/(helper)/helper/verifikasi/page.tsx"),
    read("src/app/(koordinator)/koordinator/pengajuan/page.tsx"),
  ]);

  assert.match(lansia, /uploadData\.data\?\.path/);
  assert.doesNotMatch(lansia, /uploadData\.data\?\.url \|\| uploadData\.url/);
  assert.match(helper, /uploadData\.data\?\.path/);
  assert.match(koordinator, /uploadSkData\.data\?\.path/);
  assert.match(koordinator, /uploadKtpData\.data\?\.path/);
  assert.match(koordinator, /uploadFotoData\.data\?\.path/);
});

test("edit lansia tidak menyimpan signed URL berumur panjang", async () => {
  const page = await read("src/app/(keluarga)/lansia/[id]/edit/page.tsx");
  assert.match(page, /formData\.append\(["']docType["'], ["']foto_lansia["']\)/);
  assert.match(page, /uploadData\.data\.path/);
  assert.doesNotMatch(page, /createSignedUrl\(fileName/);
});

test("validasi profil lansia dan Koordinator menerima referensi storage private", async () => {
  const [lansia, koordinator] = await Promise.all([
    read("src/lib/validations/lansia.ts"),
    read("src/lib/validations/koordinator.ts"),
  ]);
  assert.match(lansia, /privateStorageReferenceSchema/);
  assert.match(koordinator, /privateStorageReferenceSchema/);
});

test("reader task dan daftar kunjungan menandatangani foto private setelah scope actor", async () => {
  const paths = [
    "src/app/(helper)/tugas/page.tsx",
    "src/app/(helper)/tugas/[id]/page.tsx",
    "src/app/(keluarga)/kunjungan/page.tsx",
    "src/app/api/tasks/[id]/route.ts",
  ];
  const sources = await Promise.all(paths.map(read));
  for (const source of sources) {
    assert.match(source, /resolvePrivatePhotoUrl/);
    assert.match(source, /createSignedUrl/);
  }
});

test("detail lansia menandatangani foto dan dokumen hanya setelah ownership", async () => {
  const route = await read("src/app/api/lansia/[id]/route.ts");
  assert.match(route, /resolvePrivatePhotoUrl/);
  assert.match(route, /createAdminClient/);
  assert.match(route, /dokumen_identitas_lansia_url/);
  assert.match(route, /dokumen_hubungan_keluarga_url/);
  assert.doesNotMatch(route, /createApiError\('server_error', (?:updateError|deleteError)\.message/);
});
