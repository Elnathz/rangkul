# Sprint 0 Foundation Implementation Plan

## Completion Pass 2026-08-22

Gap Sprint 0 yang ditutup pada pass ini: regression proxy route publik, perintah `npm run seed`, dan coverage RLS opt-in. Quality gate tetap mengikuti TDD §14.2. Payment, offline, dan fitur domain Sprint 3 atau 4 tidak ditarik ke pass ini.

## Progress Audit 22 Agustus 2026

- Fondasi Next.js, route groups, autentikasi, Supabase, storage privat, RLS dasar, response helper, dan middleware sudah tersedia.
- Quality gate CI sudah menjalankan lint, typecheck, test, dan build.
- Kontrak API sekarang dipusatkan di `docs/api-contract.md`.
- Seed remote idempoten memakai migration demo, dengan UUID yang dibuat database.
- Gap tersisa: pengujian RLS dua akun secara remote dan prosedur reset lokal membutuhkan Docker atau akses database yang aktif.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the backend foundation by refactoring existing auth routes to standardized API response format, adding missing Zod schemas, username support with new validation rules, comprehensive API contract, role-based middleware, storage bucket policies, RLS policies, and GitHub Actions integration while passing all quality gates.

**Architecture:** Next.js App Router API handlers with Supabase server client, Zod input validation, standardized `{ success, data, error, message, fieldErrors }` JSON response wrapper, username-based authentication with enhanced password rules (min 8 chars + symbol), and strict task state machine transition mapping.

**Tech Stack:** Next.js 16, TypeScript 5, Supabase SSR client, Zod 4.4.3, ESLint, Tailwind CSS.

## Global Constraints

- No em-dashes (—) in code, comments, or documentation.
- No unicode emojis in code, logs, or commit messages.
- Commit messages must follow `<type>(<scope>): <subject>` with `Refs: TDD §...` footer.
- Endpoints must return standardized error JSON structure `{ success: false, error, message, fieldErrors? }`.
- Single source of truth is `docs/TDD_Rangkul.md`.
- Username must be 6-20 characters, alphanumeric + ._- only, unique
- Password must be 8-128 characters, must contain at least 1 symbol
- Phone is optional during registration, required after registration
- Login supports both username and email identifiers

---

### Task 1: API Response Helpers & Task Status Constants

**Files:**
- Create: `src/lib/constants/api-response.ts`
- Modify: `src/lib/constants/task-status.ts`

**Interfaces:**
- Consumes: `TDD §7`, `AGENTS.md`
- Produces: `apiSuccess()`, `apiError()`, `ALLOWED_TASK_TRANSITIONS`

- [ ] **Step 1: Create API response helper constants**

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

- [ ] **Step 2: Update task status constants with transition matrix**

Modify `src/lib/constants/task-status.ts`:
```typescript
import { Database } from '@/types/database';

export type TaskStatus = Database['public']['Enums']['task_status'];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  diajukan: 'Diajukan',
  menunggu_persetujuan_koordinator: 'Menunggu Approval Koordinator',
  dikonfirmasi: 'Dikonfirmasi',
  dikerjakan: 'Sedang Dikerjakan',
  menunggu_persetujuan_keluarga: 'Menunggu Approval Keluarga',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  diajukan: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  menunggu_persetujuan_koordinator: 'bg-amber-100 text-amber-800 border-amber-300',
  dikonfirmasi: 'bg-blue-100 text-blue-800 border-blue-300',
  dikerjakan: 'bg-purple-100 text-purple-800 border-purple-300',
  menunggu_persetujuan_keluarga: 'bg-orange-100 text-orange-800 border-orange-300',
  selesai: 'bg-green-100 text-green-800 border-green-300',
  dibatalkan: 'bg-red-100 text-red-800 border-red-300',
};

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

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS with no errors in `src/lib/constants/`

- [ ] **Step 4: Commit API response helpers and task status**

```bash
git add src/lib/constants/api-response.ts src/lib/constants/task-status.ts
git commit -m "feat(auth): add API response helpers and task status transitions matrix

