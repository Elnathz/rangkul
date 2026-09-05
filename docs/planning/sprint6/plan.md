# Sprint 6 Mode Penugasan Fleksibel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan mode `Pilih dari Pelamar` dan `Cari Cepat` yang siap production paling lambat 5 September 2026 pukul 18.00 WIB tanpa meregresikan booking `langsung` atau membocorkan data lansia.

**Architecture:** `tasks.mode_penugasan` membedakan `langsung`, `pelamar`, dan `cepat` tanpa menambah status task baru. Mode pelamar memakai `task_applications` dan RPC selection atomik; mode cepat memakai marketplace projection tereduksi dan conditional acceptance dengan eligibility yang dihitung ulang server. Semua mode kembali ke state machine, approval, payment, evidence, dan cancellation yang sama setelah `helper_id` ditetapkan.

**Tech Stack:** Next.js App Router, TypeScript, React, Supabase PostgreSQL/RLS/Realtime, Zod, Node test runner, Tailwind CSS, shadcn/Base UI, dan GitHub Actions.

**Spec:** `docs/TDD_Rangkul.md` §3.1-§3.4, §3.14, §4.5, §5.5, §6-§9, §11, §14 Sprint 6, §16, §19.8, dan Amendment Mode Penugasan Sprint 6; `docs/GUIDEBOOK_ITechno.md` §4.2, §5, §6.

## Amendemen Eksekusi 4 September 2026

Bagian ini adalah catatan eksekusi, bukan pengganti checklist rencana di bawah. Checkbox hanya ditandai setelah ada bukti yang dapat diulang.

- [x] Kontrak source mode `langsung`, `pelamar`, dan `cepat`, feature flag fail-closed, migration assignment, API role-scoped, dan UI booking/job board sudah ada di branch `dev-eln`.
- [x] Remote Supabase yang tertaut memiliki seluruh migration Sprint 6 hingga `20260904130200`.
- [x] RPC `accept_quick_task` kini memvalidasi mode, trust, availability, kategori, koordinat, radius, jadwal, dan race secara server-side. Ia memakai enum notifikasi `task` yang valid, sementara overload legacy yang tidak aman telah dihapus.
- [x] Seed cloud berhasil memakai persona fiktif yang mudah dibaca tanpa mengubah password, role matrix, koordinat, trust tier, status, ataupun relasi yang dibutuhkan test. Akun utama: `ratnakeluarga@rangkul.id`, `andihelper@rangkul.id`, dan `wagimankoordinator@rangkul.id`.
- [x] Pemilih layanan menampilkan ringkasan pilihan setelah pengguna memilih: layanan, tingkat, estimasi durasi, harga dasar, dan kebutuhan approval bila relevan. Nama kategori canonical TDD tidak diubah di database.
- [x] CLI `browser-use` tidak tersedia pada host ini, tetapi browser in-app yang dapat dikendalikan dipakai untuk QA landing publik. Pada 375px, 768px, 1024px, dan 1440px tidak ada horizontal overflow setelah hero dikunci ke satu kolom mobile. Tautan footer pendek juga memiliki hit area minimal 44px.
- [x] Walkthrough browser authenticated memakai empat persona demo. Keluarga, Helper, Koordinator, dan Admin diarahkan ke dashboard yang benar dan lulus overflow pada 375px, 768px, 1024px, serta 1440px. Conflict, forbidden, zoom, dan screenshot tersimpan tetap menjadi gate terpisah.
- [x] Runtime RLS baseline lulus setelah policy Helper publik yang bocor ditutup. Runtime Sprint 6 juga lulus untuk projection marketplace tereduksi, RLS lamaran, apply-withdraw, pemilihan pelamar atomik, race Cari Cepat, dan expiry lamaran.
- [ ] Gate source terbaru: lint, typecheck, test berurutan, dan production build lulus. Matrix runtime cloud penuh juga lulus 263/263 tanpa skip. Percobaan ulang `npm ci` terbaru gagal karena `ENOSPC`, sehingga clean install tetap harus diulang pada runner dengan ruang cukup.
- [x] Reseed cloud setelah matrix runtime berhasil. Target ref diambil dari project Supabase yang tertaut hanya untuk proses tersebut, diverifikasi oleh script, lalu SQL dan empat asset demo privat tersinkron.
- [ ] Empat viewport authenticated sudah memiliki evidence browser. Feature-flag preview dry run, zoom 200 persen, screenshot tersimpan, dan smoke production masih belum memiliki evidence, sehingga Sprint 6 belum release-ready.

### Amendemen persona dan wilayah seed, 4 September 2026

- [x] Ganti seluruh identitas akun fixture yang masih bernama generik menjadi persona fiktif yang mudah diingat, dengan username dan email berbasis nama tanpa underscore. Password demo tetap `Rangkul2026*`.
- [x] Pertahankan Pleburan RW 05 sebagai area demo utama, dengan Keluarga, Helper, dan Koordinator tersebar pada RT 01 sampai RT 05 agar scope RT dan fallback RW bisa didemokan.
- [x] Tambahkan persona Keluarga, Helper, dan Koordinator pada kelurahan pembanding Kedungpane, Kecamatan Mijen, dengan RT/RW berbeda. Area ini hanya melengkapi coverage wilayah, bukan membuka akses lintas wilayah.
- [x] Seed SQL, route reseed Admin, profile Helper/Koordinator, kategori, dan test matrix memakai daftar persona yang sama. Matriks TDD memuat lebih dari lima Helper terpercaya, dua probation, satu under review, dan satu verified by Admin fallback.
- [x] Cloud seed dijalankan ulang idempoten setelah perubahan dan runtime RLS diulang sehingga akun baru tetap memisahkan boundary Pleburan dan Kedungpane.

## Amendemen landing storytelling, 5 September 2026

- Scope: landing publik saja. Backend, dashboard peran, route bisnis, harga, dan kontrak Sprint 6 tidak diubah.
- Acuan: `RANGKUL_LANDING_PAGE_UIUX_MASTER_REDESIGN_V2_NO_IMPECCABLE.md`, TDD, serta keputusan pengguna untuk tetap bekerja di `dev-eln`, menggunakan `ui-ux-pro-max` dan `gpt-taste`, tanpa Impeccable atau GSAP.
- Struktur: Hero, trust strip, Apa itu Rangkul, cara kerja, layanan, Riwayat interaktif, mekanisme trust, role explorer, CTA, dan footer.
- Asset: ilustrasi 3D fiktif Ibu Ratna disimpan lokal di `public/images/landing/ibu-ratna-hero-v1.png`. Tidak ada foto pengguna, testimoni, atau metrik rekaan.
- Motion: Framer Motion yang sudah ada. Visual interaktif aktif secara default sesuai arahan pengguna. Tidak menambah animasi yang mengubah business state atau memperlambat konten utama.
- QA: mobile-first pada 375px, lalu 768px, 1024px, dan 1440px; cek scroll spy, tab, fokus keyboard, target 44px, overflow, serta build quality gate.

Status implementasi amendemen, 5 September 2026:

- [x] Hero memakai komposisi white-blue-white, snapshot HTML berlabel contoh, dan ilustrasi 3D fiktif lokal. Asset tidak mewakili pelanggan sebenarnya.
- [x] Narasi landing kini mengikuti urutan cerita produk. Section "Apa itu Rangkul" dan mekanisme trust menjelaskan peran Keluarga, Helper, serta Koordinator sebelum ajakan mendaftar.
- [x] Layanan risiko tinggi dibuat sebagai panel terpisah dengan syarat persetujuan Koordinator. Tidak ada klaim, ranking, atau testimoni rekaan.
- [x] Riwayat Rangkul memakai tab interaktif dan contoh non-diagnostik. Role explorer hanya menampilkan tiga peran publik dan memakai pola tab yang dapat diakses keyboard.
- [x] `npm ci`, typecheck, test (249 lulus, 14 runtime cloud skip tanpa kredensial), dan build lulus. Lint lulus tanpa error, dengan 61 warning lama di luar perubahan landing.
- [x] Browser aktual landing pada 375px, 768px, 1024px, dan 1440px lulus tanpa overflow. Scroll-spy, drawer Escape, focus return, serta redirect booking publik juga lulus.
- [ ] Screenshot tersimpan, zoom 200 persen, dan walkthrough authenticated empat role tetap perlu dicatat ke evidence sebelum kandidat release. Ini bukan alasan untuk mengaktifkan feature flag Sprint 6.

## Amendemen blocker otorisasi route, 5 September 2026

