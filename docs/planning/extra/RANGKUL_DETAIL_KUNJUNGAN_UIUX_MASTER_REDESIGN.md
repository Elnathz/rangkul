# RANGKUL — Detail Kunjungan UI/UX Master Redesign Specification

> **Audience:** Antigravity and Codex
> **Scope:** Halaman detail kunjungan Keluarga (`/kunjungan/[id]`) untuk seluruh lifecycle task.
> **Target repository:** `Elnathz/rangkul`
> **Target branch:** `develop`
> **Primary implementation:** `src/components/keluarga/RealTaskDetailClient.tsx` dan komponen terkait.
> **Primary product truth:** `docs/TDD_Rangkul.md` dan state machine aktual.
> **Design objective:** membuat halaman detail kunjungan terasa seperti **mission control untuk satu pendampingan**, bukan sekadar halaman detail record/database.

---

# 0. Core UX Principle

Halaman detail kunjungan TIDAK boleh memiliki layout statis yang sama untuk semua status.

Pertanyaan utama user berbeda berdasarkan lifecycle.

## Menunggu Persetujuan Koordinator

User bertanya:

> "Kenapa belum jalan, siapa yang sedang memproses, dan apa yang harus saya lakukan?"

## Mencari Pelamar

User bertanya:

> "Sudah ada Helper yang melamar belum, siapa yang cocok, dan apa langkah berikutnya?"

## Sedang / Akan Dikerjakan

User bertanya:

> "Kapan kunjungan dimulai, siapa Helper-nya, di mana, dan tindakan saya apa?"

## Selesai

User bertanya:

> "Apa hasil kunjungannya, bagaimana kondisi lansia, dan apa yang harus saya baca/konfirmasi?"

## Dibatalkan

User bertanya:

> "Kenapa batal, apa dampaknya pada pembayaran, dan apa yang bisa saya lakukan selanjutnya?"

**UI harus berubah berdasarkan pertanyaan tersebut.**

---

# 1. Hard Critique of Current Implementation

## 1.1 Giant elderly photo dominates every state

Current detail page gives the elderly photo an extremely large area.

This creates several UX problems:

- the photo becomes more important than task status;
- the page becomes very long;
- actionable information moves below the fold;
- waiting/applicant/cancelled states waste large vertical space;
- the photo visually behaves like a hero banner, even though this is an operational page.

A detail task page should prioritize:

1. lifecycle status,
2. next action,
3. schedule,
4. Helper,
5. location,
6. task outcome.

The elderly photo is identity context, not the primary task.

### New rule

Default elderly profile representation:

```text
avatar/image: 72–96px
name
relationship/age if available
compact address/location
```

A larger photo is allowed only inside:
- profile page,
- image preview modal,
- evidence/report content if contextually useful.

Do NOT render a 600px-wide portrait as the main body of every task detail.

---

# 2. Current Header Problems

Current hierarchy resembles:

```text
Back
DETAIL KUNJUNGAN
full UUID

status badge
service title
description

TOTAL SAAT INI
Rp...
```

Problems:

- raw UUID is visually prominent;
- status is only a small badge;
- price is more visually dominant than "what happens next";
- no lifecycle progression;
- no clear "next step";
- title region consumes space without solving the user's current uncertainty.

## New header hierarchy

```text
← Kunjungan

Menemani Mengobrol
Untuk Giorno

[STATUS]

short state explanation

#8F95E654                           Rp50.000
```

Raw full UUID should not be primary UI.

Use:
- shortened task reference,
- full UUID only in expandable metadata/copy action if necessary.

---

# 3. Replace Static Detail Page with State-Aware Experience

Use one shared shell but state-specific main content.

Shared:

```text
Breadcrumb / back
Task header
Lifecycle stepper
Task essentials
Contextual state content
Payment summary
```

State-specific:

```text
pending coordinator
applicant mode
confirmed / scheduled
in progress
completed
cancelled
```

---

