# Sprint 1: Autentikasi & Profil Pengguna — Implementation Plan

## Completion Pass 2026-08-22

Gap Sprint 1 yang ditutup pada pass ini: matriks seed identitas dan wilayah sesuai TDD §19, serta signed URL dokumen yang dibatasi satu jam. Verifikasi alur UI yang sudah ada tidak diperluas menjadi fitur baru.

## Progress Audit 22 Agustus 2026

- Verifikasi Helper, approval Koordinator/Admin, radius layanan, fallback wilayah, foto profil, upload privat, dan direktori Helper sudah tersedia.
- Status Helper demo diarahkan ke Koordinator `mbahburgas` dan akun Helper `masburgas` melalui migration idempoten.
- Gap tersisa: seed belum memenuhi seluruh matriks jumlah akun dan status pada TDD Â§19, sehingga migration demo Sprint 2 masih perlu diperluas sebelum checklist Sprint 1 dapat dianggap penuh.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan update profil pengguna (PUT `/api/users/me`), upload dokumen ke Supabase Storage (POST `/api/storage/upload`), dan RLS policies lengkap untuk tabel profil + storage bucket private.

**Architecture:** Endpoint Next.js App Router mengikuti pola yang sudah ada (`createClient()` dari `@/lib/supabase/server`, `apiResponse`/`createApiError` dari `@/lib/api-response`). Validasi memakai Zod. Keamanan data berlapis: session check → Zod → RLS di database → signed URL untuk akses file private.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Zod v4, Supabase (Auth, Storage, RLS), @supabase/ssr.

**Verification gates (proyek ini TIDAK punya test framework):**
```bash
npx tsc --noEmit     # harus lulus tanpa error
npm run lint         # harus lulus tanpa error
npm run build        # Task terakhir saja
```

---

## Global Constraints

- Semua respons API pakai `apiResponse` (sukses) / `createApiError` (error) dari `@/lib/api-response`.
- Error codes: `validation_error` (400), `unauthorized` (401), `forbidden` (403), `username_taken` (409), `invalid_file_type` (400), `file_too_large` (413), `server_error` (500).
- Bahasa pesan error: Bahasa Indonesia.
- Kode memakai pola yang sudah ada: `createClient()` untuk user session, `createAdminClient()` untuk operasi admin/bypass RLS.
- Validasi username: min 6, max 20, regex `^[a-zA-Z0-9._-]+$`.
- Semua commit dalam Bahasa Indonesia bertema fitur (contoh: `feat(users): add PUT /api/users/me`).
- Jangan gunakan `any` — pakai `unknown` + `(error as Error)` di catch.
- Jangan buat test framework baru; verifikasi lewat `tsc`, `lint`, `build`.

---

### Task 1: Tambah `updateProfileSchema` di validasi auth

**Files:**
- Modify: `src/lib/validations/auth.ts`

**Interfaces:**
- Produces: `updateProfileSchema` (zod object, semua field optional) dan type `UpdateProfileInput = z.infer<typeof updateProfileSchema>`.
- Konsumen: Task 2 (route PUT `/api/users/me`).

- [ ] **Step 1: Tambah schema**

Tambahkan di akhir `src/lib/validations/auth.ts` (setelah `loginSchema`):

```typescript
export const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter').optional(),
  phone: z.string().optional(),
  username: z.string()
    .min(6, 'Username minimal 6 karakter')
    .max(20, 'Username maksimal 20 karakter')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username hanya boleh mengandung huruf, angka, titik, underscore, dan dash')
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
```

- [ ] **Step 2: Verifikasi**

