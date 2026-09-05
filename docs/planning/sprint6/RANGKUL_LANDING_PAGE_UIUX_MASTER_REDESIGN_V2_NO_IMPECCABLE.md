# RANGKUL — Landing Page UI/UX Master Redesign Specification v2

> **Audience:** Antigravity and Codex  
> **Scope:** Landing page only: navbar, hero, trust strip, "Apa itu Rangkul?", cara kerja, layanan, Riwayat Rangkul, community trust, role explorer, final CTA, footer, responsive behavior, interaction, animation, accessibility, performance, and visual QA.  
> **Target repository:** `Elnathz/rangkul`  
> **Target branch:** `develop`  
> **Primary product specification:** `docs/TDD_Rangkul.md`  
> **Design goal:** make Rangkul immediately understandable, visually memorable, emotionally relevant, and polished enough to be judged as a serious product rather than a generic competition website.

---

# 0. Executive Design Decision

The landing page MUST follow this story:

```text
NAVBAR
↓
HERO
"Kenapa saya harus peduli?"
↓
TRUST STRIP
"Apakah ini aman dan jelas?"
↓
APA ITU RANGKUL?
"Produk ini sebenarnya apa?"
↓
CARA KERJA
"Kalau saya pakai, alurnya bagaimana?"
↓
LAYANAN
"Apa saja yang bisa dilakukan?"
↓
RIWAYAT RANGKUL
"Apa pembeda produknya?"
↓
COMMUNITY TRUST
"Kenapa saya bisa percaya?"
↓
PILIH PERAN
"Saya masuk sebagai siapa?"
↓
FINAL CTA
"Apa langkah berikutnya?"
↓
FOOTER
```

This order is intentional.

Do NOT move "Apa itu Rangkul?" below services.

The section exists to establish the user's mental model before explaining workflows and features.

---

# 1. Mandatory Execution Rules

Before touching code:

1. Read FULL `docs/TDD_Rangkul.md`.
2. Read all current landing components under `src/components/landing/`.
3. Inspect current navbar/header implementation.
4. Inspect current footer.
5. Inspect `src/app/page.tsx`.
6. Inspect current typography, colors, radius, spacing, shadows, and motion usage.
7. Inspect auth-aware behavior.
8. Inspect whether Framer Motion is already present.
9. Inspect actual routes before adding navigation or footer links.
10. Never invent:

- testimonial,
- rating,
- user count,
- response time,
- GMV,
- service fee,
- fake tax,
- fake income,
- medical claims.

Do not stop after an audit. Implement the redesign after documenting the audit.

---

# 2. Mandatory Design Skills

Before major UI work, use/apply:

- `ui-ux-pro-max`
- `gpt-taste`
- `design-taste-frontend` if available

These skills must influence actual decisions for:

- information hierarchy,
- composition,
- visual rhythm,
- spacing,
- padding,
- corner radius,
- typography,
- density,
- motion,
- responsive behavior,
- interaction,
- accessibility,
- anti-template review.

If unavailable, state it honestly in the final handoff.

---

# 3. Jury-Level Diagnosis of the Current Landing

The existing page is already:

- clean,
- legible,
- calm,
- consistent,
- truthful,
- visually coherent,
- materially better than a default competition landing page.

However, it still has three major weaknesses.

## 3.1 Repetitive Visual Grammar

Too many sections use:

```text
heading
paragraph
3 equal cards
```

Examples include:

- Cara Kerja,
- trust/control section,
- role section,
- scenario section.

This creates visual fatigue.

The page looks polished but predictable.

---

## 3.2 Product Mental Model Is Underexplained

The current hero explains the emotional promise, but users may still not immediately understand:

- what Rangkul actually is,
- who Helper is,
- why Koordinator exists,
- how family remains in control,
- what makes Rangkul different from a caregiver marketplace.

This is why the new **"Apa itu Rangkul?"** section is mandatory.

---

## 3.3 Hero Is Product-UI Heavy but Human-Light

Current floating snapshot cards are visually neat, but they feel like:

> UI component showcase

Rangkul is about people, care, trust, and distance.

The hero needs a **human focal point**.

The redesign should combine:

> **3D elderly character + Rangkul product snapshot**

not card-only composition.

---

# 4. Final Landing Structure — LOCKED