# 4. Final Desktop Master Layout

Preferred page width:

```text
max-width: 1180–1220px
```

Desktop grid:

```text
MAIN  minmax(0, 1fr)
SIDE  300–320px
gap   24px
```

Concept:

```text
┌────────────────────────────────────────────────────────────────────┐
│ ← Kunjungan                                                        │
│                                                                    │
│ Menemani Mengobrol                             #8F95E654            │
│ Untuk Giorno                                   Rp50.000            │
│ [Status]                                                           │
│ state explanation                                                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Lifecycle Stepper                                                │
│  ○ Diajukan ── ● Persetujuan ── ○ Dijadwalkan ── ○ Selesai      │
│                                                                    │
├───────────────────────────────────────┬────────────────────────────┤
│ MAIN                                  │ STICKY SIDE                │
│                                       │                            │
│ Next Action / state content           │ Giorno                     │
│                                       │ [small photo]              │
│ Schedule                              │                            │
│ Location                              │ Helper                     │
│                                       │ [photo] Andi              │
│ Notes                                 │ [Hubungi]                  │
│                                       │                            │
│ Report / Applicants / etc             │ Ringkasan biaya           │
│                                       │                            │
└───────────────────────────────────────┴────────────────────────────┘
```

---

# 5. Page Header — Detailed Spec

## 5.1 Back navigation

Use text link:

```text
← Kembali ke Kunjungan
```

Do not style it as a large pill unless the global design system requires it.

Height:
`40–44px`.

## 5.2 Task title

```text
Menemani Mengobrol
Untuk Giorno
```

Title:
`28–32px desktop`

Supporting:
`14–15px`

Do not show category description as a paragraph if it adds little value.

If description is useful:
- one line,
- muted.

## 5.3 Task reference

Use:

```text
#8F95E654
```

With optional copy icon.

Full UUID:
- detail tooltip,
- disclosure,
- support metadata section.

Not primary text.

## 5.4 Price

Do not use a large isolated payment box in the top-right.

Better:

```text
Total
Rp50.000
```

small summary in header or sticky side.

Price should NOT be visually stronger than status/next action.

---

# 6. Lifecycle Stepper — Mandatory

Current page lacks a clear journey.

This is one of the biggest missed opportunities.

Add a state-aware lifecycle stepper.

## Standard mode

```text
Diajukan
   ↓
Dikonfirmasi
   ↓
Dikerjakan
   ↓
Selesai
```

## High-risk / coordinator flow

```text
Diajukan
   ↓
Persetujuan Koordinator
   ↓
Dikonfirmasi
   ↓
Dikerjakan
   ↓
Selesai
```

## Applicant mode

```text
Diajukan
   ↓
Pilih Helper
   ↓
Dikonfirmasi
   ↓
Dikerjakan
   ↓
Selesai
```

## Cancelled

Show cancellation branching or stop at the historical point reached.

Do NOT pretend later stages occurred.

## 6.1 Stepper visual rules

Desktop:
- horizontal.

Mobile:
- vertical or compact horizontal without overflow.

State colors:
- completed: green/brand,
- current: primary blue,
- pending: muted,
- cancelled: red-muted at cancellation node.

Add semantic text, not color alone.

---

# 7. Next Action Panel — Mandatory

Every non-terminal task should answer:

> "Apa yang terjadi sekarang?"

Use a dedicated top panel below the stepper.

Example:

```text
MENUNGGU PERSETUJUAN KOORDINATOR

Koordinator wilayah sedang meninjau kunjungan ini.
Jadwal belum dapat diubah hingga proses persetujuan selesai.

Tidak ada tindakan yang perlu Anda lakukan saat ini.
```

Or:

```text
PILIH HELPER

3 Helper telah mengajukan diri.
Tinjau profil dan pilih Helper yang paling sesuai.

[Lihat 3 Pelamar]
```

This should be more prominent than the elderly image.

---

# 8. State A — Menunggu Persetujuan Koordinator

