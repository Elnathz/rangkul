# UI/UX Restructure Coordination Plan for Sprint 5 and Sprint 6

> **Untuk pelaksana:** jalankan rencana ini secara inline, tanpa subagent. Rencana ini menambah urutan kerja UI/UX di atas rencana release yang sudah ada. File `docs/planning/sprint5/plan.md` dan `docs/planning/sprint6/plan.md` tetap menjadi sumber tugas hardening, kontrak mode penugasan, migration, RLS, dan release gate.

**Status:** aktif, dibuat 3 September 2026.

**Goal:** merapikan pengalaman produk Rangkul tanpa menghapus, menunda tanpa catatan, atau mengubah scope Sprint 5 dan Sprint 6. Redesign memperbaiki shell, navigasi, dashboard, landing, status, dan pricing display. Sprint 5 tetap menyelesaikan baseline hardening. Sprint 6 tetap menyelesaikan mode `pelamar` dan `cepat` di balik feature flag.

**Architecture:** UI restructuring adalah workstream pendahulu yang mengubah presentasi dan rute canonical, bukan state machine atau aturan data. Semua mutation Sprint 5 dan Sprint 6 tetap memakai route, RPC, RLS, Zod, dan test runtime yang ditetapkan oleh rencana asal. Shared navigation dan task presentation dibangun lebih dulu agar vertical slice Sprint 6 tidak menambah kembali UI lama.

**Tech Stack:** Next.js App Router, TypeScript, React, Tailwind CSS, shadcn/Base UI, Lucide, Framer Motion, Supabase, Zod, dan Node test runner.

**Spec:** `docs/TDD_Rangkul.md` §2, §3.1-§3.4, §3.10, §3.12-§3.14, §4.5, §4.12, §5, §7-§9, §13, §14 Sprint 5-6, §16, §18, §19; `docs/planning/sprint5/plan.md`; `docs/planning/sprint6/plan.md`.

## Progress Update 3 September 2026

Status di bawah membedakan implementasi yang sudah ada dari work yang masih harus dibuktikan. Tidak ada status hijau yang dipakai sebagai pengganti visual QA, runtime RLS, atau release gate.

| Workstream | Status | Yang sudah dikerjakan | Yang masih wajib dikerjakan |
| --- | --- | --- | --- |
| U0. Kontrak presentasi | Selesai implementasi | Konfigurasi navigasi per peran, active-route prefix terpanjang dan alias legacy, `TaskStatusPresentation`, serta larangan pembatalan Keluarga setelah `dikerjakan`. Contract test tersedia. | Regression state machine dan commit terpisah belum dicatat. |
| U1. Design system dan shell | Sebagian besar selesai | Instrument Sans lokal untuk body, Plus Jakarta Sans untuk heading, token light/dark, top nav Keluarga dan Helper, mobile bottom navigation maksimal lima item, logo Rangkul yang terbaca, liquid-glass bottom navigation, dan active indicator Framer Motion 220 ms dengan reduced-motion fallback. Escape dan body-scroll lock ada pada drawer. | Fokus terperangkap di drawer, penyeragaman sidebar Koordinator/Admin, serta sweep raw color lama di halaman domain belum selesai. |
| U2. Dashboard dan route | Sebagian selesai | Overview `/lansia`, dashboard Keluarga, Helper, Admin, dan Koordinator berbasis prioritas aksi, toggle availability Helper, Penghasilan Helper via query peserta pembayaran, statistik Admin kompatibel, dan canonical `/koordinator/persetujuan`. | Redirect legacy `/tugas` dan `/koordinator/antrean-persetujuan` masih perlu diselesaikan secara penuh. Semua dashboard juga belum memperoleh bukti visual semua state dan breakpoint. |
| U3. Landing dan pricing | Sebagian selesai | Landing menghapus ranking, testimoni, dan metrik fiktif; menambah preview Riwayat Rangkul yang berlabel contoh; test truth landing tersedia. | Audit seluruh ringkasan harga untuk PPN dan biaya layanan fiktif, contract test pricing, serta visual QA landing belum selesai. |
| U4. Evidence dan handoff | Belum selesai | Detector Impeccable sudah dijalankan pada Navbar, bottom navigation, beranda Keluarga, dashboard Koordinator, dan token CSS tanpa temuan untuk target tersebut. | Screenshot 375px, 768px, 1024px, 1440px, keyboard-only, zoom 200 persen, reduced motion, seluruh data state, evidence file, full release gate, dan commit dokumentasi. |

