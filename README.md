# Rangkul: Platform Pendampingan Lansia Berbasis Komunitas

Rangkul adalah platform pendampingan lansia (aging in place) berbasis komunitas yang menghubungkan lansia dengan Helper lokal terverifikasi oleh Koordinator RT/RW setempat. Rangkul memberikan ketenangan pikiran bagi keluarga perantau melalui pemantauan kondisi harian (Health Snapshot) dan riwayat kebersamaan lansia (Memory Capsule).

Proyek ini dibangun untuk kompetisi ITechno Cup 2026 dengan memprioritaskan keamanan data berlapis, arsitektur backend yang tangguh, serta model kepercayaan hiperlokal.

---

## 1. Visi dan Model Bisnis Inti (TDD §3)

### 1.1 Verifikasi Hiperlokal (Model SIM)
- Helper diverifikasi langsung oleh Koordinator di RT/RW domisili aslinya (satu kali verifikasi awal).
- Memiliki fallback bertingkat: Koordinator RT -> Koordinator RW -> Admin Platform (`verified_by_admin_fallback`).
- Mencegah Helper menerima transaksi jika belum terverifikasi secara sah di wilayahnya.

### 1.2 State Machine Kunjungan dan Layanan
- Kunjungan memiliki status transisi yang ketat: `diajukan` -> `menunggu_persetujuan_koordinator` -> `dikonfirmasi` -> `dikerjakan` -> `menunggu_persetujuan_keluarga` -> `selesai` / `dibatalkan`.
- Memanfaatkan conditional update di tingkat database untuk mencegah race condition saat penerimaan tugas secara bersamaan oleh beberapa Helper.

### 1.3 Escrow Pembayaran dan Bagi Hasil
- Menggunakan penahanan dana (escrow) terintegrasi Midtrans.
- Skema bagi hasil saat tugas selesai: 90% Helper, 7% Platform, 3% Koordinator RT/RW (koordinator yang memverifikasi Helper).
- Dukungan untuk "Layanan Tambahan" yang disetujui di tengah kunjungan yang akan menyesuaikan harga akhir pembayaran.

### 1.4 Transparansi dan Riwayat Rangkul
- Health Snapshot: Pemantauan 5 indikator harian lansia (Energi, Mobilitas, Mood, Nafsu Makan, Kualitas Tidur) disertai cerita kunjungan dan foto bukti.
- Sistem laporan dan proteksi otomatis (under review jika mengumpulkan 2 laporan).

---

## 2. Teknologi dan Arsitektur

- **Framework**: Next.js 16 (App Router, React 19, TypeScript 5)
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Auth Admin, Storage Bucket)
- **Validasi Input**: Zod v4 (Validasi 4 lapis: Client -> Form -> Server API -> Database Constraint)
- **Styling & UI**: TailwindCSS, Shadcn UI, Lucide Icons
- **Keamanan**: Row Level Security (RLS) pada seluruh tabel data pribadi, Signed URL untuk dokumen sensitif (KTP/Identitas).

---

## 3. Struktur Direktori Utama

```text
.
├── docs/
│   ├── TDD_Rangkul.md           # Sumber kebenaran teknis dan aturan bisnis (Wajib dibaca)
│   ├── GUIDEBOOK_ITechno.md     # Ketentuan lomba ITechno Cup 2026
│   └── planning/                # Perencanaan per sprint
├── src/
│   ├── app/
│   │   ├── api/                 # Next.js App Router API Handlers
│   │   │   ├── admin/           # Endpoint Admin (Seed, Queue, Approve Koordinator)
│   │   │   ├── auth/            # Auth API (Register, Login)
│   │   │   ├── helper/          # Helper API (Apply, Profile, Queue, Approve/Reject)
│   │   │   ├── helpers/         # Katalog Helper publik (Safe-privacy & Search)
│   │   │   ├── koordinator/     # Koordinator API (Apply, Profile)
│   │   │   ├── lansia/          # CRUD Lansia (Soft delete)
│   │   │   ├── storage/         # Upload dokumen private
│   │   │   └── users/           # Profile Management (GET & PUT /api/users/me)
│   │   └── (publik)/            # Halaman Publik & Landing Page
│   ├── lib/
│   │   ├── api-response.ts      # Standarisasi respons dan error API
│   │   ├── audit.ts             # Utility pencatatan Audit Logs
│   │   ├── supabase/            # Client Supabase (Server, Client, Middleware)
│   │   └── validations/         # Zod Schemas (Auth, Helper, Lansia, Storage, Koordinator)
│   ├── middleware.ts            # Next.js Route Protection & Role Guard
│   └── types/
│       └── database.ts          # Supabase Database Types
└── supabase/
    ├── config.toml              # Konfigurasi Supabase CLI
    └── migrations/              # Berkas migrasi database SQL terurut
```

---

## 4. Skema Database Inti (TDD §6)

- `users`: Data akun utama termasuk peran otorisasi (`role`) dan alamat spesifik (kelurahan, rt, rw, kabupaten_kota, provinsi).
- `lansia_profiles`: Data privat profil lansia yang didampingi (mendukung soft delete via `deleted_at`).
- `helper_profiles`: Entitas Helper mencakup `bio`, `wilayah_domisili`, batas radius layanan, dan `koordinator_id` penanggung jawab.
- `helper_service_categories`: Tabel relasi m-to-m antara Helper dengan layanan yang ditawarkannya.
- `koordinator_profiles`: Data penanggung jawab teritorial RT/RW beserta `saldo_komisi`.
- `service_categories`: Katalog layanan dasar sistem lengkap dengan `harga_dasar` dan tanda risiko (`is_high_risk`).
- `tasks`: State machine entitas transaksi pendampingan. Menyimpan transisi status, koordinat check-in, dan harga akhir.
- `payments`: Pencatatan transaksi escrow Midtrans dan simulasi saldo demo.
- `audit_logs`: Pencatatan immutable untuk seluruh tindakan sensitif administratif seperti persetujuan dan penolakan akun.

