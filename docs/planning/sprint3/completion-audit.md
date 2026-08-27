# Audit Penyelesaian Sprint 3

**Tanggal audit:** 24 Agustus 2026  
**Branch:** `develop`  
**Sumber kebenaran:** `docs/TDD_Rangkul.md`, terutama amendment Sprint 3 di baris 3, §3.4, §3.6, §3.8, §3.10, §4.6, §4.8, §4.9, §4.10, §6, §7, §8, §9, §14.4, §14.5, dan §16.  
**Rencana yang diaudit:** `docs/planning/sprint3/plan.md`

## Kesimpulan langsung

Sprint 3 belum selesai secara fungsional. Fondasi backend payment, layanan tambahan, laporan formal, notifikasi dasar, chat API, dan SOS sudah ada. Namun jalur demo yang dijanjikan belum utuh karena:

1. Review laporan Koordinator/Admin dan acknowledge SOS belum memiliki UI. Halaman yang dibutuhkan masih placeholder.
2. Chat yang aktif di UI memakai server action dengan `service_role`, percakapan bebas antar user, dan polling. Ini tidak sama dengan chat per task yang dibatasi TDD.
3. Ada bug relasi ID pada REST chat. `tasks.helper_id` menyimpan ID `helper_profiles`, tetapi beberapa route membandingkannya langsung dengan ID user Auth.
4. Payment belum aman untuk produksi demo berulang. Race pada charge, validasi nominal webhook, urutan refund Midtrans versus update database, dan auto-release belum ditutup.
5. Tidak ada bukti smoke test terhadap Supabase nyata dan Midtrans Sandbox. Test yang lulus hampir seluruhnya berupa pemeriksaan source code statis.

Build hijau tidak mengubah kesimpulan ini. Kondisi saat ini lebih tepat disebut **backend foundation selesai, integrasi E2E Sprint 3 belum selesai**.

## Pembagian ownership yang disarankan

Farros menjadi **accountable utama** Sprint 3. Mervin menjadi owner eksekusi frontend dan integrasi UI. Pembagian ini dibuat berdasarkan batas file supaya pekerjaan tidak saling menimpa.

| Pemilik | Tanggung jawab |
| --- | --- |
| Farros | Keputusan teknis dan bisnis, TDD/plan/audit, migration, RPC, RLS, route API, Midtrans, heartbeat, seed, audit log, integration test, final merge, dan sign-off. |
| Mervin | Halaman dan komponen frontend, integrasi endpoint, state loading/error/forbidden, Realtime client, mobile-first, accessibility, visual QA, dan demo walkthrough. |

Aturan kerja:

- Farros memiliki `docs/TDD_Rangkul.md`, `docs/planning/sprint3/**`, `supabase/migrations/**`, `supabase/seed.sql`, `scripts/**`, `src/app/api/**`, `src/lib/midtrans.ts`, `src/lib/audit.ts`, `src/lib/chat/actions.ts`, `src/types/database.ts`, `.github/workflows/**`, dan backend/integration test.
- Mervin memiliki halaman di `src/app/**` selain `api`, komponen di `src/components/**`, utilitas UI, dan frontend/UI test.
- Satu file tidak boleh diedit aktif oleh dua orang. Jika Mervin menemukan contract backend yang salah, ia menulis handoff untuk Farros. Jika Farros menemukan bug UI, ia menulis handoff untuk Mervin.
- Farros menjadi penulis akhir `completion-audit.md` dan `follow-up-plan.md`. Mervin mengirim evidence UI dan review requirement, lalu Farros yang menggabungkannya.
- Tidak ada mock permanen untuk menutupi API yang belum siap. UI menunggu contract Farros atau menggunakan response shape yang sudah dicatat di plan.

Mapping gap ke owner:

| Gap | Owner | Reviewer |
| --- | --- | --- |
| Konflik TDD Midtrans versus Demo Ledger | Farros | Mervin |
| Idempotency checkout, webhook, refund, auto-release | Farros | Mervin |
| Report API, review state, audit, dan RLS | Farros | Mervin |
| Halaman report Koordinator/Admin | Mervin | Farros |
| Chat task-scoped, relasi ID, RLS, dan Realtime server | Farros | Mervin |
| Chat inbox dan room UI | Mervin | Farros |
| Notification event dan emergency API/RLS | Farros | Mervin |
| Halaman notifikasi, SOS, acknowledge, dan status | Mervin | Farros |
| Seed, smoke test Supabase, dan CI heartbeat | Farros | Mervin |
| Mobile QA dan visual review | Mervin | Farros |

