# Booking API

## Create Task

**POST** `/api/booking/task`

Creates a new task/booking. Requires `keluarga` role.

### Request Body

```json
{
  "lansia_id": "uuid",
  "service_category_id": "uuid",
  "jadwal_waktu": "ISO 8601 datetime string",
  "catatan": "string (max 1000 characters, optional)"
}
```

### Response

#### Success (201)

```json
{
  "message": "Task berhasil dibuat",
  "task": {
    "id": "uuid",
    "lansia_id": "uuid",
    "service_category_id": "uuid",
    "jadwal_waktu": "ISO 8601 datetime string",
    "catatan": "string",
    "status": "enum ['tersedia', 'dipesan', 'diterima', 'dikerjakan', 'selesai_dikerjakan', 'diverifikasi_lansia', 'diverifikasi_keluarga', 'selesai', 'dibatalkan', 'kadaluarsa', 'ditolak']",
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
    "lansia_id": ["ID Lansia tidak valid"],
    "service_category_id": ["ID Kategori layanan tidak valid"],
    "jadwal_waktu": ["Format jadwal waktu ISO 8601 tidak valid"]
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
  "message": "Hanya role keluarga yang dapat membuat task"
}
```

#### Server Error (500)

```json
{
  "error": "server_error",
  "message": "Terjadi kesalahan server"
}
```