## Current problems

- small amber badge carries almost the whole state;
- giant elderly image dominates;
- Helper card exists but state explanation is weak;
- schedule restriction appears much later;
- cancel action exists far below and feels disconnected;
- user must scroll to understand why reschedule is disabled.

## Recommended layout

```text
HEADER

Menemani Mengobrol
Untuk Giorno
[Menunggu Persetujuan Koordinator]

Koordinator RT/RW sedang meninjau kunjungan berisiko tinggi ini.

STEPPER
Diajukan ── ● Persetujuan ── Dijadwalkan ── Dikerjakan ── Selesai


┌──────────────────────────────────────────────────────────────┐
│ MENUNGGU PERSETUJUAN                                        │
│ Koordinator wilayah sedang melakukan peninjauan.             │
│ Jadwal belum dapat diubah sampai keputusan diberikan.        │
│                                                              │
│ Tidak ada tindakan yang perlu Anda lakukan saat ini.         │
└──────────────────────────────────────────────────────────────┘


MAIN                               SIDE

JADWAL                             GIORNO
7 Sep · 12.11                      [72px photo]
60 menit                           Kedungrejo

LOKASI                             HELPER
Pleburan...                        [48px photo]
[Buka Maps]                        Andi Sudarto
                                   Terverifikasi
CATATAN KELUARGA                   [Hubungi Helper]

"..."                              BIAYA
                                   Rp50.000
PENGATURAN
Jadwal terkunci
[Batalkan Kunjungan]
```

## 8.1 Cancel action

Use:

`Batalkan Kunjungan`

not:

`Batalkan tugas`

Destructive action should be:
- secondary,
- red outline/text,
- at bottom,
- confirmation dialog required.

---

# 9. State B — Mencari Pelamar

## Current problem

The purple "Mode: Pilih dari Pelamar" banner is directionally correct but still subordinate to the giant elderly image.

For this state, applicants ARE the main story.

## Recommended layout

```text
HEADER
Belanja Kebutuhan
Untuk Giorno
[Diajukan]

STEPPER
● Diajukan ── Pilih Helper ── Dikonfirmasi ── Dikerjakan ── Selesai


┌──────────────────────────────────────────────────────────────┐
│ PILIH HELPER                                                 │
│ 3 Helper telah mengajukan diri.                              │
│ Pilih berdasarkan jarak, trust tier, layanan, dan profil.    │
│                                                              │
│ [Lihat 3 Pelamar]                                            │
└──────────────────────────────────────────────────────────────┘
```

If zero applicants:

```text
Belum ada Helper yang mengajukan diri.

Kunjungan masih terbuka untuk Helper yang sesuai.
```

Do not fabricate ETA.

## 9.1 Applicant count

If backend provides count:

`Lihat 3 Pelamar`

not:

`Lihat Antrean Pelamar`

If count unavailable:
`Lihat Pelamar`

## 9.2 Helper side panel before selection

Use compact state:

```text
HELPER
Belum dipilih

Pilih Helper dari pelamar yang tersedia.
```

---

# 10. State C — Confirmed / Scheduled

Prioritize:

1. schedule,
2. Helper,
3. location,
4. reschedule rules.

Top panel:

```text
KUNJUNGAN TERJADWAL

Senin, 7 September · 12.11
Andi Sudarto akan mendampingi Giorno.

[Lihat Lokasi] [Hubungi Helper]
```

If reschedule allowed:
`Ubah Jadwal`

If not:
explain why.

---

# 11. State D — Dikerjakan

This state should feel live.

```text
● SEDANG BERLANGSUNG

Andi Sudarto sedang mendampingi Giorno.
Dimulai pukul 16.53.

[Hubungi Helper] [Lihat Status]
```

Do not show:
- cancel,
- reschedule.

---

# 12. State E — Selesai

## Current strengths

Completed state exposes:
- Helper report,
- evidence image,
- Health Snapshot,
- Memory Capsule.

