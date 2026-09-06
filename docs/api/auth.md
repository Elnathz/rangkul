# Auth API

Endpoint autentikasi bersifat publik. Role Admin tidak dapat dibuat melalui registrasi publik.

## Register

### Request

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "username": "ratnakeluarga",
  "email": "ratnakeluarga@rangkul.id",
  "password": "Rangkul2026*",
  "full_name": "Ratna Wulandari",
  "phone": "081234567801",
  "role": "keluarga",
  "alamat_detail": "Jl. Pleburan Barat No. 10",
  "rt": 2,
  "rw": 5,
  "kelurahan": "Pleburan",
  "kecamatan": "Semarang Selatan",
  "kabupaten_kota": "Kota Semarang",
  "provinsi": "Jawa Tengah"
}
```

### Validasi

| Field | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `username` | string | Ya | 6 sampai 20 karakter, hanya huruf, angka, titik, underscore, dan dash |
| `email` | string | Ya | Format email valid |
| `password` | string | Ya | 8 sampai 128 karakter dan memiliki minimal satu simbol |
| `full_name` | string | Ya | Minimal 2 karakter |
| `phone` | string | Tidak | 10 sampai 13 digit, dimulai dengan `08` |
| `role` | enum | Ya | `keluarga`, `helper`, atau `koordinator` |
| `alamat_detail` | string | Tidak | Detail jalan atau alamat |
| `rt` | integer | Tidak | Dicoerce dari input angka yang valid |
| `rw` | integer | Tidak | Dicoerce dari input angka yang valid |
| `kelurahan` | string | Tidak | Wilayah administrasi |
| `kecamatan` | string | Tidak | Wilayah administrasi |
| `kabupaten_kota` | string | Tidak | Wilayah administrasi |
| `provinsi` | string | Tidak | Wilayah administrasi |

### Response sukses

Status `201`:

```json
{
  "message": "Registrasi berhasil. Silakan login.",
  "user": {
    "id": "uuid",
    "email": "ratnakeluarga@rangkul.id",
    "full_name": "Ratna Wulandari",
    "username": "ratnakeluarga",
    "role": "keluarga"
  }
}
```

Username dan email dinormalisasi menjadi lowercase sebelum disimpan. Email langsung ditandai confirmed oleh Admin API Supabase pada implementasi demo saat ini.

### Error

| Status | `error` | Kondisi |
| --- | --- | --- |
| `400` | `validation_error` | Payload gagal schema |
| `400` | `registration_failed` | Supabase Auth menolak pembuatan user |
| `409` | `username_taken` | Username telah dipakai, case-insensitive |
| `409` | `email_taken` | Email telah terdaftar |
| `500` | `server_error` | Kegagalan internal |

Contoh validasi:

```json
{
  "error": "validation_error",
  "message": "Data input tidak valid",
  "fieldErrors": {
    "username": ["Username minimal 6 karakter"],
    "phone": ["Nomor HP harus diawali dengan 08"]
  }
}
```

## Login

### Request

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "identifier": "ratnakeluarga",
  "password": "Rangkul2026*"
}
```

`identifier` menerima username atau email. Lookup username bersifat case-insensitive.

### Validasi

| Field | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `identifier` | string | Ya | Minimal 1 karakter |
| `password` | string | Ya | Minimal 1 karakter pada schema login |

### Response sukses

Status `200`:

```json
{
  "message": "Login berhasil",
  "user": {
    "id": "uuid",
    "email": "ratnakeluarga@rangkul.id",
    "username": "ratnakeluarga",
    "full_name": "Ratna Wulandari",
    "role": "keluarga",
    "account_status": "active"
  },
  "session": {
    "access_token": "token-user",
    "refresh_token": "refresh-token",
    "expires_in": 3600,
    "token_type": "bearer"
  }
}
```

Object `user` mengikuti row profil `public.users` dan dapat memiliki field tambahan. Jangan menaruh response login nyata pada issue, screenshot, atau log karena memuat token sesi.

### Error

| Status | `error` | Kondisi |
| --- | --- | --- |
| `400` | `validation_error` | Identifier atau password kosong |
| `401` | `invalid_credentials` | Username tidak ditemukan atau password salah |
| `403` | `account_suspended` | Akun berstatus suspended |
| `404` | `user_not_found` | Auth berhasil tetapi profil tidak dapat dimuat atau dipulihkan |
| `500` | `server_error` | Kegagalan internal |

Contoh credential salah:

```json
{
  "error": "invalid_credentials",
  "message": "Username atau password salah"
}
```

## Sesi browser dan client non-browser

Browser memakai client Supabase SSR sehingga cookie sesi diperbarui oleh aplikasi. Client non-browser dapat mengirim access token user:

```http
Authorization: Bearer <access-token-user>
```

Jangan mengirim anon key sebagai pengganti access token user. Jangan pernah mengirim service role key dari client.

## Catatan keamanan

- Registrasi publik tidak menerima role `admin`.
- Role dari metadata bukan pengganti pemeriksaan role pada `public.users`.
- Route terproteksi tetap memeriksa session, role, relasi resource, dan RLS.
- Password demo hanya untuk fixture dan tidak boleh digunakan pada production.
- Error credential tidak membedakan username tidak ditemukan dari password salah.
