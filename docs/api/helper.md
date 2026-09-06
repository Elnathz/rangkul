# Helper API

Sumber kebenaran aturan verifikasi, radius, kategori, dan status Helper adalah `docs/TDD_Rangkul.md` §3.3, §7, dan §8.

## Pengajuan profil

`POST /api/helpers/apply` adalah route canonical. `POST /api/helper/apply` tetap tersedia sebagai alias kompatibilitas.

Role: `helper`.

Body memuat:

- `bio`, maksimal 500 karakter.
- `wilayah_domisili` dan struktur wilayah `provinsi`, `kabupaten_kota`, `kecamatan`, `kelurahan`, `rt`, `rw`.
- `domisili_lat`, `domisili_lng`, dan `radius_layanan_km` antara 1 sampai 25 km.
- `ktp_url` serta `foto_wajah_url` sebagai object path storage privat milik actor, bukan URL publik.
- `kategori_ids`, minimal satu ID kategori aktif.
- `koordinator_id` opsional sesuai jalur verifikasi wilayah.

Response sukses `201` mengembalikan `message` dan `helper_profile_id`. Validasi payload menghasilkan `422`; profil aktif yang sudah ada menghasilkan `409`.

## Membaca profil sendiri

`GET /api/helper/profile`

Role: `helper`. Response `200`:

```json
{
  "profile": {
    "id": "uuid",
    "status": "verified",
    "tingkat_kepercayaan": "terpercaya",
    "wilayah_domisili": "Pleburan",
    "radius_layanan_km": 5,
    "is_available": true,
    "helper_service_categories": []
  }
}
```

KTP dan dokumen privat tidak dikembalikan oleh endpoint profil operasional ini.

## Memperbarui profil operasional

`PATCH /api/helper/profile`

Semua field opsional:

```json
{
  "bio": "Mendampingi aktivitas ringan dan percakapan sehari-hari.",
  "is_available": true,
  "wilayah_domisili": "Pleburan",
  "domisili_lat": -7.005,
  "domisili_lng": 110.438,
  "radius_layanan_km": 5,
  "kategori_ids": ["uuid-kategori"]
}
```

- Mengubah `wilayah_domisili` mengembalikan status ke `pending_verification`, mengosongkan `koordinator_id`, dan membutuhkan verifikasi ulang.
- `kategori_ids` hanya menerima kategori aktif.
- `is_available` hanya mengubah kesiapan menerima peluang. Eligibility akhir tetap diperiksa server saat apply, select, atau accept.
- Validation error menghasilkan `422`.

## Review status

`PATCH /api/helpers/{id}/status`

Actor dan action mengikuti scope Koordinator atau Admin yang didefinisikan TDD. Action canonical: `approve`, `reject`, atau `suspend`. Route approve/reject lama hanya alias kompatibilitas.

Keputusan tidak boleh bergantung pada field wilayah yang dikirim browser. Server dan RLS memakai profil actor serta relasi wilayah yang tersimpan.
