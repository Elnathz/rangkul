
# Sprint 4: Riwayat Rangkul, Admin, Offline Draft, dan Kesiapan Demo

> **Untuk agent pelaksana:** gunakan `superpowers:executing-plans` atau `superpowers:subagent-driven-development` untuk mengeksekusi rencana ini per task. Gunakan `superpowers:test-driven-development` untuk perubahan kode dan `superpowers:verification-before-completion` sebelum commit. Checkbox di dokumen ini adalah tracker kerja, bukan bukti selesai. Setiap checkbox hanya boleh ditandai setelah evidence yang disebutkan tersedia.

**Status baseline:** audit implementasi pada 27 Agustus 2026 terhadap branch `develop`.

**Goal:** Menjadikan Riwayat Rangkul sebagai fitur demo utama, menutup panel operasi Admin dan Koordinator yang masuk prioritas, menyediakan draft laporan offline yang tidak kehilangan data, serta membuktikan seed dan RLS aman untuk demo ulang.

**Architecture:** Pekerjaan dibagi sebagai vertical slice. Farros dan Mervin masing-masing memiliki UI, route API, validasi, database/RPC, RLS, seed, automated test, dan QA untuk domain yang menjadi miliknya. Pembagian berdasarkan layer dilarang karena bertentangan dengan aturan keras TDD §14.0 bahwa fitur baru selesai setelah alur UI -> API -> database/RLS -> UI kembali berjalan memakai data seed.

**Tech Stack:** Next.js App Router, TypeScript, React, Supabase PostgreSQL/Auth/Storage/RLS/Realtime, Zod, IndexedDB, Node test runner, Tailwind CSS, shadcn/Base UI, dan Lucide.

**Spec:** `docs/TDD_Rangkul.md` §2.3, §3.3, §3.4, §3.10-§3.13, §4.3, §4.7, §4.12-§4.14, §6-§9, §14.0, §14.4, §14.6-§14.8, §16, §18, dan §19. Konteks closure sebelumnya: `docs/planning/sprint3/completion-audit.md` dan `docs/planning/sprint3/follow-up-plan.md`.

## Global Constraints

- `docs/TDD_Rangkul.md` tetap menjadi sumber kebenaran. Kontradiksi nama enum, kolom, atau endpoint harus diselesaikan lewat amendment TDD sebelum migrasi atau route diubah.
- Jangan menghapus route, payload, atau field hanya untuk menghilangkan type error. Tambahkan migrasi yang benar, pertahankan alias kompatibilitas bila sudah dipakai UI, lalu regenerasi `src/types/database.ts`.
- Kedua owner wajib fullstack. Tidak ada pembagian Farros sebagai backend dan Mervin sebagai frontend.
- Setiap slice harus punya alur sukses, forbidden, validation error, loading, empty, network error, retry bila relevan, seed fixture, dan test pada boundary yang rawan.
- Semua UI dimulai dari 375px, lalu diverifikasi pada 768px, 1024px, dan 1440px. Tidak boleh ada overflow horizontal, target sentuh di bawah 44x44px, aksi penting yang hanya muncul saat hover, atau fokus keyboard yang tidak terlihat.
- Health Snapshot dan Memory Capsule adalah data privat, bukan diagnosis medis. Copy tidak boleh memberi diagnosis, rekomendasi medis, atau kesimpulan klinis.
- Badge `Perlu Perhatian` hanya aktif jika rata-rata lima indikator turun secara ketat pada tiga kunjungan berturut-turut. Satu nilai sama membatalkan kondisi strict decline.
- Draft offline memakai IndexedDB. Foto tidak diunggah ketika offline. Submit ulang memakai `client_submission_id` yang sama dan server harus idempoten.
- Semua mutation sensitif divalidasi Zod di server, ditegakkan lagi oleh constraint/RPC/RLS, dan menghasilkan audit log dalam transaksi yang sama bila keputusan bisnis berubah.
- Storage dokumen dan bukti bersifat private. Database menyimpan object path, bukan signed URL yang kedaluwarsa. Signed URL dibuat saat pembacaan setelah authorization server.
- Tidak ada nominal, role, status, atau ownership yang dipercaya dari browser. Server mengambil ulang task, profile, payment, dan actor dari database.
- Pekerjaan cloud memakai project Supabase development. Docker dan Supabase local bukan acceptance dependency. Clean replay migration hanya boleh dilakukan pada project development yang targetnya telah diverifikasi, bukan production.
- Perubahan schema besar dibekukan setelah Hari 5. Setelah freeze, hanya migration korektif P0 yang boleh masuk.
- P0 dan P1 harus stabil sebelum P2. Filter pengawasan RW detail, inbox Realtime penuh, Help Center interaktif, dan polish di luar jalur demo tidak boleh mengambil waktu dari RLS, storage private, seed, atau jalur pembayaran fallback.
- Satu commit hanya memuat satu perubahan logis dan mengikuti scope commit AGENTS.md. Perubahan business rule, schema, dan endpoint wajib memiliki footer `Refs`.

## Audit Implementasi Saat Ini

### Arti status

- **Ada:** implementasi inti tersedia dan bukti audit tidak menemukan gap kontrak utama.
- **Parsial:** sebagian alur tersedia, tetapi belum memenuhi acceptance TDD atau belum aman untuk demo.
- **Belum ada:** acceptance penting belum diimplementasikan.
- **Gagal gate:** implementasi yang ada melanggar quality gate keamanan, privasi, atau reproducibility.

| Area                       | Status     | Yang sudah ada                                                                                                                         | Gap dan dampak nyata                                                                                                                                                                                                                                                                            |
| -------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Riwayat Rangkul            | Parsial    | `GET /api/lansia/:id/riwayat`, timeline, lima tren, fungsi strict decline, badge, dan halaman Keluarga sudah ada.                    | Foto memakai URL yang tersimpan langsung, grafik tidak memberi tanggal/periode yang cukup jelas, error tidak punya retry, dan authorization belum dibuktikan dengan runtime RLS test. Klaim dapat dipahami juri dalam 30 detik belum punya evidence.                                            |
| Storage private            | Gagal gate | Upload memeriksa sesi, tipe file, ukuran, dan magic bytes. Bucket bersifat private.                                                    | Route mengembalikan signed URL 1 jam lalu UI menyimpannya permanen ke kolom`_url`. Bukti kunjungan dan dokumen verifikasi akan rusak setelah URL kedaluwarsa. Belum ada endpoint read/re-sign yang memeriksa hak reviewer.                                                                    |
| Offline evidence           | Parsial    | IndexedDB,`client_submission_id`, status draft, listener `online`, dan RPC submit evidence idempoten sudah ada.                    | Draft tidak terikat user, tidak autosave, status sukses langsung dihapus, sink failure ditelan hook lalu UI redirect seolah sukses, listener hanya hidup di halaman lapor, dan skor default 3 dapat terkirim tanpa pilihan sadar.                                                               |
| Trust tier otomatis        | Belum ada  | Kolom`tingkat_kepercayaan`, counter, status `under_review`, dan blok accept di database sudah ada.                                 | Tidak ada trigger/RPC yang menaikkan Helper menjadi`terpercaya` setelah lima tugas bersih. Laporan formal juga belum mereset counter sesuai TDD.                                                                                                                                              |
| Review laporan dan suspend | Parsial    | `review_report` memakai lock, scope wilayah, reason, audit, dan trigger dua laporan.                                                 | UI review tidak mengirim`helper_status` atau `decision_reason`. Admin masih dapat memulihkan status melalui generic PATCH tanpa keputusan beralasan. Beberapa audit ditulis setelah mutation dan error audit ditelan.                                                                       |
| Banding                    | Parsial    | Form banding, daftar Admin, dan`admin_review_appeal` tersedia.                                                                       | Pembuatan banding melakukan read lalu insert tanpa partial unique constraint untuk satu banding pending, sehingga request bersamaan dapat menggandakan data.                                                                                                                                    |
| Admin inti                 | Parsial    | User, kategori, statistik, antrean Koordinator, Helper, laporan, fallback, banding, demo wallet, dan audit log memiliki halaman/route. | Kontrak kategori memakai`/api/admin/service-categories` dan `PUT`, bukan endpoint canonical TDD. Approve/reject Koordinator belum conditional update. Fallback tidak membuktikan ketiadaan Koordinator aktif. Statistik melakukan query serial dan GMV tidak berasal dari released payment. |
| Saldo Demo                 | Parsial    | Wallet, ledger top-up, RPC dengan row lock, halaman top-up, dan RLS Admin tersedia.                                                    | Belum ada jalur Keluarga membayar task memakai Saldo Demo. Top-up dan audit belum atomik, tidak ada history ledger yang memadai, dan quality gate demo tanpa Midtrans belum terpenuhi.                                                                                                          |
| Operasi Koordinator        | Parsial    | Laporan dan darurat tersedia. Darurat memakai Realtime refresh dan acknowledge.                                                        | `/koordinator/komisi` masih placeholder. Endpoint komisi belum ada. Error query berisiko tampil seperti empty state. Pengawasan RW juga placeholder dan hanya boleh dikerjakan setelah P0 stabil.                                                                                             |
| RLS dan privasi            | Gagal gate | Tabel domain utama sudah mengaktifkan RLS dan memiliki banyak policy berbasis role/ownership.                                          | Policy awal`Authenticated users can read all users` masih memakai `USING (true)`. Satu-satunya runtime RLS integration test di-skip. Reviewer formal belum memiliki jalur authorized read untuk evidence/snapshot. Test regex SQL tidak membuktikan isolasi data.                           |
| Seeder demo                | Gagal gate | Akun multi-role, kategori, task, snapshot menurun, reports, wallet, dan fixture dasar tersedia.                                        | Jumlah fixture tidak memenuhi §19, dokumen empat Keluarga kosong, foto evidence memakai`demo.invalid`, status task approval belum lengkap, appeal tidak koheren, saldo rerun tidak selalu deterministik, dan seed dapat memilih lalu mengubah Admin yang sudah ada.                          |
| CI dan scheduled job       | Parsial    | Workflow CI menjalankan`npm ci`, lint, typecheck, test, dan build untuk push `main`/`develop` serta PR ke `main`.              | PR menuju`develop` tidak menjadi event CI. Heartbeat berjalan tiap lima menit, bukan Senin/Kamis sesuai §2.3. Jadwal ini boros dan tidak sesuai tujuan mencegah auto-pause.                                                                                                                  |
| Kualitas test              | Parsial    | Suite saat audit memiliki 134 test, 133 lulus, 1 skip.                                                                                 | Mayoritas test memeriksa source/SQL dengan regex. Runtime RLS justru test yang di-skip. Green suite saat ini tidak cukup untuk menyatakan Sprint 4 selesai.                                                                                                                                     |

