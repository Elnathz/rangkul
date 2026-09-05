# Audit Penyelesaian Sprint 6

**Tanggal audit:** 5 September 2026, WIB  
**Status:** Candidate backend dan source QA hijau. Belum release-ready.

## Bukti yang lulus

| Gate | Hasil | Bukti |
| --- | --- | --- |
| Migration cloud | Lulus | `supabase migration list --linked` menunjukkan local dan remote sinkron hingga `20260905110000`. |
| Lint source | Lulus | `npm run lint` exit 0. |
| Typecheck | Lulus | `npm run typecheck` exit 0. |
| Test source | Lulus | `npm run test`: 281 pass, 0 fail, 14 runtime test skip tanpa flag cloud. Total 295 test mencakup klasifikasi seluruh halaman dan route handler, role redirect, dokumentasi OpenAPI, kontrak API, state machine, UI contract, serta fallback Koordinator RT/RW. |
| Matrix runtime cloud | Lulus | `RUN_SUPABASE_INTEGRATION=1 npm run test`: 295 pass, 0 fail, 0 skip. Termasuk RLS, marketplace tereduksi, validasi mode booking, dokumentasi API, withdraw, select atomik, race Cari Cepat, expiry, completion, trust safety, dan inventaris route. |
| Build production | Lulus | `npm run build` selesai dan membangun 96 route App Router. |
| Landing mobile publik | Lulus | Browser in-app pada 375px, 768px, 1024px, dan 1440px tidak menemukan horizontal overflow. Hero memakai satu kolom pada mobile dan kontrol footer pendek memiliki ukuran sentuh 44px. |
| Landing navigation | Lulus | Lima anchor mengikuti urutan cerita. Scroll-spy desktop dan drawer mobile aktif. Escape menutup drawer dan fokus kembali ke tombol pembuka. |
| Booking entry publik | Lulus | Pengunjung diarahkan ke `/login?next=/booking/new`; hanya akun Keluarga memakai return path setelah autentikasi. |
| Authenticated role smoke | Lulus | Persona Keluarga, Helper, Koordinator, dan Admin masuk ke dashboard role yang benar. Empat dashboard tidak overflow pada 375px, 768px, 1024px, dan 1440px. |
| Role route matrix | Lulus | Seluruh 70 halaman diklasifikasikan dari route group. HTTP langsung dengan empat persona membuktikan route canonical tanpa prefix, legacy `/tugas`, dan namespace role mengembalikan `200` untuk role tepat atau `307` ke dashboard aktor untuk role lain. |
| API authentication matrix | Lulus | Seluruh 86 handler diklasifikasikan. Hanya login, register, dan webhook bertanda tangan yang publik. Uji langsung menghasilkan `401` tanpa sesi, `403` lintas role, dan `200` untuk Keluarga, Helper, Koordinator, atau Admin yang tepat. `/api/helper/queue` dikoreksi sebagai endpoint Koordinator dan `/api/debug` kini memakai `requireAdmin`. |
| Dokumentasi API | Lulus | Kontrak manusia, indeks domain, dokumentasi booking/Helper, dan OpenAPI 3.1 tersedia. Test memverifikasi spec dapat diparse, route assignment Sprint 6, role, response `409`/`422`, feature flag, serta link dari README. |
| Runtime repeatability | Lulus | Lima runtime test Sprint 6 dijalankan dua kali berturut-turut tanpa reseed manual dan keduanya lulus 5/5. Hook suite memulihkan fixture shared sebelum dan sesudah test agar race, withdraw, dan selection tidak mencemari run berikutnya. |
| Entry booking Sprint 6 | Lulus lokal | Browser dengan flag lokal aktif hanya menampilkan `Pilih dari Pelamar` dan `Cari Cepat`. `Booking Biasa` tidak lagi dapat membuat task langsung tanpa Helper. Request HTTP sesi Keluarga mengembalikan `422` sesuai TDD untuk mode langsung tanpa `helper_id` dan mode pelamar dengan `helper_id`, sebelum insert. |
| Feature flag deployment | Fail-closed | Pemeriksaan read-only Vercel menunjukkan `SPRINT6_MATCHING_ENABLED` tidak disetel pada Production maupun Preview, sehingga implementasi default-off berlaku. `.env.local` aktif hanya untuk QA lokal. |
| Preview fail-closed smoke | Lulus | Vercel deployment PR #31 berhasil. Landing publik dapat dibuka, login persona Keluarga berhasil, lalu `/booking/new` mengalihkan ke `/cari-helper` saat flag preview belum aktif. Halaman tujuan tidak mengalami horizontal overflow. |
| Katalog feature flag lokal | Lulus | Browser aktual dengan sesi Keluarga membuktikan dua mode Sprint 6 muncul saat flag aktif. Pada proses server terpisah dengan flag dipaksa `false`, kontrol mode dan kedua CTA tidak dirender, sedangkan empty state hanya menawarkan perubahan filter. Escape menutup menu saat flag aktif dan fokus kembali ke trigger. |
| Koordinator wilayah lokal | Lulus | Browser aktual dengan sesi Helper menampilkan tiga Koordinator RT 03 untuk domisili Pleburan RT 03/RW 05 tanpa kandidat RW. Saat RT diubah ke 99, hanya dua Koordinator RW 05 yang tampil sebagai fallback. |
| Cloud demo reseed | Lulus | Target project diverifikasi dari link Supabase, lalu `npm run seed:cloud` menyelesaikan SQL dan sinkronisasi empat asset demo privat. |
| Dependency clean install | Lulus lokal dan CI | `npm ci` lokal berhasil memasang 635 package dari lockfile setelah proses Next.js lama yang mengunci binary native dihentikan. Runner CI sebelumnya juga membuktikan clean install pada PR #31. |
| CI kandidat Sprint 6 | Lulus | PR #31 dari `dev-eln` ke `develop` berstatus mergeable. Workflow `CI Quality Gates` run `33961137858` menyelesaikan clean install, lint, typecheck, test, dan build untuk SHA `33c11e3`. Vercel preview juga berstatus sukses. |

