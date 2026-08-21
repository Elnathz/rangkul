import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { 
  Users, 
  FileCheck, 
  ChevronRight, 
  UserCheck,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import KoordinatorStatusGuard from '@/components/koordinator/KoordinatorStatusGuard';

export default async function KoordinatorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get Koordinator Profile and User Name
  const { data: koordinator } = await supabase
    .from('koordinator_profiles')
    .select('id, wilayah, status')
    .eq('user_id', user.id)
    .single();

  const { data: userData } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Default values
  let totalHelper = 0, pendingHelperCount = 0, activeHelper = 0;
  let pendingHelpers: any[] = [];

  if (koordinator?.wilayah) {
    // Ambil semua helper yang mungkin terkait untuk menghitung statistik
    const { data: allHelpers } = await supabase
      .from('helper_profiles')
      .select('id, wilayah_domisili, status, koordinator_id')
      .or(`koordinator_id.eq.${koordinator.id},koordinator_id.is.null`);

    if (allHelpers) {
      const myHelpers = allHelpers.filter(h => 
        h.koordinator_id === koordinator.id || 
        (h.koordinator_id === null && h.wilayah_domisili.includes(koordinator.wilayah))
      );
      
      totalHelper = myHelpers.length;
      pendingHelperCount = myHelpers.filter(h => h.status === 'pending_verification').length;
      activeHelper = myHelpers.filter(h => h.status === 'verified').length;
    }

    // Fetch pending helpers list (top 3)
    const { data: pendingData } = await supabase
      .from('helper_profiles')
      .select(`
        id,
        created_at,
        wilayah_domisili,
        status,
        koordinator_id,
        users ( full_name )
      `)
      .eq('status', 'pending_verification')
      .or(`koordinator_id.eq.${koordinator.id},koordinator_id.is.null`)
      .order('created_at', { ascending: false });

    if (pendingData) {
      pendingHelpers = pendingData
        .filter(h => 
          h.koordinator_id === koordinator.id || 
          (h.koordinator_id === null && h.wilayah_domisili.includes(koordinator.wilayah))
        )
        .slice(0, 3);
    }
  }

  const isProfileIncomplete = !koordinator?.wilayah;

  const formatTaskDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long', 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date);
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
        <div className="space-y-0.5 mt-1 mb-2">
          <p className="text-sm font-semibold text-gray-800 flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-[#0D47A1] shrink-0" />
            {rtrw}, {kelurahan}{kecamatan ? `, ${kecamatan}` : ''}
          </p>
          <p className="text-xs text-gray-500 line-clamp-1 ml-4" title={detail}>{detail}</p>
        </div>
      );
    }
    return <p className="text-sm font-medium text-gray-600 mb-2 line-clamp-2">{wilayahStr}</p>;
  };

  const stats = [
    { label: 'Total Helper Wilayah', value: (totalHelper || 0).toString(), icon: Users, color: 'text-white', bg: 'bg-white/20', cardBg: 'bg-brand-gradient text-white border-transparent' },
    { label: 'Antrean Verifikasi', value: (pendingHelperCount || 0).toString(), icon: FileCheck, color: 'text-orange-500', bg: 'bg-orange-50', cardBg: 'bg-white hover:border-orange-200' },
    { label: 'Helper Aktif', value: (activeHelper || 0).toString(), icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50', cardBg: 'bg-white hover:border-green-200' }
  ];

  return (
    <KoordinatorStatusGuard koordinator={koordinator}>
      <div className="p-4 sm:p-6 lg:p-8 font-sans pb-24 max-w-6xl mx-auto">
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-gradient text-white p-8 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Selamat datang, {userData?.full_name || 'Koordinator'}</h1>
            <p className="text-blue-100 mt-2 text-sm sm:text-base">Wilayah Operasional: <span className="font-bold text-white">{koordinator?.wilayah || 'Belum Diatur'}</span></p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${stat.cardBg} p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md relative overflow-hidden group`}>
               {idx === 0 && (
                 <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none transform group-hover:scale-110 transition-transform">
                   <Users className="w-20 h-20 text-white" />
                 </div>
               )}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="relative z-10">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${idx === 0 ? 'text-blue-100' : 'text-gray-500'}`}>{stat.label}</p>
                <p className={`text-3xl font-bold ${idx === 0 ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tasks List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Menunggu Verifikasi Anda</h2>
              {!isProfileIncomplete && (
                <Link href="/koordinator/antrean" className="text-sm font-semibold text-[#0D47A1] hover:underline flex items-center">
                  Lihat Semua <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              )}
            </div>
            
            {isProfileIncomplete ? (
              <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <FileCheck className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Lengkapi Pengajuan Profil</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  Anda harus melengkapi dokumen pengajuan dan mengatur wilayah operasional sebelum bisa melihat dan memverifikasi calon Helper.
                </p>
                <Button asChild className="bg-[#0D47A1] text-white hover:bg-blue-800">
                  <Link href="/koordinator/pengajuan">Isi Formulir Pengajuan Sekarang</Link>
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {pendingHelpers.length > 0 ? pendingHelpers.map((helper: any) => (
                  <div key={helper.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                      <div className="flex-1 w-full relative">
                        <h3 className="text-base font-bold text-gray-900 mb-1">{helper.users?.full_name || 'Helper Anonim'}</h3>
                        {formatWilayah(helper.wilayah_domisili)}
                        <p className="text-xs text-gray-400">Diajukan: {formatTaskDate(helper.created_at)}</p>
                      </div>
                      
                      <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
                        <Button asChild size="sm" className="bg-[#0D47A1] text-white hover:bg-blue-800 w-full sm:w-auto">
                          <Link href={`/koordinator/helper/${helper.id}`}>Review Berkas</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )) : (
                   <div className="p-8 text-center text-gray-500 text-sm">
                     Tidak ada Helper yang menunggu verifikasi.
                   </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Warning Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 relative overflow-hidden">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center relative z-10">
                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                Pemberitahuan Sistem
              </h3>
              <p className="text-sm text-blue-800 mb-4 leading-relaxed relative z-10">
                Pastikan Anda mengecek KTP dan SKCK calon Helper dengan teliti demi keamanan lansia.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
    </KoordinatorStatusGuard>
  );
}