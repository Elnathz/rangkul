
# Sprint 0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the complete backend foundation, state machine constants, Zod validation schemas, comprehensive API contract (`docs/api-contract.md`), and Sprint 0 retrospective plan (`docs/planning/sprint0/plan.md`) while passing all typecheck and lint quality gates.

**Architecture:** Next.js App Router API handlers with Supabase server client, Zod input validation, standardized `{ success, data, error, message, fieldErrors }` JSON response wrapper, and strict task state machine transition mapping.

**Tech Stack:** Next.js 15 (App Router), TypeScript 5, Supabase SSR client, Zod, ESLint.

## Global Constraints

- No em-dashes (—) in code, comments, or documentation.
- No unicode emojis in code, logs, or commit messages.
- Commit messages must follow `<type>(<scope>): <subject>` with `Refs: TDD §...` footer.
- Endpoints must return standardized error JSON structure `{ success: false, error, message, fieldErrors? }`.
- Single source of truth is `docs/TDD_Rangkul.md`.

---

### Task 1: Task Status & Response Constants

**Files:**

- Create: `src/lib/constants/task-status.ts`
- Create: `src/lib/constants/api-response.ts`

**Interfaces:**

- Consumes: `TDD §3.1-3.2`
- Produces: `TASK_STATUS`, `TaskStatus`, `ALLOWED_TASK_TRANSITIONS`, `apiSuccess()`, `apiError()`, `ApiErrorCode`

- [ ] **Step 1: Write task status constants**

Create `src/lib/constants/task-status.ts`:

```typescript
export const TASK_STATUS = {
  DIAJUKAN: 'diajukan',
  MENUNGGU_PERSETUJUAN_KOORDINATOR: 'menunggu_persetujuan_koordinator',
  DIKONFIRMASI: 'dikonfirmasi',
  DIKERJAKAN: 'dikerjakan',
  MENUNGGU_PERSETUJUAN_KELUARGA: 'menunggu_persetujuan_keluarga',
  SELESAI: 'selesai',
  DIBATALKAN: 'dibatalkan',
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

export const ALLOWED_TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  diajukan: ['menunggu_persetujuan_koordinator', 'dikonfirmasi', 'dibatalkan'],
  menunggu_persetujuan_koordinator: ['dikonfirmasi', 'dibatalkan'],
  dikonfirmasi: ['dikerjakan', 'dibatalkan'],
  dikerjakan: ['menunggu_persetujuan_keluarga', 'dibatalkan'],
  menunggu_persetujuan_keluarga: ['selesai', 'dibatalkan'],
  selesai: [],
  dibatalkan: [],
};

export const HELPER_STATUS = {
  PENDING_VERIFICATION: 'pending_verification',
  VERIFIED: 'verified',
  UNDER_REVIEW: 'under_review',
  SUSPENDED: 'suspended',
} as const;

export type HelperStatus = typeof HELPER_STATUS[keyof typeof HELPER_STATUS];

export const TRUST_TIER = {
  PROBATION: 'probation',
  TERPERCAYA: 'terpercaya',
} as const;

export type TrustTier = typeof TRUST_TIER[keyof typeof TRUST_TIER];
```

- [ ] **Step 2: Write API response helper constants**

Create `src/lib/constants/api-response.ts`:

```typescript
import { NextResponse } from 'next/server';

export const API_ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  HELPER_UNAVAILABLE: 'HELPER_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  return NextResponse.json<ApiSuccessResponse<T>>(
    {
      success: true,
      ...(message ? { message } : {}),
      data,
    },
    { status }
  );
}

export function apiError(
  error: ApiErrorCode,
  message: string,
  status = 400,
  fieldErrors?: Record<string, string[]>
) {
  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      error,
      message,
      ...(fieldErrors ? { fieldErrors } : {}),
    },
    { status }
  );
}
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS with no errors in `src/lib/constants/`

- [ ] **Step 4: Commit task status and response helpers**

```bash
git add src/lib/constants/task-status.ts src/lib/constants/api-response.ts
git commit -m "feat(tasks): add task status state machine and API response helpers

