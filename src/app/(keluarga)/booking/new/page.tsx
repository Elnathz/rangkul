import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CalendarClock, User, CheckCircle2 } from 'lucide-react';

export default function BookingNewPage() {
  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link href="/beranda">
              <ChevronLeft className="w-5 h-5" />
              Kembali
            </Link>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Buat Pesanan Pendampingan</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <form className="space-y-6">
            
            {/* Step 1: Lansia Selection */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">1. Pilih Lansia</h2>
              <div className="border border-blue-200 bg-blue-50/50 p-4 rounded-xl flex items-center justify-between cursor-pointer ring-2 ring-blue-500 ring-offset-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Opa Budi Hartanto</p>
                    <p className="text-xs text-gray-500">Kakek - Mobilitas Terbatas</p>
                  </div>
                </div>
                <CheckCircle2 className="text-blue-600 w-5 h-5" />
              </div>
            </div>

            {/* Step 2: Waktu */}
            <div className="space-y-3 pt-2">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">2. Tentukan Tanggal & Jam</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Pilih Tanggal</label>
                  <input type="date" className="w-full flex h-11 rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0D47A1]/50 focus-visible:border-[#0D47A1]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Jam Kedatangan</label>
                  <input type="time" className="w-full flex h-11 rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0D47A1]/50 focus-visible:border-[#0D47A1]" />
                </div>
              </div>
            </div>

            {/* Rekap Biaya */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3 mt-8">
              <h3 className="font-bold text-gray-900">Validasi Pemesanan</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tugas akan berstatus <span className="font-bold text-[#0D47A1]">DIAJUKAN</span> dan mencari Helper tersedia di radius 5 KM (Kec. Beji, Depok). Platform Fee sebesar 7% otomatis dipotong dari dompet pesanan saat pesanan SELESAI.
              </p>
            </div>

            <Button type="button" className="w-full h-12 bg-brand-gradient text-white rounded-xl font-bold shadow-md hover:opacity-90">
              Buat Permintaan
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
