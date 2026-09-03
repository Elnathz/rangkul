# Completion Audit Mervin, Sprint 4

Tanggal audit: 4 September 2026

Dokumen ini adalah catatan evidence vertical slice milik Mervin. Status `selesai` hanya dipakai untuk scope yang sudah diverifikasi otomatis dan bisa dibuktikan dari kode. Bagian yang masih bergantung migrasi cloud belum boleh dinyatakan selesai.

Referensi kontrak: `docs/planning/sprint4/plan.md` bagian Ownership Mervin serta Task 1, 3, 5, 7, 8.

## Scope Mervin

| Area | Status | Evidence |
| --- | --- | --- |
| Referensi file privat & authorized read (Task 1) | Parsial | Object path, `resolvePrivatePhotoUrl`, `SignedImage`, `useSignedFile`, dan `GET /api/storage/read` dengan scope actor ada. Bucket `dokumen` private di `20260830113500_storage_security.sql`. Test `private-object-path.test.mjs` dan `private-storage-consumers.test.mjs` lulus. Gap: `canAccessPrivateFile` belum mengizinkan Keluarga participant, dan test runtime otorisasi belum ada. |
| Offline evidence (Task 3) | Parsial | IndexedDB store, autosave 800ms, `EvidenceSyncManager` global, retry/cancel, dan submit idempoten via `submit_task_evidence` ada. Gap: `sync_status` server belum ada, `tests/offline-evidence-store.test.mjs` belum ada, dan gerbang `task-evidence-flow.test.mjs` masih gagal karena autosave `setTimeout`. |
| Admin: identity, kategori, statistik, approval Koordinator (Task 5) | Parsial | Route canonical categories dan `admin/koordinator/:id/status`, `koordinator-review.ts` conditional 409, soft delete kategori ada. Gap: guard conditional belum di database, statistik serial, `tests/admin-operations-runtime.test.mjs` belum ada. |
| Pembayaran Saldo Demo (Task 7) | Gagal gate | RPC `charge_task_with_demo_wallet` lengkap (row lock, idempotency, split 90/7/3, audit) di `20260904090002_demo_wallet_payment.sql`, route charge dan halaman top-up ada. Namun migrasi belum diterapkan ke Supabase development sehingga jalur bayar error di runtime. Top-up wallet tidak atomik. |
| Komisi & darurat Koordinator (Task 8) | Parsial | `GET /api/koordinator/commissions` dengan pagination dan halaman komisi ada. Gap: query komisi tidak di-scope ke wilayah Koordinator. |

## Evidence otomatis

Dijalankan dari mesin Mervin pada hasil merge `origin/develop` ke `dev-mervin` (commit `12452e8`):

| Pemeriksaan | Hasil |
| --- | --- |
| `npm run lint` | 0 error (52 warning) |
| `npx tsc --noEmit` | 0 error |
| `npm run build` | Sukses |
| `npm run test` | 187 lulus, 9 skip, 1 gagal (`task-evidence-flow.test.mjs`) |
| Test slice Mervin (7 file yang ada) | 24 lulus, 0 gagal (dijalankan terpisah) |

Catatan test gagal `task-evidence-flow.test.mjs`: bukan karena merge, melainkan gap pre-existing. Halaman lapor memakai autosave `setTimeout` untuk `use-offline-evidence`, sementara gerbang test menegaskan tidak boleh ada `setTimeout`. Perbaikannya bukan menghapus autosave, tapi menyelaraskan gerbang test dengan desain autosave yang benar.

## Status migrasi Mervin pada remote

Ini kunci kenapa Saldo Demo gagal di runtime. Tiga file migration rawan memengaruhi jalur Mervin:

| Migration | Di `dev-mervin` | Di `develop` | Di `main` | Efek bila belum diterapkan |
| --- | --- | --- | --- | --- |
| `20260830113500_storage_security.sql` | Ada | Ada | Tidak | Bucket dokumen belum private di production, referensi file bisa bocor/rusak |
| `20260831160000_keluarga_self_topup.sql` | Ada | Tidak | Tidak | Saldo Demo (wallet/ledger) tidak ada, top-up dan bayar gagal |
| `20260904090002_demo_wallet_payment.sql` | Ada | Tidak | Tidak | RPC `charge_task_with_demo_wallet` tidak ada, bayar fallback error "not in schema cache" |

Vercel deployment memakai branch `main` (`.github/workflows/deploy.yml` baris 4-6). Karena dua migration Saldo Demo belum masuk `main` maupun `develop`, production/cloud tidak pernah menerima skema wallet maupun RPC charge. Ini penyebab langsung error yang ditemukan saat demo: fungsi tidak pernah ada di schema cache PostgREST.

## Evidence UI yang masih perlu dijalankan Mervin

Alur lengkap untuk mengecek tiap slice ada di `docs/planning/sprint4/mervin-demo-runbook.md`. Inti yang harus dibuktikan:

- Jalur pembayaran Saldo Demo Keluarga sampai task terbayar tanpa Midtrans, setelah migrasi diterapkan.
- Keluarga participant dapat membaca evidence privat yang diunggah Helper pada detail kunjungan.
- Draft laporan Helper offline bertahan saat reload, tersinkron otomatis saat kembali online, dan retry tidak menggandakan record.
- Mutation Admin (kategori, approval Koordinator) memakai conditional state dan 409 pada konflik.
- Ringkasan komisi Koordinator hanya menampilkan released payment dalam wilayahnya.

## Batas scope yang masih terbuka Mervin

Tidak boleh dinyatakan selesai sampai langkah berikut tertutup:

1. Terapkan migration `20260831160000` dan `20260904090002` ke Supabase development, lalu regenerate `src/types/database.ts`.
2. Tutup celah authorization Keluarga di `src/lib/storage/private-file-access.ts`.
3. Jadikan top-up wallet atomik dan isi `entry_type` pada ledger.
4. Scope query komisi `src/app/api/koordinator/commissions/route.ts` ke wilayah Koordinator.
5. Tambah test runtime: otorisasi file, offline store, admin operations, komisi scope.
6. Bereskan gerbang `task-evidence-flow.test.mjs`.
7. QA manual lintas viewport dan keyboard untuk seluruh halaman Mervin.

## Risiko residual

- Test runtime memakai Supabase development cloud, tidak membuktikan replay migration pada database production yang benar-benar kosong.
- Status komisi dan jalur pembayaran belum bisa diverifikasi penuh sampai migration diterapkan ke environment demo.
- QA browser hanya dimungkinkan setelah migrasi cloud jalan; kalau belum, semua alur bayar dan komisi akan kembali error yang sama.
