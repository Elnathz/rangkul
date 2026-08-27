# Audit Penyelesaian Sprint 3

**Tanggal audit:** 27 Agustus 2026

**Branch:** `dev-eln`

**Commit yang diaudit:** `a3a183ae7255ef163a72f163c611b86635dccdbe`

**Sumber kebenaran:** `docs/TDD_Rangkul.md`, khususnya amendment Sprint 3, §3.4, §3.6, §3.8, §3.10, §4.6, §4.8, §4.9, §4.10, §6, §7, §8, §9, §14.4, §14.5, dan §16.
**Rencana yang diaudit:** `docs/planning/sprint3/plan.md` dan `docs/planning/sprint3/follow-up-plan.md`

## Kesimpulan langsung

Sprint 3 belum selesai secara fungsional dan belum boleh diberi sign-off Farros. PR #23 sudah menggabungkan `develop` ke `dev-eln`, tetapi merge tersebut mengosongkan `src/types/database.ts`. Akibatnya typecheck dan build gagal pada HEAD yang diaudit.

Fondasi payment, layanan tambahan, report, notifikasi, chat, SOS, seed, dan migration sudah ada. Namun evidence yang tersedia masih dominan berupa test source statis. Belum ada bukti yang cukup untuk menyatakan payment idempotent pada race, RLS berjalan pada database nyata, auto-release tersedia, refund dapat direkonsiliasi, atau seluruh event Sprint 3 dapat didemokan ulang.

Status yang benar adalah **implementasi backend sebagian tersedia, tetapi integrasi dan evidence Sprint 3 belum selesai**.

## Ownership Farros

Farros memegang keputusan teknis dan bisnis, kontrak TDD, migration, RPC, RLS, route API, Midtrans, heartbeat, seed, audit log, integration test, final merge, dan sign-off. Bagian UI, mobile QA, accessibility, serta visual review tetap menjadi ownership Mervin.

### Daftar blocker Farros

| Prioritas | Area | Status | Blocker atau bukti yang wajib ditutup |
| --- | --- | --- | --- |
| P0 | Type contract | Terbuka | `src/types/database.ts` kosong. Regenerasi type database diperlukan sebelum typecheck dan build dapat dipercaya. |
| P0 | Payment checkout | Sebagian | RPC intent tersedia, tetapi idempotency provider dan dua charge paralel belum diuji pada database nyata. |
| P0 | Webhook | Sebagian | Signature diverifikasi, tetapi pencocokan `gross_amount`, order, snapshot nominal, dan pencatatan event non-settlement belum terbukti lengkap. |
| P0 | Refund dan auto-release | Terbuka | Status `refunding` sudah ada, tetapi auto-release 3x24 jam belum memiliki RPC/job yang dipanggil heartbeat dan lifecycle provider-database belum diuji. |
| P0 | Report review | Sebagian | Endpoint dan halaman review tersedia, tetapi mutation keputusan, alasan wajib, audit log, dan RLS lintas wilayah belum diuji terintegrasi. |
| P0 | Chat task scope | Sebagian | REST path memakai task, tetapi server action masih memiliki risiko relasi `helper_profiles.id` dan `users.id`, serta inbox masih perlu dibuktikan bebas dari percakapan global. |
| P0 | Notification dan SOS | Sebagian | Route SOS dan acknowledge tersedia, tetapi recipient matrix, RLS, status race, dan event settlement belum memiliki evidence runtime. |
| P1 | Seed dan smoke test | Terbuka | Seed statis tersedia, tetapi reset database, payment marker, RLS matrix, Midtrans Sandbox, dan evidence CI belum lengkap. |
| P1 | Dokumentasi TDD | Terbuka | Amendment Midtrans masih bertentangan dengan beberapa bagian TDD yang menyebut Demo Ledger dan `charge-dummy`. |

## Pembagian ownership

| Pemilik | Tanggung jawab |
| --- | --- |
| Farros | TDD/plan/audit, migration, RPC, RLS, route API, Midtrans, heartbeat, seed, audit log, integration test, final merge, dan sign-off. |
| Mervin | Halaman dan komponen frontend, integrasi endpoint, state loading/error/forbidden, Realtime client, mobile-first, accessibility, visual QA, dan demo walkthrough. |