Refs: TDD §3.1, §3.2, §7"
```

---

### Task 2: Update Auth Zod Schemas with New Rules

**Files:**
- Modify: `src/lib/validations/auth.ts`

**Interfaces:**
- Consumes: Zod library, `TDD §4.1`, username/password rules
- Produces: Updated `registerSchema`, `loginSchema` with username support

- [ ] **Step 1: Update register schema with username, enhanced password rules**

Modify `src/lib/validations/auth.ts`:
```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string()
    .min(6, 'Username minimal 6 karakter')
    .max(20, 'Username maksimal 20 karakter')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username hanya boleh mengandung huruf, angka, titik, underscore, dan dash'),
  email: z.string().email('Email tidak valid'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .max(128, 'Password maksimal 128 karakter')
    .regex(/[^A-Za-z0-9]/, 'Password harus mengandung minimal 1 simbol'),
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  phone: z.string().optional(),
  role: z.enum(['keluarga', 'helper', 'koordinator'], {
    error: 'Peran tidak valid',
  }),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Username atau email wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS with no errors

- [ ] **Step 3: Commit updated auth schemas**

```bash
git add src/lib/validations/auth.ts
git commit -m "feat(auth): update validation schemas with username and enhanced password rules

Refs: TDD §4.1"
```

---

### Task 3: Add Missing Zod Schemas

**Files:**
- Create: `src/lib/validations/lansia.ts`
- Create: `src/lib/validations/helper.ts`
- Create: `src/lib/validations/booking.ts`

**Interfaces:**
- Consumes: Zod library, `TDD §6`
- Produces: `lansiaProfileSchema`, `helperProfileSchema`, `createTaskSchema`

- [ ] **Step 1: Create lansia profile schema**

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

- [ ] **Step 2: Create helper profile schema**

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

- [ ] **Step 3: Create booking task schema**

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
Expected: PASS with no errors

- [ ] **Step 5: Commit new validation schemas**

```bash
git add src/lib/validations/
git commit -m "feat(lansia): add Zod validation schemas for lansia, helper, and booking

Refs: TDD §4.2, §4.3, §4.5"
```

---

### Task 4: Refactor Existing Auth Routes to Standardized Format

**Files:**
- Modify: `src/app/api/auth/register/route.ts`
- Modify: `src/app/api/auth/login/route.ts`
- Modify: `src/app/api/users/me/route.ts`

**Interfaces:**
- Consumes: Supabase SSR, Zod auth schemas, `apiSuccess`, `apiError`
- Produces: Standardized API response format across all auth endpoints

- [ ] **Step 1: Refactor register route to use standardized response format**

Modify `src/app/api/auth/register/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { registerSchema } from '@/lib/validations/auth';
import { apiSuccess, apiError } from '@/lib/constants/api-response';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        'INVALID_INPUT',
        'Data input tidak valid',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    const { username, email, password, full_name, phone, role } = validation.data;
    const supabaseAdmin = await createAdminClient();

    // Check if username already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();

    if (existingUser) {
      return apiError('CONFLICT', 'Username sudah digunakan', 409);
    }

    // Create User via Supabase Auth Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
        username: username.toLowerCase(),
      },
    });

    if (authError) {
      return apiError('CONFLICT', authError.message, 400);
    }

    // Update phone if provided
    if (phone && authData.user) {
      await supabaseAdmin
        .from('users')
        .update({ phone })
        .eq('id', authData.user.id);
    }

    return apiSuccess(
      {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name,
          role,
          username,
        },
      },
      'Registrasi berhasil',
      201
    );
  } catch (error: any) {
    return apiError('INTERNAL_ERROR', error.message || 'Terjadi kesalahan server', 500);
  }
}
```

- [ ] **Step 2: Refactor login route to use standardized response format**

Modify `src/app/api/auth/login/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations/auth';
import { apiSuccess, apiError } from '@/lib/constants/api-response';
import { Database } from '@/types/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        'INVALID_INPUT',
        'Data input tidak valid',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    const { identifier, password } = validation.data;
    const supabase = await createClient();

    let loginEmail = identifier;

    // Check if identifier is username (not email)
    if (!identifier.includes('@')) {
      // Find user by username
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', identifier.toLowerCase())
        .single();

      if (userError || !user) {
        return apiError('UNAUTHORIZED', 'Username atau password salah', 401);
      }
      loginEmail = user.email;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (authError) {
      return apiError('UNAUTHORIZED', 'Username atau password salah', 401);
    }

    // Fetch user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      return apiError('NOT_FOUND', 'Profil pengguna tidak ditemukan', 404);
    }

    return apiSuccess(
      {
        user: userProfile,
        session: {
          access_token: authData.session.access_token,
          expires_at: authData.session.expires_at,
        },
      },
      'Login berhasil'
    );
  } catch (error: any) {
    return apiError('INTERNAL_ERROR', error.message || 'Terjadi kesalahan server', 500);
  }
}
```

- [ ] **Step 3: Refactor users/me route to use standardized response format**

Modify `src/app/api/users/me/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/constants/api-response';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return apiError('UNAUTHORIZED', 'Anda belum login', 401);
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !userProfile) {
      return apiError('NOT_FOUND', 'Profil pengguna tidak ditemukan', 404);
    }

    return apiSuccess({ user: userProfile }, 'User profile retrieved successfully');
  } catch (error: any) {
    return apiError('INTERNAL_ERROR', error.message || 'Terjadi kesalahan server', 500);
  }
}
```

- [ ] **Step 4: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS with no errors

- [ ] **Step 5: Commit refactored auth routes**

```bash
git add src/app/api/auth/ src/app/api/users/
git commit -m "feat(auth): refactor auth routes to use standardized API response format

Refs: TDD §7"
```

---

### Task 5: Create Database Migration for Username Column

**Files:**
- Create: `supabase/migrations/20260803100000_add_username_to_users.sql`

**Interfaces:**
- Consumes: PostgreSQL, Supabase migrations
- Produces: `users.username` column with unique constraint

- [ ] **Step 1: Create migration file for username column**

Create `supabase/migrations/20260803100000_add_username_to_users.sql`:
```sql
-- Add username column to users table
ALTER TABLE public.users 
ADD COLUMN username TEXT;

-- Create unique index for username (case-insensitive)
CREATE UNIQUE INDEX idx_users_username_lower ON public.users (LOWER(username));

-- Make username required
ALTER TABLE public.users 
ALTER COLUMN username SET NOT NULL;

-- Update trigger function to handle username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, phone, full_name, role, username)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'keluarga'::public.user_role),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTR(NEW.email, 1, POSITION('@' IN NEW.email) - 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

- [ ] **Step 2: Update existing seed data to include username**

Modify `supabase/migrations/20260801124006_seed_data.sql` to update the existing user creation to include username:

```sql
-- Update demo users to include username in metadata
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{username}', '"admin_rangkul"')
WHERE email = 'admin.demo@rangkul.id';

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{username}', '"keluarga_demo"')
WHERE email = 'keluarga.demo@rangkul.id';

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{username}', '"helper_demo"')
WHERE email = 'helper.demo@rangkul.id';

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{username}', '"koordinator_rt01"')
WHERE email = 'koordinator.rt01@rangkul.id';
```

- [ ] **Step 3: Update the main seed.sql file**

Modify `supabase/seed.sql` to include username updates for existing users.

- [ ] **Step 4: Commit migration files**

```bash
git add supabase/migrations/ supabase/seed.sql
git commit -m "feat(auth): add username column to users table with unique constraint

Refs: TDD §4.1"
```

---

### Task 6: Create API Contract Documentation

**Files:**
- Create: `docs/api-contract.md`

**Interfaces:**
- Consumes: `TDD §7`, all implemented endpoints
- Produces: Comprehensive API contract for frontend integration

- [ ] **Step 1: Create comprehensive API contract**

Create `docs/api-contract.md`:
```markdown
# Rangkul API Contract

## Standard Response Format

### Success Response (200/201)
```json
{
  "success": true,
  "message": "Optional human-readable success message",
  "data": { ... }
}
```

### Error Response (400, 401, 403, 404, 409, 422, 500)
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "User-friendly error explanation",
  "fieldErrors": {
    "field_name": ["Specific field error message"]
  }
}
```

## Error Codes

- `INVALID_INPUT` (400/422): Zod validation failures
- `UNAUTHORIZED` (401): Missing or expired authentication session
- `FORBIDDEN` (403): Role mismatch or RLS geographical restriction
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Concurrent update collision or duplicate entry
- `HELPER_UNAVAILABLE` (409): Helper unavailable or outside radius
- `INTERNAL_ERROR` (500): Database error or unhandled runtime failure

## Endpoints

### Auth

#### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "username": "string 6-20 chars, alphanumeric + ._-",
  "email": "valid email address",
  "password": "min 8 chars with at least 1 symbol",
  "full_name": "string min 2 chars",
  "phone": "optional string",
  "role": "one of: keluarga, helper, koordinator"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": "user uuid",
      "email": "user email",
      "full_name": "user full name",
      "role": "user role",
      "username": "user username"
    }
  }
}
```

