# TDD Changes Tracker

Dokumen ini mencatat semua perubahan implementasi yang menyimpang atau memperluas aturan di `TDD_Rangkul.md`. Setiap entri harus mencantumkan nomor bagian TDD yang terpengaruh, tanggal perubahan, alasan, dan keputusan implementasi yang diambil.

---

## [2026-09-06] Dual-Authority Approval untuk Helper Fallback Admin

**Bagian TDD yang terpengaruh:** §3.3.2 (Model Approval Koordinator), §3.2 (State Machine Tugas)

**Konteks masalah:**

TDD §3.3.2 mendefinisikan bahwa tugas yang memerlukan persetujuan koordinator (`menunggu_persetujuan_koordinator`) disetujui oleh Koordinator yang `koordinator_id`-nya cocok dengan `helper_profiles.koordinator_id`. Namun, TDD tidak mendefinisikan penanganan khusus untuk Helper yang diverifikasi melalui jalur Admin Fallback (`verified_by_admin_fallback = true`, `koordinator_id = null`).

Situasi ini menyebabkan deadlock: Helper fallback menerima tugas, status berubah ke `menunggu_persetujuan_koordinator`, namun tidak ada Koordinator yang dapat menyetujuinya (karena `koordinator_id` null), dan tidak ada mekanisme Admin Approval di TDD asli.

**Keputusan yang diambil (dikonfirmasi user, 2026-09-06):**

> "bisa approve oleh koordinator wilayah/admin kalo gaada koordinator yang terpasang dengan dia"

Implementasi memperluas aturan persetujuan menjadi dual-authority:

1. **Koordinator asal Helper** - tetap berlaku jika `helper_profiles.koordinator_id === koordinator.id`.
2. **Koordinator wilayah tugas** - berlaku jika helper adalah fallback (`!koordinator_id || verified_by_admin_fallback = true`) DAN wilayah domisili Koordinator (user `kelurahan` atau `kecamatan`) cocok dengan `lansia_profiles.kelurahan` atau `lansia_profiles.kecamatan`.
3. **Platform Admin** - dapat menyetujui tugas apapun yang dalam status `menunggu_persetujuan_koordinator`.

**File yang diubah:**

- `src/app/api/tasks/[id]/koordinator-approve/route.ts` - logika dual-authority PATCH
- `src/app/api/koordinator/task-approvals/route.ts` - scoping antrean GET untuk koordinator wilayah

**Catatan penting:**

- Validasi conditional update (`eq("status", "menunggu_persetujuan_koordinator")`) tetap dipertahankan untuk mencegah race condition (sesuai TDD §3.2).
- Validasi `expires_at` tetap dijalankan untuk semua jalur approval.
- Koordinator wilayah yang menyetujui task fallback menggunakan field `kelurahan`/`kecamatan` dari tabel `users`, bukan dari `koordinator_profiles.wilayah` (karena struktur wilayah di `wilayah` bersifat JSON dan tidak selalu terisi detail administratif).

---

## [2026-09-06] Privacy-Safe Marketplace Presentation untuk Helper

**Bagian TDD yang terpengaruh:** §4.2 (Profil Lansia), §3.1 (State Machine - status `diajukan`)

**Konteks masalah:**

Kartu tugas dan modal di `/helper/tugas/baru` sebelumnya menampilkan informasi seperti "Jalan Utama / Patokan: Wilayah tersedia" yang tidak informatif dan berpotensi membingungkan. Selain itu, tidak ada penampilan nama panggilan yang ramah untuk lansia di marketplace publik.

**Keputusan yang diambil:**

- Untuk tugas yang belum diterima (`helper_id !== currentHelperId`), `projectHelperTaskPrivacy()` mengembalikan `lansia_nama = "Penerima layanan"` dan `lansia_alamat = publicRegion(lansia)` (tanpa koordinat, tanpa alamat lengkap).
- Fungsi `publicRegion()` diperbarui: jika `kelurahan`/`kecamatan`/`kabupaten_kota` null, ekstrak segmen region dari field `alamat` dengan memfilter komponen jalan (`JL`, `RT`, `RW`).
- Field `lansia_panggilan` ditambahkan ke `JobData` dan diturunkan dari nama pertama lansia dengan prefix `"Mbah"` jika belum memiliki sapaan formal (`Ibu`, `Pak`, `Bu`, `Mbah`).

**File yang diubah:**

- `src/lib/helper/task-privacy.ts` - fungsi `publicRegion()`
- `src/app/(helper)/helper/tugas/baru/page.tsx` - derivasi `lansia_panggilan`
- `src/app/(helper)/helper/tugas/baru/CariPekerjaanClient.tsx` - tampilan kartu dan modal

---

*Tracker ini harus diperbarui setiap kali implementasi menyimpang dari atau memperluas aturan di TDD_Rangkul.md.*
