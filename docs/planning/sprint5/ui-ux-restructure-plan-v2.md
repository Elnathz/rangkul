# Rangkul UI/UX Restructure & Visual Quality Gate — v2.0

> **Dokumen ini menggantikan plan UI/UX sebelumnya sebagai source of truth untuk presentasi, shell, navigasi, dashboard, landing, spacing, radius, typography, responsive behavior, accessibility, dan visual QA.**
> `docs/planning/sprint5/plan.md` dan `docs/planning/sprint6/plan.md` tetap menjadi source of truth untuk hardening, migration, RLS, RPC, race-condition, feature flag, seed, runtime test, dan release gate.

**Status:** ACTIVE — Revised 3 September 2026
**Working branch:** `dev-eln`, merge target `develop`
**Repository:** `Elnathz/rangkul`
**Primary spec:** `docs/TDD_Rangkul.md`
**Tujuan:** membuat Rangkul terasa seperti produk digital yang matang, dipercaya, mudah dipahami, dan purpose-built untuk masing-masing role — bukan sekadar satu template dashboard yang diganti labelnya.

---

## Progress Update 4 September 2026

This table separates code that exists from acceptance. No workstream below is accepted until its visual, accessibility, responsive, and release gates have evidence.

| Workstream               | Implementation status                    | Remaining acceptance work                                                                                                                                                                                                                                                                                                                            |
| ------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U0 Presentation contract | Implemented, re-verification in progress | Re-run route, status, and action regression after shell changes.                                                                                                                                                                                                                                                                                     |
| U1 Tokens and app shell  | Implemented, not accepted                | Exact v2 color, spacing, radius, elevation, and shell-height tokens now exist. Family/Helper retain top and bottom navigation. Admin/Koordinator share a 256px desktop sidebar, compact topbar, and focus-trapped mobile drawer. Source contracts and targeted lint/typecheck pass. Four-viewport, keyboard, zoom, and long-content evidence remain. |
| U2 Keluarga              | Partially implemented                    | Active visit and Riwayat Rangkul hierarchy need v2 visual/state acceptance across all viewports.                                                                                                                                                                                                                                                     |
| U3 Helper                | Implemented, not accepted                | Next-task-first hierarchy, accessible availability switch, and an actual service-coverage panel now use the Helper's own radius, domicile, and selected categories. Copy no longer exposes implementation jargon. Four-viewport, keyboard, long-content, and mutation-state evidence remain.                                                         |
| U4 Koordinator           | Implemented, not accepted                | Shared operational shell, compact regional context header, action queue, factual activity feed, and Helper overview are implemented. UI source contracts and targeted lint/typecheck pass. Full state and viewport evidence remain.                                                                                                                  |
| U5 Admin                 | Implemented, not accepted                | The isolated admin layout is replaced with the shared operational shell. A moderation-first action grid, quieter platform metrics, and human-readable audit activity are implemented. Source contracts and targeted lint/typecheck pass. Full visual/state acceptance evidence remains.                                                             |
| U6 Landing               | Implemented, partial visual QA            | Story follows problem, visit, service, Riwayat Rangkul, trust controls, role entry, and final CTA. The public navbar now exposes five matching section anchors with desktop and mobile scroll-spy. Browser QA passes overflow at 375, 768, 1024, and 1440 plus drawer Escape and focus return. Saved screenshots and 200 percent zoom remain. |
| U7 Pricing audit         | Implemented, not accepted                | Booking starts from `harga_dasar`; only approved extra services affect `harga_final`; browser no longer computes a Helper share; tip is hidden and its route is inert until it has an approved TDD model. Re-run full regression and runtime payment gates.                                                                                              |
| U8 Evidence              | In progress                              | The previous unverified PASS claims were replaced by an honest pending matrix. Capture real 375, 768, 1024, and 1440 review before acceptance.                                                                                                                                                                                                          |

Current verified source checks after this update: `npm run lint` exits 0 with 60 non-blocking warnings, `npm run typecheck` passes, the serial full suite reports 261 passed and 14 cloud-runtime skips from 275 tests, and `next build` completes all 91 pages. `npm ci` reached cache extraction but exited `ENOSPC`; `npm ls --depth=0` is valid after recovery, but a clean-runner `npm ci` remains required. The user opted out of Impeccable for this iteration, so no Impeccable result is counted. Landing and all four authenticated dashboard roles now have browser evidence at four viewports. Saved screenshots, 200 percent zoom, exhaustive negative states, preview dry run, and production smoke remain mandatory before release acceptance.

Acceptance update on 5 September 2026 supersedes the older `Remaining acceptance work` cells above. Landing, Keluarga, Helper, Koordinator, and Admin have now been exercised in the browser at CSS widths 375px, 768px, 1024px, and 1440px without horizontal overflow. Keluarga and Helper pass the 44px interactive-target scan. The Koordinator mobile drawer passes Escape and focus return, while the Koordinator `Operasional` and Admin `Moderasi` sidebar groups pass collapse/reopen checks. The cloud demo was reseeded successfully. The remaining release evidence is a clean-runner `npm ci`, saved current screenshots, native 200 percent zoom, exhaustive negative states, preview flag dry run, and production smoke.

Landing correction on 5 September 2026: the public header now maps directly to five story chapters, while authenticated dashboards retain their role-specific navigation. Services use a complete three-by-two desktop grid instead of an orphan card. Hero text, snapshot, and figure remain visible in server output, then use transform-based entrance motion and scroll parallax. Unauthenticated booking entry now fails safely to login with a validated return path instead of rendering an empty page.

The requested liquid-glass treatment is intentionally limited to Family/Helper mobile bottom navigation. It is a user-directed interaction surface, not a global glassmorphism treatment.

