import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CheckCircle2, XCircle } from 'lucide-react';

export default function KoordinatorDetailHelperPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans pb-24 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="rounded-full hover:bg-gray-100 mb-2">
        <Link href="/koordinator/dashboard">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Dashboard
        </Link>
      </Button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start gap-4">
           <div>
             <h1 className="text-2xl font-bold text-gray-900 mb-1">Verifikasi: Rina Sulastri</h1>
             <p className="text-gray-500">ID: HLP-1002 • Domisili: Kec. Beji, Depok</p>
           </div>
           <span className="bg-orange-100 text-orange-800 font-bold px-3 py-1 text-xs uppercase tracking-wider rounded-full">
             UNDER_REVIEW
           </span>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
              <div>
                 <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Bio Singkat</h3>
                 <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    &quot;Saya memiliki pengalaman 2 tahun mendampingi nenek saya yang demensia. Saya terbiasa dan sabar menghadapi orang tua.&quot;
                 </p>
              </div>
              
              <div>
                 <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Jangkauan Layanan (Radius)</h3>
                 <p className="text-sm text-gray-900 font-medium">Maksimal 5 KM dari domisili</p>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Dokumen Terlampir</h3>
              <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl h-40 flex items-center justify-center flex-col text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
                   <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                 </div>
                 <span className="font-semibold text-sm">Lihat Berkas Identitas KTP</span>
                 <span className="text-xs">File_KTP_Rina.jpg</span>
              </div>
           </div>
        </div>

        <div className="bg-[#F5F8FC] p-6 md:p-8 flex flex-col sm:flex-row gap-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1 h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white shadow-sm font-bold">
            <XCircle className="w-5 h-5 mr-2" /> Tolak Pendaftaran
          </Button>
          <Button className="flex-1 h-12 bg-[#0D47A1] text-white hover:bg-blue-800 shadow-md font-bold">
            <CheckCircle2 className="w-5 h-5 mr-2" /> Setujui Helper
          </Button>
        </div>
      </div>
    </div>
  );
}
