# Extra Service and Real Task Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Menyambungkan pengajuan layanan tambahan dan detail tugas Keluarga ke data nyata, dengan nominal pembayaran dan foto yang tidak menyesatkan.

**Architecture:** Route API melakukan validasi role, kepemilikan, dan conditional update. Server page membaca task serta layanan tambahan dari Supabase, sementara komponen client hanya mengirim aksi dan merender state API. Presentasi foto memakai komponen reusable rasio 4:3.

**Tech Stack:** Next.js App Router, React 19, Supabase SSR, Zod, TypeScript, Tailwind CSS, Lucide.

**Spec:** docs/superpowers/specs/2026-08-22-extra-service-task-detail-design.md

## Global Constraints

- Ikuti TDD §3.4.1, §6, §7, §9, §14.4, dan rangkul-payment-rules.
- Jangan menghitung nominal pembayaran sebagai otoritas di browser.
- Jangan memakai window.alert, window.confirm, atau MOCK_TASKS untuk alur real.
- Gunakan status Indonesia yang sudah didefinisikan TDD.
- Jangan menambah field database karena schema task_extra_services sudah tersedia.
- Jangan menyentuh perubahan user yang tidak terkait fitur ini.

---

### Task 1: Catat scope untuk teammate

**Files:** docs/planning/sprint3/plan.md

- [ ] Tambahkan catatan perubahan, endpoint, state machine, file yang disentuh, dan cara verifikasi.
- [ ] Sebut bahwa halaman keluarga sebelumnya mock dan biaya hardcode dihapus.

### Task 2: Test dan route layanan tambahan

**Files:**

- Create: tests/extra-service-flow.test.mjs
- Create: src/lib/validations/extra-service.ts
- Create: src/app/api/tasks/[id]/extra-service/route.ts
- Create: src/app/api/tasks/[id]/extra-service/[eid]/route.ts

- [ ] Tulis test validasi nominal, role, kepemilikan, status pause, conditional update, approval, dan rejection.
- [ ] Jalankan test dalam kondisi merah.
- [ ] Implementasikan insert layanan dengan status menunggu_persetujuan_keluarga.
- [ ] Implementasikan approval server-side yang menghitung ulang harga_final dari seluruh layanan disetujui.
- [ ] Implementasikan rejection dan kembalikan task ke dikerjakan.
- [ ] Jalankan test sampai hijau.

### Task 3: UI Helper

**Files:**

- Create: src/components/helper/ExtraServiceRequestForm.tsx
- Modify: src/app/(helper)/tugas/[id]/page.tsx

- [ ] Tampilkan form hanya saat status dikerjakan.
- [ ] Kirim ke endpoint nyata dengan state loading, error, dan refresh.
- [ ] Tampilkan pending state saat task menunggu persetujuan.
- [ ] Hilangkan kalkulasi harga_final x 0.9 dari browser dan gunakan nilai server-side.

### Task 4: Detail Keluarga real data

**Files:**

- Modify: src/app/(keluarga)/kunjungan/[id]/page.tsx
- Create: src/components/keluarga/ExtraServiceApprovalCard.tsx

- [ ] Ambil task milik user aktif dari Supabase beserta lansia, kategori, Helper, dan task_extra_services.
- [ ] Hapus import dan fallback MOCK_TASKS.
- [ ] Tampilkan tombol Setujui/Tolak melalui dialog custom.
- [ ] Tampilkan detail setiap layanan dan statusnya.
- [ ] Tampilkan harga_final dari database, tanpa hardcode pajak atau biaya platform.
- [ ] Letakkan foto lansia di bagian atas dengan rasio 4:3, object-cover, dan modal zoom.

### Task 5: Verifikasi dan dokumentasi

**Files:** docs/planning/sprint3/plan.md

- [ ] Jalankan test route dan regresi.
- [ ] Jalankan npx.cmd tsc --noEmit.
- [ ] Jalankan ESLint pada file yang berubah.
- [ ] Jalankan npm run build.
- [ ] Catat hasil command dan batasan crop upload sebagai follow-up.

## Completion Notes

- Route dan RPC atomic extra service sudah dibuat.
- Detail kunjungan Keluarga sudah membaca task dan layanan tambahan dari Supabase.
- UI Helper dan Keluarga memakai dialog custom, bukan alert atau confirm native.
- Foto lansia memakai rasio 4:3 dan modal zoom.
- Crop upload belum diimplementasikan karena memerlukan perubahan pipeline upload.
- Test, typecheck, lint, dan production build sudah diverifikasi.
