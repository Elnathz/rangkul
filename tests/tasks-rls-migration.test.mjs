import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const migration = fs.readFileSync(
  new URL("../supabase/migrations/20260821162000_tasks_rls.sql", import.meta.url),
  "utf8",
);

test("task RLS migration aman dijalankan ulang ketika policy sudah ada", () => {
  const policies = [
    ["Keluarga can insert own tasks", "public.tasks"],
    ["Keluarga can select own tasks", "public.tasks"],
    ["Keluarga can update own tasks", "public.tasks"],
    ["Keluarga can insert extra services", "public.task_extra_services"],
    ["Keluarga can select extra services", "public.task_extra_services"],
  ];

  for (const [policyName, tableName] of policies) {
    const escapedName = policyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedTable = tableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(
      migration,
      new RegExp(
        `DROP POLICY IF EXISTS "${escapedName}" ON ${escapedTable};[\\s\\S]*CREATE POLICY "${escapedName}"`,
      ),
    );
  }
});
