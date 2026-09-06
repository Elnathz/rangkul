import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("Helper dapat memperbarui availability melalui schema dan route profil", () => {
  const schema = read("src/lib/validations/helper.ts");
  const route = read("src/app/api/helper/profile/route.ts");

  assert.match(schema, /is_available:\s*z\.boolean\(\)\.optional\(\)/);
  assert.match(route, /input\.is_available !== undefined \? \{ is_available: input\.is_available \} : \{\}/);
  assert.match(route, /select\('id, status, wilayah_domisili, domisili_lat, domisili_lng, radius_layanan_km, is_available'\)/);
});

test("statistik Admin memuat antrean tindakan sebelum metrik platform", () => {
  const route = read("src/app/api/admin/stats/route.ts");

  assert.match(route, /pendingCoordinators/);
  assert.match(route, /underReviewHelpers/);
  assert.match(route, /pendingAppeals/);
  assert.match(route, /\.eq\("status", "pending_verification"\)/);
  assert.match(route, /\.eq\("status", "under_review"\)/);
  assert.match(route, /\.eq\("status", "menunggu"\)/);
});
