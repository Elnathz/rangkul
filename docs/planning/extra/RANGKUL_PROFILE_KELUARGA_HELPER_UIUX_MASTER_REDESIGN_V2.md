# RANGKUL — Family & Helper Profile UI/UX Master Redesign

> Audience: Antigravity and Codex  
> Target branch: `develop`  
> Scope: Profil Keluarga + Profil Helper  
> Source of truth: `docs/TDD_Rangkul.md` and actual implementation/data model.

## 0. Mandatory skill usage

Before changing UI, use and apply:

- `ui-ux-pro-max`
- `gpt-taste` / Taste skill available in the environment

Do not merely claim the skills were used. Their principles must materially affect information architecture, visual hierarchy, spacing, padding, corner radius, density, typography, responsive behavior, interaction, accessibility, and anti-template review.

If a required skill is unavailable, say so in the final handoff instead of pretending it ran.

---

# 1. Product principle

Family and Helper profiles must share Rangkul's visual language, but they must **not** share the same information hierarchy.

## Family

The page must answer:

> "Siapa saya di Rangkul, siapa orang tersayang yang saya kelola, dan apa yang bisa saya lakukan dari sini?"

Primary goals:

1. confirm/edit family identity;
2. view contact and domicile;
3. manage elderly profiles;
4. enter an elderly profile quickly;
5. add an elderly profile;
6. create a visit where useful.

Experience target:

- calm;
- personal;
- family-oriented;
- low cognitive load;
- relationship-first.

## Helper

The page must answer:

> "Apakah profil saya siap dipercaya dan menerima tugas, layanan apa yang bisa saya kerjakan, dan bagaimana keluarga melihat saya?"

Primary goals:

1. see verification state;
2. control availability;
3. review public identity;
4. review services;
5. review operating area/radius;
6. see meaningful performance;
7. edit profile;
8. distinguish public and private information.

Experience target:

- professional;
- credible;
- trust-first;
- operational;
- human.

---

# 2. Hard critique — current Family profile

## 2.1 It looks like a generic social profile

The current blue cover + circular avatar + role badge composition feels like a generic member profile.

It does not communicate Rangkul's strongest product idea: a family account managing people they care about.

Replace the social-cover pattern with a horizontal account identity surface.

## 2.2 The left column is too narrow

Email, phone and especially domicile are squeezed into a narrow one-third card, causing awkward wrapping and making the account card unnecessarily tall.

Structured profile data should not look like a cramped ID card.

## 2.3 The elderly container wastes space

The current large white `Daftar Lansia` container extends well below its actual content.

Do not use a full-height panel for a short card grid. Let content determine section height.

## 2.4 Elderly cards underuse real photos

The main emotional object of this page is the person being cared for.

Use real elderly photos when available. A generic low-opacity user icon should only be a fallback.

## 2.5 CTA wording must match destination

Audit current routes.

If a button says:

`Detail Profil`

but actually enters an edit page, this is a UX contract bug.

Use:
- `Lihat Profil` → detail page;
- `Edit Profil` → edit page.

## 2.6 `Akun Keluarga` is redundant

The navbar already says the user is in Keluarga Workspace. A second role badge under their name adds almost no value.

Only show a badge if it communicates meaningful security/verification state.

## 2.7 Never show missing information as `-`

Bad:

```text
Nomor Telepon
-
```

Better:

```text
Nomor telepon belum ditambahkan
```

with an edit affordance where appropriate.

## 2.8 Full domicile is too database-like

Summary should use:

```text
Pleburan, Semarang Selatan
Kota Semarang, Jawa Tengah
RT 02 / RW 05
```

Then optionally:

`Lihat alamat lengkap`

Do not dump one long raw address into the primary profile card.

## 2.9 `Demo Wallet` is visually damaging

If the wallet exists only for competition sandboxing, do not make `DEMO WALLET` a prominent Family-profile feature.

Preferred:

- real product concept → `Saldo Rangkul`;
- sandbox-only feature → subtle demo environment tooling.

The profile should not immediately advertise that the product is a demo.

## 2.10 Current hierarchy mixes account and family management

The page currently has:

