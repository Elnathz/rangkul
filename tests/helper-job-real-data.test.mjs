import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const seed = fs.readFileSync(new URL("../supabase/seed.sql", import.meta.url), "utf8");
const jobBoard = fs.readFileSync(new URL("../src/app/(helper)/helper/tugas/baru/page.tsx", import.meta.url), "utf8");
const detailPage = fs.readFileSync(new URL("../src/app/(helper)/tugas/[id]/page.tsx", import.meta.url), "utf8");

test("seeder memiliki task marketplace dengan data relasi dan jadwal nyata", () => {
  assert.match(seed, /INSERT INTO public\.tasks \(/);
  assert.match(seed, /gen_random_uuid\(\)/);
  assert.match(seed, /'diajukan'/);
  assert.match(seed, /Jl\. Pleburan Barat No\. 12/);
  assert.match(seed, /NOW\(\) \+ INTERVAL '1 day'/);
  assert.match(seed, /NOW\(\) \+ INTERVAL '1 hour'/);
  assert.match(seed, /Menemani Mengobrol \(singkat\)/);
});

test("job board dan detail tidak memakai mock atau gambar random", () => {
  assert.doesNotMatch(jobBoard, /MOCK_TASKS|pravatar|BKG-1029/);
  assert.doesNotMatch(detailPage, /MOCK_TASKS|pravatar|BKG-1029/);
  assert.match(jobBoard, /\.from\("tasks"\)/);
  assert.match(detailPage, /\.from\("tasks"\)/);
});

test("Mas Burgas tersedia di katalog dan tetap verified pada rerun seed", () => {
  const coreSeed = seed.slice(seed.indexOf("SELECT id INTO core_helper_user_id"));
  assert.match(coreSeed, /core_helper_user_id[\s\S]*is_available = TRUE/);
  assert.match(coreSeed, /core_helper_user_id[\s\S]*status = 'verified'/);
});