Temuan akar masalah: proxy hanya menandai prefix `/admin`, `/koordinator`, `/helper`, `/keluarga`, dan `/tugas` sebagai frontend privat. Route Keluarga canonical memakai URL tanpa prefix role, sehingga `/beranda`, `/booking`, `/cari-helper`, `/kunjungan`, `/lansia`, `/pembayaran`, `/saldo`, dan `/banding` tidak memperoleh pemeriksaan role global. Route bersama `/notifikasi` juga belum diklasifikasikan eksplisit sebagai authenticated-only.

- [x] Bentuk satu klasifikasi route frontend eksplisit untuk `public`, `authenticated`, `keluarga`, `helper`, `koordinator`, dan `admin`. Pencocokan segment-aware mencegah nama seperti `/administrator` dianggap sebagai `/admin`.
- [x] Audit otomatis seluruh 70 `src/app/**/page.tsx` agar setiap halaman role-group mempunyai klasifikasi yang benar, termasuk route dinamis dan legacy `/tugas`.
- [x] Pengunjung route privat diarahkan ke login dengan tujuan aman; pengguna lintas role diarahkan ke dashboard role miliknya, bukan landing publik.
- [x] Pertahankan pemeriksaan role dan ownership di route handler serta RLS. Seluruh 86 route handler kini minimal authenticated di proxy, kecuali login, register, dan webhook bertanda tangan; handler serta RLS tetap menjadi otoritas scope resource.
- [x] Uji matriks halaman dan API dengan akun seed Keluarga, Helper, Koordinator, dan Admin. Route tanpa prefix, legacy, namespace role, katalog Helper, antrean Koordinator, Admin stats, dan debug menghasilkan `200`, `307`, `401`, atau `403` sesuai aktor.
- [x] Reseed cloud idempoten dan runtime RLS dijalankan ulang. Seluruh 283 test pada matrix final lulus tanpa skip; gate final dicatat di completion audit.

Blocker ini harus hijau sebelum feature flag Sprint 6 dapat dipertimbangkan aktif. Menyembunyikan navigasi tanpa menutup URL dan endpoint langsung tidak memenuhi gate keamanan TDD §8 dan §16.

## Global Constraints

- Sprint 6 berlangsung 3-5 September 2026. Deadline teknis internal adalah 5 September pukul 18.00 WIB.
- Semua perubahan bekerja di branch fitur dan terintegrasi ke `develop`. PR `develop` ke `main` hanya dibuat setelah quality gate Sprint 6 hijau.
- Tanggal 6 September tidak boleh dipakai untuk menambah fitur. Pukul 00.00-12.00 WIB hanya untuk verifikasi production, akun demo, README, video cadangan, repository, dan bukti submission.
- `SPRINT6_MATCHING_ENABLED` default `false`. API dan UI harus fail closed ketika flag tidak aktif.
- Mode `langsung` adalah regression baseline. Request lama tanpa `mode_penugasan` diperlakukan sebagai `langsung`.
- State task tetap `diajukan`, `menunggu_persetujuan_koordinator`, `dikonfirmasi`, `dikerjakan`, `menunggu_persetujuan_keluarga`, `selesai`, dan `dibatalkan`.
- Tidak ada bidding, negosiasi harga, auto-dispatch algorithm, live map, ETA, atau klaim layanan darurat.
- Mode `pelamar` hanya untuk jadwal minimal 3 jam dari waktu server. Application window maksimal 1 jam.
- Mode `cepat` hanya same-day, non-high-risk, dan memiliki window pencarian 15 menit.
- Quick acceptance hanya untuk Helper `verified`, `terpercaya`, `is_available`, menawarkan kategori, masuk radius, serta tidak memiliki task aktif atau jadwal bentrok.
- Eligibility diperiksa saat list dan dihitung ulang di dalam transaksi apply/select/accept. UI filter bukan security boundary.
- Marketplace sebelum assignment tidak boleh memuat nama lansia, alamat lengkap, koordinat mentah, catatan kondisi, kebutuhan khusus, dokumen, Health Snapshot, evidence, atau chat.
- Harga berasal dari snapshot kategori di server. Tidak ada nominal assignment yang diterima dari browser.
- Semua mutation memakai response `{ data }` saat sukses dan `{ error, message, fieldErrors? }` saat gagal. HTTP `409` dipakai untuk race/state conflict.
- UI mobile-first dan diuji pada 375px, 768px, 1024px, dan 1440px. Target sentuh minimal 44x44px dan fokus keyboard harus terlihat.
- Setiap migration di-apply ke Supabase development cloud, lalu `src/types/database.ts` diregenerasi. Docker tidak menjadi dependency.
- Setiap task mengikuti red-green-refactor dan berakhir dengan commit atomik sesuai AGENTS.md.

---

## Scope dan Non-Scope

### In scope

- Mode booking `langsung`, `pelamar`, dan `cepat` dengan contract yang eksplisit.
- Application Helper, withdraw, list pelamar, dan selection oleh Keluarga.
- Quick marketplace, eligibility server, first valid acceptance, dan expiry.
- Schedule conflict prevention, radius, kategori, availability, trust, status, dan approval.
- Marketplace projection tereduksi, RLS, notification, seed, runtime test, dan responsive QA.
- Feature flag fail closed serta deployment gate sebelum submission.

### Out of scope

- Algoritma ranking/rekomendasi Helper.
- Bidding atau perubahan harga oleh pelamar.
- Chat sebelum Helper dipilih.
- Exact live location, route tracking, ETA, atau peta pergerakan.
- Emergency dispatch dan jaminan respons medis.
- Recurring booking, waitlist otomatis, serta multi-select Helper.
- Perubahan pada split payment, cancellation compensation, atau trust tier.

## Definition of Ready

- [ ] Sprint 4 selesai dan candidate baseline Sprint 5 sudah lulus paling lambat 2 September 23.00 WIB.
- [ ] TDD §3.14, schema, API, route, RLS, serta seed fixture sudah direview kedua owner.
- [ ] Feature flag default off tersedia sebelum route Sprint 6 dapat dipanggil.
- [ ] Akun seed Helper memiliki koordinat, kategori, availability, trust tier, dan task schedule yang cukup untuk menguji eligibility.

## Ownership Fullstack

| Owner | Vertical slice | Wajib dimiliki sampai selesai |
| ----- | -------------- | ----------------------------- |
| Farros | `Pilih dari Pelamar` | UI booking, UI apply/withdraw, UI daftar pelamar, API, RPC selection, migration application, RLS, notification, seed, runtime test, mobile/accessibility QA. |
| Mervin | `Cari Cepat` dan eligibility marketplace | UI booking cepat, job board, API marketplace, quick accept RPC, expiry, schedule conflict, radius/category checks, RLS projection, notification, seed, concurrency test, mobile/accessibility QA. |
| Keduanya | Contract, regression, privacy, deployment gate | Review silang, mode langsung regression, cloud migration, runtime role matrix, preview, production verification, dry run, dan go/no-go. |

## Interface Map

```ts
export type TaskAssignmentMode = "langsung" | "pelamar" | "cepat";
export type TaskApplicationStatus =
  | "pending"
  | "selected"
  | "withdrawn"
  | "rejected"
  | "expired";

export type MarketplaceTask = {
  task_id: string;
  mode_penugasan: "pelamar" | "cepat";
  kategori: {
    id: string;
    nama: string;
    estimasi_durasi_menit: number;
  };
  jadwal_waktu: string;
  harga_dasar: number;
  lokasi_ringkas: {
    kelurahan: string;
    kecamatan: string;
    jarak_km: number;
  };
  expires_at: string;
  application_status: TaskApplicationStatus | null;
};

export type PublicApplicant = {
  application_id: string;
  status: TaskApplicationStatus;
  diajukan_at: string;
  helper: {
    id: string;
    full_name: string;
    foto_wajah_url: string | null;
    rating_avg: number;
    total_tugas_selesai: number;
    tingkat_kepercayaan: "probation" | "terpercaya";
    sumber_verifikasi: "koordinator" | "admin_fallback";
    jarak_km: number;
  };
};
```

Database functions yang menjadi boundary antartask:

```sql
public.get_task_marketplace(p_mode public.task_assignment_mode DEFAULT NULL)
public.apply_to_task(p_task_id uuid)
public.withdraw_task_application(p_task_id uuid)
public.select_task_application(p_task_id uuid, p_application_id uuid)
public.accept_task_assignment(p_task_id uuid)
public.expire_unassigned_tasks()
```

Semua fungsi mutation mengambil actor dari `auth.uid()`. Tidak ada function yang menerima `keluarga_id`, `helper_id`, harga, trust tier, radius, atau next status dari browser.

## Urutan dan Dependency

