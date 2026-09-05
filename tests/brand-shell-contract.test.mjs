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

test("navbar membedakan navigasi landing dari workspace peran yang sudah login", () => {
  const navbar = readFileSync("src/components/layout/Navbar.tsx", "utf8");

  assert.match(navbar, /const isPublicSurface = pathname === "\/"/);
  assert.match(navbar, /Navigasi landing/);
  assert.match(navbar, /Navigasi workspace/);
  assert.match(navbar, /bg-white\/80 backdrop-blur-xl/);
  assert.match(navbar, /Workspace/);
});

test("navbar publik mengikuti lima bab utama landing dan memakai scroll spy di desktop serta drawer", () => {
  const navbar = readFileSync("src/components/layout/Navbar.tsx", "utf8");

  for (const section of ["apa-itu-rangkul", "cara-kerja", "layanan", "riwayat-rangkul", "peran"]) {
    assert.match(navbar, new RegExp(`/#${section}`));
  }

  assert.match(navbar, /new IntersectionObserver/);
  assert.match(navbar, /publicActive === item\.href\.replace\("\/", ""\)/);
});

test("pengunjung yang membuka booking diarahkan ke login dan kembali setelah autentikasi Keluarga", () => {
  const booking = readFileSync("src/app/(keluarga)/booking/new/page.tsx", "utf8");
  const login = readFileSync("src/app/(auth)/login/page.tsx", "utf8");

  assert.match(booking, /redirect\("\/login\?next=\/booking\/new"\)/);
  assert.match(login, /get\("next"\)/);
  assert.match(login, /data\.user\?\.role === "keluarga" && safeRequestedRoute/);
  assert.match(login, /!requestedRoute\.startsWith\("\/\/"\)/);
});

test("beranda Keluarga memakai permukaan brand biru sebagai puncak hierarki aksi", () => {
  const page = readFileSync("src/app/(keluarga)/beranda/page.tsx", "utf8");

  assert.match(page, /max-w-6xl/);
  assert.match(page, /bg-primary/);
  assert.match(page, /text-primary-foreground/);
});

test("aksi sekunder beranda Keluarga tetap memiliki target sentuh minimum", () => {
  const page = readFileSync("src/app/(keluarga)/beranda/page.tsx", "utf8");

  assert.match(page, /href="\/lansia"\s+className="[^"]*min-h-11[^"]*"/);
  assert.match(page, /className="min-h-11 gap-1 rounded-xl text-xs font-semibold"[\s\S]{0,100}href="\/lansia\/tambah"/);
  assert.match(page, /href="\/kunjungan"\s+className="[^"]*min-h-11[^"]*"/);
});

test("logo autentikasi memakai rasio intrinsik asset", () => {
  for (const file of [
    "src/app/(auth)/login/page.tsx",
    "src/app/(auth)/register/page.tsx",
  ]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /src="\/logo-markdown\.svg"[\s\S]*width=\{74\}[\s\S]*height=\{80\}[\s\S]*className="h-20 w-auto"/);
  }
});

test("navigasi bawah mobile memakai liquid glass dengan indikator active yang bergerak", () => {
  const navigation = readFileSync("src/components/layout/MobileBottomNavigation.tsx", "utf8");

  assert.match(navigation, /backdrop-blur-xl/);
  assert.match(navigation, /layoutId="bottom-navigation-active"/);
  assert.match(navigation, /useReducedMotion/);
});
