-- Perbaiki RLS helper_service_categories dan fungsi permission RLS untuk katalog Helper publik dan halaman cari-helper.
--
-- Latar: Saat role authenticated/public memanggil /api/helpers dengan filter kategori_id,
-- RLS pada helper_service_categories dan permission fungsi is_admin() memicu error PostgreSQL 42501 (permission denied),
-- sehingga query join helper_service_categories mengembalikan 0 Helper pada pencarian marketplace.
--
-- Perbaikan ini memberikan GRANT EXECUTE pada is_admin() dan is_koordinator_or_admin() serta policy SELECT publik
-- pada helper_service_categories, helper_profiles, dan users.

GRANT EXECUTE ON FUNCTION public.is_admin() TO public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_koordinator_or_admin() TO public, anon, authenticated;

ALTER TABLE public.helper_service_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read verified helper service categories" ON public.helper_service_categories;
CREATE POLICY "Public can read verified helper service categories" ON public.helper_service_categories
  FOR SELECT TO public
  USING (true);
GRANT SELECT ON public.helper_service_categories TO public, anon, authenticated;

DROP POLICY IF EXISTS "Verified helper profiles readable" ON public.helper_profiles;
CREATE POLICY "Verified helper profiles readable" ON public.helper_profiles
  FOR SELECT TO public
  USING (status = 'verified' OR auth.uid() = user_id);
GRANT SELECT ON public.helper_profiles TO public, anon, authenticated;

DROP POLICY IF EXISTS "Authenticated can read public helper user profiles" ON public.users;
CREATE POLICY "Authenticated can read public helper user profiles" ON public.users
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.helper_profiles hp
      WHERE hp.user_id = public.users.id AND hp.status = 'verified'
    )
    OR auth.uid() = id
  );
GRANT SELECT ON public.users TO public, anon, authenticated;
