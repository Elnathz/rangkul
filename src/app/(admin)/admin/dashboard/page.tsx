import React from 'react';
import Link from 'next/link';
import { Users, UserPlus, AlertTriangle, ShieldCheck, Activity, Search } from 'lucide-react';

export default function AdminDashboardPage() {
  const adminStats = [
    { title: 'Total Pengguna', value: '1,492', icon: Users, bg: 'bg-white/20', color: 'text-white', cardBg: 'bg-brand-gradient text-white border-transparent' },
    { title: 'Keluarga Aktif', value: '984', icon: UserPlus, bg: 'bg-blue-50', color: 'text-[#0D47A1]', cardBg: 'bg-white border-blue-100 hover:border-blue-200' },
    { title: 'Aduan Platform', value: '12', icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-600', cardBg: 'bg-white border-red-100 hover:border-red-200' },
    { title: 'Helper Terverifikasi', value: '381', icon: ShieldCheck, bg: 'bg-emerald-50', color: 'text-emerald-600', cardBg: 'bg-white border-emerald-100 hover:border-emerald-200' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Utama</h1>
          <p className="text-gray-500 mt-1">Ringkasan data pengguna dan status sistem saat ini.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
             <input type="text" placeholder="Cari ID transaksi/log..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full md:w-64" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, idx) => (
          <div key={idx} className={`${stat.cardBg} p-6 rounded-2xl border shadow-sm flex flex-col transition-all duration-300 hover:shadow-md relative overflow-hidden group`}>
            {idx === 0 && (
               <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transform group-hover:scale-110 transition-transform">
                 <Users className="w-24 h-24 text-white" />
               </div>
            )}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} relative z-10`}>
               <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className={`text-sm font-semibold relative z-10 ${idx === 0 ? 'text-blue-100' : 'text-gray-500'}`}>{stat.title}</p>
            <p className={`text-3xl font-bold mt-1 relative z-10 ${idx === 0 ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
               <h2 className="text-lg font-bold text-gray-900">Log Aktivitas Terbaru</h2>
               <Link href="/admin/audit-logs" className="text-sm font-semibold text-[#0D47A1] hover:underline">Lihat Semua</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { time: '10:42 AM', action: 'Pemblokiran akun', target: 'Hel-8302', by: 'Sistem' },
                { time: '10:15 AM', action: 'Verifikasi KTP disetujui', target: 'Hel-8305', by: 'Koordinator RT 02' },
                { time: '09:30 AM', action: 'Aduan dilayangkan', target: 'Trx-BKG-102', by: 'User-Fam-92' },
              ].map((log, i) => (
                <div key={i} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                   <div className="flex gap-4 items-center">
                     <span className="text-xs font-mono text-gray-400 w-16">{log.time}</span>
                     <div>
                       <p className="text-sm font-semibold text-gray-900">{log.action}</p>
                       <p className="text-xs text-gray-500">Target ID: <span className="font-mono text-gray-600">{log.target}</span></p>
                     </div>
                   </div>
                   <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">
                     Oleh: {log.by}
                   </span>
                </div>
              ))}
            </div>
         </div>
         
         <div className="bg-brand-gradient rounded-2xl shadow-sm p-8 flex flex-col justify-center items-center text-center relative overflow-hidden text-white">
            <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
            
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-5 shadow-sm backdrop-blur-sm relative z-10 border border-white/30">
               <Activity className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10">Status Server Normal</h3>
            <p className="text-blue-100 text-sm max-w-[200px] leading-relaxed mb-6 relative z-10">
               Seluruh layanan database platform, otentikasi, dan API merespons dengan baik.
            </p>
            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden relative z-10">
               <div className="w-3/4 h-full bg-white rounded-full relative">
                  <div className="absolute inset-0 bg-white/50 animate-[pulse_2s_ease-in-out_infinite]"></div>
               </div>
            </div>
            <p className="text-xs text-blue-200 mt-3 font-semibold uppercase tracking-wider relative z-10">Kapasitas Server 75%</p>
         </div>
      </div>
    </div>
  );
}