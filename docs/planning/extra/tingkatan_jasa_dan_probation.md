# Planning: Tingkatan Jasa Helper & Perubahan Sistem Terkait

**Tanggal:** 8 Agustus 2026
**Konteks:** Hasil brainstorm diskusi — menambahkan 3 tingkatan jasa (Ringan/Sedang/Berat) ke sistem Rangkul, beserta revisi aturan probation dan fitur apotek terdekat.
**Status:** Draft — perlu integrasi ke TDD_Rangkul.md setelah disetujui.

---

## 1. Ringkasan Keputusan Final

### 1.1 Tingkatan Jasa

Setiap kategori/sub-kategori jasa memiliki **tingkatan** berdasarkan 4 dimensi gabungan:

| Dimensi | Ringan | Sedang | Berat |
|---|---|---|---|
| **Risiko Keselamatan** | Tidak ada risiko fisik | Risiko rendah-sedang | Risiko tinggi (mobilisasi lansia) |
| **Tanggung Jawab Material** | Tidak pegang uang/obat | Pegang uang/obat kecil | Uang besar / obat kritis / dokumen medis |
| **Durasi** | ≤30 menit | 31–60 menit | ≥61 menit |
| **Effort Fisik** | Duduk / ngobrol / digital | Berdiri, berjalan, angkat ringan | Angkat sedang, mobilisasi lansia |

**Prinsip highest-risk-wins**: jika salah satu dimensi bernilai Berat, maka keseluruhan naik ke Berat.

### 1.2 Aturan Probation (Revisi)

- Helper baru yang **baru diverifikasi** Koordinator → `tingkat_kepercayaan = 'probation'`
- Helper `probation` **HANYA boleh mengambil tugas RINGAN**
- Koordinator bisa mem-promosikan Helper ke `terpercaya` melalui **checklist kesiapan**
- Helper `terpercaya` bisa mengambil **semua tingkatan** tugas (Ringan, Sedang, Berat)

### 1.3 Approval Koordinator

- **Tidak ada approval per-transaksi berdasarkan tingkatan**
- Approval Koordinator hanya diperlukan untuk kondisi khusus di §3.3.2 TDD (Helper baru, vakum lama, pernah kena sanksi, kategori `is_high_risk`)
- Tingkatan jasa sendiri **tidak** memicu approval tambahan

### 1.4 Komisi

Tetap seragam: 90% Helper / 7% Platform / 3% Koordinator — tidak berubah berdasarkan tingkatan.

---

## 2. Daftar 13 Sub-Kategori Final

### 🟢 RINGAN — Pendampingan Dasar

| # | Sub-Kategori | Induk | Durasi | Harga | Keterangan |
|---|---|---|---|---|---|
| 1 | Pengingat Obat | — | ≤30 min | Rp25.000 | Datang, ingatkan minum obat, pastikan diminum |
| 2 | Menemani Mengobrol (singkat) | Menemani Mengobrol | ≤30 min | Rp30.000 | Kunjungan singkat, ngobrol, cek keadaan |
| 3 | Bantuan Teknologi (singkat) | Bantuan Teknologi | ≤30 min | Rp25.000 | Video call keluarga, bantu HP sederhana |
| 4 | Bersih-bersih Ringan | Bersih-bersih | ≤30 min | Rp30.000 | Sapu-pel 1 ruangan, cuci piring, rapikan meja |
| 5 | Antar Obat (sangat dekat, ≤1 km) | Antar Obat | ≤20 min | Rp25.000 | Apotek/warung di gang sebelah, jalan kaki |

### 🟡 SEDANG — Pendampingan Aktif

| # | Sub-Kategori | Induk | Durasi | Harga | Keterangan |
|---|---|---|---|---|---|
| 6 | Menemani Mengobrol (lama) | Menemani Mengobrol | 45–60 min | Rp50.000 | Menemani lebih lama, jalan-jalan sekitar rumah |
| 7 | Bantuan Teknologi (lama) | Bantuan Teknologi | 45–60 min | Rp40.000 | Setup perangkat, ajarkan aplikasi, troubleshoot |
| 8 | Antar Obat (sedang, 1–3 km) | Antar Obat | 30–45 min | Rp35.000 | Perlu motor/sepeda, apotek agak jauh |
| 9 | Belanja Kebutuhan (standar) | Belanja Kebutuhan | 45–60 min | Rp40.000 | Belanja harian, pegang uang keluarga |

### 🔴 BERAT — Pendampingan Intensif

