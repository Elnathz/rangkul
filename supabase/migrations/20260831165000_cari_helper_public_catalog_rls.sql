-- Perbaiki RLS katalog Helper publik untuk role keluarga.
--
-- Latar: halaman (keluarga)/cari-helper memanggil /api/helpers yang berjalan
-- dengan sesi RLS pengguna. Setelah policy luas "Authenticated users can read
-- all users" di-drop (Sprint 4), akun keluarga kehilangan akses baca ke baris
-- helper_profiles verified dan baris users milik Helper, sehingga katalog
-- mengembalikan 0 Helper meski data seed tersedia.
--
-- Perbaikan ini mengembalikan akses SELECT minimal untuk katalog publik saja:
-- 1. helper_profiles: hanya baris berstatus verified yang boleh dibaca role
--    authenticated (profil Helper yang sudah terverifikasi).
-- 2. users: hanya baris milik Helper yang memiliki helper_profiles verified
--    yang boleh dibaca, agar query join /api/helpers (users!inner) mendapat
--    kolom publik (full_name) tanpa membuka seluruh data user.

-- Recreate policy helper_profiles yang menjamin katalog verified terbaca.
DROP POLICY IF EXISTS "Verified helper profiles readable" ON public.helper_profiles;
CREATE POLICY "Verified helper profiles readable" ON public.helper_profiles
  FOR SELECT TO authenticated
  USING (status = 'verified' OR auth.uid() = user_id);

-- Policy sempit untuk profil publik Helper pada tabel users.
-- Keluarga hanya perlu membaca kolom identitas publik (full_name, foto) milik
-- Helper verified, bukan seluruh data user. Kolom sensitif tidak dibuka lewat
-- policy ini; route /api/helpers hanya me-proyeksi field publik.
DROP POLICY IF EXISTS "Authenticated can read public helper user profiles" ON public.users;
CREATE POLICY "Authenticated can read public helper user profiles" ON public.users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.helper_profiles hp
      WHERE hp.user_id = public.users.id
        AND hp.status = 'verified'
    )
  );
