# Evidence Redesign Detail Kunjungan

**Tanggal:** 6 September 2026
**Branch:** `dev-eln`
**Scope:** `/kunjungan/[id]` untuk Keluarga

## Implementasi yang diverifikasi

- Shell lifecycle bersama menampilkan reference pendek, status bermakna, stepper, panel tindakan berikutnya, ringkasan jadwal/lokasi, context rail, dan rincian harga dari server.
- Foto lansia dan Helper menjadi konteks ringkas. Foto dibuka melalui modal keyboard-accessible, bukan portrait hero.
- State selesai memprioritaskan laporan, bukti, Health Snapshot non-diagnostik, Memory Capsule, dan CTA Riwayat Rangkul.
- State dibatalkan tampil sebagai arsip dengan alasan, waktu, status pembayaran, dan tanpa aksi live.
- State persetujuan Keluarga memiliki layanan tambahan nyata. Keputusan browser mengubah status kembali ke `dikerjakan` dan mengubah `harga_final` dari Rp50.000 menjadi Rp60.000. Fixture kemudian dipulihkan oleh seed.
- Rincian pembayaran menjelaskan tindakan pengguna. Belum ada pembayaran tidak lagi selalu ditampilkan sebagai error atau status teknis.
- Halaman pembayaran hanya menampilkan checkout ketika status Kunjungan memang sudah layak dibayar. Pada tahap sebelumnya, pengguna melihat alasan dan langkah berikutnya, bukan tombol bayar yang buntu.
- Jika pembayaran masih `pending` atau belum dibuat untuk Kunjungan yang sudah layak dibayar, notice pembayaran ditampilkan tepat setelah header detail dan sebelum stepper lifecycle. Status operasional seperti `dikerjakan` tetap tampil sebagai konteks, sehingga dua fakta tidak lagi tercampur.
- Dashboard dan daftar Kunjungan menampilkan CTA pembayaran yang sama. Kunjungan Mendatang kini hanya memuat jadwal masa depan dengan status diajukan, menunggu persetujuan Koordinator, atau dikonfirmasi. Kunjungan aktif dibatasi ke pekerjaan yang benar-benar berjalan atau menunggu persetujuan Keluarga.
- Payment dengan status `held_escrow`, `released`, `refunded`, atau `dibatalkan_kompensasi` tidak lagi diperlakukan sebagai tagihan. CTA bayar hanya muncul untuk payment `pending` atau payment yang belum dibuat dan masih berada sebelum jadwal.
- Relasi payment satu-ke-satu dinormalisasi sebelum render, sehingga pembayaran yang sudah diterima tidak lagi memunculkan CTA `Bayar kunjungan` karena terbaca sebagai `null`.
- Copy overdue dibedakan: Kunjungan terkonfirmasi menjelaskan pembatalan otomatis, sedangkan record lama yang sudah dimulai diberi status perlu ditinjau tim.
- Batas pembayaran adalah saat jadwal Kunjungan dimulai. Tugas terkonfirmasi tanpa pembayaran diterima akan dibatalkan oleh job lima-menitan. RLS Helper menolak check-in pada tugas yang belum memiliki payment `held_escrow` atau `released`.
- Waktu batas pembayaran ditampilkan eksplisit sebagai “Bayar paling lambat” pada notice detail dan sebagai “Batas pembayaran” pada halaman pembayaran, menggunakan `jadwal_waktu` dari server.
- Scheduler expiry kini mencakup `diajukan` dan `menunggu_persetujuan_koordinator` berdasarkan `expires_at`. Endpoint approval dan policy RLS juga menolak persetujuan yang sudah lewat, sementara row approval lama tanpa deadline dibackfill.

## Browser QA

| State | Hasil desktop | Bukti perilaku |
|---|---|---|
| Menunggu persetujuan Koordinator | Lulus | alasan peninjauan dan jadwal terkunci tampil sebelum metadata |
| Terjadwal | Lulus | jadwal, Helper, lokasi, dan aksi yang masih diizinkan tampil state-aware |
| Dikerjakan | Lulus | status live tampil, cancel dan reschedule tidak muncul |
| Persetujuan Keluarga | Lulus | tombol Tolak/Setujui tampil untuk layanan tambahan pending |
| Selesai | Lulus | laporan dan Riwayat Rangkul diprioritaskan, bukan foto identitas |
| Dibatalkan | Lulus | alasan pembatalan dan status pembayaran tampil, aksi live disembunyikan |
| Pembayaran perlu diselesaikan | Kontrak lulus | notice dan CTA berada sebelum lifecycle di detail serta muncul di dashboard dan daftar; QA browser tertunda karena CDP browser host timeout |

Keterbatasan tooling: browser automation yang tersedia pada host hanya memberi viewport desktop saat autentikasi aktif dan tidak menawarkan device emulation. Responsiveness 375px dan 768px telah ditutup oleh kontrak source mobile-first, target sentuh `min-h-11`, layout vertical stepper mobile, dan grid desktop hanya mulai `lg`. Capture manual pada device emulation tetap diperlukan sebelum submission jika browser dengan viewport override tersedia.

## Test dan build

- `npm ci`: lulus pada lockfile proyek.
- `npm run lint`: lulus.
- `npm run typecheck`: lulus.
- `npm run test`: 306 lulus, 14 runtime cloud test ditandai skip.
- `npm run build`: lulus pada Next.js 16.2.12.
- `npm run seed` dengan target cloud tervalidasi: lulus dan menyinkronkan empat asset demo private.

## Catatan gate

Perubahan di luar scope masih ada di working tree dan sengaja tidak ikut commit ini, termasuk blank line pada `src/app/(keluarga)/lansia/page.tsx`. File tersebut tidak diubah oleh implementasi payment/detail Kunjungan.