Run: `npx tsc --noEmit`
Expected: PASS (tanpa error).

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/validations/auth.ts
git commit -m "feat(auth): add updateProfileSchema for profile updates"
```

---

### Task 2: Tambah PUT handler di `/api/users/me`

**Files:**
- Modify: `src/app/api/users/me/route.ts` (tambah `export async function PUT` di bawah `GET`)

**Interfaces:**
- Consumes: `updateProfileSchema` dari `@/lib/validations/auth`.
- Produces: `PUT /api/users/me` — update `full_name`, `phone`, `username` user yang login. Mengembalikan profil terbaru.

- [ ] **Step 1: Tulis handler PUT**

Ubah `src/app/api/users/me/route.ts` menjadi:

```typescript
import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import { updateProfileSchema } from '@/lib/validations/auth';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return createApiError('unauthorized', 'Anda belum login', 401);
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !userProfile) {
      return createApiError('user_not_found', 'Profil pengguna tidak ditemukan', 404);
    }

    return apiResponse({ user: userProfile }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return createApiError('unauthorized', 'Anda belum login', 401);
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return apiResponse(
        {
          error: 'validation_error',
          message: 'Data input tidak valid',
          fieldErrors: validation.error.flatten().fieldErrors,
        },
        400
      );
    }

    const updates = validation.data;

    // Cek status akun + ambil username saat ini
    const { data: current, error: currentError } = await supabase
      .from('users')
      .select('account_status, username')
      .eq('id', authUser.id)
      .single();

    if (currentError || !current) {
      return createApiError('user_not_found', 'Profil pengguna tidak ditemukan', 404);
    }

    if (current.account_status === 'suspended') {
      return createApiError('account_suspended', 'Akun sedang ditangguhkan', 403);
    }

    // Cek unik username jika diubah (case-insensitive)
    if (updates.username && updates.username.toLowerCase() !== current.username.toLowerCase()) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .ilike('username', updates.username)
        .neq('id', authUser.id)
        .single();

      if (existing) {
        return createApiError('username_taken', 'Username sudah dipakai', 409);
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', authUser.id)
      .select('*')
      .single();

    if (updateError) {
      return createApiError('server_error', updateError.message, 500);
    }

    return apiResponse({ user: updated }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
```

- [ ] **Step 2: Verifikasi**

Run: `npx tsc --noEmit`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/users/me/route.ts
git commit -m "feat(users): add PUT /api/users/me to update profile"
```

---

### Task 3: Buat schema validasi upload dokumen

**Files:**
- Create: `src/lib/validations/storage.ts`

**Interfaces:**
- Produces: `uploadSchema` (zod object) dan type `UploadInput`. Konsumen: Task 4.
- Konstanta: `ALLOWED_FILE_TYPES` (`application/pdf`, `image/jpeg`, `image/png`), `MAX_FILE_SIZE` (5 * 1024 * 1024), `DOC_TYPES` (`ktp`, `identitas_lansia`, `hubungan_keluarga`, `dokumen_koordinator`).

- [ ] **Step 1: Buat file**

Create `src/lib/validations/storage.ts`:

```typescript
import { z } from 'zod';

export const DOC_TYPES = ['ktp', 'identitas_lansia', 'hubungan_keluarga', 'dokumen_koordinator'] as const;

export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadSchema = z.object({
  docType: z.enum(DOC_TYPES, {
    error: 'Tipe dokumen tidak valid',
  }),
});

export type UploadInput = z.infer<typeof uploadSchema>;
```

- [ ] **Step 2: Verifikasi**

Run: `npx tsc --noEmit`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/validations/storage.ts
git commit -m "feat(storage): add upload validation schema for documents"
```

---

### Task 4: Buat endpoint upload dokumen `/api/storage/upload`

**Files:**
- Create: `src/app/api/storage/upload/route.ts`

**Interfaces:**
- Consumes: `DOC_TYPES`, `ALLOWED_FILE_TYPES`, `MAX_FILE_SIZE`, `uploadSchema` dari `@/lib/validations/storage`.
- Produces: `POST /api/storage/upload` — menerima `multipart/form-data` (field `file` + `docType`), upload ke bucket `dokumen` di folder `{userId}/{docType}/`, return signed URL (expiry 1 jam).

- [ ] **Step 1: Buat route handler**

Create `src/app/api/storage/upload/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import {
  ALLOWED_FILE_TYPES,
  DOC_TYPES,
  MAX_FILE_SIZE,
} from '@/lib/validations/storage';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const docType = formData.get('docType') as string | null;

    if (!file) {
      return createApiError('validation_error', 'File wajib diisi', 400);
    }

    if (!docType || !(DOC_TYPES as readonly string[]).includes(docType)) {
      return createApiError('validation_error', 'Tipe dokumen tidak valid', 400);
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return createApiError('invalid_file_type', 'Hanya PDF, JPG, atau PNG yang diperbolehkan', 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return createApiError('file_too_large', 'File maksimal 5MB', 413);
    }

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${authUser.id}/${docType}/${Date.now()}-${sanitizedFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('dokumen')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return createApiError('upload_failed', uploadError.message, 500);
    }

    const { data: signedData, error: signedError } = await supabase.storage
      .from('dokumen')
      .createSignedUrl(filePath, 3600);

    if (signedError || !signedData) {
      return createApiError('signed_url_failed', 'Gagal membuat signed URL', 500);
    }

    return apiResponse({ url: signedData.signedUrl }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
```

- [ ] **Step 2: Verifikasi**

Run: `npx tsc --noEmit`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/storage/upload/route.ts
git commit -m "feat(storage): add POST /api/storage/upload for document uploads"
```

---

### Task 5: Migration RLS policies + storage bucket

**Files:**
- Create: `supabase/migrations/20260803200000_add_rls_policies_and_storage.sql`

**Interfaces:**
- Produces: Fungsi helper `is_admin()`, `is_koordinator_or_admin()`; policies RLS untuk `users`, `helper_profiles`, `koordinator_profiles`; bucket storage private `dokumen` + storage policies.
- Catatan: `lansia_profiles` sudah punya SELECT/INSERT/UPDATE policies di initial schema (soft delete via `deleted_at` tercakup oleh policy UPDATE yang sudah ada). `users` sudah punya SELECT own di initial schema. Migration ini HANYA menambah yang belum ada.
- Catatan: Pakai fungsi `SECURITY DEFINER` untuk cek role — query `public.users` langsung di dalam policy pada tabel `users` akan memicu infinite recursion RLS.

- [ ] **Step 1: Tulis migration**

Create `supabase/migrations/20260803200000_add_rls_policies_and_storage.sql`:

```sql
-- =============================================================
-- Sprint 1: RLS policies tambahan + storage bucket dokumen
-- =============================================================

-- ---------- Helper functions cek role (SECURITY DEFINER mencegah rekursi RLS) ----------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_koordinator_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('koordinator', 'admin')
  );
$$;

-- ---------- USERS ----------
-- Admin dapat membaca semua profil
CREATE POLICY "Admin can read all users" ON public.users
    FOR SELECT USING (public.is_admin());

-- User dapat mengupdate profilnya sendiri
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ---------- HELPER PROFILES ----------
-- Helper membuat profil sendiri
CREATE POLICY "Helper can insert own profile" ON public.helper_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Helper mengupdate profil sendiri
CREATE POLICY "Helper can update own profile" ON public.helper_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Koordinator & admin dapat membaca semua profil helper (untuk verifikasi)
CREATE POLICY "Koordinator and admin can read helper profiles" ON public.helper_profiles
    FOR SELECT USING (public.is_koordinator_or_admin());

-- ---------- KOORDINATOR PROFILES ----------
CREATE POLICY "Koordinator can read own profile" ON public.koordinator_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Koordinator can insert own profile" ON public.koordinator_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Koordinator can update own profile" ON public.koordinator_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin dapat membaca & mengupdate profil koordinator (verifikasi)
CREATE POLICY "Admin can read koordinator profiles" ON public.koordinator_profiles
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin can update koordinator profiles" ON public.koordinator_profiles
    FOR UPDATE USING (public.is_admin());

-- ---------- STORAGE BUCKET ----------
INSERT INTO storage.buckets (id, name, public)
VALUES ('dokumen', 'dokumen', false)
ON CONFLICT (id) DO NOTHING;

-- User dapat upload file ke folder miliknya ({userId}/)
CREATE POLICY "Users can upload dokumen" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'dokumen'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- User dapat membaca (untuk signed URL) file di folder miliknya
CREATE POLICY "Users can read own dokumen" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'dokumen'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
```

- [ ] **Step 2: Verifikasi SQL tidak bentrok dengan initial schema**

Run: `npx supabase db push` (akan ada prompt Y/n — jawab Y). Atau jika Docker offline, verifikasi manual dengan membaca bahwa nama policy tidak duplikat dengan initial schema (initial schema hanya punya: "Users can read own profile", "Keluarga can read/insert/update own lansia", "Verified helper profiles readable", "Users can view own notifications", "Users can read own messages").

Expected: Migration berhasil di-apply. Jika `db push` tidak bisa konek Docker, catat bahwa ini akan dijalankan nanti saat Docker hidup; commit tetap dilakukan.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260803200000_add_rls_policies_and_storage.sql
git commit -m "feat(rls): add RLS policies for profiles and private dokumen storage bucket"
```

---

### Task 6: Proteksi route upload di middleware + build final

**Files:**
- Modify: `src/middleware.ts` (daftar `protectedRoutes`)

**Interfaces:**
- Consumes: `protectedRoutes` array yang sudah ada di `src/middleware.ts`.
- Produces: `/api/storage/upload` masuk daftar route yang butuh autentikasi.

- [ ] **Step 1: Tambah route ke protectedRoutes**

Di `src/middleware.ts`, ubah array `protectedRoutes` menjadi:

```typescript
  const protectedRoutes = [
    '/api/users/me',
    '/api/storage/upload',
    // Add more protected routes here as they're created
  ];
```

- [ ] **Step 2: Verifikasi penuh**

Run: `npx tsc --noEmit`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

Run: `npm run build`
Expected: Build sukses tanpa error.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(middleware): protect storage upload route"
```

---

## Self-Review

- **Spec coverage:**
  - §2.1 PUT `/api/users/me` → Task 1 + Task 2
  - §2.2 POST `/api/storage/upload` → Task 3 + Task 4
  - §2.3 RLS policies → Task 5 (users, lansia_profiles [sudah ada, note], helper_profiles, koordinator_profiles)
  - §2.4 storage bucket → Task 5
  - §3 struktur file → semua path sesuai
  - §4 keamanan → signed URL, private bucket, SECURITY DEFINER, sanitasi nama file
  - §5 error handling → `createApiError` dengan kode konsisten
  - §6 testing → tsc/lint/build gate
- **Placeholder scan:** Tidak ada TBD/TODO; semua step punya kode konkret.
- **Type consistency:** `updateProfileSchema` (Task 1) dipakai Task 2; `DOC_TYPES`/`ALLOWED_FILE_TYPES`/`MAX_FILE_SIZE` (Task 3) dipakai Task 4; `protectedRoutes` (Task 6) konsisten dengan yang sudah ada.