```text
1. Sticky Navbar

2. Hero
   - emotional value proposition
   - concise copy
   - 3D elderly character
   - product snapshot
   - primary CTA

3. Trust Strip
   - community verification
   - transparent price
   - visit report

4. Apa itu Rangkul?
   - product definition
   - problem → solution explanation
   - product ecosystem diagram
   - compact proof points

5. Cara Kerja
   - connected 3-step journey

6. Layanan
   - 6 normal service cards
   - special Kontrol Kesehatan panel

7. Riwayat Rangkul
   - interactive product demo

8. Community Trust
   - Helper → Koordinator → Keluarga trust mechanism

9. Pilih Peran
   - interactive role explorer

10. Final CTA
   - auth-aware

11. Footer
```

Do not add another generic 3-card section unless it serves a genuinely different information structure.

---

# 5. Global Layout System

## 5.1 Main Container

```text
max-width: 1200–1240px
preferred: 1220px
margin-inline: auto
```

Do not stretch content to full browser width on large screens.

---

## 5.2 Horizontal Padding

```text
375px     16px
640px     20px
768px     24px
1024px    28px
1280px+   32px
```

---

## 5.3 Section Spacing

Desktop:

```text
default: 96px vertical
compact: 72px
hero: 80–96px top, 88–104px bottom
```

Tablet:

```text
72–80px
```

Mobile:

```text
56–64px
```

Important:

- not every section must have identical height,
- avoid accidental 150–200px blank areas,
- visual breathing room must look intentional.

---

# 6. Spacing Scale

Use consistent increments:

```text
4
8
12
16
20
24
28
32
40
48
64
80
96
```

Recommended use:

```text
icon → text: 10–12px
title → paragraph: 8–12px
paragraph → CTA: 20–24px
section label → H2: 8px
H2 → intro: 16px
intro → visual/content: 32–48px
card padding: 20–24px
large product panel padding: 28–32px
```

---

# 7. Radius / Corner System

Use:

```text
small control: 10px
button: 10–12px
default card: 16px
step/process card: 18px
large panel: 22–24px
hero visual surface: 24–28px
chip/badge: pill or 8px
```

Rules:

- do not use `rounded-3xl` everywhere,
- nested surfaces should not visually fight their parent radius,
- buttons do not need to be pills,
- pills are for compact semantic states.

---

# 8. Typography

Fonts:

- Plus Jakarta Sans — headings
- Instrument Sans — body

Recommended:

```text
H1 desktop:
56–64px
line-height 1.05–1.10
max-width ~620px

H1 mobile:
38–44px

H2 desktop:
38–44px

H2 mobile:
28–32px

Body intro:
16–18px
line-height 1.6–1.7

Body card:
14–16px

Eyebrow:
12–13px
font-weight 700
letter spacing restrained
```

Avoid:

- tiny body copy,
- excessive uppercase,
- overly gray body text.

---

# 9. Color Rules

Primary:
`#0D47A1`

Sky:
`#90CAF9`

Background:
`#F5F8FC`

Main text:
`#16233A`

Muted:
`#6B7A90`

Border:
`#DCE6F1`

Semantic:

- green = success / verified / completed
- amber = attention / approval / waiting
- red = danger / destructive / emergency

Do not use random accent colors only for decoration.

---

# 10. NAVBAR

# 10.1 Goal

Navbar must communicate:

1. where users can learn,
2. what the main action is,
3. who the logged-in user is.

The navbar should not only be an anchor list.

---

# 10.2 Logged-In Keluarga Desktop

Recommended structure:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Rangkul     Layanan   Cara Kerja   Riwayat Rangkul                    │
│                                 🔔  Mbak Burgas  [Buat Kunjungan]      │
└────────────────────────────────────────────────────────────────────────┘
```

Layout:

LEFT:

- logo

CENTER:

- Layanan
- Cara Kerja
- Riwayat Rangkul

RIGHT:

- notification
- avatar/name dropdown
- primary CTA

---

# 10.3 Guest Desktop

```text
Rangkul     Layanan   Cara Kerja   Riwayat Rangkul

                                      Masuk   [Mulai Sekarang]
```

---

# 10.4 Navbar Dimensions

```text
height: 68–72px
preferred: 70px