**Errors:** `INVALID_INPUT`, `CONFLICT`

#### POST /api/auth/login
Authenticate user session.

**Request:**
```json
{
  "identifier": "username or email",
  "password": "user password"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": { /* user profile data */ },
    "session": {
      "access_token": "jwt access token",
      "expires_at": "timestamp"
    }
  }
}
```

**Errors:** `INVALID_INPUT`, `UNAUTHORIZED`

#### GET /api/users/me
Retrieve current authenticated user profile.

**Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": { /* user profile data */ }
  }
}
```

**Errors:** `UNAUTHORIZED`, `NOT_FOUND`

## Validation Rules

### Username
- Length: 6-20 characters
- Format: alphanumeric + underscore, period, dash only
- Case: Stored as lowercase (normalization applied)
- Requirement: Unique across all users

### Password
- Minimum: 8 characters
- Maximum: 128 characters
- Complexity: Must contain at least 1 symbol character
- No other complexity requirements

### Phone
- Format: Indonesian phone numbers only `^(\+62|62|0)8[1-9][0-9]{7,10}$`
- Requirement: Optional during registration, required after

### Email
- Format: Valid email address
- Requirement: Unique across all users
- Validation: Format checked via Zod .email()

### Roles
- Allowed values: `keluarga`, `helper`, `koordinator`, `admin`
- Registration: Only keluarga, helper, koordinator (admin created manually)

## Authentication & Authorization

All protected endpoints require valid session via Supabase Auth JWT.

### Session Management
- Login creates Supabase Auth session
- Session stored in secure HTTP-only cookies
- Automatic refresh via middleware
- Protected routes check session validity

### Role Protection
- Route-level protection via middleware
- Database-level protection via RLS policies
- Cross-reference user role with allowed actions
```

