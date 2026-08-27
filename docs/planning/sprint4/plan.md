# Sprint 4: Riwayat Rangkul, Admin, Offline Draft, dan Kesiapan Demo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menjadikan Riwayat Rangkul sebagai fitur demo utama, menutup panel operasi Admin, menyediakan draft laporan offline, serta membuktikan seed dan RLS aman untuk demo ulang.

**Architecture:** Farros memiliki contract, database, API, RLS, seed, dan integration test. Mervin memiliki UI, IndexedDB, Realtime client, accessibility, responsive QA, dan walkthrough demo. Setiap slice memakai contract handoff sebelum integrasi, dengan closure Sprint 3 sebagai gate wajib.

**Tech Stack:** Next.js App Router, TypeScript, React, Supabase PostgreSQL/RLS/Realtime, Zod, IndexedDB, Node test runner, Tailwind, shadcn/Base UI, Lucide.

**Spec:** `docs/TDD_Rangkul.md` §3.12-§3.13, §4.7, §4.12-§4.14, §6-§9, §14.4-§14.8, §16, §19; `docs/planning/sprint3/follow-up-plan.md`.

## Global Constraints

- Sprint 3 closure gate harus memiliki evidence lint, typecheck, test, build, migration reset, seed reset, dan smoke RLS sebelum Sprint 4 sign-off.
- Semua aturan bisnis, schema, endpoint, dan RLS mengikuti `docs/TDD_Rangkul.md`.
- Health Snapshot dan Memory Capsule adalah data privat serta bukan diagnosis medis.
- Badge `Perlu Perhatian` hanya aktif jika rata-rata turun pada tiga kunjungan berturut-turut.
- Draft offline memakai IndexedDB dan tidak boleh dianggap tersubmit sebelum server mengonfirmasi.
- Semua mutation sensitif divalidasi Zod, conditional/idempoten bila relevan, dan dicatat di `audit_logs`.
- UI mobile-first pada 375px, 768px, 1024px, dan 1440px dengan kontrol minimal 44x44px.
- Tidak ada dokumen sensitif dalam bucket public, mock permanen, nominal hardcode, atau field database di luar TDD.
- Freeze perubahan schema besar setelah Hari 5.

## Ownership

- Farros: closure Sprint 3, endpoint Riwayat Rangkul, Admin/banding/wallet/audit API, migration/RLS/RPC, idempotency evidence, seed, integration test, CI evidence.
- Mervin: halaman Riwayat Rangkul, offline draft IndexedDB, Admin/Koordinator UI, Realtime client, accessibility, responsive QA, visual review, dan demo walkthrough.
- Keduanya wajib melakukan review silang contract dan menjalankan quality gate sebelum commit domain masing-masing.

## Integrasi dan acceptance

- Handoff memakai format Owner, Files, Contract, Database, Test, Result, Blocked by, Next owner.
- P0 wajib: Riwayat Rangkul, RLS, seed reset, Admin mutation aman, offline draft tidak hilang.
- P2 boleh dipotong: SMS, inbox realtime penuh, filter RW detail, dan fitur Help Center interaktif.
- Final command: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, migration reset, seed reset, dan dry run demo dari database kosong.
