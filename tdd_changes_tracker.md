# TDD Changes & Compliance Tracker — Rangkul

Dokumen ini mencatat pelacakan kepatuhan dan perubahan terhadap dokumen **Technical Design Document (TDD) v5.0 — Rangkul**.

---

## 🎨 Asset & Design System Updates

### 1. Rangkul Icon & Logo SVG (10 Opsi Eksklusif) (3 Agustus 2026)
- **Status:** Kepatuhan Penuh (§13.1 TDD). Tidak ada breaking change terhadap TDD.
- **Warna Dasar yang Digunakan:**
  - `Primary Dark`: `#0D47A1` (Deep Trust Blue — TDD §13.1)
  - `Primary Light`: `#90CAF9` (Soft Warm Sky Blue — TDD §13.1)
  - `Accent Gradients`: `#E3F2FD` & `#1565C0` (Sub-skala biru harmonis untuk kedalaman visual)

#### 📋 Daftar 10 Opsi Icon & Filosofinya:

1. **Opsi 1: Pelukan Kehangatan & Perlindungan (`public/rangkul-option1-embrace.svg`)**
   - *Filosofi:* Lengan merangkul, Hati terpusat, Lingkaran Komunitas RT/RW.
2. **Opsi 2: Rumah Komunitas & Jembatan Kasih (`public/rangkul-option2-haven.svg`)**
   - *Filosofi:* Atap tempat lansia aman (*Aging in Place*), Jembatan penghubung anak perantauan.
3. **Opsi 3: Simpul Keberlanjutan & Kehidupan (`public/rangkul-option3-infinity.svg`)**
   - *Filosofi:* Pemantauan kondisi lansia yang berkelanjutan (*Riwayat Rangkul*).
4. **Opsi 4: Dua Tangan Berpagut & Bintang Harapan (`public/rangkul-option4-hands.svg`)**
   - *Filosofi:* Kontak fisik & kehangatan emosional antara Helper dan Lansia, dipayungi bintang harapan.
5. **Opsi 5: Perisai Kepercayaan Komunitas (`public/rangkul-option5-shield.svg`)**
   - *Filosofi:* Perisai Kepercayaan Koordinator RT/RW yang memverifikasi identitas Helper.
6. **Opsi 6: Lentera Penjaga & Jejak Kasih (`public/rangkul-option6-beacon.svg`)**
   - *Filosofi:* Ketenangan pikiran keluarga perantau, menjadi lentera yang menerangi lansia.
7. **Opsi 7: Pohon Kehidupan & Pertautan Akar (`public/rangkul-option7-tree.svg`)**
   - *Filosofi:* Lansia sebagai akar keluarga dan komunitas yang menopang rindangnya kehidupan.
8. **Opsi 8: Merpati Pembawa Kabar & Ikatan Batin (`public/rangkul-option8-dove.svg`)**
   - *Filosofi:* Laporan kunjungan (Health Snapshot + foto) yang dikirimkan secara damai & terpercaya.
9. **Opsi 9: Jam Pasir Keberadaan & Waktu Berharga (`public/rangkul-option9-moments.svg`)**
   - *Filosofi:* Waktu kebersamaan lansia dan Helper yang berharga — menemani mengobrol & kunjungan rutin.
10. **Opsi 10: Bunga Teratai Keselarasan 4 Peran (`public/rangkul-option10-lotus.svg`)**
    - *Filosofi:* 4 kelopak melambangkan 4 peran utama Rangkul (Keluarga, Helper, Koordinator, Lansia).
11. **Opsi 11: Minimalist Slate Background (`public/rangkul-option11-slate.svg`)**
    - *Filosofi:* Fokus pada kesederhanaan ikon di atas latar slate.
12. **Opsi 12: Pure White Outline (`public/rangkul-option12-outline.svg`)**
    - *Filosofi:* Pendekatan linear yang elegan dan bersih.
13. **Opsi 13: Soft Warm Blue Background (`public/rangkul-option13-warm.svg`)**
    - *Filosofi:* Memberikan kesan hangat dan ramah lansia.

---

## 📝 Catatan Perubahan Spesifikasi TDD