### Kesimpulan audit

Sprint 4 belum selesai. Yang tersedia adalah fondasi dan banyak permukaan UI, bukan alur yang seluruhnya memenuhi TDD. Empat blocker sign-off adalah:

1. private storage menyimpan signed URL sementara sebagai data permanen;
2. policy `users` membuka data seluruh user kepada semua akun authenticated;
3. jalur pembayaran Saldo Demo dari Keluarga belum ada;
4. seed cloud belum memenuhi matriks §19 dan belum membuktikan replay yang deterministik.

Fitur yang juga wajib ditutup sebelum klaim selesai adalah trust tier otomatis, review `under_review` beralasan dari UI sampai database, offline retry yang jujur, dan komisi ringkas Koordinator.

## Keputusan Kontrak Sebelum Implementasi

Terdapat drift antara TDD dan schema cloud. Jangan memilih salah satu secara diam-diam. Task 0 harus membuat amendment singkat di TDD dan mencatat keputusan berikut sebelum kode domain berubah:

| Konflik                     | TDD saat ini                                                                             | Implementasi cloud saat ini                                              | Keputusan yang harus dikunci                                                                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Metode pembayaran demo      | `dummy_saldo`                                                                          | enum`saldo_demo`                                                       | Gunakan`saldo_demo` sebagai canonical karena sudah deployed dan disebut amendment Sprint 3. Perbarui seluruh referensi TDD yang masih `dummy_saldo`. |
| Kolom Health Snapshot       | `skor_energi`, `skor_mobilitas`, `skor_mood`, `skor_nafsu_makan`, `skor_tidur` | `energi`, `mobilitas`, `mood`, `nafsu_makan`, `kualitas_tidur` | Pertahankan nama deployed untuk menghindari rename berisiko, lalu dokumentasikan mapping API secara eksplisit.                                           |
| Foto evidence               | `task_evidence.foto_url`                                                               | `task_evidence.foto_bukti_url`                                         | Pertahankan`foto_bukti_url` dan koreksi tabel kontrak TDD. Nilainya berubah menjadi private object path.                                               |
| Sync evidence               | `sync_status = pending_sync/submitted`                                                 | kolom belum ada, status hanya lokal                                      | Tambahkan enum/kolom bila status server tetap diwajibkan TDD.`pending_sync` lokal tidak boleh membuat record server sebelum upload.                    |
| Kategori Admin              | `POST /api/categories`, `PATCH /api/categories/:id`                                  | `/api/admin/service-categories`, update `PUT`                        | Tambahkan route canonical. Route lama tetap alias menuju service yang sama sampai seluruh client dipindah.                                               |
| Review Koordinator/fallback | endpoint canonical TDD memakai mutation status/fallback                                  | route approve/reject terpisah dan generic Helper PATCH                   | Sediakan route canonical dengan conditional update/RPC. Alias lama tidak boleh memiliki implementasi business rule terpisah.                             |

Kontrak tambahan yang dibutuhkan quality gate tetapi belum tertulis rinci harus ditambahkan pada amendment:

- `POST /api/payments/:task_id/demo-wallet/charge` untuk pembayaran fallback Keluarga. Request tidak membawa nominal. Response memakai envelope API Rangkul dan status payment canonical.
- Endpoint read/re-sign private file harus terikat resource dan memeriksa authorization server. Jangan menerima kombinasi bucket/path bebas dari browser.
- `GET /api/koordinator/commissions` untuk ringkasan komisi berdasarkan payment `released` dalam wilayah aktor.
- Audit action canonical untuk `review_report`, `restore_helper`, `suspend_helper`, `resolve_appeal`, `approve_koordinator`, `reject_koordinator`, `assign_admin_fallback`, `topup_demo_wallet`, dan `charge_demo_wallet`.

## Ownership

### Farros: Riwayat, Trust, Safety, RLS, dan Demo Integrity

Farros memiliki vertical slice berikut sampai UI dan runtime test, bukan hanya backend:

- Riwayat Rangkul dari query privat sampai visual tren dan state UI.
- Trust tier otomatis setelah lima tugas bersih.
- Review laporan, `under_review`, suspend/restore, fallback, dan banding yang aman.
- RLS/privacy matrix lintas role.
- Seeder cloud, scheduled job, CI alignment, dan integrasi akhir demo.

### Mervin: Storage, Offline Evidence, Admin Operations, Payment Fallback, dan Koordinator

Mervin memiliki vertical slice berikut sampai migration/RLS dan automated test, bukan hanya UI:

- Referensi file private dan authorized re-sign untuk seluruh alur upload yang terkena dampak.
- Offline draft evidence dari IndexedDB sampai submit idempoten dan recovery UI.
- Admin user, kategori, statistik, approval Koordinator, demo wallet, dan audit history.
- Pembayaran task dengan Saldo Demo dari UI Keluarga sampai transaction/ledger.
- Darurat dan komisi ringkas Koordinator. Filter RW hanya dikerjakan bila gate P0 lulus.

### Shared file dan aturan integrasi

| File/area bersama                                    | Primary editor           | Reviewer wajib | Aturan                                                                                                            |
| ---------------------------------------------------- | ------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------- |
| `docs/TDD_Rangkul.md` dan `docs/api-contract.md` | Owner task kontrak       | owner lain     | Satu PR kontrak lebih dulu. Jangan edit paralel pada bagian yang sama.                                            |
| `src/types/database.ts`                            | owner migration terakhir | owner lain     | Regenerasi setelah migration di-apply ke cloud development. Jangan edit manual untuk menyembunyikan schema drift. |
| `supabase/seed.sql`                                | Farros                   | Mervin         | Mervin mengirim fixture domain sebagai patch kecil; Farros melakukan integrasi dan replay akhir.                  |
| `src/lib/audit.ts`                                 | Farros                   | Mervin         | Tambahan action dibuat sekali dan digunakan semua route.                                                          |
| `src/lib/validations/*`                            | owner domain             | owner lain     | Schema browser dan server harus memakai source yang sama bila bentuk input sama.                                  |
| `.github/workflows/*`                              | Farros                   | Mervin         | Perubahan jadwal/deploy hanya setelah dry run command lokal lulus.                                                |

Branch kerja mengikuti AGENTS.md: `feature/<scope>-<deskripsi>`. Setiap branch membuat PR ke `develop`. Integrasi akhir Sprint 4 ada di `develop`; `develop` ke `main` hanya melalui PR setelah gate lengkap.

## Integrasi dan Acceptance

- Handoff memakai format: Owner, Scope, Files, Contract, Migration, RLS, Seed, Tests, Manual evidence, Result, Blocked by, Next owner.
- Reviewer tidak cukup membaca diff. Reviewer menjalankan happy path dan satu forbidden path untuk slice tersebut.
- P0 wajib: private storage, Riwayat Rangkul, RLS, seed replay, Admin mutation aman, trust/safety, dan pembayaran Saldo Demo.
- P1 wajib bila masuk demo: offline draft tidak hilang, retry jujur, darurat, dan komisi ringkas.
- P2 boleh dipotong: inbox Realtime penuh, filter RW detail, Help Center interaktif, dan dashboard komisi lanjutan.
- Final command source: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test`, dan `npm run build`.
- Final cloud evidence: migration status, seed rerun dua kali, runtime RLS matrix, storage private access, dan dry run demo semua role.

## Urutan Eksekusi dan Ketergantungan

| Urutan | Task                                              | Owner                                 | Dependensi                        | Gate keluar                                                                  |
| ------ | ------------------------------------------------- | ------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------- |
| 0      | Normalisasi kontrak TDD dan API                   | Farros, direview Mervin               | Tidak ada                         | Drift nama dan endpoint diputuskan tertulis.                                 |
| 1      | Fondasi private file                              | Mervin, direview Farros               | Task 0                            | Database menyimpan object path dan authorized reader mendapat URL sementara. |
| 2      | Riwayat Rangkul end-to-end                        | Farros, direview Mervin               | Task 0 dan read helper Task 1     | Timeline, tren, badge, privasi, dan UI lulus.                                |
| 3      | Offline evidence end-to-end                       | Mervin, direview Farros               | Task 0 dan upload helper Task 1   | Offline save, reload, reconnect, retry, dan idempotency terbukti.            |
| 4      | Trust tier otomatis                               | Farros, direview Mervin               | Task 0                            | Lima tugas bersih promosi atomik, report reset counter.                      |
| 5      | Admin identity, kategori, statistik, dan approval | Mervin, direview Farros               | Task 0 dan Task 1                 | Mutation canonical, conditional, audited, dan UI lengkap.                    |
| 6      | Trust-safety, fallback, dan banding               | Farros, direview Mervin               | Task 4 dan primitive Admin Task 5 | Dua laporan, keputusan beralasan, fallback, dan banding aman.                |
| 7      | Pembayaran Saldo Demo                             | Mervin, direview Farros               | Task 0 dan primitive audit Task 5 | Task dapat dibayar tanpa Midtrans secara atomik.                             |
| 8      | Komisi dan darurat Koordinator                    | Mervin, direview Farros               | Task 7 untuk komisi               | Ringkasan released payment dan state darurat jujur.                          |
| 9      | Audit RLS dan privacy runtime                     | Farros, dibantu Mervin                | Task 1-8                          | Seluruh role matrix lulus pada cloud development.                            |
| 10     | Seed deterministik cloud                          | Farros integrator, Mervin contributor | Task 1-9                          | Matriks §19 lengkap dan dua rerun menghasilkan state yang sama.             |
| 11     | CI, dry run, dan handover                         | Keduanya                              | Task 1-10                         | Semua gate source/cloud/demo lulus dan evidence tercatat.                    |

Task 1 dan Task 4 dapat berjalan paralel setelah Task 0. Task 2 menunggu kontrak read private file dari Task 1. Task 3 menunggu kontrak upload object path. Task 5 dapat berjalan paralel dengan Task 2-4 selama tidak menyentuh file bersama. Task 9-11 adalah fase integrasi dan tidak boleh dideklarasikan selesai dari branch owner masing-masing.

## Jadwal Pemulihan 27-31 Agustus 2026

| Tanggal    | Farros                             | Mervin                                               | Checkpoint bersama                                                                                                        |
| ---------- | ---------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 27 Agustus | Task 0 dan mulai Task 4            | Task 1                                               | Kontrak freeze, private path shape, daftar migration, dan test merah disepakati.                                          |
| 28 Agustus | Selesaikan Task 4, kerjakan Task 2 | Selesaikan Task 1, kerjakan Task 3                   | Riwayat membaca foto melalui authorized path. Offline submit tidak redirect saat gagal.                                   |
| 29 Agustus | Task 6                             | Task 5 dan Task 7                                    | Review`under_review`, Admin mutation, serta Saldo Demo dapat didemokan dari UI. Schema besar freeze setelah checkpoint. |
| 30 Agustus | Task 9 dan integrasi seed          | Task 8 dan fixture domain untuk seed                 | Runtime RLS matrix, komisi, darurat, dan seed rerun pertama. P2 dipotong bila ada P0.                                     |
| 31 Agustus | Task 10-11, triase P0/P1           | Task 10-11, responsive dan accessibility walkthrough | Dua dry run, gate lengkap, bukti CI, serta handover Sprint 5.                                                             |

Jika Task 1, Task 7, atau Task 9 belum lulus pada 30 Agustus, hentikan Task 8 bagian filter RW dan seluruh P2. Menambah fitur saat tiga gate tersebut merah hanya memperbesar permukaan bug dan tidak menambah nilai demo yang dapat dipercaya.

## Task 0: Normalisasi Kontrak TDD dan API

**Owner:** Farros

**Reviewer:** Mervin
**Scope:** TDD §3.4, §3.12-§3.13, §6-§7, §14.0, §14.4; FR-EVD-01-03, FR-RWT-01-04, FR-OFF-01-03, FR-PAY-01-06, FR-ADM-04, FR-ADM-06, FR-ADM-08-09.

**Files:**

- Modify: `docs/TDD_Rangkul.md`
- Modify: `docs/api-contract.md`
- Create: `tests/sprint4-tdd-contract.test.mjs`

**Langkah:**

- [ ] Tulis test dokumentasi yang gagal jika TDD masih mencampur `dummy_saldo` dan `saldo_demo`, atau masih menyatakan nama evidence/snapshot yang berbeda dari keputusan amendment.
- [ ] Tambahkan amendment Sprint 4 tanpa menghapus catatan historis. Jelaskan canonical enum, nama kolom deployed, private object path, sync status, endpoint canonical, alias kompatibilitas, dan audit action.
- [ ] Definisikan request/response/error untuk Riwayat, category mutation, Koordinator status, fallback, private file read, offline evidence, Saldo Demo charge, commission query, review report, dan review appeal.
- [ ] Untuk setiap mutation, tulis actor yang diizinkan, data yang diambil dari server, expected status awal, status akhir, idempotency key, dan HTTP status `400`, `401`, `403`, `404`, `409`, serta `500`.
- [ ] Pastikan response mengikuti `{ data }` untuk sukses dan `{ error, message, fieldErrors? }` untuk gagal. Jangan mempertahankan dua nama field response untuk data yang sama.
- [ ] Mervin memeriksa kontrak dari perspektif seluruh pemanggil browser dan menandatangani handoff sebelum route diubah.

**Acceptance:**

- Tidak ada keputusan business rule yang hanya tersimpan dalam chat atau asumsi developer.
- Pencarian `dummy_saldo` hanya menemukan catatan historis yang diberi penjelasan migrasi, bukan contract aktif.
- Semua endpoint yang akan disentuh Task 1-8 memiliki actor, request, response, error, dan state transition yang eksplisit.
- Test dokumentasi lulus.

**Commit atomik:**

```text
docs(payment): kunci kontrak sprint 4