This is the product value.

## Current problems

- value appears far below a huge elderly photo;
- "Buka pembayaran" competes with report;
- report is visually treated like one more card;
- Health Snapshot is a row of five isolated score cards with little interpretation;
- Helper rating `0.0 · 0 tugas selesai` is visually damaging and meaningless.

## New priority

Completed task:

```text
1. Completion summary
2. Report / evidence
3. Health Snapshot
4. Memory Capsule
5. Riwayat Rangkul CTA
6. Payment state
7. Helper info
8. static task metadata
```

## 12.1 Completed header

```text
✓ KUNJUNGAN SELESAI

Menemani Mengobrol
Giorno · 4 September 2026

Laporan Helper telah tersedia.

[Lihat Riwayat Rangkul]
```

## 12.2 Report section

```text
┌─────────────────────────────────────────────────────────────┐
│ LAPORAN KUNJUNGAN                                           │
│                                                             │
│ Catatan dari Andi Sudarto                                   │
│ "..."                                                       │
│                                                             │
│ [Evidence photo]                                            │
│                                                             │
│ Health Snapshot                                             │
│ Energi        2/5 · Perlu perhatian                        │
│ Mobilitas     2/5 · Perlu perhatian                        │
│ Mood          2/5                                           │
│                                                             │
│ Memory Capsule                                              │
│ "Giorno perlu perhatian keluarga."                          │
│                                                             │
│ [Buka Riwayat Rangkul →]                                    │
└─────────────────────────────────────────────────────────────┘
```

## 12.3 Health Snapshot

Do not show raw score only.

Add safe semantic interpretation if TDD supports it:

```text
Energi
2/5 · Perlu perhatian
```

No diagnosis.

## 12.4 Evidence image

Allowed to be larger because it is actual outcome content.

Rules:
- controlled max-height,
- clickable preview,
- meaningful caption,
- not full-page by default.

## 12.5 Payment

Move to side/lower section.

```text
PEMBAYARAN
Rp30.000
Laporan telah diterima
[Kelola Pembayaran]
```

Use exact wording matching the real payment action.

---

# 13. State F — Dibatalkan

## Current problems

Cancelled page still resembles active detail:
- giant photo,
- schedule/location appear like upcoming info,
- price feels current,
- cancellation context is weak.

A cancelled task is an archived event.

## Recommended hierarchy

```text
DIBATALKAN

Menemani Mengobrol
Untuk Giorno

Kunjungan ini dibatalkan pada 5 September 2026.

Alasan
"..."

Pembayaran
Rp30.000
status refund/no charge if real

Jadwal sebelumnya
5 Sep · 16.11

Helper
Belum ditugaskan
```

Primary next action only if supported:

`Buat Kunjungan Serupa`

Secondary:
`Kembali ke Daftar Kunjungan`

## 13.1 Hide irrelevant cancelled controls

Do not show:
- reschedule,
- live progress,
- contact Helper if never assigned,
- prominent "Total saat ini".

---

# 14. Sidebar / Sticky Context Panel

Desktop:

```text
┌──────────────────────────────┐
│ LANSIA                       │
│ [72px] Giorno Gio            │
│ Kedungrejo, Purwodadi        │
│ [Lihat Profil]               │
├──────────────────────────────┤
│ HELPER                       │
│ [48px] Andi Sudarto          │
│ Terverifikasi                │
│ [Hubungi Helper]             │
├──────────────────────────────┤
│ PEMBAYARAN                   │
│ Total Rp50.000               │
│ status...                    │
└──────────────────────────────┘
```

Sticky:
`top = navbar + 24px`.

One context rail is cleaner than multiple floating cards.

---

# 15. Helper Card — Hard Rules

Use actual `foto_wajah_url` when available.

Photo:
`48–56px`.

Show:
- name,
- verification/trust info if real,
- rating only if meaningful.

If:

```text
rating = 0
total_tugas_selesai = 0
```