- [ ] **Step 2: Commit API contract documentation**

```bash
git add docs/api-contract.md
git commit -m "docs(api): add comprehensive API contract for frontend integration

Refs: TDD §7"
```

---

### Task 7: Update Middleware with Role-Based Protection

**Files:**
- Modify: `src/middleware.ts`

**Interfaces:**
- Consumes: NextRequest, Supabase session management
- Produces: Role-based route protection

- [ ] **Step 1: Update middleware with role-based route protection**

Modify `src/middleware.ts`:
```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createClient } from '@/lib/supabase/server';

// Define route access by role
const roleRoutes: Record<string, string[]> = {
  keluarga: [
    '/beranda', '/lansia', '/cari-helper', '/booking', 
    '/kunjungan', '/pembayaran', '/pesan', '/banding'
  ],
  helper: [
    '/helper/dashboard', '/helper/verifikasi', '/helper/tugas', 
    '/helper/laporan', '/helper/penghasilan', '/helper/pesan'
  ],
  koordinator: [
    '/koordinator/dashboard', '/koordinator/pengajuan', '/koordinator/persetujuan',
    '/koordinator/helper', '/koordinator/laporan', '/koordinator/darurat',
    '/koordinator/komisi', '/koordinator/pengawasan'
  ],
  admin: [
    '/admin/dashboard', '/admin/users', '/admin/koordinator', 
    '/admin/helpers', '/admin/categories', '/admin/reports',
    '/admin/banding', '/admin/demo-wallet', '/admin/audit-logs'
  ]
};

export async function middleware(request: NextRequest) {
  // First, update session
  const response = await updateSession(request);
  
  // Extract current pathname
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for public routes and static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'].some(ext => pathname.endsWith(ext))
  ) {
    return response;
  }

  // Get current user from session
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    // Redirect to login if not authenticated
    if (pathname !== '/login' && !pathname.startsWith('/api/')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return Response.redirect(url);
    }
    return response;
  }

  // Get user role from database
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile) {
    // If user profile doesn't exist, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return Response.redirect(url);
  }

  const userRole = userProfile.role;

  // Check if current path is allowed for user role
  const allowedPaths = roleRoutes[userRole] || [];
  const isAllowed = allowedPaths.some(path => 
    pathname.startsWith(path) || pathname === path
  );

  if (!isAllowed && !pathname.startsWith('/api/')) {
    // Redirect to dashboard based on user role
    const url = request.nextUrl.clone();
    switch (userRole) {
      case 'keluarga':
        url.pathname = '/beranda';
        break;
      case 'helper':
        url.pathname = '/helper/dashboard';
        break;
      case 'koordinator':
        url.pathname = '/koordinator/dashboard';
        break;
      case 'admin':
        url.pathname = '/admin/dashboard';
        break;
      default:
        url.pathname = '/';
    }
    return Response.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS with no errors

- [ ] **Step 3: Commit updated middleware**

```bash
git add src/middleware.ts
git commit -m "feat(auth): add role-based route protection middleware

