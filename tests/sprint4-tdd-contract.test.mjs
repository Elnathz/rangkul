import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const tdd = await readFile("docs/TDD_Rangkul.md", "utf8");
const api = await readFile("docs/api-contract.md", "utf8");

function sprint4Amendment() {
  const marker = "## Amendment Mengikat Sprint 4 Farros";
  const start = tdd.indexOf(marker);
  assert.notEqual(start, -1, "TDD harus memiliki amendment Sprint 4 Farros");
  return tdd.slice(start);
}

test("amendment Sprint 4 mengunci nama schema deployed dan aturan trust tier", () => {
  const amendment = sprint4Amendment();

  assert.match(amendment, /payment_method[^\n]+`saldo_demo`/);
  assert.match(amendment, /foto_bukti_url[^\n]+object path private/);
  assert.match(amendment, /energi[^\n]+mobilitas[^\n]+mood[^\n]+nafsu_makan[^\n]+kualitas_tidur/);
  assert.match(amendment, /laporan formal pertama[^\n]+`probation`/i);
  assert.match(amendment, /laporan formal kedua[^\n]+`under_review`/i);
});

test("kontrak API Sprint 4 menetapkan envelope, actor, state guard, dan error", () => {
  const amendment = sprint4Amendment();

  for (const endpoint of [
    "GET /api/lansia/:id/riwayat",
    "POST /api/payments/:task_id/demo-wallet/charge",
    "GET /api/koordinator/commissions",
    "PATCH /api/reports/:id",
    "PATCH /api/admin/appeals/:id",
  ]) {
    assert.match(amendment, new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(amendment, /\{ data \}/);
  assert.match(amendment, /\{ error, message, fieldErrors\? \}/);
  assert.match(amendment, /400[^\n]+401[^\n]+403[^\n]+404[^\n]+409[^\n]+500/);
  assert.match(amendment, /actor[^\n]+status awal[^\n]+status akhir[^\n]+idempotency/i);
  assert.match(api, /## Kontrak Sprint 4/);
});
