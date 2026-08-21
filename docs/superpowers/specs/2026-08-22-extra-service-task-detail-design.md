# Layanan Tambahan dan Detail Tugas Real Data

## Tujuan

Menyelesaikan alur layanan tambahan dari Helper ke persetujuan Keluarga, menghapus mock pada detail kunjungan Keluarga, menampilkan nominal pembayaran berdasarkan data server, dan menyamakan presentasi foto lansia dengan rasio tetap serta modal zoom.

## Keputusan

- Helper hanya dapat mengajukan nama layanan dan biaya tambahan saat tugas berstatus `dikerjakan`.
- Pengajuan memindahkan tugas ke `menunggu_persetujuan_keluarga`.
- Keluarga menjadi satu-satunya pihak yang dapat menyetujui atau menolak pengajuan.
- `harga_final` hanya berubah setelah Keluarga menyetujui pengajuan.
- Setelah disetujui atau ditolak, tugas kembali ke `dikerjakan`.
- Halaman Keluarga membaca task dan `task_extra_services` dari Supabase, tanpa `MOCK_TASKS` atau fallback data palsu.
- Rincian biaya hanya menampilkan nominal yang tersedia dari database/API. Biaya aplikasi dan pajak tidak dibuat-buat di browser.
- Nominal pendapatan Helper berasal dari perhitungan server-side berdasarkan aturan split TDD, bukan perkalian di komponen browser.
- Foto lansia memakai panel rasio 4:3, `object-cover`, dan modal zoom yang sudah dipakai di aplikasi.

## Batasan

Fitur crop upload penuh tidak digabungkan ke perubahan ini karena memerlukan perubahan pipeline upload dan penyimpanan hasil crop. Perubahan ini memastikan foto yang sudah tersimpan tidak stretch. Cropper menjadi follow-up terpisah.

## Verifikasi

- Test route memastikan role, owner, status transition, dan conditional update.
- Test UI memastikan mock dihapus, aksi layanan tambahan memakai endpoint nyata, dan panel foto memakai rasio tetap.
- Jalankan test Node, TypeScript, ESLint, dan build.
