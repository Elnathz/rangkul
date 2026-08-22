import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

test("heartbeat Supabase membaca secret production dan memvalidasinya", () => {
  const workflow = fs.readFileSync(
    path.join(root, ".github/workflows/heartbeat.yml"),
    "utf8",
  );

  assert.match(workflow, /environment:\s*production/);
  assert.match(workflow, /Missing GitHub Actions secrets/);
  assert.match(workflow, /SUPABASE_PROJECT_ID/);
  assert.match(workflow, /SUPABASE_SERVICE_ROLE_KEY/);
});

test("deployment production memakai Vercel CLI yang diperbarui", () => {
  const workflow = fs.readFileSync(
    path.join(root, ".github/workflows/deploy.yml"),
    "utf8",
  );

  assert.doesNotMatch(workflow, /amondnet\/vercel-action/);
  assert.match(workflow, /npm install --global vercel@latest/);
  assert.match(workflow, /vercel pull --yes --environment=production/);
  assert.match(workflow, /vercel build --prod/);
  assert.match(workflow, /vercel deploy --prebuilt --prod/);
});
