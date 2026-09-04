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

test("hero menjelaskan Rangkul tanpa search atau kategori yang mengganggu cerita", () => {
  const hero = readFileSync("src/components/landing/HeroSection.tsx", "utf8");

  assert.doesNotMatch(hero, /from "@\/components\/ui\/input"/);
  assert.doesNotMatch(hero, /Cari jasa atau nama helper/);
  assert.doesNotMatch(hero, /Quick category chips/);
  assert.doesNotMatch(hero, /window\.location\.href/);
  assert.match(hero, /Merangkul Jarak/);
  assert.match(hero, /Lihat Cara Kerja/);
});

test("pilihan peran tidak menjual pendapatan atau komisi sebagai klaim landing", () => {
  const roles = readFileSync("src/components/landing/RolesSection.tsx", "utf8");

  assert.doesNotMatch(roles, /90%/);
  assert.doesNotMatch(roles, /3%/);
  assert.doesNotMatch(roles, /pendapatanmu/);
});

test("alur landing membawa pengunjung dari masalah ke kontrol keluarga", () => {
  const page = readFileSync("src/app/(publik)/page.tsx", "utf8");
  const steps = readFileSync("src/components/landing/StepsSection.tsx", "utf8");
  const services = readFileSync("src/components/landing/ServicesSection.tsx", "utf8");
  const riwayat = readFileSync("src/components/landing/RiwayatRangkulPreview.tsx", "utf8");
  const verification = readFileSync("src/components/landing/HowItWorksSection.tsx", "utf8");
  const cta = readFileSync("src/components/landing/CTABannerSection.tsx", "utf8");

  assert.match(page, /<HeroSection\s*\/>[\s\S]*<StepsSection\s*\/>[\s\S]*<ServicesSection\s*\/>[\s\S]*<RiwayatRangkulPreview\s*\/>[\s\S]*<HowItWorksSection\s*\/>[\s\S]*<RolesSection\s*\/>[\s\S]*<CTABannerSection\s*\/>/);
  assert.doesNotMatch(steps, /01|hitungan menit|RT\/RW yang sama/);
  assert.doesNotMatch(services, /<svg/);
  assert.doesNotMatch(riwayat, /Ibu Sulastri|Mas Burgas|Deteksi Tren Otomatis/);
  assert.match(riwayat, /Contoh tampilan/);
  assert.doesNotMatch(verification, /RT\/RW yang sama/);
  assert.match(verification, /Persetujuan tetap di tangan keluarga/);
  assert.doesNotMatch(cta, /Gratis mendaftar|Koordinator RT\/RW/);
  assert.match(cta, /Buat Kunjungan/);
});

test("footer publik tidak mengarahkan pengunjung ke halaman placeholder", () => {
  const footer = readFileSync("src/components/layout/Footer.tsx", "utf8");
  assert.doesNotMatch(footer, /\/help\//);
  assert.doesNotMatch(footer, /#tentang/);
  assert.doesNotMatch(footer, /tahap pengembangan/);
});

test("hero memakai product-card stack tanpa mengandalkan klaim sosial palsu", () => {
  const hero = readFileSync("src/components/landing/HeroSection.tsx", "utf8");
  const productStack = readFileSync("src/components/landing/HeroProductStack.tsx", "utf8");

  assert.match(hero, /HeroProductStack/);
  assert.match(productStack, /Health Snapshot/);
  assert.match(productStack, /Memory Capsule/);
  assert.match(productStack, /Contoh tampilan/);
  assert.match(productStack, /useReducedMotion/);
  assert.doesNotMatch(productStack, /rating|terbaik|tugas selesai|penghasilan/i);
});

test("landing memakai contoh skenario demo dan bukan ranking atau testimoni", () => {
  const page = readFileSync("src/app/(publik)/page.tsx", "utf8");
  const scenarios = readFileSync("src/components/landing/DemoScenariosSection.tsx", "utf8");

  assert.match(page, /DemoScenariosSection/);
  assert.match(scenarios, /Contoh skenario demo/);
  assert.doesNotMatch(scenarios, /rating|terbaik|testimoni|review|penghasilan/i);
});

test("pilihan peran menerangkan seluruh ekosistem Rangkul termasuk Admin", () => {
  const roles = readFileSync("src/components/landing/RolesSection.tsx", "utf8");

  assert.match(roles, /title: "Keluarga"/);
  assert.match(roles, /title: "Helper"/);
  assert.match(roles, /title: "Koordinator"/);
  assert.match(roles, /title: "Admin"/);
  assert.doesNotMatch(roles, /rating|terbaik|pendapatan/i);
});
