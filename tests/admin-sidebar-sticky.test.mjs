import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const layoutSource = fs.readFileSync("src/app/(admin)/layout.tsx", "utf8");

test("sidebar desktop Admin tetap terlihat saat konten digulir", () => {
  assert.match(layoutSource, /sticky top-0/);
  assert.match(layoutSource, /h-screen/);
});
