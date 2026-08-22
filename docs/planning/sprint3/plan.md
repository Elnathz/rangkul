# Sprint 3: Payment Demo, Trust and Safety, and Communication

## Catatan Perubahan Fitur 2026-08-22

Fokus implementasi sesi ini adalah alur layanan tambahan dan detail tugas berbasis data nyata.

### Yang berubah untuk teammate

- Detail kunjungan Keluarga tidak lagi boleh memakai MOCK_TASKS atau fallback task pertama.
- Helper mengajukan layanan tambahan melalui POST /api/tasks/:id/extra-service.
- Task berpindah dari dikerjakan ke menunggu_persetujuan_keluarga saat pengajuan berhasil.
- Keluarga memutuskan melalui PATCH /api/tasks/:id/extra-service/:eid dengan action disetujui atau ditolak.
- harga_final hanya dihitung ulang di server setelah layanan disetujui.
- Helper tidak dapat melanjutkan tugas ketika ada layanan tambahan yang masih menunggu keputusan.
- Nominal pendapatan Helper tidak dihitung sebagai otoritas di browser.
- Rincian biaya Keluarga hanya menampilkan angka yang berasal dari database atau kontrak pembayaran. Pajak dan biaya aplikasi tidak boleh di-hardcode jika belum didefinisikan API.
- Foto lansia memakai panel rasio 4:3 dan modal zoom. Crop upload belum termasuk perubahan ini dan dicatat sebagai follow-up terpisah.

### File utama

- API: src/app/api/tasks/[id]/extra-service/route.ts
- API: src/app/api/tasks/[id]/extra-service/[eid]/route.ts
- Validasi: src/lib/validations/extra-service.ts
- UI Helper: src/components/helper/ExtraServiceRequestForm.tsx
- UI Keluarga: src/components/keluarga/ExtraServiceApprovalCard.tsx
- Detail Helper: src/app/(helper)/tugas/[id]/page.tsx
- Detail Keluarga: src/app/(keluarga)/kunjungan/[id]/page.tsx
- Test: tests/extra-service-flow.test.mjs

Rencana teknis lengkap ada di docs/superpowers/plans/2026-08-22-extra-service-task-detail.md.

### Status verifikasi sesi ini

- [x] Test layanan tambahan: 4/4 lulus.
- [x] Test repository: 36/36 lulus.
- [x] TypeScript: npx.cmd tsc --noEmit lulus.
- [x] ESLint file fitur: 0 error, 2 warning bawaan penggunaan img untuk URL storage.
- [x] Production build: npm.cmd run build lulus.
- [x] Impeccable detector: tidak menemukan temuan pada komponen UI baru.
- [ ] Migration remote: jalankan npx supabase db push --linked --include-all setelah memastikan dua migration belum tercatat di remote.

## Scope

- FR-PAY-01 through FR-PAY-09, with the frontend limited to payment state and Demo Ledger screens.
- FR-SVC-03 through FR-SVC-04 for Layanan Tambahan.
- FR-RPT-01 through FR-RPT-02 for formal reports and the `under_review` state.
- FR-MSG-01 through FR-MSG-03 for task chat and inbox states.
- FR-NOT-01 through FR-NOT-04 for in-app notifications.
- FR-SOS-01 for the Helper emergency action and acknowledgement UI.
- TDD §3.4, §3.6, §3.8, §3.10, §4.6, §4.8, §4.9, §4.10, §7, §9, §13, and §14.4.

## Breakdown File

- Payment screens and client states under `src/app/(keluarga)/pembayaran/[task_id]/`.
- Task detail actions for extra service, report, chat, and SOS under the existing role routes.
- Report, chat, notification, and acknowledgement components under `src/components/`.
- Shared client helpers and validation under `src/hooks/` and `src/lib/` only when the existing API contract supports them.
- Project-local domain guidance under `.agents/skills/` so future agents do not re-derive TDD rules.

## Database Changes

- None in the frontend workstream.
- Backend handoff is required if the API contract does not expose payment status, split amounts, extra-service decisions, report review state, notification read state, or emergency acknowledgement state defined by TDD §6 and §7.
- Do not remove fields from client payloads to hide a schema mismatch. Request a migration and regenerated database types from the backend owner.

## API Endpoints

