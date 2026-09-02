# Completion Audit Sprint 4

Tanggal audit: 2 September 2026

Dokumen ini adalah catatan evidence integrasi. Status `selesai` hanya dipakai
untuk scope yang sudah diverifikasi, bukan untuk seluruh Sprint 4.

## Scope Farros

| Area | Status | Evidence |
| --- | --- | --- |
| Kontrak Sprint 4 | Selesai | Amendment di `docs/TDD_Rangkul.md` dan kontrak terperinci di `docs/api-contract.md`; `tests/sprint4-tdd-contract.test.mjs` lulus. |
| Riwayat Rangkul | Selesai | Route owner-scoped, private evidence re-sign, tren lima indikator, badge strict decline, dan state UI diuji oleh `tests/riwayat-rangkul-runtime.test.mjs`. |
| Trust tier | Selesai | Migration `20260828120000_helper_trust_tier_automation.sql` mengunci counter Helper dan promosi tugas kelima; runtime concurrent dan reset report lulus. |
| Trust-safety dan banding | Selesai | Migration `20260828140000_trust_safety_decisions.sql` serta follow-up guard mengunci review, fallback, appeal, dan audit atomik; runtime lulus. |
| RLS dan privacy | Selesai | Migration `20260828170000_close_broad_user_and_sensitive_policies.sql`, `20260828171000_scope_coordinator_task_reads.sql`, dan `20260902110000_remove_legacy_public_helper_user_policy.sql`; matriks runtime tanpa skip lulus. |
| Seed demo | Selesai | `supabase/seed.sql`, `scripts/seed.mjs`, dan `scripts/seed-assets.mjs`; replay cloud dua kali lulus dan memakai private object path. |
| CI dan scheduled jobs | Selesai | PR ke `develop` dipantau CI, heartbeat hanya health ping Senin dan Kamis, job expiry dan auto-release dipisah di `scheduled-jobs.yml`. |

## Evidence otomatis

| Pemeriksaan | Hasil |
| --- | --- |
| `RUN_SUPABASE_INTEGRATION=1 npm run test` | 205 lulus, 0 gagal, 0 skip. |
| `npm run seed:cloud` dengan `SUPABASE_DEMO_PROJECT_REF=mtgzucflujmqrslryfsc` | Lulus pada replay pertama. |
| Replay seed kedua | Lulus, empat aset demo private tersinkronkan ulang tanpa error. |
| `npx supabase migration list --linked` | Semua 28 migration lokal tercatat sama pada remote, termasuk `20260902110000`. |

## Evidence UI browser

QA dilakukan pada Chrome lokal dengan server Next yang memiliki akses ke Supabase
development.

| Alur | Hasil |
| --- | --- |
| Login Koordinator `mbahburgas@gmail.com` | Berhasil menuju dashboard Koordinator. |
| Persetujuan tugas Koordinator | Menampilkan satu tugas menunggu beserta profil Helper, lansia, alasan approval, dan aksi keputusan. Tidak menampilkan lagi kartu pengajuan profil yang keliru. |
| Riwayat Rangkul Keluarga | Login `mbakburgas@gmail.com` menampilkan timeline Giorno, lima tren, Cerita Hari Ini, dan dua bukti foto private yang berhasil dimuat. |
| Breakpoint 375, 768, 1024, 1440 | Kedua halaman tidak memiliki horizontal overflow. Aksi persetujuan berukuran tinggi 48px; navigasi mobile memakai tombol menu. |

Runbook memakai email aktual hasil seed, bukan alamat `@rangkul.id` yang tidak
sesuai dengan profil demo aktif.

## Batas scope yang masih terbuka

Sprint 4 secara keseluruhan belum boleh dinyatakan selesai dari audit Farros ini.
Area milik Mervin masih memerlukan evidence owner sendiri:

- Pembayaran task memakai Saldo Demo secara atomik.
- Ringkasan komisi Koordinator dari payment released.
- QA manual lintas viewport dan keyboard untuk halaman Mervin.
- Dry run lengkap yang melewati jalur pembayaran fallback tersebut.

Area tersebut tidak disentuh dalam penutupan Farros agar tidak menimpa pekerjaan
owner lain pada worktree yang sama.

## Risiko residual

- Test runtime memakai Supabase development cloud. Ia tidak membuktikan replay
  migration pada database cloud yang benar-benar kosong.
- QA browser mencakup overflow, gambar private, dan target sentuh pada empat
  viewport. Audit screen reader penuh masih perlu dilakukan terpisah bila
  scope perubahan berikutnya menyentuh semantik atau navigasi.