Menyelaraskan nama deployed dan endpoint canonical sebelum vertical slice diubah.

Refs: TDD §3.4, §3.12, §3.13, §6, §7
```

## Task 1: Private File Reference dan Authorized Read

**Owner:** Mervin

**Reviewer:** Farros
**Scope:** TDD §3.11-§3.13, §6, §8, §16; FR-HLP-03, FR-EVD-01-03, FR-RWT-03, FR-ADM-06.

**Files utama:**

- Modify: `src/app/api/storage/upload/route.ts`
- Create: `src/lib/storage/private-files.ts`
- Create: `src/lib/storage/private-file-access.ts`
- Modify: `src/lib/validations/storage.ts`
- Create: `supabase/migrations/20260828100000_private_file_references.sql`
- Regenerate: `src/types/database.ts`
- Modify upload consumers:
  - `src/app/(helper)/tugas/[id]/lapor/page.tsx`
  - `src/app/(keluarga)/lansia/tambah/page.tsx`
  - `src/app/(helper)/helper/verifikasi/page.tsx`
  - `src/app/(helper)/helper/profil/edit/page.tsx`
  - `src/app/(koordinator)/koordinator/pengajuan/page.tsx`
  - `src/components/koordinator/HelperVerificationButtons.tsx`
- Modify authorized readers:
  - `src/app/(keluarga)/kunjungan/[id]/page.tsx`
  - `src/components/keluarga/RealTaskDetailClient.tsx`
  - `src/app/(keluarga)/lansia/[id]/page.tsx`
  - `src/app/(koordinator)/koordinator/helper/[id]/page.tsx`
  - `src/app/(admin)/admin/helpers/page.tsx`
- Create: `tests/private-storage-access.test.mjs`
- Modify: `tests/storage-and-evidence-contract.test.mjs`

**Kontrak file:**

- Upload sukses mengembalikan `data.path`, `data.bucket`, `data.content_type`, dan metadata yang aman. Signed URL boleh ikut untuk preview sesi saat ini, tetapi tidak pernah disimpan sebagai referensi permanen.
- Path selalu dibentuk server dengan prefix actor dan doc type. Browser tidak dapat memilih bucket atau path final.
- Kolom seperti `ktp_url`, `dokumen_url`, dan `foto_bukti_url` tetap dipertahankan demi kompatibilitas schema, tetapi semantik nilainya dikunci sebagai object path private.
- Reader meminta resource ID, bukan arbitrary path. Server memeriksa bahwa actor adalah pemilik, participant task, Koordinator berwenang dalam wilayah, atau Admin sesuai matriks TDD §16 sebelum membuat signed URL pendek.
- Public profile photo harus dipisahkan secara eksplisit dari dokumen privat. Jangan membuat seluruh bucket publik hanya karena avatar perlu tampil di katalog.

**Langkah database/RLS:**

- [ ] Tulis test merah untuk membedakan object path dari URL `http(s)` dan untuk unauthorized read.
- [ ] Audit seluruh kolom `_url` yang memakai bucket `dokumen`, lalu klasifikasikan: public profile image, identity document, relationship document, role document, dan task evidence.
- [ ] Buat migration korektif yang menambah constraint/path metadata bila dibutuhkan tanpa menghapus payload existing.
- [ ] Tambahkan fungsi authorization SQL hanya jika rule dapat ditegakkan konsisten di database. Jika read memakai service role, authorization tetap wajib dilakukan dengan client actor lebih dulu dan diuji eksplisit.
- [ ] Siapkan migration data untuk mengubah signed URL existing menjadi object path jika path dapat diekstrak. Data yang tidak dapat dipulihkan ditandai untuk re-upload pada seed, bukan dibiarkan sebagai URL kedaluwarsa.
- [ ] Regenerasi `src/types/database.ts` dari schema cloud development setelah migration diterapkan.

**Langkah API/UI:**

- [ ] Ubah upload route agar tidak memercayai filename, mime, bucket, atau owner dari browser. Pertahankan magic-byte, size, dan extension validation.
- [ ] Buat helper read/re-sign per resource dan gunakan di Riwayat, detail task, review Helper, review Koordinator, serta profil lansia yang menampilkan dokumen.
- [ ] Ubah seluruh upload consumer agar menyimpan `path`, bukan preview signed URL.
- [ ] Preview lokal tetap memakai `URL.createObjectURL` dan selalu memanggil `URL.revokeObjectURL` ketika file berubah/unmount.
- [ ] UI menampilkan loading, unavailable/expired, forbidden, retry, dan fallback visual tanpa membocorkan raw storage error.

**Test dan evidence:**

- [ ] Test upload tanpa auth, doc type salah, spoofed MIME, file terlalu besar, dan magic bytes salah.
- [ ] Test family A tidak dapat meminta evidence family B.
- [ ] Test Helper hanya dapat membaca evidence task miliknya.
- [ ] Test Koordinator wilayah terkait dan Admin dapat membaca dokumen yang memang diperlukan untuk review, tetapi tidak mendapat list bucket bebas.
- [ ] Test URL baru dapat dibuat setelah URL lama kedaluwarsa tanpa mengubah row database.
- [ ] Verifikasi bucket `dokumen` tetap private dari dashboard/CLI cloud.

**Acceptance:**

- Tidak ada write baru yang menyimpan string signed URL ke kolom referensi file private.
- Refresh setelah lebih dari satu jam tetap dapat menampilkan file melalui re-sign.
- Actor di luar ownership/scope menerima `403` atau `404` tanpa metadata sensitif.
- Riwayat dan offline evidence dapat memakai helper ini tanpa duplikasi authorization.

**Commit atomik yang disarankan:**

```text
fix(rls): simpan referensi file private sebagai object path

Signed URL sementara tidak lagi menjadi data permanen dan setiap pembacaan file memeriksa hak actor.

