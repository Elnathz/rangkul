import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileCheck, UserCheck, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import KoordinatorStatusGuard from '@/components/koordinator/KoordinatorStatusGuard';
import { extractKelurahan } from '@/lib/region';

type PendingHelper = {
  id: string;
  wilayah_domisili: string;
  status: string;
  created_at: string;
  koordinator_id: string | null;
  users: { full_name: string | null } | { full_name: string | null }[] | null;
};

export default async function AntreanHelperPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get Koordinator Profile
  const { data: koordinator } = await supabase
    .from('koordinator_profiles')
    .select('id, wilayah, status')
    .eq('user_id', user.id)
    .single();

  // Check if profile is incomplete
  const isProfileIncomplete = !koordinator?.wilayah;
  let pendingHelpers: PendingHelper[] = [];

  if (!isProfileIncomplete) {
    // Fetch pending helpers assigned to this koordinator, or unassigned ones in their wilayah
    const { data: helpers } = await supabase
      .from('helper_profiles')
      .select(`
        id,
        wilayah_domisili,
        status,
        created_at,
        koordinator_id,
        users (
          full_name
        )
      `)
      .eq('status', 'pending_verification')
      .or(`koordinator_id.eq.${koordinator.id},koordinator_id.is.null`)
      .order('created_at', { ascending: false });

    const koordinatorKelurahan = extractKelurahan(koordinator.wilayah);
    pendingHelpers = (helpers || []).filter(h =>
      h.koordinator_id === koordinator.id || 
      (h.koordinator_id === null && extractKelurahan(h.wilayah_domisili) === koordinatorKelurahan)
    ) as unknown as PendingHelper[];
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      return `Hari ini, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
    } else if (diffDays === 1) {
      return `Kemarin, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
    } else {
      return `${diffDays} Hari lalu`;
    }
  };

  const formatWilayah = (wilayahStr: string) => {
    if (!wilayahStr) return <span className="text-sm text-gray-500">-</span>;
    const parts = wilayahStr.split(' | ');
    if (parts.length >= 3) {
      const region = parts[0].split(',').map(s => s.trim());
      const kelurahan = region[0];
      const kecamatan = region[1] || '';
      const rtrw = parts[1];
      const detail = parts[2];
      return (
        <div className="space-y-0.5 mt-1.5 mb-2">
          <p className="text-sm font-semibold text-gray-800 flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-[#0D47A1] shrink-0" />
            {rtrw}, {kelurahan}{kecamatan ? `, ${kecamatan}` : ''}
          </p>
          <p className="text-xs text-gray-500 line-clamp-1 ml-4" title={detail}>{detail}</p>
        </div>
      );
    }
    return <p className="text-sm font-medium text-gray-500 mb-1 line-clamp-2">{wilayahStr}</p>;
  };

  return (
    <KoordinatorStatusGuard koordinator={koordinator}>
      <div className="p-4 sm:p-6 lg:p-8 font-sans pb-24 max-w-5xl mx-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Antrean Verifikasi Helper</h1>
          </div>

          {isProfileIncomplete ? (
            <div className="bg-white rounded-2xl border border-orange-200 overflow-hidden p-12 text-center flex flex-col items-center mt-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-5 shadow-sm">
                <FileCheck className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Lengkapi Pengajuan Profil</h3>
              <p className="text-gray-500 mb-8 max-w-lg leading-relaxed">
                Anda harus melengkapi dokumen pengajuan kepengurusan dan menetapkan wilayah operasional terlebih dahulu sebelum bisa memverifikasi kandidat Helper.
              </p>
              <Button asChild size="lg" className="bg-[#0D47A1] text-white hover:bg-blue-800 px-8">
                <Link href="/koordinator/pengajuan">Isi Formulir Pengajuan Sekarang</Link>
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="p-3 bg-blue-50 text-[#0D47A1] rounded-xl">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{pendingHelpers.length} Kandidat Menunggu</h2>
                  <p className="text-sm text-gray-500">Tinjau kelengkapan dokumen calon Helper di wilayah pengawasan Anda.</p>
                </div>
              </div>

              <div className="space-y-4">
                {pendingHelpers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                      <UserCheck className="w-8 h-8 text-[#0D47A1]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Antrean Verifikasi Kosong</h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      Saat ini tidak ada Helper baru yang membutuhkan validasi dokumen di wilayah binaan Anda. Anda bisa bersantai sejenak!
                    </p>
                  </div>
                ) : (
                  pendingHelpers.map((helper) => {
                    const nama = Array.isArray(helper.users) ? helper.users[0]?.full_name : helper.users?.full_name;
                    return (
                      <div key={helper.id} className="p-5 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all group bg-white">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#F5F8FC] flex items-center justify-center shrink-0">
                              <UserCheck className="w-6 h-6 text-gray-400 group-hover:text-[#0D47A1] transition-colors" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-gray-900">{nama || 'Nama Tidak Tersedia'}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  helper.status === 'verified' ? 'bg-green-100 text-green-700' :
                                  helper.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  helper.status === 'under_review' ? 'bg-blue-100 text-[#0D47A1]' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {helper.status === 'under_review' ? 'Sedang Ditinjau' : helper.status}
                                </span>
                              </div>
                              {formatWilayah(helper.wilayah_domisili)}
                              <p className="text-xs text-gray-400 mt-1">Dikirim pada: {formatTimeAgo(helper.created_at)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 w-full mt-3 pt-4 border-t border-gray-100 sm:w-auto sm:mt-0 sm:pt-0 sm:border-0">
                            <Button variant="outline" className="flex-1 sm:flex-none border-gray-200">
                              Tolak
                            </Button>
                            <Button asChild className="flex-1 sm:flex-none bg-[#0D47A1] text-white hover:bg-blue-800">
                              <Link href={`/koordinator/helper/${helper.id}`}>
                                <CheckCircle2 className="w-4 h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Validasi Berkas</span>
                                <span className="sm:hidden">Validasi</span>
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </KoordinatorStatusGuard>
  );
}