Seluruh tabel dengan data personal dilindungi secara ketat oleh Row Level Security (RLS) Supabase untuk menjamin privasi (TDD §8).

---

## 5. Kontrak API Backend (TDD §7)

Seluruh route handler berada di `src/app/api/**` dan mewajibkan otorisasi yang divalidasi oleh `middleware.ts`.

### Autentikasi dan Profil Pengguna
- `POST /api/auth/register` : Registrasi akun baru (Keluarga, Helper, Koordinator).
- `POST /api/auth/login` : Autentikasi pengguna dan inisialisasi sesi.
- `GET /api/users/me` : Mengambil data sesi pengguna yang sedang login.
- `PUT /api/users/me` : Memperbarui detail profil pengguna.

### Storage dan Dokumen Private
- `POST /api/storage/upload` : Upload KTP/Surat Pengantar ke bucket private dan menghasilkan Signed URL sementara.

### Manajemen Lansia (Role Keluarga)
- `GET /api/lansia` : Mengambil daftar lansia dalam pengelolaan satu akun Keluarga.
- `POST /api/lansia` : Registrasi profil lansia baru.
- `GET /api/lansia/[id]` : Detail spesifik satu profil lansia.
- `PUT /api/lansia/[id]` : Pembaruan profil lansia.
- `DELETE /api/lansia/[id]` : Menonaktifkan profil (Soft-delete).

### Pendaftaran dan Verifikasi Helper
- `POST /api/helper/apply` : Pendaftaran Helper beserta lampiran spesialisasi kategori layanannya.
- `GET /api/helper/profile` : Mengecek status tahapan verifikasi Helper.
- `GET /api/helper/queue` : (Role Koordinator) Mengambil antrean Helper di wilayah kewenangannya.
- `PUT /api/helper/[id]/approve` : (Role Koordinator/Admin) Mengesahkan Helper dengan pencatatan audit.
- `PUT /api/helper/[id]/reject` : Menolak pendaftaran Helper dengan alasan yang direkam pada audit.

### Pendaftaran dan Verifikasi Koordinator
- `POST /api/koordinator/apply` : Pendaftaran inisiator Koordinator wilayah.
- `GET /api/koordinator/profile` : Mengecek status verifikasi Koordinator dan saldo komisi.
- `GET /api/admin/koordinator/queue` : (Role Admin) Menampilkan daftar Koordinator yang butuh pengesahan.
- `PUT /api/admin/koordinator/[id]/approve` : Mengesahkan Koordinator.
- `PUT /api/admin/koordinator/[id]/reject` : Menolak Koordinator.

### Katalog Helper Publik (Privasi Terjaga)
- `GET /api/helpers` : Pencarian Helper berstatus aktif. Mendukung query parametrik (`q` atau `search`) untuk mencari berdasar nama, spesialisasi layanan, maupun bio. Parameter geografis dan kategori (`category_id`) juga didukung.
- `GET /api/helpers/[id]` : Detail publik Helper tanpa mengekspos koordinat presisi atau dokumen KTP.

---

## 6. Panduan Pengembangan Lokal

### Kebutuhan Sistem
- Node.js >= 20.x
- npm >= 10.x
- Supabase CLI

### Menyiapkan Lingkungan Lokal
1. Kloning repository dan install dependensi:
   ```bash
   git clone https://github.com/Elnathz/rangkul.git
   cd rangkul
   npm install
   ```

2. Konfigurasi kredensial lokal pada `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. Jalankan Supabase lokal dan terapkan migrasi:
   ```bash
   npx supabase start
   npx supabase db reset
   ```

4. Jalankan Next.js development server:
   ```bash
   npm run dev
   ```

---

## 7. Aturan Commit dan Kontribusi Kode (Sesuai AGENTS.md)

1. Tidak diperkenankan menulis kode tanpa membuat file perencanaan di `docs/planning/`.
2. Seluruh histori commit wajib merujuk ke bab yang relevan pada TDD.
3. Gunakan standar Conventional Commits tanpa emoji atau bahasa "AI slop".
4. Satu commit mewakili satu perubahan logis.

### Format Standar Commit
```text
<type>(<scope>): <subject huruf kecil imperatif>

<body opsional, menjelaskan KENAPA perubahan dibuat>

Refs: TDD §<nomor_bab_terkait>
```

### Taksonomi Scope yang Diizinkan
- `auth` : autentikasi dan akun.
- `lansia` : profil lansia.
- `helper` : profil, trust tier, antrean Helper.
- `koordinator` : verifikasi wilayah dan model approval.
- `tasks` : state machine dan booking.
- `payment` : escrow dan kompensasi.
- `riwayat-rangkul` : health snapshot dan memory capsule.
- `laporan` : sistem peringatan dan suspend.
- `rls` : perbaikan kebijakan Supabase.

Contoh Commit:
```text
feat(helper): tambah conditional update untuk penerimaan tugas

Mencegah dua Helper menerima tugas yang sama secara bersamaan.

Refs: TDD §3.2, FR-TSK-02
```
