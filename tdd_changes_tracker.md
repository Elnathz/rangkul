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
