import React from 'react';
import Link from 'next/link';
import { Users, UserPlus, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AdminDashboardPage() {
  const adminStats = [
    { title: 'Total Pengguna', value: '1,492', icon: Users, bg: 'bg-indigo-50', color: 'text-indigo-600' },
    { title: 'Keluarga Aktif', value: '984', icon: UserPlus, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { title: 'Aduan Platform', value: '12', icon: AlertTriangle, bg: 'bg-rose-50', color: 'text-rose-600' },
    { title: 'Helper Terverifikasi', value: '381', icon: ShieldCheck, bg: 'bg-sky-50', color: 'text-sky-600' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ikhtisar Platform (Sprint 1)</h1>
        <p className="text-gray-500 mt-1">Pemantauan metrik master dari dashboard sistem Rangkul.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}>
               <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-sm font-semibold text-gray-500">{stat.title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-50 pb-2">Log Audit Sistem</h2>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-2 bg-[#0D47A1] rounded-full shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Koordinator Budi menyetujui Helper Rina</p>
                    <p className="text-xs text-gray-400">10 Menit yang lalu</p>
                  </div>
                </div>
              ))}
            </div>
         </div>
         <div className="bg-[#F5F8FC] rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-center items-center text-center">
            <ShieldCheck className="w-16 h-16 text-[#0D47A1] opacity-50 mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Semua Sistem Berjalan Normal</h3>
            <p className="text-gray-500 text-sm max-w-sm">
               Infrastruktur sinkronisasi IndexedDB, Edge Functions penjadwalan transaksi otomatis, dan filter RLS Supabase aktif.
            </p>
         </div>
      </div>
    </div>
  );
}