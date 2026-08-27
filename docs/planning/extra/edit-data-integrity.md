# Rencana audit form edit

- Scope: sinkronisasi data awal dan kategori layanan pada edit profil Helper, no-op submit pada form profil, edit lansia, dan status fallback Admin.
- File: halaman edit Helper, Keluarga, Koordinator, Lansia, route profil Helper, route suspend/fallback Admin, parser alamat, dan test kontrak.
- Database/API: gunakan route yang sudah ada untuk akun dan lansia, tambah PATCH profil Helper untuk menyimpan kategori serta data operasional dengan validasi server.
- Testing: test merah untuk sumber kategori database, preload data, no-op submit, koordinat null, dan pencabutan fallback saat suspend.
- Risiko: 18 baris kategori mencakup 5 parent nonaktif, jadi form hanya menampilkan 13 layanan aktif yang memang valid dipilih Helper.