Refs: TDD §3.11, §3.12, §6, §8, §16
```

## Task 2: Riwayat Rangkul End-to-End

**Owner:** Farros

**Reviewer:** Mervin
**Scope:** TDD §3.12, §4.7, §5.1, §6, §7, §8, §13, §14.4; FR-EVD-03, FR-RWT-01-04.

**Files:**

- Modify: `src/lib/riwayat-rangkul.ts`
- Modify: `src/app/api/lansia/[id]/riwayat/route.ts`
- Refactor: `src/app/(keluarga)/lansia/[id]/riwayat/page.tsx`
- Create components under `src/components/keluarga/riwayat/`:
  - `RiwayatTimeline.tsx`
  - `HealthTrendChart.tsx`
  - `AttentionBadge.tsx`
  - `RiwayatState.tsx`
- Modify: `supabase/seed.sql`
- Create: `tests/riwayat-rangkul-runtime.test.mjs`
- Modify: `tests/sprint4-contract.test.mjs`

**Kontrak data:**

- Query hanya menerima lansia yang dimiliki Keluarga actor. Admin/Koordinator tidak otomatis mendapat akses melalui endpoint Keluarga.
- Timeline berurutan kronologis dan setiap item memiliki `task_id`, waktu selesai, catatan, cerita, lima skor, serta signed evidence URL yang dibuat saat response.
- Trend mengembalikan lima seri dengan pasangan waktu dan nilai. Jangan mengirim alias ganda seperti `kunjungan`/`visits` atau `tren`/`trends`.
- `perlu_perhatian` dihitung server dari tiga snapshot valid terbaru. Client hanya merender hasil dan boleh memakai helper yang sama untuk presentasi, bukan menentukan business state sendiri.
- Snapshot kurang dari tiga, nilai invalid, atau seri yang tidak strict decline menghasilkan `false`.
- Response selalu menyertakan disclaimer non-diagnostic yang disetujui pada TDD.

**Langkah:**

- [ ] Tambahkan unit test merah untuk strict decline, nilai sama, kenaikan di tengah, kurang dari tiga data, urutan input acak, dan lima indikator boundary 1/5.
- [ ] Pisahkan mapper database, kalkulasi tren, dan handler HTTP agar test tidak bergantung pada regex source.
- [ ] Ubah route untuk mengambil private object path dan meminta signed URL lewat helper Task 1 setelah ownership lansia lolos.
- [ ] Hilangkan raw Supabase error dari response publik. Log server boleh memuat correlation context tanpa data kesehatan.
- [ ] Refactor halaman satu baris besar menjadi komponen fokus. Jangan mengubah design system global.
- [ ] Grafik menampilkan label indikator, skala 1-5, tanggal/periode setiap titik, legend yang dapat dibaca tanpa warna saja, dan ringkasan arah tren.
- [ ] Timeline menampilkan foto, Cerita Hari Ini, catatan kondisi, waktu kunjungan, serta fallback saat gambar gagal.
- [ ] Tambahkan skeleton, empty state, inline error dengan tombol retry, dan forbidden/not-found state yang tidak membocorkan keberadaan lansia lain.
- [ ] Pastikan badge memiliki penjelasan rule-based dan CTA netral untuk memperhatikan kondisi, bukan diagnosis atau alarm medis.
- [ ] Tambahkan 4-5 snapshot menurun pada satu lansia seed dengan foto lokal/private yang valid.

**Test dan QA:**

- [ ] Runtime test family owner mendapat `200` dan family lain mendapat `404`/`403`.
- [ ] Test timeline tidak memasukkan task belum selesai atau milik lansia lain.
- [ ] Test signed evidence URL tidak disimpan kembali ke database.
- [ ] Test badge true hanya pada strict decline tiga kunjungan terbaru.
- [ ] Uji keyboard dan screen reader labels pada grafik/timeline.
- [ ] Uji 375px, 768px, 1024px, 1440px serta gambar gagal dan jaringan lambat.
- [ ] Lakukan tes juri internal: orang yang belum melihat fitur harus dapat menjelaskan tren dalam 30 detik.

**Acceptance:**

- FR-RWT-01-04 dan FR-EVD-03 dapat didemokan dari akun Keluarga seed.
- Tidak ada Health Snapshot, cerita, atau evidence lintas keluarga yang terbaca.
- Badge, grafik, dan timeline berasal dari data yang sama dan tidak bertentangan.
- Copy jelas menyatakan bahwa data bukan diagnosis medis.

**Commit atomik yang disarankan:**

```text
feat(riwayat-rangkul): tuntaskan timeline dan tren lansia

Riwayat memakai data privat terotorisasi dan aturan penurunan tiga kunjungan yang sama di server dan UI.

Refs: TDD §3.12, §4.7, §7, §8, FR-RWT-01, FR-RWT-02, FR-RWT-03, FR-RWT-04
```

## Task 3: Offline Evidence End-to-End

**Owner:** Mervin

**Reviewer:** Farros
**Scope:** TDD §3.13, §4.7, §4.14, §6-§8, §14.4; FR-TSK-05, FR-EVD-01-02, FR-RWT-01-02, FR-OFF-01-03.

**Files:**

- Modify: `src/lib/offline/evidence-store.ts`
- Modify: `src/hooks/use-offline-evidence.ts`
- Create: `src/components/offline/EvidenceSyncManager.tsx`
- Modify: `src/app/(helper)/layout.tsx`
- Refactor: `src/app/(helper)/tugas/[id]/lapor/page.tsx`
- Modify: `src/lib/validations/task-evidence.ts`
- Modify: `src/app/api/tasks/[id]/evidence/route.ts`
- Create: `supabase/migrations/20260828110000_task_evidence_sync_status.sql`
- Regenerate: `src/types/database.ts`
- Create: `tests/offline-evidence-store.test.mjs`
- Modify: `tests/task-evidence-flow.test.mjs`

**State lokal canonical:**

```text
draft -> pending_sync -> syncing -> submitted
                         -> failed -> pending_sync
```

- `draft` disimpan saat user mengisi, bukan hanya saat menekan submit dalam keadaan offline.
- Record memuat `owner_user_id`, `task_id`, `client_submission_id`, lima skor nullable sampai dipilih, cerita, catatan, Blob foto, status, retry count, last error yang aman, `created_at`, dan `updated_at`.
- Satu task hanya memiliki satu draft aktif per Helper. User lain pada browser yang sama tidak boleh melihat atau mengirim draft tersebut.
- `client_submission_id` dibuat sekali saat draft pertama dibuat dan tidak berubah saat retry.

**Langkah database/API:**

- [ ] Tambahkan migration `sync_status` sesuai keputusan Task 0 tanpa membuat row `pending_sync` di server sebelum upload.
- [ ] Pertahankan RPC submit evidence sebagai satu transaksi untuk insert evidence, insert Health Snapshot, dan transition task ke `selesai`.
- [ ] Validasi server memastikan object path evidence berasal dari actor dan doc type `foto_bukti`, lima skor 1-5, cerita wajib sesuai FR-RWT-02, dan task sedang dalam status yang boleh dilaporkan.
- [ ] Idempotency conflict dengan submission ID yang sama mengembalikan hasil sukses record pertama. Submission ID sama untuk payload/task berbeda harus `409`, bukan dianggap sukses.
- [ ] Jangan menerima signed URL arbitrary sebagai `foto_bukti_url`.

**Langkah IndexedDB/UI:**

- [ ] Tulis test merah untuk save/update/reload, isolasi owner, retry, duplicate submit, dan delete eksplisit.
- [ ] Tambahkan autosave terdebounce setelah field berubah dan indikator waktu terakhir tersimpan.
- [ ] Ubah skor awal menjadi belum dipilih. Semua indikator dan Cerita Hari Ini harus dipilih/diisi secara sadar sebelum sync.
- [ ] Preview foto berasal dari Blob lokal dan tetap tersedia setelah reload halaman.
- [ ] Pasang `EvidenceSyncManager` pada layout Helper agar event `online` bekerja walau user sudah berpindah dari halaman lapor.
- [ ] Ubah hook agar kegagalan sync dikembalikan sebagai hasil typed atau melempar error. Jangan redirect dan jangan menampilkan sukses bila upload/API gagal.
- [ ] Setelah server sukses, pertahankan status `submitted` cukup lama untuk memberi feedback dan mencegah resend. Bersihkan record hanya melalui aturan cleanup yang eksplisit.
- [ ] Tampilkan daftar draft pending/failed dan tombol retry/cancel. Cancel wajib memakai dialog karena menghapus Blob lokal.
- [ ] Bedakan offline, uploading, server validation error, conflict, dan submitted. Raw error database tidak boleh tampil.

**Test dan QA:**

- [ ] Simulasikan offline sebelum membuka form, isi semua data, reload, dan pastikan draft/foto tetap ada.
- [ ] Kembali online dari halaman Helper lain dan pastikan sync otomatis dipicu.
- [ ] Putus koneksi saat upload, pastikan UI tetap `failed/pending_sync` dan tidak redirect.
- [ ] Klik retry berulang dan pastikan hanya satu `task_evidence` serta satu `health_snapshot` terbentuk.
- [ ] Login Helper lain di browser sama dan pastikan draft bukan miliknya tidak terlihat/terkirim.
- [ ] Uji storage quota/error IndexedDB dan berikan pesan recovery yang tidak menghapus data diam-diam.

**Acceptance:**

- FR-OFF-01-03 dapat didemokan dengan DevTools offline tanpa service worker atau Background Sync.
- Tidak ada false success saat upload atau submit gagal.
- Task hanya menjadi `selesai` setelah evidence dan Health Snapshot tersimpan atomik.
- Draft tidak bocor antarakun dan retry tidak menggandakan record.

**Commit atomik yang disarankan:**

```text
feat(offline): selesaikan sinkronisasi laporan idempoten

Draft Helper bertahan saat offline dan hanya ditandai terkirim setelah transaksi server berhasil.

Refs: TDD §3.13, §4.7, §4.14, §6, §7, FR-OFF-01, FR-OFF-02, FR-OFF-03
```

## Task 4: Trust Tier Otomatis dan Counter Bersih

**Owner:** Farros

**Reviewer:** Mervin
**Scope:** TDD §3.3.2-§3.3.4, §3.10, §4.3, §6, §8; FR-HLP-02, FR-HLP-05, FR-HLP-06, FR-RPT-02.

**Files:**

- Create: `supabase/migrations/20260828120000_helper_trust_tier_automation.sql`
- Regenerate: `src/types/database.ts`
- Modify: `src/app/api/helpers/route.ts`
- Modify trust tier UI:
  - `src/app/(keluarga)/cari-helper/page.tsx`
  - `src/components/koordinator/HelperDirectoryClient.tsx`
  - `src/components/koordinator/ApprovalTaskCard.tsx`
- Modify: `supabase/seed.sql`
- Create: `tests/helper-trust-tier-runtime.test.mjs`
- Modify: `tests/helper-task-acceptance.test.mjs`

**Aturan database:**

- Counter bertambah tepat sekali ketika task milik Helper berpindah dari status bukan `selesai` ke `selesai`.
- Update lain pada task yang sudah `selesai` tidak boleh menambah counter lagi.
- Pada hitungan kelima, `tingkat_kepercayaan` menjadi `terpercaya` hanya jika Helper masih `verified`, tidak sedang `under_review/suspended`, dan tidak memiliki laporan yang memutus rangkaian bersih.
- Setiap laporan formal yang valid mereset `tugas_selesai_berturut` ke 0 dalam transaksi insert report.
- TDD belum tegas apakah satu laporan juga langsung menurunkan `tingkat_kepercayaan` dari `terpercaya` menjadi `probation`. Task 0 wajib mengunci keputusan ini. Jangan menebak di migration.
- Suspend dan pemulihan tidak boleh mengembalikan counter lama secara diam-diam.
- Seluruh logic berada di trigger/RPC database, bukan route yang membaca lalu menulis.

**Langkah:**

- [ ] Tulis runtime test merah untuk completion pertama, completion kelima, duplicate update, report reset, Helper under_review, dan dua completion bersamaan.
- [ ] Gunakan transition guard `OLD.status IS DISTINCT FROM 'selesai' AND NEW.status = 'selesai'` atau RPC ekuivalen.
- [ ] Lock row `helper_profiles` sebelum menghitung counter agar dua completion bersamaan tidak kehilangan increment.
- [ ] Integrasikan reset counter ke jalur `POST /api/reports` dalam transaksi yang sama dengan report, bukan update kedua dari route.
- [ ] Pastikan katalog dan detail Helper membaca trust tier database terbaru dan menampilkan label `Probation`/`Terpercaya` konsisten.
- [ ] Tampilkan alasan approval pada booking Helper probation dan jangan menampilkan probation untuk target waktu kurang dari tiga jam.
- [ ] Seed satu Helper dengan counter 4 dan satu task siap diselesaikan agar promosi dapat didemokan, selain lima Helper yang sudah terpercaya.

**Test dan acceptance:**

- [ ] Empat completion menghasilkan counter 4 dan tetap `probation`.
- [ ] Completion kelima menghasilkan counter 5 serta `terpercaya` tanpa edit manual.
- [ ] Dua completion concurrent menghasilkan kenaikan dua, bukan satu atau tiga.
- [ ] Satu report formal mereset counter pada transaksi yang sama.
- [ ] `under_review` tetap ditolak saat accept di route dan trigger database.
- [ ] UI booking memperlihatkan konsekuensi trust tier yang sesuai TDD.

**Commit atomik yang disarankan:**

```text
feat(helper): otomatisasi tingkat kepercayaan Helper

