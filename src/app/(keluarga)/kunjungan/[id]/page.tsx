"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatusBadge } from "@/components/ui/TaskStatusBadge";
import { MOCK_TASKS } from "@/lib/mock/tasks";
import { Calendar, MapPin, Clock, ArrowLeft, AlertCircle } from "lucide-react";
import { TaskStatus } from "@/lib/constants/task-status";

export default function KunjunganDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  const task = MOCK_TASKS.find(t => t.id === taskId) || MOCK_TASKS[0]; // fallback to first mock for now
  
  const [status, setStatus] = React.useState<TaskStatus>(task.status);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [hasExtraService, setHasExtraService] = React.useState(task.status === "dikerjakan");
  
  const handleCancel = () => {
    if (confirm("Apakah Anda yakin ingin membatalkan pesanan ini? Jika sudah dikonfirmasi, mungkin ada biaya pembatalan.")) {
      setIsCancelling(true);
      setTimeout(() => {
        setStatus("dibatalkan");
        setIsCancelling(false);
      }, 1000);
    }
  };

  const taskDate = new Date(task.jadwal_waktu);

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild className="rounded-xl h-10 w-10 p-0 hover:bg-gray-50 flex items-center justify-center">
              <Link href="/kunjungan">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Detail Kunjungan</h1>
              <p className="text-sm text-muted-foreground font-mono mt-0.5">ID: {task.id}</p>
            </div>
          </div>
        </div>

        <Card className="w-full shadow-xl shadow-slate-200/50 border-none bg-white rounded-3xl overflow-hidden">
          {/* Header of the Big Card */}
          <div className="w-full bg-slate-50 p-6 md:p-8 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">{task.service_category.nama}</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">{task.service_category.deskripsi}</p>
            </div>
            <TaskStatusBadge status={status} className="text-sm px-4 py-2 shadow-sm whitespace-nowrap shrink-0" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Bagian Kiri (Detail & Biaya & Aksi) */}
            <div className="md:col-span-2 p-6 md:p-8 space-y-8 border-r border-gray-100">
               {/* Grid Jadwal & Lokasi */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="bg-[#F5F8FC] p-5 rounded-2xl border border-blue-50/50">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Jadwal</p>
                    <div className="flex items-start gap-3 text-sm font-medium">
                      <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-base text-gray-900" suppressHydrationWarning>{taskDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-muted-foreground mt-1.5" suppressHydrationWarning>Mulai: <span className="text-gray-700 font-semibold">{taskDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></p>
                        <p className="text-muted-foreground" suppressHydrationWarning>Selesai: <span className="text-gray-700 font-semibold">{new Date(taskDate.getTime() + task.service_category.estimasi_durasi_menit * 60000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></p>
                      </div>
                    </div>
                 </div>
                 <div className="bg-[#F5F8FC] p-5 rounded-2xl border border-blue-50/50">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Lansia & Lokasi</p>
                    <div className="flex items-start gap-3 text-sm font-medium">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-base text-gray-900">{task.lansia.nama}</p>
                        {task.service_category.lokasi_jemput ? (
                          <div className="mt-2 space-y-1.5">
                            <p className="text-muted-foreground font-normal text-xs leading-relaxed"><span className="font-semibold text-gray-700">Diambil di:</span><br/>{task.service_category.lokasi_jemput}</p>
                            <p className="text-muted-foreground font-normal text-xs leading-relaxed"><span className="font-semibold text-gray-700">Diantar ke:</span><br/>{task.service_category.lokasi_antar}</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground font-normal text-xs mt-2 leading-relaxed">
                            {task.lansia.alamat}
                            {task.lansia.rt && task.lansia.rw ? `, RT ${task.lansia.rt}/RW ${task.lansia.rw}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                 </div>
               </div>

               <div>
                 <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Catatan Lansia</h3>
                 <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-sm text-amber-900 leading-relaxed shadow-sm">
                   {task.lansia.catatan_kondisi || "Tidak ada catatan khusus."}
                 </div>
               </div>

               {/* Extra Service Approval Mock */}
               {hasExtraService && status === "dikerjakan" && (
                 <div className="shadow-sm border border-blue-200 bg-blue-50/80 rounded-2xl p-5">
                   <h3 className="text-base font-bold text-[#0D47A1] flex items-center gap-2 mb-3">
                     <AlertCircle className="w-5 h-5" /> Pengajuan Layanan Tambahan
                   </h3>
                   <p className="text-sm text-gray-700 mb-4">Helper mengajukan tambahan waktu 1 jam dikarenakan antrean RS yang panjang.</p>
                   <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-100 shadow-sm mb-4">
                     <span className="text-sm font-medium">Tambahan Biaya</span>
                     <span className="text-base font-bold text-[#0D47A1]">Rp 50.000</span>
                   </div>
                   <div className="flex flex-col sm:flex-row gap-3">
                     <Button variant="outline" className="flex-1 rounded-xl bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={() => setHasExtraService(false)}>Tolak</Button>
                     <Button className="flex-1 rounded-xl bg-[#0D47A1] hover:bg-blue-800" onClick={() => { alert("Layanan tambahan disetujui."); setHasExtraService(false); }}>Setujui Tambahan</Button>
                   </div>
                 </div>
               )}

               {/* Aksi Keluarga (Manajemen Kunjungan) */}
               {['diajukan', 'dikonfirmasi'].includes(status) && (
                 <div className="shadow-sm border border-destructive/20 rounded-2xl p-5 bg-red-50/30">
                   <h3 className="text-base font-bold text-destructive flex items-center gap-2 mb-4">
                     <AlertCircle className="w-5 h-5" /> Manajemen Kunjungan
                   </h3>
                   <div className="flex flex-col sm:flex-row gap-3">
                     <Button variant="outline" className="flex-1 rounded-xl bg-white" onClick={() => alert("Fitur Reschedule akan dilanjutkan.")}>Ubah Jadwal</Button>
                     <Button variant="destructive" className="flex-1 rounded-xl" onClick={handleCancel} disabled={isCancelling}>
                       {isCancelling ? "Membatalkan..." : "Batalkan Kunjungan"}
                     </Button>
                   </div>
                 </div>
               )}

               {/* Laporan Helper jika selesai */}
               {status === "selesai" && (
                 <div className="shadow-sm bg-green-50/80 border border-green-200 rounded-2xl p-5">
                   <h3 className="text-base font-bold text-green-800 mb-2">Laporan & Health Snapshot</h3>
                   <p className="text-sm text-muted-foreground italic mb-4">Menunggu implementasi API untuk memuat data laporan dari Helper.</p>
                   <Button className="w-full rounded-xl bg-white text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200" variant="outline" asChild>
                      <Link href={`/lansia/${task.lansia_id}/riwayat`}>Lihat di Riwayat Rangkul</Link>
                   </Button>
                 </div>
               )}

               {/* Rincian Biaya */}
               {(() => {
                 const basePrice = task.harga_dasar;
                 const extraTimePrice = (task.harga_final && task.harga_final > task.harga_dasar) ? (task.harga_final - task.harga_dasar) : 0;
                 const serviceFee = 2500;
                 const tax = Math.round((basePrice + extraTimePrice + serviceFee) * 0.11);
                 const total = basePrice + extraTimePrice + serviceFee + tax;

                 return (
                   <div className="bg-primary/5 p-6 md:p-8 rounded-2xl border border-primary/20">
                     <p className="text-lg font-bold text-foreground border-b border-primary/10 pb-4 mb-5 flex items-center gap-2">Rincian Biaya</p>
                     <div className="space-y-4 text-sm">
                       <div className="flex justify-between items-center text-muted-foreground">
                         <span>Harga Dasar Layanan</span>
                         <span className="font-medium text-foreground text-base">Rp {basePrice.toLocaleString('id-ID')}</span>
                       </div>
                       {extraTimePrice > 0 && (
                         <div className="flex justify-between items-center text-muted-foreground">
                           <span>Layanan Tambahan</span>
                           <span className="font-medium text-foreground text-base">Rp {extraTimePrice.toLocaleString('id-ID')}</span>
                         </div>
                       )}
                       <div className="flex justify-between items-center text-muted-foreground">
                         <span>Biaya Layanan Aplikasi</span>
                         <span className="font-medium text-foreground text-base">Rp {serviceFee.toLocaleString("id-ID")}</span>
                       </div>
                       <div className="flex justify-between items-center text-muted-foreground">
                         <span>Pajak (11%)</span>
                         <span className="font-medium text-foreground text-base">Rp {tax.toLocaleString("id-ID")}</span>
                       </div>
                       <div className="pt-5 border-t border-primary/20 flex justify-between items-center mt-4">
                         <span className="font-bold text-foreground text-lg">Total Pembayaran</span>
                         <span className="text-3xl font-black text-primary">Rp {total.toLocaleString('id-ID')}</span>
                       </div>
                     </div>
                     {/* Pembayaran Demo Link */}
                     {status === "selesai" && (
                       <Button asChild className="w-full mt-6 h-14 bg-brand-gradient text-white rounded-xl shadow-xl shadow-blue-900/20 font-bold text-lg">
                         <Link href={`/pembayaran/${task.id}`}>Selesaikan Pembayaran</Link>
                       </Button>
                     )}
                   </div>
                 );
               })()}
            </div>

            {/* Bagian Kanan (Profil Terkait) */}
            <div className="p-0 bg-slate-50 flex flex-col sm:flex-row md:flex-col h-full">
               <div className="p-6 md:p-8 border-b border-gray-200 sm:border-b-0 sm:border-r md:border-r-0 md:border-b flex-1 flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg bg-muted">
                    <a href={task.lansia.foto_url || "https://api.dicebear.com/9.x/avataaars/svg?seed=lansia"} target="_blank" rel="noreferrer">
                      <img src={task.lansia.foto_url || "https://api.dicebear.com/9.x/avataaars/svg?seed=lansia"} alt={task.lansia.nama} className="w-full h-full object-cover" />
                    </a>
                  </div>
                  <h3 className="font-bold text-xl">{task.lansia.nama}</h3>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mt-2 bg-primary/10 px-3 py-1.5 rounded-full">Lansia yang Didampingi</p>
               </div>

               <div className="p-6 md:p-8 flex-1 flex flex-col items-center text-center">
                  {task.helper ? (
                    <>
                      <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg bg-muted">
                        {task.helper.foto_url ? (
                          <a href={task.helper.foto_url} target="_blank" rel="noreferrer">
                            <img src={task.helper.foto_url} alt={task.helper.user.full_name} className="w-full h-full object-cover" />
                          </a>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-4xl">
                            {task.helper.user.full_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-xl">{task.helper.user.full_name}</h3>
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-2 bg-amber-100 px-3 py-1.5 rounded-full">Helper Terpercaya</p>
                      <div className="text-sm font-medium text-amber-600 flex items-center justify-center gap-1 my-4">
                        ★ {task.helper.rating_avg} <span className="text-muted-foreground">({task.helper.total_tugas_selesai} tugas)</span>
                      </div>
                      <div className="w-full flex flex-col gap-3 mt-auto pt-4">
                        <Button className="w-full rounded-xl bg-white shadow-sm" variant="outline" asChild>
                          <Link href="/beranda/pesan">Hubungi Helper</Link>
                        </Button>
                        {['dikonfirmasi', 'dikerjakan', 'selesai'].includes(status) && (
                          <Button className="w-full rounded-xl text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 bg-white shadow-sm" variant="outline" asChild>
                            <Link href={`/kunjungan/${task.id}/laporkan`}>Laporkan Helper</Link>
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground flex flex-col items-center justify-center flex-1 py-8">
                      <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                         <Clock className="w-8 h-8 text-primary/40" />
                      </div>
                      <p className="text-sm font-medium">Mencari Helper di<br/>sekitar lokasi...</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