| Tanggal | Fitur / Komponen | Deskripsi Perubahan | Alasan / Justifikasi | Status Approvals |
|---|---|---|---|---|
| 03/08/2026 | Icon & Logo Branding | Penambahan 13 opsi asset SVG resmi & komponen React `RangkulIconOptionsShowcase` | Mengikuti token warna TDD §13.1 (`#0D47A1` & `#90CAF9`) dan eksplorasi latar belakang | Approved |
| 05/08/2026 | Logo SVG Vectorization | Vektoriasi asset `public/logo.png` menjadi `public/logo.svg` (high-precision bezier curves & responsive viewBox) | Memenuhi kebutuhan asset SVG scalable tanpa mengubah bentuk visual logo asli | Approved |
| 06/08/2026 | Asset Cleanup | Pembersihan 15 file SVG opsi eksperimental (`public/rangkul-option*.svg`, `rangkul-icon.svg`, `rangkul-logo.svg`) & `rangkul-icon-showcase.tsx` | Menghapus asset draf/opsi branding sementara yang tidak dipakai dalam aplikasi utama agar bundle publik tetap bersih | Approved |
| 07/08/2026 | Klarifikasi Model Verifikasi Helper (§3.3.1, §3.3.2) | **Dikonfirmasi:** Helper hanya diverifikasi sekali oleh Koordinator RT/RW domisilinya. Verifikasi bersifat personal (analog SIM). Wajib domisili asli, bukan bebas pilih. Urutan fallback: RT aktif → RW aktif → Admin fallback. Backend return 403 jika Koordinator mencoba approve Helper di luar wilayahnya. | Mencegah pengenceran trust model yang menjadi USP Rangkul vs kompetitor. Sejalan dengan TDD §3.3.1 dan §3.3.2. | Approved |
| 07/08/2026 | Klarifikasi Penerima Komisi 3% (§3.4.2) | **Dikunci:** Komisi 3% per tugas SELESAI diberikan ke Koordinator yang memverifikasi Helper (`koordinator_id` di `helper_profiles`), bukan Koordinator wilayah lansia. Lookup menggunakan relasi langsung `tasks.helper_id -> helper_profiles.koordinator_id -> koordinator_profiles`. | Implementasi sederhana, kolom sudah ada di schema. TDD §3.4.2 "wilayahnya" merujuk ke wilayah koordinator yang menjamin Helper tersebut, bukan wilayah tempat tugas dikerjakan. | Approved |
| 30/08/2026 | Pembayaran Kedaluwarsa & Live Sync (§3.4) | **Diterapkan:** Retry charge dengan parameter `force_new=true` membuat order ID & Snap token baru agar pengguna tidak terjebak token expired. Endpoint status melakukan live sync ke Midtrans API untuk auto-settle status `held_escrow` jika webhook tertunda di localhost. | Mencegah kebuntuan pembayaran saat sesi pembayaran sebelumnya kedaluwarsa atau dibatalkan. | Approved |
| 30/08/2026 | Batasan Waktu Check-in Helper (§3.1, §3.7) | **Diterapkan:** Helper hanya diizinkan check-in (mulai tugas) maksimal 30 menit sebelum `jadwal_waktu` tugas. Jika waktu pelaksanaan ingin dimajukan, Keluarga harus melakukan penjadwalan ulang melalui fitur Jadwal Ulang. | Mencegah tugas dimulai secara prematur tanpa kesepakatan jadwal dengan keluarga lansia. | Approved |
| 30/08/2026 | Validasi Wajib Memory Capsule (§3.12, FR-RWT-02) | **Diterapkan:** Kolom Cerita Hari Ini (Memory Capsule) dan catatan kondisi diwajibkan minimal 10 karakter dengan validasi Zod server dan feedback dialog interaktif di browser. | Menjaga kualitas narasi emosional Riwayat Rangkul sebagai nilai pembeda utama bagi keluarga perantau. | Approved |
| 04/09/2026 | Audit Tampilan Harga & Rincian Biaya (§3.4, §3.8, U7) | **Diterapkan:** Menghapus biaya layanan fiktif (Rp 2.500) dan PPN 11% siluman di UI client (`RealTaskDetailClient` dan `booking/[helper_id]`). Seluruh tampilan rincian harga dikunci mutlak ke `harga_dasar`, layanan tambahan disetujui, dan `harga_final` (Fix Price). | Kepatuhan mutlak pada model escrow fixed price TDD §3.4, di mana potongan platform 7% dan komisi 3% dieksekusi via split backend, bukan beban tambahan ke keluarga lansia. | Approved |
| 04/09/2026 | Mode Penugasan Fleksibel (Pelamar & Cari Cepat) (§3.14, §4.5, §6, §7) | **Diterapkan:** Tabel `task_applications` dengan status enum (pending, selected, withdrawn, rejected, expired), constraint unik (task_id, helper_id), dan RPC atomik PostgreSQL (`apply_to_task`, `withdraw_task_application`, `select_task_application`, `accept_quick_task`). Notifikasi task-type standar digunakan saat ada pelamar atau helper terpilih. | Mengimplementasikan spesifikasi Sprint 6 untuk mode matching non-direct tanpa race condition dan melindungi privasi data lansia dari helper sebelum terpilih. | Approved |
