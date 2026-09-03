import assert from "node:assert/strict";
import test from "node:test";

import {
  ROLE_NAVIGATION,
  isNavigationItemActive,
} from "../src/lib/navigation/role-navigation.ts";

test("navigasi per peran hanya mengekspos tujuan yang nyata", () => {
  assert.deepEqual(
    ROLE_NAVIGATION.keluarga.map((item) => item.href),
    ["/beranda", "/booking/new", "/kunjungan", "/lansia", "/beranda/pesan"],
  );
  assert.deepEqual(
    ROLE_NAVIGATION.helper.map((item) => item.href),
    ["/helper/dashboard", "/helper/tugas/baru", "/helper/tugas", "/helper/penghasilan", "/helper/pesan"],
  );
  assert.equal(
    ROLE_NAVIGATION.koordinator.some((item) => item.href === "/koordinator/pengawasan"),
    false,
  );
});

test("active-route memilih prefix terpanjang dan alias legacy", () => {
  const helperTasks = ROLE_NAVIGATION.helper.find((item) => item.href === "/helper/tugas");
  const helperNewTasks = ROLE_NAVIGATION.helper.find((item) => item.href === "/helper/tugas/baru");

  assert.ok(helperTasks);
  assert.ok(helperNewTasks);
  assert.equal(isNavigationItemActive("/helper/tugas/abc", helperTasks), true);
  assert.equal(isNavigationItemActive("/tugas/abc", helperTasks), true);
  assert.equal(isNavigationItemActive("/helper/tugas/baru", helperTasks), false);
  assert.equal(isNavigationItemActive("/helper/tugas/baru", helperNewTasks), true);
  assert.equal(isNavigationItemActive("/helper/tugas-lama", helperTasks), false);
});
