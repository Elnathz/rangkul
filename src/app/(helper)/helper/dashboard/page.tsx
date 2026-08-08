import React from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Wallet 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HelperDashboardPage() {
  // Mock data for the dashboard
  const stats = [
    { label: 'Tugas Aktif', value: '2', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Menunggu Verifikasi', value: '1', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Tugas Selesai', value: '14', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Estimasi Fee', value: 'Rp 650.000', icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const recentTasks = [
    {
      id: 'TASK-001',
      title: 'Pendampingan Cek Rutin',
      lansiaName: 'Opa Budi',
      date: 'Besok, 09:00 WIB',
      location: 'RS Hermina Depok',
      status: 'active',
    },
    {
      id: 'TASK-002',
      title: 'Jalan Pagi & Mengobrol',
      lansiaName: 'Oma Siti',
      date: 'Sabtu, 12 Ags - 07:00 WIB',
      location: 'Taman Merdeka, Pancoran Mas',
      status: 'pending',
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FC] p-4 sm:p-6 lg:p-8 font-sans pb-24">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Selamat datang, Helper Demo</h1>
            <p className="text-gray-500 mt-1">Status Anda saat ini: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">Terverifikasi</span></p>
          </div>
          <Button asChild className="bg-brand-gradient text-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <Link href="/helper/tugas/baru">
              Cari Pekerjaan
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tasks List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Jadwal Terdekat</h2>
              <Link href="/helper/tugas" className="text-sm font-semibold text-[#0D47A1] hover:underline flex items-center">
                Lihat Semua <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {recentTasks.map((task) => (
                <div key={task.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${
                          task.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {task.status === 'active' ? 'AKTIF' : 'MENUNGGU VERIFIKASI'}
                        </span>
                        <span className="text-sm font-semibold text-gray-400">{task.id}</span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">{task.title}</h3>
                      <p className="text-sm font-medium text-gray-600 mb-3">Klien: {task.lansiaName}</p>
                      
                      <div className="flex flex-col gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 shrink-0 text-gray-400" />
                          <span>{task.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                          <span className="line-clamp-1">{task.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end justify-between mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                      <Button asChild variant="outline" size="sm" className="rounded-lg font-semibold w-full sm:w-auto h-9">
                        <Link href={`/helper/pekerjaan/${task.id}`}>Lihat Detail</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Action Required Banner */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <AlertCircle className="w-24 h-24 text-orange-600" />
              </div>
              <h3 className="font-bold text-orange-900 mb-2 flex items-center relative z-10">
                <AlertCircle className="w-5 h-5 mr-2" />
                Lengkapi Profil
              </h3>
              <p className="text-sm text-orange-800 mb-4 leading-relaxed relative z-10">
                Anda memiliki beberapa dokumen yang perlu diperbarui agar dapat menerima tugas baru.
              </p>
              <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg w-full font-semibold relative z-10">
                <Link href="/helper/verifikasi">Perbarui Sekarang</Link>
              </Button>
            </div>

            {/* Quick Links / Resources */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Informasi Penting</h3>
              <ul className="space-y-3">
                {[
                  { title: 'SOP Pendampingan Lansia', link: '#' },
                  { title: 'Panduan Darurat Medis', link: '#' },
                  { title: 'Kebijakan Komisi 3% Rangkul', link: '#' }
                ].map((item, i) => (
                  <li key={i}>
                    <Link href={item.link} className="group flex items-center justify-between text-sm p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-gray-700 font-medium group-hover:text-[#0D47A1] transition-colors">{item.title}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0D47A1] transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}