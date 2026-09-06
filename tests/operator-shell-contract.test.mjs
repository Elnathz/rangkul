import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("shell operasional memakai sidebar bersama pada desktop dan drawer terakses pada mobile", () => {
  assert.equal(existsSync("src/components/layout/RoleSidebar.tsx"), true);

  const sidebar = readFileSync("src/components/layout/RoleSidebar.tsx", "utf8");
  const navbar = readFileSync("src/components/layout/Navbar.tsx", "utf8");
  const koordinatorLayout = readFileSync("src/app/(koordinator)/layout.tsx", "utf8");
  const adminLayout = readFileSync("src/app/(admin)/layout.tsx", "utf8");

  assert.match(sidebar, /w-64/);
  assert.match(sidebar, /aria-expanded/);
  assert.match(sidebar, /sidebar-group-/);
  assert.match(sidebar, /koordinator/);
  assert.match(sidebar, /admin/);
  assert.match(koordinatorLayout, /RoleSidebar/);
  assert.match(adminLayout, /RoleSidebar/);
  assert.match(navbar, /focusableElements/);
  assert.match(navbar, /menuTriggerRef/);
  assert.match(navbar, /role === "keluarga" \|\| role === "helper"/);
});

test("token shell mengunci warna, spacing, radius, dan tinggi yang ditetapkan v2", () => {
  const globals = readFileSync("src/app/globals.css", "utf8");

  for (const token of [
    "--brand-primary: #0D47A1",
    "--brand-sky: #90CAF9",
    "--surface-muted: #EEF3F8",
    "--space-4: 16px",
    "--radius-lg: 18px",
    "--header-height: 4.25rem",
  ]) {
    assert.match(globals, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