| # | Sub-Kategori | Induk | Durasi | Harga | Keterangan |
|---|---|---|---|---|---|
| 10 | Antar Obat (jauh, >3 km) | Antar Obat | 60–90 min | Rp55.000 | Ke faskes/apotek jauh, perlu transportasi |
| 11 | Bersih-bersih Menyeluruh | Bersih-bersih | 60–90 min | Rp70.000 | Bersih beberapa ruangan, kamar mandi, dapur |
| 12 | Kontrol Kesehatan (antar ke faskes) | — | 90–120 min | Rp120.000 | Dampingi lansia ke puskesmas/RS, pulangkan |
| 13 | Belanja Kebutuhan (besar/jauh) | Belanja Kebutuhan | 60–90 min | Rp65.000 | Belanja banyak item, ke pasar/supermarket jauh |

> **Catatan**: Semua data sub-kategori, harga, dan tingkatan **harus bisa dikelola Admin** melalui panel admin (CRUD). Data di atas hanya sebagai seed awal.

---

## 3. Perubahan Database

### 3.1 ALTER tabel `service_categories`

```sql
-- Tambah kolom tingkat, parent_id, dan jarak untuk sub-kategori
ALTER TABLE public.service_categories
    ADD COLUMN tingkat TEXT NOT NULL DEFAULT 'ringan'
        CHECK (tingkat IN ('ringan', 'sedang', 'berat')),
    ADD COLUMN parent_id UUID REFERENCES public.service_categories(id) DEFAULT NULL,
    ADD COLUMN jarak_min_km NUMERIC DEFAULT NULL,
    ADD COLUMN jarak_max_km NUMERIC DEFAULT NULL;

-- Hapus constraint UNIQUE lama pada nama (karena sub-kategori bisa punya nama mirip)
ALTER TABLE public.service_categories DROP CONSTRAINT IF EXISTS service_categories_nama_key;

-- Tambah constraint UNIQUE baru pada (nama, parent_id) untuk mencegah duplikasi
-- dalam satu parent yang sama
ALTER TABLE public.service_categories
    ADD CONSTRAINT service_categories_nama_parent_unique UNIQUE (nama, parent_id);
```

### 3.2 ALTER tabel `helper_profiles`

```sql
-- Metadata promosi dari probation ke terpercaya
ALTER TABLE public.helper_profiles
    ADD COLUMN promoted_at TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN promoted_by UUID REFERENCES public.koordinator_profiles(id) DEFAULT NULL;
```

### 3.3 Tabel baru: `promotion_checklist`

```sql
-- Checklist yang harus dipenuhi Koordinator sebelum promosikan Helper
CREATE TABLE public.promotion_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    helper_id UUID NOT NULL REFERENCES public.helper_profiles(id) ON DELETE CASCADE,
    koordinator_id UUID NOT NULL REFERENCES public.koordinator_profiles(id),
    -- Checklist items
    identitas_valid BOOLEAN NOT NULL DEFAULT FALSE,
    dikenal_warga BOOLEAN NOT NULL DEFAULT FALSE,
    wawancara_dilakukan BOOLEAN NOT NULL DEFAULT FALSE,
    catatan_koordinator TEXT,
    -- Metadata
    completed_at TIMESTAMPTZ DEFAULT NULL, -- NULL = belum selesai
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.promotion_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Koordinator can manage promotion checklist"
    ON public.promotion_checklist
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.koordinator_profiles
            WHERE id = koordinator_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admin can manage all checklists"
    ON public.promotion_checklist
    FOR ALL USING (public.is_admin());
```

### 3.4 Struktur Data Sub-Kategori (Tree)

```
├── Antar Obat (parent, is_active=false, tidak bisa dibooking langsung)
│   ├── Antar Obat (dekat ≤1km)    → tingkat=ringan, harga=25000, jarak_max_km=1
│   ├── Antar Obat (sedang 1-3km)  → tingkat=sedang, harga=35000, jarak_min_km=1, jarak_max_km=3
│   └── Antar Obat (jauh >3km)     → tingkat=berat,  harga=55000, jarak_min_km=3
│
├── Bersih-bersih (parent, is_active=false)
│   ├── Bersih-bersih Ringan       → tingkat=ringan, harga=30000
│   └── Bersih-bersih Menyeluruh   → tingkat=berat,  harga=70000
│
├── Menemani Mengobrol (parent, is_active=false)
│   ├── Mengobrol (singkat)        → tingkat=ringan, harga=30000
│   └── Mengobrol (lama)           → tingkat=sedang, harga=50000
│
├── Bantuan Teknologi (parent, is_active=false)
│   ├── Bantuan Tekno (singkat)    → tingkat=ringan, harga=25000
│   └── Bantuan Tekno (lama)       → tingkat=sedang, harga=40000
│
├── Belanja Kebutuhan (parent, is_active=false)
│   ├── Belanja (standar)          → tingkat=sedang, harga=40000
│   └── Belanja (besar/jauh)       → tingkat=berat,  harga=65000
│
├── Pengingat Obat                 → tingkat=ringan, harga=25000 (leaf, tanpa parent)
│
└── Kontrol Kesehatan              → tingkat=berat,  harga=120000, is_high_risk=true (leaf)
```