Refs: TDD §3.1, §3.2, §7"
```

---

### Task 2: Zod Validation Schemas

**Files:**

- Create: `src/lib/validations/auth.ts`
- Create: `src/lib/validations/lansia.ts`
- Create: `src/lib/validations/helper.ts`
- Create: `src/lib/validations/booking.ts`

**Interfaces:**

- Consumes: Zod library, `TDD §4.1, §4.2, §4.3, §4.5`
- Produces: `registerSchema`, `loginSchema`, `lansiaProfileSchema`, `helperProfileSchema`, `createTaskSchema`

- [ ] **Step 1: Write auth schemas**

Create `src/lib/validations/auth.ts`:

```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{7,10}$/, 'Nomor telepon tidak valid'),
  role: z.enum(['keluarga', 'helper', 'koordinator'], {
    errorMap: () => ({ message: 'Role pendaftaran tidak valid' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

- [ ] **Step 2: Write lansia profile schemas**

Create `src/lib/validations/lansia.ts`:

```typescript
import { z } from 'zod';

export const lansiaProfileSchema = z.object({
  nama: z.string().min(2, 'Nama lansia minimal 2 karakter'),
  alamat: z.string().min(5, 'Alamat lengkap minimal 5 karakter'),
  lat: z.number().optional(),
  lng: z.number().optional(),
  catatan_kondisi: z.string().optional(),
  dokumen_identitas_lansia_url: z.string().url('URL dokumen identitas tidak valid').optional(),
  dokumen_hubungan_keluarga_url: z.string().url('URL dokumen hubungan keluarga tidak valid').optional(),
});

export type LansiaProfileInput = z.infer<typeof lansiaProfileSchema>;
```

- [ ] **Step 3: Write helper profile & booking schemas**

Create `src/lib/validations/helper.ts`:

```typescript
import { z } from 'zod';

export const helperProfileSchema = z.object({
  bio: z.string().max(500, 'Bio maksimal 500 karakter').optional(),
  wilayah_domisili: z.string().min(3, 'Wilayah domisili wajib diisi'),
  domisili_lat: z.number(),
  domisili_lng: z.number(),
  radius_layanan_km: z.number().min(1).max(25).default(5),
  ktp_url: z.string().url('URL KTP tidak valid'),
});

export type HelperProfileInput = z.infer<typeof helperProfileSchema>;
```

Create `src/lib/validations/booking.ts`:

```typescript
import { z } from 'zod';

export const createTaskSchema = z.object({
  lansia_id: z.string().uuid('ID Lansia tidak valid'),
  service_category_id: z.string().uuid('ID Kategori layanan tidak valid'),
  jadwal_waktu: z.string().datetime({ message: 'Format jadwal waktu ISO 8601 tidak valid' }),
  catatan: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
```

- [ ] **Step 4: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

- [ ] **Step 5: Commit validation schemas**

```bash
git add src/lib/validations/
git commit -m "feat(auth): add Zod validation schemas for auth, lansia, helper, and booking

Refs: TDD §4.1, §4.2, §4.3, §4.5"
```

---

### Task 3: Comprehensive API Contract & Sprint 0 Plan Documentation

**Files:**

- Create: `docs/api-contract.md`
- Create: `docs/planning/sprint0/plan.md`

**Interfaces:**

- Consumes: `TDD §7, §14.2, §14.4`
- Produces: API contract document & Sprint 0 planning document

- [ ] **Step 1: Write `docs/api-contract.md`**

Create `docs/api-contract.md` with:

- Standardized Success & Error JSON formats.
- Complete API endpoint specification (Auth, Lansia, Helper, Koordinator, Tasks, Payments, Riwayat, Reports, Admin).
- Role access permissions table.
- Seed testing accounts credentials list (`keluarga.demo@rangkul.id`, `helper.demo@rangkul.id`, `helper.verified@rangkul.id`, `koordinator.rt01@rangkul.id`, `admin.demo@rangkul.id`).

- [ ] **Step 2: Write `docs/planning/sprint0/plan.md`**

Create `docs/planning/sprint0/plan.md` with:

- Sprint 0 scope (FR-ID map & TDD §14.4).
- Database migrations breakdown.
- API endpoints implemented.
- Definition of Done verification checklist.

- [ ] **Step 3: Commit documentation files**

```bash
git add docs/api-contract.md docs/planning/sprint0/plan.md
git commit -m "docs(api): add comprehensive API contract and Sprint 0 retrospective plan

Refs: TDD §7, §14.2, §14.4"
```

---

### Task 4: Auth API Handlers & Middleware Integration

**Files:**

- Modify/Track: `src/middleware.ts`
- Modify/Track: `src/lib/supabase/client.ts`
- Modify/Track: `src/lib/supabase/server.ts`
- Modify/Track: `src/lib/supabase/middleware.ts`
- Modify/Track: `src/app/api/auth/register/route.ts`
- Modify/Track: `src/app/api/auth/login/route.ts`
- Modify/Track: `src/app/api/users/me/route.ts`

**Interfaces:**

- Consumes: Supabase SSR, Zod auth schemas, `apiSuccess`, `apiError`
- Produces: Working Auth API endpoints

- [ ] **Step 1: Verify Supabase utilities and Middleware**

Ensure `src/lib/supabase/server.ts` uses `@supabase/ssr` `createServerClient` and `src/middleware.ts` handles cookie refresh and role protection.

- [ ] **Step 2: Implement `/api/auth/register` Route Handler**

Implement `POST /api/auth/register`:

- Validate body with `registerSchema`.
- Call `supabase.auth.signUp()`.
- Insert profile into `users` table via DB trigger or explicit insert.
- Return `apiSuccess({ user }, 'Registrasi berhasil', 201)`.
- Handle errors with `apiError('INVALID_INPUT', ...)` or `apiError('CONFLICT', ...)`.

- [ ] **Step 3: Implement `/api/auth/login` Route Handler**

Implement `POST /api/auth/login`:

- Validate body with `loginSchema`.
- Call `supabase.auth.signInWithPassword()`.
- Fetch user profile from `users` table.
- Return `apiSuccess({ user }, 'Login berhasil')`.

- [ ] **Step 4: Implement `/api/users/me` Route Handler**

Implement `GET /api/users/me`:

- Check authenticated session via `supabase.auth.getUser()`.
- Return 401 via `apiError('UNAUTHORIZED', 'Session tidak valid')` if not logged in.
- Fetch user row from `users` table.
- Return `apiSuccess({ user })`.

- [ ] **Step 5: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

- [ ] **Step 6: Commit auth handlers and middleware**

```bash
git add src/middleware.ts src/lib/supabase/ src/app/api/auth/ src/app/api/users/
git commit -m "feat(auth): implement registration, login, and session me API handlers

Refs: TDD §4.1, §7"
```

---

### Task 5: Quality Gate Verification & Sprint 0 Finalization

**Files:**

- Untracked files in `supabase/`, `.gitignore`

- [ ] **Step 1: Track Supabase migrations & seed files**

```bash
git add supabase/
```

- [ ] **Step 2: Run ESLint**

Run: `npm run lint`
Expected: PASS with zero errors

- [ ] **Step 3: Run TypeScript Type Check**

Run: `npx tsc --noEmit`
Expected: PASS with zero errors

- [ ] **Step 4: Run Next.js Production Build**

Run: `npm run build`
Expected: Successful build output without compilation errors

- [ ] **Step 5: Final Commit & Tag Sprint 0**

```bash
git add .
git commit -m "chore(sprint0): finalize Sprint 0 backend foundation, migrations, and quality gates

Refs: TDD §14.4"
```
