# Sprint 3 - Dynamic Pricing & Fix Lansia Profile

## Scope
- Implementasikan harga dinamis di halaman Cari Helper berdasarkan tabel `service_categories`.
- Perbaiki alur Tambah & Edit Profil Lansia (sinkronisasi tipe data, dan pre-fill formulir yang sebelumnya tidak terbaca sempurna).

## Rencana Implementasi

### 1. `CariHelperPage` (Cari Helper)
- **Hapus Filter Hardcode:** Kategori layanan akan diambil secara dinamis dari tabel `service_categories`.
- **Harga Dinamis:** Menghitung dan menampilkan harga (serta durasi) pada tiap kartu Helper sesuai dengan filter yang dipilih:
  - Jika filter "Semua", tampilkan harga mulai dari kategori termurah yang dimiliki Helper.
  - Jika filter spesifik (contoh: "Antar Obat"), tampilkan harga persis dari layanan tersebut.
- **Query Join:** Memperbarui fetch helpers untuk meng-include `helper_service_categories(service_category_id, service_categories(nama, harga_dasar, estimasi_durasi_menit))`.

### 2. `TambahLansiaPage` & `Lansia API`
- **Tambah Field Baru:** Tambahkan input untuk `umur`, `tingkat_mobilitas`, dan `kebutuhan_khusus` ke form `TambahLansiaPage` agar sinkron dengan tabel DB.
- **Fix Payload API:** Update `src/app/api/lansia/profile/route.ts` yang selama ini mencoba memasukkan `provinsi`, `kecamatan`, dll. ke kolom database yang tidak ada. Akan diubah menjadi satu format string ke kolom `alamat` (sesuai skema DB).
- **Zod Schema:** Tambahkan validasi untuk `umur`, `tingkat_mobilitas`, `kebutuhan_khusus` di `src/lib/validations/lansia.ts`.

### 3. `LansiaEditProfilPage`
- **Regex Alamat Lebih Kuat:** Alamat dari *seed data* atau yang formatnya sedikit berbeda akan diparsing dengan regex fallback yang lebih tahan banting, sehingga setidaknya nama jalan tetap masuk, dan state form tidak kosong melompong.