Pola dependensinya adalah **Farros mengunci contract, Mervin mengonsumsi contract**. Jangan mengerjakan satu fitur dengan dua branch yang sama-sama mengubah API dan halaman tanpa checkpoint contract.

## Status quality gate lokal

| Pemeriksaan | Hasil | Catatan |
| --- | --- | --- |
| `npm.cmd run lint` | Lulus | 0 error, 44 warning. Warning mencakup `img` tidak teroptimasi dan unused variable. |
| `npm.cmd run typecheck` | Lulus | Tidak ada error TypeScript. |
| `npm.cmd run test` | Lulus sebagian | 117 lulus, 0 gagal, 1 `skipped`. Test dominan membaca isi file, bukan menjalankan route dan RLS pada database. |
| `npm.cmd run build` | Lulus | 82 halaman berhasil dibuat. Halaman placeholder tetap ikut ter-build sebagai halaman valid. |
| CI remote | Belum diverifikasi | Tidak ada pemeriksaan status workflow remote pada audit ini. |
| Smoke test Midtrans | Belum ada bukti | Tidak ada create checkout, webhook settlement, refund, atau signature test terhadap Sandbox nyata. |
| Smoke test Supabase/RLS | Belum lengkap | Test RLS terintegrasi masih `skipped`. |

## Matriks requirement Sprint 3

| Area | Status | Bukti yang sudah ada | Yang belum dikerjakan atau belum terbukti | Prioritas |
| --- | --- | --- | --- | --- |
| Payment checkout Midtrans | Sebagian selesai | `POST /api/payments/:task_id/charge`, status, webhook, dan refund tersedia. Checkout dibuat server-side. | Request charge bersamaan dapat membuat lebih dari satu order Midtrans sebelum row payment tersimpan. Tidak ada idempotency key atau lock sebelum memanggil provider. | P0 |
| Signature webhook | Sebagian selesai | `src/lib/midtrans.ts` memakai SHA-512 dan webhook memvalidasi sebelum RPC settlement. | Webhook tidak memeriksa `gross_amount` terhadap `payments.jumlah_total`. Signature valid dengan nominal berbeda masih dapat masuk ke RPC. Status non-settlement tidak dicatat sebagai event payment. | P0 |
| Settlement dan split 90/7/3 | Sebagian selesai | RPC `release_task_payment` menghitung split di database dan mengunci payment dengan `FOR UPDATE`. | Tidak ada test database yang membuktikan dua release bersamaan, saldo tidak dobel, dan pembulatan seluruh nominal. Notifikasi settlement belum dikirim ke Helper dan Koordinator sesuai event flow TDD. | P0 |
| Auto-release 3x24 jam | Belum selesai | Heartbeat hanya memanggil `expire_pending_tasks`. | Tidak ada RPC/job yang mencari payment `held_escrow` yang melewati 3x24 jam lalu merilisnya. FR-PAY-03 masih terbuka. | P0 |
| Refund dan kompensasi 50/50 | Berisiko | `cancel_task_with_compensation` dan route cancel sudah ada. | Route memanggil refund Midtrans lebih dulu, lalu baru RPC database. Jika RPC gagal setelah refund berhasil, status dan uang gateway dapat tidak sinkron. Route refund Admin juga memanggil RPC yang hanya mengizinkan keluarga pemilik atau `service_role`, sehingga jalur Admin berpotensi selalu gagal. | P0 |
| Endpoint HTTP payment | Tidak konsisten | Route canonical `complete` dan alias `confirm-completion` tersedia. | TDD mendefinisikan cancel sebagai `PATCH`, tetapi implementasi route cancel hanya menyediakan `POST`. Kontrak dan client harus disamakan tanpa menghapus alias lama secara sembarangan. | P1 |
| Layanan tambahan | Hampir selesai | Validasi minimal Rp1.000, RPC `create_extra_service`, RPC `decide_extra_service`, dan UI Helper/Keluarga tersedia. | Belum ada pengujian E2E yang membuktikan task benar-benar pause, harga final berubah sekali, dan pembayaran membaca harga final setelah keputusan. | P1 |
| Laporan formal | Backend sebagian selesai | POST/GET/PATCH report, trigger dua laporan aktif menjadi `under_review`, dan pembatasan query Koordinator tersedia. | `/koordinator/laporan` dan `/admin/reports` masih placeholder. Tidak ada alur UI untuk menindak, melepas `under_review`, atau eskalasi suspend dengan alasan dan audit yang terlihat. | P0 |
| Under review memblokir task | Sebagian selesai | Route accept memeriksa `helper.status !== verified`. | Belum ada test database dan E2E yang menghubungkan dua laporan, status Helper, lalu percobaan accept yang menghasilkan 403. | P1 |
| Chat per task | Belum selesai secara kontrak | REST messages route, inbox, read receipt, dan komponen chat tersedia. | UI produksi memakai `src/lib/chat/actions.ts` dengan `service_role`, mencari user bebas, dan mengizinkan chat tanpa `task_id`. Ini melampaui relasi yang diizinkan TDD. REST GET task juga salah membandingkan `tasks.helper_id` dengan `user.id`, padahal `helper_id` adalah ID `helper_profiles`. | P0 |
| Realtime chat/inbox | Belum selesai | Tabel messages sudah didaftarkan ke Realtime pada migration. | `ChatRoomClient` memakai `setInterval` dan `router.refresh()` setiap 3 detik, bukan subscription Realtime. Tidak ada bukti subscription bekerja atau unsubscribe bersih. | P1 |
| Notifikasi in-app | Sebagian selesai | API list/read dan halaman `/notifikasi` memakai data database. Trigger booking dan insert notifikasi SOS tersedia. | Notification page fetch sekali dan tidak live. Settlement hanya memasukkan notifikasi ke Keluarga, bukan Helper dan Koordinator sesuai TDD. Tidak ada test event matrix untuk task, payment, message, emergency, dan koordinator info. | P1 |
| SOS Helper | Backend dan dialog sebagian selesai | Helper dapat membuat alert saat task `dikerjakan`, memakai `tel:112`, dan alert disimpan sebagai active. | `/koordinator/darurat` masih placeholder. Tidak ada daftar alert aktif atau tombol acknowledge untuk Keluarga/Koordinator. Tidak ada jalur `resolved`, deduplikasi alert, atau audit log aksi SOS. SMS tidak boleh diklaim aktif karena provider belum diuji. | P0 |
| Riwayat penghasilan Helper | Belum selesai | Kolom saldo dan split ada di database. | `/helper/penghasilan` masih placeholder. FR-PAY-05 memang Should, tetapi halaman ini tercantum dalam TDD dan dibutuhkan untuk menjelaskan hasil split pada demo. | P1 |
| Komisi Koordinator | Belum selesai | RPC menambah `saldo_komisi` pada release normal. | `/koordinator/komisi` masih placeholder. FR-PAY-06 Should, tetapi tanpa halaman ini hasil 3% tidak dapat diverifikasi oleh juri. | P1 |
| Panel Admin terkait Sprint 3 | Sebagian selesai | Dashboard, users, helpers, categories, dan audit API nyata sudah ada. | `/admin/reports`, `/admin/audit-logs`, dan `/admin/demo-wallet` masih placeholder. Demo wallet boleh ditunda karena amendment terbaru mengecualikannya dari implementasi Sprint 3, tetapi reports dan audit log tetap relevan untuk trust and safety. | P0 untuk reports, P1 lainnya |
| Seed dan jalur demo | Belum terbukti | Seed memiliki dua report untuk skenario `under_review`, task lintas status, dan snapshot riwayat. | Tidak ada payment seed yang berstatus `held_escrow` atau `released`, tidak ada smoke path Midtrans, dan tidak ada seed event chat/SOS yang membuktikan semua halaman Sprint 3 tidak kosong. | P1 |