```text
personal account
+
contact data
+
elderly management
```

but treats them as two generic columns.

The redesign must use:

```text
identity
↓
people you care for
↓
account details
```

---

# 3. Family profile — recommended page architecture

Preferred page title:

`Akun & Keluarga`

This better reflects what the page actually contains.

If route/product wording must stay:

`Profil Keluarga`

is acceptable, but use the same hierarchy below.

Desktop target:

```text
Akun & Keluarga                                      [Edit Profil]
Kelola informasi akun dan orang tersayang.

┌────────────────────────────────────────────────────────────────────┐
│ [PHOTO 96]  Mbak Burgas                                           │
│             Pleburan, Semarang Selatan                            │
│                                                                    │
│             mbakburgas@gmail.com   08xx-xxxx-xxxx                 │
│                                                                    │
│                                             [Edit Profil]          │
└────────────────────────────────────────────────────────────────────┘

ORANG TERSAYANG                                     [+ Tambah Lansia]
Kelola profil dan pendampingan keluarga yang Anda pantau.

┌─────────────────────────────┐  ┌─────────────────────────────┐
│ [PHOTO] Giorno Gio          │  │ [PHOTO] Giorno             │
│ Ayah                        │  │ Anak Kandung                │
│                             │  │                             │
│ ● Mandiri                   │  │ Catatan singkat...         │
│                             │  │                             │
│ Kunjungan berikutnya        │  │ Belum ada kunjungan        │
│ 7 Sep · 12.11               │  │                             │
│                             │  │                             │
│ [Lihat Profil →]            │  │ [Lihat Profil →]           │
│ Buat Kunjungan              │  │ Buat Kunjungan             │
└─────────────────────────────┘  └─────────────────────────────┘

INFORMASI AKUN

┌─────────────────────────────┐  ┌─────────────────────────────┐
│ KONTAK                      │  │ DOMISILI                    │
│ Email                       │  │ Pleburan                    │
│ Telepon                     │  │ Semarang Selatan            │
│                             │  │ RT 02 / RW 05               │
└─────────────────────────────┘  └─────────────────────────────┘
```

---

# 4. Family identity card

Remove the decorative social cover.

Use:

- avatar 88–96px desktop;
- 72–80px mobile;
- name;
- compact region;
- email;
- phone;
- edit action.

Do not place full address in this header.

Fallback avatar:
- initials;
- soft brand background.

Do not use unrelated decorative imagery as a profile fallback.

---

# 5. Rename `Daftar Lansia`

Preferred family-facing section name:

`Orang Tersayang`

Why:

`Daftar Lansia` feels administrative.

`Orang Tersayang` matches Rangkul's product positioning.

Supporting text can still use the term `profil lansia`.

Example:

```text
Orang Tersayang
Kelola profil lansia dan pendampingan keluarga yang Anda pantau.
```

---

# 6. Elderly card design

Recommended:

```text
┌───────────────────────────────────────┐
│ [64px photo] Giorno Gio              │
│              Ayah                    │
│                                       │
│ ● Mandiri                            │
│                                       │
│ Perlu ditemani mengobrol...          │
│                                       │
│ Kunjungan berikutnya                 │
│ 7 September · 12.11                  │
│                                       │
│ [Lihat Profil →]                     │
│ Buat Kunjungan                       │
└───────────────────────────────────────┘
```

Rules:

- use real `foto_url` when available;
- maximum 2 lines for condition summary;
- no giant decorative icon;
- relationship should be clear;
- no fake upcoming visit;
- only show task preview if real data can be queried safely.

If no upcoming visit:

`Belum ada kunjungan mendatang`

Do not invent one.

---

# 7. Add elderly interaction

Preferred desktop pattern:

```text
Orang Tersayang                           [+ Tambah Lansia]
```

Avoid duplicating the same action as both:

- header button;
- giant dashed card.

Choose one strong entry point.

On mobile, a full-width add button after the cards is acceptable.

---

# 8. Account information

Move detailed contact/domicile below elderly management.

Use dedicated sections:

```text
KONTAK
Email
Nomor telepon

DOMISILI
Pleburan, Semarang Selatan
Kota Semarang, Jawa Tengah
RT 02 / RW 05
```

