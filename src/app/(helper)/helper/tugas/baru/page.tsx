import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CariPekerjaanClient from './CariPekerjaanClient';

export default async function CariPekerjaanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get helper profile to calculate distance if needed (and to ensure they are verified)
  const { data: profile } = await supabase
    .from('helper_profiles')
    .select('id, status, domisili_lat, domisili_lng, radius_layanan_km')
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

  let jobs = tasks || [];

  if (jobs.length === 0) {
    // Inject mock data if DB is empty for Sprint 2 testing
    const { MOCK_TASKS } = require('@/lib/mock/tasks');
    jobs = MOCK_TASKS.filter((t: any) => t.status === 'diajukan').map((t: any) => ({
      id: t.id,
      jadwal_waktu: t.jadwal_waktu,
      harga_dasar: t.harga_dasar,
      lansia_profiles: {
        nama: t.lansia.nama,
        alamat: t.lansia.alamat,
        lat: t.lansia.lat,
        lng: t.lansia.lng,
        catatan_kondisi: t.lansia.catatan_kondisi,
      },
      service_categories: {
        nama: t.service_category.nama,
        tingkat: 'ringan' // default for mock
      },
      _isMock: true
    }));
  }

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

  // Map to JobData format for Client Component
  const formattedJobs = jobs.map((job: any) => {
    const lansia = job.lansia_profiles;
    const category = job.service_categories;
    
    let distanceKm: number | null = null;
    let distanceStr = '? km';
    
    if (job._isMock) {
      // Force mock jobs to be within radius so they always show up for testing
      distanceKm = 0.5;
      distanceStr = "0.5 km";
    } else if (profile?.domisili_lat && profile?.domisili_lng && lansia?.lat && lansia?.lng) {
      distanceKm = parseFloat(getDistance(profile.domisili_lat, profile.domisili_lng, lansia.lat, lansia.lng) || '0');
      if (distanceKm !== null) distanceStr = `${distanceKm} km`;
    }

    return {
      id: job.id,
      jadwal_waktu: job.jadwal_waktu,
      harga_dasar: job.harga_dasar,
      lansia_nama: lansia?.nama || 'Lansia Anonim',
      lansia_alamat: lansia?.alamat || '-',
      catatan_kondisi: lansia?.catatan_kondisi || '',
      kategori_nama: category?.nama || 'Tugas',
      kategori_tingkat: category?.tingkat || 'ringan',
      distanceKm,
      distanceStr,
    };
  });

  return (
    <CariPekerjaanClient 
      initialJobs={formattedJobs} 
      radius={Number(profile?.radius_layanan_km) || 1} 
      isVerified={profile?.status === 'verified'}
      helperStatus={profile?.status}
    />
  );
}
