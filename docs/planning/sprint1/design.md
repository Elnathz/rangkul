# Sprint 1 Design: Autentikasi & Profil Pengguna

**Tanggal:** 3 Agustus 2026
**Status:** Approved
**Referensi:** TDD Rangkul §14 Sprint 1

## 1. Tujuan

Menyelesaikan fondasi autentikasi dan profil pengguna yang aman:
1. Update profil pengguna (GET/PUT)
2. Upload dokumen ke Supabase Storage
3. RLS policies untuk melindungi data & dokumen sensitif

## 2. Cakupan

### 2.1 Endpoint Update Profil User

**`PUT /api/users/me`** — Update profil pengguna yang sedang login.

**Request Body:**
```json
{
  "full_name": "string (optional)",
  "phone": "string (optional)",
  "username": "string (optional)"
}
```

**Validasi (dari `updateProfileSchema` baru di `src/lib/validations/auth.ts`):**

| Field | Rules |
|-------|-------|
| `full_name` | Minimal 2 karakter |
| `phone` | Optional string |
| `username` | Min 6, max 20, `^[a-zA-Z0-9._-]+$` |

**Alur:**
1. Ambil user dari session (harus login → 401)
2. Cek `account_status` (suspended → 403)
3. Jika `username` diubah, cek unik (case-insensitive) → duplikat = 409
4. Update tabel `users` dengan `updated_at` baru
5. Return profil lengkap

**Response:**
- `200` → profil berhasil di-update
- `400` → validation error
- `401` → belum login
- `403` → akun suspended
- `409` → username sudah dipakai

### 2.2 Endpoint Upload Dokumen

**`POST /api/storage/upload`** — Upload dokumen ke bucket private.

**Request:** `multipart/form-data` dengan field:
- `file`: File dokumen (PDF/JPG/PNG, max 5MB)
- `docType`: `ktp` | `identitas_lansia` | `hubungan_keluarga` | `dokumen_koordinator`

**Alur:**
1. Validasi user login (401 jika tidak)
2. Validasi tipe file (PDF/JPG/PNG) dan ukuran (max 5MB)
3. Generate path: `{userId}/{docType}/{timestamp}-{sanitizedFileName}`
4. Upload ke bucket `dokumen` (private)
5. Generate signed URL (expiry 1 jam)
6. Return `{ url }` — signed URL yang akan disimpan di kolom profil

**Response:**
- `200` → `{ url: "https://...signed-url..." }`
- `400` → tipe file/ukuran tidak valid
- `401` → belum login
- `413` → file terlalu besar

### 2.3 RLS Policies (Migration Baru)

Tabel yang di-protect dan kebijakannya:

#### `users`
| Policy | Aturan |
|--------|--------|
| Select | `id = auth.uid()` (user sendiri) ATAU `role = 'admin'` |
| Update | `id = auth.uid()` (user sendiri) |
| Insert/Delete | Tidak ada (dikelola trigger/admin) |

#### `lansia_profiles`
| Policy | Aturan |
|--------|--------|
| Select | `keluarga_id = auth.uid()` (keluarga pemilik) |
| Insert/Update | `keluarga_id = auth.uid()` |
| Delete | `keluarga_id = auth.uid()` (soft delete via `deleted_at`) |

Catatan: Kolom `dokumen_identitas_lansia_url` & `dokumen_hubungan_keluarga_url` hanya bisa dibaca oleh pemilik.

#### `helper_profiles`
| Policy | Aturan |
|--------|--------|
| Select | `user_id = auth.uid()` (helper sendiri) ATAU role admin/koordinator |
| Update | `user_id = auth.uid()` ATAU role admin/koordinator (untuk verifikasi) |
| Insert | `user_id = auth.uid()` |

Catatan: Kolom `ktp_url` hanya bisa dibaca oleh helper sendiri + admin/koordinator verifikator.

#### `koordinator_profiles`
| Policy | Aturan |
|--------|--------|
| Select | `user_id = auth.uid()` (koordinator sendiri) ATAU role admin |
| Update | `user_id = auth.uid()` ATAU role admin |
| Insert | `user_id = auth.uid()` |

Catatan: Kolom `dokumen_url` hanya bisa dibaca oleh koordinator sendiri + admin.

### 2.4 Storage Bucket

Migration harus membuat bucket **private** `dokumen` (belum ada di database):
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('dokumen', 'dokumen', false);
```
Bucket private berarti file tidak bisa diakses publik, hanya lewat signed URL.

## 3. Struktur File

```
src/
  lib/
    validations/auth.ts          → + updateProfileSchema (baru)
    supabase/server.ts           → (sudah ada, dipakai ulang)
  app/api/
    users/me/route.ts            → + PUT handler (baru)
    storage/upload/route.ts      → BARU
supabase/
  migrations/
    XXX_add_rls_policies.sql     → BARU (RLS policies + bucket dokumen)
```

## 4. Keamanan

- Semua endpoint cek session terlebih dahulu
- Bucket `dokumen` harus **private** (bukan public)
- Signed URL untuk akses file — bukan URL publik
- Validasi file: tipe (PDF/JPG/PNG), ukuran max 5MB, sanitasi nama file
- RLS sebagai lapisan keamanan terakhir di database
- Username unik case-insensitive dicek di aplikasi + index unique di DB

## 5. Error Handling

Mengikuti pola `apiResponse`/`createApiError` yang sudah ada:
- `validation_error` (400) — data tidak valid
- `unauthorized` (401) — belum login
- `forbidden` (403) — akun suspended / bukan pemilik
- `username_taken` (409) — username sudah dipakai
- `invalid_file_type` (400) — tipe file salah
- `file_too_large` (413) — file > 5MB
- `server_error` (500) — error tak terduga

## 6. Testing

- TypeScript check (`npx tsc --noEmit`) — harus lulus
- ESLint (`npm run lint`) — harus lulus
- Manual test alur:
  - Register → login → update profil
  - Upload KTP → signed URL tersimpan
  - User B tidak bisa baca profil user A (RLS)

## 7. Out of Scope (YAGNI)

- Verifikasi Helper oleh Koordinator (Sprint 3)
- Endpoint CRUD lansia lengkap (Sprint 2)
- Reset password
- Upload avatar/foto profil
- Refresh token endpoint terpisah
