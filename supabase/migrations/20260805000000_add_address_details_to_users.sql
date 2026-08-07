-- =============================================================================
-- Migration: Tambah kolom alamat detail ke tabel public.users
-- =============================================================================

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS alamat_detail TEXT,
ADD COLUMN IF NOT EXISTS rt INT,
ADD COLUMN IF NOT EXISTS rw INT,
ADD COLUMN IF NOT EXISTS kelurahan TEXT,
ADD COLUMN IF NOT EXISTS kecamatan TEXT,
ADD COLUMN IF NOT EXISTS kabupaten_kota TEXT,
ADD COLUMN IF NOT EXISTS provinsi TEXT;
