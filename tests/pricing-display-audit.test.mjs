import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("rincian biaya di UI tidak membuat biaya layanan fiktif atau PPN siluman", () => {
  const detailClient = readFileSync("src/components/keluarga/RealTaskDetailClient.tsx", "utf8");
  const bookingPage = readFileSync("src/app/(keluarga)/booking/[helper_id]/page.tsx", "utf8");

  assert.doesNotMatch(detailClient, /PPN/);
  assert.doesNotMatch(detailClient, /serviceFee\s*=\s*2500/);
  assert.doesNotMatch(bookingPage, /serviceFee\s*=\s*2500/);
  assert.doesNotMatch(bookingPage, /Pajak\s*\(11%\)/);
});
