# Booking dan Matching API

Dokumen ini menjelaskan kontrak booking yang dipakai UI Rangkul. Sumber kebenaran aturan bisnis tetap `docs/TDD_Rangkul.md`. Spesifikasi machine-readable tersedia di `docs/api/openapi.json`.

## Membuat kunjungan

Route canonical adalah `POST /api/tasks`. `POST /api/booking/task` dipertahankan sebagai alias kompatibilitas dan memakai validasi serta service yang sama.

Endpoint hanya dapat dipanggil akun dengan role `keluarga`. Body dasar:

```json
{
  "lansia_id": "uuid",
  "service_category_id": "uuid",
  "jadwal_waktu": "2026-09-06T03:00:00.000Z",
  "catatan": "Mohon temani berjalan ringan di teras.",
  "mode_penugasan": "pelamar"
}
```

`mode_penugasan` menentukan cara Helper dipilih.

### Langsung

Dipakai dari `/booking/{helper_id}` setelah Keluarga memilih Helper tertentu.

```json
{
  "mode_penugasan": "langsung",
  "helper_id": "uuid"
}
```

- `helper_id` wajib ada.
- Helper harus terverifikasi, tersedia, memiliki kategori aktif, berada dalam jangkauan, dan tidak memiliki konflik jadwal.
- UI `/booking/new` tidak menawarkan mode ini karena belum ada Helper yang dipilih.

### Pelamar

Dipakai dari `/booking/new` untuk membuka kesempatan kepada Helper yang memenuhi syarat.

```json
{
  "mode_penugasan": "pelamar"
}
```

- `helper_id` harus tidak ada.
- Jadwal minimal tiga jam dari waktu pembuatan.
- Helper melamar melalui endpoint applications, lalu Keluarga memilih salah satu pelamar.

### Cepat

Dipakai dari `/booking/new` untuk mencari Helper secepatnya.

```json
{
  "mode_penugasan": "cepat"
}
```

- `helper_id` harus tidak ada.
- Jadwal harus berada pada hari lokal yang sama.
- Kategori berisiko tinggi tidak memenuhi syarat.
- Kesempatan menerima tugas kedaluwarsa setelah 15 menit sesuai waktu server.

## Response berhasil

Pembuatan berhasil menghasilkan `201`:

```json
{
  "message": "Task berhasil dibuat",
  "task": {
    "id": "uuid",
    "mode_penugasan": "pelamar",
    "status": "diajukan",
    "harga_dasar": 50000
  }
}
```

Harga dihitung server dari `harga_dasar`, layanan tambahan yang disetujui, dan `harga_final`. Client tidak menambahkan PPN atau biaya layanan fiktif.

## Marketplace dan aplikasi

### `GET /api/tasks/marketplace`

Role: Helper terverifikasi. Mengembalikan tugas yang cocok dengan kategori aktif, radius layanan, wilayah, jadwal, status ketersediaan, dan aturan mode penugasan. Data privat Keluarga dan alamat lengkap tidak boleh keluar pada tahap marketplace.

Query opsional: `mode` (`pelamar` atau `cepat`) dan `limit`.

### `PATCH /api/tasks/{id}/accept`

Role: Helper terverifikasi. Menerima booking `langsung` yang memang ditujukan kepadanya atau memenangkan mode `cepat`. Penerimaan memakai conditional update agar satu tugas tidak dapat diterima dua Helper. Konflik menerima tugas menghasilkan `409`.

### `GET /api/tasks/{id}/applications`

Role: Keluarga pemilik tugas. Mengembalikan pelamar yang masih relevan untuk tugas mode `pelamar`.

### `POST /api/tasks/{id}/applications`

Role: Helper terverifikasi. Membuat aplikasi untuk tugas mode `pelamar`. Duplikasi atau state yang sudah berubah menghasilkan `409`.

### `DELETE /api/tasks/{id}/applications/me`

Role: Helper pemilik aplikasi. Menarik aplikasi selama belum dipilih.

### `PATCH /api/tasks/{id}/applications/{application_id}/select`

Role: Keluarga pemilik tugas. ID application berasal dari daftar pelamar. Pemilihan memakai conditional update. Pelamar yang sudah tidak eligible atau tugas yang sudah berubah menghasilkan `409`.

## Status tugas

Status canonical yang dipakai UI dan backend:

1. `diajukan`
2. `menunggu_persetujuan_koordinator`
3. `dikonfirmasi`
4. `dikerjakan`
5. `menunggu_persetujuan_keluarga`
6. `selesai`
7. `dibatalkan`

Transisi ditentukan backend. UI tidak boleh menampilkan pembatalan setelah status `dikerjakan`.

## Semantik error

| Status | Arti |
| --- | --- |
| `400` | JSON atau query malformed |
| `401` | Sesi login tidak tersedia |
| `403` | Role atau scope tidak diizinkan |
| `404` | Resource tidak ada atau sengaja disembunyikan |
| `409` | State berubah, duplikasi, atau race condition |
| `422` | Field request gagal validasi |
| `500` | Kegagalan internal yang sudah disanitasi |

Format error:

```json
{
  "error": "validation_error",
  "message": "Data kunjungan belum valid.",
  "fieldErrors": {
    "helper_id": ["Helper wajib dipilih untuk mode langsung."]
  }
}
```

## Feature flag

Matching Sprint 6 dikendalikan oleh `SPRINT6_MATCHING_ENABLED`.

- `false` atau tidak disetel: `/booking/new` kembali ke pencarian Helper dan route matching menolak alur baru.
- `true`: mode `pelamar` dan `cepat` aktif.
- Production harus tetap nonaktif sampai migration, RLS, smoke test role, dan seluruh quality gate lulus.
