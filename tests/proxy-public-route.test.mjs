import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { isPublicRoute } from "../src/lib/supabase/proxy-routing.ts";

const proxySource = readFileSync(new URL("../src/proxy.ts", import.meta.url), "utf8");

test("proxy mengklasifikasikan route publik dan privat dengan benar", () => {
  assert.equal(isPublicRoute("/"), true);
  assert.equal(isPublicRoute("/login"), true);
  assert.equal(isPublicRoute("/help/tutorial"), true);
  assert.equal(isPublicRoute("/api/auth/login"), true);
  assert.equal(isPublicRoute("/beranda"), false);
  assert.equal(isPublicRoute("/api/tasks/task-id"), false);
});

test("proxy melewati bootstrap Supabase untuk route publik sebelum update session", () => {
  const publicRouteCheck = proxySource.indexOf("isPublicRoute(pathname)");
  const updateSessionCall = proxySource.indexOf("updateSession(request)");

  assert.notEqual(publicRouteCheck, -1, "proxy harus mengenali route publik");
  assert.notEqual(updateSessionCall, -1, "proxy harus tetap memperbarui session untuk route privat");
  assert.ok(
    publicRouteCheck < updateSessionCall,
    "route publik harus dilewati sebelum Supabase session dibuat",
  );
  assert.match(
    proxySource,
    /if \(isPublicRoute\(pathname\)\) \{\s*return NextResponse\.next\(\);\s*\}/s,
  );
});

test("proxy mempertahankan akses role saat profile hanya dapat ditemukan lewat email", () => {
  assert.match(proxySource, /userProfileById/);
  assert.match(proxySource, /user\.email\.toLowerCase\(\)/);
  assert.match(proxySource, /userProfileByEmail/);
  assert.match(proxySource, /metadataRole/);
});