### Verifikasi yang sudah dilakukan pada perubahan terbaru

- Contract test navigasi brand, status Keluarga, dan prioritas Koordinator hijau.
- `npm run typecheck` hijau.
- `npm run lint` selesai tanpa error baru, namun repository masih memiliki warning lama di luar target perubahan.
- `git diff --check` tidak menemukan whitespace error.
- Full `npm run test`, `npm ci`, `npm run build`, runtime RLS, dan CI status harus diulang setelah perubahan terakhir sebelum kandidat release dibuat.

### Status visual dan warna

| Token atau warna | Nilai | Pemakaian yang dikunci |
| --- | --- | --- |
| Primary Rangkul | `#0D47A1` | CTA utama, indikator active, heading brand, dan satu surface hero per dashboard. |
| Sky Rangkul | `#90CAF9` | Surface pendukung yang tenang, panel Riwayat Rangkul, dan konteks sekunder. |
| Background | `#F5F8FC` | Latar aplikasi yang sedikit bernuansa biru agar white card tetap terbaca. |
| Ink | `#16233A` | Teks utama pada light theme. |
| Muted | `#6B7A90` | Deskripsi dan informasi sekunder, bukan aksi utama. |
| Border | `#DCE6F1` | Pemisah ringan antarsurface. |

Aturan pemakaian: biru utama tidak dipakai pada semua card. Ia hanya menandai konteks, aksi utama, dan pilihan aktif. Halaman operasional memakai white atau blue-gray surface agar angka, status, dan tindakan tetap mudah dipindai. Liquid glass hanya dipakai pada bottom navigation berdasarkan permintaan eksplisit, bukan sebagai efek dekoratif global.

Normalisasi belum tuntas: halaman lama masih memiliki kelas `blue-*`, `slate-*`, dan hex hardcoded. Ini harus diselesaikan lewat color sweep bertahap setelah pricing dan redirect canonical, bukan dengan mengganti massal tanpa visual QA.

## Kedudukan Dokumen dan Urutan Release

| Dokumen | Tetap bertanggung jawab atas | Status setelah plan ini dibuat |
| --- | --- | --- |
| `sprint5/plan.md` | feature flag, wallet, RLS, storage, commission, release candidate, runtime verification | Tetap wajib dan tidak diubah |
| `sprint6/plan.md` | `pelamar`, `cepat`, RPC eligibility, migration, privacy projection, seed, notification | Tetap wajib dan tidak diubah |
| `sprint5/ui-ux-restructure-plan.md` | shell, visual hierarchy, canonical route, dashboard, landing, shared status, pricing display, visual QA | Dokumen tambahan yang mengatur urutan dan acceptance UI |

1. U0 sampai U4 di dokumen ini dikerjakan terlebih dahulu untuk membangun baseline UI yang konsisten.
2. G0 dan G1 dari `sprint5/plan.md` berjalan sebelum feature flag Sprint 6 diaktifkan.
3. Task 2 sampai Task 4 dari `sprint5/plan.md`, serta seluruh vertical slice `sprint6/plan.md`, memakai shell, status map, dan canonical route dari workstream ini.
4. G4 dan Task 5 Sprint 5 tetap menjadi release gate tunggal. Redesign tidak boleh dipakai sebagai alasan melewati test runtime, RLS, race-condition, seed, atau build.

## Global Constraints

