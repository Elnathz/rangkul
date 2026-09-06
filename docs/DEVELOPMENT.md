# Panduan Pengembangan Rangkul

Dokumen ini menjelaskan cara menyiapkan, menjalankan, memeriksa, dan merawat Rangkul tanpa menyimpan secret di repository. Aturan bisnis tetap mengikuti `docs/TDD_Rangkul.md`.

## 1. Prasyarat

| Kebutuhan | Versi atau kondisi |
| --- | --- |
| Node.js | `22.6.0` atau lebih baru |
| npm | Versi yang kompatibel dengan Node.js 22 |
| Git | Versi aktif yang mendukung worktree dan branch workflow |
| Docker Desktop | Wajib bila menjalankan Supabase lokal |
| Supabase CLI | Tersedia sebagai dev dependency `2.111.0` |

Periksa versi:

```bash
node --version
npm --version
npx supabase --version
git --version
```

## 2. Instalasi dependency

```bash
git clone https://github.com/Elnathz/rangkul.git
cd rangkul
npm ci
```

Gunakan `npm ci` untuk setup dan quality gate. Perintah ini menghormati `package-lock.json` dan sama dengan CI. Gunakan `npm install` hanya ketika memang mengubah dependency.

## 3. Environment lokal

Salin `.env.example` ke `.env.local`, lalu isi nilai yang dibutuhkan:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-dari-supabase-start>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-dari-supabase-start>
MIDTRANS_SERVER_KEY=<server-key-sandbox-jika-digunakan>
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=<client-key-sandbox-jika-digunakan>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
FLEXIBLE_ASSIGNMENT_ENABLED=false
```

Untuk Supabase Cloud, gunakan URL dan key project demo yang benar. Jangan menyalin service role key ke variable dengan prefix `NEXT_PUBLIC_`.

### Fungsi setiap variable

| Variable | Digunakan oleh | Catatan keamanan |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser, server, seed asset | Boleh terlihat browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser dan server | Tetap bergantung pada RLS |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Alternatif anon key | Isi hanya bila project memakai format key baru |
| `SUPABASE_SERVICE_ROLE_KEY` | Route server tertentu, seed asset, scheduled job | Secret, tidak boleh masuk browser atau git |
| `SUPABASE_DEMO_PROJECT_REF` | Guard `npm run seed:cloud` | Harus sama dengan linked ref dan host Supabase URL |
| `MIDTRANS_SERVER_KEY` | Backend pembayaran | Gunakan sandbox pada demo |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Client pembayaran | Gunakan sandbox pada demo |
| `NEXT_PUBLIC_SITE_URL` | Redirect dan origin | `http://localhost:3000` untuk lokal |
| `FLEXIBLE_ASSIGNMENT_ENABLED` | Server-side feature flag | Default aman `false` |

## 4. Menjalankan Supabase lokal

Mulai container:

```bash
npx supabase start
```

Output menampilkan URL API, anon key, service role key, Studio URL, dan database URL. Masukkan key lokal ke `.env.local`.

Bangun ulang database lokal dari semua migrasi dan seed:

```bash
npx supabase db reset
```

Perhatian: `db reset` menghapus data database lokal. Jangan gunakan perintah reset terhadap project remote.

Supabase Studio lokal biasanya tersedia di `http://127.0.0.1:54323`.

## 5. Menjalankan aplikasi

```bash
npm run dev
```

Dev server menggunakan Next.js dengan Webpack untuk menghindari crash Turbopack yang pernah muncul pada project ini. Buka `http://localhost:3000`.

Build dan server produksi lokal:

```bash
npm run build
npm run start
```

## 6. Data demo

### Seed lokal tanpa reset

```bash
npm run seed
```

Perintah ini menjalankan `supabase/seed.sql` ke target `--local`. Perintah ini tidak menjalankan migrasi dan tidak mengunggah asset privat.

Untuk mengunggah empat asset demo ke bucket privat lokal setelah environment lokal terisi:

```bash
node scripts/seed-assets.mjs
```

Asset yang disinkronkan:

- `identitas-lansia-demo.png`
- `hubungan-keluarga-demo.pdf`
- `dokumen-koordinator-demo.pdf`
- `bukti-kunjungan-demo.jpg`

### Seed cloud demo