If phone missing:

```text
Belum ditambahkan
```

not `-`.

---

# 9. Family visual system

Use:

```text
max width: 1120–1180px
page padding:
  mobile 16px
  tablet 24px
  desktop 28–32px

section gap:
  desktop 32px
  mobile 24px

card grid gap:
  16px

identity card radius:
  18–20px

elderly card radius:
  16–18px

info card radius:
  16px

button radius:
  10–12px

badge:
  pill only for semantic state
```

Use borders before heavy shadows.

---

# 10. Family mobile order

```text
Akun & Keluarga
Edit

Identity
photo
name
region
contact

Orang Tersayang
cards
Tambah Lansia

Informasi Akun
Kontak
Domisili
```

Do not merely stack the desktop two-column layout without reviewing hierarchy.

---

# 11. Family empty states

No elderly:

```text
Belum ada orang tersayang yang ditambahkan.

Tambahkan profil lansia untuk mulai membuat
kunjungan pendampingan.

[Tambah Lansia]
```

No phone:

```text
Nomor telepon belum ditambahkan.
```

No avatar:
- initials fallback.

---

# 12. Helper profile — do not copy Family profile

Helper profile must be a **trust + capability + operational identity** page.

The database already supports concepts including:

- photo;
- verification status;
- availability;
- trust tier;
- service radius;
- rating average;
- completed tasks;
- available balance;
- bio;
- domicile/coordinates.

Use only fields that actually help the user.

---

# 13. Self profile vs public Helper profile

This distinction is mandatory.

## Helper Self Profile

Can show:

- private phone;
- private domicile detail;
- availability;
- balance;
- profile controls;
- verification state;
- operating settings.

## Public Helper Profile

May show, where supported:

- photo;
- display name;
- verification;
- trust tier;
- general service area;
- service radius/distance;
- service categories;
- rating;
- completed tasks;
- bio;
- availability.

Never publicly show:

- KTP;
- exact home address;
- email;
- phone;
- sanction details;
- internal IDs.

---

# 14. Helper self-profile — desktop layout

```text
Profil Helper                                        [Edit Profil]

┌───────────────────────────────────────────────────────────────────┐
│ [PHOTO 96] Andi Sudarto                                           │
│            ✓ Terverifikasi                                       │
│            Terpercaya                                            │
│            Pleburan, Semarang Selatan                            │
│                                                                   │
│                          Tersedia menerima tugas       [ ON ]     │
└───────────────────────────────────────────────────────────────────┘

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Tugas Selesai    │ │ Rating           │ │ Radius Layanan   │
│ 24               │ │ 4.8              │ │ 5 km             │
└──────────────────┘ └──────────────────┘ └──────────────────┘

MAIN                                           SIDE

┌──────────────────────────────────┐          ┌──────────────────────┐
│ LAYANAN SAYA                     │          │ STATUS PROFIL        │
│                                  │          │                      │
│ Tingkat Ringan                   │          │ ✓ Terverifikasi     │
│ [Mengobrol] [Pengingat Obat]     │          │ Trust: Terpercaya   │
│                                  │          │                      │
│ Tingkat Sedang                   │          │ [Lihat Tampilan      │
│ [...]                            │          │  Publik]             │
│                                  │          └──────────────────────┘
│ [Kelola Layanan]                 │
├──────────────────────────────────┤          ┌──────────────────────┐
│ WILAYAH LAYANAN                  │          │ SALDO TERSEDIA       │
│ Pleburan, Semarang Selatan       │          │ Rp450.000            │
│ Radius 5 km                      │          │ [Lihat Penghasilan]  │
│ [accurate map if supported]      │          └──────────────────────┘
├──────────────────────────────────┤
│ TENTANG SAYA                     │
│ "Saya senang menemani..."        │
└──────────────────────────────────┘

INFORMASI PRIBADI
Hanya Anda yang dapat melihat.

phone
email
full domicile
```

---

# 15. Helper profile header

Above the fold must show:

1. real Helper photo;
2. name;
3. verification status;
4. trust tier if user-facing;
5. general location;
6. availability;
7. edit action.

