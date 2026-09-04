# Rangkul UI/UX Visual QA & Evidence Matrix

Dokumen ini hanya mencatat pemeriksaan yang benar-benar dilakukan. Status `Belum diverifikasi` bukan kegagalan produk, tetapi tidak boleh diperlakukan sebagai bukti kelulusan release.

## Status per 4 September 2026

| Surface / Halaman | 375px | 768px | 1024px | 1440px | Keyboard / Focus | 200% Zoom | Empty | Loading | Error / Guard |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Landing (`/`) | Lulus visual | Lulus visual | Lulus visual | Lulus visual | Belum diverifikasi | Belum diverifikasi | N/A | N/A | N/A |
| Keluarga (`/beranda`) | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Source reviewed | Belum diverifikasi | Source reviewed | Source reviewed | Source reviewed |
| Helper (`/helper/dashboard`) | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Source reviewed | Belum diverifikasi | Source reviewed | Source reviewed | Source reviewed |
| Koordinator (`/koordinator/dashboard`) | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Source reviewed | Belum diverifikasi | Source reviewed | Source reviewed | Source reviewed |
| Admin (`/admin/dashboard`) | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Source reviewed | Belum diverifikasi | Source reviewed | Source reviewed | Source reviewed |

## Pemeriksaan yang sudah memiliki bukti

- Source contract landing menolak metrik, testimonial, ranking, pendapatan, komisi, dan visual data pelanggan rekaan.
- Source contract harga memastikan booking dimulai dari `harga_dasar`, layanan tambahan mengikuti alur Helper lalu persetujuan Keluarga, dan browser tidak menghitung pendapatan Helper.
- `npm run lint`, `npm run typecheck`, `npm run test` (223 lulus, 9 skip cloud), `npm run build`, dan `git diff --check` lulus setelah perubahan terakhir.
- `npm ci` tidak dapat dicatat lulus pada host ini. Percobaan pertama terblokir binary `lightningcss` dari server Next, kemudian percobaan kedua macet tanpa progress setelah server workspace dihentikan. Ulangi pada runner bersih sebelum release.
- Landing diperiksa melalui Chrome DevTools device emulation pada 375px, 768px, 1024px, dan 1440px. `scrollWidth` tidak melebihi viewport pada setiap ukuran. Screenshot lokal tersimpan di `C:\Users\farro\.codex\visualizations\2026\09\04\rangkul-qa\landing-cdp-375.png`, `landing-cdp-768.png`, `landing-cdp-1024.png`, dan `landing-cdp-1440.png`.

## Pemeriksaan yang masih wajib dilakukan sebelum acceptance

- Screenshot nyata untuk 375px, 768px, 1024px, dan 1440px pada lima surface di atas.
- Keyboard path, Escape dan focus return untuk drawer atau dialog, serta focus ring pada aksi utama.
- Zoom 200%, `prefers-reduced-motion`, nama atau alamat panjang, dan badge `99+`.
- State loading, empty, error, forbidden, conflict, dan retry yang memang tersedia pada tiap halaman.
- Screenshot dan URL atau environment yang dipakai untuk setiap hasil di atas.

Tidak ada artifact screenshot yang dapat diverifikasi di repository saat dokumen ini diperbarui. Karena itu, evidence lama yang mengklaim semua viewport lulus telah dicabut.
