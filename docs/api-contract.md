# Kontrak API Rangkul

Dokumen ini menjadi kontrak integrasi antara halaman Rangkul, Route Handler Next.js, dan Supabase. Nama field mengikuti `docs/TDD_Rangkul.md`.

## Format respons

Respons sukses selalu memakai envelope `{ "data": ... }`. Respons gagal selalu memakai:

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
  "foto_bukti_url": "actor-id/foto_bukti/object-name.jpg",
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

Server menyimpan `task_evidence` dan `health_snapshots` dalam satu fungsi database, lalu mengubah task menjadi `selesai`. `client_submission_id` membuat retry aman dan mencegah laporan ganda. `foto_bukti_url` adalah object path dari upload privat, bukan signed URL. Route memetakan field `skor_*` ke kolom deployed `energi`, `mobilitas`, `mood`, `nafsu_makan`, dan `kualitas_tidur`.

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

Multipart form dengan field `file` dan `docType`. `docType` yang tersedia mencakup `foto_bukti`, `foto_lansia`, `foto_helper`, `foto_koordinator`, `ktp`, `identitas_lansia`, `hubungan_keluarga`, dan `dokumen_koordinator`. Server menentukan bucket dan object path final. Response `201` mengembalikan `data.path`, `data.bucket`, `data.content_type`, dan metadata aman. Signed URL opsional hanya untuk preview sesi aktif dan tidak boleh disimpan sebagai referensi permanen.

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
- `PATCH /api/reports/:id` menerima status, keputusan Helper opsional, dan alasan wajib dari Koordinator/Admin sesuai kontrak review Sprint 4.
- `GET /api/messages/conversations`, `GET /api/messages/:task_id`, dan `POST /api/messages` hanya bekerja untuk peserta task.
- `PATCH /api/messages/:id/read` hanya dapat dipanggil penerima pesan.
- `POST /api/emergency` menerima `{ "task_id": "uuid" }` dari Helper yang sedang `dikerjakan`.
- `PATCH /api/emergency/:id/acknowledge` tersedia untuk Keluarga terkait, Koordinator wilayah, atau Admin.

## Akses data

Role, relasi task, dan RLS server menjadi sumber otorisasi. Halaman tidak boleh mengambil seluruh data lalu menyaringnya di browser. Respons katalog dan Helper tidak boleh memuat KTP, dokumen hubungan keluarga, Health Snapshot, atau metadata audit.

## Kontrak Sprint 4

Bagian ini mengikat route yang disentuh Sprint 4. Semua error mematuhi format global. JSON atau query malformed menghasilkan `400`, sesi tidak tersedia `401`, role atau scope salah `403`, resource tersembunyi `404`, state/idempotency conflict `409`, validasi field `422`, dan kegagalan internal tersanitasi `500`.

### Riwayat Rangkul

`GET /api/lansia/:id/riwayat` hanya untuk Keluarga pemilik lansia. Server mengambil ownership sebelum timeline. Response `200`:

```json
{
  "data": {
    "lansia": { "id": "uuid", "nama": "Mbah Sari" },
    "timeline": [
      {
        "task_id": "uuid",
        "selesai_at": "2026-08-29T03:00:00Z",
        "foto_bukti_url": "short-lived-signed-url",
        "catatan_kondisi": "Kondisi stabil selama kunjungan.",
        "cerita_hari_ini": "Bercerita tentang kebun di rumah lama.",
        "scores": {
          "energi": 4,
          "mobilitas": 4,
          "mood": 5,
          "nafsu_makan": 4,
          "kualitas_tidur": 3
        }
      }
    ],
    "tren": [],
    "perlu_perhatian": false,
    "disclaimer": "Riwayat ini membantu keluarga melihat pola kunjungan dan bukan diagnosis medis."
  }
}
```

Task yang belum `selesai`, task milik lansia lain, dan signed URL lama tidak dipakai. Lansia di luar ownership menghasilkan `404`.

### Kategori dan review Koordinator

