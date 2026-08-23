# Sprint 3: Midtrans Sandbox, Trust and Safety, dan Komunikasi

## Keputusan

Sprint 3 memakai Midtrans Sandbox sebagai provider pembayaran. Tidak ada `setTimeout`, saldo hardcode, inbox hardcode, atau fake success state. Midtrans menangani checkout dan status transaksi. Pembagian 90/7/3 tetap dihitung server Rangkul setelah Keluarga mengonfirmasi task selesai. Status `held_escrow` di aplikasi adalah status settlement internal, bukan klaim escrow regulated dari provider.

Midtrans Sandbox dipilih karena repository sudah memiliki field `midtrans_order_id` dan `midtrans_snap_token`, serta kontrak Snap, status, webhook signature SHA-512, cancel, dan refund yang sesuai kebutuhan demo. Xendit tidak dipakai pada sprint ini.

## Scope

- TDD §3.4, §3.6, §3.8, §3.10, §4.6, §4.8, §4.9, §4.10, §7, §9, §14.4.
- FR-PAY-01 sampai FR-PAY-04 dan FR-PAY-09.
- FR-RPT-01 sampai FR-RPT-02.
- FR-MSG-01 sampai FR-MSG-03.
- FR-NOT-01 sampai FR-NOT-04.
- FR-SOS-01.

## Implementasi

- Migration payment menambahkan field canonical, constraint nominal, RPC create, settlement, release, refund, transaction log, dan RLS payment.
- Route payment menyediakan charge Midtrans, webhook, status, refund, dan alias GET payment canonical.
- Konfirmasi selesai menggunakan RPC release atomik. Split normal 90/7/3 dan status payment berasal dari server.
- Report memakai task sebagai relasi sumber, trigger dua laporan aktif tetap mengubah Helper menjadi `under_review`, dan route review membatasi Koordinator berdasarkan wilayah.
- Messages hanya boleh dibuat oleh peserta task. Inbox dan percakapan membaca API nyata.
- SOS menyimpan `emergency_alerts`, mengirim notifikasi in-app, menyediakan `tel:112`, dan mendukung acknowledgement. SMS tidak diklaim aktif tanpa provider teruji.
- Halaman pembayaran, laporan, inbox, dan SOS tidak boleh menyimpan data domain palsu.

## Endpoint

```text
POST  /api/payments/:task_id/charge
GET   /api/payments/:task_id
GET   /api/payments/:task_id/status
POST  /api/payments/:task_id/refund
POST  /api/payments/webhook
PATCH /api/tasks/:id/complete
PATCH /api/tasks/:id/confirm-completion   alias kompatibilitas
POST  /api/reports
GET   /api/reports
PATCH /api/reports/:id
GET   /api/messages/conversations
GET   /api/messages/:task_id
POST  /api/messages
PATCH /api/messages/:id/read
POST  /api/emergency
PATCH /api/emergency/:id/acknowledge
```

## Testing

- Test kontrak route dan migration sebelum implementasi.
- Test signature webhook valid dan invalid.
- Test payment idempotent, nominal server-side, settlement, release, dan refund.
- Test RLS payment, messages, reports, dan emergency dengan role yang sah dan tidak sah.
- Test dua laporan mengubah status `under_review` tanpa memakai rating.
- Test UI tidak memakai mock, nominal hardcode, atau fake latency.
- Jalankan lint, typecheck, test, build, lalu dry-run migration cloud.

## Environment

```text
MIDTRANS_SERVER_KEY=...
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=...
NEXT_PUBLIC_SITE_URL=https://merangkul.vercel.app
```

Secret hanya disimpan pada `.env.local` dan environment Vercel. Tidak ditulis ke repository.
