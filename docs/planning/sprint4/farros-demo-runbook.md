# Runbook Demo Sprint 4 Farros

## Prasyarat

1. Pastikan target linked adalah development project `mtgzucflujmqrslryfsc`.
2. Jalankan `SUPABASE_DEMO_PROJECT_REF=mtgzucflujmqrslryfsc npm run seed:cloud`.
3. Jalankan aplikasi dengan `npm run dev`.

## Akun dan alur utama

| Peran | Akun | Alur yang dibuktikan |
| --- | --- | --- |
| Keluarga | `mbakburgas@gmail.com` | Buka lansia Giorno, buka Riwayat Rangkul, lihat timeline dan lima tren. Coba membuka lansia milik akun lain untuk memastikan akses tidak terbuka. |
| Helper terpercaya | `masburgas@gmail.com` | Lihat profil verified, task yang relevan, dan bukti kunjungan setelah task menjadi participant. |
| Koordinator | `mbahburgas@gmail.com` | Buka antrean persetujuan dan laporan pada scope wilayah. Pastikan kesalahan request tampil sebagai error, bukan seolah profil belum diajukan. |
| Admin | akun marker Admin seed | Buka Helper, fallback, laporan, dan banding. Coba fallback pada wilayah dengan Koordinator aktif untuk melihat conflict yang benar. |

## Skenario keamanan yang harus ditunjukkan

1. Keluarga A tidak dapat membaca lansia, bukti, snapshot, task, atau payment Keluarga B.
2. Helper tidak dapat menerima task saat `under_review`.
3. Koordinator RT tidak dapat membaca Helper atau task di RT lain. Koordinator RW hanya melihat scope RW.
4. Dua laporan formal membawa Helper ke `under_review`, bukan langsung suspend.
5. Satu banding pending tidak dapat diduplikasi.

## Bukti otomatis sebelum demo

```text
RUN_SUPABASE_INTEGRATION=1 npm run test
SUPABASE_DEMO_PROJECT_REF=mtgzucflujmqrslryfsc npm run seed:cloud
SUPABASE_DEMO_PROJECT_REF=mtgzucflujmqrslryfsc npm run seed:cloud
npx supabase migration list --linked
```

## Batas runbook

Runbook ini tidak mencakup Saldo Demo dan komisi Koordinator karena kedua
vertical slice tersebut milik Mervin dan belum diverifikasi dalam audit Farros.
