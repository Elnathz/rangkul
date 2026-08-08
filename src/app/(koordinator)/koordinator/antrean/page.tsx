import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileCheck, UserCheck, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AntreanHelperPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get Koordinator Profile
  const { data: koordinator } = await supabase
    .from('koordinator_profiles')
    .select('id, wilayah')
    .eq('user_id', user.id)
    .single();

  if (!koordinator) {
    redirect('/koordinator/pengajuan');
  }

  // Fetch pending helpers without koordinator
  const { data: helpers } = await supabase
    .from('helper_profiles')
    .select(`
      id,
      wilayah_domisili,
      status,
      created_at,
      users (
        nama
      )
    `)
    .eq('status', 'pending_verification')
    .is('koordinator_id', null)
    .order('created_at', { ascending: false });

  const pendingHelpers = helpers || [];

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

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link href="/koordinator/dashboard">
              <ChevronLeft className="w-5 h-5" />
              Kembali
            </Link>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Antrean Verifikasi Helper</h1>
        </div>

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
              <div className="text-center py-10">
                <p className="text-gray-500">Tidak ada kandidat helper yang menunggu verifikasi saat ini.</p>
              </div>
            ) : (
              pendingHelpers.map((helper: any) => {
                const nama = Array.isArray(helper.users) ? helper.users[0]?.nama : helper.users?.nama;
                return (
                  <div key={helper.id} className="p-5 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all group bg-white">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#F5F8FC] flex items-center justify-center shrink-0">
                          <UserCheck className="w-6 h-6 text-gray-400 group-hover:text-[#0D47A1] transition-colors" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{nama || 'Nama Tidak Tersedia'}</h3>
                          <p className="text-sm font-medium text-gray-500">{helper.wilayah_domisili}</p>
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
      </div>
    </div>
  );
}
