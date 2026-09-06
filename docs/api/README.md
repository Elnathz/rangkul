# Dokumentasi API Rangkul

Dokumentasi ini menjelaskan kontrak antara UI Next.js, Route Handler, dan Supabase. Sumber kebenaran business rule tetap `docs/TDD_Rangkul.md`, terutama §7 untuk endpoint, §8 untuk keamanan, dan §3.14 untuk mode penugasan Sprint 6.

## Dokumen utama

| Dokumen | Kegunaan |
| --- | --- |
| [`../api-contract.md`](../api-contract.md) | Kontrak manusia: actor, payload, response, error, RLS, dan aturan transaksi. |
| [`openapi.json`](openapi.json) | OpenAPI 3.1 yang dapat diimpor ke Postman, Bruno, Insomnia, Scalar, Swagger UI, atau Redoc. |
| [`endpoints.md`](endpoints.md) | Inventaris route handler aktual, method, actor, alias, dan tanggung jawab. |
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

## Quick start lokal

Base URL:

```text
http://localhost:3000/api
```

Login dengan username:

```bash
curl --request POST http://localhost:3000/api/auth/login \
  --header "Content-Type: application/json" \
  --data '{"identifier":"ratnakeluarga","password":"Rangkul2026*"}'
```

Login dengan email:

```bash
curl --request POST http://localhost:3000/api/auth/login \
  --header "Content-Type: application/json" \
  --data '{"identifier":"ratnakeluarga@rangkul.id","password":"Rangkul2026*"}'
```

Browser menyimpan sesi melalui cookie aplikasi. Client non-browser dapat memakai access token user:

```bash
curl http://localhost:3000/api/users/me \
  --header "Authorization: Bearer <access-token-user>"
```

Jangan memakai `SUPABASE_SERVICE_ROLE_KEY` sebagai Bearer token client.

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

Daftar path dan method lengkap tersedia pada [`endpoints.md`](endpoints.md). Inventaris tersebut berasal dari route handler di source, sedangkan OpenAPI menyediakan schema machine-readable untuk endpoint prioritas.

## Feature flag mode penugasan fleksibel

`FLEXIBLE_ASSIGNMENT_ENABLED` default ke `false`.

- Saat `false`, `/booking/new` tetap dapat dibuka oleh Keluarga dan menampilkan langkah memilih Helper dari katalog. Endpoint marketplace dan mutation mode fleksibel mengembalikan `404` sebelum side effect.
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

### Pilihan tool tanpa Postman

- **Bruno** untuk collection berbasis file yang mudah direview di Git.
- **Insomnia** untuk eksplorasi request dan environment secara visual.
- **Scalar** atau **Swagger UI** untuk merender `openapi.json`.
- **Redoc** untuk dokumentasi baca yang fokus pada schema.
- **curl** untuk reproduksi minimal di terminal dan CI.

Postman tidak wajib. OpenAPI lebih portabel karena dapat diimpor ke beberapa tool tanpa mengunci dokumentasi pada satu vendor.

## Verifikasi kontrak

```bash
npm run test
```

Contract test memeriksa bahwa OpenAPI dapat diparse, endpoint Sprint 6 terdokumentasi, role Keluarga tercatat pada create task, dan response `409` serta `422` tersedia.

Sebelum mengubah kontrak, cocokkan method, path, request, success response, error response, actor, seed example, TDD, dan RLS. Perubahan schema database harus memakai migrasi dan memperbarui tipe, bukan menghapus payload dari route.
