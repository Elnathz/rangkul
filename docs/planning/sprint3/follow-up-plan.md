# Sprint 3 Completion Follow-up Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menutup gap P0 dan P1 Sprint 3 sampai alur payment, laporan, chat, notifikasi, dan SOS dapat didemokan dari database nyata dengan batas akses yang sesuai TDD.

**Architecture:** Pertahankan Midtrans Sandbox sebagai provider Sprint 3 sesuai amendment TDD terbaru. Semua perubahan state payment, report, task, dan safety dilakukan melalui RPC atau route server yang idempotent. Frontend memakai endpoint task-scoped yang sama dengan API contract dan tidak memakai `service_role` untuk membaca atau menulis data user.

**Tech Stack:** Next.js App Router, TypeScript, Supabase PostgreSQL, Supabase Realtime, Midtrans Snap Sandbox, Zod, Node test runner, GitHub Actions.

**Spec:** `docs/TDD_Rangkul.md`, `docs/planning/sprint3/completion-audit.md`, `docs/planning/sprint3/plan.md`

## Global Constraints

- `docs/TDD_Rangkul.md` adalah sumber kebenaran business rule, schema, API, dan RLS.
- Field dan endpoint Bahasa Indonesia dari TDD dipertahankan persis.
- Payment tidak boleh menerima nominal atau split sebagai otoritas dari browser.
- Release normal memakai 90% Helper, 7% Platform, dan 3% Koordinator.
- Kompensasi pembatalan setelah `held_escrow` memakai 50% Helper dan 50% refund Keluarga, tanpa fee Platform atau Koordinator.
- Dua laporan aktif terhadap Helper yang sama mengubah status menjadi `under_review`; status tersebut memblokir accept task dan bukan keputusan suspend final.
- Chat Sprint 3 harus terkait task dan hanya tersedia untuk peserta task yang diizinkan.
- Dokumen sensitif, report, Health Snapshot, payment, message, dan emergency tetap dibatasi RLS.
- Semua UI mobile-first pada viewport 375px, 768px, 1024px, dan 1440px.
- Sebelum commit, jalankan `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test`, dan `npm run build`.

## Pembagian kerja Farros dan Mervin

Farros menjadi **accountable utama**. Ia memegang keputusan akhir, contract, schema, security, final merge, dan sign-off Sprint 3. Mervin menjadi owner frontend dan integrasi UI. Mervin dapat melakukan review dan mengajukan perubahan, tetapi perubahan contract, migration, RLS, dan route API tetap melalui Farros.

### Ownership file

| Farros | Mervin |
| --- | --- |
| `docs/TDD_Rangkul.md` | Review requirement dan acceptance criteria UI |
| `docs/planning/sprint3/**` | Kirim evidence UI kepada Farros |
| `supabase/migrations/**` | `src/app/**` selain `src/app/api/**` |
| `supabase/seed.sql` dan `scripts/**` | `src/components/**` |
| `src/app/api/**` | `src/hooks/**` dan utilitas UI |
| `src/lib/midtrans.ts` | UI payment dan status transaksi |
| `src/lib/audit.ts` | UI report, review, dan safety |
| `src/lib/chat/actions.ts` | UI chat, inbox, dan Realtime client |
| `src/types/database.ts` | UI notification dan SOS |
| `.github/workflows/**` | Frontend/UI test, mobile QA, dan visual review |
| Backend, migration, RLS, dan integration test | Demo walkthrough dan accessibility review |

### Pembagian Task 1 sampai 7

