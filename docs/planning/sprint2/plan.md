# Sprint 2: Alur Kunjungan Inti dan Riwayat Data Dasar (Frontend) — Implementation Plan

**Goal:** Menyelesaikan antarmuka pengguna (UI) dan alur interaksi sisi client untuk pemesanan (booking), penerimaan tugas oleh Helper, check-in, dan form pelaporan (termasuk Health Snapshot). Backend diasumsikan akan dikerjakan oleh rekan tim (atau menggunakan mock/kontrak API terlebih dahulu).

## Scope
- Domain TDD: §5 (User Flow), §9 (Struktur Halaman), §13 (Development Guideline), dan §14.4 (Sprint 2 - Frontend).

## Breakdown File
- `src/app/(keluarga)/booking/[helper_id]/page.tsx`: Halaman form pemesanan (pilih lansia, kategori, jadwal, ringkasan harga fix).
- `src/app/(keluarga)/kunjungan/page.tsx`: Daftar kunjungan Keluarga.
- `src/app/(keluarga)/kunjungan/[id]/page.tsx`: Detail kunjungan Keluarga (timeline status, cancel/reschedule UI).
- `src/app/(helper)/tugas/page.tsx`: Job board (daftar tugas tersedia) untuk Helper.
- `src/app/(helper)/tugas/[id]/page.tsx`: Detail tugas Helper (termasuk UI accept, check-in).
- `src/app/(helper)/tugas/[id]/lapor/page.tsx`: Form laporan dasar (foto, catatan, 5 indikator Health Snapshot, Cerita Hari Ini).
- `src/app/(koordinator)/antrean-persetujuan/page.tsx`: Halaman daftar antrean approval untuk kondisi khusus (probation, risiko tinggi).
- `src/components/ui/TaskStatusBadge.tsx`: Komponen UI tunggal untuk status task agar konsisten di seluruh role.

## Integrasi API (via Client)
- Menyambungkan form booking dengan kontrak API POST `/api/tasks`.
- Menyambungkan aksi *accept* Helper dengan PATCH `/api/tasks/[id]/accept` dan menangani error `409 Conflict` (race condition).
- Menyambungkan aksi *start* (check-in) dan *complete* (konfirmasi Keluarga).
- Menyambungkan form Laporan dengan POST `/api/tasks/[id]/evidence` (termasuk upload foto/file lewat UI secara *client-side* ke Supabase Storage atau dikirim ke API server).

## Pendekatan Testing (Frontend)
- Memastikan navigasi per-role berjalan dengan aman (middleware auth).
- Uji validasi form Zod + React Hook Form di sisi client.
- Tes state *loading/error/empty* pada setiap halaman daftar dan detail.
- Uji penanganan error khusus `409` saat ada dua Helper mencoba menerima tugas secara bersamaan.

## Risiko/Pertanyaan Terbuka
- Jika endpoint backend belum siap di Hari ke-2 Sprint ini, maka pembuatan **Data Mock** menjadi esensial agar progress UI tidak terhenti.
- Implementasi *Offline Draft* (IndexedDB) untuk UI form Laporan mungkin membutuhkan effort tambahan, akan ditambahkan ke prioritas kedua di sprint ini jika *golden path* online sudah stabil.

## Sprint 2 Continuation: Directory Helper Terverifikasi

### Scope
- TDD §3.3.1, §3.3.3, §3.3.4: Koordinator melihat Helper terverifikasi di wilayahnya dan snapshot aktivitas tugas.
- TDD §5.3 dan §9: dashboard/menu Koordinator dan halaman directory Helper.
- TDD §8: RLS membatasi data Helper dan tugas hanya pada Koordinator yang berwenang.

### Breakdown File
- Create `src/app/api/koordinator/helpers/route.ts` untuk response directory Helper terverifikasi beserta satu aktivitas tugas aktif.
- Create `src/app/(koordinator)/koordinator/helper/page.tsx` dan `src/components/koordinator/HelperDirectoryClient.tsx` untuk kartu, filter status, loading, empty, error, dan refresh.
- Modify `src/app/(koordinator)/koordinator/dashboard/page.tsx` dan `src/components/layout/Navbar.tsx` untuk entry point directory.
- Create `supabase/migrations/20260821120000_add_koordinator_helper_visibility.sql` untuk policy SELECT scoped pada Helper milik Koordinator dan task Helper tersebut.
- Update `docs/TDD_Rangkul.md` §7 dan §9 untuk kontrak endpoint dan route directory.

### Perubahan Database
- Tidak menambah kolom atau tabel.
- Tambah RLS SELECT pada `tasks` agar Koordinator verified hanya dapat membaca task milik Helper yang `koordinator_id`-nya menunjuk profil Koordinator tersebut.