| Urutan | Task | Owner | Bergantung pada |
| ------ | ---- | ----- | -------------- |
| 0 | Feature flag dan contract regression | Farros | TDD sudah disetujui |
| 1 | Schema assignment dan eligibility primitives | Mervin | Task 0 |
| 2 | Slice Pilih dari Pelamar | Farros | Task 1 |
| 3 | Slice Cari Cepat | Mervin | Task 1 |
| 4 | Privacy/RLS runtime matrix | Keduanya, Farros integrator | Task 2-3 |
| 5 | Notification, expiry, seed, dan regression | Keduanya, Mervin integrator | Task 2-4 |
| 6 | Responsive QA, preview, dan go/no-go | Keduanya | Task 0-5 |

Task 2 dan Task 3 boleh berjalan paralel setelah migration Task 1 diintegrasikan. Task 4 tidak boleh memakai test regex sebagai satu-satunya evidence. Task 6 tidak boleh mengaktifkan production hanya karena build hijau.

### Jadwal Eksekusi dan Cutoff

| Waktu | Farros | Mervin | Gate bersama |
| ----- | ------ | ------ | ------------ |
| 3 September, 08.00-12.00 | Task 0: feature flag, booking contract, regression test | Task 1: schema, eligibility, migration test | Contract dan migration direview silang sebelum cloud push |
| 3 September, 13.00-23.00 | Task 2: apply, withdraw, list pelamar, selection RPC | Task 1 dilanjutkan, lalu Task 3: marketplace projection dan quick RPC | Schema cloud, generated types, dan baseline test hijau |
| 4 September, 08.00-18.00 | Task 2: UI Keluarga/Helper, notification, runtime test | Task 3: UI Keluarga/Helper, expiry, runtime race test | Kedua vertical slice dapat didemokan end-to-end di preview |
| 4 September, 19.00-23.00 | Integrasi Task 4 dan review slice Mervin | Integrasi Task 5 dan review slice Farros | Runtime RLS, privacy response, seed, dan mode `langsung` regression hijau |
| 5 September, 08.00-15.00 | QA 375/768/1024/1440, keyboard, forbidden dan conflict states | QA yang sama pada slice Farros, cloud expiry dan notification | Dry run semua role, payment, evidence, report, dan Riwayat tidak regresi |
| 5 September, 15.00-18.00 | Perbaiki blocker slice Farros dan siapkan audit | Perbaiki blocker slice Mervin dan siapkan deploy candidate | `npm ci`, lint, typecheck, test, build, production go/no-go |
| 6 September, 00.00-12.00 | Verifikasi akun, README, video, dan bukti submit | Verifikasi production, logs, webhook, cron, dan rollback flag | Tidak ada fitur baru; submit maksimal pukul 12.00 WIB |

Jika satu owner terlambat, owner lain hanya mengambil task yang sudah memiliki interface dan failing test. Jangan menggabungkan dua slice menjadi satu perubahan besar tanpa review karena itu menghilangkan jalur rollback atomik.

## Task 0: Feature Flag dan Contract Regression

**Owner:** Farros
**Reviewer:** Mervin

**Files:**

- Create: `src/lib/features/sprint6-matching.ts`
- Modify: `.env.example`
- Modify: `src/lib/validations/booking.ts`
- Create: `tests/sprint6-feature-flag.test.mjs`
- Create: `tests/sprint6-booking-contract.test.mjs`
- Modify: `docs/api-contract.md`

**Interfaces:**

- Produces: `isSprint6MatchingEnabled(value?: string): boolean`.
- Produces: `TaskAssignmentMode`, `CreateDirectTaskInput`, `CreateApplicantTaskInput`, dan `CreateQuickTaskInput` dari validation module.
- Consumes: TDD §3.14 sebagai satu-satunya sumber kombinasi mode, helper, dan jadwal.

- [ ] **Step 1: Tulis test feature flag yang gagal**

```js
test("Sprint 6 matching default off dan hanya aktif untuk literal true", () => {
  assert.equal(isSprint6MatchingEnabled(undefined), false);
  assert.equal(isSprint6MatchingEnabled("false"), false);
  assert.equal(isSprint6MatchingEnabled("TRUE"), false);
  assert.equal(isSprint6MatchingEnabled("true"), true);
});
```

Run: `node --experimental-strip-types --test tests/sprint6-feature-flag.test.mjs`
Expected: FAIL karena module belum ada.

- [ ] **Step 2: Implementasikan feature flag minimal**

```ts
export function isSprint6MatchingEnabled(
  value = process.env.SPRINT6_MATCHING_ENABLED,
): boolean {
  return value === "true";
}
```

Tambahkan `SPRINT6_MATCHING_ENABLED=false` ke `.env.example`. Jangan memakai `NEXT_PUBLIC_` karena API adalah authority dan flag deployment tidak perlu masuk bundle browser.

- [ ] **Step 3: Jalankan test flag sampai lulus**

Run: `node --experimental-strip-types --test tests/sprint6-feature-flag.test.mjs`
Expected: PASS 1 test.

- [ ] **Step 4: Tulis test kontrak booking yang gagal**

Test wajib membuktikan:

```ts
createTaskSchema.parse({
  mode_penugasan: "langsung",
  helper_id: validUuid,
  lansia_id: validUuid,
  service_category_id: validUuid,
  jadwal_waktu: futureIso,
});

assert.throws(() => createTaskSchema.parse({
  mode_penugasan: "langsung",
  helper_id: undefined,
  lansia_id: validUuid,
  service_category_id: validUuid,
  jadwal_waktu: futureIso,
}));

assert.throws(() => createTaskSchema.parse({
  mode_penugasan: "pelamar",
  helper_id: validUuid,
  lansia_id: validUuid,
  service_category_id: validUuid,
  jadwal_waktu: futureIso,
}));
```

Tambahkan kasus `cepat` dengan `helper_id` terisi, mode asing, UUID invalid, dan jadwal invalid.

Run: `node --experimental-strip-types --test tests/sprint6-booking-contract.test.mjs`
Expected: FAIL karena schema belum discriminated.

- [ ] **Step 5: Ubah schema menjadi discriminated union**

```ts
const baseTaskSchema = z.object({
  lansia_id: z.string().uuid("ID Lansia tidak valid"),
  service_category_id: z.string().uuid("ID kategori tidak valid"),
  jadwal_waktu: z.string().datetime({ offset: true }),
  tambahan_waktu_menit: z.number().int().min(0).optional(),
  catatan: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const createTaskSchema = z.discriminatedUnion("mode_penugasan", [
  baseTaskSchema.extend({
    mode_penugasan: z.literal("langsung"),
    helper_id: z.string().uuid(),
  }),
  baseTaskSchema.extend({
    mode_penugasan: z.literal("pelamar"),
    helper_id: z.null().optional(),
  }),
  baseTaskSchema.extend({
    mode_penugasan: z.literal("cepat"),
    helper_id: z.null().optional(),
  }),
]);
```

Compatibility request lama hanya berlaku untuk direct booking dengan `helper_id`: route menambahkan `mode_penugasan: "langsung"` sebelum parsing jika field mode tidak dikirim. Request lama tanpa mode dan tanpa Helper harus menerima `422`, karena open task sekarang wajib memilih `pelamar` atau `cepat` secara eksplisit.

- [ ] **Step 6: Dokumentasikan contract lengkap**

Di `docs/api-contract.md`, tulis request, response, actor, error, dan seed example untuk:

- `POST /api/tasks` tiga mode;
- `GET /api/tasks/marketplace`;
- apply, withdraw, list applicant, select applicant;
- quick/direct accept;
- feature disabled response `404 { error: "not_found", message: "Fitur belum tersedia" }`.

- [ ] **Step 7: Jalankan test task dan typecheck**

Run: `node --experimental-strip-types --test tests/sprint6-feature-flag.test.mjs tests/sprint6-booking-contract.test.mjs tests/helper-task-acceptance.test.mjs tests/task-scheduling-actions.test.mjs`
Expected: seluruh test PASS.
Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 8: Commit atomik**

```text
docs(tasks): kunci kontrak mode penugasan sprint 6

Mode langsung, pelamar, dan cepat memiliki payload serta deployment gate yang eksplisit sebelum schema berubah.

Refs: TDD §3.14, §4.5, §7, FR-TSK-12, FR-TSK-13, FR-TSK-14
```

## Task 1: Schema Assignment dan Eligibility Primitives

**Owner:** Mervin
**Reviewer:** Farros

**Files:**

- Create: `supabase/migrations/20260903090000_sprint6_assignment_modes.sql`
- Create: `supabase/migrations/20260903100000_sprint6_assignment_eligibility.sql`
- Regenerate: `src/types/database.ts`
- Create: `src/lib/tasks/assignment-types.ts`
- Create: `src/lib/tasks/assignment-errors.ts`
- Create: `tests/sprint6-assignment-schema.test.mjs`
- Create: `tests/sprint6-assignment-eligibility-runtime.test.mjs`
- Modify: `tests/task-expiry-contract.test.mjs`