```bash
npx supabase link --project-ref <project-ref-demo>
npm run seed:cloud
```

Script menolak seed bila tiga nilai berikut tidak sama:

1. isi `SUPABASE_DEMO_PROJECT_REF`;
2. linked ref di `supabase/.temp/project-ref`;
3. subdomain project dari `NEXT_PUBLIC_SUPABASE_URL`.

Setelah SQL berhasil, script menjalankan `scripts/seed-assets.mjs`. Script asset memeriksa bahwa bucket `dokumen` ada dan bersifat privat sebelum upload.

Jangan menjalankan seed ke database produksi yang berisi data nyata. Seeder memperbarui status, saldo, task marker, laporan, banding, dan fixture pembayaran demo.

### Verifikasi akun

Gunakan [Panduan Demo](demo/README.md) sebagai sumber daftar username, wilayah, status, dan skenario. Password semua persona hasil seed adalah `Rangkul2026*`.

## 7. Migrasi database

Migrasi disimpan berurutan di `supabase/migrations/`.

Membuat diff dari perubahan database lokal:

```bash
npx supabase db diff
```

Memeriksa daftar migrasi linked project:

```bash
npx supabase migration list --linked
```

Memeriksa perubahan yang akan diterapkan:

```bash
npx supabase db push --dry-run --include-all
```

Penerapan production dikelola lewat workflow `migrate.yml` yang hanya dapat dipicu manual. Job pertama melakukan dry-run. Job kedua berjalan pada environment `production-migrations` dan menerapkan migrasi setelah gate environment terpenuhi.

Perubahan skema wajib disertai regenerasi atau penyesuaian `src/types/database.ts`, test kontrak, dan rujukan TDD.

## 8. Quality gate

Jalankan setelah perubahan terakhir:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Arti script:

| Script | Pemeriksaan |
| --- | --- |
| `npm run lint` | ESLint seluruh source |
| `npm run typecheck` | TypeScript tanpa emit |
| `npm run test` | Node test runner untuk `tests/*.test.mjs` |
| `npm run build` | Build Next.js production dan validasi route |

Test runtime Supabase memakai environment integrasi dan dapat skip jika tidak diaktifkan. Jangan mengubah skip menjadi klaim pass. Jalankan konfigurasi runtime sesuai petunjuk pada file test dan audit sprint ketika database test tersedia.

### 8.1 Security audit matrix

| Area | Boundary yang diterapkan | Bukti yang dijalankan |
| --- | --- | --- |
| SQL injection | Query builder atau RPC berparameter. Request tidak disisipkan ke SQL atau filter PostgREST tanpa sanitasi wildcard. | `tests/security-hardening-contract.test.mjs`, full test suite |
| XSS | React escaping tetap dipakai dan source tidak memakai `dangerouslySetInnerHTML` atau assignment `.innerHTML`. Copy dari user dirender sebagai text. | `tests/security-hardening-contract.test.mjs` |
| Input validation | Zod di route, allowlist role dan `docType`, constraint database, lalu RLS. Error memakai `422` dan `fieldErrors` jika relevan. | Contract tests per domain dan full test suite |
| Session dan CSRF | Identity berasal dari `auth.getUser()`. Proxy menolak mutation protected dengan `Origin` atau `Referer` cross-site memakai `403 csrf_origin_mismatch`. Auth dan payment webhook tetap public secara eksplisit. | `src/lib/security/request-origin.ts`, `src/proxy.ts`, security contract |
| RBAC | Route mapping, actor check server, ownership, coordinator region, serta RLS. Route group frontend bukan satu-satunya pagar. | `tests/role-route-authorization.test.mjs`, RLS tests, security contract |
| Account deletion | Database dianonimkan lewat RPC audited, histori transaksi tetap ada, private object prefix dihapus, Auth ditutup dengan soft delete. Self-delete wajib mengetik `HAPUS AKUN`. | `20260906120000_account_anonymization.sql`, API contract tests |
| Avatar upload | Hanya format image allowlist, size dan magic byte valid, role sesuai `docType`, object path diawali user ID, bucket tetap private, signed URL berumur pendek. | storage tests dan security contract |

Audit source ini bukan penetration test eksternal. Sebelum production, lakukan DAST atau review keamanan independen dengan credential non-produksi dan environment terisolasi.