do NOT prominently show:

`Rating 0.0 · 0 tugas selesai`

Use:
`Helper terverifikasi`

or omit the metric.

Never manufacture a positive rating.

---

# 16. Elderly Identity

Task detail should use compact identity:

```text
[72–88px photo]

Giorno Gio
99 tahun · Mandiri
Kedungrejo, Purwodadi

[Lihat Profil Lansia]
```

No huge formal portrait.

---

# 17. Schedule & Location

Reduce nested-card syndrome.

Prefer:

```text
JADWAL
Senin, 7 September 2026
12.11 · 60 menit

LOKASI
Kedungrejo, Purwodadi
RT 03 / RW 05
[Buka Maps]
```

One shared section or simple dividers.

---

# 18. Full Address

Do not display raw uppercase database-like address.

Normalize:

```text
Kedungrejo, Purwodadi
Kabupaten Grobogan, Jawa Tengah
RT 03 / RW 05
```

Optional:
`Lihat alamat lengkap`.

---

# 19. Family Notes

Use:

```text
CATATAN UNTUK HELPER

Mohon bantu mendampingi lansia...
```

If empty:
`Tidak ada catatan tambahan.`

Do not render a large empty card.

---

# 20. Payment Hierarchy

Do not repeat amount in:
- header,
- sidebar,
- bottom payment card

without reason.

Preferred:
- compact total in rail/header,
- detailed breakdown below only when relevant.

```text
Ringkasan Pembayaran
Harga dasar        Rp50.000
Layanan tambahan   Rp0
──────────────────────────
Total              Rp50.000
```

---

# 21. Avoid Over-Carding

Use max four visual levels:

1. page background,
2. main task surface,
3. section grouping,
4. small status/control.

Do not make schedule, location, address, notes, helper, payment, and actions all separate strong floating cards.

---

# 22. Radius / Spacing

```text
Page section gap: 24px
Main shell radius: 22–24px
Section radius: 16–18px
Small surface radius: 12–14px
Button radius: 10–12px
Badge: pill
```

Padding:

```text
main header: 24–28px
main section: 20–24px
side context: 16–20px
mobile: 16–18px
```

---

# 23. Typography

```text
Task title: 28–32px desktop
State title: 16–18px
Section title: 16–18px
Body: 14–15px
Metadata: 12–13px
Price: 20–24px
```

Avoid technical-looking microcopy.

---

# 24. Status Language

Use user-facing terminology.

Bad:
- task,
- mode_penugasan,
- antrean.

Better:
- Kunjungan diajukan
- Menunggu persetujuan Koordinator
- Pilih Helper
- Sedang berlangsung
- Selesai
- Dibatalkan

Backend states remain unchanged.

---

# 25. State-to-Component Matrix

| Section | Pending Coordinator | Applicant Search | Scheduled | In Progress | Completed | Cancelled |
|---|---:|---:|---:|---:|---:|---:|
| Lifecycle stepper | Yes | Yes | Yes | Yes | Yes | Yes |
| Next action panel | Yes | Yes | Yes | Yes | Completion summary | Cancellation summary |
| Large elderly photo | No | No | No | No | No | No |
| Compact elderly identity | Yes | Yes | Yes | Yes | Yes | Yes |
| Helper card | If assigned | Placeholder/selected | Yes | Yes | Yes | Only if assigned |
| Contact Helper | If allowed | After selection | Yes | Yes | Optional | Usually no |
| Schedule edit | Locked/conditional | Conditional | Conditional | No | No | No |
| Cancel | If allowed | If allowed | If allowed | No | No | No |
| Applicant CTA | No | Primary | No | No | No | No |
| Evidence report | No | No | No | No | Primary | No |
| Health Snapshot | No | No | No | No | Primary | No |
| Payment details | Compact | Compact | Compact | Compact | Relevant action | Refund/history |
| Riwayat CTA | No | No | No | No | Primary | No |

Use actual business rules if they differ.