logo visual height: 34–38px
link target height: >=44px
CTA height: 42–44px
```

---

# 10.5 Sticky State

Navbar is sticky.

Initial:

- white,
- subtle bottom border.

Scrolled:

- rgba white 0.88–0.94,
- backdrop blur 10–12px,
- slightly stronger border,
- very subtle shadow.

Do not create obvious glassmorphism.

---

# 10.6 Scroll Spy

Active nav item changes based on visible section.

Use:

- 2px underline,
- animated indicator,
- text color shift.

Do not use giant active pills.

Duration:
`180–220ms`.

---

# 11. HERO

# 11.1 Hero Responsibility

Hero only needs to answer:

> "Kenapa saya harus peduli?"

Do NOT force the hero to explain the entire product.

The detailed explanation belongs in **Apa itu Rangkul?**

This is important to avoid copy repetition.

---

# 11.2 Hero Copy

H1:

> **Merangkul Jarak, Menjaga yang Tersayang**

Recommended body:

> Pendamping lokal terverifikasi untuk membantu keluarga tetap dekat, mengikuti kabar, dan menjaga orang tersayang dari mana saja.

This is intentionally shorter than the old explanation.

Primary CTA:
`Buat Kunjungan`

Secondary:
`Lihat Cara Kerja`

---

# 11.3 Desktop Composition

```text
LEFT 45–47%
RIGHT 53–55%
```

Concept:

```text
LEFT                                RIGHT

eyebrow                             Memory Capsule
H1                                     ╲
short description
CTA row                           [3D Ibu Ratna]
                                        ╲
                                  [Rangkul Snapshot]

                              [Verified Community]
```

Hero height:
`650–720px` excluding navbar.

---

# 11.4 3D Human Focal Point

Use a premium stylized 3D elderly Indonesian woman.

Recommended fictional identity:
`Ibu Ratna`

Visual direction:

- 60–70 years old,
- friendly,
- relaxed,
- modest home clothing,
- warm natural expression,
- seated on comfortable chair/sofa,
- no hospital environment,
- no medical equipment,
- no exaggerated cartoon proportions.

This is an illustration, not a real user.

---

# 11.5 Hero Product Snapshot

Use actual HTML/CSS UI, not baked image text.

Example:

```text
CONTOH TAMPILAN

Ibu Ratna

Kunjungan hari ini
Menemani Mengobrol
Selesai · 16.53

Health Snapshot
Energi        Stabil
Mood          Tenang
Mobilitas     Tercatat

Cerita hari ini
"Ibu Ratna menikmati waktu mengobrol..."
```

Keep `Contoh Tampilan` visible.

Do not make medical claims.

---

# 11.6 3D Asset Strategy

Preferred:

> custom prerendered transparent 3D asset.

Use:

- WebP/AVIF,
- transparent,
- 2x,
- optimized,
- preferably under ~300–450 KB.

Do NOT scrape random assets from unknown websites.

If third-party:

- verify license,
- store locally if allowed,
- document source,
- optimize.

---

# 11.7 Spline / Live 3D

Do not use Spline merely because it looks impressive.

Only use if:

- asset materially benefits,
- load cost acceptable,
- mobile smooth,
- fallback exists,
- reduced-motion works,
- static image fallback exists.

Preferred competition strategy:
**prerendered 3D + Framer Motion.**

---

# 11.8 Hero Layers

Use max:

1. soft background orb,
2. 3D elderly character,
3. main product snapshot,
4. one Memory Capsule chip,
5. one verification/status chip.

Do NOT add 7–10 floating cards.

---

# 11.9 Hero Motion

Entrance:

```text
copy:
opacity 0→1
y 16→0
450ms

character:
opacity 0→1
scale .97→1
600ms

snapshot:
opacity 0→1
y 20→0
rotate 2deg→0
650ms

