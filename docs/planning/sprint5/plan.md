# Sprint 5-6: Baseline Hardening dan Mode Penugasan Release Plan

> **Untuk agent pelaksana:** gunakan `superpowers:executing-plans` secara inline, tanpa subagent. Untuk setiap perubahan, tulis test merah, jalankan sampai gagal karena perilaku belum benar, implementasikan minimal, jalankan hijau, lalu commit atomik.

**Status:** recovery plan untuk 3-6 September 2026. Sprint 5 belum eligible freeze dan Sprint 6 sudah masuk `develop` lebih awal.

**Goal:** mengirim baseline Sprint 0-4 yang aman serta mode `pelamar` dan `cepat` yang fail-closed, anti-race, privacy-preserving, dan dapat dinonaktifkan sebelum deadline 6 September.

**Architecture:** kerja dibagi dalam gate berurutan, bukan dua sprint paralel. Gate pertama menutup transaksi wallet, resource authorization, migration cloud, dan baseline flag. Gate kedua mengaudit lalu menyelesaikan implementation Sprint 6 yang sudah ada terhadap TDD §3.14. Gate terakhir membuktikan release lewat runtime RLS, race, seed, UI mobile-first, candidate tag, dan smoke test.

**Tech Stack:** Next.js App Router, TypeScript, React, Supabase PostgreSQL/Auth/Storage/RLS, Zod, Node test runner, Tailwind CSS, shadcn/Base UI, GitHub Actions, dan Vercel.

**Spec:** `docs/TDD_Rangkul.md` §2.3, §3.1-§3.4, §3.7-§3.14, §4.5-§4.12, §6-§8, §14.4 Sprint 5-6, §14.7, §16, §19; `docs/planning/sprint4/plan.md`, completion audit Sprint 4, dan `docs/planning/sprint6/plan.md`.

## Non-negotiable constraints

- Tidak ada subagent.
- Tidak ada feature baru di luar scope Sprint 6. Jalur `langsung` adalah regression baseline.
- `SPRINT6_MATCHING_ENABLED` default `false`. Ketika off, UI dan API Sprint 6 menjawab `404` tanpa side effect.
- Semua mutation memakai Zod server, constraint/RPC database, RLS, dan audit transaksi jika rule bisnis berubah.
- Object path private hanya dibaca melalui resource ID dan authorization server, bukan query path/bucket bebas.
- Sebelum memperbaiki UI, pakai `@ui-ux-pro-max`, `gpt-taste`, dan `Impeccable`. Untuk UI operasional, gpt-taste hanya dipakai sebagai anti-pattern review, bukan alasan memaksakan hero, AIDA, atau GSAP.
- UI dimulai dari 375px dan diverifikasi di 768px, 1024px, 1440px, keyboard-only, 200% zoom, loading, empty, error, forbidden, conflict, retry, serta target sentuh minimum 44px.
- Tidak ada `db push` atau reset cloud sampai linked project dipastikan development. Jangan memperlakukan source test hijau sebagai bukti runtime.

## Verified blockers and release decisions

| Priority | Evidence | Required decision |
| --- | --- | --- |
| P0 | `POST /api/wallet/topup` masih read-update-insert dengan service role dan tidak memeriksa error ledger. | Ganti dengan RPC actor-scoped atomik. |
| P0 | `canAccessPrivateFile(path)` tidak dapat authorize Keluarga participant evidence task. | Read file berdasarkan `resource_type` dan `resource_id`. |
| P0 | `develop` sudah memuat code/migration Sprint 6. | Candidate baseline tidak boleh hanya ditag dari `develop` tanpa flag-off route proof. |
| P0 | Migration Quick Assignment yang ada menerima `p_helper_user_id` dan belum membuktikan kategori, schedule conflict, serta auth yang recomputed di database. | Ganti boundary RPC agar actor berasal dari `auth.uid()` dan seluruh eligibility fail closed. |
| P0 | Local test terbaru: 188 pass, 9 skip. | Release runtime command harus punya 0 mandatory skip. |
| P1 | Total komisi dihitung dari page saat ini. | Aggregate server terpisah dari paginated items. |

