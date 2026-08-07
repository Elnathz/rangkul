import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Clock, ChevronRight } from 'lucide-react';

export default function CariPekerjaanPage() {
  const jobs = [
    {
      id: 'BKG-1029',
      lansiaName: 'Opa Budi Hartanto',
      location: 'Kec. Beji, Kota Depok',
      date: 'Besok, 08:00 - 12:00',
      distance: '1.2 km',
      tags: ['Mobilitas Terbatas', 'Butuh Bantuan Kursi Roda']
    },
    {
      id: 'BKG-1030',
      lansiaName: 'Oma Rina Sari',
      location: 'Kec. Pancoran Mas, Kota Depok',
      date: 'Jumat, 15:00 - 18:00',
      distance: '3.5 km',
      tags: ['Teman Mengobrol', 'Demensia Ringan']
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans pb-24 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cari Pekerjaan (Tugas DIAJUKAN)</h1>
          <p className="text-gray-500 mt-1">Pekerjaan di radius &lt; 5 KM dari Anda.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {jobs.map(job => (
          <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6 hover:border-blue-200 transition-colors">
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{job.lansiaName}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#0D47A1] bg-blue-50 px-3 py-1 rounded-full text-sm">{job.distance}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mt-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{job.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-end md:w-48 shrink-0">
              <Button asChild className="w-full bg-[#0D47A1] text-white hover:bg-blue-800">
                <Link href={`/helper/pekerjaan/${job.id}`}>
                  Lihat Detail <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