Parent categories memiliki `is_active = false` sehingga **tidak bisa di-booking langsung** — Keluarga harus memilih sub-kategori spesifik.

---

## 4. Perubahan API

### 4.1 GET /api/service-categories

Response berubah menyertakan `tingkat`, `parent_id`, dan kolom jarak:

```json
{
  "data": [
    {
      "id": "...",
      "nama": "Antar Obat (dekat ≤1km)",
      "tingkat": "ringan",
      "parent_id": "uuid-parent-antar-obat",
      "parent_nama": "Antar Obat",
      "harga_dasar": 25000,
      "estimasi_durasi_menit": 20,
      "jarak_min_km": null,
      "jarak_max_km": 1,
      "is_high_risk": false,
      "is_active": true
    }
  ]
}
```

### 4.2 POST /api/booking (saat booking dibuat)

Backend harus **enforce** aturan tingkatan:

```
1. Ambil tingkat dari service_category yang dipilih
2. Ambil tingkat_kepercayaan dari helper yang dipilih
3. IF helper.tingkat_kepercayaan == 'probation' AND kategori.tingkat != 'ringan':
     → REJECT: "Helper probation hanya boleh mengambil tugas ringan."
4. IF helper.tingkat_kepercayaan == 'terpercaya':
     → ALLOW semua tingkatan
```

### 4.3 POST /api/koordinator/helpers/:id/promote

Endpoint baru untuk promosikan Helper dari probation ke terpercaya:

```
Request:
{
  "identitas_valid": true,
  "dikenal_warga": true,
  "wawancara_dilakukan": true,
  "catatan_koordinator": "Andi dikenal baik di RT, sudah wawancara 2x"
}

Validasi:
- Semua 3 checklist harus `true`
- Hanya Koordinator wilayah helper yang bisa promosi

Effect:
- INSERT promotion_checklist (completed_at = NOW())
- UPDATE helper_profiles SET tingkat_kepercayaan = 'terpercaya', promoted_at = NOW(), promoted_by = koordinator_id
```

### 4.4 CRUD /api/admin/service-categories

Admin harus bisa mengelola seluruh sub-kategori:

```
GET    /api/admin/service-categories       — List semua (termasuk parent dan children)
POST   /api/admin/service-categories       — Tambah kategori/sub-kategori baru
PUT    /api/admin/service-categories/:id   — Edit nama, harga, durasi, tingkat, dll
DELETE /api/admin/service-categories/:id   — Soft delete (is_active = false)
```

---

## 5. Perubahan Frontend

### 5.1 Halaman Booking (Keluarga)

- Tampilkan kategori dalam **3 tab atau accordion** berdasarkan tingkatan (Ringan/Sedang/Berat)
- Untuk "Antar Obat": tampilkan daftar apotek terdekat + jarak → sistem otomatis pilih sub-kategori sesuai jarak
- Badge warna per tingkatan: 🟢 hijau, 🟡 kuning, 🔴 merah

### 5.2 Job Board (Helper)

- Filter tugas berdasarkan tingkatan
- Helper `probation` hanya melihat tugas 🟢 Ringan
- Helper `terpercaya` melihat semua tugas

### 5.3 Dashboard Koordinator

- Tombol "Promosikan Helper" di detail profil Helper
- Modal checklist (3 item wajib + catatan opsional)
- Setelah submit → Helper otomatis naik ke `terpercaya`

### 5.4 Panel Admin — Kelola Kategori

- CRUD penuh untuk semua kategori dan sub-kategori
- Bisa ubah harga, durasi, tingkatan, threshold jarak
- Bisa tambah/hapus sub-kategori baru
- Toggle `is_active` untuk enable/disable tanpa hapus permanen

---

## 6. Fitur Apotek Terdekat

### 6.1 Fase 1 (MVP)