**Interfaces:**

- Produces database enum `public.task_assignment_mode` dan `public.task_application_status`.
- Produces table `public.task_applications`.
- Produces internal function `public.check_task_assignment_eligibility(uuid, uuid, timestamptz)` yang hanya dapat dipanggil fungsi database trusted.
- Produces TS types `MarketplaceTask`, `PublicApplicant`, `AssignmentConflictCode`.
- Consumes status, trust, radius, category, dan approval rules dari TDD §3.2-§3.3 serta §3.14.

- [ ] **Step 1: Tulis schema tests yang gagal**

Assert migration memiliki:

```js
assert.match(sql, /CREATE TYPE public\.task_assignment_mode AS ENUM \('langsung', 'pelamar', 'cepat'\)/);
assert.match(sql, /CREATE TABLE public\.task_applications/);
assert.match(sql, /UNIQUE \(task_id, helper_id\)/);
assert.match(sql, /WHERE \(status = 'selected'\)/);
assert.match(sql, /ALTER TABLE public\.task_applications ENABLE ROW LEVEL SECURITY/);
```

Test runtime nanti harus memeriksa constraint, bukan berhenti pada regex.

Run: `node --experimental-strip-types --test tests/sprint6-assignment-schema.test.mjs`
Expected: FAIL karena migration belum ada.

- [ ] **Step 2: Buat enum, backfill, constraint, dan table**

Migration pertama harus menjalankan urutan berikut dalam transaction:

```sql
CREATE TYPE public.task_assignment_mode AS ENUM ('langsung', 'pelamar', 'cepat');
CREATE TYPE public.task_application_status AS ENUM
  ('pending', 'selected', 'withdrawn', 'rejected', 'expired');

ALTER TABLE public.tasks
  ADD COLUMN mode_penugasan public.task_assignment_mode;

UPDATE public.tasks
SET mode_penugasan = CASE
  WHEN helper_id IS NULL THEN 'cepat'::public.task_assignment_mode
  ELSE 'langsung'::public.task_assignment_mode
END;

ALTER TABLE public.tasks
  ALTER COLUMN mode_penugasan SET DEFAULT 'langsung',
  ALTER COLUMN mode_penugasan SET NOT NULL;
```

Sebelum menambah constraint, batalkan task open legacy yang `expires_at <= NOW()`. Constraint harus mengizinkan cancelled task tanpa Helper, tetapi menolak active mode `langsung` tanpa Helper serta active mode `pelamar/cepat` yang sudah memiliki Helper sebelum assignment transaction.

- [ ] **Step 3: Buat `task_applications` dan index**

```sql
CREATE TABLE public.task_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  helper_id uuid NOT NULL REFERENCES public.helper_profiles(id) ON DELETE CASCADE,
  status public.task_application_status NOT NULL DEFAULT 'pending',
  diajukan_at timestamptz NOT NULL DEFAULT NOW(),
  diputus_at timestamptz,
  UNIQUE (task_id, helper_id)
);

CREATE UNIQUE INDEX task_applications_one_selected_per_task
  ON public.task_applications(task_id)
  WHERE status = 'selected';
```

Tambahkan check bahwa `diputus_at IS NULL` hanya untuk `pending`, serta trigger yang menolak update langsung dari state terminal ke state lain.

- [ ] **Step 4: Tulis runtime eligibility tests yang gagal**

Dengan akun cloud development terisolasi, buat fixture untuk reason berikut:

```ts
type AssignmentConflictCode =
  | "helper_not_verified"
  | "helper_not_available"
  | "trust_tier_not_allowed"
  | "category_not_served"
  | "outside_radius"
  | "location_incomplete"
  | "schedule_conflict"
  | "task_not_available"
  | "mode_not_allowed";
```

Test helper eligible, probation untuk `pelamar` terjadwal, probation untuk `cepat`, kategori tidak dilayani, missing coordinates, luar radius, task aktif, overlap jadwal, high-risk cepat, dan task expired.

Run: `RUN_SUPABASE_INTEGRATION=1 node --experimental-strip-types --test tests/sprint6-assignment-eligibility-runtime.test.mjs`
Expected: FAIL karena function belum ada.

- [ ] **Step 5: Implementasikan internal eligibility function**

Function mengambil task dan Helper `FOR UPDATE` saat dipakai mutation. Aturan minimum:

```sql
eligible := helper.status = 'verified'
  AND helper.is_available = TRUE
  AND task.status = 'diajukan'
  AND task.expires_at > p_now
  AND helper melayani task.service_category_id
  AND seluruh koordinat tersedia
  AND distance_km <= helper.radius_layanan_km
  AND tidak ada task aktif atau range jadwal yang overlap;
```

Mode `cepat` menambah trust `terpercaya`, kategori non-high-risk, dan same-day. Mode `pelamar` menambah jadwal minimal 3 jam saat task dibuat. Jangan memakai `SECURITY DEFINER` tanpa `SET search_path = public, pg_temp`, explicit grants, dan revoke dari `PUBLIC`.

- [ ] **Step 6: Implementasikan interval schedule conflict**

Interval candidate adalah `[jadwal_waktu, jadwal_waktu + estimasi_durasi_menit)`. Konflik diperiksa terhadap task Helper berstatus `menunggu_persetujuan_koordinator`, `dikonfirmasi`, `dikerjakan`, atau `menunggu_persetujuan_keluarga`. Task `dikerjakan` selalu dianggap konflik sampai selesai, meskipun estimasi awal telah lewat.

- [ ] **Step 7: Regenerasi types dari cloud development**

Run: `npx supabase db push` setelah memastikan linked project adalah development.
Expected: dua migration applied.
Run: `npx supabase gen types typescript --linked | Set-Content -Encoding utf8 src\types\database.ts`
Expected: enum, table, relation, dan RPC signatures Sprint 6 muncul tanpa edit manual.

- [ ] **Step 8: Jalankan tests dan verify migration**

Run: `node --experimental-strip-types --test tests/sprint6-assignment-schema.test.mjs tests/task-expiry-contract.test.mjs`
Expected: PASS.
Run: `RUN_SUPABASE_INTEGRATION=1 node --experimental-strip-types --test tests/sprint6-assignment-eligibility-runtime.test.mjs`
Expected: PASS seluruh reason code.

- [ ] **Step 9: Commit atomik**

```text
feat(tasks): tambah fondasi mode penugasan

Schema assignment dan eligibility server menjaga mode pelamar serta cepat tetap mengikuti radius, kategori, jadwal, dan state task.

Refs: TDD §3.2, §3.3, §3.14, §6, §8, FR-TSK-12, FR-TSK-14, FR-TSK-16
```

## Task 2: Pilih dari Pelamar End-to-End

**Owner:** Farros
**Reviewer:** Mervin

**Files:**

- Create: `supabase/migrations/20260903130000_sprint6_task_applications_rpc.sql`
- Create: `src/lib/validations/task-application.ts`
- Create: `src/lib/tasks/application-contract.ts`
- Create: `src/app/api/tasks/[id]/applications/route.ts`
- Create: `src/app/api/tasks/[id]/applications/me/route.ts`
- Create: `src/app/api/tasks/[id]/applications/[application_id]/select/route.ts`
- Modify: `src/app/api/booking/task/route.ts`
- Create: `src/components/keluarga/booking/ApplicantBookingForm.tsx`
- Create: `src/components/helper/ApplicantTaskCard.tsx`
- Create: `src/components/keluarga/applicants/ApplicantListClient.tsx`
- Create: `src/components/keluarga/applicants/ApplicantCard.tsx`
- Create: `src/app/(keluarga)/kunjungan/[id]/pelamar/page.tsx`
- Modify: `src/app/(helper)/helper/tugas/page.tsx`
- Modify: `src/lib/audit.ts`
- Modify: `supabase/seed.sql`
- Create: `tests/sprint6-task-applications-runtime.test.mjs`
- Create: `tests/sprint6-applicant-ui-contract.test.mjs`

**Interfaces:**

- Consumes: `MarketplaceTask`, `PublicApplicant`, feature flag, dan eligibility function Task 0-1.
- Produces: `POST/DELETE /api/tasks/:id/applications`, `GET /api/tasks/:id/applications`, dan `PATCH /api/tasks/:id/applications/:application_id/select`.
- Produces RPC `apply_to_task`, `withdraw_task_application`, dan `select_task_application`.
- Produces UI components yang tidak mengubah file quick-mode milik Mervin.

- [ ] **Step 1: Tulis runtime tests aplikasi yang gagal**

Test fixture harus mencakup:

