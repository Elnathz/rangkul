# Rangkul UI/UX Visual QA & Evidence Matrix

Dokumen ini hanya mencatat pemeriksaan yang benar-benar dilakukan. Status `Belum diverifikasi` bukan kegagalan produk, tetapi tidak boleh diperlakukan sebagai bukti kelulusan release.

## Status per 4 September 2026

| Surface / Halaman | 375px | 768px | 1024px | 1440px | Keyboard / Focus | 200% Zoom | Empty | Loading | Error / Guard |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Landing (`/`) | Perlu review ulang | Perlu review ulang | Perlu review ulang | Perlu review ulang | Belum diverifikasi | Belum diverifikasi | N/A | N/A | N/A |
| Keluarga (`/beranda`) | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Source reviewed | Belum diverifikasi | Source reviewed | Source reviewed | Source reviewed |
| Helper (`/helper/dashboard`) | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Source reviewed | Belum diverifikasi | Source reviewed | Source reviewed | Source reviewed |
| Koordinator (`/koordinator/dashboard`) | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Source reviewed | Belum diverifikasi | Source reviewed | Source reviewed | Source reviewed |
| Admin (`/admin/dashboard`) | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Belum diverifikasi | Source reviewed | Belum diverifikasi | Source reviewed | Source reviewed | Source reviewed |

## Pemeriksaan yang sudah memiliki bukti

- Source contract landing menolak metrik, testimonial, ranking, pendapatan, komisi, dan visual data pelanggan rekaan.
- Source contract harga memastikan booking dimulai dari `harga_dasar`, layanan tambahan mengikuti alur Helper lalu persetujuan Keluarga, dan browser tidak menghitung pendapatan Helper.
- Source contract landing mencakup product-card stack 3D, `Health Snapshot`, `Memory Capsule`, contoh skenario demo, tiga role publik, dan larangan klaim sosial palsu. Contract lulus setelah bug initial render diperbaiki: kartu tidak lagi server-render dengan `opacity: 0` saat JavaScript belum siap. Memory Capsule kini dirender penuh di atas Health Snapshot pada layar kecil agar isinya tidak tertutup.
- `npm run lint` selesai dengan exit code 0 dan 61 warning non-blocking. `npm run typecheck` lulus. `npm run test` menghasilkan 229 lulus dan 9 skip cloud-runtime. `next build` juga telah mengompilasi, menghasilkan `.next/BUILD_ID` baru, lalu selesai setelah server Next lokal tidak lagi bersaing memakai direktori `.next`.
- `npm ci` tidak dapat dicatat lulus pada host ini. Percobaan pertama terblokir binary `lightningcss` dari server Next, kemudian percobaan kedua macet tanpa progress setelah server workspace dihentikan. Ulangi pada runner bersih sebelum release.
- Screenshot desktop setelah redesign hero tersimpan di `C:\Users\farro\.codex\visualizations\2026\09\04\rangkul-qa\landing-hero-motion-1440-v2.png`. Screenshot 375px dari Chrome headless tidak menjadi evidence mobile yang sah karena mode `--window-size` Chrome dapat memakai minimum viewport desktop dan memotong hasil. Ulangi dengan device emulation sebelum menandai mobile lulus.

## Pemeriksaan yang masih wajib dilakukan sebelum acceptance

- Screenshot nyata untuk 375px, 768px, 1024px, dan 1440px pada lima surface di atas.
- Keyboard path, Escape dan focus return untuk drawer atau dialog, serta focus ring pada aksi utama.
- Zoom 200%, `prefers-reduced-motion`, nama atau alamat panjang, dan badge `99+`.
- State loading, empty, error, forbidden, conflict, dan retry yang memang tersedia pada tiap halaman.
- Screenshot dan URL atau environment yang dipakai untuk setiap hasil di atas.
- Jalankan source quality gate lengkap tanpa bentrok dengan `next dev`: `npm ci`, lint, typecheck, test, build, dan `git diff --check`.
- Jalankan runtime cloud matrix dengan kredensial Supabase integration agar sembilan test RLS, payment, race-condition, dan assignment tidak lagi skip. Baru setelah itu flag Sprint 6 boleh dinilai untuk diaktifkan.

Tidak ada artifact screenshot yang dapat diverifikasi di repository saat dokumen ini diperbarui. Karena itu, evidence lama yang mengklaim semua viewport lulus telah dicabut.