- Saat Keluarga pilih "Antar Obat", tampilkan daftar apotek terdekat dari koordinat rumah lansia
- Sumber data: **OpenStreetMap Nominatim / Overpass API** (gratis, open data)
- Query: `amenity=pharmacy` dalam radius tertentu dari `lansia_profiles.lat, lansia_profiles.lng`
- Tampilkan: nama apotek, jarak (haversine), otomatis hitung tingkatan + harga

### 6.2 Fase 2 (Pasca-MVP — Kerjasama Apotek)

- Apotek bisa mendaftar sebagai mitra Rangkul
- Badge "Mitra Rangkul" ✅ di daftar pencarian
- Apotek mitra diprioritaskan di daftar
- Bisa menampilkan stok obat tertentu
- Model bisnis: komisi kecil per transaksi via apotek mitra

> Fase 2 di luar scope sprint saat ini — dokumentasi saja untuk planning ke depan.

---

## 7. Seed Data (Revisi)

Menggantikan seed service_categories yang lama (7 flat) dengan 13 sub-kategori baru:

```sql
-- Hapus data lama
DELETE FROM public.helper_service_categories;
DELETE FROM public.service_categories;

-- Insert parent categories (is_active = false, tidak bisa dibooking langsung)
INSERT INTO public.service_categories (id, nama, deskripsi, estimasi_durasi_menit, harga_dasar, is_high_risk, is_active, tingkat)
VALUES
    ('p0000001-0000-0000-0000-000000000001', 'Antar Obat', 'Mengambil dan mengantarkan obat ke rumah lansia', 30, 35000, FALSE, FALSE, 'sedang'),
    ('p0000002-0000-0000-0000-000000000002', 'Bersih-bersih', 'Membantu membersihkan rumah lansia', 60, 50000, FALSE, FALSE, 'sedang'),
    ('p0000003-0000-0000-0000-000000000003', 'Menemani Mengobrol', 'Mendampingi lansia mengobrol dan beraktivitas ringan', 45, 40000, FALSE, FALSE, 'ringan'),
    ('p0000004-0000-0000-0000-000000000004', 'Bantuan Teknologi', 'Membantu lansia mengoperasikan perangkat digital', 45, 30000, FALSE, FALSE, 'ringan'),
    ('p0000005-0000-0000-0000-000000000005', 'Belanja Kebutuhan', 'Membantu membelikan kebutuhan harian lansia', 60, 40000, FALSE, FALSE, 'sedang');

-- Insert leaf categories RINGAN
INSERT INTO public.service_categories (id, nama, deskripsi, estimasi_durasi_menit, harga_dasar, is_high_risk, is_active, tingkat, parent_id, jarak_min_km, jarak_max_km)
VALUES
    ('c0000001-0000-0000-0000-000000000001', 'Pengingat Obat', 'Kunjungan singkat untuk memandu dan memastikan lansia meminum obat tepat dosis & waktu.', 30, 25000, FALSE, TRUE, 'ringan', NULL, NULL, NULL),
    ('c0000002-0000-0000-0000-000000000002', 'Menemani Mengobrol (singkat)', 'Kunjungan singkat, ngobrol, cek keadaan umum lansia.', 30, 30000, FALSE, TRUE, 'ringan', 'p0000003-0000-0000-0000-000000000003', NULL, NULL),
    ('c0000003-0000-0000-0000-000000000003', 'Bantuan Teknologi (singkat)', 'Bantu video call keluarga, operasikan HP sederhana.', 30, 25000, FALSE, TRUE, 'ringan', 'p0000004-0000-0000-0000-000000000004', NULL, NULL),
    ('c0000004-0000-0000-0000-000000000004', 'Bersih-bersih Ringan', 'Sapu-pel 1 ruangan, cuci piring, rapikan meja.', 30, 30000, FALSE, TRUE, 'ringan', 'p0000002-0000-0000-0000-000000000002', NULL, NULL),
    ('c0000005-0000-0000-0000-000000000005', 'Antar Obat (dekat, ≤1 km)', 'Ambil obat di apotek/warung dekat, jalan kaki.', 20, 25000, FALSE, TRUE, 'ringan', 'p0000001-0000-0000-0000-000000000001', NULL, 1);

-- Insert leaf categories SEDANG
INSERT INTO public.service_categories (id, nama, deskripsi, estimasi_durasi_menit, harga_dasar, is_high_risk, is_active, tingkat, parent_id, jarak_min_km, jarak_max_km)
VALUES
    ('c0000006-0000-0000-0000-000000000006', 'Menemani Mengobrol (lama)', 'Menemani lebih lama, jalan-jalan di sekitar rumah.', 60, 50000, FALSE, TRUE, 'sedang', 'p0000003-0000-0000-0000-000000000003', NULL, NULL),
    ('c0000007-0000-0000-0000-000000000007', 'Bantuan Teknologi (lama)', 'Setup perangkat, ajarkan aplikasi, troubleshoot.', 45, 40000, FALSE, TRUE, 'sedang', 'p0000004-0000-0000-0000-000000000004', NULL, NULL),
    ('c0000008-0000-0000-0000-000000000008', 'Antar Obat (sedang, 1–3 km)', 'Perlu motor/sepeda, apotek agak jauh.', 45, 35000, FALSE, TRUE, 'sedang', 'p0000001-0000-0000-0000-000000000001', 1, 3),
    ('c0000009-0000-0000-0000-000000000009', 'Belanja Kebutuhan (standar)', 'Belanja harian ke warung/minimarket, pegang uang keluarga.', 60, 40000, FALSE, TRUE, 'sedang', 'p0000005-0000-0000-0000-000000000005', NULL, NULL);

-- Insert leaf categories BERAT
INSERT INTO public.service_categories (id, nama, deskripsi, estimasi_durasi_menit, harga_dasar, is_high_risk, is_active, tingkat, parent_id, jarak_min_km, jarak_max_km)
VALUES
    ('c0000010-0000-0000-0000-000000000010', 'Antar Obat (jauh, >3 km)', 'Ke faskes/apotek jauh, perlu transportasi.', 90, 55000, FALSE, TRUE, 'berat', 'p0000001-0000-0000-0000-000000000001', 3, NULL),
    ('c0000011-0000-0000-0000-000000000011', 'Bersih-bersih Menyeluruh', 'Bersih beberapa ruangan, kamar mandi, dapur.', 90, 70000, FALSE, TRUE, 'berat', 'p0000002-0000-0000-0000-000000000002', NULL, NULL),
    ('c0000012-0000-0000-0000-000000000012', 'Kontrol Kesehatan (antar ke faskes)', 'Mendampingi lansia perjalanan pergi & pulang ke klinik/RS.', 120, 120000, TRUE, TRUE, 'berat', NULL, NULL, NULL),
    ('c0000013-0000-0000-0000-000000000013', 'Belanja Kebutuhan (besar/jauh)', 'Belanja banyak item, ke pasar/supermarket jauh.', 90, 65000, FALSE, TRUE, 'berat', 'p0000005-0000-0000-0000-000000000005', NULL, NULL);
```

