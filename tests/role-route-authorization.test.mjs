import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";
import {
  getApiRouteAccess,
  getFrontendRouteAccess,
  getRoleHome,
  isPathWithin,
} from "../src/lib/supabase/proxy-routing.ts";

const appRoot = join(process.cwd(), "src", "app");

function walkPages(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) return walkPages(absolute);
    return entry.name === "page.tsx" ? [absolute] : [];
  });
}

function walkApiRoutes(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) return walkApiRoutes(absolute);
    return entry.name === "route.ts" ? [absolute] : [];
  });
}

function samplePath(file) {
  const segments = relative(appRoot, file)
    .split(sep)
    .slice(0, -1)
    .filter((segment) => !/^\(.+\)$/.test(segment))
    .map((segment) => segment.replace(/^\[.+\]$/, "contoh-id"));
  return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
}

const expectedByGroup = {
  "(publik)": "public",
  "(auth)": "public",
  "(bersama)": "authenticated",
  "(keluarga)": "keluarga",
  "(helper)": "helper",
  "(koordinator)": "koordinator",
  "(admin)": "admin",
};

test("setiap halaman App Router memiliki klasifikasi akses sesuai route group", () => {
  for (const file of walkPages(appRoot)) {
    const relativeFile = relative(appRoot, file);
    const group = relativeFile.split(sep)[0];
    const expected = expectedByGroup[group] ?? (group === "help" ? "public" : null);

    assert.notEqual(expected, null, `route baru belum diaudit: ${relativeFile}`);
    assert.equal(
      getFrontendRouteAccess(samplePath(file)),
      expected,
      `${samplePath(file)} dari ${relativeFile}`,
    );
  }
});

test("route Keluarga tanpa prefix tetap terkunci untuk role Keluarga", () => {
  for (const pathname of [
    "/beranda",
    "/beranda/profil/edit",
    "/booking/new",
    "/booking/helper-id",
    "/cari-helper",
    "/kunjungan",
    "/kunjungan/task-id/pelamar",
    "/lansia",
    "/lansia/lansia-id/riwayat",
    "/pembayaran/task-id",
    "/saldo",
    "/banding",
  ]) {
    assert.equal(getFrontendRouteAccess(pathname), "keluarga", pathname);
  }
});

test("route legacy Tugas dan seluruh namespace role tidak bocor lintas role", () => {
  assert.equal(getFrontendRouteAccess("/tugas"), "helper");
  assert.equal(getFrontendRouteAccess("/tugas/task-id/lapor"), "helper");
  assert.equal(getFrontendRouteAccess("/helper/tugas/baru"), "helper");
  assert.equal(getFrontendRouteAccess("/koordinator/persetujuan"), "koordinator");
  assert.equal(getFrontendRouteAccess("/admin/audit-logs"), "admin");
  assert.equal(getFrontendRouteAccess("/notifikasi"), "authenticated");
});

test("pencocokan route sadar batas segmen dan tidak mengunci nama yang hanya mirip", () => {
  assert.equal(isPathWithin("/lansia", "/lansia"), true);
  assert.equal(isPathWithin("/lansia/contoh-id", "/lansia"), true);
  assert.equal(isPathWithin("/lansiawan", "/lansia"), false);
  assert.equal(isPathWithin("/administrator", "/admin"), false);
  assert.equal(getFrontendRouteAccess("/api/admin/stats"), null);
});

test("setiap role mempunyai tujuan redirect aman miliknya", () => {
  assert.equal(getRoleHome("keluarga"), "/beranda");
  assert.equal(getRoleHome("helper"), "/helper/dashboard");
  assert.equal(getRoleHome("koordinator"), "/koordinator/dashboard");
  assert.equal(getRoleHome("admin"), "/admin/dashboard");
});

test("API memakai boundary role eksplisit dan endpoint lain tetap authenticated", () => {
  assert.equal(getApiRouteAccess("/api/auth/login"), "public");
  assert.equal(getApiRouteAccess("/api/payments/webhook"), "public");
  assert.deepEqual(getApiRouteAccess("/api/admin/stats"), ["admin"]);
  assert.deepEqual(getApiRouteAccess("/api/koordinator/helpers"), ["koordinator"]);
  assert.deepEqual(getApiRouteAccess("/api/helper/profile"), ["helper"]);
  assert.deepEqual(getApiRouteAccess("/api/helper/queue"), ["koordinator"]);
  assert.deepEqual(getApiRouteAccess("/api/helper/helper-id/approve"), ["koordinator", "admin"]);
  assert.deepEqual(getApiRouteAccess("/api/helpers/helper-id/status"), ["koordinator", "admin"]);
  assert.deepEqual(getApiRouteAccess("/api/helpers"), ["keluarga"]);
  assert.deepEqual(getApiRouteAccess("/api/lansia/lansia-id"), ["keluarga"]);
  assert.deepEqual(getApiRouteAccess("/api/booking/task"), ["keluarga"]);
  assert.deepEqual(getApiRouteAccess("/api/wallet"), ["keluarga"]);
  assert.deepEqual(getApiRouteAccess("/api/tasks/task-id"), "authenticated");
  assert.deepEqual(getApiRouteAccess("/api/administrator"), "authenticated");
});

test("seluruh route handler terklasifikasi dan hanya auth serta webhook yang publik", () => {
  const apiRoot = join(appRoot, "api");
  const allowedPublicRoutes = new Set(["/api/auth/login", "/api/auth/register", "/api/payments/webhook"]);

  for (const file of walkApiRoutes(apiRoot)) {
    const pathname = samplePath(file);
    const access = getApiRouteAccess(pathname);
    assert.notEqual(access, null, `API baru belum diaudit: ${relative(appRoot, file)}`);
    assert.equal(access === "public", allowedPublicRoutes.has(pathname), pathname);
  }
});

test("endpoint debug tidak dapat membaca tabel tanpa autentikasi Admin", () => {
  const source = readFileSync(join(appRoot, "api", "debug", "route.ts"), "utf8");
  assert.match(source, /requireAdmin\(\)/);
  assert.match(source, /adminAuthErrorResponse/);
});
