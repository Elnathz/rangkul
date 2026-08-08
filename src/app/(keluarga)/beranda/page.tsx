import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  CalendarCheck, 
  PlusCircle,
  Search,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function BerandaKeluargaPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Ambil profil keluarga
  const { data: userProfile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Ambil daftar lansia
  const { data: lansias } = await supabase
    .from('lansia_profiles')
    .select('*')
    .eq('keluarga_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // Ambil jadwal terdekat (task aktif)
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      lansia:lansia_profiles(nama)
    `)
    .eq('keluarga_id', user.id)
    .not('status', 'in', '("selesai","dibatalkan")')
    .order('jadwal_waktu', { ascending: true })
    .limit(1);

  const activeTask = tasks?.[0] || null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans pb-24 max-w-6xl mx-auto">
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-gradient text-white p-8 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Halo, {userProfile?.full_name || 'Keluarga'}
            </h1>
            <p className="text-blue-100 mt-2 text-sm sm:text-base max-w-sm">Kelola profil orang tersayang dan jadwalkan pendampingan dengan tenang.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative z-10 mt-4 sm:mt-0">
            <Button asChild variant="outline" className="w-full sm:w-auto h-11 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-md">
              <Link href="/lansia/tambah">
                <PlusCircle className="mr-2 w-4 h-4" /> Tambah Lansia
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto h-11 bg-white text-[#0D47A1] hover:bg-gray-50 font-bold shadow-md">
              <Link href="/cari-helper">
                <Search className="mr-2 w-4 h-4" /> Cari Helper
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content: Lansia List */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> Profil Lansia Tersimpan
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lansias && lansias.length > 0 ? (
                lansias.map((lansia) => (
                  <div key={lansia.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                      <Users className="w-20 h-20 text-[#0D47A1]" />
                    </div>
                    <div>
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-blue-50 text-blue-700 mb-3 inline-block">
                        {lansia.hubungan_keluarga || 'Keluarga'}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{lansia.nama}</h3>
                      <p className="text-sm font-medium text-gray-500 line-clamp-2">
                        {lansia.catatan_kondisi || 'Tidak ada catatan khusus'}
                      </p>
                    </div>
                    <div className="mt-5 border-t border-gray-50 pt-4 flex gap-2 relative z-10 w-full overflow-hidden">
                      <Button asChild variant="outline" size="sm" className="flex-1 text-xs font-semibold rounded-lg h-8">
                        <Link href={`/lansia/${lansia.id}`}>Lihat Profil</Link>
                      </Button>
                      <Button asChild size="sm" className="flex-1 text-xs font-semibold rounded-lg h-8 bg-brand-gradient hover:opacity-90 text-white">
                        <Link href={`/booking/new?lansia=${lansia.id}`}>Buat Pesanan</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                  <p className="text-sm text-gray-500 mb-4">Belum ada profil lansia yang ditambahkan.</p>
                </div>
              )}
              
              {/* Add New Card */}
              <Link href="/lansia/tambah" className="bg-transparent border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-500 hover:text-[#0D47A1] hover:border-[#0D47A1] hover:bg-[#F5F8FC] transition-all min-h-[180px]">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm">Tambahkan Profil Lansia</span>
              </Link>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Jadwal Terdekat</h3>
                <CalendarCheck className="w-5 h-5 text-gray-400" />
              </div>
              
              {activeTask ? (
                <div className="flex flex-col gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-[10px] font-bold rounded uppercase tracking-wider">
                      {activeTask.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      BKG-{activeTask.id.substring(0, 4).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      Pendampingan {activeTask.lansia?.nama}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(activeTask.jadwal_waktu).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="mt-2 pt-3 border-t border-yellow-200 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-xs font-semibold text-yellow-800">
                       {activeTask.status === 'diajukan' ? (
                         <span className="flex items-center gap-1.5 bg-white/50 px-2 py-0.5 rounded-full border border-yellow-200/50">
                           Sedang mencari Helper
                           <svg className="animate-spin w-3 h-3 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                         </span>
                       ) : (
                         <span>Status: {activeTask.status.replace(/_/g, ' ')}</span>
                       )}
                     </div>
                     <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700">Batalkan</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500">Tidak ada jadwal pendampingan terdekat.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}