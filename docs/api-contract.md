# Kontrak API Rangkul

Dokumen ini menjadi kontrak integrasi antara halaman Rangkul, Route Handler Next.js, dan Supabase. Nama field mengikuti `docs/TDD_Rangkul.md`.

## Format respons

Respons sukses mengembalikan data domain langsung atau objek dengan `message`, `task`, dan `status`. Respons gagal selalu memakai:

```json
{
  "error": "validation_error",
  "message": "Penjelasan yang dapat ditindaklanjuti",
  "fieldErrors": {
    "field": ["Alasan validasi"]
  }
}
```

Status HTTP:

| Status | Makna |
| --- | --- |
| `401` | Sesi belum tersedia |
| `403` | Role atau relasi resource tidak berwenang |
| `404` | Resource tidak tersedia untuk akun tersebut |
| `409` | Status berubah, race condition, atau pengajuan sudah diproses |
| `422` | Payload gagal validasi |

## Task dan laporan

### `GET /api/tasks/:id`

Mengembalikan detail task untuk Keluarga pemilik atau Helper yang ditugaskan. Endpoint tidak mengembalikan task milik akun lain.

### `PATCH /api/tasks/:id/accept`

Helper menerima task marketplace atau booking direct yang memang ditujukan kepadanya. Server melakukan conditional update berdasarkan `status = 'diajukan'`. Jika Helper lain sudah menang, respons `409` dan UI wajib melakukan refresh tanpa retry otomatis.

### `PATCH /api/tasks/:id/start`

Payload opsional:

```json
{
  "checkin_lat": -7.0054,
  "checkin_lng": 110.4388
}
```

Transisi hanya `dikonfirmasi` ke `dikerjakan` untuk Helper pemilik task.

### `POST /api/tasks/:id/evidence`

Hanya Helper pemilik task yang dapat mengirim laporan ketika status task `dikerjakan`.

```json
{
  "foto_bukti_url": "signed-storage-url",
  "catatan_kondisi": "Catatan kondisi minimal sepuluh karakter",
  "skor_energi": 1,
  "skor_mobilitas": 1,
  "skor_mood": 1,
  "skor_nafsu_makan": 1,
  "skor_tidur": 1,
  "cerita_hari_ini": "Cerita singkat kunjungan",
  "client_submission_id": "uuid"
}
```

Server menyimpan `task_evidence` dan `health_snapshots` dalam satu fungsi database, lalu mengubah task menjadi `selesai`. `client_submission_id` membuat retry aman dan mencegah laporan ganda. Foto bukti harus berasal dari upload privat dan tidak boleh berupa URL publik permanen.

### `PATCH /api/tasks/:id/confirm-completion`

Kontrak disiapkan untuk konfirmasi Keluarga pada alur Demo Ledger. Implementasi pembayaran dan release 90/7/3 mengikuti Sprint 3. Endpoint tidak mengubah status task yang sudah `selesai` tanpa payment provider yang sudah tersedia.

### `POST /api/tasks/:id/extra-service`

Helper mengirim `nama_layanan` dan `biaya`. Server menghentikan task pada `menunggu_persetujuan_keluarga` sampai Keluarga memutuskan.

### `PATCH /api/tasks/:id/extra-service/:eid`

Keluarga mengirim:

```json
{ "decision": "disetujui" }
```

Keputusan memakai conditional RPC dan mengembalikan `409` bila pengajuan sudah diproses.

## Storage

### `POST /api/storage/upload`

Multipart form dengan field `file` dan `docType`. `docType` yang tersedia mencakup `foto_bukti`, `foto_lansia`, `foto_helper`, `foto_koordinator`, `ktp`, `identitas_lansia`, `hubungan_keluarga`, dan `dokumen_koordinator`. Bucket tetap privat, sehingga URL yang dikembalikan bersifat signed dan memiliki masa berlaku.

## Notifikasi

- `GET /api/notifications`: hanya notifikasi milik user yang sedang login.
- `PATCH /api/notifications/:id/read`: hanya dapat menandai notifikasi milik user tersebut.

## Akses data

Role, relasi task, dan RLS server menjadi sumber otorisasi. Halaman tidak boleh mengambil seluruh data lalu menyaringnya di browser. Respons katalog dan Helper tidak boleh memuat KTP, dokumen hubungan keluarga, Health Snapshot, atau metadata audit.
