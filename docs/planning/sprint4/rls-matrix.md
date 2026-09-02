# Matriks RLS Sprint 4

Dokumen ini mencatat kontrak akses setelah migrasi `20260828170000_close_broad_user_and_sensitive_policies.sql` dan `20260828171000_scope_coordinator_task_reads.sql`. Allow berarti row dapat dibaca atau diubah hanya bila kondisi pada kolom Scope terpenuhi. Deny berarti query mengembalikan nol row atau mutation ditolak policy.

## Actor dan resource

| Actor | Resource dan aksi | Keputusan | Scope | Evidence otomatis |
| --- | --- | --- | --- | --- |
| Keluarga | `users` select | Allow diri sendiri, deny keluarga lain | `users.id = auth.uid()` | `Family A tidak dapat membaca row user Family B` |
| Keluarga | `lansia_profiles` select/mutate | Allow milik sendiri | `keluarga_id = auth.uid()` | `RLS keluarga hanya mengembalikan lansia miliknya sendiri` |
| Keluarga | task, evidence, snapshot, payment select | Allow resource task milik sendiri | participant melalui `tasks.keluarga_id` | `Family A tidak dapat membaca lansia, task, evidence, snapshot, atau payment keluarga lain` |
| Helper | profil Helper select | Allow profil sendiri | `helper_profiles.user_id = auth.uid()` | `Helper hanya membaca lansia setelah menjadi participant task` dan audit policy migration |
| Helper | task select langsung | Allow task assigned, deny marketplace row penuh | `tasks.helper_id` menunjuk profil actor | `Helper hanya membaca lansia setelah menjadi participant task` |
| Helper | task marketplace melalui route | Allow projection terbatas | tanpa nama, alamat rinci, catatan, foto, dan koordinat lansia | `task marketplace tidak membuka identitas, alamat, catatan, foto, atau koordinat lansia` |
| Helper | lansia select | Allow setelah pernah menjadi participant task | task assigned ke profil actor | `Helper hanya membaca lansia setelah menjadi participant task` |
| Helper | message select/insert/update | Allow participant task | sender dan receiver harus participant task, hanya receiver menandai dibaca | audit policy migration |
| Koordinator RT | user dan profil Helper select | Allow RT sendiri | kelurahan, RW, RT, status Koordinator verified, dan assignment yang sah | `Koordinator RT dibatasi wilayah dan Koordinator RW dapat membaca scope RW` |
| Koordinator RW | user dan profil Helper select | Allow RW sendiri | kelurahan dan RW sama, status verified | `Koordinator RT dibatasi wilayah dan Koordinator RW dapat membaca scope RW` |
| Koordinator | report select/update | Allow reviewer wilayah | `is_scoped_koordinator_for_user(reported_helper_id)` | `runtime cloud: wrong region, fallback aktif, alasan wajib, dan review appeal concurrent ditolak` |
| Admin | users, Helper, Koordinator, task, evidence, snapshot select | Allow operasi Admin | role `admin` dari row diri sendiri | runtime trust-safety dan source audit service role |
| Non-Admin | `audit_logs` select | Deny | tidak ada policy actor | `audit log hanya dapat dibaca Admin` |
| Admin | `audit_logs` select | Allow read only | `is_admin()` | `audit log hanya dapat dibaca Admin` |
| Authenticated client | `audit_logs` insert | Deny | insert hanya melalui operasi server/RPC yang diaudit | audit policy migration |
| Public/anon | function `public` execute | Deny default | `PUBLIC` dicabut, grant diberikan per RPC | audit migration dan `service-role-authorization.test.mjs` |

Nama evidence tanpa path berasal dari `tests/sprint4-rls-runtime.test.mjs`, `tests/rls-integration.test.mjs`, `tests/task-privacy-projection.test.mjs`, atau `tests/trust-safety-runtime.test.mjs`.

## Policy yang ditutup

- `Authenticated users can read all users` dihapus.
- Pembacaan seluruh `users` untuk profil Helper verified dihapus. Katalog memakai projection route dengan field allowlist.
- Pembacaan seluruh `helper_profiles` oleh actor authenticated dihapus.
- Pembacaan lansia untuk seluruh task marketplace dihapus.
- Pembacaan row task marketplace secara langsung oleh Helper dihapus.
- Policy message bebas untuk Koordinator dihapus dan diganti participant task.
- Scope report berbasis assignment longgar diganti scope wilayah canonical.
- Insert `audit_logs` dari client authenticated dicabut.
- Hak execute bawaan `PUBLIC` pada function schema `public` dicabut. RPC mendapatkan grant eksplisit sesuai actor.

## Audit service role

Service role hanya dibuat setelah guard berikut selesai:

| Route | Guard sebelum service role | Projection atau mutation |
| --- | --- | --- |
| `/api/admin/*` | `requireAdmin()` | operasi Admin terukur dan audit log |
| `/api/helpers` dan `/api/helpers/[id]` | sesi authenticated dan input query valid | katalog Helper verified tanpa email, telepon, KTP, alasan suspend, atau koordinat exact |
| `/api/tasks/[id]/accept` | sesi, role Helper, profil verified, status, radius, dan aturan trust tier | conditional update `status = diajukan` |
| `/api/lansia/[id]/riwayat` | owner lansia dan task keluarga | signed URL lima menit untuk object path private |
| `/api/storage/upload` | sesi, doc type, MIME, ukuran, magic bytes, dan path berbasis `auth.uid()` | object private milik actor |
| `/api/payments/[task_id]/status` | owner task | settlement dari status provider yang terverifikasi |
| `/api/payments/webhook` | signature Midtrans | RPC settlement idempoten |
| approval Helper/foto | sesi, role, status reviewer, dan scope target | conditional mutation dan audit |

`requireAdmin`, `/api/users/me`, dan `/api/koordinator/apply` tidak lagi memakai service role untuk melewati policy self-read/self-update. Route seed demo sekarang memanggil `requireAdmin()` sebelum membuat Admin client dan tidak mengirim password demo pada response.

Ada dua endpoint pre-auth yang memang tidak dapat memiliki session guard:

- `/api/auth/login` memakai service role hanya untuk resolve username menjadi email dan membaca profil setelah password berhasil diverifikasi. Response kegagalan tetap generik.
- `/api/auth/register` memakai Auth Admin setelah seluruh payload lolos Zod untuk membuat akun baru. Konflik dan kegagalan tidak mengirim raw provider error.

Kedua pengecualian ini tidak menerima target row ID atau role dari client untuk mutation bebas. Webhook juga tidak memakai session, tetapi wajib lolos signature provider sebelum service role dibuat.

## Perintah evidence cloud

```powershell
$env:RUN_SUPABASE_INTEGRATION = "1"
node --experimental-strip-types --test tests/rls-integration.test.mjs tests/sprint4-rls-runtime.test.mjs
Remove-Item Env:RUN_SUPABASE_INTEGRATION
```

Hasil terakhir pada project development `mtgzucflujmqrslryfsc`: suite Sprint 4 RLS lulus 6 dari 6, tanpa skip. Migrasi lokal dan remote sejajar sampai `20260828171000`.
