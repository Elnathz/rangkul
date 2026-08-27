# Sprint 3 Completion Follow-up Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menutup gap P0 dan P1 Sprint 3 sampai alur payment, laporan, chat, notifikasi, dan SOS dapat didemokan dari database nyata dengan batas akses yang sesuai TDD.

**Architecture:** Pertahankan Midtrans Sandbox sebagai provider Sprint 3 sesuai amendment TDD terbaru. Semua perubahan state payment, report, task, dan safety dilakukan melalui RPC atau route server yang idempotent. Frontend memakai endpoint task-scoped yang sama dengan API contract dan tidak memakai `service_role` untuk membaca atau menulis data user.

**Tech Stack:** Next.js App Router, TypeScript, Supabase PostgreSQL, Supabase Realtime, Midtrans Snap Sandbox, Zod, Node test runner, GitHub Actions.

**Spec:** `docs/TDD_Rangkul.md`, `docs/planning/sprint3/completion-audit.md`, `docs/planning/sprint3/plan.md`

## Status awal yang wajib diketahui

Rencana ini diperbarui setelah merge PR #23 ke `dev-eln` pada commit `a3a183ae7255ef163a72f163c611b86635dccdbe`.

| Evidence                    | Hasil                         | Dampak                                                                                                     |
| --------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `npm.cmd run test`        | 117 lulus, 0 gagal, 1 skipped | Test source dan migration tersedia, tetapi belum menggantikan integration test database.                   |
| `npm.cmd run lint`        | 0 error, 60 warning           | Tidak menjadi blocker langsung, tetapi warning tetap harus dipantau.                                       |
| `npm.cmd run typecheck`   | Gagal                         | `src/types/database.ts` kosong dan bukan module. Ini blocker pertama Farros.                             |
| `npm.cmd run build`       | Gagal                         | Kompilasi berhasil, tetapi typecheck gagal pada import`Database`.                                        |
| CI remote                   | Gagal pada PR#23              | Check`quality-checks` gagal sebelum merge. Branch `dev-eln` belum memiliki run CI baru pada audit ini. |
| Supabase/RLS smoke test     | Belum terbukti                | Test terintegrasi masih skipped ketika environment tidak tersedia.                                         |
| Midtrans Sandbox smoke test | Belum terbukti                | Tidak ada evidence checkout, webhook settlement, refund, dan signature ke Sandbox nyata.                   |

Status `[x]` hanya boleh dipakai jika evidence item tersebut dapat ditunjukkan dari test, migration reset, smoke test, atau CI. Keberadaan file route tidak cukup.

## Global constraints

- `docs/TDD_Rangkul.md` adalah sumber kebenaran business rule, schema, API, dan RLS.
- Field dan endpoint Bahasa Indonesia dari TDD dipertahankan persis.
- Payment tidak boleh menerima nominal atau split sebagai otoritas dari browser.
- Release normal memakai 90% Helper, 7% Platform, dan 3% Koordinator.
- Kompensasi pembatalan setelah `held_escrow` memakai 50% Helper dan 50% refund Keluarga, tanpa fee Platform atau Koordinator.
- Dua laporan aktif terhadap Helper yang sama mengubah status menjadi `under_review`; status tersebut memblokir accept task dan bukan keputusan suspend final.
- Chat Sprint 3 harus terkait task dan hanya tersedia untuk peserta task yang diizinkan.
- Dokumen sensitif, report, Health Snapshot, payment, message, dan emergency tetap dibatasi RLS.
- Semua UI mobile-first pada viewport 375px, 768px, 1024px, dan 1440px. Evidence UI dikirim Mervin kepada Farros.
- Sebelum commit, jalankan `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test`, dan `npm run build`.

## Ownership dan handoff

Farros adalah accountable owner untuk contract, schema, migration, RLS, route API, provider payment, seed, integration test, CI evidence, final merge, dan sign-off. Mervin adalah owner UI, Realtime client, accessibility, mobile QA, visual review, dan demo walkthrough.

