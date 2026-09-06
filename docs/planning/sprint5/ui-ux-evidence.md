# Rangkul UI/UX Visual QA & Evidence Matrix

Dokumen ini hanya mencatat pemeriksaan yang benar-benar dilakukan. Status `Belum diverifikasi` bukan kegagalan produk, tetapi tidak boleh diperlakukan sebagai bukti kelulusan release.

## Status per 5 September 2026

| Surface / Halaman | 375px | 768px | 1024px | 1440px | Keyboard / Focus | 200% Zoom | Empty | Loading | Error / Guard |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Landing (`/`) | Lulus browser | Lulus browser | Lulus browser | Lulus browser | Drawer Escape dan focus return lulus | Belum diverifikasi | N/A | N/A | CTA pengunjung lulus |
| Keluarga (`/beranda`) | Lulus browser | Lulus browser | Lulus browser | Lulus browser | Target sentuh 44px lulus | Belum diverifikasi | Source reviewed | Teramati saat data dimuat | Source reviewed |
| Helper (`/helper/dashboard`) | Lulus browser | Lulus browser | Lulus browser | Lulus browser | Target sentuh 44px lulus | Belum diverifikasi | Source reviewed | Teramati saat data dimuat | Source reviewed |
| Koordinator (`/koordinator/dashboard`) | Lulus browser | Lulus browser | Lulus browser | Lulus browser | Drawer Escape dan focus return lulus | Belum diverifikasi | Teramati pada antrean nol | Teramati saat data dimuat | Source reviewed |
| Admin (`/admin/dashboard`) | Lulus browser | Lulus browser | Lulus browser | Lulus browser | Dropdown sidebar lulus | Belum diverifikasi | Teramati pada antrean nol | Teramati saat statistik dimuat | Source reviewed |

## Pemeriksaan yang sudah memiliki bukti

- Source contract landing menolak metrik, testimonial, ranking, pendapatan, komisi, dan visual data pelanggan rekaan.
- Source contract harga memastikan booking dimulai dari `harga_dasar`, layanan tambahan mengikuti alur Helper lalu persetujuan Keluarga, dan browser tidak menghitung pendapatan Helper.
- Source contract landing mencakup product-card stack 3D, `Health Snapshot`, `Memory Capsule`, contoh skenario demo, tiga role publik, dan larangan klaim sosial palsu. Contract lulus setelah bug initial render diperbaiki: kartu tidak lagi server-render dengan `opacity: 0` saat JavaScript belum siap. Memory Capsule kini dirender penuh di atas Health Snapshot pada layar kecil agar isinya tidak tertutup.
- `npm run lint` selesai dengan exit code 0 dan 61 warning non-blocking. `npm run typecheck` lulus. `npm run test` menghasilkan 229 lulus dan 9 skip cloud-runtime. `next build` juga telah mengompilasi, menghasilkan `.next/BUILD_ID` baru, lalu selesai setelah server Next lokal tidak lagi bersaing memakai direktori `.next`.
- `npm ci` tidak dapat dicatat lulus pada host ini. Percobaan pertama terblokir binary `lightningcss` dari server Next, kemudian percobaan kedua macet tanpa progress setelah server workspace dihentikan. Ulangi pada runner bersih sebelum release.
- Screenshot desktop setelah redesign hero tersimpan di `C:\Users\farro\.codex\visualizations\2026\09\04\rangkul-qa\landing-hero-motion-1440-v2.png`. Screenshot 375px dari Chrome headless tidak menjadi evidence mobile yang sah karena mode `--window-size` Chrome dapat memakai minimum viewport desktop dan memotong hasil. Ulangi dengan device emulation sebelum menandai mobile lulus.
- Browser in-app pada 5 September memverifikasi landing aktual pada 375px, 768px, 1024px, dan 1440px. Seluruh ukuran memiliki horizontal overflow nol. Grid layanan terisi satu kolom pada 375px, dua kolom pada 768px, dan dua baris berisi tiga kartu pada 1024px serta 1440px. Tidak ada target interaktif landing yang terukur di bawah 44px pada 375px.
- Navigasi publik sekarang mengikuti `Tentang`, `Cara Kerja`, `Layanan`, `Riwayat`, dan `Peran`. Scroll-spy menandai `Cara Kerja` pada desktop dan `Layanan` di drawer mobile. Drawer menutup dengan Escape dan mengembalikan fokus ke tombol pembuka.
- CTA `Buat Kunjungan` untuk pengunjung mengarah ke `/login?next=/booking/new`. Setelah login, hanya akun Keluarga yang dapat memakai tujuan kembali tersebut. Role lain tetap masuk ke dashboardnya.
- Hero memakai parallax berbasis transform untuk snapshot, figur, dan glow. Initial opacity tetap `1`, sehingga hero tidak kosong pada server render atau saat hidrasi terlambat. Kartu snapshot berada di atas figur dan lebarnya membesar pada 375px agar isi tidak tertutup.
- Login aktual memakai persona seed `ratnakeluarga`, `andihelper`, `wagimankoordinator`, dan `demoadmin`. Keempatnya diarahkan ke dashboard role yang benar. Pemeriksaan CSS viewport 375px, 768px, 1024px, dan 1440px tidak menemukan horizontal overflow. Keluarga dan Helper juga tidak lagi memiliki target interaktif di bawah 44px pada empat ukuran tersebut.
- Drawer Koordinator menutup melalui Escape dan mengembalikan fokus ke tombol `Buka menu`. Grup `Operasional` Koordinator dan `Moderasi` Admin dapat ditutup serta dibuka kembali melalui tombol dengan `aria-expanded` yang berubah sesuai state.
- Guard lintas peran kini diuji sebagai matriks penuh. Seluruh 70 halaman mendapat klasifikasi akses dari route group; request langsung dengan persona Keluarga, Helper, Koordinator, dan Admin membuktikan route tanpa prefix, route legacy `/tugas`, dan namespace role hanya merender untuk role yang tepat. Role lain mendapat `307` ke dashboardnya sendiri. Seluruh 86 route handler minimal membutuhkan sesi kecuali login, register, dan webhook bertanda tangan; sampel namespace role menghasilkan `401`, `403`, dan `200` sesuai aktor.
- Logo autentikasi memakai rasio intrinsik SVG. Browser tidak lagi menghasilkan warning rasio gambar baru setelah perbaikan.
- Cloud demo berhasil di-seed ulang melalui `npm run seed:cloud` setelah target ref diverifikasi dari project yang tertaut. Script menyelesaikan SQL dan menyinkronkan empat asset demo privat.
- Gate terbaru setelah sinkronisasi `develop`: `npm ci` lokal lulus, lint lulus dengan 54 warning non-blocking dan tanpa error, typecheck lulus, 295/295 test cloud lulus tanpa skip, serta production build menyelesaikan 96 route.
- Katalog Keluarga tidak lagi memperlihatkan kontrol mode Sprint 6 ketika feature flag server nonaktif. Trigger dropdown memiliki target sentuh 44px, semantik menu, dan pengembalian fokus saat Escape.
- Form verifikasi Helper hanya menampilkan Koordinator RT yang persis sama atau fallback RW yang sah. Response browser tidak memuat nomor telepon Koordinator, sedangkan submit divalidasi ulang di backend sebelum data profil berubah.
- Browser aktual memverifikasi domisili Pleburan RT 03/RW 05 hanya menampilkan tiga Koordinator RT 03. Ketika RT diubah menjadi 99, daftar beralih ke dua Koordinator RW 05 dan tidak mempertahankan pilihan RT lama.
- Browser aktual dengan sesi Keluarga memverifikasi kontrol mode dan CTA Sprint 6 muncul saat flag aktif. Ketika proses server dijalankan dengan flag `false`, tidak ada kontrol mode, Lowongan, atau Cari Cepat; empty state kembali ke saran filter. Escape pada menu aktif menutup popover dan mengembalikan fokus ke trigger.

