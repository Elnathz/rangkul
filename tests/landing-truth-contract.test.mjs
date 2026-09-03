import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("landing tidak merender ranking atau testimoni rekaan dan tidak repetitif", () => {
  const page = readFileSync("src/app/(publik)/page.tsx", "utf8");

  assert.doesNotMatch(page, /TopHelpersSection/);
  assert.doesNotMatch(page, /TestimonialsSection/);
  assert.doesNotMatch(page, /JoinHelperSection/);
  assert.doesNotMatch(page, /JoinKoordinatorSection/);
  assert.match(page, /RiwayatRangkulPreview/);
});

test("hero landing mematuhi aturan truth in presentation tanpa metrik palsu", () => {
  const hero = readFileSync("src/components/landing/HeroSection.tsx", "utf8");

  assert.doesNotMatch(hero, /100%/);
  assert.doesNotMatch(hero, /4\.8/);
  assert.doesNotMatch(hero, /<\s*1\s*jam/);
  assert.match(hero, /Diverifikasi komunitas lokal/);
  assert.match(hero, /Harga transparan sejak awal/);
  assert.match(hero, /Laporan setiap kunjungan/);
  assert.match(hero, /Buat Kunjungan/);
});
