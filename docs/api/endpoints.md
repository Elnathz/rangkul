# Inventaris Endpoint API Rangkul

Inventaris ini dibuat dari file `src/app/api/**/route.ts` pada 6 September 2026. Tujuannya adalah membantu navigasi source. Schema payload dan response tetap mengikuti `docs/api/openapi.json`, dokumen domain, implementasi handler, dan `docs/TDD_Rangkul.md`.

## Cara membaca akses

| Label | Makna |
| --- | --- |
| Publik | Tidak membutuhkan sesi user. Webhook tetap membutuhkan signature yang valid |
| Login | Membutuhkan sesi, lalu RLS menentukan data yang terlihat |
| Keluarga | Hanya akun Keluarga, biasanya ditambah pemeriksaan ownership |
| Helper | Hanya akun Helper, biasanya ditambah status verified dan eligibility |
| Koordinator | Hanya Koordinator, biasanya ditambah status verified dan scope wilayah |
| Admin | Hanya Admin melalui `requireAdmin` atau pemeriksaan role setara |
| Partisipan | Actor harus terhubung ke task, conversation, payment, atau resource terkait |
| Multi-role | Lebih dari satu role diizinkan dengan hasil yang dibatasi relasi dan RLS |

Endpoint yang menerima UUID tidak menjadi publik hanya karena ID diketahui.

## Auth dan profil user

| Method | Endpoint | Akses | Ringkasan |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Publik | Membuat akun Keluarga, Helper, atau Koordinator |
| `POST` | `/api/auth/login` | Publik | Login dengan username atau email dan password |
| `GET` | `/api/users/me` | Login | Mengambil profil user aktif |
| `PUT` | `/api/users/me` | Login | Memperbarui field profil yang diizinkan |

## Kategori layanan

