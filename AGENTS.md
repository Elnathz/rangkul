# AGENTS.md - Rangkul (Fullstack Flexible Scope)

Dokumen ini adalah **sumber kebenaran operasional** untuk semua AI Agent (OpenCode, Claude Code, Codex, Gemini) yang bekerja di repositori ini. Aturan di sini bersifat **mutlak (Non-Negotiable)** dan harus dipatuhi tanpa basa-basi untuk menjaga integritas sistem frontend, kepatuhan TDD, dan standar kode. File ini dibaca secara otomatis setiap kali sesi dimulai.

## 0. Sumber Kebenaran Tunggal

**`docs/TDD_Rangkul.md` adalah sumber kebenaran untuk seluruh keputusan bisnis, skema database, kontrak API, dan state machine.**

- Sebelum mengerjakan apa pun, baca bagian TDD yang relevan dengan tugas tersebut. Jangan mengasumsikan atau menebak aturan bisnis (persentase split pembayaran, threshold suspend, format status, dll) — semua sudah didefinisikan eksplisit di TDD.
- Kalau instruksi dari saya di suatu sesi tampak bertentangan dengan TDD, **berhenti dan tanyakan** dulu — jangan diam-diam memilih salah satu. Kemungkinan itu tandanya TDD perlu diupdate, bukan alasan untuk mengabaikannya.
- Kalau kamu membuat keputusan implementasi yang tidak eksplisit disebutkan di TDD (nama variabel internal, struktur folder, dll), itu boleh — tapi keputusan yang menyentuh business rule, skema, atau kontrak API **wajib** dicek dulu ke TDD, dan kalau memang tidak ada di sana, diusulkan sebagai perubahan ke TDD dulu sebelum diimplementasikan.

## 1. Scope: Fullstack Engineer

Project ini dikerjakan tim 2 orang. Peran saya sekarang fleksibel sebagai **fullstack**, dengan fokus awal frontend. Agent boleh menyelesaikan satu alur dari UI sampai route, validasi, RLS, migrasi, dan data demo bila tugas memang membutuhkan semuanya.

**Dalam scope:**

- Komponen UI, layout halaman, styling Tailwind CSS/Shadcn UI
- Desain visual, responsivitas, dan interaktivitas
- Form client-side, validasi UX, state loading/error/empty
- Integrasi API di browser menggunakan route API yang disediakan backend
- Alur pengguna tiap peran sesuai TDD §5 & §9
- Offline draft UI menggunakan IndexedDB (§3.13)
- Route handler, validasi server, dan integrasi Supabase yang secara langsung dibutuhkan oleh alur yang sedang dikerjakan
- Migrasi schema, policy RLS, dan migration data demo yang diperlukan agar kontrak TDD benar-benar berjalan
- Test untuk state machine, race condition, kontrak API, RLS, dan UI state yang berubah akibat alur tersebut

**Di luar scope default, jangan disentuh tanpa alasan yang jelas dari task:**

- Skema database, kebijakan RLS, migrasi Supabase
- Webhook Midtrans dan scheduled job yang tidak terkait langsung dengan alur yang sedang dikerjakan
- Perubahan besar ke domain lain yang tidak diperlukan oleh acceptance criteria task

Kalau suatu tugas membutuhkan perubahan kontrak backend, agent boleh mengerjakannya saat user meminta alur fullstack, tetapi wajib memperbarui TDD atau mencatat handoff bila keputusan bisnisnya belum didefinisikan. Jangan menghapus payload atau route hanya untuk menghilangkan error.

**Lokasi kode frontend:** halaman di `src/app/**` (kecuali `api/`), komponen di `src/components/`, hooks di `src/hooks/`, utils UI di `src/lib/utils.ts`.

### Wajib: Mobile-First

Semua UI wajib dirancang dan diimplementasikan mobile-first. Tampilan desktop adalah peningkatan bertahap melalui breakpoint, bukan sumber layout utama.

- Mulai dari viewport 375px dan pastikan tidak ada horizontal overflow.
- Uji minimal pada 375px, 768px, 1024px, dan 1440px sebelum fitur dianggap selesai.
- Tabel data wajib memiliki strategi mobile yang jelas, seperti kolom prioritas, kartu ringkas, atau scroll horizontal yang terkontrol.
- Tabs, filter, form, modal, dropdown, loading state, empty state, dan error state wajib tetap dapat digunakan dengan sentuhan dan keyboard.
- Target sentuh interaktif minimal 44x44px, label tidak boleh hanya bergantung pada placeholder, dan fokus keyboard harus terlihat.
- Jangan menyembunyikan aksi penting hanya pada hover atau membuat desktop layout yang dipaksa mengecil di layar mobile.

