import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const migration = fs.readFileSync(new URL("../supabase/migrations/20260821150000_add_task_notifications.sql", import.meta.url), "utf8");
const seed = fs.readFileSync(new URL("../supabase/seed.sql", import.meta.url), "utf8");
const notificationApi = fs.readFileSync(new URL("../src/app/api/notifications/route.ts", import.meta.url), "utf8");
const readApi = fs.readFileSync(new URL("../src/app/api/notifications/[id]/read/route.ts", import.meta.url), "utf8");
const notificationPage = fs.readFileSync(new URL("../src/components/notifications/NotificationPageClient.tsx", import.meta.url), "utf8");
const navbar = fs.readFileSync(new URL("../src/components/layout/Navbar.tsx", import.meta.url), "utf8");

test("booking direct memicu notifikasi Helper melalui trigger database", () => {
  assert.match(migration, /CREATE TRIGGER on_direct_booking_created/);
  assert.match(migration, /notify_helper_of_direct_booking/);
  assert.match(migration, /helper_user_id/);
  assert.match(seed, /'f1000000-0000-0000-0000-000000000002'/);
  assert.match(seed, /'f0000000-0000-0000-0000-000000000001'/);
});

test("API notifikasi membatasi pembacaan dan penandaan ke user yang login", () => {
  assert.match(notificationApi, /auth\.getUser/);
  assert.match(notificationApi, /\.eq\("user_id", user\.id\)/);
  assert.match(readApi, /\.eq\("user_id", user\.id\)/);
  assert.match(readApi, /is_read: true/);
});

test("Navbar dan halaman notifikasi menggunakan data API, bukan mock", () => {
  assert.match(navbar, /\/api\/notifications\?limit=1/);
  assert.match(notificationPage, /\/api\/notifications\?limit=100/);
  assert.match(notificationPage, /\/read/);
  assert.doesNotMatch(notificationPage, /MOCK|T1-1234|dicebear/);
});