Availability is operational state.

Do not bury it in an edit form.

---

# 16. Verification presentation

Verified:

```text
✓ Terverifikasi
Profil siap menerima tugas.
```

Pending:

```text
Menunggu verifikasi
Koordinator sedang meninjau profil Anda.
```

Under review:

```text
Profil sedang ditinjau
```

Only show blocking copy that matches real rules.

Do not expose raw enum strings.

---

# 17. Trust tier

If trust tier has meaningful user-facing labels, show:

```text
Tingkat Kepercayaan
Terpercaya
```

If raw tiers are technical, map them to friendly presentation.

Do not expose backend enum names directly.

---

# 18. Metrics

Preferred:

```text
Tugas selesai
Rating
Radius layanan
```

Optional financial information belongs in its own area.

## Zero rating rule

Never show:

`Rating 0.0`

as if it were a bad score.

If no reviews:

`Belum ada penilaian`

If no completed jobs:

`Belum ada tugas selesai`

Do not manufacture positive values.

---

# 19. Services / capability

Group selected services by real tier.

```text
LAYANAN SAYA

TINGKAT RINGAN
Pendampingan sosial & kebutuhan sederhana

[Menemani Mengobrol]
[Pengingat Obat]

TINGKAT SEDANG
[...]

TINGKAT BERAT
[Kontrol Kesehatan]
Perlu persetujuan Koordinator
```

Avoid one wall of tiny chips.

Add:

`Kelola Layanan`

if supported.

---

# 20. Helper operating area

Self view:

```text
WILAYAH LAYANAN

Pleburan, Semarang Selatan
Kota Semarang

Radius layanan
5 km
```

A small map/radius visualization is useful only if accurate.

Do not add a fake decorative map.

Public view:
- general area;
- distance/radius;
- no exact home address.

---

# 21. Helper bio

Use existing `bio` if available.

```text
TENTANG SAYA

"Saya senang menemani lansia berbincang..."
```

If empty:

```text
Ceritakan sedikit tentang diri Anda agar keluarga
lebih mengenal Anda.

[Tambah Bio]
```

Do not invent one.

---

# 22. Public profile preview

High-value feature:

`Lihat Tampilan Publik`

Purpose:

> Helper can verify exactly what the Family sees.

Can be:
- dedicated route;
- modal/sheet if simpler.

Public preview must obey privacy rules.

---

# 23. Public Helper profile target

```text
┌──────────────────────────────────────────────────────────────┐
│ [PHOTO 96] Andi Sudarto                                    │
│            ✓ Terverifikasi                                 │
│            Terpercaya                                      │
│            Pleburan · ±2.3 km                              │
│                                                              │
│ 4.8 rating      24 tugas selesai      radius 5 km           │
└──────────────────────────────────────────────────────────────┘

TENTANG ANDI
bio

LAYANAN
services grouped by tier

KEPERCAYAAN
verification/trust summary

[Pilih Andi untuk Kunjungan]
```

Only show metrics if real.

---

# 24. Private Helper information

Self profile may show:

```text
INFORMASI PRIBADI
Hanya Anda yang dapat melihat.

Phone
Email
Private domicile
```

Do not visually mix private data with public identity.

---

# 25. Helper photo-change UX

Current edit flow includes Helper photo changes and verification behavior.

The UI must explain actual behavior.

Example only if true:

```text
Foto baru menunggu verifikasi.

Foto sebelumnya tetap digunakan sampai foto baru disetujui.
```

Do not state behavior that is not implemented.

---

# 26. Helper status rail

Desktop side rail:

```text
STATUS PROFIL

✓ Identitas terverifikasi
✓ Foto terverifikasi
✓ Layanan dipilih

Ketersediaan
● Tersedia

[Lihat sebagai Keluarga]
```

Do not add a fake percentage completion meter unless real completion logic exists.

---

# 27. Balance / earnings

If `saldo_tersedia` is a real product concept:

```text
Saldo tersedia
Rp450.000

[Lihat Penghasilan]
```

Do not label polished product UI as `Demo Wallet`.