| Farros wajib menghasilkan                       | Mervin wajib mengonsumsi atau mengirim                  |
| ----------------------------------------------- | ------------------------------------------------------- |
| Request/response/error contract yang stabil     | UI loading, error, forbidden, empty, dan disabled state |
| Migration, RPC, RLS, dan role matrix            | Integrasi endpoint tanpa mock permanen                  |
| Evidence test dan smoke test yang dapat diulang | Evidence viewport, accessibility, dan demo flow         |
| Catatan perubahan schema dan seed               | Handoff bug UI atau contract yang tidak sesuai          |

Format handoff:

```text
Owner: Farros atau Mervin
Files: daftar file
Contract: method, path, request, response sukses, response error
Database: migration/RLS/RPC atau tidak ada
Test: command dan hasil
Blocked by: dependency atau tidak ada
Next owner: Farros atau Mervin
```

Handoff tanpa contract dan hasil test tidak boleh dipakai sebagai dasar implementasi lintas branch.

## Urutan pengerjaan Farros

### Prasyarat: pulihkan type database

**Files:**

- Modify: `src/types/database.ts`.
- Reference: schema pada `supabase/migrations/`.

**Status:** Terbuka. File saat ini berukuran 0 byte.

- [ ] Regenerasi `Database` type dari schema Supabase yang sudah diterapkan, atau pulihkan hasil generate yang konsisten dengan migration terbaru.
- [ ] Pastikan type mencakup tabel, enum `payment_status` termasuk `refunding`, RPC baru, dan relasi yang dipakai route.
- [ ] Jalankan `npm.cmd run typecheck` sampai tidak ada error module atau implicit `any` akibat type database.
- [ ] Jalankan `npm.cmd run build` dan simpan hasil command sebagai evidence.

### Task 1: Selaraskan keputusan TDD dan rencana Sprint 3

**Files:**

- Modify: `docs/TDD_Rangkul.md` bagian §3.4, §4.6, §7, §14.1, §14.4, §14.5, §15.
- Modify: `docs/planning/sprint3/plan.md` bagian keputusan provider, endpoint, dan acceptance criteria.
- Reference: `docs/planning/sprint3/completion-audit.md` bagian konflik dokumentasi.

**Status:** Terbuka. Konflik sudah dicatat, tetapi belum diselesaikan pada TDD.

- [X] Catat konflik Demo Ledger, Saldo Demo, dan `charge-dummy` di audit.
- [ ] Tetapkan Midtrans Sandbox sebagai provider Sprint 3 secara konsisten di TDD dan plan.
- [ ] Tandai Demo Ledger, Saldo Demo, `charge-dummy`, dan Admin demo wallet sebagai deferred scope yang tidak memblokir Sprint 3.
- [ ] Pastikan acceptance criteria mencakup checkout, webhook valid/invalid, split, refund, auto-release, report review, chat task scope, notifikasi, dan SOS acknowledge.
- [ ] Review seluruh perubahan dokumentasi sebelum menambah schema baru.

**Acceptance evidence:** TDD dan plan tidak lagi menjanjikan dua provider untuk jalur Sprint 3.

### Task 2: Kunci idempotency checkout dan settlement payment

**Files:**

- Modify: `supabase/migrations/20260827180000_sprint3_payment_hardening.sql` atau migration lanjutan.
- Modify: `src/app/api/payments/[task_id]/charge/route.ts`.
- Modify: `src/app/api/payments/webhook/route.ts`.
- Modify: `src/lib/midtrans.ts`.
- Modify: `src/types/database.ts` setelah type source tersedia.
- Test: `tests/payment-idempotency.test.mjs` dan `tests/payment-webhook-integrity.test.mjs`.

**Status:** Sebagian. Migration intent dan route tersedia, tetapi contract runtime belum terbukti.

- [X] Sediakan RPC intent yang membuat atau mengunci row payment sebelum provider dipanggil.
- [ ] Ganti order ID berbasis timestamp dengan identifier deterministik atau idempotency key yang dapat dipakai ulang untuk task yang sama.
- [ ] Jika payment `pending` memiliki token valid, kembalikan checkout yang sama tanpa request Midtrans kedua.
- [ ] Validasi `order_id`, `status_code`, `gross_amount`, signature, status transaction, dan snapshot `payments.jumlah_total` sebelum settlement.
- [ ] Pastikan settlement dapat dipanggil ulang tanpa menulis split atau saldo kedua kali.
- [ ] Catat event webhook relevan di `transaction_logs` tanpa secret atau payload sensitif yang tidak diperlukan.
- [ ] Tambahkan test dua charge paralel, nominal berbeda, signature salah, order tidak dikenal, dan webhook duplikat.