## Temuan teknis paling berbahaya

### 1. Charge Midtrans tidak atomik terhadap pembuatan payment

`src/app/api/payments/[task_id]/charge/route.ts` membaca payment yang ada, memanggil Midtrans, lalu baru menjalankan RPC `create_midtrans_payment`. Dua request paralel dapat sama-sama melihat payment kosong dan sama-sama membuat checkout. Upsert database tidak membatalkan order Midtrans yang sudah terlanjur dibuat.

Perbaikan yang diperlukan:

- Buat order ID deterministik per task atau gunakan idempotency key yang disimpan di database.
- Kunci atau buat row `payments` pending sebelum memanggil provider.
- Jika provider gagal, simpan error yang aman dan izinkan retry tanpa membuat transaksi ganda.
- Tambahkan test concurrency atau minimal test database dengan dua request yang sama.

### 2. Refund gateway dilakukan sebelum transaksi database

Route cancel memanggil `refundMidtrans`, kemudian memanggil `cancel_task_with_compensation`. Jika RPC gagal karena status task berubah atau race, Midtrans sudah menerima refund sementara database masih `held_escrow`.

Perbaikan yang diperlukan:

- Tetapkan satu state machine refund dengan status request yang idempotent.
- Pastikan update task dan payment mencatat intent refund secara atomik sebelum memanggil gateway.
- Simpan hasil gateway dan lakukan reconciliation bila provider berhasil tetapi callback database gagal.
- Jangan mengandalkan Admin route yang memanggil RPC dengan policy hanya untuk keluarga.