If sandbox-only, isolate the demo environment.

---

# 28. Helper mobile order

```text
Identity
Verification
Availability

Metrics

Public Preview

Services

Area & Radius

Bio

Private Account Information

Financial section
```

Availability stays above the fold.

---

# 28A. SALDO / PENGHASILAN — REQUIRED NAVIGATION & ACCESS

This section is mandatory.

Current problem:

The balance feature may already exist, but if the only practical way to reach it is by manually typing a URL such as:

```text
/saldo
```

then the feature is effectively hidden.

A user-facing product must never rely on users knowing internal routes.

The redesign MUST make financial features discoverable through visible navigation and contextual shortcuts.

---

## 28A.1 Family — Saldo Rangkul

For Keluarga, use the user-facing term:

`Saldo Rangkul`

Do NOT use:

`Demo Wallet`

as the primary product label.

If the environment is a competition sandbox, a small non-blocking notice may say:

```text
Mode Demo
Transaksi pada lingkungan ini menggunakan saldo simulasi.
```

The account's main finance destination is:

```text
/saldo
```

This route must remain directly accessible through the UI.

### Required access points

At minimum, expose `Saldo Rangkul` from:

1. profile/avatar dropdown in the top navigation;
2. Family profile/account page;
3. optionally a compact dashboard shortcut if useful.

Recommended profile dropdown:

```text
[Avatar] Mbak Burgas
├── Profil Keluarga
├── Saldo Rangkul
├── Riwayat Pembayaran       // only if the route actually exists
├── Bantuan                  // only if the route exists
└── Keluar
```

`Saldo Rangkul` must navigate directly to:

```text
/saldo
```

Do not require:
- manually typing the URL,
- opening Developer Tools,
- going through a hidden profile card.

---

## 28A.2 Family profile placement

The Family profile should NOT give the wallet a large visual priority above elderly management.

Instead use a compact financial utility section near the lower account area.

Example:

```text
KEUANGAN

┌──────────────────────────────────────────────┐
│ Saldo Rangkul                               │
│                                              │
│ Rp250.000                                   │
│                                              │
│ [Lihat Saldo →]                            │
└──────────────────────────────────────────────┘
```

CTA destination:

```text
/saldo
```

If the balance is not immediately available from a safe existing query, do not fabricate it.

Use:

```text
Lihat Saldo
```

without previewing an invented amount.

---

## 28A.3 Family dashboard shortcut

Optional but recommended if it improves discoverability.

A small utility card may appear on the Keluarga dashboard:

```text
Saldo Rangkul
Rp250.000

[Isi Saldo]
```

or:

```text
Saldo Rangkul
[Lihat Saldo →]
```

Rules:

- it must remain visually secondary to active visits and next actions;
- do not make balance a hero metric;
- do not duplicate the same large wallet card in multiple places.

---

## 28A.4 `/saldo` page requirements

The route `/saldo` should feel like a proper financial utility page.

Recommended structure:

```text
Saldo Rangkul

┌──────────────────────────────────────────────┐
│ Saldo tersedia                              │
│                                              │
│ Rp250.000                                   │
│                                              │
│ [Isi Saldo]                                 │
└──────────────────────────────────────────────┘

Riwayat Transaksi

6 Sep 2026
Isi Saldo                         + Rp100.000

4 Sep 2026
Menemani Mengobrol               - Rp30.000
```

Only show transaction rows that are backed by real data.

If the environment is demo/sandbox:

```text
ⓘ Mode Demo
Transaksi di lingkungan ini menggunakan saldo simulasi.
```

Use a subtle information banner, not a giant `DEMO WALLET` badge.

---

## 28A.5 Helper — Penghasilan

For Helper, financial information should NOT be framed as a generic wallet.

Use:

`Penghasilan`

or:

`Saldo Penghasilan`

Preferred main destination:

```text
/helper/penghasilan
```

If the existing repository currently uses a different valid finance route, preserve the actual route unless a safe redirect/alias is added.

The user must be able to reach Helper finances from visible UI.

### Required access points

At minimum:

1. Helper primary navigation:
   - `Penghasilan`

