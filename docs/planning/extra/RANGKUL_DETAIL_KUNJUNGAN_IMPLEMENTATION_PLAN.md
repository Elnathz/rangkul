# Rencana Implementasi Redesign Detail Kunjungan

**Tanggal:** 6 September 2026
**Branch:** `dev-eln`
**Spesifikasi:** `docs/planning/extra/RANGKUL_DETAIL_KUNJUNGAN_UIUX_MASTER_REDESIGN.md`
**Sumber kebenaran bisnis:** `docs/TDD_Rangkul.md`

## Tujuan

Mengubah `/kunjungan/[id]` menjadi halaman operasional berbasis lifecycle. Status aktif menonjolkan tindakan berikutnya, status selesai menonjolkan hasil kunjungan dan Riwayat Rangkul, sedangkan status dibatalkan tampil sebagai arsip. State machine, kontrak API, RLS, dan harga dari server tidak diubah.

## Batas Desain

- Reading this as: redesign UI produk untuk Keluarga dan juri kompetisi, dengan bahasa visual tenang, trust-first, serta mengikuti design system Rangkul berbasis shadcn dan Tailwind.
- `DESIGN_VARIANCE: 4`, `MOTION_INTENSITY: 3`, `VISUAL_DENSITY: 5`.
- Brand utama tetap `#0D47A1`, biru muda sebagai tint, hijau untuk sukses, amber untuk menunggu, dan merah hanya untuk pembatalan atau bahaya.
- Mobile-first dari 375px. Desktop menggunakan konten utama dan context rail 300-320px pada lebar yang mencukupi.
- Motion hanya untuk feedback dan perubahan state selama 160-260ms. Tidak ada parallax, GSAP, atau animasi dekoratif.
- `@ui-ux-pro-max` menjadi gate struktur, responsivitas, interaksi, dan aksesibilitas. `gpt-taste` dan `design-taste-frontend` hanya dipakai untuk audit anti-slop, konsistensi brand, hierarki, copy, dan card restraint karena keduanya bukan pola untuk dashboard atau UI operasional.
- Implementasi dan review dikerjakan di task utama tanpa subagent. Impeccable tidak digunakan sesuai keputusan pengguna.

## Referensi TDD

- TDD §3.1 dan §3.2: lifecycle task dan aksi berdasarkan status.
- TDD §3.4, §3.7, dan §3.8: pembayaran, layanan tambahan, serta pembatalan.
- TDD §3.12: Health Snapshot, Memory Capsule, dan Riwayat Rangkul.
- TDD §3.14: mode penugasan cepat dan pelamar.
- TDD §4.5, §4.6, dan §4.7: alur Keluarga, Helper, dan Koordinator.
- TDD §7 dan §8: kontrak API serta perlindungan data.
- FR-TSK-06, FR-TSK-07, FR-TSK-08, FR-TSK-10, FR-TSK-13, FR-EVD-03, FR-RWT-01, FR-RWT-02, dan FR-RWT-03.

## State Inventory

| State | Mode | Helper | Payment | Outcome | Aksi Keluarga |
|---|---|---|---|---|---|
| `menunggu_persetujuan_koordinator` | langsung/pelamar | mungkin sudah ada | ringkas | belum ada | batalkan, jadwal terkunci |
| `diajukan` | pelamar | belum dipilih | ringkas | belum ada | lihat pelamar, ubah jadwal, batalkan |
| `diajukan` | cepat/langsung | belum ada | ringkas | belum ada | tunggu matching, ubah jadwal, batalkan |
| `dikonfirmasi` | semua | ada | aksi pembayaran bila relevan | belum ada | hubungi, lokasi, ubah jadwal, batalkan sebelum mulai |
| `dikerjakan` | semua | ada | ringkas | belum ada | hubungi, pantau, tanpa cancel/reschedule |
| `menunggu_persetujuan_keluarga` | semua | ada | menunggu keputusan | laporan/layanan tambahan tersedia | setujui atau tolak layanan tambahan sesuai kontrak |
| `selesai` | semua | ada | status akhir | bukti, laporan, Health Snapshot, Memory Capsule | buka Riwayat Rangkul dan kelola pembayaran bila nyata |
| `dibatalkan` | semua | opsional | refund/no charge sesuai data nyata | alasan dan riwayat | kembali ke daftar, tanpa aksi live |

## Perubahan File

### Model presentasi dan komponen