## Delivery order and cutoff

| Time | Gate | Exit evidence |
| --- | --- | --- |
| 3 Sep | G0 baseline and cloud preflight | Feature flag off is fail closed, linked development confirmed, migration manifest written. |
| 3-4 Sep | G1 P0 hardening | Wallet, private evidence, runtime RLS, and legacy direct booking regression pass. |
| 4 Sep | G2 Sprint 6 contract and database | Assignment schema, feature flag, privacy projection, and eligibility runtime test pass. |
| 4-5 Sep | G3 vertical slices | Pelamar and cepat happy, forbidden, conflict, expiry, and notification evidence pass. |
| 5 Sep 15.00 | G4 release verification | Seed twice, four viewports, five roles, CI quality gate, preview dry run pass. |
| 5 Sep 18.00 | Go/no-go | Candidate SHA, tag, rollback, and flag decision documented. |
| 6 Sep 00.00-12.00 | Submission only | Production verification, README, demo accounts, video, and submission evidence. No features. |

## Task 0: Candidate isolation and cloud preflight

**Files:** `tests/sprint5-candidate-gate.test.mjs`, `.env.example`, `docs/api-contract.md`, `docs/planning/sprint5/candidate-manifest.md`, `docs/planning/sprint5/cloud-evidence.md`.

- [ ] Write a failing test proving `isSprint6MatchingEnabled(undefined)` and `("false")` return false, `("true")` returns true, `.env.example` defaults false, and every Sprint 6 mutation route returns `404` before it parses input or invokes an RPC.
- [ ] Run `node --experimental-strip-types --test tests/sprint5-candidate-gate.test.mjs` and record the expected failure.
- [ ] Implement server-side flag gates. Hiding a menu is not a gate.
- [ ] Run `npx supabase migration list --linked`, record the redacted output, verify the linked ref is development, and inventory all existing Sprint 6 commits/migrations.
- [ ] Create `feature/sprint5-sprint6-release`; preserve `develop`. If flag-off behavior cannot be proven, revert only Sprint 6 commits on this release branch or use the latest viable Sprint 4 SHA. Never reset `develop`.
- [ ] Commit: `fix(tasks): kunci baseline sebelum mode penugasan diaktifkan` with `Refs: TDD §3.14, §14.4, §14.7`.

## Task 1: P0 wallet, commission, and private evidence hardening

**Files:** `src/app/api/wallet/topup/route.ts`, `src/lib/validations/demo-wallet.ts`, `supabase/migrations/20260904150000_wallet_topup_atomicity.sql` if the deployed RPC lacks the required invariant, `src/types/database.ts`, `src/app/api/koordinator/commissions/route.ts`, `src/app/api/storage/read/route.ts`, `src/lib/storage/private-file-access.ts`, `src/lib/storage/read-file.ts`, `tests/demo-wallet-payment-runtime.test.mjs`, `tests/koordinator-commissions-runtime.test.mjs`, `tests/private-storage-access.test.mjs`.

- [ ] Write separate failing runtime tests: concurrent top-up increases balance exactly twice and creates two `entry_type='topup'` ledger rows; ledger/RPC failure changes neither row; payment charge cannot debit twice; commission summary remains identical on pages 1 and 2; participant family can re-sign evidence while unrelated family gets 404.
- [ ] Route top-up must call only `keluarga_self_topup_demo_wallet` with actor session. Remove service-role upsert, read, update, and direct ledger insert.
- [ ] RPC must derive actor from `auth.uid()`, lock wallet, use numeric arithmetic, insert ledger/audit in one transaction, set fixed search path, revoke `PUBLIC`, and grant minimum execute role.
- [ ] Commission list stays paginated but summary is server aggregate for the identical released-payment and verified-region filter.
- [ ] Read API accepts a Zod discriminated union such as `{ resource_type: 'task_evidence', resource_id: uuid }`. It resolves the private path only after actor ownership, participant relation, valid reviewer scope, or explicit Admin authorization.
- [ ] Apply corrective migration only after cloud target verification, regenerate database types, and run source plus runtime tests without skip.
- [ ] Commits remain separate: `fix(payment): jadikan top-up dan komisi konsisten` and `fix(rls): otorisasi evidence berdasarkan resource`, each with TDD refs.

