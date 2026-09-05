-- TDD §6 menyimpan waktu konfirmasi dan mulai sebagai bagian dari state machine tugas.
-- Existing rows tetap valid karena kedua kolom bersifat nullable.
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
