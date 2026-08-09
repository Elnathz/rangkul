import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function CariPekerjaanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get helper profile to calculate distance if needed (and to ensure they are verified)
  const { data: profile } = await supabase
    .from('helper_profiles')
    .select('id, status, domisili_lat, domisili_lng')
    .eq('user_id', user.id)
    .single();

  if (profile?.status !== 'verified') {
    // If not verified, they shouldn't take jobs, but we still render the page
    // Maybe show a warning, or just an empty list. We'll show the list but they can't apply later.
  }

  // Fetch available jobs (status = 'diajukan', helper_id is null)
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      id,
      jadwal_waktu,
      harga_dasar,
      lansia_profiles ( nama, alamat, lat, lng, catatan_kondisi ),
      service_categories ( nama, tingkat )
    `)
    .eq('status', 'diajukan')
    .is('helper_id', null)
    .order('created_at', { ascending: false });

  const jobs = tasks || [];

  // Haversine distance function (simplified)
  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);  
    const dLon = (lon2 - lon1) * (Math.PI / 180); 
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const d = R * c; 
    return d.toFixed(1);
  }

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans pb-24 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cari Pekerjaan (Tugas DIAJUKAN)</h1>
          <p className="text-gray-500 mt-1">Pekerjaan di radius &lt; 5 KM dari Anda.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {jobs.length > 0 ? jobs.map(job => {
          const lansia = job.lansia_profiles;
          const category = job.service_categories;
          
          let distanceStr = '? km';
          if (profile?.domisili_lat && profile?.domisili_lng && lansia?.lat && lansia?.lng) {
            const dist = getDistance(profile.domisili_lat, profile.domisili_lng, lansia.lat, lansia.lng);
            if (dist) distanceStr = `${dist} km`;
          }

          // Build tags from category name, condition, etc.
          const tags = [];
          if (category?.nama) tags.push(category.nama);
          if (category?.tingkat) tags.push(`Tingkat ${category.tingkat.charAt(0).toUpperCase() + category.tingkat.slice(1)}`);
          if (lansia?.catatan_kondisi) tags.push('Perhatian Khusus');

          return (
            <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6 hover:border-blue-200 transition-colors">
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{lansia?.nama || 'Lansia Anonim'}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-[#0D47A1] bg-blue-50 px-3 py-1 rounded-full text-sm">{distanceStr}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mt-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="line-clamp-1">{lansia?.alamat || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{formatTaskDate(job.jadwal_waktu)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-end w-full md:w-48 shrink-0 mt-4 md:mt-0">
                <Button asChild className="w-full bg-[#0D47A1] text-white hover:bg-blue-800">
                  <Link href={`/helper/pekerjaan/${job.id}`}>
                    Lihat Detail <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        }) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
             <p className="text-gray-500 font-medium">Belum ada tugas baru yang tersedia di wilayah Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
