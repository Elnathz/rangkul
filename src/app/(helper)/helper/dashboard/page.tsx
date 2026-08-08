"use client";

import React, { useState, useEffect } from 'react';
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
  const [helperStatus, setHelperStatus] = useState<'pending' | 'under_review' | 'verified' | 'rejected'>('rejected');

  useEffect(() => {
    const savedStatus = sessionStorage.getItem("mock_helper_status");
    if (savedStatus) {
      setHelperStatus(savedStatus as any);
    }
  }, []);

  // Mock data for the dashboard
  const stats = [
    { label: 'Tugas Aktif', value: '2', icon: Briefcase, color: 'text-white', bg: 'bg-white/20', cardBg: 'bg-brand-gradient text-white border-transparent' },
    { label: 'Menunggu Verifikasi', value: '1', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', cardBg: 'bg-white hover:border-orange-200' },
    { label: 'Tugas Selesai', value: '14', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', cardBg: 'bg-white hover:border-green-200' },
    { label: 'Estimasi Fee', value: 'Rp 650.000', icon: Wallet, color: 'text-[#0D47A1]', bg: 'bg-blue-50', cardBg: 'bg-white hover:border-blue-200' },
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-gradient text-white p-8 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Selamat datang, Helper Demo</h1>
            <p className="text-blue-100 mt-2 text-sm sm:text-base">Status Anda saat ini: 
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ml-2 uppercase tracking-wider backdrop-blur-md ${
                helperStatus === 'verified' ? 'bg-green-500/20 text-white border-green-300/30' :
                helperStatus === 'rejected' ? 'bg-red-500/20 text-white border-red-300/30' :
                'bg-orange-500/20 text-white border-orange-300/30'
              }`}>
                {helperStatus === 'under_review' ? 'Sedang Ditinjau' : helperStatus}
              </span>
            </p>
          </div>
          {helperStatus === 'verified' && (
            <Button asChild className="bg-white text-[#0D47A1] rounded-xl shadow-md hover:bg-gray-50 font-bold transition-all relative z-10 mt-2 sm:mt-0">
              <Link href="/helper/tugas/baru">
                Cari Pekerjaan
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${stat.cardBg} p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md relative overflow-hidden group`}>
               {idx === 0 && (
                 <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none transform group-hover:scale-110 transition-transform">
                   <Briefcase className="w-20 h-20 text-white" />
                 </div>
               )}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="relative z-10">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${idx === 0 ? 'text-blue-100' : 'text-gray-500'}`}>{stat.label}</p>
                <p className={`text-2xl font-bold ${idx === 0 ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
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
            {helperStatus === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <AlertCircle className="w-24 h-24 text-red-600" />
                </div>
                <h3 className="font-bold text-red-900 mb-2 flex items-center relative z-10">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Berkas Ditolak Koordinator
                </h3>
                <p className="text-sm text-red-800 mb-4 leading-relaxed relative z-10">
                  Mohon perbaiki dan perbarui profil Anda berdasarkan revisi Koordinator wilayah Anda untuk dapat mulai mengambil pekerjaan!
                </p>
                <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-lg w-full font-semibold relative z-10">
                  <Link href="/helper/verifikasi">Perbarui Sekarang</Link>
                </Button>
              </div>
            )}
            
            {(helperStatus === 'pending' || helperStatus === 'under_review') && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Clock className="w-24 h-24 text-orange-600" />
                </div>
                <h3 className="font-bold text-orange-900 mb-2 flex items-center relative z-10">
                   <Clock className="w-5 h-5 mr-2" />
                   Sedang Diproses
                </h3>
                <p className="text-sm text-orange-800 leading-relaxed relative z-10">
                  Silakan tunggu hingga Koordinator setempat selesai memvalidasi dan mewawancarai Anda. Anda belum dapat mengambil orderan pesanan Lansia.
                </p>
              </div>
            )}

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