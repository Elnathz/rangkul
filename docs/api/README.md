# Dokumentasi API Rangkul

Dokumentasi ini menjelaskan kontrak antara UI Next.js, Route Handler, dan Supabase. Sumber kebenaran business rule tetap `docs/TDD_Rangkul.md`, terutama §7 untuk endpoint, §8 untuk keamanan, dan §3.14 untuk mode penugasan Sprint 6.

## Dokumen utama

| Dokumen | Kegunaan |
| --- | --- |
| [`../api-contract.md`](../api-contract.md) | Kontrak manusia: actor, payload, response, error, RLS, dan aturan transaksi. |
| [`openapi.json`](openapi.json) | OpenAPI 3.1 yang dapat diimpor ke Postman, Bruno, Insomnia, Scalar, Swagger UI, atau Redoc. |
| [`booking.md`](booking.md) | Booking langsung, Pilih dari Pelamar, Cari Cepat, dan lifecycle task. |
| [`auth.md`](auth.md) | Register dan login. |
| [`helper.md`](helper.md) | Profil, availability, kategori, dan verifikasi Helper. |
| [`lansia.md`](lansia.md) | Profil lansia dan Riwayat Rangkul. |

## Autentikasi dan otorisasi

- Browser memakai sesi Supabase yang disimpan sebagai cookie HTTP-only oleh aplikasi.
- Client non-browser dapat mengirim access token melalui `Authorization: Bearer <token>`.
- Proxy menolak request tanpa sesi. Route handler memeriksa role dan relasi resource. RLS menjadi lapisan terakhir.
- `service_role` tidak boleh dipakai dari browser atau endpoint user biasa.
- Hanya `/api/auth/login`, `/api/auth/register`, dan webhook pembayaran bertanda tangan yang dapat dipanggil tanpa sesi user.

## Format response

Body sukses mengikuti kontrak endpoint. Route baru yang mengembalikan koleksi umumnya memakai field `data`, sedangkan route kompatibilitas dan beberapa mutation lama memakai field domain seperti `task`, `profile`, atau `message`:

```json
{
  "data": []
}
```

Jangan mengasumsikan envelope global yang belum diterapkan oleh kode. Client harus membaca schema endpoint pada OpenAPI atau dokumen domainnya. Error tetap memakai bentuk konsisten di bawah ini.

Response gagal:

```json
{
  "error": "validation_error",
  "message": "Data input tidak valid",
  "fieldErrors": {
    "helper_id": ["Pilih Helper untuk booking langsung"]
  }
}
```

| Status | Makna |
| --- | --- |
| `400` | JSON malformed atau request tidak dapat dibaca. |
| `401` | Sesi tidak ada atau kedaluwarsa. |
| `403` | Role, ownership, atau scope wilayah salah. |
| `404` | Resource tidak tersedia bagi actor, atau feature flag nonaktif. |
| `409` | State berubah, duplicate mutation, atau race condition. |
| `422` | Kombinasi field atau aturan domain tidak valid. |
| `500` | Kegagalan internal yang sudah disanitasi. |

## Inventaris domain

| Domain | Prefix utama | Actor |
| --- | --- | --- |
| Auth | `/api/auth/*` | Publik untuk login/register |
| Profil user | `/api/users/me` | Semua role login |
| Lansia | `/api/lansia/*` | Keluarga pemilik |
| Katalog Helper | `/api/helpers` | Keluarga |
| Profil Helper | `/api/helper/profile`, `/api/helpers/profile/*` | Helper, approval Koordinator sesuai endpoint |
| Koordinator | `/api/koordinator/*` | Koordinator verified dan scope wilayah |
| Task | `/api/tasks/*` | Keluarga, Helper, atau Koordinator sesuai relasi task |
| Payment | `/api/payments/*`, `/api/wallet/*` | Peserta pembayaran, webhook bertanda tangan |
| Pesan | `/api/messages/*` | Peserta task |
| Notifikasi | `/api/notifications/*` | Pemilik notifikasi |
| Darurat | `/api/emergency/*` | Helper task aktif, Keluarga terkait, Koordinator wilayah, atau Admin |
| Laporan dan banding | `/api/reports/*`, `/api/appeals`, `/api/admin/appeals/*` | Actor dan reviewer sesuai scope |
| Admin | `/api/admin/*` | Admin |
| Storage | `/api/storage/*` | Role login dengan validasi folder actor dan tipe dokumen |

## Feature flag Sprint 6

`SPRINT6_MATCHING_ENABLED` default ke `false`.

- Saat `false`, `/booking/new` kembali ke katalog Helper dan endpoint marketplace mengembalikan `404` sebelum side effect.
- Saat `true`, `/booking/new` menawarkan `pelamar` dan `cepat`.
- Booking `langsung` selalu dimulai dari `/booking/{helper_id}` dan payload wajib memiliki `helper_id`.
- Mengaktifkan flag tidak mengurangi pemeriksaan role, RLS, radius, kategori, jadwal, trust tier, atau race condition.

## Memakai OpenAPI

Impor `docs/api/openapi.json` ke tool pilihan. Spesifikasi machine-readable ini berfokus pada autentikasi dasar, task, dan seluruh assignment Sprint 6. Inventaris domain lain tetap dicatat dalam kontrak manusia sampai schema OpenAPI-nya ditambahkan bertahap. Gunakan environment variable berikut di tool tersebut:

```text
baseUrl=http://localhost:3000
accessToken=<access token akun demo>
```

Untuk browser QA, login melalui `/api/auth/login` lebih praktis karena cookie sesi dikelola aplikasi. Jangan menyimpan token, service role key, atau credential production di collection yang di-commit.

## Verifikasi kontrak

```bash
npm run test
```

Contract test memeriksa bahwa OpenAPI dapat diparse, endpoint Sprint 6 terdokumentasi, role Keluarga tercatat pada create task, dan response `409` serta `422` tersedia.
