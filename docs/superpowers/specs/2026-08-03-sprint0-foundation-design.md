# Sprint 0 Completion Design Spec (Updated)

**Date:** 2026-08-03 (Updated)
**Status:** Approved
**Author:** Backend Engineer Agent (OpenCode)
**Approach:** Refactor Bertahap + Tambah Missing Items (Approach A)
**References:** TDD §3.1-3.2, §4.1, §6, §7, §8, §14.2, §14.4; AGENTS.md §0, §2, §3, §4

---

## 1. Overview & Purpose

Sprint 0 completion work. Existing code sudah terimplementasi sebagian (auth routes, DB schema, Supabase clients, task status labels). Spec ini mendefinisikan:

1. **Refactor existing routes** ke standardized API response format (`apiSuccess()`/`apiError()`)
2. **Tambah `ALLOWED_TASK_TRANSITIONS` matrix** ke task-status.ts (pertahankan type derivation dari DB enum)
3. **Buat file yang belum ada:**
   - `src/lib/constants/api-response.ts` — wrapper + error codes
   - `src/lib/validations/lansia.ts`, `helper.ts`, `booking.ts` — Zod schemas
   - `docs/api-contract.md` — kontrak API lengkap Sprint 0-3
   - `docs/planning/sprint0/plan.md` — retrospective plan
4. **Setup storage bucket** untuk dokumen privat (KTP, KK, dokumen jabatan)
5. **Implementasi role-based middleware** untuk proteksi route per role
6. **Perkuat RLS policies** — comprehensive coverage per tabel dan role
7. **Setup GitHub Actions** — CI workflow + Supabase heartbeat
8. **Expand seed data** — sesuai TDD §19 (3 Koordinator RT, 1 RW, 5 Helper terpercaya, 2 probation, 1 under_review, 1 admin fallback, 4 Keluarga + lansia)
9. **Quality gates** — `lint`, `typecheck`, `build` harus lulus

### Keputusan Penting:
- **TaskStatus** tetap diturunkan dari `Database['public']['Enums']['task_status']` (type safety)
- **Register** tetap pakai `admin.createUser()` dengan `email_confirm: true` (cocok untuk demo, tidak perlu verifikasi email manual)
- **Password min 6** (ikuti Supabase config, bukan 8 seperti plan awal)
- **Zod v4 syntax** — pakai `error` bukan `errorMap` (Zod v4 breaking change)

---

## 2. Directory & File Breakdown

File yang akan dibuat/diubah:

```text
docs/
├── api-contract.md                           [NEW] Comprehensive API Contract (Sprint 0-3)
└── planning/
    └── sprint0/
        └── plan.md                           [NEW] Sprint 0 retrospective plan

src/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts                [MODIFY] Refactor ke apiSuccess/apiError
│       │   └── register/route.ts             [MODIFY] Refactor ke apiSuccess/apiError
│       └── users/
│           └── me/route.ts                   [MODIFY] Refactor ke apiSuccess/apiError
├── lib/
│   ├── constants/
│   │   ├── api-response.ts                   [NEW] API JSON helper & Error codes
│   │   └── task-status.ts                    [MODIFY] Tambah ALLOWED_TASK_TRANSITIONS
│   └── validations/
│       ├── auth.ts                           [EXISTING] Sudah ada, tidak diubah
│       ├── lansia.ts                         [NEW] Lansia Profile Zod schemas
│       ├── helper.ts                         [NEW] Helper Profile Zod schemas
│       └── booking.ts                        [NEW] Task Booking Zod schemas
├── middleware.ts                              [MODIFY] Tambah role-based route protection
└── types/
    └── database.ts                            [EXISTING] Auto-generated, tidak diubah

supabase/
├── migrations/
│   ├── 20260801121120_initial_schema.sql     [EXISTING] Schema awal
│   ├── 20260801124006_seed_data.sql          [EXISTING] Seed awal
│   └── 20260803_XXXXXX_expand_seed.sql       [NEW] Expand seed sesuai TDD §19
├── seed.sql                                   [MODIFY] Sync dengan expanded seed
└── config.toml                                [EXISTING] Sudah ada

.github/
└── workflows/
    ├── ci.yml                                 [NEW] CI workflow (lint, typecheck, build)
    └── heartbeat.yml                          [NEW] Supabase heartbeat (2x/minggu)

.env.example                                   [MODIFY] Tambah SUPABASE_SERVICE_ROLE_KEY
```

---

## 3. Standardized API Response & Error Handling

