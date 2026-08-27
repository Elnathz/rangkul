# Panel Admin Rangkul: CRUD dan Dashboard Data Nyata

## Tujuan

Mengubah halaman `/admin/dashboard`, `/admin/users`, `/admin/helpers`, dan `/admin/categories` dari tampilan demo menjadi panel operasional yang membaca dan mengubah data Supabase nyata melalui API Admin yang terproteksi.

## Batasan yang Dipertahankan

- Nama route Admin yang sudah ada tidak berubah.
- Field dan status mengikuti `docs/TDD_Rangkul.md`, khususnya §4.12, §6, §7, dan §9.
- Admin tidak dibuat melalui UI publik.
- Penghapusan akun memakai Supabase Auth Admin API dari server, bukan menghapus baris `public.users` secara langsung.
- Kategori dinonaktifkan melalui soft delete `is_active = false` agar relasi task lama tetap aman.
- Aksi sensitif dicatat di `audit_logs`.
- Semua UI dimulai dari viewport mobile dan diuji pada 375px, 768px, 1024px, dan 1440px.

## Pengguna dan Perilaku

### Dashboard

Dashboard mengambil statistik saat render dari endpoint `/api/admin/stats`:

- jumlah seluruh pengguna
- jumlah pengguna aktif
- jumlah Helper berdasarkan status verifikasi
- jumlah task berdasarkan status utama
- jumlah laporan yang masih menunggu tindakan
- GMV dari task atau payment yang tersedia di schema
- lima audit log terbaru

Tidak ada angka, status server, kapasitas, atau aktivitas palsu. Jika sebagian sumber gagal, panel menampilkan error kontekstual dan tombol coba lagi.

### Pengguna

Halaman `/admin/users` memakai endpoint `/api/admin/users` dan memiliki tabs:

- Semua
- Keluarga
- Helper
- Koordinator
- Admin

Tab mengubah filter role pada data yang sama, bukan memuat array dummy terpisah. Setiap tab menampilkan jumlah hasil yang berasal dari database. Pencarian berdasarkan nama, email, username, atau ID dilakukan melalui query server dengan pagination.

Admin dapat:

- melihat detail akun dan profil peran jika tersedia
- mengubah `account_status` menjadi `active`, `restricted`, atau `suspended` melalui endpoint khusus
- menghapus akun melalui server-side Auth Admin API setelah konfirmasi eksplisit

Role dan email tidak diedit dari tabel pengguna karena perubahan tersebut menyentuh identitas Auth dan harus memiliki alur terpisah.

### Helper

Halaman `/admin/helpers` memakai data gabungan `helper_profiles` dan `users`. Admin dapat:

- memfilter status `pending_verification`, `verified`, `under_review`, `rejected`, dan `suspended`
- melihat wilayah, trust tier, rating, jumlah tugas selesai, dan alasan suspend
- menangguhkan Helper dengan alasan melalui endpoint `/api/admin/helpers/:id/suspend`
- menetapkan verifikasi fallback melalui endpoint `/api/admin/helpers/:id/assign-fallback`

Detail dokumen tetap mengikuti aturan akses server. URL dokumen sensitif tidak ditulis ke console browser.

### Kategori

Halaman `/admin/categories` memakai endpoint `/api/admin/service-categories`. Admin dapat membuat, mengedit, menonaktifkan, dan mengaktifkan kategori dengan field:

- `nama`
- `deskripsi`
- `estimasi_durasi_menit`
- `harga_dasar`
- `is_high_risk`
- `is_active`
- `tingkat`
- `parent_id`
- `jarak_min_km`
- `jarak_max_km`

Validasi Zod dipakai di browser dan server. API tidak membuang field yang sudah didefinisikan schema.

## API dan Keamanan

Semua route Admin:

1. Memverifikasi session Supabase.
2. Memastikan role `admin` dari `public.users` dengan fallback profile-by-email yang sudah dipakai middleware.
3. Mengembalikan response error `{ error, message, fieldErrors? }`.
4. Menggunakan status HTTP 401, 403, 404, 409, dan 422 sesuai kondisi.
5. Menulis audit log setelah mutation berhasil.

Operasi yang mengubah role, status akun, suspend Helper, fallback verification, penghapusan akun, dan kategori harus aman dari duplicate click melalui state pending di UI.

## Arah Visual

Design read: existing Rangkul Admin operations dashboard for internal operators, with a trust-first and data-dense language, using restrained Rangkul blue, Tailwind/shadcn, and subtle motion.

- `DESIGN_VARIANCE: 5`
- `MOTION_INTENSITY: 3`
- `VISUAL_DENSITY: 8`
- Surface utama tetap solid agar tabel terbaca.
- Glassmorphism hanya digunakan pada rail tabs, filter toolbar, dan panel ringkasan ringan dengan blur rendah, border transparan, fallback solid, serta kontras WCAG AA.
- Tabel desktop berubah menjadi kartu ringkas atau kolom prioritas pada mobile. Tidak ada tabel yang dipaksa mengecil tanpa strategi.
- Ikon memakai Lucide karena sudah menjadi dependency dan vocabulary incumbent project.
- Motion hanya untuk state transition, feedback mutation, dan reveal ringan. `prefers-reduced-motion` dihormati.
- Semua kontrol interaktif minimal 44x44px dan punya focus state yang terlihat.

## States

Setiap halaman dan mutation memiliki:

- skeleton loading yang menyerupai layout akhir
- empty state yang menjelaskan cara mengisi data
- error state dengan retry
- forbidden state untuk session tanpa akses Admin
- pending state pada tombol mutation
- success feedback setelah refetch data
- konfirmasi sebelum destructive action

## Testing

- Static contract tests untuk endpoint Admin dan tab role.
- Unit atau route contract tests untuk validasi payload dan status response.
- Test bahwa endpoint penghapusan memakai Auth Admin API dan tidak melakukan delete langsung ke `public.users`.
- Test bahwa suspend dan fallback menulis `audit_logs`.
- Test bahwa kategori menyimpan field tingkat, parent, dan radius.
- Quality gate penuh: lint, typecheck, test, dan build.
- Review visual mobile dan desktop pada breakpoint yang ditentukan.
