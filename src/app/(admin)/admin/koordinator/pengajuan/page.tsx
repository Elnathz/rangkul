import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PengajuanClient from './PengajuanClient';

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const requestedPage = Number(params.page ?? "1");
  const requestedPageSize = Number(params.pageSize ?? "10");
  const page = Number.isFinite(requestedPage) ? Math.max(requestedPage, 1) : 1;
  const pageSize = Number.isFinite(requestedPageSize) ? Math.min(Math.max(requestedPageSize, 1), 50) : 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: koordinators } = await supabase
    .from('koordinator_profiles')
    .select(`
      id, wilayah, tingkat, dokumen_url, ktp_url, status, created_at,
      users!koordinator_profiles_user_id_fkey!inner ( id, full_name, email, phone )
    `)
    .eq('status', 'pending_verification')
    .order('created_at', { ascending: true })
    .range(from, to);

  const { count } = await supabase
    .from('koordinator_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending_verification');

  const queue = koordinators || [];
  const total = count ?? 0;

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-foreground mb-2">
        Pengajuan Koordinator
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Daftar pengajuan akun koordinator yang menunggu verifikasi admin.
      </p>
      
      {total === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Belum ada pengajuan yang masuk.
          </p>
        </div>
      ) : (
        <PengajuanClient queue={queue} page={page} pageSize={pageSize} total={total} />
      )}
    </div>
  );
}
