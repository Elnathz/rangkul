import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  FileCheck, 
  ChevronRight, 
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function KoordinatorDashboardPage() {
  // Mock data for the dashboard
  const stats = [
    { label: 'Total Helper Wilayah', value: '45', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Antrean Verifikasi', value: '3', icon: FileCheck, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Helper Aktif', value: '38', icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' }
  ];

  const pendingHelpers = [
    {
      id: 'HLP-1002',
      name: 'Rina Sulastri',
      date: 'Hari ini, 09:12 WIB',
      location: 'Kec. Beji, Depok',
      status: 'under_review',
    },
    {
      id: 'HLP-1003',
      name: 'Budi Santoso',
      date: 'Kemarin, 14:30 WIB',
      location: 'Kec. Pancoran Mas, Depok',
      status: 'pending',
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans pb-24 max-w-6xl mx-auto">
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Selamat datang, Koordinator Demo</h1>
            <p className="text-gray-500 mt-1">Wilayah Operasional: <span className="font-semibold text-gray-900">Kota Depok</span></p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tasks List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Menunggu Verifikasi Anda</h2>
              <Link href="/koordinator/antrean" className="text-sm font-semibold text-[#0D47A1] hover:underline flex items-center">
                Lihat Semua <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {pendingHelpers.length > 0 ? pendingHelpers.map((helper) => (
                <div key={helper.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <div className="flex-1 w-full relative">
                      <h3 className="text-base font-bold text-gray-900 mb-1">{helper.name}</h3>
                      <p className="text-sm font-medium text-gray-600 mb-2">Area: {helper.location}</p>
                      <p className="text-xs text-gray-400">Diajukan: {helper.date}</p>
                    </div>
                    
                    <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
                      <Button asChild size="sm" className="bg-[#0D47A1] text-white hover:bg-blue-800 w-full sm:w-auto">
                        <Link href={`/koordinator/helper/${helper.id}`}>Review Berkas</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )) : (
                 <div className="p-8 text-center text-gray-500 text-sm">
                   Tidak ada Helper yang menunggu verifikasi.
                 </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Warning Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 relative overflow-hidden">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center relative z-10">
                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                Pemberitahuan Sistem
              </h3>
              <p className="text-sm text-blue-800 mb-4 leading-relaxed relative z-10">
                Pastikan Anda mengecek KTP dan SKCK calon Helper dengan teliti demi keamanan lansia.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}