import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const dashboardSource = fs.readFileSync("src/app/(helper)/helper/dashboard/page.tsx", "utf8");
const managerSource = fs.readFileSync("src/components/helper/ServiceCoverageManager.tsx", "utf8");
const editSource = fs.readFileSync("src/app/(helper)/helper/profil/edit/page.tsx", "utf8");
const apiSource = fs.readFileSync("src/app/api/helper/profile/route.ts", "utf8");

test("Helper Dashboard mengintegrasikan ServiceCoverageManager interaktif", () => {
  assert.match(dashboardSource, /ServiceCoverageManager/);
  assert.match(dashboardSource, /radius_layanan_km/);
  assert.match(dashboardSource, /wilayah_domisili/);
});

test("ServiceCoverageManager menyediakan modal pengaturan radius dengan slider dan preset", () => {
  assert.match(managerSource, /radius_layanan_km/);
  assert.match(managerSource, /fetch\("\/api\/helper\/profile"/);
  assert.match(managerSource, /type="range"/);
  assert.match(managerSource, /Atur jangkauan/);
  assert.match(managerSource, /Dialog/);
});

test("Edit profil Helper menyertakan dan memperbarui radius_layanan_km", () => {
  assert.match(editSource, /radius_layanan_km/);
  assert.match(editSource, /fetch\("\/api\/helper\/profile"/);
  assert.match(editSource, /Radius Jangkauan Layanan/);
});

test("API helper profile route menerima dan memvalidasi radius_layanan_km", () => {
  assert.match(apiSource, /radius_layanan_km/);
  assert.match(apiSource, /helperProfileUpdateSchema/);
});