```text
Helper eligible apply -> 201 pending
Helper yang sama apply ulang -> 409, tetap satu row
Helper di luar radius -> 403 outside_radius
Helper kategori tidak cocok -> 403 category_not_served
Helper withdraw pending -> 200 withdrawn
Helper withdraw selected/rejected -> 409
Keluarga pemilik list pelamar -> 200 hanya public profile fields
Keluarga lain list/select -> 404 atau 403 tanpa data pelamar
Dua selection concurrent -> satu sukses, satu 409
Select application withdrawn -> 409
Select Helper yang menjadi unavailable/bentrok setelah apply -> 409
Selection probation -> menunggu_persetujuan_koordinator
Selection trusted normal -> dikonfirmasi
```

Run: `RUN_SUPABASE_INTEGRATION=1 node --experimental-strip-types --test tests/sprint6-task-applications-runtime.test.mjs`
Expected: FAIL karena RPC belum ada.

- [ ] **Step 2: Implementasikan validation application**

```ts
export const taskIdParamsSchema = z.object({ id: z.string().uuid() });
export const selectApplicationParamsSchema = z.object({
  id: z.string().uuid(),
  application_id: z.string().uuid(),
});

export type ApplicationMutationResult = {
  task_id: string;
  application_id: string;
  application_status: TaskApplicationStatus;
  task_status: TaskStatus;
  helper_id: string | null;
};
```

Apply dan withdraw tidak menerima JSON body. Actor dan Helper profile selalu berasal dari sesi.

- [ ] **Step 3: Implementasikan RPC apply**

`apply_to_task` harus:

1. mengambil actor Helper dari `auth.uid()`;
2. lock task `FOR UPDATE`;
3. memeriksa flag di application layer sebelum RPC;
4. memastikan mode `pelamar`, status `diajukan`, dan belum expired;
5. memanggil internal eligibility check;
6. insert satu application `pending`;
7. mengubah unique violation menjadi conflict terkontrol;
8. membuat notifikasi untuk Keluarga tanpa membocorkan detail task ke pihak lain.

- [ ] **Step 4: Implementasikan RPC withdraw**

Gunakan conditional update:

```sql
UPDATE public.task_applications
SET status = 'withdrawn', diputus_at = NOW()
WHERE task_id = p_task_id
  AND helper_id = actor_helper_id
  AND status = 'pending'
RETURNING *;
```

Tidak ada row berarti `application_not_pending`, bukan server error.

- [ ] **Step 5: Implementasikan RPC selection atomik**

Transaction function harus lock task dan target application, memverifikasi `tasks.keluarga_id = auth.uid()`, menghitung ulang eligibility, menentukan next status dengan aturan §3.3.2, lalu menjalankan:

```sql
UPDATE public.tasks
SET helper_id = selected_helper_id,
    status = calculated_next_status,
    confirmed_at = CASE
      WHEN calculated_next_status = 'dikonfirmasi' THEN NOW()
      ELSE confirmed_at
    END,
    updated_at = NOW()
WHERE id = p_task_id
  AND status = 'diajukan'
  AND mode_penugasan = 'pelamar'
  AND helper_id IS NULL;

UPDATE public.task_applications
SET status = CASE WHEN id = p_application_id THEN 'selected' ELSE 'rejected' END,
    diputus_at = NOW()
WHERE task_id = p_task_id AND status = 'pending';
```

Jika conditional task update tidak menghasilkan satu row, rollback dan return conflict. Audit `select_task_applicant` dan notifikasi selected/rejected dibuat di transaksi yang sama.

- [ ] **Step 6: Buat route handlers tipis**

Setiap route menjalankan urutan auth, feature flag, params Zod, RPC, error mapping. Mapping canonical:

```ts
const statusByCode = {
  task_not_found: 404,
  application_not_found: 404,
  forbidden: 403,
  duplicate_application: 409,
  application_not_pending: 409,
  task_already_assigned: 409,
  helper_no_longer_eligible: 409,
} as const;
```

Jangan mengembalikan `error.message` Supabase mentah.

- [ ] **Step 7: Integrasikan create task mode pelamar**

Route booking mengambil category, lansia ownership, dan waktu server. Untuk `pelamar`:

```ts
if (scheduledAt.getTime() < now.getTime() + 3 * 60 * 60 * 1000) {
  return createApiError(
    "validation_error",
    "Mode pilih pelamar membutuhkan jadwal minimal 3 jam dari sekarang",
    422,
  );
}
```

Server menyimpan `helper_id = null`, `mode_penugasan = pelamar`, harga snapshot, dan `expires_at = now + 1 jam`. Category berbasis jarak boleh digunakan karena eligibility dihitung terhadap setiap pelamar, bukan Helper pilihan awal.

- [ ] **Step 8: Buat form booking pelamar**

`ApplicantBookingForm` memuat:

- pilihan lansia, kategori, jadwal, catatan;
- penjelasan bahwa harga tidak dinegosiasikan;
- penjelasan window satu jam;
- validation jadwal minimal tiga jam;
- loading, unavailable feature, empty lansia/kategori, field error, server error, dan success redirect ke `/kunjungan/{id}/pelamar`;
- label eksplisit dan target sentuh 44px.

Catatan keluarga tidak ditampilkan kepada pelamar sebelum selection. UI harus menjelaskan bahwa informasi sensitif baru terbuka setelah dipilih.

- [ ] **Step 9: Buat apply/withdraw UI Helper**

`ApplicantTaskCard` hanya menerima `MarketplaceTask`. Tombol state:

```text
null -> Ajukan diri
pending -> Batalkan pengajuan
selected -> Anda dipilih
rejected -> Keluarga memilih Helper lain
withdrawn -> Pengajuan dibatalkan
expired -> Permintaan berakhir
```

Pending mutation menonaktifkan double click. `409` memicu refetch marketplace dan pesan spesifik, bukan retry otomatis.

- [ ] **Step 10: Buat daftar dan selection UI Keluarga**

`ApplicantListClient` menampilkan kartu profil publik, jarak, trust tier, sumber verifikasi, rating, jumlah tugas, waktu apply, dan status. Jangan tampilkan KTP, domisili lengkap, email, nomor telepon, atau sanction details.

Selection memakai confirmation dialog yang menyebut nama Helper dan menjelaskan bahwa pelamar lain otomatis ditolak. Setelah sukses, redirect ke detail kunjungan; setelah `409`, refresh list dan pertahankan context pengguna.

- [ ] **Step 11: Jalankan runtime, UI contract, dan regression tests**

Run: `RUN_SUPABASE_INTEGRATION=1 node --experimental-strip-types --test tests/sprint6-task-applications-runtime.test.mjs`
Expected: PASS seluruh ownership, eligibility, dan concurrency cases.
Run: `node --experimental-strip-types --test tests/sprint6-applicant-ui-contract.test.mjs tests/helper-task-acceptance.test.mjs tests/koordinator-task-approval.test.mjs`
Expected: PASS.

- [ ] **Step 12: QA manual vertical slice**

Pada 375px dan keyboard-only:

1. Keluarga membuat task pelamar.
2. Helper A dan B apply.
3. Helper B withdraw.
4. Keluarga mencoba memilih B dan menerima conflict.
5. Keluarga memilih A.
6. Task menjadi status sesuai trust/approval.
7. Helper lain tidak dapat melihat detail lansia.

- [ ] **Step 13: Commit atomik**

```text
feat(tasks): tambah alur pilih dari pelamar

Keluarga dapat memilih satu Helper yang sudah menyatakan tersedia melalui selection atomik tanpa membuka data lansia sebelum assignment.

Refs: TDD §3.14, §4.5, §6, §7, §8, FR-TSK-12, FR-TSK-13, FR-TSK-15, FR-TSK-16
```

## Task 3: Cari Cepat End-to-End

**Owner:** Mervin
**Reviewer:** Farros

**Files:**

- Create: `supabase/migrations/20260904090000_sprint6_quick_assignment.sql`
- Create: `src/app/api/tasks/marketplace/route.ts`
- Modify: `src/app/api/tasks/[id]/accept/route.ts`
- Modify: `src/app/api/booking/task/route.ts`
- Create: `src/lib/tasks/marketplace.ts`
- Create: `src/lib/validations/task-marketplace.ts`
- Create: `src/components/keluarga/booking/QuickBookingForm.tsx`
- Create: `src/components/keluarga/booking/QuickMatchStatus.tsx`
- Create: `src/components/helper/QuickTaskCard.tsx`
- Modify: `src/components/helper/AcceptTaskButton.tsx`
- Modify: `src/lib/helper/task-acceptance.ts`
- Modify: `src/lib/helper/task-board.ts`
- Modify: `supabase/seed.sql`
- Create: `tests/sprint6-quick-assignment-runtime.test.mjs`
- Create: `tests/sprint6-marketplace-response.test.mjs`
- Create: `tests/sprint6-quick-ui-contract.test.mjs`

