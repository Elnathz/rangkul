import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("OpenAPI Rangkul dapat diparse dan mencakup kontrak assignment Sprint 6", () => {
  const spec = JSON.parse(read("docs/api/openapi.json"));

  assert.equal(spec.openapi, "3.1.0");
  assert.equal(spec.info.title, "Rangkul API");

  for (const path of [
    "/api/tasks",
    "/api/tasks/marketplace",
    "/api/tasks/{id}/accept",
    "/api/tasks/{id}/applications",
    "/api/tasks/{id}/applications/me",
    "/api/tasks/{id}/applications/{application_id}/select",
  ]) {
    assert.ok(spec.paths[path], `${path} wajib terdokumentasi`);
  }

  const createTask = spec.paths["/api/tasks"].post;
  assert.deepEqual(createTask["x-rangkul-roles"], ["keluarga"]);
  assert.ok(createTask.responses["422"]);
  assert.ok(spec.paths["/api/tasks/{id}/accept"].patch.responses["409"]);
  assert.equal(spec.paths["/api/tasks/{id}/accept"].post, undefined);
  const marketplaceLimit = spec.paths["/api/tasks/marketplace"].get.parameters.find(
    (parameter) => parameter.name === "limit",
  );
  assert.equal(marketplaceLimit.schema.maximum, 50);
  assert.equal(marketplaceLimit.schema.default, 20);
});

test("indeks API menjelaskan auth, error, feature flag, dan sumber kebenaran", () => {
  const index = read("docs/api/README.md");
  const contract = read("docs/api-contract.md");
  const booking = read("docs/api/booking.md");
  const helper = read("docs/api/helper.md");
  const rootReadme = read("README.md");
  const helperApplyRoute = read("src/app/api/helper/apply/route.ts");

  assert.match(index, /OpenAPI 3\.1/);
  assert.match(index, /docs\/TDD_Rangkul\.md/);
  assert.match(index, /401[\s\S]*403[\s\S]*404[\s\S]*409[\s\S]*422/);
  assert.match(contract, /## Kontrak Sprint 6/);
  assert.match(contract, /SPRINT6_MATCHING_ENABLED/);
  assert.match(booking, /langsung[\s\S]*pelamar[\s\S]*cepat/);
  assert.doesNotMatch(booking, /selesai_dikerjakan|diverifikasi_lansia|kadaluarsa/);
  assert.match(helper, /POST \/api\/helpers\/apply/);
  assert.match(helper, /PATCH \/api\/helper\/profile/);
  assert.match(rootReadme, /docs\/api\/openapi\.json/);
  assert.match(helperApplyRoute, /fieldErrors:[\s\S]*?422/);
});