Counter tugas bersih diproses atomik agar promosi setelah lima tugas dan reset laporan tidak bergantung pada browser.

Refs: TDD §3.3.3, §3.10, §6, FR-HLP-05, FR-HLP-06
```

## Task 5: Admin Identity, Kategori, Statistik, dan Approval Koordinator

**Owner:** Mervin

**Reviewer:** Farros
**Scope:** TDD §3.3.1, §4.12, §6-§8, §14.4, §16; FR-ADM-01, FR-ADM-03-06, FR-ADM-10-11, FR-SVC-01.

**Files utama:**

- Modify: `src/app/(admin)/admin/users/page.tsx`
- Modify: `src/app/(admin)/admin/categories/page.tsx`
- Modify: `src/app/(admin)/admin/dashboard/page.tsx`
- Modify: `src/app/(admin)/admin/koordinator/pengajuan/page.tsx`
- Modify: `src/app/(admin)/admin/koordinator/pengajuan/PengajuanClient.tsx`
- Modify: `src/app/(admin)/admin/audit-logs/page.tsx`
- Modify: `src/app/api/admin/users/route.ts`
- Modify: `src/app/api/admin/users/[id]/route.ts`
- Create: `src/app/api/categories/route.ts`
- Create: `src/app/api/categories/[id]/route.ts`
- Refactor aliases: `src/app/api/admin/service-categories/route.ts` dan `src/app/api/admin/service-categories/[id]/route.ts`
- Modify: `src/app/api/admin/stats/route.ts`
- Create: `src/app/api/admin/koordinator/[id]/status/route.ts`
- Refactor aliases: `src/app/api/admin/koordinator/[id]/approve/route.ts` dan `reject/route.ts`
- Create: `src/lib/admin/service-categories.ts`
- Create: `src/lib/admin/koordinator-review.ts`
- Create: `supabase/migrations/20260828130000_admin_conditional_operations.sql`
- Regenerate: `src/types/database.ts`
- Modify: `src/lib/validations/admin.ts`, `admin-users.ts`
- Create: `tests/admin-operations-runtime.test.mjs`
- Modify: `tests/admin-panel-contract.test.mjs`
- Modify: `tests/admin-category-risk.test.mjs`
- Modify: `tests/admin-layout-pagination.test.mjs`

**Kontrak dan database:**

- Create/update kategori memakai endpoint canonical TDD. Alias lama hanya meneruskan ke service yang sama dan tidak boleh berbeda validation, audit, atau response.
- Update kategori memakai `PATCH`. Delete ditolak `409` jika kategori masih direferensikan task aktif atau data historis yang tidak boleh rusak. Untuk histori, prefer `is_active = false` daripada hard delete.
- Approval/rejection Koordinator adalah conditional mutation dari `pending` saja. Dua Admin yang memutus bersamaan menghasilkan satu sukses dan satu `409`.
- Keputusan review menyimpan reviewer, waktu, dan alasan wajib untuk rejection. Audit berada dalam transaksi yang sama.
- Admin user edit tidak dapat mengubah role, email Auth, saldo, account status, atau field sensitif lewat mass assignment.
- Hapus akun mengikuti keputusan TDD: Auth user dan row domain dibersihkan/soft-delete secara konsisten, dengan conflict jika masih ada kewajiban task/payment yang aktif.
- Statistik GMV berasal dari payment released/settled yang canonical, bukan menjumlah task selesai. Query agregat dijalankan server secara paralel atau satu RPC, bukan serial query per kartu.

**Langkah UI:**

- [ ] Refactor halaman yang berupa satu baris JSX besar menjadi komponen terpisah hanya bila diperlukan untuk testability dan state, tanpa redesign global.
- [ ] Users: search, role/status filter, pagination, create non-admin, edit field dasar, delete confirmation, loading, empty, forbidden, validation, conflict, dan retry.
- [ ] Categories: create/edit/nonaktifkan, `is_high_risk`, parent/leaf rule, harga, durasi, inline error, dan confirmation untuk perubahan berisiko.
- [ ] Koordinator queue: preview private documents dari Task 1, approve/reject reason, stale-state `409`, dan refresh setelah mutation.
- [ ] Dashboard: statistik terdefinisi jelas, timestamp data, error per panel, dan tidak mengubah API failure menjadi angka nol.
- [ ] Audit logs: filter actor/action/entity/date, pagination, detail metadata aman, dan state tanpa data.
- [ ] Terapkan strategi card/priority column untuk 375px. Table desktop boleh memakai controlled horizontal scroll dengan header dan aksi tetap dapat dijangkau.

**Test dan QA:**

- [ ] Non-Admin mendapat `403` pada seluruh Admin route meskipun memanggil URL langsung.
- [ ] Payload user dengan `role`, `email`, `saldo`, atau field asing ditolak/di-strip sesuai schema eksplisit.
- [ ] Dua request approval Koordinator bersamaan hanya menghasilkan satu keputusan dan satu audit record.
- [ ] Category yang direferensikan tidak dapat dihapus merusak histori.
- [ ] GMV hanya menghitung transaksi pada status yang ditetapkan kontrak.
- [ ] Dokumen Koordinator hanya dapat dibuka Admin reviewer melalui signed URL sementara.
- [ ] Uji seluruh halaman pada empat viewport dan keyboard-only.

**Acceptance:**

- FR-ADM-01, FR-ADM-03-06, FR-ADM-10-11 dan FR-SVC-01 berjalan dari UI sampai database.
- Route lama tetap kompatibel, tetapi hanya ada satu implementasi business rule.
- Tidak ada Admin mutation sensitif tanpa conditional state dan audit.

**Commit atomik yang disarankan:**

```text
feat(admin): amankan operasi user kategori dan koordinator

Mutation Admin memakai kontrak canonical, conditional state, dan audit agar keputusan tidak tertimpa request bersamaan.

Refs: TDD §3.3.1, §4.12, §6, §7, FR-ADM-01, FR-ADM-03, FR-ADM-04, FR-ADM-05, FR-ADM-06
```

## Task 6: Review Under Review, Fallback, dan Banding

**Owner:** Farros

**Reviewer:** Mervin
**Scope:** TDD §3.3.1-§3.3.4, §3.9-§3.10, §4.10, §4.12-§4.13, §6-§8, §16; FR-RPT-01-02, FR-ADM-02, FR-ADM-08-09, FR-APL-01-02.

**Files utama:**

- Modify: `src/components/reports/ReportListClient.tsx`
- Modify: `src/app/(koordinator)/koordinator/laporan/page.tsx`
- Modify: `src/app/(admin)/admin/reports/page.tsx`
- Modify: `src/app/(admin)/admin/helpers/page.tsx`
- Modify: `src/app/(admin)/admin/helpers/fallback/page.tsx`
- Modify: `src/app/(admin)/admin/banding/page.tsx`
- Modify: `src/app/api/reports/[id]/route.ts`
- Modify: `src/app/api/admin/helpers/[id]/route.ts`
- Modify: `src/app/api/admin/helpers/[id]/suspend/route.ts`
- Create: `src/app/api/admin/helpers/[id]/assign-fallback/route.ts`
- Modify: `src/app/api/appeals/route.ts`
- Modify: `src/app/api/admin/appeals/[id]/route.ts`
- Modify: `src/lib/audit.ts`
- Create: `supabase/migrations/20260828140000_trust_safety_decisions.sql`
- Regenerate: `src/types/database.ts`
- Create: `tests/trust-safety-runtime.test.mjs`
- Modify: `tests/sprint3-farros-follow-up-contract.test.mjs`

**Aturan trust-safety:**

- Dua laporan formal terkumpul mengubah Helper menjadi `under_review`, bukan langsung `suspended`.
- `under_review` diblokir menerima task pada database dan API. Task aktif yang sudah diterima tidak dibatalkan otomatis tanpa rule TDD.
- Koordinator hanya meninjau Helper dalam cakupan wilayahnya. Admin dapat melakukan review lintas wilayah.
- Keputusan manual wajib memilih hasil yang diizinkan kontrak, menulis alasan, reviewer, timestamp, status report, dan audit dalam satu transaksi.
- Generic PATCH Helper tidak boleh menjadi jalan belakang untuk restore/suspend tanpa reason dan state guard.
- Admin fallback hanya sah jika tidak ada Koordinator RT aktif dan tidak ada fallback RW yang memenuhi wilayah menurut §3.3.1. Pemeriksaan dan assignment harus berada dalam satu transaksi dengan lock yang mencegah race.
- Satu akun Keluarga hanya boleh memiliki satu appeal `menunggu` pada saat bersamaan. Gunakan partial unique index, bukan pola read lalu insert.
- Review appeal mengunci row, hanya menerima status awal `menunggu`, mewajibkan alasan, mengubah `users.account_status` sesuai keputusan, dan menulis audit atomik.

**Langkah:**

- [ ] Tulis test merah untuk laporan pertama, laporan kedua, accept saat under_review, wrong-region review, restore/suspend tanpa reason, fallback dengan Koordinator aktif, duplicate pending appeal, dan concurrent appeal review.
- [ ] Konsolidasikan report decision ke RPC yang melakukan lock, state guard, status Helper, status report, reason, dan audit.
- [ ] Ubah `ReportListClient` agar mengirim keputusan Helper dan reason, lalu menampilkan conflict jika reviewer lain lebih dulu memutus.
- [ ] Hapus kemampuan transisi status sensitif dari generic update schema, bukan menghapus route. Route generic tetap untuk field yang memang aman.
- [ ] Buat RPC fallback yang menghitung availability Koordinator dari region canonical dan menolak assignment palsu.
- [ ] Tambahkan partial unique index appeal pending dan tangani database conflict sebagai `409` yang jelas.
- [ ] Kurangi data reporter yang dikirim ke Koordinator. Email/identitas yang tidak dibutuhkan investigasi tidak boleh muncul.
- [ ] UI under_review menampilkan jumlah laporan, status, alasan keputusan, siapa reviewer, tombol valid sesuai state, confirmation, dan hasil conflict.

**Test dan acceptance:**

- [ ] Dua laporan menghasilkan `under_review` dan satu notifikasi yang idempoten.
- [ ] Helper under_review ditolak di route accept dan trigger database.
- [ ] Koordinator salah wilayah tidak dapat membaca detail sensitif atau memutus laporan.
- [ ] Restore/suspend tanpa reason ditolak.
- [ ] Fallback Admin ditolak jika RT/RW aktif tersedia.
- [ ] Dua appeal pending concurrent menghasilkan satu row.
- [ ] Dua reviewer concurrent menghasilkan satu keputusan final dan satu audit canonical.

**Commit atomik yang disarankan:**

```text
fix(laporan): kunci keputusan review dan banding