- `POST /api/categories`, Admin only. Request memuat field allowlist kategori. Server menetapkan actor dan audit. Response `201` memakai `{ data: { category } }`.
- `PATCH /api/categories/:id`, Admin only. Request memuat field yang berubah. Server mengambil category dan referensi histori. Stale state atau perubahan yang merusak histori menghasilkan `409`.
- `/api/admin/service-categories` dan `/api/admin/service-categories/:id` adalah alias kompatibilitas menuju service yang sama. Alias update lama boleh menerima `PUT`, tetapi tidak memiliki business rule sendiri.
- `PATCH /api/admin/koordinator/:id/status`, Admin only. Request `{ "decision": "approve | reject", "reason": "wajib saat reject" }`. Status awal harus `pending_verification`; status akhir `verified` atau `rejected`. Server menetapkan reviewer dan waktu. Request concurrent kedua menghasilkan `409`.
- Route approve/reject Koordinator lama adalah alias menuju mutation canonical.

### Fallback Helper

`PATCH /api/admin/helpers/:id/assign-fallback`, Admin only, menerima `{ "reason": "alasan assignment" }`. Browser tidak mengirim wilayah authoritative. RPC mengambil wilayah Helper, mengunci row, memeriksa Koordinator RT aktif dan fallback RW yang sah, lalu menetapkan `verified_by_admin_fallback`. Jika Koordinator yang memenuhi tersedia atau status Helper sudah berubah, response `409`.

### Evidence offline

`POST /api/tasks/:id/evidence` memakai request yang didefinisikan pada bagian Task dan laporan. Status IndexedDB tidak dikirim sebagai authority. Status awal task harus `dikerjakan`; status akhir `selesai`. `client_submission_id` wajib berupa UUID dan menjadi idempotency key. Retry key yang sama dengan payload sama mengembalikan `200` serta row pertama. Key yang sama untuk task atau payload berbeda menghasilkan `409`.

### Saldo Demo

`POST /api/payments/:task_id/demo-wallet/charge` hanya untuk Keluarga pemilik task. Request opsional:

```json
{ "idempotency_key": "uuid" }
```

Request tidak menerima nominal. Server mengambil `harga_final`, wallet, payment, actor, dan split. Status awal payment harus eligible dan status akhir `held_escrow` dengan `payment_method = saldo_demo`. Debit wallet, ledger, payment, transaction log, dan audit `charge_demo_wallet` berada dalam satu transaksi. Saldo kurang menghasilkan `409` tanpa partial write.

### Komisi Koordinator

`GET /api/koordinator/commissions?from=&to=&page=&limit=` hanya untuk Koordinator `verified`. Server menghitung `payments.koordinator_share` dari payment `released` pada scope wilayah aktor. Response `200`:

```json
{
  "data": {
    "total_released": 15000,
    "transaction_count": 5,
    "entries": [],
    "pagination": { "page": 1, "limit": 20, "total": 5 }
  }
}
```

Rentang tanggal invalid menghasilkan `422`. Empty period tetap `200` dengan array kosong. Database error tidak diubah menjadi nilai nol.

### Review laporan dan banding

`PATCH /api/reports/:id` menerima:

```json
{
  "status": "ditindak | selesai",
  "helper_status": "verified | suspended",
  "decision_reason": "alasan keputusan"
}
```

Koordinator hanya boleh memutus report dalam wilayahnya, sedangkan Admin lintas wilayah. Server mengambil report, Helper, actor, dan state terbaru. Status awal harus `menunggu` atau `ditindak`. Perubahan status Helper mewajibkan `decision_reason`. RPC menulis report, Helper, reviewer, waktu, dan audit `review_report`, `restore_helper`, atau `suspend_helper` secara atomik. Reviewer kedua menerima `409`.

`POST /api/appeals` hanya untuk Keluarga `restricted` dan menerima `{ "alasan": "..." }`. Partial unique index membatasi satu appeal `menunggu` per user. Duplicate concurrent menghasilkan `409`.

`PATCH /api/admin/appeals/:id` hanya untuk Admin dan menerima `{ "status": "disetujui | ditolak", "alasan": "..." }`. Status awal harus `menunggu`. RPC mengunci appeal, mengubah account status sesuai keputusan, menyimpan reviewer dan waktu, lalu menulis audit `resolve_appeal` dalam transaksi yang sama. Reviewer kedua menerima `409`.
