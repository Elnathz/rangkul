import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PengajuanClient from './PengajuanClient';

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch pending koordinators
  const { data: koordinators } = await supabase
    .from('koordinator_profiles')
    .select(`
      id, wilayah, tingkat, dokumen_url, ktp_url, status, created_at,
      users!inner ( id, full_name, email, phone )
    `)
    .eq('status', 'pending_verification')
    .order('created_at', { ascending: true });

  const queue = koordinators || [];

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-foreground mb-2">
        Pengajuan Koordinator
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Daftar pengajuan akun koordinator yang menunggu verifikasi admin.
      </p>
      
      {queue.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Belum ada pengajuan yang masuk.
          </p>
        </div>
      ) : (
        <PengajuanClient queue={queue} />
      )}
    </div>
  );
}
