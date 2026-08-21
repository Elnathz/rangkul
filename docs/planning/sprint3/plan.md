# Sprint 3: Pembayaran Demo, Trust & Safety, dan Komunikasi (Frontend) - Implementation Plan

**Goal:** Mengimplementasikan fitur-fitur transaksi, keamanan, dan komunikasi di sisi antarmuka (UI) pengguna tanpa menyentuh rute atau *logic* Backend (yang akan di-_mock_ untuk saat ini). Sprint ini sangat berfokus pada pengalaman interaktif pengguna.

## Scope
- Domain TDD: Pembayaran (Demo Ledger), Layanan Tambahan, Laporan Pelanggaran, Tombol SOS Darurat, dan Chat In-App.
- FR-ID Terkait: 
  - `FR-PAY-01` s/d `FR-PAY-09` (Pembayaran dummy, kompensasi, dll)
  - `FR-RPT-01` (Keluarga melapor Helper)
  - `FR-NOT-01` (Tombol SOS)
  - `FR-NOT-03` (Chat/Inbox in-app)

## Breakdown File
1. **Pembayaran Demo:**
   - `src/app/(keluarga)/pembayaran/[task_id]/page.tsx`: Halaman konfirmasi bayar menggunakan *Dummy Wallet*.
2. **Layanan Tambahan (Extra Service):**
   - `src/app/(helper)/tugas/[id]/page.tsx` (Update): Tambahan modal/opsi bagi Helper untuk mengajukan biaya/layanan ekstra.
   - `src/app/(keluarga)/kunjungan/[id]/page.tsx` (Update): UI untuk Keluarga menerima (Approve) atau menolak (Reject) pengajuan ekstra tersebut.
3. **Pelaporan (Trust & Safety):**
   - `src/app/(keluarga)/kunjungan/[id]/laporkan/page.tsx`: Form laporan formal Keluarga terhadap kinerja Helper.
4. **Tombol SOS & Chat:**
   - `src/components/layout/Navbar.tsx` (Update): Tambahan tautan/ikon "Pesan" dan "Tombol SOS" untuk Helper.
   - `src/components/ui/SOSDialog.tsx` (Baru): Komponen dialog darurat interaktif.
   - `src/app/(helper)/helper/pesan/page.tsx` & `src/app/(keluarga)/pesan/page.tsx`: UI *Inbox* sederhana (*Chat placeholder*).
5. **UI UX:**
   - Implementasi Tooltip/Pesan Penjelasan pada setiap tombol yang ter-_disable_ (seperti Helper dengan status `under_review` tidak bisa menerima tugas).

## Perubahan Database
*(Di luar scope sprint ini, hanya menyesuaikan tipe yang sudah ada atau memberikan komentar abaikan untuk TS errors terkait skema yang belum di-_deploy_ tim Backend).*

## Endpoint API (Mocked)
- `POST /api/payment/demo` (Mock)
- `POST /api/tasks/[id]/extra-service` (Mock)
- `POST /api/reports` (Mock)
- Pengiriman akan menggunakan `setTimeout` dan penanganan *state loading* interaktif.

## Pendekatan Testing
- Menjalankan *workflow* pemesanan pembayaran lokal via *mock API*.
- Mengecek status `disabled` pada komponen saat transaksi sedang berjalan atau saat Helper berstatus `under_review`.
- Verifikasi rute navigasi dari *Navbar* ke rute baru (Pesan, SOS).

## Risiko / Pertanyaan Terbuka
- Keterikatan tipe data Supabase: Jika ada properti yang tidak terdaftar di `src/types/database.ts`, maka `as any` atau eksekusi *client-side fallback* akan dimanfaatkan demi mencegah *build errors*.