Aturan kerja:

- Farros memiliki `docs/TDD_Rangkul.md`, `docs/planning/sprint3/**`, `supabase/migrations/**`, `supabase/seed.sql`, `scripts/**`, `src/app/api/**`, `src/lib/midtrans.ts`, `src/lib/audit.ts`, `src/lib/chat/actions.ts`, `src/types/database.ts`, `.github/workflows/**`, dan backend/integration test.
- Mervin memiliki halaman di `src/app/**` selain `api`, komponen di `src/components/**`, utilitas UI, dan frontend/UI test.
- Satu file tidak boleh diedit aktif oleh dua orang. Contract backend yang salah menjadi handoff ke Farros. Bug UI menjadi handoff ke Mervin.
- Farros menggabungkan evidence Mervin ke audit final, tetapi tidak boleh menganggap halaman UI selesai sebagai bukti backend atau RLS selesai.
- Tidak ada mock permanen untuk menutupi API atau provider yang belum siap.

## Status quality gate pada HEAD

| Pemeriksaan | Hasil terbaru | Catatan |
| --- | --- | --- |
| `npm.cmd run test` | Lulus sebagian | 117 lulus, 0 gagal, 1 skipped. Test dominan memeriksa source dan migration, bukan runtime route/RLS. |
| `npm.cmd run lint` | Lulus dengan warning | 0 error, 60 warning. Warning mencakup `img`, unused import/variable, dan unused parameter. |
| `npm.cmd run typecheck` | Gagal | `src/types/database.ts` berukuran 0 byte dan bukan module. Ada juga parameter implicit `any` di route Helper. |
| `npm.cmd run build` | Gagal | Kompilasi berhasil, tetapi proses typecheck berhenti pada import `Database` dari `src/types/database.ts`. |
| CI remote | Gagal sebelum merge | Check `quality-checks` pada [PR #23](https://github.com/Elnathz/rangkul/pull/23) gagal. Tidak ada run baru untuk branch `dev-eln` pada pemeriksaan ini. |
| Smoke test Supabase/RLS | Belum terbukti | Satu test RLS terintegrasi masih skipped ketika environment Supabase tidak tersedia. |
| Smoke test Midtrans | Belum terbukti | Tidak ada bukti create checkout, settlement webhook, refund, atau signature test ke Sandbox nyata. |

## Matriks requirement Sprint 3

| Area | Status | Bukti yang tersedia | Gap Farros | Prioritas |
| --- | --- | --- | --- | --- |
| Payment checkout Midtrans | Sebagian selesai | Route charge dan migration `20260827180000_sprint3_payment_hardening.sql` tersedia. RPC membuat intent payment sebelum request provider. | Order ID masih memakai timestamp dan belum dibuktikan aman untuk retry serta dua request paralel. | P0 |
| Signature webhook | Sebagian selesai | `src/lib/midtrans.ts` memakai SHA-512 dan webhook memeriksa signature sebelum settlement RPC. | Validasi `gross_amount` terhadap `payments.jumlah_total`, order snapshot, dan event non-settlement belum lengkap atau belum diuji. | P0 |
| Settlement dan split 90/7/3 | Sebagian selesai | RPC baseline menghitung split di database dan memakai row lock. | Belum ada integration test dua release bersamaan, pembulatan nominal, saldo ganda, dan recipient notification. | P0 |
| Auto-release 3x24 jam | Belum selesai | Heartbeat saat ini hanya memanggil `expire_pending_tasks`. | Belum ada RPC/job untuk payment `held_escrow` yang melewati 3x24 jam. | P0 |
| Refund dan kompensasi 50/50 | Berisiko | Migration refund menambah status `refunding` serta fungsi prepare/confirm. | Urutan gateway dan database, retry provider, Admin authorization, dan rekonsiliasi kegagalan belum terbukti. | P0 |
| Endpoint cancel | Tidak konsisten | Route cancel tersedia dan validasi alasan sudah ada. | TDD menetapkan `PATCH`, sedangkan route saat ini masih menyediakan `POST`. Kontrak harus diselaraskan tanpa menghapus alias secara sepihak. | P1 |
| Layanan tambahan | Hampir selesai | Route, validasi minimal Rp1.000, RPC, dan test contract tersedia. | Belum ada E2E yang membuktikan task pause, harga final hanya berubah sekali, dan payment membaca harga final. | P1 |
| Laporan formal | Backend sebagian | POST/GET/PATCH report, trigger dua laporan, serta halaman report Koordinator/Admin sudah tersedia setelah merge PR #23. | Review mutation, alasan wajib, audit log, scope wilayah, dan error race belum dibuktikan pada database nyata. | P0 |
| Under review memblokir task | Sebagian | Route accept menolak Helper yang bukan `verified`; seed memiliki Helper `under_review`. | Belum ada integration test dua report lintas keluarga sampai accept menghasilkan 403. | P1 |
| Chat per task | Sebagian | REST message route memakai `task_id`, validasi pesan, dan client authenticated. | `src/lib/chat/actions.ts` masih membandingkan `tasks.helper_id` langsung dengan user Auth pada beberapa path. Inbox juga perlu menolak message tanpa task. | P0 |
| Realtime chat/inbox | Belum terbukti | Tabel messages terdaftar ke Realtime dan komponen chat tersedia. | Evidence subscription, unsubscribe, task channel, dan fallback yang terdokumentasi belum ada. | P1 |
| Notifikasi in-app | Sebagian | API list/read dan trigger booking/SOS tersedia. | Recipient settlement Helper/Koordinator, event matrix lengkap, dan read-state runtime belum diuji. | P1 |
| SOS Helper | Backend dan UI sebagian | Helper dapat membuat alert saat task `dikerjakan`; halaman Koordinator dan endpoint acknowledge tersedia. | Conditional update, RLS wilayah/task, status `resolved`, deduplikasi, dan audit log belum memiliki test terintegrasi. SMS tetap tidak boleh diklaim aktif. | P0 |
| Seed dan jalur demo | Belum terbukti | `scripts/seed.mjs`, seed account matrix, report `under_review`, task status, dan snapshot tersedia. | Belum ada reset database bersih yang menghasilkan payment, message, notification, dan emergency marker yang dapat diuji ulang. | P1 |

## Temuan teknis paling berbahaya

### 1. Type database terhapus

`src/types/database.ts` berukuran 0 byte pada HEAD. Banyak route, client Supabase, dan utilitas mengimpor `Database` dari file tersebut. Ini menyebabkan typecheck dan build gagal. Farros harus memulihkan atau meregenerasi type database dari schema migration sebelum status quality gate dapat disebut hijau.

### 2. Payment belum memiliki evidence lifecycle penuh

Migration intent dan status refund sudah ditambahkan, tetapi keberadaan fungsi tidak membuktikan transaksi aman. Farros masih perlu membuktikan charge paralel, webhook nominal salah, settlement ganda, refund gateway yang berhasil saat update database gagal, dan auto-release 3x24 jam.

### 3. Relasi ID chat masih rawan

`tasks.helper_id` menyimpan ID `helper_profiles`, sedangkan peserta message memakai ID user Auth. Query server action yang membandingkan keduanya langsung dapat menolak Helper yang sah atau membuka scope yang salah. Semua path chat harus melalui resolusi `helper_profiles.user_id` dan policy task yang sama.

### 4. Dokumentasi provider belum konsisten

Amendment TDD memilih Midtrans Sandbox dan mengecualikan Demo Ledger dari implementasi Sprint 3. Namun §3.4, §7, §14.1, §14.4, §14.5, dan §15 masih memuat fallback Saldo Demo atau `charge-dummy`. Dokumen ini mencatat konflik tersebut sebagai blocker. Perubahannya berada di luar scope dua file ini.

## Evidence yang harus dikumpulkan Farros

- Type database berhasil diregenerasi dan `npm.cmd run typecheck` serta `npm.cmd run build` lulus.
- Migration Supabase berhasil dijalankan dari database kosong dan dapat diulang tanpa konflik.
- Integration test membuktikan RLS role, conditional update, payment lock, refund retry, auto-release, report review, chat scope, notification recipient, dan SOS acknowledge.
- Smoke test Midtrans Sandbox menyimpan hanya status, timestamp, dan marker aman tanpa secret, signature sensitif, atau token checkout.
- CI remote pada commit final berstatus sukses.
- Evidence UI dari Mervin diterima dan dipetakan ke contract backend, bukan menggantikan evidence backend.

## Batas audit

Audit ini tidak menganggap file route, migration, atau test statis sebagai bukti runtime. Audit juga tidak mengubah TDD yang masih konflik, tidak mengklaim SMS aktif, dan tidak memberi sign-off sebelum typecheck, build, integration test, smoke test, serta CI final lulus.

## Addendum: Status Scope Farros

Addendum ini mempertahankan seluruh struktur audit dan ownership Mervin. Fokusnya hanya memperjelas pekerjaan Farros dan evidence terbaru.

### Evidence runtime terbaru

- Dev server berhasil menjalankan login Helper, `/helper/dashboard`, `/tugas`, dan `/notifikasi`.
- `/helper/pesan` gagal pada query database dengan error `42703`: `service_categories.name` tidak ada. Schema memakai kolom `service_categories.nama`.
- Lokasi blocker: `src/lib/chat/actions.ts`, jalur `getInbox`.
- Status: blocker Farros untuk contract query chat. Belum boleh ditutup sebagai issue UI Mervin.

### Keputusan scope

- Implementasi backend tambahan tidak dianggap selesai hanya karena route atau migration terlihat tersedia.
- Perubahan source backend yang sempat dibuat untuk menutup follow-up sudah dikembalikan, sehingga dokumen ini tidak menyamarkan status branch.
- Farros perlu memperbaiki query `name` menjadi `nama`, lalu mengumpulkan smoke test chat task-scoped sebelum Task 5 dapat diberi status selesai.
- Mervin tetap dilacak pada bagian UI, Realtime, accessibility, mobile QA, dan demo walkthrough. Tidak ada checklist Mervin yang dihapus atau dianggap selesai berdasarkan error backend ini.

## Addendum 2: Hasil Perbaikan Chat

- Query kategori pada `src/lib/chat/actions.ts` sudah diperbaiki agar memakai `service_categories.nama` sesuai schema.
- Regression test `tests/chat-category-schema.test.mjs` membuktikan mismatch lama dapat ditangkap dan sekarang lulus.
- Full test terbaru pada snapshot historis: 118 lulus, 0 gagal, 1 skipped.
- Typecheck belum hijau karena `src/types/database.ts` masih kosong pada baseline branch. Ini tetap blocker Farros terpisah dari perbaikan query chat.
- Browser smoke test `/helper/pesan` perlu diulang setelah type contract database dipulihkan. Perbaikan query saja belum cukup untuk memberi sign-off Sprint 3.

## Addendum 3: Status Implementasi Farros

Addendum ini mempertahankan audit awal dan tracking Mervin. Snapshot sebelumnya tetap berlaku sebagai histori, sedangkan evidence terbaru dicatat di sini.

### Perubahan yang sudah dikerjakan

- `src/types/database.ts` sudah dipulihkan dan diperbarui untuk enum `refunding` serta RPC payment, report, dan safety.
- Payment intent dan Snap token sekarang memakai order ID deterministik per task. Settlement memeriksa status, order, nominal, dan signature sebelum mengubah payment menjadi `held_escrow`.
- Refund diberi state `refunding`, kompensasi pembatalan dihitung 50%, dan auto-release 72 jam membagi 90/7/3 dengan row lock serta transaction log.
- Report review memakai RPC dengan scope Admin atau Koordinator wilayah, alasan keputusan, dan audit log. Trigger tetap menghitung dua laporan aktif dan acceptance Helper `under_review` diblokir di database.
- Chat server action memperbaiki relasi `helper_profiles.id` ke `helper_profiles.user_id`, mewajibkan task context, dan memperbaiki field kategori dari `name` ke `nama`.
- SOS create dan acknowledge memakai RPC, alert aktif dideduplikasi per task, akses dibatasi berdasarkan task atau wilayah, dan notifikasi task/message dibuat oleh trigger database.
- Seed menambahkan marker idempoten untuk payment held/released, chat task-scoped, notification, dan SOS.

### Evidence lokal terbaru

| Pemeriksaan | Hasil | Batas evidence |
| --- | --- | --- |
| `npm.cmd run typecheck` | Lulus | Type contract lokal sudah konsisten. |
| `npm.cmd test` | 131 pass, 1 skipped, 0 failed | Test masih dominan source contract. Test RLS tetap skipped tanpa environment. |
| `tests/sprint3-farros-follow-up-contract.test.mjs` | Lulus | Memastikan migration, route, seed, dan batas bypass service role tetap ada. |
| Supabase migration reset | Belum dijalankan | Docker Desktop engine tidak tersedia pada environment ini. |
| Midtrans Sandbox | Belum dijalankan | Credential dan checkout Sandbox nyata belum tersedia. |

### Status audit saat ini

Implementasi source Farros sudah diperluas dan typecheck serta test lokal sudah lulus. Sprint 3 tetap belum boleh diberi sign-off penuh karena lint, build, migration reset, integration RLS, smoke Midtrans, CI remote, dan evidence UI Mervin belum seluruhnya terkumpul. Ini status evidence yang belum lengkap, bukan klaim bahwa runtime production sudah terverifikasi.

## Addendum 4: Quality Gate Lokal Terakhir

Quality gate dijalankan ulang setelah perubahan terakhir dan pemasangan dependency dari lockfile.

| Pemeriksaan | Hasil |
| --- | --- |
| `npm.cmd run lint` | Lulus tanpa error |
| `npm.cmd run typecheck` | Lulus |
| `npm.cmd test` | 131 pass, 1 skipped, 0 failed |
| `npm.cmd run build` | Lulus sampai compile, TypeScript, dan static page generation |
| `npx.cmd supabase db lint` | Terblokir karena Postgres lokal `127.0.0.1:54322` tidak aktif |

Kesimpulan tetap sama: source contract Farros sudah terimplementasi dan quality gate lokal hijau, tetapi sign-off Sprint 3 belum sah sebelum migration reset, integration RLS, smoke Midtrans, CI remote, dan evidence UI Mervin tersedia.

## Addendum 5: Smoke Test Midtrans Sandbox

Provider Midtrans Sandbox berhasil diuji dengan credential dari `.env.local`. Request Snap API nyata menghasilkan token dan redirect URL untuk order `RANGKUL-INTEGRATION-20260827162652` dengan nominal Rp10.000. Tidak ada pembayaran atau settlement yang dilakukan. Pengecekan status setelah test mengembalikan `Transaction doesn't exist`, sehingga tidak ada transaksi pending yang tertinggal.

Evidence ini membuktikan koneksi credential dan provider helper, bukan settlement route aplikasi. Webhook aplikasi tetap membutuhkan database Supabase aktif agar bisa diuji sampai RPC settlement dan notifikasi.

## Addendum 6: Verifikasi Supabase Cloud

- [x] Project Supabase cloud berhasil terdeteksi melalui `supabase migration list --linked`.
- [x] Migrasi `20260827180000` sampai `20260827180005` berhasil tercatat di remote.
- [x] Migrasi Sprint 4 yang sudah ada di workspace juga tercatat di remote sebagai `20260828090000`; Docker tidak dipakai untuk koneksi cloud.
- [x] Seed cloud berhasil dijalankan ulang setelah seed diperbaiki agar tidak mengubah email akun yang sudah ada.
- [x] Query read-only cloud menemukan 9 task demo, 2 payment demo, 1 pesan task-scoped, 1 alert SOS, 1 notifikasi SOS, dan 8 fungsi RPC Sprint 3.

Status migration dan fixture cloud sekarang terbukti. Settlement webhook aplikasi, RLS lint, dan CI remote tetap membutuhkan verifikasi terpisah.