- Consume the existing contracts for `POST /api/payments/:task_id/charge-dummy`, `GET /api/payments/:task_id`, and `PATCH /api/tasks/:id/complete`.
- Consume `POST /api/tasks/:id/extra-service` and `PATCH /api/tasks/:id/extra-service/:eid`.
- Consume `POST /api/reports`, `GET /api/reports`, and `PATCH /api/reports/:id`.
- Consume `GET /api/messages/conversations`, `GET /api/messages/:task_id`, `POST /api/messages`, and `PATCH /api/messages/:id/read`.
- Consume `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `POST /api/emergency`, and `PATCH /api/emergency/:id/acknowledge`.

## Testing Approach

- Run client validation tests for payment, extra-service, report, and emergency forms when a test runner is available.
- Verify loading, error, empty, disabled, success, and retry states for every new screen.
- Verify the UI never displays released funds, an approved extra service, a resolved report, or an acknowledged alert before the API confirms it.
- Verify role and task-status gates against TDD §3 and §9.
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` after implementation.

## Risks and Open Questions

- The repository has no test script or test framework, so automated client tests require an explicit dependency decision.
- Impeccable is referenced by the TDD but is not installed in this Codex session. UI review will use the available `ui-ux-pro-max` skill and the TDD accessibility rules until the team installs Impeccable.
- Midtrans must not be presented as active if the Demo Ledger is the configured provider.
- # Existing uncommitted changes are outside this init task and must remain untouched.

# Sprint 3: Pembayaran Demo, Trust & Safety, dan Komunikasi (Frontend) - Implementation Plan

**Goal:** Mengimplementasikan fitur-fitur transaksi, keamanan, dan komunikasi di sisi antarmuka (UI) pengguna tanpa menyentuh rute atau _logic_ Backend (yang akan di-_mock_ untuk saat ini). Sprint ini sangat berfokus pada pengalaman interaktif pengguna.

## Scope

- Domain TDD: Pembayaran (Demo Ledger), Layanan Tambahan, Laporan Pelanggaran, Tombol SOS Darurat, dan Chat In-App.
- FR-ID Terkait:
  - `FR-PAY-01` s/d `FR-PAY-09` (Pembayaran dummy, kompensasi, dll)
  - `FR-RPT-01` (Keluarga melapor Helper)
  - `FR-NOT-01` (Tombol SOS)
  - `FR-NOT-03` (Chat/Inbox in-app)

## Breakdown File

1. **Pembayaran Demo:**
   - `src/app/(keluarga)/pembayaran/[task_id]/page.tsx`: Halaman konfirmasi bayar menggunakan _Dummy Wallet_.
2. **Layanan Tambahan (Extra Service):**
   - `src/app/(helper)/tugas/[id]/page.tsx` (Update): Tambahan modal/opsi bagi Helper untuk mengajukan biaya/layanan ekstra.
   - `src/app/(keluarga)/kunjungan/[id]/page.tsx` (Update): UI untuk Keluarga menerima (Approve) atau menolak (Reject) pengajuan ekstra tersebut.
3. **Pelaporan (Trust & Safety):**
   - `src/app/(keluarga)/kunjungan/[id]/laporkan/page.tsx`: Form laporan formal Keluarga terhadap kinerja Helper.
4. **Tombol SOS & Chat:**
   - `src/components/layout/Navbar.tsx` (Update): Tambahan tautan/ikon "Pesan" dan "Tombol SOS" untuk Helper.
   - `src/components/ui/SOSDialog.tsx` (Baru): Komponen dialog darurat interaktif.
   - `src/app/(helper)/helper/pesan/page.tsx` & `src/app/(keluarga)/pesan/page.tsx`: UI _Inbox_ sederhana (_Chat placeholder_).
5. **UI UX:**
   - Implementasi Tooltip/Pesan Penjelasan pada setiap tombol yang ter-_disable_ (seperti Helper dengan status `under_review` tidak bisa menerima tugas).

## Perubahan Database

_(Di luar scope sprint ini, hanya menyesuaikan tipe yang sudah ada atau memberikan komentar abaikan untuk TS errors terkait skema yang belum di-*deploy* tim Backend)._

## Endpoint API (Mocked)

- `POST /api/payment/demo` (Mock)
- `POST /api/tasks/[id]/extra-service` (Mock)
- `POST /api/reports` (Mock)
- Pengiriman akan menggunakan `setTimeout` dan penanganan _state loading_ interaktif.

## Pendekatan Testing

- Menjalankan _workflow_ pemesanan pembayaran lokal via _mock API_.
- Mengecek status `disabled` pada komponen saat transaksi sedang berjalan atau saat Helper berstatus `under_review`.
- Verifikasi rute navigasi dari _Navbar_ ke rute baru (Pesan, SOS).

## Risiko / Pertanyaan Terbuka

- Keterikatan tipe data Supabase: Jika ada properti yang tidak terdaftar di `src/types/database.ts`, maka `as any` atau eksekusi _client-side fallback_ akan dimanfaatkan demi mencegah _build errors_.
