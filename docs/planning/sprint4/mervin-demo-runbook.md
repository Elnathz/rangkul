# Runbook Demo Mervin, Sprint 4

## Prasyarat

1. Pastikan target linked adalah development project `mtgzucflujmqrslryfsc`.
2. Terapkan migration Mervin yang belum ada di cloud dan yang belum masuk `develop`/`main`, karena Vercel deploy dari `main`:

   ```text
   # pastikan migration sudah ada di develop lalu push ke remote
   git push origin develop

   # lihat status migration lokal vs remote
   npx supabase migration list --linked

   # terapkan migration yang belum ada ke Supabase development
   npx supabase db push
   ```

   Migration yang wajib ada: `20260831160000_keluarga_self_topup.sql` dan `20260904090002_demo_wallet_payment.sql`. Tanpa ini Saldo Demo dan komisi tidak bisa didemokan.
3. Jalankan seed: `SUPABASE_DEMO_PROJECT_REF=mtgzucflujmqrslryfsc npm run seed:cloud`.
4. Jalankan aplikasi dengan `npm run dev`.

## Akun demo

Akun berasal dari `supabase/seed.sql`. Email aktif sesuai profil demo (bukan `@rangkul.id`), gunakan akun yang sama dengan runbook sebelumnya bila password sudah diketahui.

| Peran       | Marker seed                                 | Alur yang dibuktikan                                                        |
| ----------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| Keluarga    | `mbakburgas` (demokeluarga@rangkul.id)    | Bayar task dengan Saldo Demo, lihat sisa saldo dan status payment.          |
| Helper      | `masburgas` (demohelper@rangkul.id)       | Isi laporan offline, reload, sinkron saat online, retry tidak menggandakan. |
| Koordinator | `mbahburgas` (demokoordinator@rangkul.id) | Lihat ringkasan komisi hanya untuk released payment wilayahnya.             |
| Admin       | `demoadmin` (demoadmin@rangkul.id)        | Kelola kategori, approval Koordinator conditional, audit log.               |

## Alur pengecekan per slice Mervin

### Alur 1: Pembayaran Saldo Demo (Task 7) - Blocker P0

Sudah terkunci di database sebelum alur ini:

```text
npx supabase migration list --linked   # harus memuat 20260904090002
```

1. Login sebagai Keluarga `mbakburgas`.
2. Buka halaman saldo demo, tambahkan saldo via top-up. Pastikan ledger tercatat dan saldo bertambah.
3. Pesan dan konfirmasi satu task Layanan Rangkul.
4. Buka detail task dan pilih bayar dengan Saldo Demo.
5. Harapan: task menjadi berbayar, status payment `held_escrow`, saldo tersisa berkurang, dan tidak ada error "function ... not in schema cache".
6. Tekan bayar ulang dengan idempotency key yang sama. Harapan: tidak terjadi debit ganda, payment pertama dikembalikan.

Verifikasi atomik top-up (saat ini belum atomik):

- Cek `demo_wallet_ledger` punya satu baris `entry_type='topup'` per top-up. Bila rincian saldo bertambah tanpa baris ledger, top-up belum atomik dan perlu diperbaiki.

### Alur 2: Evidence privat dibaca Keluarga (Task 1) - Blocker P0

1. Login sebagai Helper `masburgas`, selesaikan satu task dan unggah foto bukti.
2. Login sebagai Keluarga `mbakburgas` yang memesan task tersebut, buka detail kunjungan.
3. Harapan: foto bukti tampil (re-sign berhasil). Bila ditolak `403`, celah authorization Keluarga di `src/lib/storage/private-file-access.ts` belum ditutup.
4. Login sebagai Keluarga lain yang bukan participant. Harapan: tidak bisa membaca bukti milik task itu.
5. Refresh lebih dari satu jam lalu buka lagi. Harapan: foto tetap tampil lewat re-sign, bukan URL yang kedaluwarsa.

### Alur 3: Offline evidence (Task 3)

Gerbang otomatis dulu:

```text
npm test   # task-evidence-flow harus berhenti gagal, atau diselaraskan ke autosave
```

1. Login sebagai Helper `masburgas`, buka halaman lapor task.
2. Nyalakan DevTools dan set offline sebelum mengisi form.
3. Pilih foto, isi kelima skor dan Cerita Hari Ini, lalu reload.
4. Harapan: draft dan foto masih ada setelah reload (IndexedDB).
5. Kembali online dari halaman Helper lain. Harapan: draft tersinkron otomatis via `EvidenceSyncManager`.
6. Selesaikan task, lalu retry beberapa kali.
7. Harapan: hanya ada satu `task_evidence` dan satu `health_snapshot` (tidak menggandakan), dan status tidak menampilkan sukses palsu saat upload gagal.

### Alur 4: Admin operations (Task 5)

1. Login sebagai Admin `demoadmin`.
2. Buat dan nonaktifkan satu kategori. Harapan: kategori yang masih dipakai task aktif tidak bisa dihapus (409), dan prefer memakai `is_active=false`.
3. Buka antrean pengajuan Koordinator, approve lalu tolak dua Koordinator berbeda. Harapan: keputusan menulis reason, reviewer, timestamp, dan audit.
4. Dari dua tab/dua Admin, setujui Koordinator yang sama bersamaan. Harapan: satu sukses, satu `409` (conditional state).
5. Buka dashboard. Harapan: angka GMV hanya dari payment released dan tidak berubah jadi nol saat API panel gagal.

### Alur 5: Komisi Koordinator (Task 8)

1. Terapkan migrasi dan pastikan ada task sudah `released`.
2. Login sebagai Koordinator `mbahburgas` (wilayah tertentu).
3. Buka halaman komisi.
4. Harapan: angka total hanya mencakup released payment task dalam wilayah Koordinator tersebut, tidak menampilkan komisi Koordinator wilayah lain.

## Skenario keamanan khusus Mervin

1. Keluarga non-participant tidak dapat membaca bukti evidence task yang bukan miliknya.
2. Koordinator hanya melihat komisi wilayahnya sendiri.
3. Retry sync offline tidak menggandakan `task_evidence` maupun `health_snapshot`.
4. Top-up Saldo Demo menulis ledger dan saldo secara konsisten (setelah diperbaiki menjadi atomik).

## Bukti otomatis sebelum demo

```text
RUN_SUPABASE_INTEGRATION=1 npm run test
SUPABASE_DEMO_PROJECT_REF=mtgzucflujmqrslryfsc npm run seed:cloud
SUPABASE_DEMO_PROJECT_REF=mtgzucflujmqrslryfsc npm run seed:cloud
npx supabase migration list --linked
```

## Batas runbook

- Runbook ini mengecek bagian milik Mervin. Riwayat, trust tier, safety, dan RLS milik Farros ada di `farros-demo-runbook.md`.
- Sampai migration Saldo Demo diterapkan ke development dan masuk `main`, Alur 1 dan Alur 5 tidak dapat diverifikasi (akan kembali error "not in schema cache").