## Task 2: Sprint 6 contract, schema, and eligibility boundary

**Files:** `docs/TDD_Rangkul.md` only if amendment is necessary, `docs/api-contract.md`, `src/lib/features/sprint6-matching.ts`, `src/lib/validations/booking.ts`, `src/lib/tasks/assignment-types.ts`, `src/lib/tasks/assignment-errors.ts`, `supabase/migrations/20260904160000_sprint6_assignment_hardening.sql`, `src/types/database.ts`, `tests/sprint6-feature-flag.test.mjs`, `tests/sprint6-booking-contract.test.mjs`, `tests/sprint6-assignment-schema.test.mjs`, `tests/sprint6-assignment-eligibility-runtime.test.mjs`.

- [ ] First write failing tests for direct request compatibility, `pelamar` minimum three hours, `cepat` same-day plus 15-minute expiry, and invalid helper/mode combinations.
- [ ] Preserve task status enum. Mode is `langsung | pelamar | cepat`; request missing mode maps to `langsung` only when a direct Helper is supplied.
- [ ] Add `task_applications` constraints: unique task-helper, only one selected application per task, terminal states cannot return to pending, RLS enabled, and no browser-provided helper/owner/status accepted by mutation RPC.
- [ ] Replace existing `accept_quick_task(p_task_id, p_helper_user_id)` with a function that derives Helper from `auth.uid()`. In the same locked transaction, recheck verified status, trust, availability, category service, coordinates, radius, no active task, schedule overlap, task expiry, same-day, and high-risk exclusion.
- [ ] Marketplace response must be allowlisted to category, fixed price, schedule, reduced kelurahan/kecamatan, rounded distance, and expiry. It never includes lansia identity, detailed address, raw coordinates, condition, document, Health Snapshot, evidence, or chat.
- [ ] Run red-green commands per test file, apply migration to confirmed development, regenerate types, then run integration eligibility and direct-mode regression.
- [ ] Commit: `feat(tasks): amankan kontrak assignment fleksibel` with `Refs: TDD §3.14, §4.5, §6, §7, §8, FR-TSK-12, FR-TSK-14, FR-TSK-15, FR-TSK-16`.

## Task 3: Pelamar vertical slice

**Files:** `src/app/(keluarga)/booking/new/page.tsx`, `src/components/keluarga/booking/BookingNewClient.tsx`, `src/app/(helper)/tugas/page.tsx`, `src/app/api/tasks/[id]/applications/route.ts`, `src/app/api/tasks/[id]/applications/[application_id]/select/route.ts`, `src/app/api/tasks/[id]/applications/withdraw/route.ts`, `src/lib/tasks/marketplace.ts`, `supabase/seed.sql`, `tests/sprint6-applications-runtime.test.mjs`.

- [ ] Before UI edits, use ui-ux-pro-max guidance for labels, inline errors, focus, and feedback; use Impeccable Operate-mode hardening; record gpt-taste anti-pattern decision to avoid marketing treatment.
- [ ] Write failing tests for apply, duplicate apply, withdraw, family ownership, selection race, application expiry, notification dedupe, and participant privacy.
- [ ] Implement apply/withdraw/select with RPC state guards. The select transaction locks task and application rows, selects exactly one Helper, rejects remaining pending applications, applies existing approval rule, and returns 409 for stale selection.
- [ ] UI: Keluarga selects one mode with labelled radio cards, sees applicant list and a single select action. Helper sees only reduced task card, own application state, apply/withdraw. Every state exposes loading, empty, offline/network error, conflict, and retry.
- [ ] Seed exactly three pending applicants and one selected scenario. Rerun must restore fixture without duplicates.
- [ ] Test 375/768/1024/1440 and keyboard. Commit `feat(tasks): tambahkan alur pilih dari pelamar` with TDD refs.