| Task | Farros | Mervin | Output sebelum pindah task |
| --- | --- | --- | --- |
| Task 1 | Selaraskan TDD, plan, provider, endpoint, dan deferred scope. | Review semua acceptance criteria yang terlihat di UI. | Keputusan provider final dan daftar scope yang tidak dikerjakan di Sprint 3. |
| Task 2 | Idempotency checkout, webhook integrity, RPC, migration, types, dan test. | Audit halaman payment dan daftar state/error yang harus ditampilkan. | Response payment, status final, error code, dan aturan retry. |
| Task 3 | Refund, kompensasi, auto-release, heartbeat, dan lifecycle test. | Uji copy serta state payment dari response server. | Contract retry, status refund, dan hasil auto-release. |
| Task 4 | Report API, review mutation, status Helper, RLS, audit log, dan backend test. | Halaman report Koordinator/Admin dan UI test. | Shape report, aksi yang diizinkan, dan alasan wajib. |
| Task 5 | Task scope messages, relasi ID, RLS, server action/API, Realtime channel, dan backend test. | Inbox, room, read receipt, responsive layout, Realtime client, dan UI test. | `task_id` wajib, participant rule, dan event payload. |
| Task 6 | Notification recipient, emergency API, RLS, conditional acknowledge, migration, dan backend test. | Halaman darurat, acknowledge UI, notification page, dan status copy. | Recipient matrix, status alert, dan error 409. |
| Task 7 | Seed marker, Supabase/RLS smoke test, Midtrans smoke test, dan CI evidence. | Mobile matrix, accessibility, visual QA, dan demo walkthrough. | Evidence teknis dan UI lengkap, lalu Farros memberi sign-off. |

### Branch dan handoff

Gunakan branch terpisah:

- Farros: `feature/sprint3-backend-hardening`
- Mervin: `feature/sprint3-frontend-review-ux`

Urutan integrasi:

1. Farros menyelesaikan Task 1 dan menulis contract checkpoint di `completion-audit.md`.
2. Mervin mereview checkpoint. Jika response shape atau error code belum jelas, UI terkait belum boleh dianggap siap.
3. Farros mengerjakan Task 2 dan Task 3. Mervin tidak mengubah route atau migration pada branch yang sama.
4. Farros menulis checkpoint untuk report, chat, notification, dan emergency. Setelah itu Mervin mengerjakan UI Task 4 sampai Task 6.
5. Setiap handoff mencantumkan file, method/path endpoint, request, response sukses, response error, role, migration, dan command test.
6. Farros melakukan final merge ke `develop`. Setelah merge Farros, jalankan quality gate. Setelah merge Mervin, jalankan quality gate penuh lagi.
7. Farros memperbarui audit terakhir berdasarkan evidence Mervin dan hasil smoke test.

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

## Urutan pengerjaan

### Task 1: Selaraskan keputusan TDD dan rencana Sprint 3

**Files:**
- Modify: `docs/TDD_Rangkul.md` bagian §3.4, §4.6, §7, §14.1, §14.4, §14.5, §15.
- Modify: `docs/planning/sprint3/plan.md` bagian keputusan, endpoint, dan acceptance criteria.
- Reference: `docs/planning/sprint3/completion-audit.md` bagian konflik dokumentasi.

**Interfaces:**
- Produces: satu keputusan tertulis bahwa Sprint 3 memakai Midtrans Sandbox dan tidak mengimplementasikan `charge-dummy`.
- Produces: daftar deferred yang jelas untuk Demo Ledger, saldo dummy, `charge-dummy`, dan halaman Admin demo wallet. Auto-release tetap berada di Sprint 3 karena FR-PAY-03 berstatus Must.

- [x] Tandai bagian TDD lama yang masih menjadikan Demo Ledger sebagai payment core.
- [x] Selaraskan endpoint payment dan hasil demo dengan amendment Sprint 3.
- [x] Tulis acceptance criteria yang dapat diverifikasi: checkout, webhook valid, webhook invalid, split, refund, laporan dua kali, chat task-scoped, notifikasi, dan SOS acknowledge.
- [x] Review ulang perubahan dokumentasi sebelum menyentuh schema agar tidak membangun dua provider yang bertentangan.

### Task 2: Kunci idempotency checkout dan settlement payment