chips:
stagger 80ms
```

Pointer parallax:

- ±6–10px movement,
- ±1.5deg rotation max.

Reduced motion:

- no transforms,
- immediate final state.

---

# 12. TRUST STRIP

Keep exactly three product truths:

```text
Diverifikasi komunitas lokal
Harga transparan sejak awal
Laporan setiap kunjungan
```

Visual:

- no card,
- inline row,
- icon 18px,
- text 14px semibold,
- subtle divider.

Desktop:
3 equal groups.

Mobile:
stack or horizontally scroll only if necessary.

---

# 13. APA ITU RANGKUL? — NEW MANDATORY SECTION

This is the major new addition.

# 13.1 Purpose

Answer:

> "Website/platform ini sebenarnya tentang apa?"

A first-time jury member should understand the product without needing to infer it from later sections.

---

# 13.2 Placement

Immediately after Trust Strip.

Order:

```text
Hero
Trust Strip
Apa itu Rangkul?
Cara Kerja
```

Do NOT place it after services.

---

# 13.3 Section Headline

Eyebrow:

`APA ITU RANGKUL?`

Headline:

> **Pendampingan lansia yang tetap terasa dekat, meski keluarga berada jauh.**

Body:

> Rangkul adalah platform pendampingan lansia berbasis komunitas yang menghubungkan keluarga dengan Helper lokal terverifikasi. Keluarga dapat membuat kunjungan sesuai kebutuhan, sementara setiap hasil pendampingan dicatat menjadi Riwayat Rangkul agar kondisi dan cerita orang tersayang tetap dapat diikuti dari waktu ke waktu.

Do not use:

- "ecosystem",
- "holistic",
- "seamless",
- generic startup jargon.

---

# 13.4 Visual Structure

Do NOT make three generic cards.

Use split layout.

Desktop:

```text
┌──────────────────────────────────────────────────────────────────┐

 LEFT 44%                                RIGHT 56%

 APA ITU RANGKUL?                        [ecosystem diagram]

 Pendampingan lansia yang                KELUARGA
 tetap terasa dekat...                       ●
                                             │
 paragraph                              ┌────▼────┐
                                        │ RANGKUL │
 ✓ Helper lokal terverifikasi           └────┬────┘
 ✓ Keluarga tetap memegang keputusan         │
 ✓ Setiap kunjungan menjadi catatan          ▼
                                        HELPER / KOORDINATOR
                                             │
                                             ▼
                                      ORANG TERSAYANG

 [Lihat Cara Kerja ↓]

└──────────────────────────────────────────────────────────────────┘
```

---

# 13.5 Better Ecosystem Diagram

Use a more refined composition:

```text
                       KELUARGA
                          ●
                         ╱ ╲
                        ╱   ╲
                       ╱     ╲
             ┌────────────────────┐
             │       RANGKUL      │
             │                    │
             │  Jadwal Kunjungan  │
             │  Pendampingan      │
             │  Riwayat Rangkul   │
             └────────────────────┘
                  ╱          ╲
                 ╱            ╲
                ●              ●
             HELPER       KOORDINATOR
                ╲              ╱
                 ╲            ╱
                  ▼          ▼
                  ORANG TERSAYANG
```

Do not make it too technical.

The diagram should explain:

- family,
- helper,
- coordinator,
- elderly,
- Rangkul as the orchestration layer.

---

# 13.6 Inline Proof Points

Use inline list, not cards:

```text
✓ Helper lokal terverifikasi komunitas
✓ Keluarga tetap memegang keputusan penting
✓ Setiap kunjungan menjadi Riwayat Rangkul
```

Use check icon 18px.

Spacing:

- 12–14px between rows.

---

# 13.7 Animation

On viewport entry:

1. central Rangkul node appears,
2. Family node appears,
3. Helper and Coordinator appear,
4. connecting lines draw,
5. elderly node appears,
6. proof points fade in.

Total:
`700–1000ms`.

Do not loop.

Reduced motion:

- show complete diagram instantly.

---

# 13.8 Mobile Layout

Order:

```text
Eyebrow
Headline
Paragraph
Proof points
Diagram
CTA
```

Diagram may simplify to:

```text
Keluarga
   ↓
Rangkul
↙     ↘
Helper Koordinator
   ↓
Orang Tersayang
```

No horizontal overflow.

---

# 14. CARA KERJA

Do not use three visually isolated cards.

Use connected progression.

Desktop:

```text
01                       02                       03

Ceritakan kebutuhan ───▶ Pendamping menerima ───▶ Pantau kabar
kunjungan                tugas                     & Riwayat
```

Each step may still have a surface, but the connector is mandatory.

---

# 14.1 Animation

On entry:

- step 1 appears,
- line animates,
- step 2 appears,
- line animates,
- step 3 appears.

Total under `1.2s`.

Do not hijack scroll.

---

# 14.2 Copy

Step 1:
`Ceritakan kebutuhan kunjungan`

Step 2:
`Pendamping yang sesuai menerima tugas`

Step 3:
`Pantau kabar dan Riwayat Rangkul`

Keep descriptions concise.

---

# 15. LAYANAN

# 15.1 Existing Problem

There are 7 services.

A 3-column grid creates:

```text
3
3
1
```

Leaving `Kontrol Kesehatan` alone.

This looks unfinished.

---

# 15.2 New Layout

Use:

```text
ROW 1
Antar Obat
Pengingat Obat
Belanja Kebutuhan