### 3.1 Response JSON Structures
Semua endpoint pakai format konsisten:

**Success Response (200 / 201):**
```json
{
  "success": true,
  "message": "Pesan sukses opsional",
  "data": { ... }
}
```

**Error Response (400, 401, 403, 404, 409, 422, 500):**
```json
{
  "success": false,
  "error": "KODE_ERROR",
  "message": "Penjelasan error user-friendly",
  "fieldErrors": {
    "nama_field": ["Pesan error spesifik field"]
  }
}
```

### 3.2 Standard Error Codes
- `INVALID_INPUT` (400/422): Validasi Zod gagal
- `UNAUTHORIZED` (401): Session tidak valid/expired
- `FORBIDDEN` (403): Role tidak sesuai atau RLS restriction
- `NOT_FOUND` (404): Resource tidak ditemukan
- `CONFLICT` (409): Race condition atau duplikat
- `HELPER_UNAVAILABLE` (409): Helper tidak tersedia/radius
- `INTERNAL_ERROR` (500): Error database/unhandled exception

### 3.3 Implementation
- **Helper functions:** `apiSuccess(data, message?, status?)`, `apiError(error, message, status?, fieldErrors?)`
- **Existing routes refactor:** Semua route handler diubah untuk return `NextResponse.json()` via helper functions ini
- **Type safety:** Interface `ApiSuccessResponse<T>` dan `ApiErrorResponse`

---

## 4. State Machine & Task Status Constants

Pertahankan type derivation dari DB enum untuk type safety, tambahkan transition matrix:

```typescript
import { Database } from '@/types/database';

// Type-safe status dari DB enum
export type TaskStatus = Database['public']['Enums']['task_status'];

// Display labels (Indonesian)
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  diajukan: 'Diajukan',
  menunggu_persetujuan_koordinator: 'Menunggu Approval Koordinator',
  dikonfirmasi: 'Dikonfirmasi',
  dikerjakan: 'Sedang Dikerjakan',
  menunggu_persetujuan_keluarga: 'Menunggu Approval Keluarga',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

// Tailwind color classes
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  diajukan: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  menunggu_persetujuan_koordinator: 'bg-amber-100 text-amber-800 border-amber-300',
  dikonfirmasi: 'bg-blue-100 text-blue-800 border-blue-300',
  dikerjakan: 'bg-purple-100 text-purple-800 border-purple-300',
  menunggu_persetujuan_keluarga: 'bg-orange-100 text-orange-800 border-orange-300',
  selesai: 'bg-green-100 text-green-800 border-green-300',
  dibatalkan: 'bg-red-100 text-red-800 border-red-300',
};

// State machine transition matrix
export const ALLOWED_TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  diajukan: ['menunggu_persetujuan_koordinator', 'dikonfirmasi', 'dibatalkan'],
  menunggu_persetujuan_koordinator: ['dikonfirmasi', 'dibatalkan'],
  dikonfirmasi: ['dikerjakan', 'dibatalkan'],
  dikerjakan: ['menunggu_persetujuan_keluarga', 'dibatalkan'],
  menunggu_persetujuan_keluarga: ['selesai', 'dibatalkan'],
  selesai: [],
  dibatalkan: [],
};
```

### Keputusan:
- **Type safety:** `TaskStatus` diturunkan langsung dari DB enum via auto-generated types
- **No duplication:** Tidak membuat `TASK_STATUS` const object yang menduplikasi DB enum values
- **Transition validation:** Matrix digunakan di server-side untuk validasi transisi status task

---

## 5. Endpoints & Otorisasi Role

API contract (`docs/api-contract.md`) mencakup semua endpoint Sprint 0-3 dengan otorisasi role.

### 5.1 Storage Bucket Setup
- **Bucket name:** `private-documents`
- **File types:** KTP, KK, dokumen jabatan RT/RW
- **Access:** Signed URL only (never public URLs)
- **Policy:** 
  ```sql
  CREATE POLICY "Private documents accessible by owner and authorized roles"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'private-documents' AND
    (
      auth.uid() = owner OR
      EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role IN ('admin', 'koordinator')
      )
    )
  );
  ```

### 5.2 Comprehensive RLS Policies
Perkuat policies untuk semua tabel:

| Tabel | Policy Tambahan |
|---|---|
| `users` | Admin bisa read/update semua, role lain hanya self |
| `lansia_profiles` | Soft delete protection, admin access |
| `helper_profiles` | Verified-only untuk public view, koordinator hanya domisilinya |
| `koordinator_profiles` | RW bisa lihat RT di bawahnya |
| `tasks` | Ownership + status transition validation |
| `task_evidence` | Only assigned helper can insert |
| `health_snapshots` | Only assigned helper can insert |
| `reports` | Only report own transactions |

### 5.3 Role-Based Middleware
Global middleware dengan matcher per role:

```typescript
// src/middleware.ts
const roleRoutes = {
  keluarga: ['/beranda', '/lansia', '/cari-helper', '/booking', '/kunjungan', '/pembayaran'],
  helper: ['/helper/dashboard', '/helper/tugas', '/helper/laporan', '/helper/penghasilan'],
  koordinator: ['/koordinator/dashboard', '/koordinator/pengajuan', '/koordinator/persetujuan'],
  admin: ['/admin']
};

// Redirect ke dashboard role jika route tidak sesuai
```

### 5.4 GitHub Actions
Dua workflow:

**CI Workflow (`ci.yml`):**
- Trigger: push ke main/develop, PR ke main
- Steps: checkout → setup node → npm ci → lint → typecheck → build

**Heartbeat (`heartbeat.yml`):**
- Schedule: Senin & Kamis 03:00 UTC
- Ping Supabase REST endpoint untuk cegah auto-pause

### 5.5 Expanded Seed Data (TDD §19)
Seed lengkap sesuai requirement:
- **Admin:** 1 akun (manual via Supabase)
- **Koordinator:** 3 RT + 1 RW (verified)
- **Helper:** 5 terpercaya + 2 probation + 1 under_review + 1 admin fallback
- **Keluarga:** 4 akun + masing-masing 1 lansia profile
- **Lansia demo:** 1 profil dengan riwayat Health Snapshot menurun (untuk badge "Perlu Perhatian")
- **Tasks:** Contoh di semua status (diajukan, dikonfirmasi, dikerjakan, selesai, dibatalkan)
- **Kategori:** 7 kategori final dengan harga dasar dan is_high_risk

### 5.6 Zod Validation Schemas
Tambahan schemas yang belum ada:

**`src/lib/validations/lansia.ts`:**
- `nama` (min 2), `alamat` (min 5), `lat/lng` (optional), `catatan_kondisi` (optional)
- Dokumen URL validation (private bucket signed URLs)

**`src/lib/validations/helper.ts`:**
- `bio` (max 500), `wilayah_domisili` (min 3), `domisili_lat/lng`, `radius_layanan_km` (1-25)
- `ktp_url` (signed URL validation)

**`src/lib/validations/booking.ts`:**
- `lansia_id` (uuid), `service_category_id` (uuid), `jadwal_waktu` (ISO datetime), `catatan` (max 1000)

---

## 6. Verification Strategy

Sebelum Sprint 0 dianggap selesai, semua command berikut harus lulus:

### 6.1 Quality Gates
1. **Type Check:** `npx tsc --noEmit` (0 errors)
2. **Lint:** `npm run lint` (0 errors)  
3. **Build:** `npm run build` (success)

### 6.2 Functional Tests
4. **Database:** `npx supabase db reset` (apply semua migration + seed tanpa error)
5. **Storage:** Upload dokumen ke bucket private via signed URL (test manual)
6. **Auth:** Register/login/logout untuk semua role (test manual via API client)
7. **RLS:** Test akses data dengan 2 akun berbeda (pastikan tidak bisa akses data orang lain)

### 6.3 Documentation
8. **API Contract:** `docs/api-contract.md` lengkap dengan contoh request/response, error codes, role access
9. **Sprint Plan:** `docs/planning/sprint0/plan.md` dengan scope FR-ID mapping, DoD checklist

### 6.4 Commit Standards
Semua commit mengikuti format AGENTS.md §4:
- Format: `<type>(<scope>): <subject>`
- Footer: `Refs: TDD §...` untuk perubahan business rule/schema/API
- Contoh: `feat(auth): refactor routes to standardized API response format`

### 6.5 Final Checklist
- [ ] Semua file sesuai directory breakdown
- [ ] `.env.example` lengkap dengan `SUPABASE_SERVICE_ROLE_KEY`
- [ ] GitHub Actions workflows committed
- [ ] Seed data mencakup semua status demo yang dibutuhkan
- [ ] Root layout/page.tsx sudah branded Rangkul (bukan default Next.js)
- [ ] Tidak ada secret di repository
- [ ] Semua quality gates lulus
