import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createTaskSchema } from "../src/lib/validations/booking.ts";

const basePayload = {
  lansia_id: "lansia-demo",
  service_category_id: "kategori-demo",
  jadwal_waktu: "2026-09-05T12:00:00.000Z",
};

test("mode langsung wajib menyertakan Helper", () => {
  assert.equal(createTaskSchema.safeParse({ ...basePayload, mode_penugasan: "langsung" }).success, false);
  assert.equal(createTaskSchema.safeParse({ ...basePayload }).success, false);
  assert.equal(
    createTaskSchema.safeParse({ ...basePayload, mode_penugasan: "langsung", helper_id: "helper-demo" }).success,
    true,
  );
});

test("mode pelamar dan cepat tidak menerima Helper pilihan", () => {
  assert.equal(createTaskSchema.safeParse({ ...basePayload, mode_penugasan: "pelamar" }).success, true);
  assert.equal(createTaskSchema.safeParse({ ...basePayload, mode_penugasan: "cepat" }).success, true);
  assert.equal(
    createTaskSchema.safeParse({ ...basePayload, mode_penugasan: "pelamar", helper_id: "helper-demo" }).success,
    false,
  );
  assert.equal(
    createTaskSchema.safeParse({ ...basePayload, mode_penugasan: "cepat", helper_id: "helper-demo" }).success,
    false,
  );
});

test("entry booking umum hanya menampilkan dua mode Sprint 6 saat flag aktif", () => {
  const page = readFileSync("src/app/(keluarga)/booking/new/page.tsx", "utf8");
  const client = readFileSync("src/components/keluarga/booking/BookingNewClient.tsx", "utf8");
  const route = readFileSync("src/app/api/booking/task/route.ts", "utf8");

  assert.match(page, /if \(!isSprint6MatchingEnabled\(\)\) redirect\("\/cari-helper"\)/);
  assert.match(client, /\["pelamar",\s*"cepat"\]/);
  assert.doesNotMatch(client, /mode_penugasan:\s*"langsung"/);
  assert.match(route, /message: 'Data input tidak valid',[\s\S]*?422\s*\)/);
});
