import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const dialogSource = fs.readFileSync("src/components/ui/SOSDialog.tsx", "utf8");
const activeRouteSource = fs.readFileSync("src/app/api/tasks/active/route.ts", "utf8");

test("SOS tidak menjalankan countdown sebelum task aktif ditemukan", () => {
  assert.match(dialogSource, /useState<number \| null>\(null\)/);
  assert.match(dialogSource, /if \(!taskId\) return;/);
  assert.match(dialogSource, /setCountdown\(5\)/);
  assert.match(dialogSource, /Mencari tugas aktif/);
  assert.match(dialogSource, /Belum ada tugas yang sedang dikerjakan/);
});

test("endpoint task aktif hanya mengembalikan task yang sudah check-in", () => {
  assert.match(activeRouteSource, /\.eq\("status", "dikerjakan"\)/);
});
