import { TaskWithRelations } from '@/types/tasks';

export const MOCK_TASKS: unknown[] = [
  {
    id: 't1-1234',
    keluarga_id: 'fam1',
    lansia_id: 'lan1',
    helper_id: null,
    service_category_id: 'cat1',
    jadwal_waktu: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    jadwal_waktu_asli: null,
    reschedule_count: 0,
    status: 'diajukan',
    harga_dasar: 35000,
    harga_final: 35000,
    dibatalkan_oleh: null,
    alasan_batal: null,
    confirmed_at: null,
    started_at: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    lansia: {
      id: 'lan1',
      nama: 'Bapak Budi',
      alamat: 'Jl. Merdeka No. 1',
      rt: '02',
      rw: '04',
      lat: -6.2,
      lng: 106.8,
      catatan_kondisi: 'Hipertensi, perlu diingatkan minum obat.',
      foto_url: 'https://images.unsplash.com/photo-1544717301-9cdcb1f5940f?auto=format&fit=crop&q=80&w=300&h=300',
    },
    service_category: {
      id: 'cat1',
      nama: 'Antar Obat',
      deskripsi: 'Mengambil dan mengantarkan obat dari apotek ke rumah.',
      estimasi_durasi_menit: 30,
      harga_dasar: 35000,
      is_high_risk: false,
      tingkat: 'ringan',
      lokasi_jemput: 'Apotek Kimia Farma, Jl. Sudirman',
      lokasi_antar: 'Rumah Lansia (Jl. Merdeka No. 1)'
    },
    helper: null
  },
  {
    id: 't2-5678',
    keluarga_id: 'fam1',
    lansia_id: 'lan2',
    helper_id: 'help1',
    service_category_id: 'cat2',
    jadwal_waktu: new Date(Date.now() + 172800000).toISOString(), // In 2 days
    jadwal_waktu_asli: null,
    reschedule_count: 0,
    status: 'dikonfirmasi',
    harga_dasar: 50000,
    harga_final: 50000,
    dibatalkan_oleh: null,
    alasan_batal: null,
    confirmed_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    lansia: {
      id: 'lan2',
      nama: 'Ibu Siti',
      alamat: 'Jl. Sudirman No. 10',
      rt: '05',
      rw: '01',
      lat: -6.21,
      lng: 106.81,
      catatan_kondisi: 'Sering kesepian, butuh teman mengobrol.',
      foto_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=300&h=300',
    },
    service_category: {
      id: 'cat2',
      nama: 'Menemani Mengobrol',
      deskripsi: 'Menemani lansia beraktivitas ringan di rumah.',
      estimasi_durasi_menit: 60,
      harga_dasar: 50000,
      is_high_risk: false,
      tingkat: 'ringan'
    },
    helper: {
      id: 'help1',
      rating_avg: 4.8,
      total_tugas_selesai: 15,
      foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300&h=300',
      user: {
        full_name: 'Andi Helper',
        phone: '08123456789'
      }
    }
  },
  {
    id: 't3-9012',
    keluarga_id: 'fam1',
    lansia_id: 'lan1',
    helper_id: 'help1',
    service_category_id: 'cat3',
    jadwal_waktu: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    jadwal_waktu_asli: null,
    reschedule_count: 0,
    status: 'dikerjakan',
    harga_dasar: 120000,
    harga_final: 120000,
    dibatalkan_oleh: null,
    alasan_batal: null,
    confirmed_at: new Date(Date.now() - 7200000).toISOString(),
    started_at: new Date(Date.now() - 3500000).toISOString(),
    completed_at: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    lansia: {
      id: 'lan1',
      nama: 'Bapak Budi',
      alamat: 'Jl. Merdeka No. 1',
      rt: '02',
      rw: '04',
      lat: -6.2,
      lng: 106.8,
      catatan_kondisi: 'Hipertensi, perlu diantar ke dokter.',
      foto_url: 'https://images.unsplash.com/photo-1544717301-9cdcb1f5940f?auto=format&fit=crop&q=80&w=300&h=300',
    },
    service_category: {
      id: 'cat3',
      nama: 'Kontrol Kesehatan',
      deskripsi: 'Mengantar lansia ke faskes.',
      estimasi_durasi_menit: 90,
      harga_dasar: 120000,
      is_high_risk: true,
      tingkat: 'berat',
      lokasi_jemput: 'Rumah Lansia (Jl. Merdeka No. 1)',
      lokasi_antar: 'RSUD Pasar Minggu'
    },
    helper: {
      id: 'help1',
      rating_avg: 4.8,
      total_tugas_selesai: 15,
      foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300&h=300',
      user: {
        full_name: 'Andi Helper',
        phone: '08123456789'
      }
    }
  }
];
