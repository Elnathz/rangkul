import assert from "node:assert/strict";
import test from "node:test";
import { formatRegionName, getRegionParts, parseRegionAddress } from "../src/lib/region-address.ts";

test("alamat wilayah dipecah dalam urutan administratif yang benar", () => {
  const result = parseRegionAddress("Pleburan, Semarang Selatan, Kota Semarang, Jawa Tengah | RT 1/RW 5 | Jl. Pleburan No. 1");

  assert.deepEqual(result, {
    kelurahan: "Pleburan",
    kecamatan: "Semarang Selatan",
    kotaKabupaten: "Kota Semarang",
    provinsi: "Jawa Tengah",
    rt: "1",
    rw: "5",
    detail: "Jl. Pleburan No. 1",
  });
  assert.deepEqual(getRegionParts("Pleburan, Semarang Selatan, Kota Semarang, Jawa Tengah | RT 1/RW 5 | Jl. Pleburan No. 1"), [
    "RT 1/RW 5",
    "Pleburan",
    "Semarang Selatan",
    "Kota Semarang",
    "Jawa Tengah",
  ]);
});

test("alamat seed lama dengan label administratif juga bisa dipakai ulang di form edit", () => {
  assert.deepEqual(parseRegionAddress("RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah"), {
    kelurahan: "Pleburan",
    kecamatan: "Semarang Selatan",
    kotaKabupaten: "Kota Semarang",
    provinsi: "Jawa Tengah",
    rt: "03",
    rw: "05",
    detail: "",
  });
});

test("nama wilayah uppercase dinormalisasi untuk tampilan", () => {
  assert.equal(formatRegionName("KABUPATEN GROBOGAN"), "Kabupaten Grobogan");
  assert.equal(formatRegionName("PURWODADI"), "Purwodadi");
  assert.equal(formatRegionName("RT 03/RW 05"), "RT 03/RW 05");
});
