import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { groupSelectableServiceCategories, sortServiceCategoriesHierarchy } from "../src/lib/service-category-tree.ts";

const adminSource = fs.readFileSync("src/app/(admin)/admin/categories/page.tsx", "utf8");
const helperEditSource = fs.readFileSync("src/app/(helper)/helper/profil/edit/page.tsx", "utf8");
const categoryPolicy = fs.readFileSync("supabase/migrations/20260824140000_read_service_category_parents.sql", "utf8");

const rows = [
  { id: "parent-chat", nama: "Menemani Mengobrol", tingkat: "ringan", parent_id: null, is_active: false },
  { id: "chat-short", nama: "Menemani Mengobrol (singkat)", tingkat: "ringan", parent_id: "parent-chat", is_active: true },
  { id: "chat-long", nama: "Menemani Mengobrol (lama)", tingkat: "sedang", parent_id: "parent-chat", is_active: true },
  { id: "standalone", nama: "Pengingat Obat", tingkat: "ringan", parent_id: null, is_active: true },
];

test("parent menjadi label grup dan child tetap menjadi pilihan", () => {
  const groups = groupSelectableServiceCategories(rows);

  assert.deepEqual(groups.map((group) => group.parentName), ["Menemani Mengobrol", null]);
  assert.deepEqual(groups[0].items.map((item) => item.nama), [
    "Menemani Mengobrol (singkat)",
    "Menemani Mengobrol (lama)",
  ]);
  assert.equal(groups[0].items[0].parentName, "Menemani Mengobrol");
  assert.equal(groups[1].items[0].parentName, null);
  assert.equal(groups.some((group) => group.items.some((item) => item.id === "parent-chat")), false);

  const regrouped = groupSelectableServiceCategories(groups[0].items);
  assert.equal(regrouped[0].parentName, "Menemani Mengobrol");
});

test("admin mendapatkan urutan parent lalu child", () => {
  const ordered = sortServiceCategoriesHierarchy(rows);
  assert.deepEqual(ordered.map((row) => row.id), ["parent-chat", "chat-short", "chat-long", "standalone"]);
});

test("semua surface kategori memakai hierarki database", () => {
  assert.match(adminSource, /sortServiceCategoriesHierarchy/);
  assert.match(adminSource, /Parent, tidak dipilih/);
  assert.match(helperEditSource, /groupSelectableServiceCategories/);
  assert.match(helperEditSource, /parent_id, is_active/);
  assert.match(categoryPolicy, /is_active = true OR parent_id IS NULL/);
});