## Task 4: Cari Cepat vertical slice

**Files:** `src/components/keluarga/booking/QuickBookingForm.tsx`, `src/components/keluarga/booking/QuickMatchStatus.tsx`, `src/components/helper/QuickTaskCard.tsx`, `src/app/api/tasks/marketplace/route.ts`, `src/app/api/tasks/[id]/accept/route.ts`, `supabase/migrations/20260904170000_sprint6_expiry_hardening.sql`, `.github/workflows/scheduled-jobs.yml`, `supabase/seed.sql`, `tests/sprint6-quick-assignment-runtime.test.mjs`, `tests/sprint6-marketplace-privacy-runtime.test.mjs`.

- [ ] Write failing tests for same-day/high-risk/trust/category/radius/availability/schedule rejection, two concurrent accepts, expiry, and marketplace overexposure.
- [ ] Quick accept derives actor from auth and does not accept `helper_user_id`. It rechecks every eligibility condition in the locking transaction; exactly one accepted request changes helper and status.
- [ ] Expiry cancels only unassigned expired task. It is idempotent and emits one notification per recipient. Scheduled workflow invokes the correct RPC every five minutes; heartbeat remains health-only.
- [ ] UI clearly says Cari Cepat is a request window, not a guaranteed emergency dispatch. It renders searching, found, expired, conflict, and retry states with no false success.
- [ ] Seed two eligible trusted Helpers and five negative eligibility fixtures. Run concurrency/runtime tests and mobile-first QA.
- [ ] Commit `feat(tasks): selesaikan alur cari cepat anti-race` with TDD refs.

## Task 5: Release candidate and no-go decision

**Files:** `docs/planning/sprint5/completion-audit.md`, `docs/planning/sprint5/demo-runbook.md`, `README.md` and `docs/walkthrough.md` only for verified commands/accounts.

- [ ] Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` after the final change.
- [ ] Run `$env:RUN_SUPABASE_INTEGRATION='1'; npm run test` and require no mandatory RLS, race, payment, or assignment skip.
- [ ] Run `npm run seed:cloud` twice and compare deterministic fixture counts/statuses.
- [ ] Perform five-role dry run: Keluarga, Helper terpercaya, Helper probation, Koordinator RT/RW, Admin. Include direct regression, payment, evidence, Riwayat, report, both assignment modes, unauthorized access, stale mutation, insufficient wallet, and expiry.
- [ ] Capture mobile-first and keyboard evidence for all changed screens at 375, 768, 1024, 1440. Apply Impeccable bounded visual review once, batch fixes, then one confirmation pass.
- [ ] Record candidate SHA, annotated tag, migration list, seed results, runtime counts, preview URL, feature-flag value, rollback command, known limitations, and GO or NO-GO decision by 5 September 18.00 WIB.
- [ ] If any P0 remains or evidence is missing, release NO-GO: flag stays off and baseline candidate is deployed. No last-minute feature patch on 6 September.

## Release acceptance

1. Baseline direct booking does not regress when Sprint 6 flag is off.
2. Pelamar permits many applications but atomically selects one Helper.
3. Cari Cepat permits only one eligible trusted Helper to accept and blocks schedule conflicts.
4. Marketplace never exposes private lansia data before assignment.
5. Wallet, RLS, storage, seed, CI, cron, webhook, and UI evidence are runtime-backed.
6. Candidate tag and rollback point are recorded before production activation.