## 2. Wajib: Rencana Sebelum Implementasi

**Tidak boleh langsung menulis kode untuk pekerjaan sprint apa pun tanpa file rencana lebih dulu.**

Alur wajib setiap kali memulai unit kerja baru (biasanya per sprint, TDD §14):

1. Baca bagian sprint terkait di `docs/TDD_Rangkul.md` §14.
2. Baca `docs/planning/sprint{N-1}/plan.md` (sprint sebelumnya) kalau ada, untuk konteks apa yang sudah selesai.
3. Tulis `docs/planning/sprint{N}/plan.md` berisi:
   - **Scope**: FR-ID dan nomor bagian TDD mana saja yang dikerjakan sprint ini
   - **Breakdown file**: file mana yang akan dibuat/diubah
   - **Perubahan database**: migrasi apa yang dibutuhkan
   - **Endpoint API** yang dibangun (rujuk TDD §7)
   - **Pendekatan testing**
   - **Risiko/pertanyaan terbuka** khusus sprint ini
4. Baru setelah file rencana ini ada, mulai implementasi.

Kalau plugin **Superpowers** terpasang (§5), gunakan skill penulisan rencananya sebagai mekanisme untuk membuat `plan.md` ini — jangan bikin proses perencanaan terpisah yang tumpang tindih dengan skill yang sudah ada.

Untuk task kecil di luar siklus sprint (bug fix, refactor kecil), rencana cukup singkat (3-5 baris) langsung di awal percakapan sebelum implementasi — tidak perlu file terpisah.

## 3. Gaya Penulisan: Nol AI Slop

Berlaku untuk komentar kode, pesan commit, deskripsi PR, dan dokumentasi yang dihasilkan — bukan cuma UI copy (yang sudah diatur TDD §13).

**Dilarang:**

- Tanda hubung panjang (—) di mana pun. Pakai titik, koma, atau susun ulang kalimatnya.
- Emoji di kode, commit message, atau UI copy. Kalau butuh indikator visual di UI, pakai komponen icon (Lucide via Shadcn UI) — bukan karakter emoji Unicode.
- Bahasa kaku/formal berlebihan ala AI ("Perlu dicatat bahwa...", "Dalam rangka untuk...", "Berikut adalah implementasi yang telah saya buat...").
- Kalimat pembuka basa-basi ("Tentu!", "Baik, saya akan...") di commit message atau dokumentasi.
- Komentar kode generik yang cuma mengulang apa yang sudah jelas dari kode itu sendiri (`// increment counter` di atas `i++`). Komentar hanya untuk menjelaskan **kenapa**, bukan **apa**.

**Format commit message:** aturan lengkap ada di §4, bukan cuma tipe Conventional Commits saja — ada juga taksonomi scope dan kewajiban footer rujukan TDD.

**Penamaan:** field database & endpoint API di TDD sengaja pakai Bahasa Indonesia (`harga_dasar`, `koordinator_id`, `dikonfirmasi`, dst). Pertahankan penamaan itu persis seperti di TDD §6-7 — jangan "diperbaiki" jadi Inggris demi konvensi umum. Konsistensi dengan dokumen lebih penting daripada idiom penamaan standar.

## 4. Konvensi Commit & Branch

Struktur branch sudah nyata di repo: `main`, `develop`, dan cabang fitur sudah push ke origin. Alur CI/heartbeat didefinisikan di TDD §2.3 (push ke `main`/`develop`, PR ke `main`) sebagai quality gate sebelum Vercel auto-deploy, tapi workflow `.github/` **belum ada di repo** — buat sesuai TDD §2.3 saat mengaktifkan CI.

### Branch

- Kerja di branch fitur: `feature/<scope>-<deskripsi-singkat>` — contoh `feature/tasks-conditional-accept`.
- Push/merge ke `develop` untuk integrasi harian.
- `develop` → `main` **hanya** lewat Pull Request, tidak pernah push langsung ke `main`. Ini yang memicu CI quality gate (§2.3) sebelum Vercel auto-deploy ke production.

### Format Commit

```
<type>(<scope>): <subject>

<body — opsional, wajib untuk commit yang menyentuh business rule>

Refs: TDD §<nomor>, FR-<ID>   ← wajib untuk commit yang menyentuh §3, §6, atau §7
```

**Type**: `feat`, `fix`, `refactor`, `chore`, `test`, `docs`, `perf`.

**Scope**: dipetakan ke domain TDD, bukan bebas pilih sendiri — supaya histori commit gampang ditelusuri balik ke bagian TDD yang terpengaruh.

