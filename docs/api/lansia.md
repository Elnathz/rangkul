# Lansia Profile API

## Create/Update Profile

**POST** `/api/lansia/profile`

Creates or updates a lansia profile. Requires `keluarga` role.

### Request Body

```json
{
  "nama": "string (min 2 characters)",
  "alamat": "string (min 5 characters)",
  "lat": "number (optional)",
  "lng": "number (optional)",
  "catatan_kondisi": "string (optional)",
  "dokumen_identitas_lansia_url": "string (valid URL, optional)",
  "dokumen_hubungan_keluarga_url": "string (valid URL, optional)"
}
```

### Response

#### Success (200/201)

```json
{
  "message": "Profil lansia berhasil disimpan",
  "profile": {
    "id": "uuid",
    "user_id": "uuid",
    "nama": "string",
    "alamat": "string",
    "lat": "number",
    "lng": "number",
    "catatan_kondisi": "string",
    "dokumen_identitas_lansia_url": "string",
    "dokumen_hubungan_keluarga_url": "string",
    "created_at": "ISO 8601 datetime",
    "updated_at": "ISO 8601 datetime"
  }
}
```

#### Validation Error (400)

```json
{
  "error": "validation_error",
  "message": "Data input tidak valid",
  "fieldErrors": {
    "nama": ["Nama lansia minimal 2 karakter"],
    "alamat": ["Alamat lengkap minimal 5 karakter"]
  }
}
```

#### Unauthorized (401)

```json
{
  "error": "unauthorized",
  "message": "Anda harus login untuk mengakses resource ini"
}
```

#### Forbidden (403)

```json
{
  "error": "forbidden",
  "message": "Hanya role keluarga yang dapat membuat profil lansia"
}
```

#### Server Error (500)

```json
{
  "error": "server_error",
  "message": "Terjadi kesalahan server"
}
```