---

## 8. Perubahan yang Harus Diterapkan ke TDD

Setelah planning ini disetujui, perlu update bagian berikut di `docs/TDD_Rangkul.md`:

| Bagian TDD | Perubahan |
|---|---|
| §3.3.3 Tingkat Kepercayaan | Probation hanya boleh tugas Ringan, bukan ditahan penuh. Promosi via checklist Koordinator. |
| §3.4.1 Model Harga | Kategori dipecah jadi sub-kategori dengan parent-child. |
| §6 service_categories | Tambah kolom `tingkat`, `parent_id`, `jarak_min_km`, `jarak_max_km`. Seed data berubah. |
| §6 helper_profiles | Tambah `promoted_at`, `promoted_by`. |
| §6 (tabel baru) | Tambah `promotion_checklist`. |
| §7 API Design | Tambah endpoint promosi + CRUD admin kategori. |
| §9 Rute Halaman | UI booking berubah, job board Helper berubah. |

---

## 9. Checklist Implementasi (Urutan Pengerjaan)

- [ ] Migration: ALTER `service_categories` (tambah `tingkat`, `parent_id`, `jarak_min_km`, `jarak_max_km`)
- [ ] Migration: ALTER `helper_profiles` (tambah `promoted_at`, `promoted_by`)
- [ ] Migration: CREATE `promotion_checklist`
- [ ] Migration: Seed data baru (13 sub-kategori)
- [ ] Backend: Update validasi booking — enforce aturan probation + tingkatan
- [ ] Backend: Endpoint `POST /api/koordinator/helpers/:id/promote`
- [ ] Backend: CRUD Admin service-categories
- [ ] Frontend: UI booking dengan tab/accordion per tingkatan
- [ ] Frontend: Job board Helper — filter berdasarkan tingkatan
- [ ] Frontend: Dashboard Koordinator — modal promosi dengan checklist
- [ ] Frontend: Panel Admin — kelola kategori
- [ ] Update `docs/TDD_Rangkul.md`