2. Helper self-profile:
   - compact `Saldo tersedia` summary;
   - CTA `Lihat Penghasilan`

3. profile/avatar dropdown may also contain:
   - `Penghasilan`

Recommended Helper navigation:

```text
Beranda
Cari Tugas
Tugas Saya
Penghasilan
Pesan
```

`Penghasilan` should navigate to:

```text
/helper/penghasilan
```

unless the actual canonical route differs and is documented.

---

## 28A.6 Helper profile financial card

Recommended:

```text
PENGHASILAN

Saldo tersedia
Rp450.000

[Lihat Penghasilan →]
```

CTA:

```text
/helper/penghasilan
```

Do not make this card more visually dominant than:
- verification,
- availability,
- services.

---

## 28A.7 Helper `/helper/penghasilan` target structure

Recommended:

```text
Penghasilan

┌────────────────────────────────────────────┐
│ Saldo tersedia                            │
│ Rp450.000                                 │
│                                            │
│ [Tarik Saldo]   // only if actually supported
└────────────────────────────────────────────┘

Pendapatan

Bulan ini
Rp...

Tugas selesai
...

Riwayat Penghasilan

Menemani Mengobrol
+ Rp...

Belanja Kebutuhan
+ Rp...
```

Only include:
- payout,
- withdrawal,
- commission,
- balance history

if they actually exist in current backend/business rules.

Do not create fake finance actions.

---

## 28A.8 Profile dropdown routing rules

Antigravity/Codex MUST audit the profile/avatar dropdown.

For Keluarga, make sure it includes a visible route to:

```text
/saldo
```

For Helper, make sure it includes a visible route to:

```text
/helper/penghasilan
```

if that route is canonical.

If a route currently exists but is hidden:
- add navigation access.

If a route does not yet exist:
- inspect existing financial pages/components before creating a new one;
- do not duplicate an existing finance page under another URL.

---

## 28A.9 Route aliases and backward compatibility

If a finance route is renamed:

Example:

```text
/helper/saldo
→
/helper/penghasilan
```

preserve backward compatibility with:
- redirect,
- route alias,
- or documented canonical migration.

Do not break bookmarked/deep links unnecessarily.

For Family:

```text
/saldo
```

is the required visible destination from this specification.

---

## 28A.10 Mobile navigation

Family mobile bottom navigation remains focused on primary care tasks.

Do NOT replace a primary care tab with `Saldo`.

Saldo should be accessible through:
- avatar/profile menu,
- profile page,
- dashboard shortcut.

Helper mobile bottom navigation SHOULD include:

```text
Beranda
Cari Tugas
Tugas Saya
Penghasilan
Pesan
```

because earnings are a primary Helper workflow.

---

## 28A.11 Acceptance criteria — finance discoverability

Family:

- [ ] `/saldo` can be opened without manually typing the URL.
- [ ] `Saldo Rangkul` appears in the profile/avatar dropdown.
- [ ] Family profile provides a visible finance shortcut.
- [ ] `Demo Wallet` is not the primary user-facing product label.
- [ ] `/saldo` has a clear page title and balance action.
- [ ] demo/sandbox notice is subtle and truthful.

Helper:

- [ ] `Penghasilan` is visible in primary Helper navigation.
- [ ] Helper self-profile shows a compact balance/earnings summary.
- [ ] `Lihat Penghasilan` routes to the canonical finance page.
- [ ] Helper finance is accessible without manual URL entry.
- [ ] public Helper profile never exposes financial information.
- [ ] fake withdrawal or earnings data is not introduced.

---

## 28A.12 Antigravity implementation check

Before marking profile redesign complete, Antigravity MUST manually verify:

```text
Keluarga:
Navbar avatar
→ Saldo Rangkul
→ /saldo

Family Profile
→ Lihat Saldo
→ /saldo
```

and:

```text
Helper:
Primary navigation
→ Penghasilan
→ /helper/penghasilan

Helper Profile
→ Lihat Penghasilan
→ /helper/penghasilan
```

If current canonical Helper finance route differs, use that actual route and document the difference in the final handoff.

No financial feature is considered complete if it exists only as a hidden URL.