ROW 2
Menemani Mengobrol
Bersih Rumah Ringan
Bantuan Teknologi

SPECIAL ROW
Kontrol Kesehatan
```

---

# 15.3 Special Kontrol Kesehatan Panel

Full width or 2/3 width.

Desktop horizontal layout:

```text
┌──────────────────────────────────────────────────────────────┐
│ icon   Kontrol Kesehatan                                    │
│        Pendampingan ke fasilitas kesehatan                  │
│                                                              │
│        [Perlu Persetujuan Koordinator]                       │
│                                       Rp120.000 · 90 menit   │
└──────────────────────────────────────────────────────────────┘
```

This visual difference must communicate actual business-rule difference.

Use amber/info tone.

Not danger red.

---

# 15.4 Card Interaction

Hover:

- border blue shift,
- shadow increases slightly,
- icon moves 1–2px,
- arrow moves 3–4px.

Maximum translate:
`-2px`.

No scaling.

---

# 16. RIWAYAT RANGKUL — SECOND WOW MOMENT

After hero, this must be the most memorable product section.

---

# 16.1 Layout

Desktop:

```text
LEFT 42%
copy
benefits
CTA

RIGHT 58%
interactive product mockup
```

Use soft sky background.

---

# 16.2 Headline

Eyebrow:
`RIWAYAT RANGKUL`

Headline:

> **Bukan sekadar kunjungan. Lihat perubahan dari waktu ke waktu.**

Keep this.

---

# 16.3 Interactive Mockup

Use:

```text
CONTOH TAMPILAN
Ibu Ratna                         27 Agustus 2026

Health Snapshot

Energi
Membaik          mini trend

Mood
Stabil           mini trend

Mobilitas
Perlu perhatian  mini trend

CERITA HARI INI

"Hari ini Ibu menikmati waktu mengobrol..."

[Hari Ini] [7 Hari] [30 Hari]
```

---

# 16.4 Interaction

Tabs:

- Hari Ini
- 7 Hari
- 30 Hari

Click changes:

- indicator status,
- mini trend,
- summary copy.

Do not imply live data.

All example data stays clearly marked.

---

# 16.5 Motion

On section entry:

- mockup reveals,
- trend lines draw,
- chips appear.

On tab change:

- 180–260ms crossfade,
- subtle number transition.

No endless animation.

---

# 17. COMMUNITY TRUST — REPLACE GENERIC TRUST CARDS

The goal is to explain:

> "Kenapa Rangkul bisa dipercaya?"

Use a mechanism diagram.

---

# 17.1 Headline

Eyebrow:
`KEPERCAYAAN KOMUNITAS`

Headline:

> **Kepercayaan tidak hanya datang dari profil.**

Body:

> Helper diverifikasi di komunitas domisilinya, Koordinator membantu menjaga proses verifikasi dan tindakan tertentu, sementara keluarga tetap memegang keputusan penting.

---

# 17.2 Flow Diagram

```text
HELPER                KOORDINATOR                  KELUARGA
  ●                         ●                          ●
  │                         │                          │
  └──── profil ───────────▶ │                          │
                            └──── diverifikasi ───────▶│
                                                       │
                 tindakan tertentu ◀──── approval ─────┘
```

Or:

```text
[Helper]
   ↓ verification
[Koordinator]
   ↓ trusted availability
[Keluarga]
   ↓ decides / approves
