import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("hero landing menetapkan satu kolom eksplisit sebelum breakpoint desktop", async () => {
  const hero = await readFile("src/components/landing/HeroSection.tsx", "utf8");
  assert.match(hero, /grid[\s\S]*lg:grid-cols-\[minmax\(0,\.9fr\)_minmax\(0,1\.1fr\)\]/);
});

test("tautan footer yang pendek tetap memiliki hit area mobile", async () => {
  const footer = await readFile("src/components/layout/Footer.tsx", "utf8");
  assert.match(footer, /inline-flex min-h-11 min-w-11 items-center text-sm/);
});

test("enam layanan utama mengisi dua baris desktop tanpa kartu yatim", async () => {
  const services = await readFile("src/components/landing/ServicesSection.tsx", "utf8");
  const desktopThirds = services.match(/span: "lg:col-span-2"/g) ?? [];

  assert.equal(desktopThirds.length, 6);
  assert.doesNotMatch(services, /lg:col-span-4/);
});