**Acceptance evidence:** dua request untuk task yang sama menghasilkan satu checkout aktif dan satu settlement final.

### Task 3: Tutup refund, kompensasi, dan auto-release

**Files:**

- Modify: `supabase/migrations/20260827180001_sprint3_refund_idempotency.sql` atau migration lanjutan.
- Modify: `src/app/api/payments/[task_id]/refund/route.ts`.
- Modify: `src/app/api/tasks/[id]/cancel/route.ts`.
- Modify: `.github/workflows/heartbeat.yml`.
- Test: `tests/payment-lifecycle.test.mjs` atau test terpisah untuk refund dan auto-release.

**Status:** Terbuka. Status `refunding` tersedia, tetapi lifecycle provider dan auto-release belum selesai.

- [X] Sediakan marker `refunding` dan fungsi prepare/confirm untuk mencegah refund database ganda.
- [ ] Tetapkan contract cancel sesuai TDD `PATCH /api/tasks/:id/cancel`; pertahankan alias hanya jika kompatibilitasnya dicatat.
- [ ] Pastikan intent refund tercatat atomik sebelum request gateway dan dapat direkonsiliasi jika gateway timeout.
- [ ] Pastikan hasil refund gateway tidak dianggap final sebelum update database berhasil tercatat.
- [ ] Pastikan Admin yang sah dapat menjalankan jalur refund tanpa melanggar otorisasi RPC.
- [ ] Buat RPC service role untuk merilis payment `held_escrow` yang melewati 3x24 jam, memakai conditional update dan transaction log `released`.
- [ ] Panggil RPC auto-release dari heartbeat dan perlakukan nol row sebagai kondisi normal.
- [ ] Uji cancel dua kali, refund dua kali, release dua kali, cancel versus release bersamaan, dan provider timeout setelah intent tersimpan.

**Acceptance evidence:** setiap retry menghasilkan satu state final dan tidak menghasilkan saldo atau refund ganda.

### Task 4: Selesaikan report review dan status `under_review`

**Files:**

- Modify: `src/app/api/reports/route.ts` dan `src/app/api/reports/[id]/route.ts`.
- Modify: `src/lib/audit.ts` dan migration audit bila diperlukan.
- Test: `tests/report-review-flow.test.mjs` dan `tests/under-review-acceptance.test.mjs`.
- UI dependency: halaman report Mervin harus mengonsumsi contract yang sudah stabil.

**Status:** Sebagian. Endpoint dan halaman tersedia, tetapi keputusan backend dan evidence RLS belum lengkap.

- [X] Sediakan POST/GET/PATCH report dan trigger dua laporan aktif menjadi `under_review`.
- [ ] Pisahkan status report dari status final Helper.
- [ ] Tetapkan mutation reviewer untuk melepas `under_review` atau mengeskalasi `suspended`, dengan alasan wajib.
- [ ] Batasi Koordinator pada Helper di wilayahnya dan Admin pada seluruh report sesuai policy.
- [ ] Catat actor, keputusan, alasan, Helper, dan report di `audit_logs`.
- [ ] Uji dua report dari keluarga berbeda, rating satu bintang tanpa suspend, accept oleh Helper `under_review` menghasilkan 403, dan akses lintas wilayah ditolak.

**Acceptance evidence:** reviewer dapat mengambil keputusan yang ter-audit dan tidak dapat mengubah report di luar scope.

### Task 5: Jadikan chat task-scoped dan konsisten dengan RLS

**Files:**

- Modify: `src/lib/chat/actions.ts`.
- Modify: `src/app/api/messages/route.ts`, `src/app/api/messages/conversations/route.ts`, dan route read terkait.
- Modify: migration policy messages bila diperlukan.
- Test: `tests/messages-task-scope.test.mjs` dan `tests/messages-rls.test.mjs`.
- UI dependency: inbox, room, read receipt, dan Realtime client Mervin.

