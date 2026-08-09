"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MapPin, Clock, ShieldAlert } from 'lucide-react';

export default function DetailPekerjaanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleTerimaPekerjaan = () => {
    setLoading(true);
    // Simulate API request to accept the job
    setTimeout(() => {
      setLoading(false);
      router.push("/helper/dashboard");
    }, 800);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans pb-24 max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="rounded-full hover:bg-gray-100">
        <Link href="/helper/dashboard">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Kembali ke Dashboard
        </Link>
      </Button>

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="border-b border-gray-100 pb-6 flex items-start gap-5">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src="https://i.pravatar.cc/150?img=11" alt="Foto Lansia" className="w-28 h-28 rounded-2xl object-cover border-2 border-gray-100 shadow-sm" />
           <div>
             <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 font-bold text-xs rounded-full mb-3 tracking-wider">STATUS: DIAJUKAN</span>
             <h1 className="text-2xl font-bold text-gray-900 mb-1">Pendampingan Opa Budi Hartanto</h1>
             <p className="text-gray-500">ID Reservasi: BKG-1029</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-2">Jadwal Tugas</h3>
             <div className="flex items-start gap-3">
               <Clock className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
               <div>
                  <p className="font-semibold text-sm text-gray-900">Besok, 12 Agustus 2026</p>
                  <p className="text-sm text-gray-500">08:00 - 12:00 WIB (4 Jam)</p>
               </div>
             </div>
             
             <div className="flex items-start gap-3">
               <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
               <div>
                  <p className="font-semibold text-sm text-gray-900">Kecamatan Beji</p>
                  <p className="text-sm text-gray-500">Alamat lengkap akan terbuka setelah rincian DIKONFIRMASI.</p>
               </div>
             </div>
          </div>
          
          <div className="space-y-4">
             <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-2">Catatan Kondisi Lansia</h3>
             <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
               <li>Mobilitas terbatas, menggunakan tongkat.</li>
               <li>Hipertensi ringan (jangan aktivitas berat).</li>
             </ul>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-3">
           <ShieldAlert className="w-6 h-6 text-blue-600 shrink-0" />
           <div className="text-sm text-blue-900">
             <p className="font-bold mb-1">Persetujuan Transaksi (State Machine)</p>
             <p>Dengan menekan tombol di bawah, status ini akan berubah mendadi <span className="font-medium bg-white px-1 rounded">DIKONFIRMASI</span> karena batas radius terpenuhi. Tugas mengikat!</p>
           </div>
        </div>

        <Button 
          onClick={handleTerimaPekerjaan} 
          disabled={loading}
          className="w-full h-12 bg-brand-gradient hover:opacity-90 font-bold text-white rounded-xl shadow-md"
        >
          {loading ? "Memproses Transaksi..." : "Terima & Konfirmasi Pekerjaan"}
        </Button>
      </div>
    </div>
  );
}
