"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock, FileText, Loader2, PlusCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MOCK_TASKS } from "@/lib/mock/tasks";

export default function TugasDetailHelperPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const task = MOCK_TASKS.find(t => t.id === id) || MOCK_TASKS[0]; // fallback
  const [status, setStatus] = useState(task.status);
  const [isSubmittingExtra, setIsSubmittingExtra] = useState(false);
  const [extraRequested, setExtraRequested] = useState(false);
  
  const handleAjukanEkstra = async () => {
    setIsSubmittingExtra(true);
    // Mock API call
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmittingExtra(false);
    setExtraRequested(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="rounded-xl px-4 font-semibold hover:bg-gray-50 flex items-center justify-center gap-2">
            <Link href="/helper/tugas">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Detail Pekerjaan</h1>
            <p className="text-sm text-muted-foreground">ID: {task.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{task.service_category.nama}</h2>
                  <p className="text-sm text-gray-500 mt-1">{task.service_category.deskripsi}</p>
                </div>
                <div className="px-3 py-1 bg-blue-50 text-[#0D47A1] rounded-full text-xs font-bold uppercase tracking-wide">
                  {status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Waktu</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{new Date(task.jadwal_waktu).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Lokasi</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">{task.lansia.alamat}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2">Instruksi Keluarga</h3>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-sm text-amber-900">
                  {task.lansia.catatan_kondisi || "Lansia dalam kondisi sehat. Harap datang tepat waktu."}
                </div>
              </div>
            </div>

            {/* Extra Service Helper Mock */}
            {status === "dikerjakan" && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 space-y-4">
                <div className="flex items-center gap-2 text-[#0D47A1] mb-2">
                  <PlusCircle className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Layanan Tambahan</h3>
                </div>
                <p className="text-sm text-gray-600">Jika pekerjaan melebihi waktu estimasi atau ada kebutuhan mendadak yang memerlukan biaya ekstra, Anda dapat mengajukannya ke Keluarga.</p>
                
                {extraRequested ? (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl flex gap-3 text-yellow-800">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div className="text-sm font-medium">
                      Pengajuan tambahan biaya Rp 50.000 sedang menunggu konfirmasi Keluarga. Anda tidak dapat menyelesaikan tugas ini sampai Keluarga merespon.
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={handleAjukanEkstra} 
                    disabled={isSubmittingExtra}
                    className="w-full bg-[#0D47A1] hover:bg-blue-800 text-white rounded-xl h-12 font-bold"
                  >
                    {isSubmittingExtra ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Ajukan Biaya Tambahan
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 overflow-hidden">
                 <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${task.keluarga_id}&backgroundColor=c0aede`} alt="Keluarga" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Keluarga Lansia</h3>
              <p className="text-sm text-gray-500 mb-6">Pemesan Layanan</p>
              
              <Button asChild variant="outline" className="w-full rounded-xl border-[#0D47A1] text-[#0D47A1] hover:bg-blue-50">
                <Link href="/helper/pesan">Hubungi Keluarga</Link>
              </Button>
            </div>
            
            {status === "dikerjakan" && !extraRequested && (
              <Button asChild className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20">
                <Link href={`/tugas/${task.id}/lapor`}>Selesaikan & Lapor</Link>
              </Button>
            )}
            
            {status === "dikerjakan" && extraRequested && (
              <Button disabled className="w-full h-14 bg-gray-100 text-gray-400 rounded-2xl font-bold cursor-not-allowed">
                Selesaikan & Lapor
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
