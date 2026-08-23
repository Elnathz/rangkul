import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const migration = fs.readFileSync(
  new URL("../supabase/migrations/20260801121120_initial_schema.sql", import.meta.url),
  "utf8",
);

test("baseline membangun policy task setelah schema public dibersihkan", () => {
  const policies = [
    ["Keluarga can create own tasks", "public.tasks"],
    ["Keluarga can read own tasks", "public.tasks"],
    ["Keluarga can update own tasks", "public.tasks"],
    ["Keluarga can insert extra services", "public.task_extra_services"],
    ["Keluarga can select extra services", "public.task_extra_services"],
  ];

  for (const [policyName, tableName] of policies) {
    const escapedName = policyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedTable = tableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(
      migration,
      new RegExp(`CREATE POLICY "${escapedName}" ON ${escapedTable}`),
    );
  }
  assert.match(migration, /DROP SCHEMA IF EXISTS public CASCADE/);
});
