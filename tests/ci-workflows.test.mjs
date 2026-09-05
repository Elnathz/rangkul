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

test("CI memeriksa pull request menuju main dan develop", () => {
  const workflow = fs.readFileSync(
    path.join(root, ".github/workflows/ci.yml"),
    "utf8",
  );

  const pullRequestSection = workflow.match(/pull_request:\s*\n\s*branches:\s*\n(?<branches>(?:\s*-\s*\w+\s*\n?)+)/);
  assert.ok(pullRequestSection?.groups?.branches);
  assert.match(pullRequestSection.groups.branches, /-\s*main/);
  assert.match(pullRequestSection.groups.branches, /-\s*develop/);
});

test("heartbeat hanya melakukan health ping pada jadwal Senin dan Kamis", () => {
  const workflow = fs.readFileSync(
    path.join(root, ".github/workflows/heartbeat.yml"),
    "utf8",
  );

  assert.match(workflow, /cron:\s*['"]0 3 \* \* 1,4['"]/);
  assert.doesNotMatch(workflow, /expire_pending_tasks|auto_release_held_payments/);
});

test("scheduled jobs memisahkan expiry dan auto-release dari heartbeat", () => {
  const workflow = fs.readFileSync(
    path.join(root, ".github/workflows/scheduled-jobs.yml"),
    "utf8",
  );

  assert.match(workflow, /cron:\s*['"]\*\/5 \* \* \* \*['"]/);
  assert.match(workflow, /Missing GitHub Actions secrets/);
  assert.match(workflow, /expire_pending_tasks/);
  assert.match(workflow, /auto_release_held_payments/);
  assert.match(workflow, /curl --fail --silent --show-error/);
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