## Hasil verifikasi Sprint 6

- Marketplace mengambil Helper dari sesi, bukan parameter browser, dan tidak memakai service role.
- Projection sebelum assignment tidak mengirim identitas, alamat, koordinat, catatan, foto, atau data kesehatan lansia.
- `select_task_application` menghitung ulang eligibility dan memilih tepat satu pelamar secara atomik.
- `accept_task_assignment` mempertahankan race safety Cari Cepat.
- Expiry membatalkan task belum terisi dan menutup seluruh lamaran pending dalam transaksi yang sama.
- Persona demo tersebar pada Pleburan RW 05 dan Kedungpane. Fixture memakai nama dan email yang mudah dibaca tanpa mengubah password demo.
- Guard lintas peran tidak lagi hanya diuji pada satu URL. Matriks HTTP empat persona mencakup area Keluarga tanpa prefix, Helper canonical dan legacy, Koordinator, Admin, serta endpoint role-spesifik. Pengguna yang salah role kembali ke dashboard miliknya.
- Proxy memakai matcher batas segmen dan daftar role eksplisit. Admin tidak lagi otomatis dapat memasuki workspace Keluarga, Helper, atau Koordinator hanya karena memiliki role Admin.
- Gate final setelah sinkronisasi `develop`: clean install lulus, lint 0 error dengan 54 warning non-blocking, typecheck lulus, 295/295 test cloud lulus tanpa skip, dan build 96 route lulus.
- Pemilihan Koordinator Helper sekarang divalidasi ulang oleh backend terhadap wilayah canonical. Kandidat RT persis mengalahkan fallback RW, dan role selain Helper ditolak endpoint pencarian wilayah.
- Mode Lowongan dan Cari Cepat pada katalog mengikuti feature flag dari server. Saat flag nonaktif, UI tidak menawarkan tautan yang akan langsung dipantulkan kembali oleh guard `/booking/new`.
- Browser preview menemukan lalu menutup celah mode langsung tanpa Helper pada `/booking/new`. Booking langsung tetap melalui `/booking/{helper_id}`; entry umum hanya tersedia ketika feature flag aktif dan hanya menawarkan mode pelamar atau cepat.
- Kegagalan ulang runtime yang sempat muncul dilacak ke fixture shared yang telah termutasi oleh run sebelumnya, bukan ke RPC. Harness diperbaiki untuk reset deterministik dan dibuktikan dengan dua run berurutan tanpa reseed.

## Temuan non-blocking

`npx supabase db lint --linked` melaporkan warning lama: variabel `v_coordinator` tidak dibaca dalam `public.acknowledge_emergency_alert`. Warning ini tidak menyentuh Sprint 6 dan tidak diubah pada cutoff.

## Bloker release dan tindakan selanjutnya

1. Simpan screenshot terbaru, uji zoom 200 persen, dan tuntaskan state error, conflict, retry, serta keyboard path yang belum memiliki evidence browser. Forbidden route dan API sudah memiliki evidence HTTP empat role.
2. Review dan merge PR #31 hanya jika check pada HEAD terbaru tetap hijau.
3. Biarkan `SPRINT6_MATCHING_ENABLED` tetap `false` di production. Aktifkan hanya pada preview untuk dry run mode `pelamar` dan `cepat` setelah gate browser lulus.
4. Production tidak boleh menerima flag `true` sebelum preview flag-on dry run dan smoke production semua role berhasil serta hasilnya ditambahkan ke audit ini.

## Keputusan saat ini

**No-go untuk aktivasi production Sprint 6.** Implementasi, clean install CI, runtime cloud, reseed, browser authenticated, dan preview fail-closed sudah kuat, tetapi visual edge-state evidence, preview flag-on dry run, serta smoke production belum lengkap. Memaksa flag aktif hari ini akan mengabaikan gate yang sudah ditentukan sendiri.
