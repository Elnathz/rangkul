import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("shell menampilkan lockup brand Rangkul yang terbaca dan tidak bergantung pada wordmark berkanvas longgar", () => {
  const navbar = readFileSync("src/components/layout/Navbar.tsx", "utf8");

  assert.match(navbar, /src="\/logo\.png"/);
  assert.match(navbar, />Rangkul<\/span>/);
  assert.match(navbar, /sm:size-11/);
  assert.match(navbar, /layoutId="desktop-active-navigation"/);
  assert.doesNotMatch(navbar, /src="\/long-logo\.svg"/);
});

test("beranda Keluarga memakai permukaan brand biru sebagai puncak hierarki aksi", () => {
  const page = readFileSync("src/app/(keluarga)/beranda/page.tsx", "utf8");

  assert.match(page, /max-w-6xl/);
  assert.match(page, /bg-primary/);
  assert.match(page, /text-primary-foreground/);
});

test("navigasi bawah mobile memakai liquid glass dengan indikator active yang bergerak", () => {
  const navigation = readFileSync("src/components/layout/MobileBottomNavigation.tsx", "utf8");

  assert.match(navigation, /backdrop-blur-xl/);
  assert.match(navigation, /layoutId="bottom-navigation-active"/);
  assert.match(navigation, /useReducedMotion/);
});