## Pemeriksaan yang masih wajib dilakukan sebelum acceptance

- Screenshot tersimpan untuk landing terbaru dan screenshot nyata empat viewport pada empat dashboard peran. Pemeriksaan browser sudah lulus, tetapi artifact gambar terbaru belum disimpan.
- Keyboard path menyeluruh serta focus ring pada aksi utama. Escape dan focus return drawer Koordinator sudah lulus.
- Zoom 200%, `prefers-reduced-motion`, nama atau alamat panjang, dan badge `99+`.
- State loading, empty, error, forbidden, conflict, dan retry yang memang tersedia pada tiap halaman.
- Screenshot dan URL atau environment yang dipakai untuk setiap hasil di atas.
- Clean install kini lulus lokal dan sebelumnya juga lulus pada runner CI. Check CI untuk HEAD PR #31 yang baru tetap harus hijau sebelum merge.
- Runtime cloud matrix final lulus 295/295 tanpa skip. Feature flag tetap belum boleh diaktifkan di production sebelum zoom 200 persen, state negatif non-forbidden, preview dry run lengkap, dan smoke production memiliki evidence.
- Lima runtime test khusus Sprint 6 juga lulus dua kali berturut-turut tanpa reseed manual setelah fixture shared diberi reset sebelum dan sesudah suite. Evidence ini menutup ketergantungan terhadap urutan test untuk race Cari Cepat, withdraw, dan selection pelamar.
- Browser lokal dengan feature flag aktif memverifikasi dropdown entry booking hanya berisi `Pilih dari Pelamar` dan `Cari Cepat`. Form Cari Cepat menampilkan batas 15 menit dan kondisi pembayaran, tanpa overflow. Mode langsung tanpa Helper telah dihapus dari entry ini; request HTTP sesi Keluarga membuktikan payload langsung tanpa Helper dan payload marketplace dengan Helper sama-sama ditolak `422` sesuai TDD sebelum insert.
- Deployment preview PR #31 lulus smoke fail-closed. Landing dapat dibuka, akun demo Keluarga dapat login, dan akses langsung `/booking/new` dialihkan ke `/cari-helper` karena flag preview belum aktif. Halaman tujuan memiliki heading yang benar dan tidak mengalami horizontal overflow pada viewport browser smoke.

Tidak ada artifact screenshot yang dapat diverifikasi di repository saat dokumen ini diperbarui. Karena itu, evidence lama yang mengklaim semua viewport lulus telah dicabut.
