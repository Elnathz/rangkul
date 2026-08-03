# Helper Profile API

## Create/Update Profile

**POST** `/api/helper/profile`

Creates or updates a helper profile. Requires `helper` role.

### Request Body

```json
{
  "bio": "string (max 500 characters, optional)",
  "wilayah_domisili": "string (min 3 characters)",
  "domisili_lat": "number",
  "domisili_lng": "number",
  "radius_layanan_km": "number (min 1, max 25, default 5)",
  "ktp_url": "string (valid URL)"
}
```

### Response

#### Success (200/201)

```json
{
  "message": "Profil helper berhasil disimpan",
  "profile": {
    "id": "uuid",
    "user_id": "uuid",
    "bio": "string",
    "wilayah_domisili": "string",
    "domisili_lat": "number",
    "domisili_lng": "number",
    "radius_layanan_km": "number",
    "ktp_url": "string",
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
    "bio": ["Bio maksimal 500 karakter"],
    "wilayah_domisili": ["Wilayah domisili wajib diisi"],
    "ktp_url": ["URL KTP tidak valid"]
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
  "message": "Hanya role helper yang dapat membuat profil helper"
}
```

#### Server Error (500)

```json
{
  "error": "server_error",
  "message": "Terjadi kesalahan server"
}
```