- Tidak ada subagent.
- Tidak ada penghapusan `sprint5/plan.md`, `sprint6/plan.md`, route API, migration, atau payload untuk menyelesaikan error UI.
- `SPRINT6_MATCHING_ENABLED` tetap `false` sampai G4 Sprint 5 lengkap dan dibuktikan runtime.
- Mulai dari 375px. Verifikasi 768px, 1024px, dan 1440px, keyboard-only, zoom 200 persen, loading, empty, error, forbidden, conflict, retry, serta target sentuh 44x44px.
- Gunakan `@ui-ux-pro-max` sebelum setiap perubahan UI. Gunakan Impeccable sebagai visual dan accessibility gate. `gpt-taste` dan `design-taste-frontend` berlaku pada landing dan anti-slop review, bukan untuk memaksakan AIDA atau GSAP pada dashboard operasional.
- Brand tetap `#0D47A1` dan `#90CAF9`. Heading memakai Plus Jakarta Sans, body memakai Instrument Sans lokal. Light theme menjadi scope submission.
- Tidak ada testimonial, rating, ranking, estimasi pendapatan, pajak, biaya layanan, ETA, atau klaim response time yang tidak berasal dari data dan aturan TDD.
- TDD tetap sumber kebenaran. Harga final berasal dari server dan tidak boleh ditambah PPN atau biaya rekaan di browser.

## Task U0: Baseline, Design Gate, dan Kontrak Presentasi

**Files:**

- Create: `docs/planning/sprint5/ui-ux-restructure-plan.md`
- Create: `src/lib/navigation/role-navigation.ts`
- Create: `src/lib/tasks/task-status-presentation.ts`
- Modify: `src/lib/constants/task-status.ts`
- Test: `tests/navigation-contract.test.mjs`, `tests/task-status-presentation.test.mjs`

**Interfaces:**

```ts
export type AppRole = "keluarga" | "helper" | "koordinator" | "admin";

export type NavigationItem = {
  href: string;
  label: string;
  icon: "home" | "calendar" | "users" | "wallet" | "message" | "shield";
  aliases?: readonly string[];
};

export type TaskStatusPresentation = {
  label: string;
  description: string;
  tone: "neutral" | "info" | "warning" | "success" | "danger";
  actions: Partial<Record<AppRole, readonly string[]>>;
};

export function isNavigationItemActive(
  pathname: string,
  item: NavigationItem,
): boolean;
```

- [ ] Tulis test yang membuktikan active-route menggunakan prefix terpanjang, alias legacy aktif pada canonical item, dan route yang hanya memiliki awalan teks sama tidak ikut aktif.
- [ ] Tulis test yang membuktikan setiap status TDD memiliki label Indonesia, deskripsi, tone, dan aksi per role; `dikerjakan` tidak memiliki aksi pembatalan Keluarga.
- [ ] Jalankan test baru dan pastikan gagal sebelum implementasi.
- [ ] Implementasikan navigation config per role dan presentation map tunggal. Hapus `dikerjakan -> dibatalkan` dari daftar transisi UI yang salah.
- [ ] Jalankan test baru sampai hijau, kemudian jalankan regression test state machine yang sudah ada.
- [ ] Commit terpisah: `refactor(tasks): satukan presentasi status dan navigasi per peran`.

## Task U1: Design System dan App Shell

**Files:**

- Modify: `package.json`, `package-lock.json`, `src/app/globals.css`
- Create: `src/components/layout/AppNavigation.tsx`, `src/components/layout/MobileBottomNavigation.tsx`, `src/components/layout/RoleSidebar.tsx`
- Modify: `src/components/layout/Navbar.tsx` atau pecah menjadi primitive yang dipakai ulang
- Test: `tests/navigation-contract.test.mjs`

- [ ] Tambahkan package font Instrument Sans lokal dan map `--font-instrument` ke font tersebut. Plus Jakarta Sans tetap khusus heading.
- [ ] Tambahkan token semantic untuk surface, teks, border, success, warning, danger, focus ring, radius, spacing, dan safe-area padding. Token dark dipertahankan tanpa membuat toggle dark-mode baru.
- [ ] Implementasikan desktop top navigation untuk Keluarga dan Helper, mobile bottom navigation maksimal lima item untuk keduanya, serta sidebar desktop dan drawer mobile untuk Koordinator dan Admin.
- [ ] Gunakan Lucide untuk ikon navigasi. Hapus SVG dekoratif yang dipakai sebagai ikon interaktif pada shell yang disentuh.
- [ ] Drawer harus mendukung Escape, focus order yang benar, visible focus, dan lock scroll. Tidak ada aksi penting yang tersimpan di hover-only control.
- [ ] Jalankan lint dan test navigation sebelum melanjutkan dashboard.
- [ ] Commit terpisah: `feat(ui): bangun shell mobile-first per peran`.

