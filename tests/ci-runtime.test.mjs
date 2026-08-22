import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

test("CI dan deployment memakai runtime yang mendukung TypeScript stripping", () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8"),
  );
  const workflowFiles = [".github/workflows/ci.yml", ".github/workflows/deploy.yml"];

  assert.equal(packageJson.engines?.node, ">=22.6.0");
  assert.match(packageJson.scripts.test, /--experimental-strip-types/);

  for (const workflowFile of workflowFiles) {
    const workflow = fs.readFileSync(path.join(root, workflowFile), "utf8");
    assert.match(workflow, /node-version:\s*['"]22['"]/);
  }
});