[Pendampingan]
```

Use actual business model.

---

# 17.3 Animation

Scroll reveal:

- nodes appear,
- line draws,
- verification marker appears.

No looping.

---

# 18. PILIH PERAN — ROLE EXPLORER

Replace static three equal cards.

---

# 18.1 Desktop

Use interactive selector:

```text
┌──────────────────┬──────────────────────────────────────────────┐
│ ● Keluarga       │                                              │
│   Helper         │ KELUARGA                                    │
│   Koordinator    │                                              │
│                  │ Atur kunjungan dan pantau orang tersayang.  │
│                  │                                              │
│                  │ ✓ Buat kunjungan                            │
│                  │ ✓ Pantau Riwayat                            │
│                  │ ✓ Kendali persetujuan                       │
│                  │                                              │
│                  │ [Daftar sebagai Keluarga]                   │
└──────────────────┴──────────────────────────────────────────────┘
```

---

# 18.2 Mobile

Segmented tabs:

```text
[Keluarga] [Helper] [Koordinator]
```

One detail panel below.

---

# 18.3 Accent

Keluarga:
subtle teal

Helper:
subtle amber

Koordinator:
subtle indigo

Do not recolor the entire panel.

---

# 19. REMOVE "CONTOH SKENARIO DEMO" AS A LARGE SECTION

Do not retain a large section that says:

> "Bukan klaim pengalaman pengguna..."

It sounds defensive and interrupts product storytelling.

If a demo explanation is needed:

- use small label `Ilustrasi alur`,
- merge content into Community Trust or Role Explorer.

---

# 20. FINAL CTA

Use the blue section as a strong visual stop.

---

# 20.1 Logged-In Keluarga

Headline:

> **Mulai dari satu kunjungan yang lebih tenang.**

Body:

> Pilih layanan, atur jadwal, dan tetap ikuti kabar orang tersayang melalui Rangkul.

CTA:
`Buat Kunjungan`

Secondary:
`Lihat Layanan →`

---

# 20.2 Guest

Primary:
`Mulai sebagai Keluarga`

Secondary:
`Daftar sebagai Helper`

Do not display irrelevant CTAs based on known user role.

---

# 21. FOOTER

# 21.1 Current Issues to Fix

- too sparse,
- competition credit too prominent,
- limited information architecture,
- missing product closure.

---

# 21.2 Recommended Structure

```text
RANGKUL

Pendampingan lokal untuk membantu
keluarga tetap dekat dengan orang tersayang.

Produk                 Bergabung              Bantuan
Layanan                Keluarga               ...
Cara Kerja             Helper
Riwayat Rangkul        Koordinator

────────────────────────────────────────────────────────────