**Status:** Sebagian. REST path sudah memakai `task_id`, tetapi server action masih memiliki risiko relasi ID.

- [X] Jadikan `task_id` wajib pada message request dan validasi pesan di server.
- [ ] Resolusi peserta selalu memakai `helper_profiles.user_id`; jangan membandingkan `tasks.helper_id` langsung dengan user Auth.
- [ ] Hapus inbox global dan pencarian user bebas dari alur Sprint 3.
- [ ] Pastikan route dan RLS menolak user yang bukan peserta task.
- [ ] Tetapkan event Realtime berdasarkan task scope dan contract unsubscribe untuk client.
- [ ] Uji task silang, task tanpa Helper, read receipt user lain, dan pengiriman message tanpa task.

**Acceptance evidence:** setiap conversation memiliki task context dan tidak ada jalur server produksi yang memakai `service_role` untuk melewati relasi peserta.

### Task 6: Selesaikan notification dan SOS backend

**Files:**

- Modify: `src/app/api/emergency/route.ts` dan `src/app/api/emergency/[id]/acknowledge/route.ts`.
- Modify: `src/app/api/notifications/route.ts` dan trigger notification terkait.
- Modify: migration RLS emergency dan notification bila diperlukan.
- Test: `tests/notification-event-matrix.test.mjs` dan `tests/emergency-review-flow.test.mjs`.
- UI dependency: halaman darurat, notification, dan status copy Mervin.

**Status:** Sebagian. Route SOS, acknowledge, notification, dan halaman Koordinator tersedia, tetapi evidence runtime belum lengkap.

- [X] Batasi pembuatan SOS pada Helper yang memiliki task berstatus `dikerjakan`.
- [X] Sediakan acknowledge conditional terhadap status `active`.
- [ ] Pastikan Koordinator hanya melihat alert sesuai wilayah dan Keluarga hanya melihat alert task terkait.
- [ ] Tetapkan recipient matrix untuk task, payment, message, emergency, dan `koordinator_info`.
- [ ] Catat audit log untuk acknowledge atau resolusi alert jika diwajibkan TDD.
- [ ] Uji acknowledge race, akses user lain, status `resolved`, deduplikasi, dan RLS.
- [ ] Pertahankan copy bahwa SOS mengirim in-app dan membuka `tel:112`; jangan klaim SMS aktif tanpa provider teruji.

**Acceptance evidence:** pihak yang sah dapat membaca dan meng-acknowledge alert, pihak yang tidak sah menerima 403 atau 404 sesuai contract, dan race tidak menimpa status final.

### Task 7: Seed, smoke test, dan evidence CI

**Files:**

- Modify: `supabase/seed.sql` atau `scripts/seed.mjs`.
- Modify: `tests/rls-integration.test.mjs`.
- Create or modify: `tests/sprint3-e2e-contract.test.mjs`.
- Modify: `docs/planning/sprint3/completion-audit.md` setelah evidence tersedia.
- Modify: `.github/workflows/heartbeat.yml` bila contract auto-release sudah siap.

**Status:** Terbuka. Seed dan test statis tersedia, tetapi smoke test runtime belum terbukti.

- [X] Pertahankan akun demo berbasis UUID yang dibuat atau ditemukan dari Auth, bukan UUID hardcode.
- [ ] Tambahkan marker aman untuk payment `held_escrow`, payment `released`, message task-scoped, notification, emergency, dan report `under_review`.
- [ ] Jalankan migration dan seed dari database kosong sampai dapat diulang tanpa konflik.
- [ ] Jalankan matrix role Keluarga, Helper, Koordinator RT, Koordinator RW, dan Admin untuk RLS serta endpoint.
- [ ] Jalankan smoke test Midtrans Sandbox dengan order demo dan tanpa menyimpan secret, signature sensitif, atau token checkout.
- [ ] Simpan timestamp, status, marker, dan command test sebagai evidence yang aman.
- [ ] Jalankan quality gate lengkap pada commit final dan catat hasil remote CI di audit.

**Acceptance evidence:** satu database bersih dapat menjalankan jalur demo Sprint 3 berulang tanpa edit manual dan tanpa data sensitif di repository.

