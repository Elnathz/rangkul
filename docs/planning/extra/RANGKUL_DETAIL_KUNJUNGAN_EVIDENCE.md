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

## Browser QA

| State | Hasil desktop | Bukti perilaku |
|---|---|---|
| Menunggu persetujuan Koordinator | Lulus | alasan peninjauan dan jadwal terkunci tampil sebelum metadata |
| Terjadwal | Lulus | jadwal, Helper, lokasi, dan aksi yang masih diizinkan tampil state-aware |
| Dikerjakan | Lulus | status live tampil, cancel dan reschedule tidak muncul |
| Persetujuan Keluarga | Lulus | tombol Tolak/Setujui tampil untuk layanan tambahan pending |
| Selesai | Lulus | laporan dan Riwayat Rangkul diprioritaskan, bukan foto identitas |
| Dibatalkan | Lulus | alasan pembatalan dan status pembayaran tampil, aksi live disembunyikan |

Keterbatasan tooling: browser automation yang tersedia pada host hanya memberi viewport desktop saat autentikasi aktif dan tidak menawarkan device emulation. Responsiveness 375px dan 768px telah ditutup oleh kontrak source mobile-first, target sentuh `min-h-11`, layout vertical stepper mobile, dan grid desktop hanya mulai `lg`. Capture manual pada device emulation tetap diperlukan sebelum submission jika browser dengan viewport override tersedia.

## Test dan build

- `npm ci`: lulus pada lockfile proyek.
- `npm run lint`: lulus.
- `npm run typecheck`: lulus.
- `npm run test`: 296 lulus, 14 runtime cloud test ditandai skip.
- `npm run build`: lulus pada Next.js 16.2.12.
- `npm run seed` dengan target cloud tervalidasi: lulus dan menyinkronkan empat asset demo private.

## Catatan gate

`git diff --check` masih gagal pada perubahan bekerja yang sudah ada di `src/app/(keluarga)/lansia/page.tsx` karena blank line pada akhir file. File itu berada di luar scope detail Kunjungan dan tidak diubah oleh implementasi ini. Perbaiki atau commit perubahan pemiliknya sebelum PR digabung.
