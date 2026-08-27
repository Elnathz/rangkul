import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../src/lib/chat/actions.ts", import.meta.url), "utf8");

test("inbox chat memakai nama kategori sesuai schema service_categories", () => {
  assert.match(source, /category:service_categories\s*\(nama\)/);
  assert.match(source, /category\?\.nama/);
  assert.doesNotMatch(source, /service_categories\s*\(name\)/);
  assert.doesNotMatch(source, /category\?\.name/);
});
