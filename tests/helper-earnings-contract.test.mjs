import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Penghasilan Helper memakai saldo dan pembayaran yang dibatasi relasi task", () => {
  const page = readFileSync("src/app/(helper)/helper/penghasilan/page.tsx", "utf8");

  assert.match(page, /saldo_tersedia/);
  assert.match(page, /from\("payments"\)/);
  assert.match(page, /tasks!inner/);
  assert.match(page, /\.eq\("tasks\.helper_id", profile\.id\)/);
  assert.doesNotMatch(page, /tahap pengembangan/i);
  assert.doesNotMatch(page, /createAdminClient/);
});