**Files:**
- Create: `supabase/migrations/20260824180000_sprint3_payment_hardening.sql`.
- Modify: `src/app/api/payments/[task_id]/charge/route.ts`.
- Modify: `src/app/api/payments/webhook/route.ts`.
- Modify: `src/lib/midtrans.ts`.
- Modify: `src/types/database.ts` jika schema berubah.
- Test: `tests/payment-idempotency.test.mjs`.
- Test: `tests/payment-webhook-integrity.test.mjs`.

**Interfaces:**
- Consumes: `payments.task_id`, `payments.jumlah_total`, `payments.midtrans_order_id`, dan RPC payment yang sudah ada.
- Produces: satu checkout aktif per task, settlement idempotent, dan penolakan nominal webhook yang tidak sama dengan snapshot server.

- [x] Tambahkan constraint atau RPC persiapan payment yang membuat row `pending` sebelum provider dipanggil dan mengunci task/payment berdasarkan `task_id`.
- [x] Gunakan order ID deterministik atau idempotency key yang dapat dipakai ulang untuk retry task yang sama.
- [x] Jika payment sudah `pending` dengan token valid, kembalikan checkout yang sama tanpa request baru ke Midtrans.
- [x] Di webhook, validasi `order_id`, `status_code`, `gross_amount`, signature, status transaction, dan payment snapshot sebelum memanggil settlement RPC.
- [x] Buat settlement RPC yang aman dipanggil berulang. Panggilan kedua mengembalikan payment final tanpa menulis split atau saldo kedua kali.
- [x] Catat event webhook yang relevan di `transaction_logs` tanpa menyimpan secret atau data sensitif.
- [x] Uji nominal berbeda, signature salah, order tidak dikenal, webhook dua kali, dan dua charge paralel.

### Task 3: Tutup refund, kompensasi, dan auto-release

**Files:**
- Create: `supabase/migrations/20260824181000_sprint3_payment_lifecycle.sql`.
- Modify: `src/app/api/payments/[task_id]/refund/route.ts`.
- Modify: `src/app/api/tasks/[id]/cancel/route.ts`.
- Modify: `.github/workflows/heartbeat.yml`.
- Modify: `tests/task-scheduling-actions.test.mjs` atau buat `tests/payment-lifecycle.test.mjs`.

**Interfaces:**
- Consumes: `cancel_task_with_compensation`, `release_task_payment`, `refund_midtrans_payment`, dan `expire_pending_tasks`.
- Produces: lifecycle payment yang dapat dipulihkan ketika provider dan database selesai pada waktu berbeda.

- [x] Samakan HTTP method cancel dengan TDD `PATCH /api/tasks/:id/cancel`; pertahankan alias hanya jika ada alasan kompatibilitas yang terdokumentasi.
- [x] Tambahkan state atau idempotency marker untuk intent refund agar retry tidak mengirim refund kedua.
- [x] Pastikan otorisasi RPC refund menerima Admin yang memang diizinkan route, atau ubah route agar memanggil service role melalui server yang sudah melakukan `requireAdmin`.
- [x] Jangan menganggap refund gateway sukses sebagai payment database final sebelum hasil gateway dan update database tercatat.
- [x] Tambahkan RPC service role untuk auto-release payment held yang sudah melewati 3x24 jam sesuai rule TDD, dengan conditional update dan log event `released`.
- [x] Panggil RPC auto-release dari heartbeat dengan secret service role dan tangani hasil nol row sebagai kondisi normal.
- [x] Uji cancel dua kali, refund dua kali, release dua kali, cancel versus release bersamaan, dan provider timeout setelah database mencatat intent.

### Task 4: Selesaikan review report dan status `under_review`

**Files:**
- Modify: `src/app/(koordinator)/koordinator/laporan/page.tsx`.
- Modify: `src/app/(admin)/admin/reports/page.tsx`.
- Modify: `src/app/api/reports/route.ts`.
- Modify: `src/app/api/reports/[id]/route.ts`.
- Modify: `src/app/api/admin/helpers/[id]/route.ts` jika keputusan release perlu endpoint khusus.
- Modify: `src/lib/audit.ts` dan migration audit bila keputusan review belum tercatat.
- Test: `tests/report-review-flow.test.mjs`.
- Test: `tests/under-review-acceptance.test.mjs`.

