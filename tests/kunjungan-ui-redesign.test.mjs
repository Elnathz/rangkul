import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const clientSource = fs.readFileSync("src/components/keluarga/KunjunganListClient.tsx", "utf8");
const pageSource = fs.readFileSync("src/app/(keluarga)/kunjungan/page.tsx", "utf8");
const helperSelectSource = fs.readFileSync("src/components/helper/HelperCategoryMultiSelect.tsx", "utf8");

test("Daftar Kunjungan UI redesign memenuhi standar visual dan hierarki", () => {
  // Header and booking CTA
  assert.match(clientSource, /Perjalanan Pendampingan/);
  assert.match(clientSource, /Daftar Kunjungan/);
  assert.match(clientSource, /href="\/booking\/new"/);
  assert.match(clientSource, /Buat Kunjungan/);

  // Tabs with counts
  assert.match(clientSource, /Mendatang & Aktif/);
  assert.match(clientSource, /Selesai/);
  assert.match(clientSource, /Dibatalkan/);
  assert.match(clientSource, /counts\.semua/);
  assert.match(clientSource, /counts\.mendatang/);

  // Search and Sort controls
  assert.match(clientSource, /Cari layanan, lansia, atau helper/);
  assert.match(clientSource, /Jadwal Terdekat/);

  // In-progress active badge
  assert.match(clientSource, /Sedang Berlangsung/);

  // Helper row and contextual message button
  assert.match(clientSource, /Pesan Helper/);
  assert.match(clientSource, /\/beranda\/pesan\/\$\{task\.id\}/);

  // Pelamar link for applicant mode
  assert.match(clientSource, /\/kunjungan\/\$\{task\.id\}\/pelamar/);

  // Private photo resolver and Supabase query in server page
  assert.match(pageSource, /resolvePrivatePhotoUrl/);
  assert.match(pageSource, /createSignedUrl/);
  assert.match(pageSource, /\.from\("tasks"\)/);
});

test("komponen UI tidak mengandung emoji Unicode dan hanya memakai Lucide icon", () => {
  // Regex detecting standard emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

  assert.equal(emojiRegex.test(clientSource), false, "KunjunganListClient tidak boleh mengandung emoji Unicode");
  assert.equal(emojiRegex.test(helperSelectSource), false, "HelperCategoryMultiSelect tidak boleh mengandung emoji Unicode");

  // Verify Lucide icons are used
  assert.match(clientSource, /from "lucide-react"/);
  assert.match(helperSelectSource, /from "lucide-react"/);
});
