# Audit Penyelesaian Sprint 6

**Tanggal audit:** 5 September 2026, WIB  
**Status:** Candidate backend dan source QA hijau. Belum release-ready.

## Bukti yang lulus

| Gate | Hasil | Bukti |
| --- | --- | --- |
| Migration cloud | Lulus | `supabase migration list --linked` menunjukkan local dan remote sinkron hingga `20260905110000`. |
| Lint source | Lulus | `npm run lint` exit 0. |
| Typecheck | Lulus | `npm run typecheck` exit 0. |
| Test source | Lulus | `npm run test`: 249 pass, 0 fail, 14 runtime test sengaja skip tanpa env cloud. |
| Matrix runtime cloud | Lulus | `RUN_SUPABASE_INTEGRATION=1 npm run test`: 263 pass, 0 fail, 0 skip. Termasuk RLS, marketplace tereduksi, withdraw, select atomik, race Cari Cepat, dan expiry. |
| Build production | Lulus | `npm run build` selesai dan menghasilkan `.next/BUILD_ID`. |
| Landing mobile publik | Lulus | Browser in-app pada 375px, 768px, 1024px, dan 1440px tidak menemukan horizontal overflow. Hero memakai satu kolom pada mobile dan kontrol footer pendek memiliki ukuran sentuh 44px. |

## Hasil verifikasi Sprint 6

- Marketplace mengambil Helper dari sesi, bukan parameter browser, dan tidak memakai service role.
- Projection sebelum assignment tidak mengirim identitas, alamat, koordinat, catatan, foto, atau data kesehatan lansia.
- `select_task_application` menghitung ulang eligibility dan memilih tepat satu pelamar secara atomik.
- `accept_task_assignment` mempertahankan race safety Cari Cepat.
- Expiry membatalkan task belum terisi dan menutup seluruh lamaran pending dalam transaksi yang sama.
- Persona demo tersebar pada Pleburan RW 05 dan Kedungpane. Fixture memakai nama dan email yang mudah dibaca tanpa mengubah password demo.

## Temuan non-blocking

`npx supabase db lint --linked` melaporkan warning lama: variabel `v_coordinator` tidak dibaca dalam `public.acknowledge_emergency_alert`. Warning ini tidak menyentuh Sprint 6 dan tidak diubah pada cutoff.

## Bloker release dan tindakan selanjutnya

1. Pulihkan dua environment variable target demo yang sengaja diwajibkan script seed, lalu jalankan `npm run seed:cloud` untuk mengembalikan data setelah runtime matrix.
2. Dengan persetujuan untuk memasukkan kredensial demo di localhost, jalankan walkthrough browser Keluarga, Helper, Koordinator, dan Admin pada 375px, 768px, 1024px, dan 1440px. Catat loading, empty, error, forbidden, conflict, keyboard, serta zoom 200%.
3. Biarkan `SPRINT6_MATCHING_ENABLED` tetap `false` di production. Aktifkan hanya pada preview untuk dry run setelah dua gate di atas lulus.
4. Production tidak boleh menerima flag `true` sebelum smoke test semua role berhasil dan hasilnya ditambahkan ke audit ini.

## Keputusan saat ini

**No-go untuk aktivasi production Sprint 6.** Implementasi dan gate source/cloud sudah kuat, tetapi evidence reseed final, browser authenticated, dan deployment flag belum lengkap. Memaksa flag aktif hari ini akan mengabaikan gate yang sudah ditentukan sendiri.
