import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileCheck, UserCheck, CheckCircle2 } from 'lucide-react';

export default function AntreanHelperPage() {
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
      status: 'under_review',
    },
    {
      id: 'HLP-1004',
      name: 'Siti Aminah',
      date: '2 Hari lalu',
      location: 'Kec. Pancoran Mas, Depok',
      status: 'pending',
    },
    {
      id: 'HLP-1005',
      name: 'Tono Subroto',
      date: 'Minggu lalu',
      location: 'Kec. Beji, Depok',
      status: 'verified',
    },
    {
      id: 'HLP-1006',
      name: 'Nina Maharani',
      date: 'Bulan lalu',
      location: 'Kec. Beji, Depok',
      status: 'rejected',
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link href="/koordinator/dashboard">
              <ChevronLeft className="w-5 h-5" />
              Kembali
            </Link>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Antrean Verifikasi Helper</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
             <div className="p-3 bg-blue-50 text-[#0D47A1] rounded-xl">
               <FileCheck className="w-6 h-6" />
             </div>
             <div>
               <h2 className="text-lg font-bold text-gray-900">{pendingHelpers.filter(h => h.status === 'under_review' || h.status === 'pending').length} Kandidat Menunggu</h2>
               <p className="text-sm text-gray-500">Tinjau kelengkapan dokumen calon Helper di wilayah pengawasan Anda.</p>
             </div>
          </div>

          {pendingHelpers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <UserCheck className="w-8 h-8 text-[#0D47A1]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Antrean Verifikasi Kosong</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Saat ini tidak ada Helper baru yang membutuhkan validasi dokumen di wilayah binaan Anda. Anda bisa bersantai sejenak!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingHelpers.map((helper) => (
                <div key={helper.id} className="p-5 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all group bg-white">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-[#F5F8FC] flex items-center justify-center shrink-0">
                        <UserCheck className="w-6 h-6 text-gray-400 group-hover:text-[#0D47A1] transition-colors" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{helper.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            helper.status === 'verified' ? 'bg-green-100 text-green-700' :
                            helper.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            helper.status === 'under_review' ? 'bg-blue-100 text-[#0D47A1]' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {helper.status === 'under_review' ? 'Sedang Ditinjau' : helper.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-500">{helper.location}</p>
                        <p className="text-xs text-gray-400 mt-1">Dikirim pada: {helper.date}</p>
                      </div>
                    </div>
                    
                    {['pending', 'under_review'].includes(helper.status) && (
                      <div className="flex items-center gap-2 w-full mt-3 pt-4 border-t border-gray-100 sm:w-auto sm:mt-0 sm:pt-0 sm:border-0">
                        <Button variant="outline" className="flex-1 sm:flex-none border-gray-200">
                          Tolak
                        </Button>
                        <Button asChild className="flex-1 sm:flex-none bg-[#0D47A1] text-white hover:bg-blue-800">
                          <Link href={`/koordinator/helper/${helper.id}`}>
                            <CheckCircle2 className="w-4 h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Validasi Berkas</span>
                            <span className="sm:hidden">Validasi</span>
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