---

# 26. Mobile Layout

Order:

```text
Back
Task title + status
Lifecycle stepper
Next action

Task essentials
Elderly compact card
Helper compact card

State-specific content
Payment
Secondary/destructive actions
```

Completed:

```text
Back
Completed summary
Report
Evidence
Health Snapshot
Memory Capsule
Riwayat CTA
Helper
Schedule
Payment
```

Cancelled:

```text
Back
Cancelled summary
Cancellation reason
Payment/refund
Original schedule
Elderly
```

---

# 27. Sticky Mobile Action

Only when there is one clear primary action.

Applicant mode:
`Lihat 3 Pelamar`

Pending coordinator:
no sticky action.

Completed:
only if a real required family action exists.

Cancelled:
only if `Buat Kunjungan Serupa` exists.

---

# 28. Animations

Operational page = subtle motion only.

Allowed:
- stepper state transition,
- accordion,
- dialog,
- report reveal,
- image modal,
- status update fade.

Duration:
`160–260ms`.

No:
- parallax,
- floating cards,
- dramatic entrance.

---

# 29. Live Refresh UX

If polling/realtime changes state:

- preserve scroll position,
- avoid full layout flash,
- no global spinner each refresh,
- show a small state update message if useful.

Example:

`Status diperbarui: Kunjungan telah disetujui.`

---

# 30. Accessibility

Mandatory:

- status not color-only,
- accessible stepper semantics,
- keyboard image preview,
- focus trap in dialogs,
- destructive confirmation,
- 44x44 targets,
- 200% zoom,
- no horizontal overflow,
- sticky rail does not hide content.

---

# 31. Antigravity — Mandatory Instructions

Antigravity must NOT treat this as a CSS cleanup.

## 31.1 Read first

Read:
- full `docs/TDD_Rangkul.md`,
- `src/app/(keluarga)/kunjungan/[id]/page.tsx`,
- `src/components/keluarga/RealTaskDetailClient.tsx`,
- `TaskScheduleActions`,
- `ExtraServiceApprovalCard`,
- applicant components,
- quick matching components,
- payment flow,
- task-status presentation.

Map every state and allowed action before changing UI.

## 31.2 Create state inventory

Before coding, write:

```text
status
mode_penugasan
helper assigned?
payment state?
extra service pending?
report exists?
health snapshot exists?
allowed actions?
```

At minimum verify:
1. waiting coordinator,
2. applicant open,
3. applicant selected,
4. scheduled,
5. in progress,
6. waiting family approval,
7. completed,
8. cancelled.

Do not design only the screenshots.

## 31.3 Browser review before coding

Inspect every seeded/demo state.

Record:
- above-fold hierarchy,
- excessive scrolling,
- duplicate price,
- photo dominance,
- dead whitespace,
- hidden next action,
- card nesting.

## 31.4 Implement shared shell first

Do not create six unrelated pages.

Create/reuse shared primitives:

```text
TaskDetailHeader
TaskLifecycleStepper
TaskNextActionPanel
TaskContextRail
ElderlyIdentity
HelperIdentity
ScheduleLocation
PaymentSummary
CompletionReport
CancellationSummary
```

State drives presentation.

## 31.5 Prefer presentation configuration

Concept:

```ts
type TaskDetailPresentation = {
  headline: string;
  explanation: string;
  currentStep: string;
  primaryAction?: ...
  showApplicants: boolean;
  showScheduleEditor: boolean;
  showCancel: boolean;
  showReport: boolean;
};
```

Do not alter backend state machine.

## 31.6 Visual QA — Three passes

### PASS 1 — Information hierarchy

At 1440px ask:
- status understood in 3 seconds?
- next action understood in 5 seconds?
- price secondary?
- elderly identity clear but not dominant?
- Helper visible?
- completed report above fold/near fold?

Fix if no.

### PASS 2 — Spacing and polish

