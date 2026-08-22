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

  const clientPages = [
    "src/app/(keluarga)/beranda/profil/edit/page.tsx",
    "src/app/(helper)/helper/profil/edit/page.tsx",
    "src/app/(koordinator)/koordinator/profil/edit/page.tsx",
  ];

  for (const clientPage of clientPages) {
    const source = fs.readFileSync(path.join(root, clientPage), "utf8");
    const renderSection = source.slice(
      source.indexOf("export default function"),
      source.indexOf("useEffect("),
    );
    assert.doesNotMatch(renderSection, /const supabase = createClient\(\);/);
  }
});

test("semua migration Supabase memiliki versi yang unik", () => {
  const migrationDirectory = path.join(root, "supabase/migrations");
  const migrationFiles = fs
    .readdirSync(migrationDirectory)
    .filter((fileName) => fileName.endsWith(".sql"));
  const versions = migrationFiles.map((fileName) => fileName.split("_", 1)[0]);

  assert.equal(new Set(versions).size, versions.length);
});