## Definition of Done Farros

- [ ] `src/types/database.ts` valid dan typecheck tidak memiliki error.
- [ ] Build production lulus pada commit final.
- [ ] Amendment dan bagian TDD terkait payment tidak saling bertentangan.
- [ ] Charge, webhook, release, refund, dan cancel idempotent pada retry dan race.
- [ ] Auto-release 3x24 jam memiliki RPC, heartbeat call, transaction log, dan test.
- [ ] Dua report mengubah Helper menjadi `under_review`, accept task diblokir, dan reviewer dapat mengambil keputusan dengan audit log.
- [ ] Chat server dan UI memakai task scope, relasi ID benar, dan tidak memakai service role untuk bypass hubungan.
- [ ] Notification event matrix memiliki recipient dan read state yang dapat diverifikasi.
- [ ] SOS memiliki conditional acknowledge, scope akses, dan status yang dapat diaudit.
- [ ] Seed reset menghasilkan marker untuk seluruh jalur demo Sprint 3.
- [ ] Smoke test Supabase/RLS dan Midtrans memiliki evidence yang dapat diulang.
- [ ] CI remote pada commit final berstatus sukses.
- [ ] Evidence UI Mervin sudah diterima dan dipetakan ke contract backend.

Farros baru boleh memberi sign-off setelah semua item di atas memiliki evidence. Status lulus pada test source statis, halaman yang berhasil di-build, atau file migration yang ada tidak cukup untuk menutup Definition of Done.

## Addendum: Klarifikasi Scope Farros

Bagian ini ditambahkan tanpa menghapus checklist sebelumnya, supaya tracking pekerjaan Mervin tetap utuh.

### Status kerja Farros saat ini

- [X] Ownership Farros dipisahkan dari ownership Mervin: Farros menangani kontrak, schema, migration, RLS, route API, seed, integration test, CI, dan sign-off.
- [X] Perubahan implementasi backend yang sempat dibuat di working tree dikembalikan. Scope aktif pada dokumen ini kembali menjadi tracking dan pengerjaan bagian Farros.
- [ ] Pulihkan `src/types/database.ts` yang masih kosong pada baseline branch sebelum quality gate dapat dipercaya.
- [ ] Tindak lanjuti error runtime `/helper/pesan`: query di `src/lib/chat/actions.ts` memakai `service_categories.name`, sedangkan kolom schema yang benar adalah `service_categories.nama`.
- [ ] Setelah perbaikan query, jalankan ulang smoke test login Helper, buka `/helper/pesan`, buka percakapan task, kirim pesan, dan tandai pesan dibaca.

### Evidence baru dari dev server

Pada 27 Agustus 2026, dev server berhasil menjalankan login dan beberapa halaman Helper. Jalur `/helper/pesan` menghasilkan error PostgreSQL `42703` karena kolom `service_categories.name` tidak ada. Ini blocker contract/backend Farros, bukan bug visual Mervin. Evidence tersebut belum menutup Task 5 karena test runtime chat belum selesai.

### Handoff untuk Mervin

Mervin tetap melanjutkan tracking UI, Realtime client, accessibility, mobile QA, dan demo walkthrough sesuai checklist sebelumnya. Setelah query chat diperbaiki, Mervin hanya perlu memverifikasi state loading, error, empty, forbidden, read receipt, dan responsive layout pada endpoint task-scoped yang sama.

## Addendum 2: Progress Perbaikan Chat Farros

Perbaikan ini ditambahkan sebagai lanjutan tracking dan tidak menghapus status pekerjaan Mervin.

- [X] Perbaiki select relasi kategori pada `src/lib/chat/actions.ts` dari `service_categories.name` menjadi `service_categories.nama`.
- [X] Selaraskan tipe `TaskInfo` dan mapping `taskTitle` dengan field `nama` pada schema.
- [X] Tambahkan regression test `tests/chat-category-schema.test.mjs` yang awalnya gagal pada mismatch schema, lalu lulus setelah perbaikan.
- [X] `npm.cmd run test` pada snapshot historis: 118 lulus, 0 gagal, 1 skipped.
- [ ] `npm.cmd run typecheck`: masih terblokir oleh `src/types/database.ts` yang kosong pada baseline branch.
- [ ] Verifikasi browser `/helper/pesan` setelah dev server memuat ulang perubahan dan database type contract dipulihkan.

