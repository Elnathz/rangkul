import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MapPin, Image as ImageIcon } from 'lucide-react';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { resolvePrivatePhotoUrl } from '@/lib/storage/private-object';
import KoordinatorStatusGuard from '@/components/koordinator/KoordinatorStatusGuard';
import HelperVerificationButtons from '@/components/koordinator/HelperVerificationButtons';
import MapRadiusViewer from '@/components/koordinator/MapRadiusViewer';
import HelperPhotoApprovalButton from '@/components/koordinator/HelperPhotoApprovalButton';

export default async function KoordinatorDetailHelperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Validasi sesi
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Ambil profil koordinator untuk KoordinatorStatusGuard
  const { data: koordinator } = await supabase
    .from('koordinator_profiles')
    .select('id, wilayah, status')
    .eq('user_id', user.id)
    .single();

  if (!koordinator || koordinator.status !== 'verified') {
    redirect('/dashboard');
  }

  // Fetch profil helper beserta data user-nya
  const { data: helper } = await supabase
    .from('helper_profiles')
    .select(`
      *,
      users ( full_name, email, phone )
    `)
    .eq('id', id)
    .single();

  if (!helper) {
    return (
      <KoordinatorStatusGuard koordinator={koordinator}>
        <div className="p-8 text-center text-gray-500 font-sans mt-12">
          Data helper tidak ditemukan.
        </div>
      </KoordinatorStatusGuard>
    );
  }

  const { data: pendingPhotoRequest } = await supabase
    .from('helper_photo_change_requests')
    .select('id, foto_wajah_url')
    .eq('helper_id', helper.id)
    .eq('status', 'pending')
    .maybeSingle();

  const privateDocumentReader = await createAdminClient();
  const signPrivateDocument = async (path: string, expiresIn: number) => {
    const { data } = await privateDocumentReader.storage.from('dokumen').createSignedUrl(path, expiresIn);
    return data?.signedUrl ?? null;
  };
  const [helperPhotoUrl, helperKtpUrl, pendingPhotoUrl] = await Promise.all([
    resolvePrivatePhotoUrl(helper.foto_wajah_url, signPrivateDocument),
    resolvePrivatePhotoUrl(helper.ktp_url, signPrivateDocument),
    resolvePrivatePhotoUrl(pendingPhotoRequest?.foto_wajah_url, signPrivateDocument),
  ]);

  // Fetch Kategori yang dipilih Helper lewat tabel relasi
  let categories: string[] = [];
  const { data: catData } = await supabase
    .from('helper_service_categories')
    .select(`
      service_categories ( nama )
    `)
    .eq('helper_id', helper.id);
  
  if (catData) {
    categories = catData.map((c) => c.service_categories?.nama).filter((name): name is string => Boolean(name));
  }

  // Pengelompokan Kategori
  const tierRingan = ["Pengingat Obat", "Menemani Mengobrol (singkat)", "Bantuan Teknologi (singkat)", "Bersih-bersih Ringan", "Antar Obat (dekat, ≤1 km)"];
  const tierSedang = ["Menemani Mengobrol (lama)", "Bantuan Teknologi (lama)", "Antar Obat (sedang, 1–3 km)", "Belanja Kebutuhan (standar)"];
  const tierBerat = ["Antar Obat (jauh, >3 km)", "Bersih-bersih Menyeluruh", "Kontrol Kesehatan (antar ke faskes)", "Belanja Kebutuhan (besar/jauh)"];

  const catRingan = categories.filter(c => tierRingan.includes(c));
  const catSedang = categories.filter(c => tierSedang.includes(c));
  const catBerat = categories.filter(c => tierBerat.includes(c));
  const catLainnya = categories.filter(c => !tierRingan.includes(c) && !tierSedang.includes(c) && !tierBerat.includes(c));

  // Fungsi utilitas untuk mem-format string lokasi (sama seperti di halaman antrean)
  const formatWilayah = (wilayahStr: string) => {
    if (!wilayahStr) return <span className="text-sm text-gray-500">-</span>;
    const parts = wilayahStr.split(' | ');
    if (parts.length >= 3) {
      const region = parts[0].split(',').map((s: string) => s.trim());
      const kelurahan = region[0];
      const kecamatan = region[1] || '';
      const rtrw = parts[1];
      const detail = parts[2];
      return (
        <div className="space-y-0.5 mt-2">
          <p className="text-sm font-semibold text-gray-800 flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-[#0D47A1] shrink-0" />
            {rtrw}, {kelurahan}{kecamatan ? `, ${kecamatan}` : ''}
          </p>
          <p className="text-xs text-gray-500 mt-1" title={detail}>{detail}</p>
        </div>
      );
    }
    return <p className="text-sm font-medium text-gray-500 mt-2">{wilayahStr}</p>;
  };

  return (
    <KoordinatorStatusGuard koordinator={koordinator}>
      <div className="p-4 sm:p-6 lg:p-8 font-sans pb-24 max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" asChild className="rounded-full hover:bg-gray-100 mb-2">
          <Link href="/koordinator/antrean">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Kembali ke Antrean
          </Link>
        </Button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start gap-4">
             <div>
               <h1 className="text-2xl font-bold text-gray-900 mb-1">Verifikasi: {helper.users?.full_name || 'Helper Anonim'}</h1>
               <div className="text-gray-500 text-sm mt-1 mb-2 space-y-1">
                 <div>ID: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{helper.id.split('-')[0].toUpperCase()}-{helper.id.substring(helper.id.length - 4)}</span></div>
                 <div>Kontak: {helper.users?.phone || '-'} • {helper.users?.email || '-'}</div>
               </div>
               {formatWilayah(helper.wilayah_domisili)}
             </div>
             <span className={`font-bold px-3 py-1 text-xs uppercase tracking-wider rounded-full ${
                helper.status === 'pending_verification' ? 'bg-orange-100 text-orange-800' :
                helper.status === 'verified' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
             }`}>
               {helper.status === 'pending_verification' ? 'MENUNGGU VERIFIKASI' : helper.status.replace('_', ' ')}
             </span>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-6">
                {pendingPhotoRequest && pendingPhotoUrl && <HelperPhotoApprovalButton requestId={pendingPhotoRequest.id} photoUrl={pendingPhotoUrl} />}
                <div>
                   <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Bio Singkat & Pengalaman</h3>
                   <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">
                      {helper.bio || 'Tidak ada bio yang dilampirkan.'}
                   </p>
                </div>
                
                <div>
                   <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Kategori Layanan Tersedia</h3>
                   {categories.length > 0 ? (
                     <div className="space-y-3">
                       {catRingan.length > 0 && (
                         <div>
                           <div className="text-xs font-bold text-gray-500 mb-1.5 uppercase">Tugas Ringan</div>
                           <div className="flex flex-wrap gap-2">
                             {catRingan.map((cat, idx) => (
                               <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-[#0D47A1] border border-blue-100">
                                 {cat}
                               </span>
                             ))}
                           </div>
                         </div>
                       )}
                       {catSedang.length > 0 && (
                         <div>
                           <div className="text-xs font-bold text-gray-500 mb-1.5 uppercase">Tugas Sedang</div>
                           <div className="flex flex-wrap gap-2">
                             {catSedang.map((cat, idx) => (
                               <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                 {cat}
                               </span>
                             ))}
                           </div>
                         </div>
                       )}
                       {catBerat.length > 0 && (
                         <div>
                           <div className="text-xs font-bold text-gray-500 mb-1.5 uppercase">Tugas Berat & Medis</div>
                           <div className="flex flex-wrap gap-2">
                             {catBerat.map((cat, idx) => (
                               <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                 {cat}
                               </span>
                             ))}
                           </div>
                         </div>
                       )}
                       {catLainnya.length > 0 && (
                         <div>
                           <div className="text-xs font-bold text-gray-500 mb-1.5 uppercase">Lainnya</div>
                           <div className="flex flex-wrap gap-2">
                             {catLainnya.map((cat, idx) => (
                               <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                                 {cat}
                               </span>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>
                   ) : (
                     <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg text-center border border-dashed border-gray-200">Belum ada kategori layanan yang dipilih oleh Helper ini.</p>
                   )}
                </div>

                <div>
                   <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Jangkauan Layanan (Radius)</h3>
                   <p className="text-sm text-gray-900 font-medium bg-green-50 text-green-800 px-3 py-2 rounded-lg inline-block border border-green-100">
                     Maksimal {helper.radius_layanan_km || 1} KM dari domisili
                   </p>
                   {helper.domisili_lat && helper.domisili_lng && (
                     <MapRadiusViewer 
                       lat={helper.domisili_lat} 
                       lng={helper.domisili_lng} 
                       radiusKm={helper.radius_layanan_km || 1} 
                     />
                   )}
                </div>
             </div>

             <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Foto Wajah Terkini</h3>
                  {helperPhotoUrl ? (
                    <div className="border border-gray-200 bg-gray-50 rounded-xl overflow-hidden shadow-sm relative group aspect-square max-w-[240px]">
                       <img 
                         src={helperPhotoUrl}
                         alt="Foto Wajah Helper" 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                       />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a href={helperPhotoUrl} target="_blank" rel="noreferrer" className="bg-white text-gray-900 px-3 py-2 rounded-lg font-bold text-xs shadow-lg flex items-center hover:bg-gray-50">
                           <ImageIcon className="w-4 h-4 mr-1.5" />
                           Layar Penuh
                         </a>
                       </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl aspect-square max-w-[240px] flex items-center justify-center flex-col text-gray-500">
                       <span className="font-semibold text-xs text-center px-4">Tidak ada foto wajah</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Dokumen Terlampir (KTP)</h3>
                  {helperKtpUrl ? (
                    <div className="border border-gray-200 bg-gray-50 rounded-xl overflow-hidden shadow-sm relative group aspect-[4/3] w-full max-w-sm">
                       <img
                         src={helperKtpUrl}
                         alt="KTP Helper"
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                       />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <a href={helperKtpUrl} target="_blank" rel="noreferrer" className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center hover:bg-gray-50">
                           <ImageIcon className="w-4 h-4 mr-2" />
                           Lihat Layar Penuh
                         </a>
                       </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl aspect-[4/3] w-full max-w-sm flex items-center justify-center flex-col text-gray-500">
                       <span className="font-semibold text-sm">Tidak ada dokumen</span>
                    </div>
                  )}
                </div>
             </div>
          </div>

          {helper.status === 'pending_verification' && (
            <HelperVerificationButtons helperId={helper.id} />
          )}
        </div>
      </div>
    </KoordinatorStatusGuard>
  );
}
