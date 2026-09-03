-- Policy ini tersisa dari konfigurasi cloud lama dan membuka email/telepon
-- setiap Helper verified kepada seluruh akun authenticated. Katalog memakai
-- projection server-side, sehingga tabel users tidak boleh menjadi sumber
-- profil publik.
DROP POLICY IF EXISTS "Authenticated can read public helper user profiles" ON public.users;