| Scope             | Domain TDD                                            |
| ----------------- | ----------------------------------------------------- |
| `auth`            | §4.1 — autentikasi & akun                             |
| `lansia`          | §4.2 — profil lansia                                  |
| `helper`          | §4.3, §3.3.1, §3.3.3 — profil & trust tier Helper     |
| `koordinator`     | §3.3.1 - §3.3.4 — verifikasi wilayah & model approval |
| `tasks`           | §3.1 - §3.2, §4.5 — state machine & booking           |
| `payment`         | §3.4, §3.8 — escrow & kompensasi                      |
| `riwayat-rangkul` | §3.12 — Health Snapshot & Memory Capsule              |
| `laporan`         | §3.10 — sistem laporan & suspend                      |
| `offline`         | §3.13 — sinkronisasi (sisi backend)                   |
| `admin`           | §4.12 — panel Admin                                   |
| `rls`             | §8 — kebijakan Row Level Security                     |
| `seed`            | §19 — data seeder                                     |
| `ci`              | §2.3 — workflow GitHub Actions                        |

**Subject**: imperatif, huruf kecil, tanpa titik di akhir, ringkas. Tunduk ke aturan nol-AI-slop di §3 — tidak ada tanda hubung panjang, tidak ada basa-basi pembuka.

**Body**: jelaskan **kenapa**, bukan **apa** — diff sudah menunjukkan apa yang berubah. Wajib diisi kalau commit menyentuh business rule di §3.

**Footer `Refs`**: wajib untuk setiap commit yang mengimplementasikan atau mengubah business rule (§3), skema tabel (§6), atau endpoint API (§7). Ini yang membuat histori commit bisa dipakai balik untuk audit kesesuaian implementasi terhadap TDD — bukan formalitas kosong.

### Contoh

```
feat(tasks): tambah conditional update untuk penerimaan tugas

Mencegah dua Helper menerima tugas yang sama secara bersamaan.

Refs: TDD §3.2, FR-TSK-02
```

```
fix(payment): perbaiki perhitungan split saat pembatalan berkompensasi

Helper share sebelumnya dihitung dari harga_dasar, seharusnya dari
harga_final setelah Layanan Tambahan disetujui.

Refs: TDD §3.8, FR-PAY-09
```

```
chore(ci): tambah workflow heartbeat Supabase

Refs: TDD §2.3
```

```
refactor(koordinator): pisah logika notifikasi pasif dari alur approval
```

### Aturan Tambahan

- Satu commit, satu perubahan logis. Jangan gabung perubahan `payment` dan `riwayat-rangkul` dalam satu commit hanya karena dikerjakan berurutan.
- Commit yang menyentuh tabel di §6 atau endpoint di §7 wajib punya footer `Refs`, tidak ada pengecualian.

## 5. Skill yang Wajib Dipasang

Sesuai TDD §18. Simpan di `.agents/skills/<nama-skill>/SKILL.md`. Folder `.agents/skills/` saat ini belum ada di repo — skill dibuat per kebutuhan, sebelum mengerjakan bagian terkait (aturan di poin terakhir bagian ini).

> Kalau rekan tim ada yang pakai Claude Code untuk bagian lain, symlink supaya skill yang sama kepakai di kedua tool:
>
> ```bash
> ln -s .agents/skills .claude/skills
> ```

**Plugin pihak ketiga:**

- **Superpowers** — dipakai untuk penulisan rencana (§2), siklus TDD merah-hijau-refactor, debugging sistematis. Paling relevan untuk logika rawan bug: state machine (§3.1-3.2), model approval (§3.3.2), pembayaran/kompensasi (§3.4/§3.8).
- **Impeccable** — jalankan sebagai review setelah tiap fitur UI selesai, sebelum dianggap "done". Instalasi project berada di `.agents/skills/impeccable/` dan design hook aktif melalui `.agents`.
- **ui-ux-pro-max** — wajib dipakai untuk pekerjaan UI, UX, responsivitas, aksesibilitas, visual review, dan keputusan design system. Simpan hasil design system hanya jika memang dibuat untuk perubahan UI yang sedang dikerjakan.

**Skill kustom (buat sesuai TDD §18.2, prioritaskan sesuai urutan sprint):**

- `rangkul-state-machine` — status tugas, conditional update anti-race-condition
- `rangkul-approval-model` — verifikasi orang vs approval bertingkat, radius layanan
- `rangkul-payment-rules` — split 90/7/3, fix price + Layanan Tambahan, kompensasi pembatalan
- `rangkul-trust-safety` — trigger 2-laporan, verifikasi dokumen
- `rangkul-riwayat-rangkul` — Health Snapshot, Memory Capsule, dan badge tren rule-based
- `rangkul-rls-policy` — pola RLS Supabase konsisten per tipe tabel
- `rangkul-api-conventions` — konvensi endpoint & format response dari TDD §7