Review Helper, fallback, dan banding kini memakai state guard serta audit atomik agar tidak dapat dilewati lewat update generik.

Refs: TDD §3.3.1, §3.9, §3.10, §6, §7, FR-RPT-02, FR-ADM-08, FR-ADM-09, FR-APL-01, FR-APL-02
```

## Task 7: Pembayaran dengan Saldo Demo

**Owner:** Mervin

**Reviewer:** Farros
**Scope:** TDD §3.4, §4.6, §4.12, §6-§8, §14.4; FR-PAY-01-06, FR-ADM-05, fallback Saldo Demo pada §3.4 dan §14.4.

**Files utama:**

- Modify: `src/app/(keluarga)/pembayaran/[task_id]/page.tsx`
- Create: `src/app/api/payments/[task_id]/demo-wallet/charge/route.ts`
- Modify: `src/app/api/admin/demo-wallet/route.ts`
- Modify: `src/app/api/admin/demo-wallet/topup/route.ts`
- Modify: `src/app/(admin)/admin/demo-wallet/page.tsx`
- Modify: `src/lib/validations/admin.ts`
- Create: `src/lib/validations/demo-wallet.ts`
- Create: `supabase/migrations/20260828150000_demo_wallet_payment.sql`
- Regenerate: `src/types/database.ts`
- Modify: `supabase/seed.sql`
- Create: `tests/demo-wallet-payment-runtime.test.mjs`
- Modify: `tests/sprint4-contract.test.mjs`

**Transaction contract:**

- Browser hanya mengirim task ID dan optional idempotency key. Nominal, owner wallet, `harga_final`, payment method, split, dan status dibaca server/database.
- RPC mengunci task, payment, dan wallet Keluarga. Actor harus sama dengan `tasks.keluarga_id` dan task berada pada state yang boleh dibayar.
- Saldo harus cukup. Debit tidak boleh membuat saldo negatif dan semua arithmetic memakai numeric database, bukan floating point client.
- Payment berubah ke method `saldo_demo` serta status canonical yang setara dana tertahan. Debit ledger, payment, `transaction_logs`, dan `audit_logs` dibuat dalam satu transaksi.
- Retry request yang sama mengembalikan payment existing tanpa debit kedua. Request berbeda setelah payment tertahan menghasilkan `409`.
- Midtrans Sandbox tetap jalur utama. UI menawarkan Saldo Demo sebagai fallback yang diberi label jelas, bukan uang nyata dan bukan bukti transaksi gateway.
- Ledger harus mendukung entry `topup` positif dan `charge` negatif dengan constraint berdasarkan entry type. Jangan menghapus check lama tanpa menggantinya dengan invariant yang lebih kuat.

**Langkah:**

- [ ] Tulis test merah untuk success, insufficient balance, task milik orang lain, amount tampering, double click, concurrent charge, payment already held, dan audit failure rollback.
- [ ] Tambahkan migration ledger entry type/reference payment serta RPC `charge_task_with_demo_wallet` dan perbaiki RPC top-up agar audit atomik.
- [ ] Pastikan RLS Keluarga hanya dapat membaca wallet dan ledger sendiri, sedangkan debit hanya melalui RPC terotorisasi.
- [ ] Implementasikan route dengan Zod dan error mapping `401/403/404/409/422/500` sesuai kontrak.
- [ ] UI pembayaran menampilkan Midtrans sebagai pilihan utama, tombol fallback, saldo tersedia, nominal server, confirmation, pending, success, insufficient balance, conflict, retry aman, dan label `Saldo Demo`.
- [ ] Admin wallet menampilkan saldo dan history top-up/debit dengan actor, alasan, waktu, reference, pagination, serta confirmation top-up.
- [ ] Seed memberi satu Keluarga saldo cukup dan satu Keluarga saldo kurang untuk demo dua state.

**Test dan acceptance:**

- [ ] Manipulasi nominal dari DevTools tidak mengubah jumlah debit.
- [ ] Double click dan dua request concurrent hanya mendebit sekali.
- [ ] Saldo kurang tidak mengubah payment, ledger, task, atau audit sebagian.
- [ ] Family A tidak dapat membaca atau memakai wallet Family B.
- [ ] Setelah charge, halaman payment dan detail task menampilkan status dana ditahan yang sama.
- [ ] Jalur demo booking sampai payment dapat selesai ketika Midtrans tidak digunakan.

**Commit atomik yang disarankan:**

```text
feat(payment): tambah fallback pembayaran Saldo Demo

Pembayaran fallback mendebit wallet dan menahan dana secara atomik tanpa memercayai nominal dari browser.

Refs: TDD §3.4, §4.6, §6, §7, FR-PAY-01, FR-PAY-04
```

## Task 8: Komisi dan Darurat Koordinator

**Owner:** Mervin

**Reviewer:** Farros
**Scope:** TDD §3.4, §3.6, §4.6, §4.9-§4.10, §7-§9, §14.4; FR-PAY-06, FR-NOT-01-04, FR-SOS-01.

**Files:**

- Replace placeholder: `src/app/(koordinator)/koordinator/komisi/page.tsx`
- Modify: `src/app/(koordinator)/koordinator/darurat/page.tsx`
- Modify: `src/components/koordinator/KoordinatorEmergencyClient.tsx`
- Create: `src/app/api/koordinator/commissions/route.ts`
- Modify: `src/app/api/emergency/route.ts`
- Modify: `src/app/api/emergency/[id]/acknowledge/route.ts`
- Create: `src/lib/validations/koordinator-operations.ts`
- Create: `supabase/migrations/20260828160000_koordinator_commissions_and_emergency.sql`
- Regenerate: `src/types/database.ts`
- Create: `tests/koordinator-commissions-runtime.test.mjs`
- Create: `tests/koordinator-emergency-runtime.test.mjs`
- Modify: `tests/sprint4-contract.test.mjs`

**Commission contract:**

- `GET /api/koordinator/commissions?from=&to=&page=&limit=` hanya untuk Koordinator verified.
- Sumber nilai adalah `payments.koordinator_share` pada payment `released`, bukan perkiraan 3% di browser.
- Query hanya memuat task dalam cakupan wilayah Koordinator yang sah menurut relasi assignment/approval TDD.
- Response memuat total released, jumlah transaksi, daftar entry paginated, task reference, tanggal release, dan status. Tidak mengirim identitas atau kondisi lansia yang tidak dibutuhkan.
- Empty period menghasilkan `200` dengan daftar kosong; database failure menghasilkan error state dan tidak berubah menjadi Rp0.

**Emergency contract:**

- Alert hanya terlihat oleh Keluarga participant dan Koordinator wilayah yang terkait.
- Acknowledge memakai conditional update dari alert aktif/unacknowledged. Dua klik/reviewer bersamaan menghasilkan satu sukses dan satu hasil idempoten/conflict sesuai kontrak.
- UI `tel:112` tidak mengklaim terhubung ke ambulans atau SMS provider.
- Realtime update tidak menggantikan authorization atau refetch setelah reconnect.

**Langkah:**

- [ ] Tulis runtime test merah untuk komisi released/refunded/pending, wrong-region Koordinator, pagination, dan date range invalid.
- [ ] Tulis runtime test merah untuk emergency participant, wrong-region, duplicate acknowledge, Realtime reconnect, dan database error.
- [ ] Buat query/RPC komisi yang menghitung dari released payment dan scope wilayah tanpa service-role overfetch.
- [ ] Implementasikan route dengan Zod, pagination maksimal 100, serta error `401/403/422/500` yang aman.
- [ ] Bangun halaman komisi ringkas: total, jumlah transaksi, period filter, list/card mobile, table desktop terkontrol, loading, empty, error, retry, dan pagination.
- [ ] Perbaiki halaman darurat agar query error terlihat sebagai error, bukan empty state. Tampilkan waktu, status acknowledge, task context minimal, dan tombol call/acknowledge yang dapat digunakan keyboard.
- [ ] Verifikasi subscription dibersihkan saat unmount dan refetch dilakukan ketika channel kembali `SUBSCRIBED`.
- [ ] Jangan mengerjakan `/koordinator/pengawasan` sebelum seluruh P0 pada audit awal lulus. Placeholder P2 dicatat, bukan diklaim selesai.

**Acceptance:**

- FR-PAY-06 dan FR-SOS-01 memiliki alur UI -> API -> database/RLS -> UI.
- Komisi tidak menghitung payment selain `released` dan tidak bocor lintas wilayah.
- Acknowledge alert aman terhadap double click/race.
- Loading, empty, error, forbidden, dan reconnect dapat dibedakan.
- UI lulus pada 375px, 768px, 1024px, dan 1440px.

**Commit atomik yang disarankan:**

```text
feat(koordinator): lengkapi komisi dan respons darurat

Koordinator melihat komisi released dalam wilayahnya dan dapat menangani alert persisten tanpa mengubah error menjadi empty state.