### Endpoint API
- `GET /api/koordinator/helpers`: mengembalikan `koordinator_wilayah`, `total`, dan Helper berstatus `verified` dengan `status_aktivitas` serta `tugas_aktif` terbatas pada status tugas aktif.

### Pendekatan Testing
- Test kontrak mapping status aktivitas dan empty state menggunakan Node test yang sudah tersedia.
- `npx tsc --noEmit` dan target ESLint.
- Impeccable detector untuk halaman dan komponen baru.
- Verifikasi query RLS secara read-only melalui `supabase db query --linked` setelah migration diterapkan.

### Risiko/Pertanyaan Terbuka
- Status aktivitas adalah snapshot saat halaman dimuat atau direfresh, bukan realtime subscription. Realtime Koordinator tetap menjadi pekerjaan notifikasi pasif terpisah.
- Helper `under_review` tidak ditampilkan sebagai Helper terverifikasi aktif, tetapi tetap ditangani oleh antrean laporan sesuai TDD §3.3.4 dan §3.10.

## Sprint 2 Continuation: Job Board Helper Berbasis Data Nyata

### Scope
- TDD §3.1 dan §3.2: daftar tugas `diajukan`, batas penerimaan, dan conditional update saat Helper menerima tugas.
- TDD §3.3.2 dan §3.3.3: status approval Helper probation dan kategori berisiko tinggi.
- TDD §4.5 FR-TSK-01, FR-TSK-02, FR-TSK-03, FR-TSK-07, dan FR-TSK-10.
- TDD §6 tabel `tasks`, `lansia_profiles`, dan `service_categories`, §7 endpoint task, §8 RLS, dan §19 seeder demo.

### Breakdown File
- Modify `src/app/(helper)/helper/tugas/baru/page.tsx` dan `CariPekerjaanClient.tsx` agar hanya memakai task Supabase yang valid, tanpa fallback `MOCK_TASKS` atau gambar random.
- Modify `src/app/(helper)/helper/pekerjaan/[id]/page.tsx` agar detail memakai task nyata dan menerima tugas melalui endpoint conditional update.
- Create `src/app/api/tasks/[id]/accept/route.ts` untuk validasi Helper, radius, approval state, dan race condition `409`.
- Create `src/lib/helper/task-acceptance.ts` beserta test state acceptance.
- Modify `supabase/seed.sql` dengan profil wilayah berkoordinat dan task demo `diajukan` yang seluruh field UI-nya terisi.
- Create migration RLS task/lansia agar Keluarga dapat membuat booking dan Helper dapat membaca serta menerima task yang memang berada dalam scope-nya.

### Perubahan Database
- Tambah policy SELECT/INSERT/UPDATE scoped untuk `tasks`.
- Tambah policy SELECT scoped untuk `lansia_profiles` ketika data terkait task tersedia untuk Helper terverifikasi.
- Tidak menambah kolom baru. Seeder memakai field yang sudah ada di skema.

### Endpoint API
- `PATCH /api/tasks/:id/accept`: menerima task dengan conditional update, mengembalikan `409` jika task sudah diambil atau status berubah.

### Pendekatan Testing
- Test murni untuk pemetaan status acceptance dan kondisi approval.
- Test data seeder secara statis agar task demo memiliki relasi, koordinat, jadwal masa depan, harga, kategori, dan catatan yang lengkap.
- `npx tsc --noEmit`, ESLint terarah, `git diff --check`, dan audit Impeccable pada job board/detail.

### Risiko/Pertanyaan Terbuka
- Halaman `/notifikasi` masih placeholder dan belum membaca tabel `notifications`; booking direct Helper belum memiliki UI notifikasi in-app. Ini perlu dikerjakan sebagai unit notifikasi terpisah setelah job board nyata stabil.
- Data demo yang sudah tersimpan di database remote tidak otomatis berubah hanya karena `seed.sql` diubah. Untuk lokal gunakan `npx supabase db reset`; remote perlu prosedur seed terpisah dengan service role.

## Sprint 2 Bugfix: Konfirmasi Booking Direct oleh Helper

- Booking yang sudah menargetkan `helper_id` sekarang tampil di Dashboard Helper pada bagian `Jadwal Terdekat` dengan label `MENUNGGU KONFIRMASI ANDA`.
- Helper yang dituju dapat membuka detail dan mengonfirmasi task; Helper lain tetap ditolak.
- Conditional update dan policy RLS menerima dua jalur yang valid: task marketplace tanpa `helper_id` atau booking direct yang sudah menunjuk Helper yang sedang login.

## Sprint 2 Continuation: Papan Tugas, Foto Lansia, dan Notifikasi