## Addendum 3: Implementasi Farros

Bagian ini mempertahankan checklist sebelumnya sebagai histori tracking. Status berikut adalah hasil implementasi terbaru.

- [X] `src/types/database.ts` dipulihkan dari schema parent dan diperluas untuk enum `refunding` serta RPC Sprint 3.
- [X] Payment intent, Snap token, settlement, nominal webhook, order ID, dan retry settlement dikunci pada `20260827180002_sprint3_payment_integrity.sql`.
- [X] Refund, kompensasi 50%, dan auto-release 72 jam memakai conditional update dan transaction log pada `20260827180003_sprint3_payment_lifecycle.sql`.
- [X] Report review, audit keputusan, batas wilayah Koordinator, dan blokir Helper `under_review` ditambahkan pada `20260827180004_sprint3_report_review.sql`.
- [X] Chat action memakai task scope, validasi server, dan resolusi `helper_profiles.user_id`. Mismatch kategori `name` menjadi `nama` memiliki regression test.
- [X] SOS create dan acknowledge memakai RPC scoped. Trigger notifikasi message dan perubahan status task ditambahkan.
- [X] Seed memiliki marker payment, message, notification, dan emergency yang idempoten.
- [X] Test kontrak tambahan `tests/sprint3-farros-follow-up-contract.test.mjs` lulus bersama suite.
- [X] `npm.cmd run typecheck` lulus.
- [X] `npm.cmd test` lulus: 131 test pass, 1 skipped, 0 failed.
- [ ] `npm.cmd run lint`, `npm.cmd run build`, migration reset, integration RLS, smoke Midtrans, dan CI remote masih harus diverifikasi pada tahap quality gate akhir.
- [ ] Evidence UI, responsive, accessibility, Realtime, dan demo walkthrough tetap menunggu Mervin.

## Addendum 4: Quality Gate Lokal Terakhir

- [x] `npm.cmd run lint` lulus tanpa error.
- [x] `npm.cmd run typecheck` lulus.
- [x] `npm.cmd test` lulus: 125 test pass, 1 skipped, 0 failed.
- [x] `npm.cmd run build` lulus setelah compile, TypeScript, dan static page generation.
- [ ] `npx.cmd supabase db lint` belum dijalankan pada database cloud. Perintah ini memeriksa database lokal dan memerlukan Docker, sehingga bukan validasi deployment cloud.
- [ ] CI remote, smoke RLS, smoke Midtrans Sandbox, dan evidence UI Mervin tetap terbuka.

## Addendum 5: Verifikasi Provider Midtrans

- [x] Credential Midtrans Sandbox terbaca dari `.env.local` tanpa menampilkan secret.
- [x] Request Snap API Sandbox nyata berhasil menghasilkan token dan redirect URL pada order test `RANGKUL-INTEGRATION-20260827162652` dengan nominal Rp10.000.
- [x] Order test tidak menghasilkan pembayaran atau settlement. Pengecekan status provider setelah test mengembalikan `Transaction doesn't exist`, sehingga tidak ada fixture pending yang tertinggal.
- [ ] Callback webhook melalui route production belum dapat diuji end-to-end karena deployment production masih 404 pada endpoint webhook.

## Addendum 6: Jalur Cloud Langsung

- [x] Migrasi pending diterapkan ke project Supabase cloud yang terhubung.
- [x] Seed cloud berhasil dan idempoten setelah update akun existing tidak lagi memaksa perubahan email sensitif.
- [x] Fixture cloud terverifikasi melalui query read-only: task, payment held/released, pesan task-scoped, alert SOS, notifikasi, dan RPC payment/safety/report tersedia.
- [ ] Jangan menjalankan `supabase db reset` untuk verifikasi ini. Itu jalur lokal yang memerlukan Docker, sedangkan environment deployment Rangkul memakai Supabase cloud.
- [ ] Tetap lakukan smoke API authenticated dan cek CI remote sebelum memberi sign-off final.
