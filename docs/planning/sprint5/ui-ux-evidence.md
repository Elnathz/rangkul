# Rangkul UI/UX Visual QA & Evidence Matrix

Dokumen ini mencatat bukti verifikasi visual, responsivitas mobile-first, aksesibilitas, dan kepatuhan terhadap kontrak desain **ui-ux-restructure-plan-v2.md** per 4 September 2026.

---

## 1. Evidence Matrix

| Surface / Halaman | 375px (Mobile) | 768px (Tablet) | 1024px (Laptop) | 1440px (Desktop) | Keyboard / Focus | 200% Zoom | Empty State | Loading State | Error / Guard State |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Landing Page** (`/`) | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| **Keluarga Dashboard** (`/beranda`) | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Helper Dashboard** (`/helper/dashboard`) | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Koordinator Dashboard** (`/koordinator/dashboard`) | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Admin Dashboard** (`/admin/dashboard`) | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Marketplace Helper** (`/cari-helper`) | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

---

## 2. Rincian Temuan Visual & Hasil Browser Subagent

### A. Landing Page (`/`)
* **375px Mobile Viewport**:
  * Horizontal overflow: `0px` (`scrollWidth <= innerWidth`).
  * Hero Section: Headline *"Merangkul Jarak, Menjaga yang Tersayang"*, sub-teks kontras tinggi, input pencarian responsif, dan chip kategori tidak membungkus secara canggung.
  * Trust Strip: 3 pilar kepatuhan (*"Diverifikasi komunitas lokal"*, *"Harga transparan sejak awal"*, *"Laporan setiap kunjungan"*) tersaji presisi di dasar hero.
  * Primary CTA: Tombol *"Buat Kunjungan"* dengan target sentuh >=44px.
  * Cara Kerja (StepsSection): 3 kartu bernomor (*01*, *02*, *03*) tersusun vertikal rapi.
  * Layanan (ServicesSection): Informasi durasi, harga fix, dan badge *"Perlu Persetujuan Koordinator"* tampil terbaca.
  * Riwayat Rangkul WOW Section: Tampilan 5-dimensi observasi kebugaran non-diagnostik, kutipan Memory Capsule, dan kartu contoh Ibu Sulastri (72 tahun).
  * 3 Pilar Kepercayaan & Pilihan Peran: Menampilkan benefit transparan tanpa klaim pendapatan atau rating rekaan.
  * CTA Banner Siap Merangkul di footer.
* **768px Tablet Viewport**:
  * Transisi layout 1 kolom ke 2 kolom berjalan proporsional tanpa kartu terpotong.
* **1440px Desktop Viewport**:
  * Formasi 2-kolom seimbang pada Hero dan Riwayat Rangkul.
  * Grid 3-kolom bersih pada Pilihan Peran (Keluarga, Helper 90% split, Koordinator 3% komisi).

### B. Shell Navigasi Operasional & Brand
* **Keluarga & Helper**:
  * Desktop: Top Navigation dengan lockup logo `logo.png` (bukan wordmark berkanvas longgar) dan indikator rute aktif `desktop-active-navigation`.
  * Mobile: Bottom Navigation dengan efek liquid glass `backdrop-blur-xl`, safe area inset, dan animasi indikator tab aktif `bottom-navigation-active` yang menghormati `useReducedMotion`.
* **Koordinator & Admin**:
  * Desktop: Sidebar 256px terpadu dengan pengelompokan menu semantik dan topbar ringkas 64px.
  * Mobile: Drawer navigasi dengan focus trap, keyboard escape, dan scroll lock.

### C. Kepatuhan Audit Harga (U7)
* Menghapus pembuatan biaya layanan siluman (Rp 2.500) dan PPN 11% yang sebelumnya di-hardcode pada UI client `RealTaskDetailClient` dan `booking/[helper_id]`.
* Seluruh tampilan rincian harga dikunci mutlak ke `harga_dasar`, layanan tambahan yang disetujui, dan `harga_final` (Fix Price sesuai TDD §3.4).

### D. Aksesibilitas & Stress Testing
* **Touch Targets**: Seluruh button dan input memiliki tinggi minimum 44px (rata-rata 44px - 48px).
* **Focus States**: Ring fokus terlihat jelas dengan kontras WCAG AA.
* **Long Text Resilience**: Nama panjang, alamat bertingkat, dan catatan kondisi tidak merusak container grid.
* **Reduced Motion**: Animasi transisi fallback aman saat preferensi `prefers-reduced-motion` aktif.

---

## 3. Catatan Screenshot & Video Bukti
* Sesi browser otomatis terekam dalam format WebP: `verify_ui_ux_1788464610662.webp`.
* Screenshot viewports tersimpan di artifacts directori IDE.
