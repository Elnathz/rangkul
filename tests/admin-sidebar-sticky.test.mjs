import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sidebarSource = fs.readFileSync("src/components/layout/RoleSidebar.tsx", "utf8");

test("sidebar desktop Admin tetap terlihat saat konten digulir", () => {
  assert.match(sidebarSource, /fixed inset-y-0 left-0/);
  assert.match(sidebarSource, /w-64/);
});