© 2026 Rangkul
```

Only add help/legal links if actual routes exist.

---

# 21.3 Competition Credit

If needed:

`Dikembangkan untuk ITechno Cup 2026.`

Display as small secondary text.

Do not make competition identity stronger than product identity.

---

# 22. Motion System

Use one primary animation system.

Preferred:

- Framer Motion if already installed.

Do not mix multiple libraries unnecessarily.

---

# 22.1 Motion Tokens

```text
fast: 160ms
default: 220ms
medium: 360ms
reveal: 450–650ms
sequence max: 1200ms
```

---

# 22.2 Scroll Reveal

Animate only important moments:

- hero,
- Apa itu Rangkul diagram,
- Cara Kerja connector,
- Riwayat mockup,
- Community Trust flow,
- Role Explorer content switch.

Do not animate every paragraph.

---

# 22.3 Hover

Card:

- translateY max `-2px`

Arrow:

- translateX `3–4px`

Border:

- subtle brand shift

Shadow:

- small increase

No:

- 1.05 scale,
- excessive spring,
- bouncing.

---

# 22.4 Reduced Motion

Respect:

```css
@media (prefers-reduced-motion: reduce);
```

Disable:

- parallax,
- sequential line drawing,
- entrance transforms.

Keep content immediately available.

---

# 23. Interactive System

Add purposeful interactivity:

1. sticky navbar scroll spy
2. subtle hero parallax
3. Apa itu Rangkul diagram reveal
4. Cara Kerja line animation
5. service hover
6. Riwayat period switch
7. Community Trust flow reveal
8. Role Explorer tabs
9. CTA arrow microinteraction

Do not add interactivity where it does not help understanding.

---

# 24. Hero 3D Performance Rules

Requirements:

- H1 must render before 3D asset completion,
- no blocking external scene,
- known image dimensions,
- responsive `sizes`,
- no 4K PNG,
- no autoplay video,
- no large WebGL payload,
- static fallback.

Target asset:
`300–450 KB preferred`, not a strict claim.

---

# 25. Mobile Layout

# 25.1 Hero

Order:

```text
eyebrow
H1
body
CTA
3D visual
trust strip
```

3D visual height:
`320–390px`.

Keep:

- one main snapshot,
- one secondary chip.

Remove extra floating objects.

---

# 25.2 Apa itu Rangkul

Order:

```text
label
headline
paragraph
proof points
diagram
CTA
```

---

# 25.3 Cara Kerja

Convert horizontal process to vertical:

```text
01
│
02
│
03
```

Connector runs vertically.

---

# 25.4 Services

```text
1 column
special panel stacked
```

---

# 25.5 Riwayat

Copy first.
Interactive panel below.

No tiny side-by-side layout.

---

# 25.6 Role Explorer

Tabs above.
Single panel below.

---

# 26. Accessibility

Mandatory:

- one H1,
- logical heading order,
- skip link,
- sticky anchor offset,
- visible focus,
- 44x44 targets,
- semantic nav,
- semantic tabs,
- keyboard accessible role explorer,
- keyboard accessible Riwayat tabs,
- proper aria selected,
- reduced motion,
- WCAG AA contrast,
- 200% zoom,
- no horizontal page clipping.

---

# 27. Anti-Template Gate

Reject:

- repeated 3-card sections,
- random glow,
- random blobs,
- fake testimonials,
- fake metrics,
- random 3D decorations,
- meaningless charts,
- giant gradients,
- excessive pills,
- every card `rounded-3xl`,
- micro text,
- overuse of uppercase,
- hover animation on everything.

The page must feel specifically designed for Rangkul.

---

# 28. Anti-Overdesign Gate

Do not solve "boring" by adding too many effects.

A good hierarchy:

```text
Hero             = strongest visual
Riwayat Rangkul  = second strongest visual
Apa itu Rangkul  = strongest explanatory visual
Community Trust  = strongest trust visual
Everything else  = support
```

---

# 29. Exact Transformation Matrix

| Current area    | New decision                               |
| --------------- | ------------------------------------------ |
| Navbar          | sticky + scroll spy + primary CTA          |
| Hero            | 3D elderly + HTML product snapshot         |
| Trust Strip     | retain, refine                             |
| Apa itu Rangkul | NEW split storytelling + ecosystem diagram |
| Cara Kerja      | connected animated journey                 |
| Services        | 6 normal + 1 special panel                 |
| Riwayat         | interactive demo                           |
| Trust cards     | replace with mechanism flow                |
| Role cards      | replace with role explorer                 |
| Scenario demo   | remove/merge                               |
| CTA             | auth-aware                                 |
| Footer          | fuller but only real links                 |

---

# 30. Antigravity Implementation Instructions

Antigravity MUST perform actual browser inspection.

For each section:

1. open local page,
2. inspect at 1440x900,
3. inspect at 375x812,
4. inspect at 768x1024,
5. inspect at 1024x768,
6. inspect spacing,
7. inspect alignment,
8. inspect radius,
9. inspect text wrapping,
10. inspect hover,
11. inspect sticky navbar,
12. inspect scroll-spy,
13. inspect animation smoothness,
14. inspect reduced motion,
15. inspect 200% zoom,
16. fix issues rather than only report them.

Mandatory three-pass review:

### Pass 1

Visual structure:

- layout,
- spacing,
- padding,
- radius,
- typography.

### Pass 2

Interaction:

- hover,
- tabs,
- scroll,
- animation,
- CTA.

### Pass 3

Responsive/accessibility:

- mobile,
- keyboard,
- zoom,
- reduced motion.

---

# 31. Codex Implementation Instructions

Codex MUST:

1. inspect existing code,
2. avoid rewriting working backend,
3. reuse components when clean,
4. split oversized landing components,
5. avoid unnecessary `use client`,
6. keep demo data isolated,
7. preserve real pricing/service data,
8. validate routes,
9. use local licensed/custom assets,
10. avoid large dependency additions,
11. run lint/typecheck/test/build,
12. document any deviation.

---

# 32. Suggested Components

```text
src/components/landing/
  LandingNavbar.tsx
  HeroSection.tsx
  HeroVisual.tsx
  HeroSnapshotCard.tsx
  TrustStrip.tsx
  AboutRangkulSection.tsx
  RangkulEcosystemDiagram.tsx
  JourneySection.tsx
  ServicesSection.tsx
  SpecialServiceCard.tsx
  RiwayatDemoSection.tsx
  RiwayatDemoPanel.tsx
  CommunityTrustSection.tsx
  RoleExplorerSection.tsx
  FinalCTASection.tsx

src/components/layout/
  Footer.tsx

src/lib/
  landing-demo-data.ts