# 29. Shared profile typography

```text
Page title: 28–32px
Identity name: 24–28px
Section title: 18–22px
Card title: 16–18px
Body: 14–16px
Metadata: 12–14px
```

Avoid tiny `10px` text for meaningful information.

---

# 30. Interaction rules

Allowed:

- subtle avatar preview;
- 180–220ms card hover;
- availability toggle;
- public preview modal/sheet;
- full-address disclosure;
- skeleton transition.

No:

- parallax;
- floating cards;
- bouncing;
- heavy page entrance animation.

---

# 31. Loading

Replace full-page spinner where practical.

Family skeleton:
- header;
- identity;
- elderly cards.

Helper skeleton:
- identity;
- metrics;
- services;
- trust state.

Avoid blank page + spinner for a profile hub.

---

# 32. Accessibility

Mandatory:

- image alt text;
- visible focus;
- semantic headings;
- minimum 44px touch targets;
- proper buttons/links;
- availability toggle accessible state;
- public preview dialog focus trap;
- verification not color-only;
- 200% zoom;
- long email/address wrapping;
- no horizontal overflow.

---

# 33. Long-content QA

Family:

- 45-character name;
- long email;
- phone missing;
- long domicile;
- zero elderly;
- one elderly;
- five elderly profiles;
- photo missing.

Helper:

- long name;
- 500-char bio;
- 12 service categories;
- zero rating;
- 999 completed tasks;
- 1 km and 50 km radius;
- photo missing;
- verification pending.

---

# 34. Data-source audit

Before visual work, inspect actual sources.

Family:

- `users`;
- auth metadata;
- elderly profiles;
- avatar source;
- phone source;
- address source;
- destination routes.

The current Family page builds some values from authenticated user metadata while other account fields come from the `users` table. Verify the source of truth before polishing the UI.

Do not hide stale/missing data behind design.

Helper:

verify actual availability of:

- `bio`;
- `foto_wajah_url`;
- `is_available`;
- `radius_layanan_km`;
- `rating_avg`;
- `total_tugas_selesai`;
- `saldo_tersedia`;
- `status`;
- `tingkat_kepercayaan`;
- `wilayah_domisili`;
- service categories.

Only surface what is useful and correctly authorized.

---

# 35. Antigravity mandatory workflow

## Pass 0 — required skills

Use:

- `ui-ux-pro-max`
- `gpt-taste` / Taste skill

Write a short design rationale before code changes.

## Pass 1 — repository audit

Read:

```text
docs/TDD_Rangkul.md
src/app/(keluarga)/beranda/profil/page.tsx
src/app/(keluarga)/beranda/profil/edit/page.tsx
src/app/(helper)/helper/profil/edit/page.tsx
src/types/database.ts
related Helper profile API
related elderly profile pages
related verification/privacy logic
```

Determine:
- available data;
- public/private data;
- valid routes;
- actual edit capabilities;
- photo verification behavior;
- whether a Helper self-profile view already exists.

## Pass 2 — Family hierarchy

At 1440px, within 5 seconds user must know:

1. who the account owner is;
2. who the elderly profiles are;
3. how to add another;
4. how to edit account;
5. how to open an elderly profile.

If unclear, redesign.

## Pass 3 — Helper hierarchy

At 1440px, within 5 seconds user must know:

1. verification state;
2. availability;
3. services;
4. service area;
5. real trust/performance evidence;
6. where to edit.

If unclear, redesign.

## Pass 4 — visual polish

Review:

- page padding;
- card padding;
- spacing;
- radius;
- typography;
- line length;
- long data;
- dead whitespace;
- alignment;
- button hierarchy.

Do not accept Tailwind defaults blindly.

## Pass 5 — responsive

Test:

```text
375x812
768x1024
1024x768
1440x900
```

## Pass 6 — interactions

Family:
- edit;
- add elderly;
- view elderly;
- booking CTA if present.

Helper:
- edit;
- availability;
- services;
- public preview;
- financial link if present.

No dead CTA.

## Pass 7 — accessibility

Test:
- keyboard only;
- visible focus;
- 200% zoom;
- touch target;
- no color-only state.