**Interfaces:**

- Consumes: assignment enums, eligibility function, feature flag, dan `MarketplaceTask` Task 0-1.
- Produces: `GET /api/tasks/marketplace?mode=cepat|pelamar` dan `accept_task_assignment` untuk direct/quick.
- Produces: `QuickBookingForm`, `QuickMatchStatus`, serta `QuickTaskCard` untuk integrasi Task 5.

- [ ] **Step 1: Tulis response privacy test yang gagal**

Test route response harus menyertakan allowed fields dan menolak sensitive fields secara rekursif:

```js
const forbiddenKeys = [
  "nama",
  "alamat",
  "lat",
  "lng",
  "catatan_kondisi",
  "kebutuhan_khusus",
  "dokumen_identitas_lansia_url",
  "dokumen_hubungan_keluarga_url",
  "health_snapshots",
  "messages",
];
```

Pengecualian hanya `kategori.nama`; test harus memeriksa path key agar nama kategori tidak dianggap kebocoran nama lansia.

Run: `node --experimental-strip-types --test tests/sprint6-marketplace-response.test.mjs`
Expected: FAIL karena endpoint belum ada dan page lama masih mengambil profil lansia lengkap.

- [ ] **Step 2: Tulis quick concurrency test yang gagal**

Runtime scenario:

1. buat task cepat valid;
2. Helper A dan B sama-sama eligible;
3. panggil `accept_task_assignment` concurrent;
4. assert tepat satu fulfillment sukses;
5. assert task memiliki satu `helper_id` dan status `dikonfirmasi`;
6. assert loser menerima conflict;
7. assert hanya satu notification assignment per recipient;
8. assert tidak ada application row untuk mode cepat.

Tambahkan negative cases probation, under_review, unavailable, high-risk, wrong category, missing coordinate, outside radius, schedule overlap, expired, dan task hari berbeda.

Run: `RUN_SUPABASE_INTEGRATION=1 node --experimental-strip-types --test tests/sprint6-quick-assignment-runtime.test.mjs`
Expected: FAIL karena RPC belum ada.

- [ ] **Step 3: Implementasikan marketplace projection database**

`get_task_marketplace` berjalan sebagai function terkontrol dan hanya mengembalikan task yang actor Helper lolos eligibility. Bentuk result mengikuti `MarketplaceTask`. Lokasi dibentuk server:

```sql
ROUND((distance_km * 2)::numeric) / 2 AS jarak_km
```

Gunakan `kelurahan` dan `kecamatan`; jangan fallback ke `alamat`. Function tidak mengembalikan `lansia_id`, `keluarga_id`, raw coordinates, atau task `catatan`.

Untuk mode `pelamar`, result menyertakan application status actor. Untuk mode `cepat`, `application_status` selalu null. Pagination default 20 dan maksimal 50, urutkan `expires_at` terdekat lalu jarak.

- [ ] **Step 4: Implementasikan marketplace route**

Validation query:

```ts
export const marketplaceQuerySchema = z.object({
  mode: z.enum(["pelamar", "cepat"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().datetime({ offset: true }).optional(),
});
```

Route memeriksa auth Helper, feature flag, profile verified, lalu RPC projection. Profile invalid mendapat `403`; query invalid `422`; database failure `500` dengan pesan aman.

- [ ] **Step 5: Implementasikan quick create rules**

Untuk mode `cepat`, route booking harus:

- mengambil timezone bisnis `Asia/Jakarta` di server;
- memastikan `jadwal_waktu > now` dan tanggal lokal sama;
- menolak category `is_high_risk`;
- memastikan lansia milik actor dan koordinatnya lengkap;
- menyimpan `helper_id = null`, `mode_penugasan = cepat`, dan `expires_at = now + 15 menit`;
- tidak menyimpan flag availability atau trust dari browser;
- tidak mengirim `payment_url` sebelum assignment berhasil.

- [ ] **Step 6: Implementasikan `accept_task_assignment`**

RPC mendukung:

```text
langsung: actor harus sama dengan tasks.helper_id
cepat: tasks.helper_id harus null dan actor harus lolos quick eligibility
pelamar: ditolak, karena pemilihan hanya melalui select application
```

Quick acceptance mengunci task dan Helper, menghitung ulang eligibility, lalu conditional update:

```sql
UPDATE public.tasks
SET helper_id = actor_helper_id,
    status = 'dikonfirmasi',
    confirmed_at = NOW(),
    updated_at = NOW()
WHERE id = p_task_id
  AND mode_penugasan = 'cepat'
  AND status = 'diajukan'
  AND helper_id IS NULL
  AND expires_at > NOW()
RETURNING *;
```

Helper cepat juga harus bebas dari seluruh kondisi approval §3.3.2, termasuk vakum lebih dari 60 hari dan riwayat sanksi. Jika tidak, eligibility gagal. Notification Keluarga, Helper, dan Koordinator pasif dibuat dalam transaction yang sama.

- [ ] **Step 7: Refactor accept route menjadi RPC adapter**

Hapus kalkulasi authoritative dari route setelah RPC tersedia, tetapi pertahankan helper presentasi client. Route tidak lagi melakukan read-then-write. Map reason code:

```ts
const conflictCodes = new Set([
  "task_already_assigned",
  "task_expired",
  "schedule_conflict",
  "helper_no_longer_eligible",
]);
```

Seluruh conflict menjadi `409` dan client wajib refresh. Forbidden role/status menjadi `403`.

- [ ] **Step 8: Buat Quick Booking UI**

Form menjelaskan:

- layanan dilakukan hari ini;
- hanya Helper terpercaya non-high-risk;
- pencarian berlangsung maksimal 15 menit;
- ini bukan layanan darurat;
- harga tetap berasal dari kategori;
- jika tidak ada Helper, tidak ada pembayaran yang ditahan.

Kategori high-risk dinonaktifkan dengan alasan, bukan disembunyikan. Success berpindah ke detail task dengan `QuickMatchStatus`.

- [ ] **Step 9: Buat Quick Match status UI Keluarga**

State canonical:

```text
diajukan + cepat + belum expired -> Mencari Helper, countdown presentasional
dikonfirmasi -> Helper ditemukan, tampilkan profil dan CTA pembayaran
dibatalkan + alasan expiry -> Belum ada Helper, pilih katalog atau mode pelamar
error -> status tidak dapat dimuat, retry
```

Countdown browser tidak pernah mengubah task menjadi batal. Poll `GET /api/tasks/:id` setiap 5 detik hanya selama page visible dan berhenti setelah status berubah/unmount.

- [ ] **Step 10: Buat Quick Task Card Helper**

Kartu hanya menampilkan `MarketplaceTask`, badge `Cari Cepat`, harga, jadwal, durasi, area ringkas, jarak rounded, dan expiry. Tidak ada nama/foto lansia, catatan kesehatan, alamat, atau peta pin.

Accept button menampilkan pending, success, 409 race, forbidden eligibility, dan network error. Setelah `409`, card dihapus/refetch tanpa auto-retry.

- [ ] **Step 11: Jalankan tests**

Run: `node --experimental-strip-types --test tests/sprint6-marketplace-response.test.mjs tests/sprint6-quick-ui-contract.test.mjs tests/helper-task-acceptance.test.mjs tests/helper-task-board.test.mjs`
Expected: PASS.
Run: `RUN_SUPABASE_INTEGRATION=1 node --experimental-strip-types --test tests/sprint6-quick-assignment-runtime.test.mjs tests/rls-integration.test.mjs`
Expected: PASS tanpa skipped Sprint 6 case.

- [ ] **Step 12: QA manual race dan privacy**

Gunakan dua sesi Helper dan satu sesi Keluarga:

1. Keluarga membuat task cepat.
2. Kedua Helper melihat area ringkas yang sama tanpa data lansia.
3. Kedua Helper menerima hampir bersamaan.
4. Satu sukses, satu mendapat pesan task sudah diambil.
5. Hanya pemenang dapat membuka alamat/detail lansia.
6. Keluarga melihat Helper pemenang dan payment CTA.

- [ ] **Step 13: Commit atomik**

```text
feat(tasks): tambah pencarian cepat Helper terpercaya

Task same-day memakai marketplace tereduksi dan conditional assignment agar respons cepat tidak mengorbankan privasi atau race safety.

Refs: TDD §3.2, §3.3, §3.14, §6, §7, §8, FR-TSK-02, FR-TSK-14, FR-TSK-15, FR-TSK-16
```

## Task 4: Marketplace Privacy dan Runtime RLS Matrix

**Owner:** Farros
**Contributor:** Mervin
**Reviewer:** keduanya wajib menjalankan matrix owner lain