```

Adapt filenames to existing architecture where appropriate.

---

# 33. Suggested Demo Data Separation

Example:

```ts
export const RIWAYAT_DEMO_DATA = {
  personName: "Ibu Ratna",
  ...
};
```

Never mix demo state into actual API response.

---

# 34. Visual QA Checklist

Before accepting each section:

## Hierarchy

- is first glance correct?
- is primary action obvious?
- does section support the page story?

## Padding

- is internal spacing consistent?
- does content feel cramped or loose?

## Radius

- are surfaces appropriately rounded?
- are pills only used where semantically appropriate?

## Typography

- clear hierarchy?
- readable body?
- line length controlled?

## Color

- semantic?
- not over-blue?
- warning/success meaningful?

## Motion

- helps comprehension?
- not distracting?
- reduced-motion compatible?

## Responsive

- 375?
- 768?
- 1024?
- 1440?

If any answer is no, section is not accepted.

---

# 35. Required QA States

Test:

- guest
- logged-in Keluarga
- long username
- 99+ notification
- slow asset load
- missing optional image
- reduced motion
- keyboard only
- 200% zoom

---

# 36. Performance Rules

Before completion:

- hero H1 not blocked,
- no CLS,
- local 3D asset optimized,
- below-fold assets lazy-load,
- no unnecessary JS,
- no animation running forever,
- scroll remains smooth.

If Lighthouse is run, report measured values honestly.

Do not fabricate scores.

---

# 37. Build / Quality Commands

Run available equivalents:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
git diff --check
```

Do not silently ignore failures.

---

# 38. Final Acceptance Criteria

Landing is NOT done until:

- [ ] Hero is concise, not over-explaining.
- [ ] 3D human focal point is present.
- [ ] Hero product snapshot is HTML-based and readable.
- [ ] Trust strip remains concise.
- [ ] "Apa itu Rangkul?" exists directly after Trust Strip.
- [ ] "Apa itu Rangkul?" explains product clearly.
- [ ] "Apa itu Rangkul?" uses ecosystem storytelling, not another 3-card grid.
- [ ] Cara Kerja shows a connected journey.
- [ ] Services grid no longer leaves one lonely card.
- [ ] Kontrol Kesehatan has special layout based on actual business logic.
- [ ] Riwayat Rangkul is interactive.
- [ ] Community trust is shown as a mechanism.
- [ ] Role selection is interactive.
- [ ] Scenario demo section is removed or merged.
- [ ] Final CTA is auth-aware.
- [ ] Footer contains only real links.
- [ ] No fake metrics.
- [ ] No fake testimonial.
- [ ] No fake medical claim.
- [ ] Navbar scroll spy works.
- [ ] All click targets >=44px.
- [ ] Keyboard navigation works.
- [ ] Reduced motion works.
- [ ] 200% zoom works.
- [ ] 375 / 768 / 1024 / 1440 visually reviewed.
- [ ] lint passes.
- [ ] typecheck passes.
- [ ] tests pass.
- [ ] build passes.

---

# 39. Final Handoff Required from Antigravity/Codex

Provide:

## A. UX audit

What problems were found.

## B. Final section structure

Exact order.

## C. "Apa itu Rangkul?" implementation

Explain:

- layout,
- diagram,
- copy,
- animation,
- mobile behavior.

## D. Hero 3D strategy

- source,
- license,
- file type,
- size,
- fallback.

## E. Motion system

List all interactions.

## F. Files changed

Important files.

## G. Visual QA

375 / 768 / 1024 / 1440.

## H. Accessibility

Keyboard, focus, zoom, reduced motion.

## I. Performance

Measured results if available.

## J. Test results

lint, typecheck, test, build.

## K. Remaining risk

Only actual unresolved issues.

---

# 40. Final Design Standard

The landing should create five clear memories:

1. **"Merangkul Jarak, Menjaga yang Tersayang."**
2. **3D Ibu Ratna + Rangkul snapshot.**
3. **"Oh, jadi Rangkul itu platform pendampingan lansia berbasis komunitas."**
4. **Riwayat Rangkul is more than a visit log.**
5. **Trust comes from Helper + Koordinator + Family control.**

The strongest judge reaction should be:

> "Saya paham produknya, saya tahu bedanya, dan visualnya memang dibuat khusus untuk konsep ini."

Not:

> "Ini landing page yang bersih."

The target is **clarity + trust + memorability + product-specific visual storytelling**.