| Method | Endpoint | Akses | Ringkasan |
| --- | --- | --- | --- |
| `GET` | `/api/categories` | Login | Mengambil leaf category aktif yang dapat dipilih |
| `GET` | `/api/categories/[id]` | Admin | Mengambil detail kategori pada route kompatibilitas |
| `PATCH`, `DELETE` | `/api/categories/[id]` | Admin | Memperbarui atau menonaktifkan kategori pada route kompatibilitas |
| `GET`, `POST` | `/api/admin/service-categories` | Admin | Daftar dan membuat kategori layanan |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/api/admin/service-categories/[id]` | Admin | Detail dan mutation kategori layanan |

Kategori yang ditambah atau diubah Admin dibaca dari tabel yang sama oleh katalog, filter Helper, dan pengaturan kategori Helper. Client tetap harus refetch atau menerima invalidasi setelah mutation.

## Lansia dan Riwayat Rangkul

| Method | Endpoint | Akses | Ringkasan |
| --- | --- | --- | --- |
| `GET`, `POST` | `/api/lansia` | Keluarga | Daftar dan membuat profil lansia milik user |
| `GET`, `PUT`, `DELETE` | `/api/lansia/[id]` | Keluarga pemilik | Detail, edit, dan soft delete profil lansia |
| `POST` | `/api/lansia/profile` | Keluarga | Alias atau alur profil lansia yang dipertahankan untuk kompatibilitas |
| `GET` | `/api/lansia/[id]/riwayat` | Keluarga pemilik | Riwayat Rangkul untuk lansia |
| `GET` | `/api/koordinator/lansia` | Koordinator | Data lansia terbatas dalam scope operasional yang diizinkan |
| `GET` | `/api/admin/lansia` | Admin | Daftar data lansia platform |
| `DELETE` | `/api/admin/lansia/[id]` | Admin | Menghapus data lansia sesuai policy Admin |

Dokumen lansia tidak boleh dikembalikan sebagai public URL. Gunakan endpoint storage read yang memvalidasi actor dan object path.

## Helper

| Method | Endpoint | Akses | Ringkasan |
| --- | --- | --- | --- |
| `GET` | `/api/helpers` | Keluarga | Mencari Helper berdasarkan filter layanan dan lokasi |
| `GET` | `/api/helpers/[id]` | Login sesuai kebutuhan | Detail Helper yang aman ditampilkan |
| `POST` | `/api/helper/apply` | Helper | Mengajukan profil Helper |
| `POST` | `/api/helpers/apply` | Helper | Alias canonical untuk pengajuan Helper |
| `GET`, `PATCH` | `/api/helper/profile` | Helper | Membaca dan mengubah profil, radius, layanan, serta availability |
| `POST` | `/api/helpers/profile/photo` | Helper | Mengunggah atau mengganti foto profil Helper |
| `PATCH` | `/api/helpers/profile/photo/approve` | Koordinator verified pada scope Helper | Menyetujui pengajuan perubahan foto Helper secara conditional |
| `GET` | `/api/helper/queue` | Koordinator | Antrean Helper pending dalam wilayah Koordinator |
| `PUT`, `POST` | `/api/helper/[id]/approve` | Koordinator | Menyetujui verifikasi Helper sesuai scope |
| `PUT`, `POST` | `/api/helper/[id]/reject` | Koordinator | Menolak verifikasi Helper dengan alasan |
| `PATCH` | `/api/helpers/[id]/status` | Koordinator atau Admin sesuai action | Adapter approve, reject, atau suspend |
| `GET` | `/api/koordinator/helpers` | Koordinator | Daftar Helper pada wilayah Koordinator |
| `POST` | `/api/koordinator/helpers/[id]/promote` | Koordinator | Promosi trust tier sesuai aturan |
| `GET` | `/api/admin/helpers` | Admin | Daftar Helper platform |
| `PATCH` | `/api/admin/helpers/[id]` | Admin | Memperbarui data administratif Helper |
| `PATCH` | `/api/admin/helpers/[id]/assign-fallback` | Admin | Menetapkan verifikasi fallback yang diizinkan |
| `PATCH` | `/api/admin/helpers/[id]/suspend` | Admin | Menangguhkan Helper dengan alasan |

## Koordinator

| Method | Endpoint | Akses | Ringkasan |
| --- | --- | --- | --- |
| `POST` | `/api/koordinator/apply` | Koordinator | Mengajukan profil Koordinator |
| `GET`, `PATCH` | `/api/koordinator/profile` | Koordinator | Membaca dan memperbarui profil Koordinator |
| `GET` | `/api/koordinator/by-region` | Helper | Mencari calon Koordinator RT atau fallback RW berdasarkan wilayah canonical |
| `GET` | `/api/koordinator/task-approvals` | Koordinator | Antrean task yang memerlukan keputusan |
| `GET` | `/api/koordinator/commissions` | Koordinator | Ringkasan komisi Koordinator |
| `GET` | `/api/admin/koordinator/queue` | Admin | Antrean pengajuan Koordinator |
| `PUT` | `/api/admin/koordinator/[id]/approve` | Admin | Menyetujui Koordinator |
| `PUT` | `/api/admin/koordinator/[id]/reject` | Admin | Menolak Koordinator |
| `PATCH` | `/api/admin/koordinator/[id]/status` | Admin | Adapter perubahan status Koordinator |

## Booking, task, dan matching

| Method | Endpoint | Akses | Ringkasan |
| --- | --- | --- | --- |
| `POST` | `/api/tasks` | Keluarga | Endpoint canonical membuat task |
| `POST` | `/api/booking/task` | Keluarga | Alias kompatibilitas pembuatan task |
| `GET` | `/api/tasks/active` | Login | Task aktif untuk actor saat ini |
| `GET` | `/api/tasks/marketplace` | Helper | Marketplace privacy-safe untuk task Pelamar atau Cari Cepat |
| `GET` | `/api/tasks/[id]` | Partisipan | Detail task berdasarkan relasi dan role |
| `PATCH` | `/api/tasks/[id]/accept` | Helper eligible | Menerima task langsung atau Cari Cepat secara atomik |
| `POST`, `GET` | `/api/tasks/[id]/applications` | Helper untuk POST, Keluarga pemilik untuk GET | Mengirim atau melihat lamaran |
| `DELETE` | `/api/tasks/[id]/applications/me` | Helper pelamar | Menarik lamaran milik sendiri |
| `PATCH` | `/api/tasks/[id]/applications/[application_id]/select` | Keluarga pemilik | Memilih satu pelamar secara atomik |
| `PATCH`, `POST` | `/api/tasks/[id]/cancel` | Partisipan sesuai state | Membatalkan task dan menghitung konsekuensi |
| `PATCH` | `/api/tasks/[id]/reschedule` | Keluarga pemilik | Menjadwalkan ulang sebelum batas state |
| `PATCH` | `/api/tasks/[id]/koordinator-approve` | Koordinator scope task | Menyetujui task yang berisiko |
| `PATCH` | `/api/tasks/[id]/start` | Helper terpilih | Memulai task setelah pembayaran dan check-in valid |
| `POST` | `/api/tasks/[id]/evidence` | Helper terpilih | Mengirim bukti kunjungan |
| `PATCH` | `/api/tasks/[id]/complete` | Helper terpilih | Menandai pekerjaan selesai dari sisi Helper |
| `PATCH` | `/api/tasks/[id]/confirm-completion` | Keluarga pemilik | Mengonfirmasi penyelesaian |
| `POST` | `/api/tasks/[id]/extra-service` | Helper terpilih | Mengajukan layanan tambahan |
| `PATCH` | `/api/tasks/[id]/extra-service/[eid]` | Keluarga pemilik | Menyetujui atau menolak layanan tambahan |
| `POST` | `/api/tasks/[id]/tip` | Keluarga pemilik | Menambahkan tip sesuai aturan pembayaran |

Mutasi state dapat mengembalikan `409` bila task berubah sejak halaman dimuat. Client harus refetch dan menampilkan state terbaru.

## Pembayaran dan Demo Wallet

| Method | Endpoint | Akses | Ringkasan |
| --- | --- | --- | --- |
| `GET` | `/api/payments/[task_id]` | Partisipan pembayaran | Alias status payment |
| `GET` | `/api/payments/[task_id]/status` | Partisipan pembayaran | Status pembayaran task |
| `POST` | `/api/payments/[task_id]/charge` | Keluarga pemilik | Membuat charge pembayaran |
| `POST` | `/api/payments/[task_id]/demo-wallet/charge` | Keluarga pemilik | Menahan saldo Demo Wallet |
| `POST` | `/api/payments/[task_id]/refund` | Actor sesuai policy | Refund berdasarkan state dan kompensasi |
| `POST` | `/api/payments/webhook` | Publik bertanda tangan | Menerima notifikasi payment provider |
| `GET` | `/api/wallet` | Keluarga | Ringkasan Demo Wallet user aktif |
| `GET`, `POST` | `/api/wallet/topup` | Keluarga | Membaca atau membuat self top up Demo Wallet |
| `GET` | `/api/admin/demo-wallet` | Admin | Daftar wallet demo |
| `POST` | `/api/admin/demo-wallet/topup` | Admin | Top up wallet demo dan audit |

Aturan split canonical adalah Helper 90%, Platform 7%, dan Koordinator 3% dari nominal yang memenuhi syarat. Nominal dihitung server.

## Pesan dan notifikasi

| Method | Endpoint | Akses | Ringkasan |
| --- | --- | --- | --- |
| `GET`, `POST` | `/api/chat/start-target` | Login | Menemukan atau memulai target percakapan yang valid |
| `POST` | `/api/messages` | Partisipan percakapan | Mengirim pesan |
| `GET` | `/api/messages/conversations` | Login | Daftar percakapan milik user |
| `GET` | `/api/messages/[id]` | Partisipan percakapan | Isi percakapan |
| `PATCH` | `/api/messages/[id]/read` | Partisipan percakapan | Menandai pesan atau percakapan dibaca |
| `GET` | `/api/notifications` | Login | Daftar notifikasi milik user |
| `PATCH` | `/api/notifications/[id]/read` | Pemilik notifikasi | Menandai notifikasi dibaca |

Realtime adalah jalur sinkronisasi UI, bukan pengganti otorisasi route atau RLS.

## Laporan, banding, dan darurat

| Method | Endpoint | Akses | Ringkasan |
| --- | --- | --- | --- |
| `POST` | `/api/reports` | Keluarga pemilik task | Melaporkan Helper pada task terkait |
| `GET` | `/api/reports` | Keluarga, Koordinator, Admin | Daftar dibatasi reporter, wilayah, atau global |
| `PATCH` | `/api/reports/[id]` | Reviewer yang diizinkan | Menindaklanjuti laporan |
| `GET`, `POST` | `/api/appeals` | User terkait | Membaca atau membuat banding |
| `GET` | `/api/admin/appeals` | Admin | Daftar banding |
| `PATCH` | `/api/admin/appeals/[id]` | Admin | Memutus banding dengan alasan |
| `POST` | `/api/emergency` | Helper task aktif | Mengirim sinyal darurat |
| `PATCH` | `/api/emergency/[id]/acknowledge` | Keluarga terkait, Koordinator, atau Admin sesuai policy | Mengakui dan menangani sinyal |

## Storage

| Method | Endpoint | Akses | Ringkasan |
| --- | --- | --- | --- |
| `POST` | `/api/storage/upload` | Login dan scope folder valid | Upload file dengan validasi tipe, ukuran, folder, dan actor |
| `GET` | `/api/storage/read` | Login dan scope object valid | Membuat akses baca atau signed URL untuk object privat |

Jangan mencatat signed URL, token, isi dokumen identitas, atau service role key ke browser console maupun log publik.

## Admin platform

| Method | Endpoint | Akses | Ringkasan |
| --- | --- | --- | --- |
| `GET` | `/api/admin/stats` | Admin | Statistik dashboard platform |
| `GET`, `POST` | `/api/admin/users` | Admin | Daftar dan membuat user sesuai policy Admin |
| `PATCH`, `DELETE` | `/api/admin/users/[id]` | Admin | Edit atau anonimisasi user lain. Histori task, payment, dan audit dipertahankan. |
| `DELETE` | `/api/users/me/delete` | User terautentikasi non-Admin | Anonimkan data langsung, hapus object private, lalu tutup sesi Auth setelah konfirmasi `HAPUS AKUN`. |
| `GET` | `/api/admin/audit-logs` | Admin | Audit log |
| `GET` | `/api/admin/seed-demo-users` | Admin | Seeder kompatibilitas melalui endpoint Admin |
| `GET` | `/api/debug` | Admin | Informasi debug yang dibatasi Admin |

Route seeder Admin tidak menggantikan `npm run seed` untuk persiapan database demo lengkap.

## Alias kompatibilitas

| Canonical | Alias |
| --- | --- |
| `POST /api/tasks` | `POST /api/booking/task` |
| `POST /api/helpers/apply` | Implementasi diteruskan ke `/api/helper/apply` |
| `GET /api/payments/[task_id]` | Implementasi diteruskan ke `/api/payments/[task_id]/status` |
| Action Helper spesifik | `/api/helpers/[id]/status` meneruskan approve, reject, atau suspend sesuai body |

Client baru sebaiknya memakai path canonical. Alias dipertahankan agar alur lama tidak langsung rusak.

## Error dan perilaku client

| Status | Perilaku client yang diharapkan |
| --- | --- |
| `400` | Tampilkan request malformed tanpa menghapus input user |
| `401` | Arahkan ke login dengan return path yang aman |
| `403` | Tampilkan forbidden, bukan empty state |
| `404` | Tampilkan unavailable atau feature-disabled sesuai konteks |
| `409` | Beri tahu state berubah, refetch resource, dan perbarui aksi |
| `422` | Tampilkan `fieldErrors` di dekat field terkait |
| `500` | Tampilkan retry dan jangan menganggap mutation gagal atau sukses sebelum refetch |

Response gagal yang diharapkan:

```json
{
  "error": "validation_error",
  "message": "Data input tidak valid",
  "fieldErrors": {
    "field": ["Pesan validasi"]
  }
}
```

Tidak semua success response memakai envelope yang sama. Baca schema endpoint sebelum mengakses `data`, `task`, `profile`, atau field domain lain.