- Buat `src/components/keluarga/task-detail/task-detail-presentation.ts` untuk reference pendek, sanitasi marker demo, step lifecycle, copy next-action, visibility action, interpretasi skor non-diagnostik, dan presentasi pembayaran.
- Buat primitive bersama di `src/components/keluarga/task-detail/` untuk header, stepper, next-action, context rail, jadwal/lokasi, laporan selesai, pembatalan, serta pembayaran.
- Refactor `src/components/keluarga/RealTaskDetailClient.tsx` menjadi orchestrator state-aware. Foto lansia menjadi identitas 72-96px dan foto Helper 48-56px.
- Rapikan `src/components/keluarga/TaskScheduleActions.tsx` agar memakai istilah Kunjungan dan hanya merender capability yang diizinkan status.
- Integrasikan `ExtraServiceApprovalCard` tanpa mengubah endpoint atau aturan harga.
- Selaraskan halaman pembayaran langsung dengan kelayakan yang sama. Jangan tampilkan checkout sebelum `dikonfirmasi`, `dikerjakan`, atau `selesai`.

### Data server

- Tambahkan field lifecycle yang memang tersedia pada `tasks`, identitas lansia yang tersedia, dan jumlah pelamar pada `src/app/(keluarga)/kunjungan/[id]/page.tsx`.
- Pertahankan pemeriksaan ownership memakai client user-scoped sebelum pembacaan server-scoped.
- Jangan membuat endpoint atau migrasi baru jika field yang dibutuhkan sudah ada.
- Perbaiki fallback rating pelamar yang saat ini memproduksi nilai `5.0` palsu.

### Test

1. Tambahkan regression test presentasi sebelum kode implementasi.
2. Pastikan seluruh status menghasilkan urutan lifecycle, headline, visibility, dan aksi yang benar.
3. Uji short reference, sanitasi marker demo, label skor, zero-rating, state dibatalkan, dan CTA pelamar.
4. Jalankan test spesifik untuk melihat RED, implementasi minimum, lalu jalankan suite hingga GREEN.

### Browser QA

- State nyata: persetujuan Koordinator, scheduled, dikerjakan, menunggu Keluarga, selesai, dan dibatalkan.
- State pelamar terbuka diverifikasi melalui presentasi/test dan browser bila seed tersedia tanpa merusak data demo.
- Viewport 375x812, 768x1024, 1024x768, dan 1440x900.
- Cek overflow, fokus keyboard, target 44px, 200% zoom, alamat/catatan panjang, foto hilang, Helper belum dipilih, bukti portrait/landscape, dan pembaruan status tanpa global flash.
- Simpan evidence di `docs/planning/extra/RANGKUL_DETAIL_KUNJUNGAN_EVIDENCE.md`.

## Quality Gate

Setelah perubahan terakhir:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test`
5. `npm run build`
6. `git diff --check`
7. audit workflow dan status CI setelah push

## Risiko dan Mitigasi

- **Data pembatalan atau lifecycle tidak lengkap:** hanya tampilkan metadata yang benar-benar tersedia, jangan mengarang tanggal atau status refund.
- **Admin client membocorkan data:** ownership tetap diverifikasi dengan client user-scoped sebelum query detail.
- **Polling menggeser layout:** refresh tidak menampilkan spinner global dan shell mempertahankan struktur; interval dibuat tidak agresif.
- **Over-card:** gunakan satu shell, divider, dan context rail, bukan card terpisah untuk setiap field.
- **Aksi salah status:** visibility diturunkan dari `TaskStatusPresentation` dan presentation config, sementara backend tetap otoritas akhir.

## Progress

- [x] Spesifikasi dan TDD dibaca penuh.
- [x] Audit source, state machine, dan halaman nyata sebelum coding.
- [x] Design read, design dials, dan batas skill dikunci.
- [x] Regression test ditulis dan RED diverifikasi.
- [x] Model presentasi dan primitive bersama selesai.
- [x] Server query dan jumlah pelamar selesai.
- [x] Orchestrator state-aware selesai.
- [x] Browser QA desktop untuk persetujuan Koordinator, terjadwal, dikerjakan, persetujuan Keluarga, selesai, dan dibatalkan selesai.
- [ ] Capture browser 375px dan 768px masih perlu karena automation browser yang tersedia tidak menyediakan viewport emulation; kontrak responsive source sudah dijalankan.
- [x] Evidence dan progress sprint diperbarui.
- [ ] Quality gate, commit, push, dan PR baru selesai.