Check:
- spacing consistency,
- radius hierarchy,
- divider usage,
- nested-card excess,
- button alignment,
- empty columns,
- page length.

### PASS 3 — Responsive and interaction

Test:
- 375x812
- 768x1024
- 1024x768
- 1440x900
- keyboard
- 200% zoom
- long address
- long note
- missing Helper photo
- no Helper
- zero applicants
- many applicants
- report image landscape
- report image portrait
- no evidence image
- zero rating
- state update while page open.

## 31.7 Screenshot evidence

For each state capture:
- desktop above fold,
- desktop full page,
- mobile above fold,
- mobile primary action/report.

## 31.8 Reject implementation if

- elderly portrait still dominates >40% above fold,
- completed report is buried,
- cancelled task looks active,
- applicant CTA requires scrolling,
- pending coordinator fails to explain why waiting,
- price louder than status,
- full UUID prominent,
- real Helper photo not shown when available,
- `0.0 rating` is shown as trust information,
- card nesting remains excessive,
- invalid state actions appear.

---

# 32. Suggested Component Architecture

```text
src/components/keluarga/task-detail/
  TaskDetailShell.tsx
  TaskDetailHeader.tsx
  TaskLifecycleStepper.tsx
  TaskNextActionPanel.tsx
  TaskContextRail.tsx
  ElderlyIdentityCard.tsx
  HelperIdentityCard.tsx
  ScheduleLocationSection.tsx
  ApplicantActionPanel.tsx
  CoordinatorApprovalPanel.tsx
  CompletionReportSection.tsx
  CancellationSummary.tsx
  PaymentSummary.tsx
```

Adapt to repo. Avoid over-fragmentation.

---

# 33. Content Rules

Never show internal/demo markers to end users:

```text
[DEMO_MATRIX]
[DEMO_SPRINT6]
```

These are visible in current screenshots and damage credibility.

Seed/demo data may exist internally, but presentation must look like a real product.

---

# 34. Reporting Helper

Do not keep a loud red-outline `Laporkan Helper` button permanently visible beside normal contact.

Prefer:
- secondary safety action,
- overflow menu or `Laporkan Masalah`,
- accessible but not accusatory.

Trust/safety should be available without implying the Helper is suspicious by default.

---

# 35. Completed State — Target Wireframe

```text
← Kunjungan

✓ Kunjungan selesai
Menemani Mengobrol
Untuk Giorno · 4 Sep 2026

[Buka Riwayat Rangkul]


● Diajukan ── ● Dikonfirmasi ── ● Dikerjakan ── ● Selesai


┌─────────────────────────────────────────────┬──────────────────────┐
│ LAPORAN KUNJUNGAN                           │ Giorno               │
│                                             │ [photo]              │
│ Catatan dari Andi                           │                      │
│ "..."                                       │ Andi Sudarto         │
│                                             │ [photo] verified     │
│ [evidence photo]                            │                      │
│                                             │ Pembayaran           │
│ Health Snapshot                             │ Rp30.000             │
│ Energi        2/5 · Perlu perhatian        │ status...            │
│ Mobilitas     2/5 · Perlu perhatian        │                      │
│ Mood          2/5                           │                      │
│                                             │                      │
│ MEMORY CAPSULE                              │                      │
│ "Giorno perlu perhatian keluarga."         │                      │
│                                             │                      │
│ [Lihat dalam Riwayat Rangkul →]            │                      │
└─────────────────────────────────────────────┴──────────────────────┘


DETAIL KUNJUNGAN
4 Sep · 12.11
30 menit
Kedungrejo
```

Outcome first.
Metadata later.

---

# 36. Pending Coordinator — Target Wireframe