## 9. Pemeriksaan UI nyata

Semua halaman yang berubah harus diperiksa pada:

- 375px;
- 768px;
- 1024px;
- 1440px;
- zoom 200% untuk surface penting;
- keyboard-only untuk navigasi, form, dialog, tab, dan dropdown.

Periksa minimal:

- tidak ada horizontal overflow;
- target sentuh minimal 44x44px;
- fokus keyboard terlihat;
- aksi penting tidak hanya muncul saat hover;
- loading, empty, error, forbidden, conflict, retry, dan success dapat dibedakan;
- data sensitif tidak muncul pada role yang salah;
- mutation mencegah klik ganda dan menampilkan pending state.

## 10. Memperbarui screenshot README

Simpan screenshot stabil di `docs/screenshots/` dengan nama yang menjelaskan halaman, role, dan viewport:

```text
docs/screenshots/
├── landing-desktop-1440.png
├── landing-mobile-375.png
├── keluarga-dashboard-1440.png
├── helper-dashboard-1440.png
├── koordinator-dashboard-1440.png
└── admin-dashboard-1440.png
```

Sebelum mengambil screenshot:

1. gunakan hasil seed yang diketahui;
2. login dengan persona pada `docs/demo/README.md`;
3. tutup DevTools, banner debugging, notifikasi OS, dan extension overlay;
4. pastikan viewport dan zoom sesuai nama file;
5. jangan tampilkan secret, access token, URL signed document, atau data pengguna nyata;
6. lakukan hard refresh dan tunggu loading selesai;
7. cek kembali file secara visual sebelum ditautkan dari README.

Screenshot yang hanya ada di clipboard atau folder temp tidak stabil dan tidak boleh dijadikan link README.

## 11. CI dan automation

| Workflow | Pemicu | Secret utama |
| --- | --- | --- |
| `ci.yml` | Push dan PR ke `main` atau `develop` | Tidak ada secret aplikasi |
| `deploy.yml` | Push ke `main` | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |
| `heartbeat.yml` | Cron dan manual | `SUPABASE_PROJECT_ID`, `SUPABASE_SERVICE_ROLE_KEY` |
| `scheduled-jobs.yml` | Setiap 5 menit dan manual | `SUPABASE_PROJECT_ID`, `SUPABASE_SERVICE_ROLE_KEY` |
| `migrate.yml` | Manual | `SUPABASE_PROJECT_ID`, `SUPABASE_DB_PASSWORD`, `SUPABASE_ACCESS_TOKEN` |

Scheduled jobs memanggil RPC berikut:

- `expire_pending_tasks`
- `expire_unpaid_confirmed_tasks`
- `auto_release_held_payments`

Semua RPC maintenance harus aman dipanggil berulang karena cron dapat terlambat atau berjalan kembali.

## 12. Troubleshooting

### Dev server crash pada Turbopack

Project memakai `next dev --webpack`. Jalankan `npm run dev`, bukan `next dev` langsung. Jika proses lama masih menahan port atau file build, hentikan proses dev yang memang milik project ini, lalu jalankan kembali.

### Supabase lokal tidak dapat dijangkau

```bash
npx supabase status
```

Pastikan Docker aktif dan `.env.local` mengarah ke URL serta key dari instance lokal yang sama.

### Login akun demo gagal

- pastikan seed selesai tanpa error;
- gunakan username atau email persis dari Panduan Demo;
- pastikan password `Rangkul2026*`;
- pastikan aplikasi dan seed mengarah ke project Supabase yang sama;
- periksa status akun khusus seperti restricted atau under review.

### Mode Pelamar dan Cari Cepat tidak muncul

Periksa `FLEXIBLE_ASSIGNMENT_ENABLED`. Nilai selain string `true` harus dianggap nonaktif. Restart dev server setelah mengubah variable server.

### Dokumen demo tidak dapat dipreview

Pastikan migration storage sudah berjalan, bucket `dokumen` tetap privat, dan `scripts/seed-assets.mjs` selesai. UI harus meminta signed URL dari server, bukan membentuk public URL sendiri.

### Data terasa tidak realtime

Periksa publication Realtime, policy RLS, subscription hook, dan filter channel. Realtime tidak menggantikan refetch setelah mutation ambigu.