**Interfaces:**
- Consumes: `GET /api/reports`, `PATCH /api/reports/:id`, status Helper, dan RLS region-scoped.
- Produces: reviewer dapat melihat, menindak, melepas review, atau mensuspend dengan alasan dan audit log.

- [x] Buat kartu report dengan status `menunggu`, `ditindak`, `selesai`, alasan, task terkait yang aman, dan waktu.
- [x] Koordinator hanya melihat Helper yang terikat pada wilayahnya. Admin melihat seluruh report melalui endpoint Admin yang eksplisit.
- [x] Pisahkan keputusan report dari status final Helper. `under_review` tetap berarti sedang ditinjau, bukan terbukti bersalah.
- [x] Tambahkan aksi review dengan alasan wajib untuk melepas `under_review` atau mengeskalasi ke `suspended`.
- [x] Catat actor, keputusan, alasan, Helper, dan report di `audit_logs`.
- [x] Tambahkan test dua report dari keluarga berbeda, rating satu bintang tanpa suspend, Helper under review gagal accept dengan 403, dan reviewer lintas wilayah gagal membaca atau mengubah report.

### Task 5: Jadikan chat task-scoped dan konsisten dengan RLS

**Files:**
- Modify: `src/lib/chat/actions.ts`.
- Modify: `src/components/chat/InboxList.tsx`.
- Modify: `src/components/chat/ChatRoomClient.tsx`.
- Modify: `src/components/ui/InboxUI.tsx` atau tetapkan sebagai komponen legacy yang tidak dipakai.
- Modify: `src/app/(keluarga)/beranda/pesan/layout.tsx` dan route terkait.
- Modify: `src/app/(helper)/helper/pesan/layout.tsx` dan route terkait.
- Modify: `src/app/(koordinator)/koordinator/pesan/layout.tsx` bila Koordinator hanya menerima notifikasi pasif, bukan chat bebas.
- Create: `supabase/migrations/20260824182000_sprint3_messages_scope.sql`.
- Test: `tests/messages-task-scope.test.mjs`.
- Test: `tests/messages-rls.test.mjs`.

**Interfaces:**
- Consumes: `GET /api/messages/conversations`, `GET /api/messages/:task_id`, `POST /api/messages`, dan `PATCH /api/messages/:id/read`.
- Produces: inbox berisi task, room hanya memuat peserta task, dan read receipt yang tidak memakai service role dari browser path.

- [x] Hapus ketergantungan inbox pada pencarian user bebas dan `sendMessage` tanpa `taskId`.
- [x] Perbaiki semua query yang membedakan `tasks.helper_id` dari `helper_profiles.user_id`.
- [x] Pastikan route dan RLS menolak keluarga, Helper, Koordinator, atau Admin yang bukan peserta atau relasi yang diizinkan.
- [x] Tampilkan `task_id` atau ringkasan task pada setiap conversation agar konteks tidak hilang.
- [x] Ganti polling 3 detik dengan Supabase Realtime subscription pada task scope dan unsubscribe ketika room ditutup.
- [x] Tampilkan forbidden, empty, loading, dan retry state yang berbeda.
- [x] Uji silang task, task tanpa helper, read receipt milik user lain, dan pengiriman pesan tanpa task.

### Task 6: Selesaikan notifikasi dan SOS reviewer UI

**Files:**
- Modify: `src/app/(koordinator)/koordinator/darurat/page.tsx`.
- Modify: komponen halaman Keluarga atau Koordinator yang menerima alert.
- Modify: `src/components/notifications/NotificationPageClient.tsx`.
- Modify: `src/components/ui/SOSDialog.tsx` bila perlu menampilkan status dari server.
- Modify: `src/app/api/emergency/[id]/acknowledge/route.ts`.
- Create: `supabase/migrations/20260824183000_sprint3_notification_emergency_hardening.sql`.
- Test: `tests/notification-event-matrix.test.mjs`.
- Test: `tests/emergency-review-flow.test.mjs`.

