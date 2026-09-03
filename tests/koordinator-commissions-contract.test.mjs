import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync("src/app/api/koordinator/commissions/route.ts", "utf8");

test("ringkasan komisi memakai aggregate seluruh filter, bukan item halaman", () => {
  assert.match(route, /let summaryQuery/);
  assert.match(route, /data: summaryRows, error: summaryError/);
  assert.ok(route.indexOf("summaryRows") < route.indexOf("totalCommission"));
  assert.doesNotMatch(route, /const totalCommission = items\.reduce/);
});
