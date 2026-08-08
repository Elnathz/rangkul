"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  CalendarCheck, 
  PlusCircle,
  Search,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BerandaKeluargaPage() {
  const lansias = [
    {
      id: 'LNS-001',
      name: 'Opa Haryono',
      relationship: 'Kakek',
      condition: 'Butuh bantuan berjalan',
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans pb-24 max-w-6xl mx-auto">
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Halo, Keluarga Demo</h1>
            <p className="text-gray-500 mt-1">Kelola profil lansia dan jadwalkan pendampingan dengan mudah.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button asChild variant="outline" className="flex-1 sm:flex-none h-11 border-border font-semibold text-gray-700">
              <Link href="/lansia/tambah">
                <PlusCircle className="mr-2 w-4 h-4" /> Tambah Lansia
              </Link>
            </Button>
            <Button asChild className="flex-1 sm:flex-none h-11 bg-brand-gradient text-white font-semibold">
              <Link href="/cari-helper">
                <Search className="mr-2 w-4 h-4" /> Cari Helper
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content: Lansia List */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> Profil Lansia Tersimpan
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lansias.map((lansia) => (
                <div key={lansia.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                    <Users className="w-20 h-20 text-[#0D47A1]" />
                  </div>
                  <div>
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-blue-50 text-blue-700 mb-3 inline-block">
                      {lansia.relationship}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{lansia.name}</h3>
                    <p className="text-sm font-medium text-gray-500 line-clamp-2">{lansia.condition}</p>
                  </div>
                  <div className="mt-5 border-t border-gray-50 pt-4 flex gap-2 relative z-10">
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold rounded-lg h-8">Lihat Profil</Button>
                    <Button asChild size="sm" className="w-full text-xs font-semibold rounded-lg h-8 bg-brand-gradient hover:opacity-90 text-white">
                      <Link href={`/booking/new?lansia=${lansia.id}`}>Buat Pesanan</Link>
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Add New Card */}
              <Link href="/lansia/tambah" className="bg-transparent border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-500 hover:text-[#0D47A1] hover:border-[#0D47A1] hover:bg-[#F5F8FC] transition-all min-h-[180px]">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm">Tambahkan Profil Lansia</span>
              </Link>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Jadwal Terdekat</h3>
                <CalendarCheck className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CalendarCheck className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 font-medium">Belum ada kunjungan yang dijadwalkan.</p>
                <Button asChild variant="link" className="text-[#0D47A1] h-auto p-0 mt-2 font-semibold">
                  <Link href="/cari-helper">Cari Helper Sekarang</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}