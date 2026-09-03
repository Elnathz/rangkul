import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("dashboard Keluarga memakai presentasi status dan tidak menampilkan pembatalan tanpa aksi nyata", () => {
  const page = readFileSync("src/app/(keluarga)/beranda/page.tsx", "utf8");

  assert.match(page, /getTaskStatusPresentation/);
  assert.match(page, /canRolePerformTaskAction/);
  assert.doesNotMatch(page, />Batalkan</);
});