Refs: TDD §8"
```

---

### Task 8: Setup GitHub Actions Workflows

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/heartbeat.yml`

**Interfaces:**
- Consumes: GitHub Actions, Node.js, npm
- Produces: CI workflow, Supabase heartbeat workflow

- [ ] **Step 1: Create CI workflow**

Create `.github/workflows/ci.yml`:
```yaml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
```

- [ ] **Step 2: Create Supabase heartbeat workflow**

Create `.github/workflows/heartbeat.yml`:
```yaml
name: Supabase Heartbeat
on:
  schedule:
    - cron: "0 3 * * 1,4" # Senin & Kamis, 03:00 UTC (~10:00 WIB)
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase REST endpoint
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            "${{ secrets.SUPABASE_URL }}/rest/v1/service_categories?select=id&limit=1")
          echo "Supabase response status: $STATUS"
          if [ "$STATUS" -ge 400 ]; then exit 1; fi
```

- [ ] **Step 3: Update .env.example**

Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

- [ ] **Step 4: Commit GitHub Actions workflows**

```bash
mkdir -p .github/workflows
git add .github/workflows/ .env.example
git commit -m "chore(ci): add CI workflow and Supabase heartbeat

Refs: TDD §2.3"
```

---

### Task 9: Quality Gates Verification & Finalization

**Files:**
- Update: `.gitignore` (if needed)
- Update: `package.json` scripts (if needed)

**Interfaces:**
- Consumes: npm, tsc, eslint
- Produces: All quality gates passing

- [ ] **Step 1: Verify all TypeScript files compile correctly**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Verify linting passes**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Verify build succeeds**

Run: `npm run build`
Expected: Successful build without errors

- [ ] **Step 4: Test database migration locally**

Run: `npx supabase db reset`
Expected: All migrations apply successfully, seed data loads

- [ ] **Step 5: Update root page to reflect Rangkul branding**

Modify `src/app/page.tsx` to replace default Next.js content with Rangkul landing page:
```tsx
// Replace the default Next.js starter page with Rangkul landing content
// This should reflect "Merangkul Jarak, Menjaga yang Tersayang"
```

- [ ] **Step 6: Final commit & tag Sprint 0**

```bash
git add .
git commit -m "chore(sprint0): finalize Sprint 0 backend foundation

- Complete auth API with standardized responses
- Add username support with enhanced validation rules
- Implement role-based middleware protection
- Setup GitHub Actions CI and heartbeat
- Create comprehensive API contract
- Pass all quality gates (lint, typecheck, build)

Refs: TDD §14.4"
```

---
