import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const seedScript = await readFile("scripts/seed.mjs", "utf8");

test("seed command menjalankan seed SQL idempoten tanpa reset database", () => {
  assert.equal(packageJson.scripts.seed, "node scripts/seed.mjs");
  assert.match(seedScript, /supabase/);
  assert.match(seedScript, /db.*query/);
  assert.match(seedScript, /--local/);
  assert.match(seedScript, /process\.env\.ComSpec\s*\|\|\s*["']cmd\.exe["']/);
  assert.match(seedScript, /\[npxExecutable, "supabase", \.\.\.args\]\.join\(" "\)/);
  assert.match(seedScript, /--linked/);
  assert.match(packageJson.scripts['seed:cloud'], /scripts\/seed\.mjs --linked/);
  assert.doesNotMatch(seedScript, /db.*reset/);
  assert.match(seedScript, /npx\.cmd/);
});