Refs: TDD §3.4, §3.6, §7, §8, FR-PAY-06, FR-SOS-01
```

## Task 9: Audit RLS dan Privacy Runtime

**Owner:** Farros

**Contributor:** Mervin untuk policy domain Task 1, 5, 7, dan 8

**Reviewer:** Mervin
**Scope:** TDD §6, §8, §14.4, §16 dan seluruh FR yang memproses data pribadi.

**Files:**

- Create: `supabase/migrations/20260828170000_close_broad_user_and_sensitive_policies.sql`
- Modify: `tests/rls-integration.test.mjs`
- Create: `tests/sprint4-rls-runtime.test.mjs`
- Create: `docs/planning/sprint4/rls-matrix.md`
- Audit: seluruh route di `src/app/api/**` yang memakai `createAdminClient`.

**Policy blocker yang wajib diperbaiki:**

```sql
DROP POLICY IF EXISTS "Authenticated users can read all users" ON public.users;
```

Policy pengganti tidak boleh memakai `USING (true)` untuk authenticated. Public Helper catalog mendapat field publik melalui query/server projection, bukan akses ke seluruh `users`.

**Matriks minimum:**

| Resource                                | Keluarga                                              | Helper                                             | Koordinator                          | Admin                       |
| --------------------------------------- | ----------------------------------------------------- | -------------------------------------------------- | ------------------------------------ | --------------------------- |
| `users`                               | diri sendiri dan profil Helper publik yang diperlukan | diri sendiri/participant publik                    | diri sendiri dan scope verifikasi    | seluruh untuk operasi Admin |
| `lansia_profiles`                     | milik sendiri                                         | hanya setelah menjadi participant task             | hanya saat approval/laporan yang sah | investigasi/Admin           |
| `tasks`                               | milik sendiri                                         | available projection atau assigned                 | scope wilayah/approval               | audit/operasi               |
| `task_evidence`, `health_snapshots` | task milik sendiri                                    | task assigned miliknya                             | hanya review sah                     | investigasi/Admin           |
| `messages`                            | participant task                                      | participant task                                   | hanya jika TDD memberi akses         | investigasi terbatas        |
| `reports`, `appeals`                | milik/yang dibuat sendiri                             | status terkait dirinya tanpa reporter overexposure | scope wilayah                        | seluruh untuk review        |
| `payments`, wallet, ledger            | milik sendiri                                         | share miliknya                                     | share wilayahnya                     | operasi/audit               |
| `audit_logs`                          | deny                                                  | deny                                               | deny kecuali contract khusus         | read only Admin             |
| private storage                         | owner/resource authorized                             | resource authorized                                | review authorized                    | review authorized           |

**Langkah:**

- [ ] Tulis runtime test dengan akun seed Family A/B, Helper A/B, Koordinator RT/RW, dan Admin. Test harus gagal sebelum migration.
- [ ] Drop broad users policy dan tambahkan policy sempit untuk self read. Profil publik Helper disediakan melalui route/projection yang memilih allowlist field.
- [ ] Tutup policy evidence/snapshot/message/report yang terlalu luas. Tambahkan akses reviewer hanya pada relasi laporan/approval yang sah.
- [ ] Audit grants `anon`, `authenticated`, dan function `SECURITY DEFINER`. Setiap function memakai fixed `search_path`, explicit auth check, revoke `PUBLIC`, dan grant minimum.
- [ ] Audit seluruh penggunaan service role. Route wajib memverifikasi sesi, role, ownership/scope, dan input sebelum membuat Admin client.
- [ ] Pastikan raw Supabase error, path dokumen, email reporter, token, atau metadata audit tidak dikirim ke browser tanpa kebutuhan contract.
- [ ] Dokumentasikan expected allow/deny per actor-resource-action di `rls-matrix.md` dengan nama test yang menjadi evidence.

**Runtime acceptance:**

- [ ] Family A tidak membaca user/lansia/task/evidence/snapshot/payment Family B.
- [ ] Helper available tidak melihat alamat/catatan lansia sebelum assigned.
- [ ] Helper assigned hanya melihat task/evidence/payment yang terkait dirinya.
- [ ] Koordinator RT tidak membaca Helper/report/task wilayah lain; RW hanya scope RW-nya.
- [ ] Admin route menolak non-Admin meski API dipanggil langsung.
- [ ] Audit log tidak dapat dibaca role publik.
- [ ] Private document read mengikuti Task 1 dan tetap gagal untuk actor tidak sah.
- [ ] `RUN_SUPABASE_INTEGRATION=1 npm run test` tidak menampilkan skip pada RLS suite.

**Commit atomik yang disarankan:**

```text
fix(rls): tutup akses luas data pribadi

Policy user dan resource sensitif dibatasi per ownership, participant, wilayah, serta review yang sah dan dibuktikan melalui runtime matrix.

Refs: TDD §6, §8, §16
```

## Task 10: Seeder Demo Cloud yang Deterministik

**Owner integrasi:** Farros

**Contributor:** Mervin untuk fixture Admin, wallet, komisi, dan private assets

**Reviewer:** Mervin
**Scope:** TDD §14.4, §16, §19.

**Files:**

- Modify: `supabase/seed.sql`
- Modify: `scripts/seed.mjs`
- Create: `scripts/seed-assets.mjs`
- Create assets:
  - `scripts/seed-assets/identitas-lansia-demo.png`
  - `scripts/seed-assets/hubungan-keluarga-demo.pdf`
  - `scripts/seed-assets/dokumen-koordinator-demo.pdf`
  - `scripts/seed-assets/bukti-kunjungan-demo.jpg`
- Modify: `package.json`
- Modify: `tests/demo-seed-matrix.test.mjs`
- Modify: `tests/demo-user-seed.test.mjs`
- Modify: `tests/seed-command.test.mjs`
- Create: `tests/seed-cloud-runtime.test.mjs`

**Matriks fixture wajib:**

- 1 Admin demo yang dikenali marker/email tetap, tanpa mengambil alih akun Admin lain.
- 3 Koordinator RT verified di tiga RT dan 1 Koordinator RW verified, seluruh dokumen private terisi dan reviewer Admin valid.
- 5 Helper terpercaya, 2 probation, 1 under_review dengan dua laporan, dan 1 admin fallback.
- 13 kategori leaf aktif dengan tingkat serta harga TDD; kategori faskes high-risk.
- 4 Keluarga, masing-masing 1 lansia dengan dokumen identitas dan hubungan private.
- 4-5 snapshot menurun untuk satu lansia dan evidence private yang dapat di-sign ulang.
- Task pada `diajukan`, `menunggu_persetujuan_koordinator`, `menunggu_persetujuan_keluarga`, `dikonfirmasi`, `dikerjakan`, `selesai`, dan `dibatalkan`.
- Payment Midtrans states dan Saldo Demo cukup/kurang, ledger top-up/charge, komisi released, report, appeal pending/decided, emergency active/acknowledged, notification, dan audit.

**Langkah:**

- [ ] Tulis test yang menghitung fixture aktual dan gagal pada seed sekarang. Jangan hanya mencari satu string status.
- [ ] Ganti pemilihan `first Admin` dengan lookup marker demo eksplisit. Jika akun demo tidak ada, buat melalui script service role atau gagal dengan instruksi aman; jangan rename akun existing.
- [ ] Gunakan UUID/marker deterministik untuk seluruh fixture dan `ON CONFLICT` yang mengembalikan state exact pada setiap rerun.
- [ ] Hapus seluruh `https://demo.invalid` dan URL eksternal sebagai evidence. Upload asset lokal ke bucket private melalui `scripts/seed-assets.mjs`, lalu simpan object path.
- [ ] `seed-assets.mjs` memvalidasi `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`, tidak mencetak secret, upload idempoten dengan path tetap, dan menolak target URL non-HTTP(S).
- [ ] Ubah `npm run seed:cloud` agar menjalankan SQL seed dan private asset seed dengan urutan terkontrol. Local mode tetap tidak menjadi acceptance karena project memakai cloud.
- [ ] Pastikan saldo demo kembali tepat ke nilai fixture pada rerun tanpa ledger ganda.
- [ ] Pastikan appeal pending dimiliki Keluarga restricted dan keputusan appeal memiliki actor/reason yang koheren.
- [ ] Pastikan task status approval mengacu Helper/Koordinator/Keluarga yang benar, bukan row lepas.

**Cloud verification:**

- [ ] Verifikasi linked project ID sebelum mutation. Jangan menjalankan reset terhadap production.
- [ ] Jalankan `npx supabase db push` pada project development cloud dan pastikan semua migration applied.
- [ ] Jalankan `npm run seed:cloud` dua kali.
- [ ] Jalankan runtime query yang membandingkan count/status setelah rerun pertama dan kedua.
- [ ] Login seluruh role seed dan buka golden path tanpa edit manual Dashboard Supabase.
- [ ] Jika clean migration replay dibutuhkan, gunakan project cloud development disposable yang targetnya dikonfirmasi. Tanpa environment bersih, jangan mengklaim clean replay lulus.

**Acceptance:**

- Seluruh count §19 terpenuhi dan rerun tidak menambah row.
- Semua dokumen/evidence berasal dari private object path yang nyata.
- Tidak ada data real, URL rusak, UUID manual, atau akun existing yang diubah.
- Jalur demo dapat berjalan tanpa Midtrans melalui Saldo Demo dan tanpa SMS.

**Commit atomik yang disarankan:**

```text
feat(seed): lengkapi matriks demo cloud

Seeder idempoten menyediakan seluruh role, status, dokumen private, tren, payment fallback, dan skenario keamanan tanpa data manual.

Refs: TDD §16, §19
```

## Task 11: CI, Scheduled Jobs, Dry Run, dan Handover

**Owner:** Farros dan Mervin

**Integrator:** Farros
**Scope:** TDD §2.3, §14.4, §14.8, §16, §17.

**Files:**

- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/heartbeat.yml`
- Create: `.github/workflows/scheduled-jobs.yml`
- Create: `docs/planning/sprint4/completion-audit.md`
- Create: `docs/planning/sprint4/demo-runbook.md`
- Modify: `README.md` hanya untuk setup/demo yang benar-benar telah diverifikasi.
- Modify: `docs/walkthrough.md` bila file ini menjadi runbook utama repository.

**Workflow contract:**

- CI berjalan pada push `main`/`develop` dan pull request menuju `main` maupun `develop`.
- Node memakai major 22 yang memenuhi `>=22.6.0`.
- Urutan CI: `npm ci`, lint, typecheck, test, build.
- Heartbeat hanya health ping pada cron `0 3 * * 1,4` dan manual dispatch.
- Scheduled jobs terpisah berjalan setiap 5 menit untuk expiry task dan sesuai kebutuhan auto-release. Secret divalidasi sebelum request.
- Deploy production tetap hanya dari `main` setelah PR dan quality gate.

**Langkah:**

- [ ] Tambahkan `develop` ke event pull request CI dan test workflow source.
- [ ] Pisahkan heartbeat dari job bisnis agar ping pencegah auto-pause tidak berjalan tiap lima menit.
- [ ] Pastikan workflow job bisnis menggunakan endpoint/RPC idempoten dan gagal jelas jika secret/HTTP response invalid.
- [ ] Jalankan quality gate final setelah edit terakhir: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.
- [ ] Jalankan runtime cloud RLS suite dengan flag integration dan catat hasil tanpa secret.
- [ ] Jalankan seed dua kali, lalu dry run lima role: Keluarga, Helper terpercaya, Helper probation, Koordinator RT/RW, dan Admin.
- [ ] Dry run utama: login -> lansia -> katalog/booking -> accept/approval -> payment Midtrans atau Saldo Demo -> check-in -> offline report -> Riwayat -> completion/release -> report 2x -> review -> appeal.
- [ ] Simulasikan image expiry, offline upload failure, payment error, accept race, wrong role, wrong region, insufficient wallet, dan scheduled expiry.
- [ ] Uji 375px, 768px, 1024px, 1440px untuk halaman Sprint 4 dan catat screenshot/evidence.
- [ ] Isi completion audit dengan commit, migration, endpoint, runtime test, responsive evidence, known limitation, dan keputusan P2.

**Final acceptance:**

- Tidak ada bug P0, skipped runtime RLS, broad user policy, signed URL permanen, atau seed manual.
- CI local dan remote hijau pada commit final.
- Scheduled job dan heartbeat memiliki tujuan/jadwal terpisah.
- Demo dapat diselesaikan tanpa Midtrans, SMS, Docker, atau data real.
- `develop` tetap branch integrasi; production hanya lewat PR `develop` ke `main`.

**Commit atomik yang disarankan:**

```text
chore(ci): selaraskan quality gate dan scheduled jobs

CI menjaga kedua target PR, sedangkan heartbeat dan job bisnis berjalan pada jadwal yang sesuai tanggung jawabnya.

Refs: TDD §2.3, §14.4
```

## Definition of Done per Owner

### Farros selesai jika

- [ ] Task 0 mengunci drift kontrak TDD/API tanpa menghapus route lama.
- [ ] Riwayat Rangkul menampilkan timeline, lima tren, badge strict decline, disclaimer, dan private evidence untuk Keluarga owner.
- [ ] Trust tier naik setelah lima tugas bersih dan report mereset counter secara atomik.
- [ ] Review report, under_review, fallback, suspend/restore, serta appeal memiliki reason, state guard, dan audit atomik.
- [ ] Broad `users` policy ditutup dan runtime RLS matrix seluruh role lulus tanpa skip.
- [ ] Seed memenuhi count §19, memakai private object path, dan idempoten dua rerun.
- [ ] CI, heartbeat, scheduled job, serta dry run memiliki evidence pada completion audit.

### Mervin selesai jika

- [ ] Upload menyimpan private object path dan seluruh authorized reader melakukan re-sign setelah authorization.
- [ ] Offline draft autosave, terisolasi per Helper, tidak false-success, retry idempoten, dan sync tetap berjalan dari layout Helper.
- [ ] Admin users/categories/stats/Koordinator approval memiliki mutation canonical, state guard, audit, dan UI state lengkap.
- [ ] Saldo Demo dapat membayar task dari UI Keluarga secara atomik tanpa nominal browser.
- [ ] Komisi Koordinator berasal dari released payment dan tidak bocor lintas wilayah.
- [ ] Darurat membedakan error/empty, Realtime reconnect aman, dan acknowledge conditional.
- [ ] Seluruh halaman miliknya lulus responsive, keyboard, focus, loading, empty, error, forbidden, conflict, dan retry QA.

### Keduanya selesai jika

- [ ] Review silang contract dilakukan sebelum merge, bukan sesudah bug integrasi muncul.
- [ ] Setiap PR memiliki test domain, migration/RLS bila perlu, seed fixture, dan manual vertical evidence.
- [ ] `npm ci`, lint, typecheck, test, dan build dijalankan ulang setelah perubahan terakhir.
- [ ] Cloud migration target diverifikasi dan tidak ada destructive reset production.
- [ ] Demo lima role berhasil dari seed tanpa edit manual Supabase.
- [ ] P2 yang tidak dikerjakan dicatat jujur dan tidak memiliki menu/claim menyesatkan.

## Matriks Acceptance Sprint 4

| Gate             | Evidence wajib                                                   | Owner                      | Status baseline      |
| ---------------- | ---------------------------------------------------------------- | -------------------------- | -------------------- |
| Riwayat 30 detik | Video/screenshot timeline, grafik, badge, runtime ownership test | Farros                     | Parsial              |
| Private storage  | Row berisi object path, re-sign test, unauthorized read test     | Mervin                     | Gagal                |
| Offline evidence | Offline reload/reconnect/retry/dedup recording dan test          | Mervin                     | Parsial              |
| Trust tier       | Runtime completion/report/concurrency test                       | Farros                     | Belum ada            |
| Admin P0         | Mutation race, audit, forbidden, UI state                        | Mervin/Farros sesuai slice | Parsial              |
| Saldo Demo       | Charge success/insufficient/double-click/ownership test          | Mervin                     | Belum ada end-to-end |
| Koordinator      | Commission scope dan emergency acknowledge test                  | Mervin                     | Parsial              |
| RLS              | Role-resource-action matrix tanpa skip                           | Farros                     | Gagal                |
| Seed             | Count §19, private assets, rerun checksum/count                 | Farros integrator          | Gagal                |
| CI/job           | Local gate, remote run, heartbeat schedule, job schedule         | Farros integrator          | Parsial              |
| Demo             | Runbook dan dua dry run dengan normal/failure path               | Keduanya                   | Belum dibuktikan     |

Tidak ada baris berstatus `Parsial`, `Belum ada`, atau `Gagal` yang boleh diubah menjadi selesai hanya berdasarkan keberadaan file. Status berubah setelah evidence column terpenuhi.

## Risiko dan Keputusan Cut

| Risiko                              | Trigger                                   | Respons wajib                                                                                |
| ----------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| Private file rusak setelah satu jam | Database masih menyimpan signed URL       | Hentikan polish; selesaikan Task 1 sebelum Riwayat/review sign-off.                          |
| RLS runtime tidak dapat dijalankan  | Secret/akun test tidak tersedia           | Siapkan credential development. Jangan mengganti dengan test regex atau klaim aman.          |
| Cloud migration target tidak jelas  | Project ref tidak terverifikasi           | Jangan`db push`; verifikasi linked project dan environment lebih dulu.                     |
| Seed merusak akun existing          | Seeder memilih akun tanpa marker demo     | Hentikan seed, perbaiki selector/transaction, pulihkan hanya data demo yang teridentifikasi. |
| Saldo Demo terlambat                | Task 7 belum lulus 29 Agustus             | Potong filter RW, advanced stats, dan polish non-demo. Jangan memotong RLS/storage/seed.     |
| Offline terlalu kompleks            | Autosave/sync manager masih false-success | Pertahankan manual retry yang jujur; jangan klaim auto-sync sampai listener global terbukti. |
| Audit log gagal terpisah            | Mutation sukses tetapi audit gagal        | Pindahkan mutation dan audit ke RPC transaction sebelum sign-off.                            |
| Waktu habis                         | Ada P0 pada 30 Agustus                    | Bekukan P2 dan alihkan kedua owner ke blocker P0.                                            |

## Handoff Wajib per Vertical Slice

Gunakan format berikut di PR atau completion audit:

```text
Owner:
Scope dan FR:
Branch/commit:
Files:
Endpoint contract:
Migration/RPC:
RLS allow/deny:
Seed fixture:
Automated tests dan hasil:
Manual viewport/accessibility evidence:
Happy path result:
Forbidden/conflict result:
Known limitation:
Blocked by:
Next reviewer/action:
```

Handoff tanpa hasil test dan actor forbidden belum siap direview. Screenshot halaman sukses saja bukan evidence fullstack.

## Urutan Commit yang Disarankan

1. `docs(payment): kunci kontrak sprint 4`
2. `fix(rls): simpan referensi file private sebagai object path`
3. `feat(riwayat-rangkul): tuntaskan timeline dan tren lansia`
4. `feat(offline): selesaikan sinkronisasi laporan idempoten`
5. `feat(helper): otomatisasi tingkat kepercayaan Helper`
6. `feat(admin): amankan operasi user kategori dan koordinator`
7. `fix(laporan): kunci keputusan review dan banding`
8. `feat(payment): tambah fallback pembayaran Saldo Demo`
9. `feat(koordinator): lengkapi komisi dan respons darurat`
10. `fix(rls): tutup akses luas data pribadi`
11. `feat(seed): lengkapi matriks demo cloud`
12. `chore(ci): selaraskan quality gate dan scheduled jobs`
13. `docs(sprint4): catat hasil completion audit`

Urutan dapat berubah bila dependency menuntut, tetapi domain berbeda tidak boleh digabung hanya untuk mengurangi jumlah commit.

## Final Verification Commands

Jalankan dari root repository setelah perubahan terakhir:

```text
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Runtime cloud development:

```text
npx supabase migration list
npx supabase db push
npm run seed:cloud
npm run seed:cloud
```

Pada PowerShell, aktifkan runtime integration test hanya pada proses shell yang benar:

```powershell
$env:RUN_SUPABASE_INTEGRATION = "1"
npm run test
Remove-Item Env:RUN_SUPABASE_INTEGRATION
```

Sebelum `npx supabase db push`, baca project ref yang ter-link dan pastikan itu project development. Tidak ada perintah reset cloud production dalam rencana ini.

## Exit Criteria Sprint 4

Sprint 4 baru boleh ditandai selesai jika:

1. seluruh blocker audit awal ditutup;
2. matriks acceptance memiliki evidence, bukan asumsi;
3. seluruh quality gate lokal dan remote hijau;
4. seed cloud dapat diulang tanpa perubahan manual;
5. runtime RLS membuktikan deny lintas role/ownership;
6. demo normal dan failure path dapat dijalankan dari runbook;
7. known limitation P2 ditulis jujur;
8. tidak ada fitur Sprint 6 `pelamar`/`cepat` yang masuk scope Sprint 4.