## Task U2: Canonical Route dan Dashboard Operasional

**Files:**

- Modify: dashboard Keluarga, Helper, Koordinator, dan Admin di `src/app/`
- Create: overview lansia pada `src/app/(keluarga)/lansia/page.tsx`
- Modify: route Helper dan Koordinator yang saat ini placeholder atau legacy redirect
- Modify: `src/app/api/helper/profile/route.ts`, `src/lib/validations/helper.ts`, `src/app/api/admin/stats/route.ts`
- Test: `tests/helper-profile-contract.test.mjs`, `tests/admin-stats-contract.test.mjs`, `tests/canonical-route-contract.test.mjs`

- [ ] Tulis contract test untuk `PATCH /api/helper/profile` dengan `is_available?: boolean`, termasuk validasi Zod dan respons authenticated. Eligibility Sprint 6 tetap direcheck di boundary RPC.
- [ ] Tulis contract test untuk response tambahan statistik Admin: Koordinator pending, Helper `under_review`, laporan pending, dan banding pending. Field lama tidak boleh hilang.
- [ ] Buat `/lansia` sebagai daftar lansia Keluarga dengan CTA tambah yang tidak menduplikasi tombol dashboard.
- [ ] Pindahkan konten task board ke `/helper/tugas` dan jadikan `/tugas` beserta detail lamanya redirect kompatibel. Pisahkan peluang eligible ke `/helper/tugas/baru` dan tugas milik Helper ke `/helper/tugas`.
- [ ] Pindahkan konten persetujuan Koordinator ke `/koordinator/persetujuan`; `/koordinator/antrean-persetujuan` tetap redirect. Jangan tampilkan `/koordinator/pengawasan` bila masih placeholder.
- [ ] Implementasikan Penghasilan Helper dari `helper_profiles.saldo_tersedia` dan payment participant-scoped. Jangan buat endpoint baru jika query RLS sudah dapat memberikan data yang sama.
- [ ] Susun dashboard Keluarga: kunjungan aktif, Riwayat Rangkul, lansia, ringkasan. Susun dashboard Helper: verifikasi, availability, tugas berikutnya, tindakan, saldo, tugas selesai. Susun Koordinator dan Admin dengan action inbox sebelum metrik platform.
- [ ] Gunakan `TaskStatusPresentation` untuk badge, copy, dan action availability. Tombol cancel tidak boleh muncul setelah status `dikerjakan`.
- [ ] Jalankan contract test, state machine regression, lint, dan responsive smoke test 375px serta 1440px.
- [ ] Commit terpisah per domain: `feat(lansia): tambah overview lansia`, `feat(helper): rapikan dashboard dan penghasilan`, `feat(koordinator): utamakan antrean tindakan`, `feat(admin): utamakan moderasi dan antrean`.

## Task U3: Landing, Trust Copy, dan Pricing Display

**Files:**

- Modify: `src/app/page.tsx`, `src/components/landing/`
- Modify: booking dan detail Keluarga yang menampilkan komponen harga
- Test: `tests/landing-truth-contract.test.mjs`, `tests/pricing-display-contract.test.mjs`