Kalau sebuah skill yang relevan belum ada filenya, buat dulu sebelum mengerjakan bagian terkait — jangan kerjakan dari ingatan/asumsi.

## 6. Perintah

```
dev:        npm run dev
build:      npm run build    (Next menjalankan type check sendiri)
lint:       npm run lint     (eslint, tanpa --fix)
start:      npm run start
```

### Quality gate sebelum commit

CI wajib dijalankan sebelum setiap commit. Jalankan seluruh pemeriksaan berikut dari root repository dan jangan membuat commit jika salah satunya gagal:

```
npm run lint
npm run typecheck
npm run test
npm run build
```

Urutan ini mengikuti workflow `.github/workflows/ci.yml`. Hasil pemeriksaan harus diverifikasi ulang setelah perubahan terakhir, bukan memakai hasil dari sebelum perubahan.

### Menjaga build Vercel tetap konsisten

Build lokal harus memakai lockfile yang sama dengan Vercel. Sebelum commit yang akan dipush, jalankan:

```
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Jangan memakai `npm install` untuk quality gate karena dapat mengubah `package-lock.json`. Pastikan dependency font, icon, dan asset yang dibutuhkan build tersedia di `package.json` dan lockfile. Hindari dependency build-time yang membutuhkan akses jaringan eksternal, termasuk `next/font/google`; gunakan package font lokal bila font harus selalu tersedia di Vercel. Project ini membutuhkan Node.js 22.6 atau lebih baru karena test memakai `--experimental-strip-types`. Jika `npm run build` gagal, commit dan push harus dihentikan sampai error diperbaiki.

Workflow deploy juga membutuhkan secret GitHub Actions berikut pada environment `production` atau repository settings: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, dan `VERCEL_PROJECT_ID`. Jangan menaruh nilainya di source code atau file environment yang di-commit.

Workflow `Supabase Heartbeat` memakai environment `production` dan membutuhkan `SUPABASE_PROJECT_ID` serta `SUPABASE_SERVICE_ROLE_KEY`. Project ref untuk environment demo berasal dari URL Supabase, sedangkan service role key hanya disimpan sebagai GitHub Actions secret dan tidak pernah ditulis ke source code.

**Script yang belum ada di package.json, jangan berasumsi tersedia:**

- `test` — tidak ada test framework terpasang sama sekali.
- `typecheck` — CI TDD §2.3 memakainya; untuk sekarang jalankan `npx tsc --noEmit` (typescript ada di devDependencies).
- `seed` — TDD §19.7 menargetkan satu perintah `npm run seed` (service role key, lokal/CI saja), belum dibuat.

### Supabase local

CLI `supabase` terpasang sebagai devDependency (v2.111.0); project dikonfigurasi di `supabase/config.toml`.

```
npx supabase start       (API :54321, DB :54322, Studio :54323)
npx supabase db reset    (jalankan semua migrasi + seed.sql)
npx supabase db diff     (buat file migrasi baru di supabase/migrations/)
npx supabase db push     (terapkan migrasi ke remote)
```

Migrasi berupa file SQL bertimestamp di `supabase/migrations/` (skema awal dan seed sudah ada, jalankan `db reset` untuk apply). Penamaan tabel/kolom di TDD §6 memakai Bahasa Indonesia (`harga_dasar`, `koordinator_id`, `dikonfirmasi`) — pertahankan persis, jangan diterjemahkan ke Inggris.

## 7. Non-Negotiable

- RLS aktif di setiap tabel data pribadi, diuji eksplisit — bukan diasumsikan aman (TDD §16).
- Race condition tugas selalu lewat conditional update di database, tidak pernah pola baca-lalu-tulis (TDD §3.2).
- Validasi input 4 lapis: Zod client, Zod server, constraint database, RLS (TDD §2).
- Jangan menambah state atau field baru ke luar yang sudah didefinisikan TDD §6 tanpa mengupdate dokumen itu dulu.
- **PENTING**: "jangan apa apa tu hapus routes lah, tambah di db/alter table kek kalo emang gaada di db". Jika terjadi error tipe data karena kolom tidak ada di database, prioritaskan membuat migrasi/alter table dan me-regenerate types (`src/types/database.ts`), BUKAN dengan menghapus payload dari route API secara sepihak.

- **CI/CD & Workflows**: Pastikan untuk memeriksa .github/workflows dan melakukan pengecekan CI saat melakukan validasi (termasuk mengecek status CI).
