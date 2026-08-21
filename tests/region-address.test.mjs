import assert from "node:assert/strict";
import test from "node:test";
import { getRegionParts, parseRegionAddress } from "../src/lib/region-address.ts";

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
