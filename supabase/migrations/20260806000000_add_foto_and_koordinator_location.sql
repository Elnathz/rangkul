-- Tambah foto dan hubungan keluarga untuk Lansia
ALTER TABLE public.lansia_profiles
ADD COLUMN foto_url TEXT,
ADD COLUMN hubungan_keluarga TEXT;

-- Tambah foto_url untuk Helper
ALTER TABLE public.helper_profiles
ADD COLUMN foto_url TEXT;

-- Tambah foto_url dan lokasi (lat, lng) untuk Koordinator
ALTER TABLE public.koordinator_profiles
ADD COLUMN foto_url TEXT,
ADD COLUMN domisili_lat NUMERIC,
ADD COLUMN domisili_lng NUMERIC;