- [ ] Tulis test statis yang menolak klaim `100%`, rating `4.8`, `<1 jam`, estimasi pendapatan, PPN 11 persen, service fee Rp2.500, avatar remote acak, serta link menuju route placeholder dari landing atau footer.
- [ ] Susun ulang landing menjadi hero, trust strip, cara kerja, kategori layanan, Riwayat Rangkul, verifikasi komunitas, role entry, CTA akhir, dan footer.
- [ ] Hero hanya memiliki CTA utama “Buat Kunjungan” dan CTA sekunder “Lihat Cara Kerja”. Hapus search bar, helper ranking, dan testimoni yang tidak terverifikasi.
- [ ] Riwayat Rangkul harus diberi label “Contoh tampilan”, memakai data contoh non-diagnostik, dan tidak menyiratkan data lansia nyata.
- [ ] Daftar kategori memakai data aktif bila tersedia atau fallback yang persis mengikuti TDD. Tidak ada metric pemasaran dari data dummy.
- [ ] Ubah setiap summary harga menjadi `harga_dasar`, layanan tambahan yang disetujui, dan `harga_final` dari server. Tip yang sudah ada tetap terpisah dan tidak ditambahkan ke harga kunjungan.
- [ ] Jalankan test truth/pricing, lalu lakukan visual review 375px, 768px, 1024px, dan 1440px.
- [ ] Commit terpisah: `feat(ui): restrukturisasi landing berbasis kepercayaan` dan `fix(payment): tampilkan harga kunjungan yang otoritatif`.

## Task U4: UI Evidence dan Handoff ke Gate Sprint 5-6

**Files:**

- Create: `docs/planning/sprint5/ui-ux-evidence.md`
- Modify: test files yang relevan bila visual audit menemukan regresi logika

- [ ] Jalankan Impeccable detector pada target UI yang berubah, kumpulkan temuan, perbaiki dalam satu batch, lalu lakukan satu pass konfirmasi.
- [ ] Catat screenshot dan hasil QA di 375px, 768px, 1024px, dan 1440px untuk landing, Keluarga, Helper, Koordinator, dan Admin.
- [ ] Catat hasil keyboard-only, zoom 200 persen, reduced motion, loading, empty, error, forbidden, conflict, retry, nama panjang, alamat panjang, dan badge `99+`.
- [ ] Setelah U0-U4 hijau, lanjutkan tanpa menghapus task mana pun pada G0-G4 Sprint 5. Hanya setelah G4 hijau Sprint 6 dapat diaktifkan untuk candidate.
- [ ] Jalankan `npm run lint`, `npm run typecheck`, `npm run test`, dan `npm run build` setelah perubahan UI terakhir.
- [ ] Commit: `docs(ui): catat bukti redesign dan gate release`.

## Release Matrix

| Waktu | UI/UX Workstream | Sprint 5 | Sprint 6 |
| --- | --- | --- | --- |
| 3 Sep | U0, U1 | G0 baseline | Flag tetap off |
| 3-4 Sep | U2 dashboard dan rute | G1 hardening | Kontrak dan migration tetap mengikuti Task 2 |
| 4 Sep | U3 landing dan pricing | G2 contract | Pelamar dan cepat dapat dihubungkan ke shell baru |
| 4-5 Sep | U4 visual QA | G3 vertical slice | Privacy, race, expiry, notification, seed, responsive QA |
| 5 Sep 15.00 | Bukti UI lengkap | G4 release verification | Regression dan feature-flag proof |
| 5 Sep 18.00 | Tidak ada perubahan fitur | Go/no-go | Flag hanya diaktifkan bila semua evidence hijau |
| 6 Sep | Smoke test production | Submission only | Submission only |

## Final Acceptance

1. Kedua dokumen Sprint 5 dan Sprint 6 tetap ada, dapat dibaca, dan semua task-nya masih menjadi release requirement.
2. Tidak ada nav aktif yang mengarah ke placeholder atau kehilangan active state pada nested route.
3. Keluarga tidak dapat melihat aksi pembatalan setelah tugas `dikerjakan`.
4. Harga yang terlihat di browser tidak menambah PPN atau biaya fiktif.
5. Landing tidak memakai klaim, metric, testimonial, ranking, atau pendapatan yang tidak terverifikasi.
6. Mode `pelamar` dan `cepat` tetap ditutup feature flag sampai baseline, runtime RLS, race, privacy, seed, UI, lint, typecheck, test, dan build lulus.
7. Tidak ada release candidate yang dibuat hanya berdasarkan screenshot. Evidence runtime yang diwajibkan Sprint 5 tetap menjadi syarat go/no-go.
