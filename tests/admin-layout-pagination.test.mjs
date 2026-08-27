import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const queueSource = fs.readFileSync("src/app/(admin)/admin/koordinator/pengajuan/page.tsx", "utf8");
const queueClientSource = fs.readFileSync("src/app/(admin)/admin/koordinator/pengajuan/PengajuanClient.tsx", "utf8");

test("antrean Koordinator memiliki pagination server-side", () => {
  assert.match(queueSource, /searchParams/);
  assert.match(queueSource, /pageSize/);
  assert.match(queueSource, /range\(/);
  assert.match(queueClientSource, /PengajuanPagination/);
});