Visual correction on 4 September 2026: `--muted` is a text token in the locked palette, so mapping it directly to `bg-muted` produced the unintended gray surfaces observed during browser review. Shared surface mapping now uses `--surface-muted: #EEF3F8`; muted text remains `#6B7A90`. Helper availability is now an explicit accessible switch, operational topbars use page context rather than duplicating the sidebar logo, and operational sidebar groups are collapsible with visible active routes.

Helper follow-up on 4 September 2026: the dashboard no longer tells a Helper that a task is controlled by a "server". It now describes the user-visible status flow. The coverage card reads `radius_layanan_km`, `wilayah_domisili`, and selected `helper_service_categories` under the existing role-scoped profile query, then links to the existing profile editor. This is not a new matching rule and does not expose another user's location.

## Approved Landing Motion Amendment, 4 September 2026

The product owner approved a second landing iteration. This is an implementation plan for the approved direction, not permission to introduce unsupported product claims or Sprint 6 behavior.

**Design selection.** `ui-ux-pro-max` resolved Rangkul as a trust-first community-care product with complex but contextual motion. `gpt-taste` is applied selectively to the public landing: editorial hierarchy, intentional card composition, and product-led motion. The app keeps Plus Jakarta Sans for headings and Instrument Sans for body, because those are locked product fonts. Framer Motion remains the implementation runtime because it is already installed; do not add GSAP for this iteration. The user explicitly opted out of Impeccable for this iteration.

**Hero contract.** Replace the static preview with a mobile-first 3D product-card stack: Health Snapshot in front, Memory Capsule behind it, and a small visit-status card at depth. Pointer movement may tilt the stack on fine pointers only. Keyboard and touch users receive the same information without needing a gesture. The stack uses composited `transform` and opacity only, reserves its dimensions to avoid layout shift, never blocks the primary CTA, and renders its final state when `prefers-reduced-motion` is set.

**Story contract.** The public-page order remains `Hero -> Trust strip -> Cara Kerja -> Layanan -> Riwayat Rangkul -> Verifikasi Komunitas -> Peran -> Final CTA -> Footer`. Each chapter must answer one question: why distance is hard, how a visit works, what can be requested, what remains after the visit, why the process is safe, and who participates. Do not add another repeated join section.

**Evidence contract.** A Helper, Koordinator, or review card is allowed only as either real role-scoped seed data or an explicit `Contoh skenario demo`. No score, ranking, task count, income, rating, endorsement, or testimonial may imply real verified user evidence unless its source is available in the current runtime. This keeps the jury demo persuasive without fabricating social proof.

### Landing Amendment Tasks

1. Add a red source-contract test for the 3D product-stack semantics, its no-fake-proof rule, and the final story order. Run it and record the expected failure.
2. Extract a focused client `HeroProductStack` component with Framer Motion. It owns visual depth, pointer tilt, focus-safe interaction, and reduced-motion final state; `HeroSection` retains headline, trust copy, and CTA.
3. Replace stale public components that contain fictional ratings, income, remote avatars, or testimonials with a single `DemoScenariosSection` that uses generic role cards and explicit scenario labels. Do not render the obsolete components from the public page.
4. Refine the role section so Keluarga, Helper, and Koordinator each show their real product responsibility and one route-backed next step. Admin remains an internal seeded role and is not promoted on the public landing. Keep actions usable from 375px.
5. Run focused contracts, lint, typecheck, the full test suite, build, and four-viewport browser review. Update `ui-ux-evidence.md` only with results actually observed.
6. Continue Sprint 5 and Sprint 6 only in their dependency order. Sprint 6 remains fail-closed until runtime RLS, privacy, payment, and race tests run without mandatory skips.

**Amendment progress.** Tasks 1 through 4 are implemented. The red contract was observed before implementation, then the final landing contract passed 9 of 9 checks. A server-render regression was found during screenshot review: Framer Motion's initial `opacity: 0` hid the product stack before hydration. The stack now server-renders in its final visible state and retains pointer-based depth interaction after hydration. Task 5 is source-complete: lint exits 0 with 61 warnings, typecheck passes, the full suite has 229 passing plus 9 cloud skips, and a clean `next build` compiled and produced a fresh build ID. It is not visually accepted until mobile QA uses genuine device emulation. Task 6 remains blocked at the runtime gate, not at the feature-flag or source-contract gate.

---

# 0. Mandatory Execution Rules

## 0.1 Read before touching code

Sebelum mengubah file UI apa pun, pelaksana WAJIB membaca penuh:

1. `docs/TDD_Rangkul.md`
2. `docs/planning/sprint5/plan.md`
3. `docs/planning/sprint6/plan.md`
4. plan ini
5. implementasi aktual di branch `develop`

Jangan membuat keputusan berdasarkan asumsi dari screenshot saja.

UI harus mengikuti:

- state machine aktual,
- role authorization,
- task status,
- trust tier,
- approval model,
- payment state,
- mode penugasan `langsung`, `pelamar`, `cepat`,
- privacy constraints,
- route canonical,
- seed dan API yang benar-benar tersedia.

---

## 0.2 Mandatory design skills

Sebelum mengerjakan SETIAP domain visual besar, WAJIB:

1. load/use `ui-ux-pro-max`
2. load/use `gpt-taste`
3. jalankan Impeccable / visual detector setelah implementasi utama
4. lakukan manual review sendiri setelah detector selesai

Domain besar berarti:

- App Shell
- Keluarga
- Helper
- Koordinator
- Admin
- Landing
- shared task/status components

Jangan hanya menulis bahwa skill sudah digunakan. Terapkan prinsipnya.

