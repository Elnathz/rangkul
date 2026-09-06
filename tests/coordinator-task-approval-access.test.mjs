import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(path, "utf8");

test("akun inti Wagiman disemai sebagai Koordinator terverifikasi di wilayahnya", async () => {
  const [seed, adminSeedRoute] = await Promise.all([
    read("supabase/seed.sql"),
    read("src/app/api/admin/seed-demo-users/route.ts"),
  ]);

  assert.match(seed, /'wagimankoordinator@rangkul\.id'[^\n]*'wagimankoordinator'[^\n]*'Jl\. Pleburan Barat No\. 18'[^\n]*3[^\n]*5/i);
  assert.match(seed, /'andihelper@rangkul\.id'[^\n]*'andihelper'[^\n]*'Jl\. Pleburan Barat No\. 28'[^\n]*3[^\n]*5/i);

  const coreCoordinatorSeed = seed.slice(
    seed.indexOf("IF core_koordinator_user_id IS NOT NULL"),
    seed.indexOf("IF core_helper_user_id IS NOT NULL"),
  );
  assert.match(coreCoordinatorSeed, /'verified'/);
  assert.match(coreCoordinatorSeed, /demo\/dokumen_koordinator\/dokumen-koordinator-demo\.pdf/);
  assert.match(coreCoordinatorSeed, /diverifikasi_oleh\s*=\s*admin_id/i);
  assert.doesNotMatch(coreCoordinatorSeed, /status\s*=\s*'pending_verification'/i);

  const coreHelperSeed = seed.slice(
    seed.indexOf("IF core_helper_user_id IS NOT NULL"),
    seed.indexOf("END;", seed.indexOf("IF core_helper_user_id IS NOT NULL")),
  );
  assert.match(coreHelperSeed, /core_koordinator_profile_id/);

  assert.match(seed, /existing_helper_id[^\n]*'\[DEMO_MATRIX\] Task menunggu Koordinator'/);

  const coordinatorProfilesStart = adminSeedRoute.indexOf("const coordinatorProfiles");
  const wagimanProfileStart = adminSeedRoute.indexOf("username: 'wagimankoordinator'", coordinatorProfilesStart);
  const wagimanProfile = adminSeedRoute.slice(
    wagimanProfileStart,
    adminSeedRoute.indexOf("username: 'sulikoordinator'", wagimanProfileStart),
  );
  assert.match(wagimanProfile, /status: 'verified'/);
  assert.match(wagimanProfile, /dokumen_url: 'demo\/dokumen_koordinator\/dokumen-koordinator-demo\.pdf'/);
  assert.match(wagimanProfile, /diverifikasi_oleh: 'demoadmin'/);
});

test("halaman persetujuan tidak menganggap kegagalan API sebagai profil belum diajukan", async () => {
  const page = await read("src/app/(koordinator)/koordinator/antrean-persetujuan/page.tsx");

  assert.match(page, /if \(loadFailed\)/);
  assert.match(page, /Antrean persetujuan belum dapat dibuka/);
  assert.match(page, /<KoordinatorStatusGuard koordinator=\{koordinator\}>/);
});

test("endpoint antrean mengambil profil Koordinator sendiri sebelum membaca task", async () => {
  const route = await read("src/app/api/koordinator/task-approvals/route.ts");

  assert.match(route, /\.from\("koordinator_profiles"\)[\s\S]*\.eq\("user_id", user\.id\)/);
  assert.match(route, /profile\.status !== "verified"/);
  assert.match(route, /resolvePrivatePhotoUrl/);
});

test("halaman antrean memakai profil yang dikembalikan endpoint antrean", async () => {
  const page = await read("src/app/(koordinator)/koordinator/antrean-persetujuan/page.tsx");

  assert.match(page, /setKoordinator\(payload\?\.data\?\.koordinator \?\? null\)/);
  assert.match(page, /setLoadFailed\(true\)/);
  assert.doesNotMatch(page, /fetch\("\/api\/koordinator\/profile"/);
});
