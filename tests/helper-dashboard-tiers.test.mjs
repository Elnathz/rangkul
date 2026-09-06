import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/(helper)/helper/dashboard/page.tsx", "utf8");

test("dashboard Helper mengambil tingkat dan is_high_risk pada kategori", () => {
  assert.match(page, /tingkat/);
  assert.match(page, /is_high_risk/);
  assert.match(page, /ServiceTiersTabs/);
});

test("dashboard Helper memakai kontainer max-w-6xl dan rounded-2xl", () => {
  assert.match(page, /max-w-6xl/);
  assert.match(page, /rounded-2xl/);
  assert.doesNotMatch(page, /max-w-5xl/);
});