**Files:**

- Create: `supabase/migrations/20260904190000_sprint6_assignment_rls.sql`
- Modify: `src/app/(helper)/helper/tugas/baru/page.tsx`
- Modify: `src/app/(helper)/helper/tugas/baru/CariPekerjaanClient.tsx`
- Modify: `tests/rls-integration.test.mjs`
- Create: `tests/sprint6-assignment-rls-runtime.test.mjs`
- Modify: `tests/helper-task-marketplace-grants.test.mjs`

**Interfaces:**

- Consumes: marketplace RPC dan application table Task 1-3.
- Produces: direct table policies yang hanya mengizinkan participant; marketplace read hanya melalui projection tereduksi.
- Produces: runtime evidence untuk Keluarga A/B, Helper A/B, Koordinator RT/RW, dan Admin.

- [ ] **Step 1: Tulis runtime RLS tests yang gagal**

Matrix minimum:

| Actor | Unassigned task row | Marketplace projection | Application rows | Assigned full task |
| ----- | ------------------- | ---------------------- | ---------------- | ------------------ |
| Keluarga owner | Read | Tidak digunakan | Read semua pelamar task sendiri | Read |
| Keluarga lain | Deny | Tidak digunakan | Deny | Deny |
| Helper eligible | Deny direct | Read reduced eligible tasks | Read own only | Read jika terpilih |
| Helper ineligible | Deny | Task tidak muncul | Deny application orang lain | Deny |
| Koordinator | Deny sebelum assignment | Tidak tersedia | Deny | Read hanya jika approval/region rule berlaku |
| Admin | Tidak memakai marketplace | Tidak tersedia | Akses investigasi hanya lewat Admin API | Sesuai policy Admin |

Run: `RUN_SUPABASE_INTEGRATION=1 node --experimental-strip-types --test tests/sprint6-assignment-rls-runtime.test.mjs`
Expected: FAIL karena policy marketplace lama masih memberi Helper direct read task/lansia.

- [ ] **Step 2: Tutup policy marketplace direct lama**

Drop policy yang mengizinkan seluruh Helper verified membaca row task `diajukan` dengan `helper_id IS NULL`. Policy `tasks` baru hanya mengizinkan:

```text
Keluarga owner
Helper yang sudah sama dengan tasks.helper_id
Koordinator yang berwenang pada task assigned dan butuh approval/monitoring
Admin sesuai policy privileged
```

Jangan mencoba mempertahankan job board dengan broad join lalu menyembunyikan field di React.

- [ ] **Step 3: Terapkan RLS `task_applications`**

Policy direct table:

- Helper SELECT hanya row dengan `helper_id` miliknya.
- Keluarga SELECT hanya application yang `task_id` dimiliki actor.
- INSERT/UPDATE/DELETE direct ditolak. Mutation hanya melalui RPC dengan actor validation.
- Koordinator tidak mendapat SELECT sebelum task assigned.
- Grants function hanya `authenticated`; function internal eligibility di-revoke dari `authenticated` dan `PUBLIC`.

- [ ] **Step 4: Ganti server page job board**

Hapus query berikut dari page Helper:

```text
tasks -> lansia_profiles!inner -> nama/alamat/lat/lng/catatan_kondisi
```

Page hanya memanggil `GET /api/tasks/marketplace` atau server adapter yang menghasilkan `MarketplaceTask[]`. Jangan memindahkan projection logic ke client.

- [ ] **Step 5: Pastikan error bukan empty state**

`CariPekerjaanClient` menerima state typed:

```ts
type MarketplaceState =
  | { status: "ready"; tasks: MarketplaceTask[] }
  | { status: "empty" }
  | { status: "forbidden"; message: string }
  | { status: "error"; message: string };
```

Forbidden profile, database failure, dan benar-benar tidak ada task harus memiliki copy berbeda.

- [ ] **Step 6: Jalankan runtime matrix tanpa skip**

Run: `RUN_SUPABASE_INTEGRATION=1 node --experimental-strip-types --test tests/sprint6-assignment-rls-runtime.test.mjs tests/rls-integration.test.mjs`
Expected: PASS dan output tidak memuat `SKIP`.
Run: `node --experimental-strip-types --test tests/helper-task-marketplace-grants.test.mjs tests/sprint6-marketplace-response.test.mjs`
Expected: PASS setelah test lama diperbarui untuk menolak broad direct policy.

- [ ] **Step 7: Commit atomik**

```text
fix(rls): batasi marketplace sebelum assignment

Helper hanya menerima projection task yang sudah direduksi dan tidak lagi dapat membaca profil lansia melalui policy job board umum.

Refs: TDD §3.14, §6, §8, §16, FR-TSK-15
```

## Task 5: Integrasi UI, Expiry, Notification, dan Seed

**Owner:** Mervin sebagai integrator
**Contributor:** Farros untuk fixture dan state pelamar
**Reviewer:** Farros

**Files:**

- Refactor: `src/app/(keluarga)/booking/new/page.tsx`
- Create: `src/app/(keluarga)/booking/new/BookingNewClient.tsx`
- Modify: `src/app/(keluarga)/kunjungan/[id]/page.tsx`
- Modify: `src/app/(keluarga)/kunjungan/page.tsx`
- Modify: `src/app/(helper)/helper/tugas/baru/CariPekerjaanClient.tsx`
- Modify: `src/app/(helper)/helper/tugas/page.tsx`
- Modify: `src/components/ui/TaskStatusBadge.tsx`
- Create: `supabase/migrations/20260905080000_sprint6_assignment_expiry_notifications.sql`
- Modify: `.github/workflows/scheduled-jobs.yml`
- Modify: `supabase/seed.sql`
- Modify: `scripts/seed.mjs`
- Create: `tests/sprint6-assignment-expiry-runtime.test.mjs`
- Create: `tests/sprint6-seed-matrix.test.mjs`
- Create: `tests/sprint6-assignment-navigation.test.mjs`

**Interfaces:**

- Consumes all API/components dari Task 0-4.
- Produces satu entry UI untuk memilih mode dan satu job board yang merender card berdasarkan `mode_penugasan`.
- Produces expiry transaction yang membatalkan task dan menutup application pending.
- Produces deterministic fixtures TDD §19.8.

- [ ] **Step 1: Tulis integration tests yang gagal**

Test source/runtime harus membuktikan:

- feature off hanya menampilkan direct Helper booking path;
- feature on menampilkan pilihan `Pilih dari Pelamar` dan `Cari Cepat`;
- applicant success menuju `/kunjungan/:id/pelamar`;
- quick success menuju detail dengan searching state;
- job board memilih `ApplicantTaskCard` atau `QuickTaskCard` dari mode;
- task direct tetap masuk bucket lama;
- no route penting menjadi 404 saat flag aktif.

Run: `node --experimental-strip-types --test tests/sprint6-assignment-navigation.test.mjs`
Expected: FAIL karena integration wrapper belum ada.

- [ ] **Step 2: Refactor booking page menjadi server gate dan client form**

`page.tsx` membaca feature flag di server dan meneruskan boolean ke `BookingNewClient`. Client menawarkan dua mode Sprint 6 hanya saat flag true. Direct booking tetap dimulai dari `/booking/{helper_id}`.

Mode selector memakai radio cards dengan judul, cocok untuk, waktu tunggu, batas keamanan, dan CTA. Pergantian mode membersihkan field yang tidak valid dan tidak mempertahankan stale error.

- [ ] **Step 3: Integrasikan job board tanpa data shape ganda**

`CariPekerjaanClient` hanya menerima `MarketplaceTask[]`. Render:

```tsx
task.mode_penugasan === "pelamar"
  ? <ApplicantTaskCard task={task} />
  : <QuickTaskCard task={task} />
```

Tabs: `Semua`, `Pilih dari Pelamar`, `Cari Cepat`, dan `Pengajuan Saya`. Filter tab hanya presentation; server tetap menentukan task yang boleh diterima.

- [ ] **Step 4: Integrasikan family task list/detail**

Daftar Keluarga menampilkan mode, status, expiry, jumlah pelamar untuk task pelamar, dan searching state untuk cepat. Detail hanya memuat alamat/lansia normal bagi Keluarga owner. CTA:

```text
pelamar + diajukan -> Lihat pelamar
cepat + diajukan -> Lihat status pencarian
dikonfirmasi -> Bayar / lihat Helper
dibatalkan karena expiry -> Coba mode lain
```

- [ ] **Step 5: Update expiry RPC**

`expire_unassigned_tasks` harus lock dan membatalkan task `diajukan` dengan `expires_at <= NOW()` untuk seluruh mode. Untuk mode pelamar, dalam transaction yang sama:

```sql
UPDATE public.task_applications
SET status = 'expired', diputus_at = NOW()
WHERE task_id = expired_task_id AND status = 'pending';
```

Tambahkan notifikasi Keluarga, dan notification Helper hanya untuk application yang sebelumnya pending. Retry scheduled job tidak boleh menggandakan notifikasi.

- [ ] **Step 6: Pisahkan scheduled job dari heartbeat**

`scheduled-jobs.yml` menjalankan expiry setiap 5 menit. `heartbeat.yml` tetap khusus health ping dua kali seminggu sesuai TDD §2.3. Scheduled job memerlukan secret yang sama, memvalidasi secret, dan memanggil RPC dengan service role. Jangan menaruh key di source.

- [ ] **Step 7: Buat seed Sprint 6 deterministik**

Seed wajib menghasilkan:

```text
1 direct regression task
1 applicant task dengan 3 pending applications
1 applicant task dengan tepat 1 selected dan lainnya rejected
1 active quick task dengan 2 eligible trusted Helpers
1 expired quick task
5 negative Helpers: outside radius, category mismatch, schedule conflict, probation, under_review
```

Gunakan UUID deterministik dan `ON CONFLICT` yang mengembalikan seluruh field ke expected state pada rerun. Jangan memilih atau mengubah akun Admin/user existing yang tidak memiliki marker demo.

- [ ] **Step 8: Tulis dan jalankan expiry/seed tests**

Run: `RUN_SUPABASE_INTEGRATION=1 node --experimental-strip-types --test tests/sprint6-assignment-expiry-runtime.test.mjs`
Expected: task expired tepat sekali, application ditutup, notification tidak ganda.
Run: `node --experimental-strip-types --test tests/sprint6-seed-matrix.test.mjs tests/seed-command.test.mjs`
Expected: fixture count dan command cloud PASS.

- [ ] **Step 9: Jalankan seed cloud dua kali**

Run: `npm run seed:cloud`
Expected: selesai tanpa UUID/manual dashboard edit.
Run ulang: `npm run seed:cloud`
Expected: jumlah task/application/notification fixture tetap sama dan state kembali deterministik.

- [ ] **Step 10: Commit atomik**

```text
feat(seed): lengkapi integrasi mode penugasan

Navigasi, expiry, notification, dan fixture tiga mode kini dapat diuji ulang tanpa data manual.

Refs: TDD §3.14, §5.5, §7, §14, §19.8
```

## Task 6: Responsive QA, Preview, dan Go/No-Go

**Owner:** Farros dan Mervin
**Integrator:** Farros
**Reviewer:** masing-masing owner meninjau slice owner lain

**Files:**

- Create: `docs/planning/sprint6/completion-audit.md`
- Modify: `README.md` hanya jika mode diizinkan masuk deployment final.
- Modify: `docs/walkthrough.md` hanya jika mode diizinkan masuk demo final.
- Modify: `.github/workflows/ci.yml`
- Test: seluruh `tests/*.test.mjs`

- [ ] **Step 1: Jalankan source quality gate dari lockfile bersih**

Run berurutan:

```text
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Expected: seluruh command exit 0. Hentikan commit/push bila salah satu gagal.

- [ ] **Step 2: Jalankan runtime cloud matrix**

Run:

```text
RUN_SUPABASE_INTEGRATION=1 npm run test
```

Pada PowerShell gunakan `$env:RUN_SUPABASE_INTEGRATION='1'; npm run test`, lalu hapus env proses setelah selesai. Expected: tidak ada skipped RLS/assignment test.

- [ ] **Step 3: Jalankan regression tiga mode**

| Mode | Happy path | Conflict path | Privacy path |
| ---- | ---------- | ------------- | ------------ |
| langsung | pilih Helper, Helper accept | target Helper unavailable | Helper lain tidak membaca task |
| pelamar | tiga apply, satu dipilih | concurrent selection/withdraw | pelamar hanya melihat lokasi ringkas |
| cepat | dua menerima, satu menang | loser mendapat 409 | hanya pemenang melihat alamat lengkap |

- [ ] **Step 4: Jalankan responsive dan accessibility QA**

Untuk 375px, 768px, 1024px, dan 1440px periksa mode selector, booking form, applicant cards, quick cards, list/detail task, dialogs, loading, empty, error, forbidden, expiry, dan conflict. Gunakan keyboard-only, zoom 200%, serta reduced motion. Catat screenshot/evidence pada completion audit, bukan ke source folder sembarang.

- [ ] **Step 5: Verifikasi feature flag deployment**

- Production sebelum keputusan go/no-go: `SPRINT6_MATCHING_ENABLED=false` atau tidak diset.
- Preview branch Sprint 6: `SPRINT6_MATCHING_ENABLED=true` untuk dry run kedua mode.
- API Sprint 6 saat off: `404` tanpa side effect.
- Existing direct booking, payment, report, dan Riwayat tetap berjalan saat off.
- Setelah semua gate hijau, set production `SPRINT6_MATCHING_ENABLED=true`, deploy candidate yang sama dengan hasil quality gate, lalu ulangi smoke test semua role.
- Jika deployment production gagal smoke test, kembalikan flag ke `false` dan gunakan baseline Sprint 5. Jangan menambal fitur baru pada 6 September.

- [ ] **Step 6: Ambil keputusan teknis go/no-go paling lambat 5 September 18.00 WIB**

Completion audit harus menyimpan commit candidate, migration yang applied, hasil seed dua kali, runtime RLS, race test, regression, responsive/accessibility QA, URL deployment, hasil smoke test production, dan waktu keputusan. Keputusan wajib ditandatangani Farros dan Mervin pada dokumen audit.

Keputusan:

```text
Semua gate hijau paling lambat 5 September 18.00 WIB -> PR develop ke main, deploy, aktifkan flag, dan smoke test
Ada P0 security/race/regression atau gate tidak memiliki evidence -> no-go, flag tetap off, gunakan baseline Sprint 5
Production smoke test gagal -> matikan flag, verifikasi baseline, dan hentikan perubahan fitur
```

- [ ] **Step 7: Commit audit**

```text
docs(tasks): catat hasil verifikasi sprint 6

Audit merekam regression, RLS, race, responsive QA, feature flag, production smoke test, dan keputusan go/no-go sebelum submission.

Refs: TDD §3.14, §14 Sprint 6, §16
```

## Acceptance Matrix

### Farros selesai jika

- [ ] Application create/duplicate/withdraw/select memiliki runtime evidence.
- [ ] Family ownership dan Helper own-row RLS lulus.
- [ ] Selection concurrent menghasilkan satu selected.
- [ ] Approval probation/high-risk tetap mengikuti §3.3.2.
- [ ] Applicant UI lengkap pada empat viewport dan keyboard.
- [ ] Tidak ada data privat lansia dalam marketplace/application response.

### Mervin selesai jika

- [ ] Quick create memvalidasi same-day, non-high-risk, dan expiry 15 menit.
- [ ] Eligibility fail closed untuk status, trust, availability, kategori, koordinat, radius, sanction/vakum, dan schedule overlap.
- [ ] Concurrent quick acceptance menghasilkan satu pemenang.
- [ ] Job board tidak melakukan direct join ke profil lansia.
- [ ] Quick UI lengkap pada empat viewport dan keyboard.
- [ ] Expiry serta notification idempoten.

### Sprint 6 selesai jika

- [ ] Mode langsung tidak regresi.
- [ ] Migration cloud dan seed rerun dua kali lulus.
- [ ] Runtime RLS matrix tidak skip.
- [ ] `npm ci`, lint, typecheck, test, dan build lulus setelah perubahan terakhir.
- [ ] Feature flag default off dan fail closed sebelum go/no-go.
- [ ] Preview non-production dapat mendemokan dua mode baru.
- [ ] Seluruh gate hijau dan keputusan deployment tercatat paling lambat 5 September 18.00 WIB.
- [ ] Production dengan flag aktif lulus smoke test atau rollback flag ke baseline telah dibuktikan.

## Risiko yang Membatalkan Release

- Data lansia lengkap terlihat sebelum assignment.
- Dua Helper dapat menjadi selected/assigned pada task yang sama.
- Helper dapat menerima jadwal overlap atau task di luar kategori/radius.
- Mode cepat menerima Helper probation, under_review, sanctioned, atau dormant.
- Feature flag off masih mengizinkan mutation Sprint 6.
- Direct booking, payment, approval, evidence, atau cancellation mengalami regresi.
- Runtime RLS tests skip atau hanya diganti test regex.
- Production diaktifkan tanpa seluruh quality gate dan evidence go/no-go yang terdokumentasi.

Jika salah satu kondisi ini terjadi, Sprint 6 berstatus no-go. Jangan menyembunyikan menu saja sambil membiarkan endpoint atau policy terbuka.
