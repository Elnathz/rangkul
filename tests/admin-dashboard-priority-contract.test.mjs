import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/(admin)/admin/dashboard/page.tsx", "utf8");

test("dashboard Admin menaruh action inbox sebelum metrik platform", () => {
  assert.match(page, /Antrean tindakan/);
  assert.match(page, /pendingCoordinators/);
  assert.match(page, /underReviewHelpers/);
  assert.match(page, /pendingAppeals/);
  assert.match(page, /Perlu Tindakan/);
  assert.match(page, /Koordinator menunggu verifikasi/);
  assert.match(page, /Helper perlu ditinjau/);
  assert.ok(page.indexOf("Antrean tindakan") < page.indexOf('aria-label="Ringkasan platform"'));
});

test("audit log Admin memakai nama aksi dan tidak menjadikan UUID sebagai copy utama", () => {
  assert.match(page, /humanizeAuditAction/);
  assert.doesNotMatch(page, /\{log\.entity_type\} · \{log\.entity_id/);
});
