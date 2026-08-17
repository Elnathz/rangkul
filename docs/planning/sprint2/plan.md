# Sprint 2: Alur Kunjungan Inti dan Riwayat Data Dasar (Frontend) — Implementation Plan

**Goal:** Menyelesaikan antarmuka pengguna (UI) dan alur interaksi sisi client untuk pemesanan (booking), penerimaan tugas oleh Helper, check-in, dan form pelaporan (termasuk Health Snapshot). Backend diasumsikan akan dikerjakan oleh rekan tim (atau menggunakan mock/kontrak API terlebih dahulu).

## Scope
- Domain TDD: §5 (User Flow), §9 (Struktur Halaman), §13 (Development Guideline), dan §14.4 (Sprint 2 - Frontend).

## Breakdown File
- `src/app/(keluarga)/booking/[helper_id]/page.tsx`: Halaman form pemesanan (pilih lansia, kategori, jadwal, ringkasan harga fix).
- `src/app/(keluarga)/kunjungan/page.tsx`: Daftar kunjungan Keluarga.
- `src/app/(keluarga)/kunjungan/[id]/page.tsx`: Detail kunjungan Keluarga (timeline status, cancel/reschedule UI).
- `src/app/(helper)/tugas/page.tsx`: Job board (daftar tugas tersedia) untuk Helper.
- `src/app/(helper)/tugas/[id]/page.tsx`: Detail tugas Helper (termasuk UI accept, check-in).
- `src/app/(helper)/tugas/[id]/lapor/page.tsx`: Form laporan dasar (foto, catatan, 5 indikator Health Snapshot, Cerita Hari Ini).
- `src/app/(koordinator)/antrean-persetujuan/page.tsx`: Halaman daftar antrean approval untuk kondisi khusus (probation, risiko tinggi).
- `src/components/ui/TaskStatusBadge.tsx`: Komponen UI tunggal untuk status task agar konsisten di seluruh role.

## Integrasi API (via Client)
- Menyambungkan form booking dengan kontrak API POST `/api/tasks`.
- Menyambungkan aksi *accept* Helper dengan PATCH `/api/tasks/[id]/accept` dan menangani error `409 Conflict` (race condition).
- Menyambungkan aksi *start* (check-in) dan *complete* (konfirmasi Keluarga).
- Menyambungkan form Laporan dengan POST `/api/tasks/[id]/evidence` (termasuk upload foto/file lewat UI secara *client-side* ke Supabase Storage atau dikirim ke API server).

## Pendekatan Testing (Frontend)
- Memastikan navigasi per-role berjalan dengan aman (middleware auth).
- Uji validasi form Zod + React Hook Form di sisi client.
- Tes state *loading/error/empty* pada setiap halaman daftar dan detail.
- Uji penanganan error khusus `409` saat ada dua Helper mencoba menerima tugas secara bersamaan.

## Risiko/Pertanyaan Terbuka
- Jika endpoint backend belum siap di Hari ke-2 Sprint ini, maka pembuatan **Data Mock** menjadi esensial agar progress UI tidak terhenti.
- Implementasi *Offline Draft* (IndexedDB) untuk UI form Laporan mungkin membutuhkan effort tambahan, akan ditambahkan ke prioritas kedua di sprint ini jika *golden path* online sudah stabil.
