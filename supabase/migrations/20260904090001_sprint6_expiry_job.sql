-- Scheduled job untuk membatalkan task Cari Cepat / Pilih dari Pelamar yang
-- belum diambil pelamar sebelum expires_at. Menjalankan expire_unassigned_tasks()
-- setiap menit supaya task cepat tidak menggantung lebih dari batas 15 menit.

create extension if not exists pg_cron;

select cron.schedule(
  'rangkul-expire-unassigned-tasks',
  '* * * * *',
  'select public.expire_unassigned_tasks()'
);