Jika salah satu skill tidak tersedia:

- jangan mengaku sudah memakainya,
- tulis dengan jelas skill mana yang unavailable,
- gunakan skill frontend/design terdekat yang tersedia,
- tetap ikuti seluruh acceptance criteria visual dalam dokumen ini.

---

## 0.3 IMPLEMENTED ≠ ACCEPTED

Komponen dianggap **implemented** jika kodenya sudah ada.

Komponen baru dianggap **accepted** jika:

- fungsi benar,
- informasi benar,
- layout benar,
- padding benar,
- spacing konsisten,
- radius konsisten,
- text hierarchy jelas,
- state lengkap,
- mobile benar,
- keyboard benar,
- zoom 200% tidak rusak,
- tidak ada fake data,
- tidak ada misleading CTA,
- visual QA 375 / 768 / 1024 / 1440 lulus.

Jangan menandai pekerjaan "selesai" hanya karena halaman berhasil render.

---

# 1. Product UX Principles

Empat role tidak boleh terasa seperti satu template yang sama.

## 1.1 Keluarga

Pertanyaan utama saat membuka dashboard:

> "Apa yang sedang terjadi pada orang tersayang saya?"

Target experience:

- tenang,
- mudah dipindai,
- tidak teknis,
- memberi rasa kontrol,
- status kunjungan terlihat cepat,
- Riwayat Rangkul mudah ditemukan.

Prioritas informasi:

1. Kunjungan aktif / perlu respons
2. Riwayat Rangkul terbaru
3. Orang tersayang
4. Kunjungan mendatang
5. Riwayat lain

---

## 1.2 Helper

Pertanyaan utama:

> "Apa tugas saya berikutnya dan apa yang harus saya lakukan?"

Target experience:

- operational,
- action-first,
- cepat,
- minim ambiguity,
- status availability jelas,
- task berikutnya dominan.

Prioritas informasi:

1. Tugas berikutnya
2. Aksi yang harus dilakukan
3. Availability
4. Tugas aktif / application
5. Penghasilan / saldo
6. Tugas selesai

---

## 1.3 Koordinator

Pertanyaan utama:

> "Apa yang membutuhkan tindakan saya sekarang?"

Target experience:

- operational inbox,
- safety-oriented,
- queue-first,
- jelas mana yang urgent,
- jelas scope wilayah.

Prioritas informasi:

1. Darurat aktif
2. Persetujuan tugas
3. Verifikasi Helper
4. Laporan / under review
5. Aktivitas wilayah
6. Helper wilayah
7. Komisi / analytics

**Koordinator desktop WAJIB memakai sidebar.**
Jangan kembali ke horizontal navbar penuh.

---

## 1.4 Admin

Pertanyaan utama:

> "Apa yang bermasalah atau membutuhkan keputusan platform?"

Target experience:

- moderation,
- governance,
- operational monitoring,
- audit-friendly.

Prioritas:

1. Perlu tindakan
2. Trust & safety
3. Pengajuan
4. Platform metrics
5. Audit activity

---

# 2. Locked Navigation Architecture

| Role        | Desktop                            | Mobile                            |
| ----------- | ---------------------------------- | --------------------------------- |
| Keluarga    | Top navigation                     | Bottom navigation                 |
| Helper      | Top navigation                     | Bottom navigation                 |
| Koordinator | **Sidebar + compact topbar** | **Drawer + compact topbar** |
| Admin       | **Sidebar + compact topbar** | **Drawer + compact topbar** |

---

# 3. Global Design Language

## 3.1 Brand colors

Locked semantic palette:

```css
--brand-primary: #0D47A1;
--brand-sky: #90CAF9;

--app-bg: #F5F8FC;
--surface: #FFFFFF;
--surface-subtle: #F8FAFD;

--ink: #16233A;
--ink-secondary: #4E5F75;
--muted: #6B7A90;

--border: #DCE6F1;
--border-strong: #C9D8E8;

--success: #168A4A;
--success-bg: #ECF8F0;

--warning: #B66A00;
--warning-bg: #FFF7E8;

--danger: #C62828;
--danger-bg: #FFF0F0;

--info: #0D47A1;
--info-bg: #EEF5FF;
```

Rules:

- Primary blue bukan background semua card.
- Sky blue hanya untuk supporting surface / Riwayat Rangkul / information panel.
- White card harus tetap dominan di area operasional.
- Red hanya untuk destructive / emergency / error.
- Green hanya untuk success / verified / completed.
- Amber hanya untuk waiting / attention.
- Jangan membuat card random biru, ungu, hijau hanya agar "lebih hidup".

---

# 4. Spacing System — LOCKED

Random spacing dilarang.

Gunakan scale berikut:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 28px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

## 4.1 Page horizontal padding

| Viewport | Page padding                |
| -------- | --------------------------- |
| 375px    | 16px                        |
| 768px    | 24px                        |
| 1024px   | 28px                        |
| 1440px   | 32px                        |
| >1536px  | max content width, centered |

Jangan pakai `px-6` pada semua breakpoint secara buta.

---

## 4.2 Vertical rhythm

Standard:

- page section gap desktop: `32px`
- page section gap mobile: `24px`
- card-to-card gap desktop: `16–20px`
- card-to-card gap mobile: `12–16px`
- heading to description: `8px`
- section title to content: `16–20px`
- card title to metadata: `6–8px`
- card content to CTA: `16–20px`

Tidak boleh ada card dengan padding 32px berdampingan dengan card sejenis padding 16px tanpa alasan hierarchy.

---

# 5. Radius / Corner System — LOCKED

Over-rounded UI dilarang.