---

# 36. Antigravity rejection criteria

Reject Family implementation if:

- it still looks like a social media profile;
- long address is squeezed into a narrow card;
- elderly photos are ignored;
- the elderly section has a giant empty white container;
- `Demo Wallet` remains one of the loudest elements;
- CTA labels do not match destinations;
- missing data is shown as raw `-`.

Reject Helper implementation if:

- profile is only an edit form;
- availability is buried;
- verification is unclear;
- exact private domicile appears publicly;
- rating `0.0` is used as trust evidence;
- public/private data is mixed;
- services are one unreadable wall of chips.

Reject both if:

- every section becomes another equal white card;
- desktop has large dead whitespace;
- mobile is only desktop stacked;
- padding/radius are inconsistent.

---

# 37. Suggested component architecture

Conceptual:

```text
src/components/profile/
  ProfileIdentityHeader.tsx
  ProfileSection.tsx
  ProfileInfoRow.tsx

src/components/keluarga/profile/
  LovedOneCard.tsx
  LovedOnesSection.tsx
  FamilyAccountInfo.tsx

src/components/helper/profile/
  HelperProfileHeader.tsx
  HelperTrustSummary.tsx
  HelperServiceGroups.tsx
  HelperServiceArea.tsx
  HelperPublicPreview.tsx
```

Do not over-fragment.

Family and Helper should not be forced into identical components when their goals differ.

---

# 38. Quality commands

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
git diff --check
```

Run relevant profile/edit/privacy tests.

Do not silently skip failures.

---

# 39. Final acceptance — Family

- [ ] no generic social cover;
- [ ] identity uses width efficiently;
- [ ] address does not awkwardly wrap in narrow column;
- [ ] missing phone is human-readable;
- [ ] `Orang Tersayang` is the main relationship section;
- [ ] real elderly photos appear when available;
- [ ] add action is not needlessly duplicated;
- [ ] elderly actions have clear hierarchy;
- [ ] Detail/Edit labels match routes;
- [ ] no giant empty content panel;
- [ ] demo wallet does not dominate;
- [ ] `Saldo Rangkul` visibly links to `/saldo` without manual URL entry;
- [ ] mobile is intentional;
- [ ] long-data tests pass.

---

# 40. Final acceptance — Helper

- [ ] dedicated trust/identity overview exists;
- [ ] actual photo appears;
- [ ] verification is obvious;
- [ ] availability is above fold;
- [ ] trust tier is user-friendly;
- [ ] zero rating is not shown as poor rating;
- [ ] completed tasks are real;
- [ ] services grouped by tier;
- [ ] area + radius clear;
- [ ] bio surfaced;
- [ ] public preview exists if practical;
- [ ] public/private data separated;
- [ ] KTP/email/phone/exact address never public;
- [ ] photo-verification behavior explained;
- [ ] Helper `Penghasilan` is visibly accessible from navigation/profile;
- [ ] canonical Helper finance route is reachable without manual URL entry;
- [ ] mobile works;
- [ ] 200% zoom works.

---

# 41. Final handoff required

Antigravity/Codex must report:

## Skills used
- ui-ux-pro-max
- gpt-taste / Taste

## Family changes
What changed and why.

## Helper changes
What changed and why.

## Data-source fixes
Any stale/inconsistent source found.

## Privacy decisions
What is public vs private for Helper.

## Files changed

## Responsive QA
375 / 768 / 1024 / 1440.

## Accessibility
Keyboard / focus / zoom.

## Test results
lint / typecheck / test / build.

## Remaining risks
Real unresolved issues only.

---

# 42. Final design standard

Family should make users think:

> "Ini akun saya, dan dari sini saya bisa langsung melihat serta mengurus orang-orang yang saya sayangi."

Helper should make users think:

> "Profil ini menunjukkan kenapa saya bisa dipercaya, layanan apa yang saya mampu kerjakan, dan apakah saya siap menerima tugas."

The jury should NOT think:

> "Ini template profile card."

or:

> "Ini cuma form edit akun."

**Family = relationship & care management.  
Helper = trust & capability.  
Shared brand, different hierarchy.**