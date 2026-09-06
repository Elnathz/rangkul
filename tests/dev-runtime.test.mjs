import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("development server uses the stable webpack bundler", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(packageJson.scripts.dev, "next dev --webpack");
});