### 3. Jalur chat yang dipakai UI melewati batas RLS

`src/lib/chat/actions.ts` memakai `createAdminClient()` untuk inbox, detail chat, kirim pesan, dan read receipt. Ia juga menyediakan pencarian user umum dan `sendMessage` dengan `taskId` opsional. Ini membuat server action menjadi bypass terhadap RLS dan memungkinkan percakapan yang tidak terkait task.

Perbaikan yang diperlukan:

- Jadikan `task_id` wajib untuk alur chat Sprint 3.
- Pakai client user biasa atau route server yang melakukan pengecekan peserta task secara eksplisit.
- Pertahankan `helper_profiles.id` dan `users.id` sebagai dua ID berbeda dalam seluruh query.
- Batasi UI keluarga dan Helper pada task yang mereka ikuti. Jangan memakai chat bebas antar role sebagai pengganti chat per task.

### 4. Review trust and safety belum bisa didemokan

Backend dapat menerima report dan mengubah status Helper melalui trigger, tetapi reviewer tidak punya halaman operasional. Halaman `/koordinator/laporan`, `/admin/reports`, dan `/koordinator/darurat` hanya menampilkan teks pengembangan. Artinya acceptance criteria Sprint 3 berhenti setelah data tersimpan, bukan setelah reviewer dapat mengambil keputusan.

Perbaikan yang diperlukan:

- Tampilkan antrean report berdasarkan scope wilayah untuk Koordinator dan semua report untuk Admin.
- Tampilkan status `menunggu`, `ditindak`, dan `selesai`, alasan laporan, waktu, dan keputusan.
- Sediakan keputusan eksplisit untuk melepas `under_review` atau mensuspend, dengan alasan wajib dan audit log.
- Tampilkan alert SOS aktif, detail task yang aman, acknowledge, dan status terakhir.

## Konflik dokumentasi yang wajib dibereskan

Amendment TDD di baris 3 menetapkan Midtrans Sandbox sebagai provider Sprint 3 dan mengecualikan Demo Ledger, saldo dummy, serta `charge-dummy` dari Sprint 3. Implementasi saat ini mengikuti amendment tersebut.

Namun isi TDD berikut masih menyatakan hal yang berbeda:

- §3.4 masih menjadikan Saldo Dummy sebagai fallback.
- §7 masih mencantumkan `POST /api/payments/:task_id/charge-dummy`.
- §14.1 masih menyatakan `DemoWalletProvider` sebagai payment core wajib.
- §14.4 Sprint 3 masih menjanjikan pembayaran dari saldo dummy.
- §14.5 langkah E2E masih menyebut Demo Ledger.
- §15 masih memasukkan escrow Midtrans dan fallback Saldo Demo bersamaan.

Ini bukan sekadar masalah dokumentasi. Tim bisa mengerjakan dua provider yang saling bertentangan dan menghabiskan waktu pada jalur yang sudah dikecualikan. Sebelum mengerjakan Sprint 4, tetapkan satu keputusan dan selaraskan semua bagian TDD serta `docs/planning/sprint3/plan.md`. Rekomendasi audit ini adalah mempertahankan Midtrans Sandbox untuk Sprint 3, mencatat Demo Ledger sebagai fallback Sprint 4 atau scope terpisah, dan menghapus klaim fallback dari acceptance criteria Sprint 3.

## Hal yang sudah cukup kuat

- Harga booking dan `harga_final` dibaca dari database, bukan nominal otoritatif dari browser.
- Webhook tidak mengubah status sebelum signature diverifikasi.
- Split normal dilakukan oleh RPC database, bukan hitungan client.
- Trigger report memakai dua laporan aktif, bukan rating rendah.
- Route accept menolak Helper yang bukan `verified`, sehingga `under_review` tidak dapat menerima task baru.
- Validasi layanan tambahan dan RLS dasar untuk payment, report, message, notification, serta emergency sudah memiliki struktur yang benar.
- Build dan typecheck bersih. Tidak ada error lint, walaupun warning masih banyak.

## Batas audit

Audit ini membaca source, migration, test, seed, dan workflow CI. Tidak menjalankan perubahan pada database remote, tidak mengirim transaksi ke Midtrans, dan tidak menganggap secret lokal sebagai bukti provider siap. Karena itu status “belum terbukti” tetap harus diperlakukan sebagai gap sampai ada evidence smoke test yang dapat diulang.