```text
← Kunjungan

Menemani Mengobrol
Untuk Giorno

[Menunggu Persetujuan Koordinator]


○ Diajukan ── ● Persetujuan ── ○ Dikonfirmasi ── ○ Dikerjakan ── ○ Selesai


┌──────────────────────────────────────────────────────────────┐
│ Koordinator sedang meninjau kunjungan                       │
│                                                              │
│ Kategori ini memerlukan persetujuan Koordinator wilayah.    │
│ Jadwal sementara: 7 Sep · 12.11                             │
│                                                              │
│ Tidak ada tindakan yang perlu Anda lakukan sekarang.        │
└──────────────────────────────────────────────────────────────┘


MAIN                              SIDE
Jadwal                            Giorno [photo]
Lokasi                            Andi [photo]
Catatan                           Total Rp50k

Pengaturan
Jadwal belum dapat diubah
[Batalkan Kunjungan]
```

---

# 37. Applicant Mode — Target Wireframe

```text
← Kunjungan

Belanja Kebutuhan
Untuk Giorno

[Diajukan]


● Diajukan ── ○ Pilih Helper ── ○ Dikonfirmasi ── ○ Dikerjakan ── ○ Selesai


┌──────────────────────────────────────────────────────────────┐
│ 3 Helper telah mengajukan diri                              │
│ Bandingkan profil dan pilih Helper yang sesuai.             │
│                                                              │
│ [Lihat 3 Pelamar →]                                         │
└──────────────────────────────────────────────────────────────┘


Jadwal
7 Sep · 09.00

Lokasi
Kedungrejo

Catatan untuk Helper
"..."


SIDE
Giorno [photo]

Helper
Belum dipilih

Rp65.000
```

---

# 38. Cancelled — Target Wireframe

```text
← Kunjungan

[Dibatalkan]

Menemani Mengobrol
Untuk Giorno

Kunjungan dibatalkan pada 5 Sep 2026.


┌──────────────────────────────────────────────────────────────┐
│ KUNJUNGAN DIBATALKAN                                        │
│                                                              │
│ Alasan                                                       │
│ ...                                                          │
│                                                              │
│ Jadwal sebelumnya                                            │
│ Sabtu, 5 Sep · 16.11                                        │
│                                                              │
│ Pembayaran                                                   │
│ Rp30.000 · <real payment/refund state>                       │
└──────────────────────────────────────────────────────────────┘

[Buat Kunjungan Serupa]   // only if supported

Metadata
Giorno
Location
Reference #...
```

No giant photo.
No live-state illusion.
No schedule editor.

---

# 39. Quality Commands

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
git diff --check
```

Also relevant status/state regression tests.

---

# 40. Final Acceptance Checklist

- [ ] Full UUID not prominent.
- [ ] Giant elderly portrait removed.
- [ ] Real Helper photo shown when available.
- [ ] Zero rating not shown as negative trust signal.
- [ ] Lifecycle stepper exists.
- [ ] Next-action/current-state explanation exists.
- [ ] Applicant CTA above fold.
- [ ] Pending coordinator explanation above fold.
- [ ] Scheduled task prioritizes schedule + Helper.
- [ ] In-progress task prioritizes live state.
- [ ] Completed task prioritizes report + Riwayat.
- [ ] Cancelled task looks archived.
- [ ] Cancelled task hides invalid controls.
- [ ] Price not more dominant than status.
- [ ] Payment amount not duplicated unnecessarily.
- [ ] `Batalkan tugas` changed to `Batalkan Kunjungan`.
- [ ] Internal demo markers removed.
- [ ] Card nesting reduced.
- [ ] Address normalized.
- [ ] Mobile hierarchy is state-aware.
- [ ] Keyboard works.
- [ ] 200% zoom works.
- [ ] All primary states visually tested.
- [ ] lint/typecheck/test/build pass.

---

# 41. Final Design Standard

The detail page should not make a jury think:

> "This is a page that displays task data."

It should make them think:

> "The interface understands the lifecycle of a caregiving visit and always tells the family what matters now."

That is the difference between a clean CRUD UI and a competition-winning product experience.

**State drives hierarchy.
Outcome drives completed pages.
Next action drives active pages.
Context is secondary.
Trust is visible but never theatrical.**
