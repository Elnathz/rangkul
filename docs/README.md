# Indeks Dokumentasi Rangkul

Gunakan indeks ini untuk menemukan dokumen berdasarkan kebutuhan. `TDD_Rangkul.md` tetap menjadi sumber kebenaran aturan bisnis, skema database, kontrak API, state machine, dan acceptance criteria.

## Untuk juri dan evaluator

1. [README utama](../README.md)
2. [Guidebook ITechno](GUIDEBOOK_ITechno.md)
3. [Panduan demo dan akun uji](demo/README.md)
4. [Peta lokasi demo dalam GeoJSON](demo/locations.geojson)
5. [Audit Penyelesaian Sprint 6](planning/sprint6/completion-audit.md)
6. [Evidence UI/UX Sprint 5](planning/sprint5/ui-ux-evidence.md)

## Untuk developer

| Dokumen | Kegunaan |
| --- | --- |
| [Panduan Pengembangan](DEVELOPMENT.md) | Instalasi, environment, Supabase lokal, migrasi, seed, test, CI, screenshot, troubleshooting |
| [TDD Rangkul](TDD_Rangkul.md) | Business rule, arsitektur, skema, endpoint, role, sprint, dan acceptance criteria |
| [TDD Changes Tracker](tdd_changes_tracker.md) | Perubahan keputusan terhadap TDD |
| [API](api/README.md) | Autentikasi, response, inventaris domain, endpoint penting, dan OpenAPI |
| [Inventaris Endpoint](api/endpoints.md) | Daftar route handler, method, actor, alias, dan tanggung jawab |
| [Kontrak API Naratif](api-contract.md) | Actor, payload, response, state, dan error secara lebih rinci |
| [OpenAPI 3.1](api/openapi.json) | Spesifikasi machine-readable untuk tool API |
| [RLS Matrix](planning/sprint4/rls-matrix.md) | Ekspektasi akses data per role dan resource |

## Rencana dan audit per sprint

| Sprint | Rencana | Audit atau evidence |
| --- | --- | --- |
| 0 | [Plan](planning/sprint0/plan.md) | Lihat histori dan TDD tracker |
| 1 | [Plan](planning/sprint1/plan.md) | [Design](planning/sprint1/design.md) |
| 2 | [Plan](planning/sprint2/plan.md) | Lihat test dan histori commit |
| 3 | [Plan](planning/sprint3/plan.md) | [Completion Audit](planning/sprint3/completion-audit.md), [Follow-up](planning/sprint3/follow-up-plan.md) |
| 4 | [Plan](planning/sprint4/plan.md) | [Completion Audit](planning/sprint4/completion-audit.md), [RLS Matrix](planning/sprint4/rls-matrix.md) |
| 5 | [Plan](planning/sprint5/plan.md) | [UI/UX Evidence](planning/sprint5/ui-ux-evidence.md), [Restructure Plan V2](planning/sprint5/ui-ux-restructure-plan-v2.md) |
| 6 | [Plan](planning/sprint6/plan.md) | [Completion Audit](planning/sprint6/completion-audit.md), [Landing Redesign](planning/sprint6/RANGKUL_LANDING_PAGE_UIUX_MASTER_REDESIGN_V2_NO_IMPECCABLE.md) |

## Dokumentasi API per domain

| Domain | Dokumen |
| --- | --- |
| Autentikasi | [api/auth.md](api/auth.md) |
| Booking dan task | [api/booking.md](api/booking.md) |
| Helper | [api/helper.md](api/helper.md) |
| Lansia dan Riwayat Rangkul | [api/lansia.md](api/lansia.md) |

## Spesifikasi tambahan

| Dokumen | Isi |
| --- | --- |
| [Detail Kunjungan Master Redesign](planning/extra/RANGKUL_DETAIL_KUNJUNGAN_UIUX_MASTER_REDESIGN.md) | Arah UI/UX detail kunjungan |
| [Detail Kunjungan Implementation Plan](planning/extra/RANGKUL_DETAIL_KUNJUNGAN_IMPLEMENTATION_PLAN.md) | Breakdown implementasi detail kunjungan |
| [Detail Kunjungan Evidence](planning/extra/RANGKUL_DETAIL_KUNJUNGAN_EVIDENCE.md) | Bukti hasil detail kunjungan |
| [Service Category Hierarchy](planning/extra/service-category-hierarchy.md) | Hierarki dan konteks kategori layanan |
| [Tingkatan Jasa dan Probation](planning/extra/tingkatan_jasa_dan_probation.md) | Rancangan layanan dan trust tier |
| [Edit Data Integrity](planning/extra/edit-data-integrity.md) | Catatan integritas data pada alur edit |

## Aturan membaca status

- Checklist plan menunjukkan scope yang direncanakan, bukan bukti deployment.
- Completion audit menunjukkan hasil pada commit dan environment yang disebut di dokumen tersebut.
- Source test tidak otomatis membuktikan runtime cloud.
- Runtime cloud tidak otomatis membuktikan UI pada semua viewport.
- Feature flag yang tersedia di source tidak berarti aktif di production.
- Screenshot lama harus diberi tanggal atau sumber sprint dan tidak dianggap mewakili UI terbaru tanpa verifikasi ulang.
