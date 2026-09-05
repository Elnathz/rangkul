import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  selectEligibleCoordinatorCandidates,
  validateSelectedCoordinator,
} from "../src/lib/coordinator-region.ts";

const region = {
  kelurahan: "Pleburan",
  kecamatan: "Semarang Selatan",
  kabupaten_kota: "Kota Semarang",
  provinsi: "Jawa Tengah",
  rt: 3,
  rw: 5,
};

function candidate(id, tingkat, rt, rw = 5, kelurahan = "Pleburan") {
  return {
    id,
    tingkat,
    wilayah: `${tingkat.toUpperCase()} ${tingkat === "rt" ? `${rt} / ` : ""}RW ${rw}, Kelurahan ${kelurahan}`,
    users: {
      full_name: `Koordinator ${id}`,
      kelurahan,
      kecamatan: "Semarang Selatan",
      kabupaten_kota: "Kota Semarang",
      provinsi: "Jawa Tengah",
      rt,
      rw,
    },
  };
}

test("endpoint GET /api/koordinator/by-region terdefinisi dan aman", () => {
  const file = readFileSync("src/app/api/koordinator/by-region/route.ts", "utf8");

  assert.match(file, /export async function GET/);
  assert.match(file, /auth\.getUser\(\)/);
  assert.match(file, /createAdminClient/);
  assert.match(file, /userProfile\.role !== ["']helper["']/);
  assert.match(file, /searchParams\.get\(["']rt["']\)/);
  assert.match(file, /searchParams\.get\(["']rw["']\)/);
  assert.match(file, /eq\("status", "verified"\)/);
  assert.match(file, /users!koordinator_profiles_user_id_fkey!inner\([\s\S]*full_name[\s\S]*kelurahan[\s\S]*rt[\s\S]*rw[\s\S]*\)/);
  assert.match(file, /selectEligibleCoordinatorCandidates/);
  assert.doesNotMatch(file, /phone/); // Melindungi data pribadi nomor telepon
});

test("halaman helper verifikasi memanggil API by-region dan tidak query koordinator_profiles langsung", () => {
  const page = readFileSync("src/app/(helper)/helper/verifikasi/page.tsx", "utf8");

  assert.match(page, /\/api\/koordinator\/by-region/);
  assert.match(page, /params\.set\(['"]rt['"]/);
  assert.match(page, /params\.set\(['"]rw['"]/);
  assert.doesNotMatch(page, /supabase[\s\S]*?\.from\('koordinator_profiles'\)/);
});

test("submit Helper memvalidasi Koordinator pilihan terhadap wilayah canonical", () => {
  const route = readFileSync("src/app/api/helper/apply/route.ts", "utf8");

  assert.match(route, /validateSelectedCoordinator/);
  assert.match(route, /Koordinator pilihan tidak sesuai dengan RT\/RW domisili Helper/);
});

test("Koordinator RT exact diprioritaskan atas Koordinator RW", () => {
  const rtExact = candidate("rt-exact", "rt", 3);
  const rtLain = candidate("rt-lain", "rt", 4);
  const rwFallback = candidate("rw-fallback", "rw", null);

  assert.deepEqual(
    selectEligibleCoordinatorCandidates([rwFallback, rtLain, rtExact], region).map((item) => item.id),
    ["rt-exact"],
  );
  assert.equal(validateSelectedCoordinator([rwFallback, rtExact], region, "rw-fallback"), false);
});

test("Koordinator RW dipakai hanya saat RT exact tidak tersedia", () => {
  const rwFallback = candidate("rw-fallback", "rw", null);
  const bedaKelurahan = candidate("beda-kelurahan", "rt", 3, 5, "Lamper Lor");

  assert.deepEqual(
    selectEligibleCoordinatorCandidates([bedaKelurahan, rwFallback], region).map((item) => item.id),
    ["rw-fallback"],
  );
  assert.equal(validateSelectedCoordinator([rwFallback], region, "rw-fallback"), true);
});