### Scope
- TDD §3.1-§3.3 dan §4.5: Papan Tugas memakai task database untuk tab tersedia, aktif, dan riwayat.
- TDD §3.11, §4.2, dan §16: foto lansia dibaca dari `lansia_profiles.foto_url` dengan akses sesuai RLS, bukan gambar random.
- TDD §4.9 FR-NOT-01, FR-NOT-03, dan FR-NOT-04: notifikasi task in-app dengan toggle akses di Navbar.

### Breakdown File
- Modify `src/app/(helper)/tugas/page.tsx` dan `src/app/(helper)/tugas/[id]/page.tsx` untuk menghapus `MOCK_TASKS` dan memakai task nyata.
- Reuse `RegionAddress` dan `ImagePreviewModal` untuk alamat administratif dan foto lansia zoom.
- Create `src/app/api/notifications/route.ts`, `src/app/api/notifications/[id]/read/route.ts`, dan client UI notifikasi.
- Modify `src/components/layout/Navbar.tsx` untuk toggle notifikasi dan indikator unread.
- Modify `supabase/seed.sql` agar task marketplace dan booking direct memiliki semua field yang dipakai UI. Foto lansia tetap `NULL` sampai ada foto keluarga yang nyata, sehingga UI menampilkan fallback jujur dan tidak memakai foto palsu.

### Perubahan Database
- Tidak menambah kolom foto karena `lansia_profiles.foto_url` sudah ada pada migration `20260806000000_add_foto_and_koordinator_location.sql`.
- Tambah policy notifikasi update terbatas ke pemilik dan trigger database untuk booking direct agar Helper mendapat notifikasi setelah insert task berhasil.

### Pendekatan Testing
- Test mapping tab/status task dan parser alamat.
- Test seeder tidak menggunakan ID mock `T1-1234` atau URL avatar random. Seeder harus menyertakan satu task marketplace dan satu booking direct untuk menguji tab Tersedia, Aktif, dan notifikasi.
- Typecheck, lint terarah, Impeccable, dan verifikasi state empty/loading/error.

## Sprint 2 Bugfix: Antrean Approval Task Koordinator

### Scope
- TDD §3.3.2, §4.5, FR-TSK-10: task yang berstatus `menunggu_persetujuan_koordinator` harus terlihat oleh Koordinator yang menaungi Helper terkait.
- TDD §7 dan §8: approval memakai endpoint khusus, conditional update, dan RLS scoped berdasarkan `helper_profiles.koordinator_id`.

### Breakdown File
- Replace `src/app/(koordinator)/koordinator/antrean-persetujuan/page.tsx` agar membaca task nyata dari Supabase dan memiliki loading, error, empty, serta success state.
- Create `src/app/api/tasks/[id]/koordinator-approve/route.ts` untuk transisi atomik ke `dikonfirmasi`.
- Create `supabase/migrations/20260821160000_fix_koordinator_task_queue_rls.sql` dengan policy SELECT relasi lansia dan UPDATE scoped. Migration dibuat terpisah karena migration visibility sebelumnya sudah dapat tercatat di remote.

### Testing
- Tambah regresi `tests/koordinator-task-approval.test.mjs` untuk memastikan antrean tidak memakai mock dan endpoint approval memakai conditional update.

## Progress Audit 22 Agustus 2026

### Sudah berjalan

- Papan tugas Helper, booking direct, conditional accept, check-in, approval Koordinator, direktori Helper, notifikasi in-app, extra service, dan detail task sudah memakai data database.
- Laporan Helper sekarang mengunggah foto bukti, menyimpan lima skor Health Snapshot, Memory Capsule, catatan kondisi, dan `client_submission_id` melalui fungsi database atomic.
- Daftar kunjungan Keluarga tidak lagi memakai `MOCK_TASKS`.
- Keluarga dapat melihat foto bukti dan hasil Health Snapshot pada detail kunjungan.
- Cancel dan reschedule sudah memiliki validasi server, alasan wajib, batas dua kali, serta aturan lead time tiga jam atau dua jam.
- Demo migration mengarahkan Koordinator ke `mbahburgas` dan Helper ke `masburgas` di Semarang Selatan bila akun demo tersedia.
- CI sekarang menjalankan lint, typecheck, test, dan build. Migration production menggunakan dry-run lalu protected environment manual approval.

### Masih tertunda

- Demo Ledger pembayaran, release 90/7/3, kompensasi cancel, dan auto-release tetap Sprint 3 sesuai TDD. Endpoint konfirmasi completion disiapkan sebagai kontrak, tetapi tidak boleh mengklaim dana cair sebelum payment provider tersedia.
- Scheduled expiry task dan reminder H-1 belum memiliki job production. Validasi penerimaan tetap menolak task yang sudah lewat `expires_at`.
- Offline draft IndexedDB, halaman Riwayat Rangkul penuh, grafik tren, rating, dan laporan formal tetap di luar golden path Sprint 2.
