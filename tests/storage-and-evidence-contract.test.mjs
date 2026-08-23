import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const uploadRoute = await readFile("src/app/api/storage/upload/route.ts", "utf8");
const evidenceRoute = await readFile("src/app/api/tasks/[id]/evidence/route.ts", "utf8");

test("document signed URLs expire after one hour", () => {
  assert.match(uploadRoute, /createSignedUrl\(filePath,\s*3600\)/);
  assert.doesNotMatch(uploadRoute, /315360000|10 years/);
});

test("evidence response reports the task status returned by the atomic RPC", () => {
  assert.match(evidenceRoute, /status:\s*task\?\.status\s*\?\?\s*["']selesai["']/);
  assert.doesNotMatch(evidenceRoute, /status:\s*["']menunggu_persetujuan_keluarga["']/);
});