Gunakan:

```css
--radius-xs: 8px;
--radius-sm: 10px;
--radius-md: 14px;
--radius-lg: 18px;
--radius-xl: 24px;
--radius-pill: 999px;
```

## 5.1 Component radius rules

| Component               | Radius        |
| ----------------------- | ------------- |
| Input / Select          | 10–12px      |
| Default button          | 10–12px      |
| Small chip/badge        | pill atau 8px |
| Compact card            | 14px          |
| Standard dashboard card | 16–18px      |
| Major panel / hero      | 20–24px      |
| Modal / Drawer panel    | 18–24px      |
| Avatar                  | circular      |

Rules:

- jangan pakai `rounded-3xl` di semua card;
- pill hanya untuk badge/status, bukan seluruh tombol;
- tombol primary tidak harus pill;
- hero boleh lebih rounded daripada data card.

---

# 6. Shadow / Elevation

Gunakan border terlebih dahulu, shadow kedua.

Suggested:

```css
--shadow-card: 0 1px 2px rgba(22, 35, 58, 0.04);
--shadow-card-hover: 0 8px 24px rgba(13, 71, 161, 0.08);
--shadow-overlay: 0 16px 48px rgba(22, 35, 58, 0.16);
```

Rules:

- default dashboard card = light border + subtle shadow;
- jangan membuat semua card floating;
- hover lift maksimum 2px untuk interactive card;
- operational dashboards sebaiknya stabil, bukan "bouncy".

---

# 7. Typography — LOCKED

Font:

- Heading: Plus Jakarta Sans
- Body: Instrument Sans

Recommended scale:

| Style         | Desktop         | Mobile          |
| ------------- | --------------- | --------------- |
| Page title    | 30–32 / 38–40 | 26–28 / 34–36 |
| Section title | 22–24 / 30–32 | 20–22 / 28–30 |
| Card title    | 16–18 / 24–26 | 16 / 24         |
| Body          | 15–16 / 24     | 15 / 23         |
| Supporting    | 13–14 / 20     | 13–14 / 20     |
| Label         | 12–13 / 16–18 | 12–13 / 16–18 |
| Metric        | 28–36 / 36–44 | 26–32 / 34–40 |

Rules:

- jangan pakai text-xs untuk informasi penting;
- jangan pakai uppercase terlalu banyak;
- uppercase hanya untuk small semantic eyebrow;
- status penting tetap readable minimum 12px;
- raw UUID bukan primary information.

---

# 8. Control Size & Touch Targets

Minimum interactive target: **44 x 44px**.

## Buttons

| Type              | Height                                      |
| ----------------- | ------------------------------------------- |
| Default           | 44px                                        |
| Compact secondary | 40px, only if surrounding target still >=44 |
| Large primary CTA | 48px                                        |

Horizontal padding:

- default: 16–18px
- large: 20–24px

## Inputs

- min height 44px
- preferred 46–48px
- textarea minimum 104px
- label → input gap 8px
- help/error text gap 6px

## Icon button

- clickable area minimum 44x44
- icon visual size 18–20px
- never expose 20x20 icon as 20x20 click target.

---

# 9. Desktop App Shell Dimensions

## 9.1 Keluarga & Helper

Top navigation:

```text
height: 68–72px
content max-width: 1200–1240px
horizontal padding: follows page padding
```

Navbar must not compete with dashboard content.

---

## 9.2 Koordinator & Admin

Sidebar:

```text
width desktop: 248–264px
recommended default: 256px
```

Topbar:

```text
height: 64px
```

Content:

```text
max-width: 1180–1240px depending on page
content padding: 28–32px desktop
```

Sidebar:

- fixed/sticky full height,
- subtle right border,
- no giant logo area,
- group title smaller and muted,
- active item has one clear indicator,
- badges align right,
- no three different active styles.

---

# 10. Mobile Navigation

## 10.1 Keluarga

Bottom nav max 5 items:

```text
Beranda
Kunjungan
Buat
Lansia
Pesan
```

`Buat` can be emphasized.

Safe area required:

```css
padding-bottom: env(safe-area-inset-bottom);
```

No content may be hidden behind bottom nav.

---

## 10.2 Helper

```text
Beranda
Cari Tugas
Tugas Saya
Penghasilan
Pesan
```

SOS remains separate.

---

## 10.3 Koordinator/Admin

Bottom nav is NOT appropriate.

Use:

- topbar,
- hamburger,
- drawer,
- same semantic menu grouping as desktop.

Drawer requirements:

- focus trap,
- Escape closes,
- overlay click closes,
- body scroll lock,
- focus returns to trigger,
- keyboard navigation works,
- current route clearly active.

---

# 11. Navigation Naming — Canonical UX Terms

## Keluarga

Primary nav:

```text
Beranda
Buat Kunjungan
Kunjungan
Lansia
Pesan
```

Profile dropdown:

```text
Profil Keluarga
Notifikasi
Bantuan
Keluar
```

`Cari Helper` tetap route / subflow, bukan konsep utama navbar.

---

## Helper

Primary:

```text
Beranda
Cari Tugas
Tugas Saya
Penghasilan
Pesan
```

Do not expose both `Papan Tugas` and `Cari Tugas` if the distinction is unclear.

---

## Koordinator

Sidebar:

```text
OVERVIEW
Dashboard

OPERASIONAL
Verifikasi Helper
Persetujuan Tugas
Aktivitas Helper

KEAMANAN
Darurat
Laporan

WILAYAH
Helper Terverifikasi
Pengawasan  // RW only

KEUANGAN
Komisi

LAINNYA
Pesan
Bantuan
```

---

## Admin

Sidebar:

```text
OVERVIEW
Dashboard

PENGGUNA & VERIFIKASI
Pengguna
Helper
Pengajuan Koordinator
Fallback Verifikasi

TRUST & SAFETY
Laporan
Banding

PLATFORM
Kategori
Audit Log

LAINNYA
Pesan
Bantuan
```

---

# 12. Active Route Rules

Active navigation must use canonical longest-prefix matching.

Examples:

```text
/kunjungan
/kunjungan/:id
/kunjungan/:id/pelamar
```

must all activate:

`Kunjungan`

Legacy route may redirect but must not produce a second competing active item.

Tests mandatory.

---

# 13. Compact Context Header

Huge greeting banner must be reduced.

Standard dashboard context header:

- height usually 80–96px desktop,
- padding 20–24px,
- one primary CTA max,
- one secondary contextual state max.

No dashboard needs 150px+ greeting merely to say "Selamat datang".

Blue dotted gradient may remain as one brand surface.

---

# 14. Keluarga Dashboard — Detailed Layout

## 14.1 Order

```text
1. Compact Context Header
2. Active / Needs Attention
3. Riwayat Rangkul Preview
4. Orang Tersayang
5. Kunjungan Mendatang
6. Recent History
```

---

## 14.2 Header

Content:

```text
Halo, Mbak Burgas
Pantau pendampingan orang tersayang dalam satu tempat.

[Buat Kunjungan]
```

Do not also place `Tambah Lansia` here if section below already has it.

---

## 14.3 Active visit card

If active task exists:

Card must be visually strongest content.

Recommended:

```text
label: SEDANG BERLANGSUNG

Menemani Mengobrol
Giorno

Helper: Mas Burgas
Mulai: 16.53
Status: Sedang dikerjakan

[Lihat Status] [Hubungi Helper]
```

Padding:

- desktop 24px
- mobile 18–20px

Radius:

- 18px

Status:

- not a huge pill;
- icon + label is enough.

---

## 14.4 Critical state-action guard

For `dikerjakan`:

DO NOT show:

- Batalkan

Allowed UI examples:

- Lihat Status
- Hubungi Helper
- Laporkan Masalah

The UI must derive action availability from shared status presentation logic.

---

## 14.5 Riwayat Rangkul preview

This is a first-class product card.

Display at most:

- latest visit date,
- 3 indicator summaries,
- short Cerita Hari Ini preview,
- attention badge if applicable,
- CTA.

Avoid showing 5 full charts on the dashboard.

Full chart belongs on Riwayat page.

Example:

```text
Riwayat Rangkul
Terakhir diperbarui 27 Agustus

Energi      Membaik
Mood        Stabil
Mobilitas   Sedikit menurun

"Hari ini Ibu bercerita..."

[Lihat Riwayat Lengkap]
```

If warning:

- amber panel,
- non-diagnostic copy,
- no medical recommendation.

---

## 14.6 Lansia cards

Card content:

- name,
- relationship,
- compact condition metadata,
- last visit,
- primary CTA "Lihat Profil",
- secondary text CTA "Riwayat Rangkul".

Add card:

- dashed border allowed,
- no duplicate CTA elsewhere.

---

## 14.7 Upcoming visits

Card should show:

- category,
- elderly name,
- date/time,
- status,
- helper if assigned,
- next action.

Don't show internal ID as major info.

---

# 15. Helper Dashboard — Detailed Layout

## 15.1 Order

```text
1. Compact profile/status header
2. Next Task
3. Needs Action
4. Operational Metrics
5. Cari Tugas Preview
6. Information / SOP
```

---

## 15.2 Header

```text
Mas Burgas
Verified · Terpercaya

Tersedia menerima tugas   [toggle]
```

Availability should be easy to access and understandable.

---

## 15.3 Next Task card

Most visually prominent.

Required fields:

- category,
- elderly/client display allowed by task state,
- date/time,
- location summary,
- distance if server supports,
- exact next action,
- status explanation.

CTA labels must be specific.

Examples:

- Lihat Detail
- Check-in
- Isi Laporan

Never generic `Action`.

---

## 15.4 Needs action area

Show only actionable queues.

Possible:

- "1 tugas menunggu check-in"
- "1 laporan belum dikirim"
- "1 layanan tambahan menunggu keluarga"

If none:

- compact "Tidak ada tindakan tertunda".

---

## 15.5 Metrics

Use 3–4 maximum:

```text
Tugas Aktif
Selesai Bulan Ini
Saldo Tersedia
Application Aktif
```

Avoid ambiguous `Estimasi Fee`.

Only display actual data.

---

# 16. Koordinator Dashboard — Detailed Layout

## 16.1 Shell

Desktop:

- sidebar 256px,
- topbar 64px,
- no full-width horizontal role nav.

Topbar displays:

- current region,
- notification,
- avatar.

Example:

```text
RT 03 / RW 05 · Pleburan
Semarang Selatan
```

---

## 16.2 First section: Perlu Tindakan

Must be above analytics.

Recommended cards:

```text
Verifikasi Helper
Persetujuan Tugas
Laporan Baru
Darurat Aktif
```

Visual weight rules:

- `Darurat >0`: danger emphasis
- `Darurat =0`: neutral/de-emphasized
- queue >0: clear number + CTA
- queue =0: avoid loud accent

Card padding:

- 18–20px
- radius 16px

---

## 16.3 Activity feed

Title:

`Aktivitas Wilayah Terbaru`

Rows must show:

- time,
- event,
- actor/entity human name,
- compact context.

Do not make UUID primary text.

No fake events.

---

## 16.4 Helper overview

Compact panel:

```text
4 Helper Terverifikasi
1 sedang bertugas
2 tersedia
1 tidak tersedia
```

Data must be real.

---

## 16.5 Region scope

Do not repeat full administrative hierarchy in huge hero.

Compact format:

```text
Wilayah Operasional
RT 03 / RW 05 · Pleburan
```

RW may have filter if backend supports.

---

# 17. Admin Dashboard — Detailed Layout

## 17.1 First section

`Perlu Tindakan`

Cards:

- Laporan Menunggu
- Pengajuan Koordinator
- Helper Under Review
- Banding

---

## 17.2 Platform metrics

Below action queue:

- Total Pengguna
- Akun Aktif
- Helper Terverifikasi
- GMV only if trustworthy

---

## 17.3 Sensitive activity

Keep audit feed.

Row hierarchy:

```text
Helper disetujui
Andi Permana
oleh Admin Rangkul
27 Agu · 22.06
```

UUID only in detail/secondary metadata.

---

# 18. Landing Page — Detailed Story

Order locked:

```text
1. Navbar
2. Hero
3. Trust Strip
4. Cara Kerja
5. Layanan
6. Riwayat Rangkul WOW Section
7. Verifikasi Komunitas
8. Role Entry
9. Final CTA
10. Footer
```

Avoid repetitive:

- Role section
- Join Helper section
- Join Koordinator section
  all repeating the same content.

---

# 19. Landing Hero

Headline:

`Merangkul Jarak, Menjaga yang Tersayang`

Supporting copy must explain the product in one read.

Primary CTA:
`Buat Kunjungan`

Secondary:
`Lihat Cara Kerja`

No fake metrics.

Trust strip:

```text
Diverifikasi komunitas lokal
Harga transparan sejak awal
Laporan setiap kunjungan
```

---

# 20. Riwayat Rangkul WOW Section

Mandatory high-emphasis section.

This section is the emotional/product differentiator.

Suggested layout:

Desktop 2-column:

```text
LEFT
Bukan Sekadar Kunjungan.
Lihat Perubahan dari Waktu ke Waktu.

paragraph
feature points

RIGHT
product UI preview
```

Preview:

- clearly labelled `Contoh tampilan`
- not actual elderly data,
- 3–5 health indicators,
- cerita,
- mini trend,
- no diagnosis.

Card:

- use sky supporting surface,
- radius 24px,
- padding 28–32px desktop,
- no excessive gradient.

---

# 21. Landing Truth Rules

Forbidden unless from actual verified data:

- 100%
- rating 4.8
- `< 1 jam`
- fake monthly income
- fake user count
- fake GMV
- fake testimonial
- fake helper ranking
- random remote avatar pretending to be user
- invented tax/service fee

Testimonials:

- remove if fictional,
- or explicitly label as `Contoh skenario penggunaan`.

---

# 22. Service Cards

Each card:

```text
Icon
Service name
Description
Price
Duration
Risk info if needed
```

Card padding:

- 18–20px

Radius:

- 16px

Do not use oversized 3:4 imagery unless it improves decision making.

High-risk badge copy:

`Perlu Persetujuan Koordinator`

---

# 23. Card Composition Rules

Every card must have hierarchy.

Recommended pattern:

```text
eyebrow/status
title
supporting metadata
primary value/content
actions
```

Do not produce:

- icon
- title
- number
- random decoration
  with no hierarchy.

---

# 24. Empty States

Every major list needs intentional empty state.

## Keluarga

```text
Belum ada kunjungan mendatang.

Buat kunjungan untuk mulai mendampingi Giorno.

[Buat Kunjungan]
```

## Helper

```text
Belum ada tugas aktif.

Cari tugas yang tersedia sesuai wilayah dan layananmu.

[Cari Tugas]
```

## Koordinator

```text
Tidak ada Helper yang menunggu verifikasi.

Semua pengajuan sudah ditinjau.
```

## Admin

```text
Tidak ada laporan menunggu.

Semua laporan sudah ditangani.
```

Avoid generic:
`Tidak ada data`.

---

# 25. Loading States

Skeleton must approximate final layout.

Avoid:

- spinner-only full page,
- page jumping after load.

Use:

- header skeleton,
- card skeleton,
- list row skeleton.

Skeleton should not animate aggressively under reduced motion.

---

# 26. Error / Forbidden / Conflict States

Human-readable copy.

Examples:

### 403

`Kamu tidak memiliki akses ke halaman ini.`

### 409

`Status tugas sudah berubah. Muat ulang untuk melihat kondisi terbaru.`

### task already selected

`Tugas ini sudah diambil Helper lain.`

Do not expose Supabase stack traces.

---

# 27. Disabled State

Never rely on disabled gray button alone.

Example:

```text
[Mulai Kunjungan]

Tersedia 30 menit sebelum jadwal.
```

or:

```text
Menunggu persetujuan Koordinator sebelum tugas dapat dilanjutkan.
```

---

# 28. Status System

Create one presentation map.

Each status must define:

```ts
type TaskStatusPresentation = {
  label: string;
  description: string;
  tone: "neutral" | "info" | "warning" | "success" | "danger";
  actions: Partial<Record<AppRole, readonly string[]>>;
};
```

Avoid vague label `Menunggu`.

Use semantic labels such as:

- Menunggu Helper
- Menunggu Persetujuan Koordinator
- Dijadwalkan
- Sedang Dikerjakan
- Menunggu Persetujuan Keluarga
- Selesai
- Dibatalkan

Do not invent new database states.

---

# 29. Microcopy Rules

UI language: Indonesian first.

Use:

- specific verbs,
- concise actions,
- no technical jargon.

Good:

- Buat Kunjungan
- Tinjau Helper
- Hubungi Helper
- Lihat Riwayat
- Ajukan Layanan Tambahan

Bad:

- Process
- Action
- Manage
- Handle
- Proceed

---

# 30. Accessibility Gate

Mandatory:

- semantic heading order,
- visible focus,
- focus ring >= 2px,
- keyboard full path,
- Esc closes drawer/modal,
- focus trap in modal/drawer,
- focus returns to trigger,
- aria-label on icon-only button,
- contrast WCAG AA,
- status not color-only,
- touch target >=44px,
- no hover-only action,
- zoom 200% without horizontal page break,
- no clipped long text.

---

# 31. Long Content Stress Test

Must test:

- name 40+ chars,
- long address,
- badge `99+`,
- 5 navigation items,
- long service title,
- long report reason,
- Rp values with millions,
- 4-digit task counts,
- empty avatar,
- missing optional description.

Do not design only for short seed values.

---

# 32. Responsive Layout Rules

## 375px

- 1 column,
- 16px page padding,
- bottom nav,
- no horizontal scrolling,
- stacked CTA where needed,
- card padding 16–18px.

## 768px

- 2 column only where information remains readable,
- 24px page padding,
- bottom nav for Family/Helper may remain,
- drawer for operational roles.

## 1024px

- Family/Helper desktop nav,
- Koordinator/Admin sidebar,
- 2–3 column dashboard grid,
- no overly wide text blocks.

## 1440px

- max content width,
- centered,
- no stretching cards across entire screen,
- whitespace intentional.

---

# 33. Motion Rules

Motion is supporting only.

Default:

- 160–220ms
- ease-out

Allowed:

- nav active indicator
- drawer
- modal
- small hover
- card transition

Forbidden:

- dramatic entrance every section
- bouncing metrics
- looping dashboard animation
- GSAP just because available

Reduced-motion fallback mandatory.

---

# 34. Implementation Workstreams

# U0 — Presentation Contract

Status: re-verify.

Tasks:

- navigation config per role,
- active prefix,
- aliases,
- task presentation map,
- action availability,
- state regression tests.

Acceptance:

- no invalid cancellation after `dikerjakan`,
- no ambiguous duplicate nav,
- nested routes active correctly.

---

# U1 — Design Tokens & App Shell

Do not consider complete until visual gate passes.

Tasks:

- semantic color tokens,
- spacing tokens,
- radius tokens,
- shadow tokens,
- focus token,
- typography,
- AppNavigation,
- Family/Helper top nav,
- MobileBottomNavigation,
- RoleSidebar,
- mobile drawer,
- shared NotificationBell,
- shared ProfileMenu.

Additional acceptance:

- Koordinator uses sidebar on desktop,
- Admin uses sidebar on desktop,
- both use drawer mobile,
- no duplicated full nav in topbar,
- all click targets >=44px,
- no raw hardcoded radius in shell if token exists.

---

# U2 — Keluarga

Tasks:

- compact header,
- active visit first,
- Riwayat Rangkul preview,
- lansia cards,
- upcoming visits,
- empty/loading/error,
- mobile bottom nav,
- action guard.

Visual acceptance:

- no section starts closer than 24px to previous section,
- main active card padding >=20px,
- no duplicated CTA,
- only one primary blue CTA per local section,
- Riwayat card visually identifiable but not louder than emergency/active task.

---

# U3 — Helper

Tasks:

- availability,
- next-task-first,
- explicit status,
- needs action,
- useful metrics,
- job preview,
- empty/loading/error.

Visual acceptance:

- next task is visibly strongest,
- stats do not dominate,
- fee copy not ambiguous,
- task CTA readable on 375px,
- no 4 colored stat cards with equal loudness.

---

# U4 — Koordinator

Tasks:

- sidebar,
- region topbar,
- action queue,
- activity feed,
- helper overview,
- reports,
- emergency,
- RW conditional menu,
- mobile drawer.

Visual acceptance:

- sidebar width consistent,
- group spacing 20–24px,
- active item obvious,
- queue >0 visually stronger than queue 0,
- emergency 0 not red,
- no huge welcome hero,
- full page understandable in 5 seconds.

---

# U5 — Admin

Tasks:

- sidebar grouping,
- action queue,
- metrics,
- audit activity,
- moderation hierarchy.

Visual acceptance:

- action cards first,
- audit log readable,
- raw IDs secondary,
- no information overload.

---

# U6 — Landing

Tasks:

- restructure storytelling,
- truthful hero,
- trust strip,
- services,
- Riwayat wow section,
- community verification section,
- role cards,
- CTA,
- footer,
- remove fake social proof.

Visual acceptance:

- first viewport explains product,
- Riwayat section feels memorable,
- no section redundancy,
- no giant blank spacing,
- max paragraph width ~60–70ch,
- consistent vertical section rhythm 72–96px desktop, 48–64px mobile.

---

# U7 — Pricing Display Audit

Every price summary must use:

- `harga_dasar`
- approved extra services
- `harga_final`

No fabricated:

- PPN
- service fee
- platform fee displayed to family unless backend/source explicitly says so.

---

# U8 — Visual QA & Evidence

Create:

`docs/planning/sprint5/ui-ux-evidence.md`

Evidence matrix mandatory:

| Page                  | 375 | 768 | 1024 | 1440 | Keyboard | 200% Zoom | Empty | Loading | Error |
| --------------------- | --- | --- | ---- | ---- | -------- | --------- | ----- | ------- | ----- |
| Landing               |     |     |      |      |          |           |       |         |       |
| Keluarga dashboard    |     |     |      |      |          |           |       |         |       |
| Helper dashboard      |     |     |      |      |          |           |       |         |       |
| Koordinator dashboard |     |     |      |      |          |           |       |         |       |
| Admin dashboard       |     |     |      |      |          |           |       |         |       |

