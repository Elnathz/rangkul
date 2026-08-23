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

Alias kompatibilitas untuk `PATCH /api/tasks/:id/complete`. Keluarga hanya dapat memanggil endpoint ini ketika task `selesai` dan pembayaran Midtrans sudah `held_escrow`. Server melakukan release atomik 90/7/3 dan mengembalikan payment yang sudah `released`.

### Payment Midtrans Sandbox

- `POST /api/payments/:task_id/charge` membuat checkout Snap dari `tasks.harga_final`. Client tidak mengirim nominal.
- `GET /api/payments/:task_id` dan `GET /api/payments/:task_id/status` mengembalikan payment sesuai relasi task.
- `POST /api/payments/webhook` memvalidasi `signature_key` dengan SHA-512 sebelum settlement.
- `POST /api/payments/:task_id/refund` hanya tersedia untuk task yang dibatalkan dan payment `held_escrow`.
- `PATCH /api/tasks/:id/complete` menjalankan release 90/7/3 melalui RPC atomik.

Status `held_escrow` pada demo berarti payment Midtrans sudah settlement dan dicatat pada ledger aplikasi. Ini bukan klaim bahwa Rangkul memiliki escrow regulated sendiri.

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

## Katalog, kategori, dan Riwayat Rangkul

- `GET /api/categories` mengembalikan kategori leaf aktif beserta `tingkat`, `harga_dasar`, `is_high_risk`, dan batas jarak jika ada.
- `GET /api/helpers` menghitung `jarak_km` di server dari koordinat lansia ke domisili Helper, lalu menerapkan radius layanan. Client tidak berwenang menentukan jarak atau harga akhir.
- `GET /api/lansia/:id/riwayat` hanya dapat dibaca Keluarga pemilik dan mengembalikan kunjungan selesai, foto bukti, catatan kondisi, Health Snapshot, Cerita Hari Ini, serta tren rule-based.
- `POST /api/helpers/profile/photo` menerima `foto_wajah_url` dari Helper dan membuat pengajuan foto berstatus `pending`. Foto publik lama tetap dipakai sampai Koordinator menyetujui perubahan.
- `PATCH /api/helpers/profile/photo/approve` menerima `request_id` dan hanya dapat dipanggil Koordinator terverifikasi yang menaungi Helper tersebut. Proses memakai conditional update dan mengembalikan `409` bila pengajuan sudah diproses.

## Route canonical dan alias

- `POST /api/tasks` adalah route canonical untuk booking. `POST /api/booking/task` tetap tersedia sebagai alias kompatibilitas.
- `POST /api/helpers/apply` adalah route canonical pendaftaran Helper. `POST /api/helper/apply` tetap tersedia sebagai alias kompatibilitas.
- `PATCH /api/helpers/:id/status` menerima `action` `approve`, `reject`, atau `suspend`. Route approve/reject lama tetap tersedia untuk client lama.

## Notifikasi

- `GET /api/notifications`: hanya notifikasi milik user yang sedang login.
- `PATCH /api/notifications/:id/read`: hanya dapat menandai notifikasi milik user tersebut.

## Reports, messages, dan emergency

- `POST /api/reports` menerima `{ "task_id": "uuid", "alasan": "..." }`. Server menurunkan Helper dari task milik Keluarga.
- `GET /api/reports` mengembalikan laporan sesuai scope Keluarga, Koordinator wilayah, atau Admin.
- `PATCH /api/reports/:id` menerima `{ "status": "ditindak" | "selesai" }` dari Koordinator/Admin.
- `GET /api/messages/conversations`, `GET /api/messages/:task_id`, dan `POST /api/messages` hanya bekerja untuk peserta task.
- `PATCH /api/messages/:id/read` hanya dapat dipanggil penerima pesan.
- `POST /api/emergency` menerima `{ "task_id": "uuid" }` dari Helper yang sedang `dikerjakan`.
- `PATCH /api/emergency/:id/acknowledge` tersedia untuk Keluarga terkait, Koordinator wilayah, atau Admin.

## Akses data

Role, relasi task, dan RLS server menjadi sumber otorisasi. Halaman tidak boleh mengambil seluruh data lalu menyaringnya di browser. Respons katalog dan Helper tidak boleh memuat KTP, dokumen hubungan keluarga, Health Snapshot, atau metadata audit.