**Interfaces:**
- Consumes: notifications API, emergency API, dan RLS emergency contacts.
- Produces: alert aktif dapat dibaca dan di-acknowledge oleh pihak yang tepat, tanpa klaim SMS yang belum diuji.

- [x] Buat daftar alert aktif untuk Koordinator berdasarkan wilayah dan untuk Keluarga berdasarkan task.
- [x] Tambahkan acknowledge action dengan conditional update `status = active` dan refresh setelah 409.
- [x] Tampilkan status `active`, `acknowledged`, dan `resolved` sesuai response server.
- [x] Tambahkan notification event matrix untuk task, payment, message, emergency, dan `koordinator_info`.
- [x] Kirim notifikasi payment settlement kepada Keluarga, Helper, dan Koordinator jika TDD mengharuskannya pada event tersebut.
- [x] Ganti fetch sekali pada halaman notifikasi dengan Realtime subscription atau refresh berbasis event yang terdokumentasi.
- [x] Pertahankan copy bahwa SOS mengirim in-app dan membuka `tel:112`; jangan menulis SMS aktif tanpa provider teruji.

### Task 7: Tambahkan smoke test dan evidence demo

**Files:**
- Create: `tests/sprint3-e2e-contract.test.mjs`.
- Modify: `tests/rls-integration.test.mjs` agar tidak diam-diam skip ketika environment Supabase tersedia.
- Modify: `supabase/seed.sql` atau `scripts/seed.mjs` untuk marker payment, message, notification, dan emergency yang aman.
- Modify: `docs/planning/sprint3/completion-audit.md` dengan hasil evidence setelah test.
- Modify: `README.md` bila langkah Sandbox, webhook, dan seed perlu didokumentasikan.

**Interfaces:**
- Consumes: seluruh endpoint Sprint 3, migration baseline, seed command, dan environment secret.
- Produces: evidence yang dapat diulang untuk jalur demo tanpa menaruh secret di repository.

- [x] Jalankan `npm ci` memakai lockfile yang ada.
- [x] Jalankan test migration pada database Supabase lokal dari keadaan kosong.
- [x] Jalankan matrix role untuk Keluarga, Helper, Koordinator RT, Koordinator RW, dan Admin.
- [x] Uji payment dengan Midtrans Sandbox menggunakan order demo yang tidak memakai data produksi.
- [x] Simpan hanya hasil status, timestamp, dan marker test. Jangan commit server key, signature payload sensitif, atau token checkout.
- [x] Verifikasi tiga ukuran mobile minimum, 375px, 768px, 1024px, dan 1440px, untuk payment, report, chat, notification, dan SOS.
- [x] Jalankan quality gate lengkap setelah perubahan terakhir dan catat hasilnya di audit.

## Definition of Done

- [x] Amendment dan bagian TDD terkait payment tidak saling bertentangan.
- [x] Charge, webhook, release, refund, dan cancel idempotent pada retry dan race.
- [x] Auto-release 3x24 jam memiliki RPC, heartbeat call, transaction log, dan test.
- [x] Dua report mengubah Helper menjadi `under_review`, accept task diblokir, dan reviewer dapat mengambil keputusan dengan audit log.
- [x] Chat UI memakai task scope, tidak mengandalkan `service_role` untuk bypass hubungan, dan memakai Realtime atau fallback yang terdokumentasi.
- [x] Notifikasi payment, report, task, message, dan emergency memiliki recipient dan read state yang dapat diverifikasi.
- [x] Helper dapat mengirim SOS, pihak yang sah dapat melihat alert, acknowledge, dan memahami statusnya.
- [x] Tidak ada halaman Sprint 3 P0 yang masih menampilkan placeholder.
- [x] `npm run lint`, `npm run typecheck`, `npm run test`, dan `npm run build` lulus setelah perubahan terakhir.
- [x] Smoke test Supabase dan Midtrans memiliki evidence yang dapat diulang.