Also record:

- reduced motion,
- long text,
- badge 99+,
- dark token regression even if dark mode not exposed,
- all navigation active states.

---

# 35. Visual Review Checklist — Mandatory Per Page

Before calling any page complete, answer all:

## Hierarchy

- Is the most important thing the first thing users notice?
- Is there only one dominant primary action per local context?
- Do secondary cards remain secondary?

## Spacing

- Are page edges consistent?
- Are section gaps consistent?
- Are card paddings aligned?
- Is there enough breathing room?

## Corners

- Are cards not over-rounded?
- Are badges the only frequent pill shapes?
- Is radius based on component role?

## Typography

- Is title stronger than card title?
- Is supporting text actually readable?
- Are labels not too tiny?
- Is line-height comfortable?

## Color

- Does color have meaning?
- Is blue not overused?
- Is red reserved?
- Is green reserved?

## Interaction

- Are click areas >=44px?
- Are hover/focus states visible?
- Is disabled state explained?
- Does keyboard work?

## Content

- Is data real?
- Is copy specific?
- Are IDs hidden from primary UI?
- Is empty state helpful?

If one answer is "no", page is not accepted.

---

# 36. Anti-Slop Rules

Reject implementation if it contains:

- giant generic gradient header,
- random floating circles,
- excessive glow,
- every card `rounded-3xl`,
- every card different pastel color,
- fake metric,
- fake testimonial,
- random decorative badges,
- icons purely as decoration in every title,
- huge whitespace with little information,
- micro text,
- overuse of uppercase,
- repeated CTA,
- "Learn More" style vague buttons,
- poor mobile stacking,
- desktop-only visual thinking.

---

# 37. Quality Gate Commands

After each domain:

```bash
npm run lint
npm run typecheck
```

Before final candidate:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
git diff --check
```

Also:

- runtime RLS tests,
- Sprint 5 gates,
- Sprint 6 race/privacy gates.

No screenshot can replace runtime verification.

---

# 38. Commit Strategy

Keep commits logical.

Examples:

```text
refactor(ui): centralize navigation and status presentation

feat(ui): build role-based app shells

feat(keluarga): prioritize active visit and riwayat rangkul

feat(helper): prioritize next task and availability

feat(koordinator): replace top nav with operational sidebar

feat(admin): group moderation and platform navigation

feat(landing): highlight trust and riwayat rangkul

fix(ui): normalize spacing radius and focus states

docs(ui): add visual QA evidence
```

---

# 39. Final Acceptance — Hard Requirements

Do NOT approve release until all are true.

1. TDD remains source of business truth.
2. Sprint 5 and Sprint 6 plans remain intact.
3. Koordinator desktop uses sidebar.
4. Admin desktop uses sidebar.
5. Family/Helper desktop use top nav.
6. Family/Helper mobile use bottom nav.
7. Operational mobile roles use drawer.
8. No invalid task action.
9. No fake metric/testimonial/ranking/income.
10. No fabricated pricing.
11. Riwayat Rangkul is visible and memorable.
12. Keluarga dashboard is active-visit-first.
13. Helper dashboard is next-task-first.
14. Koordinator dashboard is action-queue-first.
15. Admin dashboard is moderation-first.
16. Spacing tokens are applied consistently.
17. Radius tokens are applied consistently.
18. Touch targets >=44px.
19. Visible keyboard focus.
20. Drawer focus trap works.
21. 200% zoom works.
22. 375/768/1024/1440 screenshots reviewed.
23. Empty/loading/error states exist.
24. Long text stress test passes.
25. Lint/typecheck/test/build pass.
26. Runtime/RLS/race/privacy gates pass.
27. Feature flag Sprint 6 remains fail-closed until gate complete.

---

# 40. Expected Codex Handoff

At completion, provide:

## A. UX audit summary

What was wrong and why.

## B. Design system summary

Exact:

- spacing,
- radius,
- typography,
- color,
- shadow,
- touch target rules used.

## C. Navigation architecture

Per role, desktop + mobile.

## D. Dashboard changes

Keluarga / Helper / Koordinator / Admin.

## E. Landing changes

Story structure and removed misleading content.

## F. Business-rule UI fixes

Invalid actions or copy corrected.

## G. Files changed

List important files.

## H. Visual QA matrix

375 / 768 / 1024 / 1440.

## I. Accessibility results

Keyboard / zoom / focus / reduced motion.

## J. Test results

lint / typecheck / test / build / runtime gates.

## K. Remaining risks

Only real unresolved issues.

Never claim an item was validated if it was not actually tested.

---

# Final Instruction

Do not optimize Rangkul merely to "look modern".

Optimize it so that:

- **Keluarga merasa tenang dan langsung tahu kondisi orang tersayang.**
- **Helper langsung tahu tugas berikutnya dan tindakan yang harus dilakukan.**
- **Koordinator langsung tahu antrean dan risiko yang harus ditangani.**
- **Admin langsung tahu masalah platform yang membutuhkan keputusan.**

Every spacing value, padding, radius, color, typography size, CTA position, and navigation choice must support those goals.

Use `ui-ux-pro-max` and `gpt-taste` before major UI work. Impeccable is excluded from this iteration by the explicit product-owner decision recorded above.

If a page is beautiful but confusing, it fails.

If a page is functional but visually inconsistent, it also fails.

Rangkul is accepted only when **function, hierarchy, clarity, trust, responsiveness, and visual polish** are all simultaneously strong.
