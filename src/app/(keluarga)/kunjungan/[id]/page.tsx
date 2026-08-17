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
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="rounded-xl px-4 font-semibold hover:bg-gray-50 flex items-center justify-center gap-2">
            <Link href="/kunjungan">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Detail Kunjungan</h1>
            <p className="text-sm text-muted-foreground">ID: {task.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-md border-none bg-white">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold">{task.service_category.nama}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">{task.service_category.deskripsi}</p>
                  </div>
                  <TaskStatusBadge status={status} className="text-sm px-3 py-1" />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#F5F8FC] p-4 rounded-2xl">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Jadwal</p>
                    <div className="flex items-start gap-2 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p>{taskDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-muted-foreground">Mulai: {taskDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-muted-foreground">Estimasi Selesai: {new Date(taskDate.getTime() + task.service_category.estimasi_durasi_menit * 60000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#F5F8FC] p-4 rounded-2xl">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Lansia & Lokasi</p>
                    <div className="flex items-start gap-2 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-bold">{task.lansia.nama}</p>
                        {task.service_category.lokasi_jemput ? (
                          <div className="mt-1 space-y-1">
                            <p className="text-muted-foreground font-normal text-xs leading-relaxed"><span className="font-bold text-foreground">Diambil di:</span> {task.service_category.lokasi_jemput}</p>
                            <p className="text-muted-foreground font-normal text-xs leading-relaxed"><span className="font-bold text-foreground">Diantar ke:</span> {task.service_category.lokasi_antar}</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground font-normal text-xs mt-1 leading-relaxed">
                            {task.lansia.alamat}
                            {task.lansia.rt && task.lansia.rw ? `, RT ${task.lansia.rt}/RW ${task.lansia.rw}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Catatan Lansia:</h3>
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm text-amber-900">
                    {task.lansia.catatan_kondisi || "Tidak ada catatan khusus."}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aksi Keluarga */}
            {['diajukan', 'dikonfirmasi'].includes(status) && (
              <Card className="shadow-sm border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-lg text-destructive flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Manajemen Kunjungan
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => alert("Fitur Reschedule akan dilanjutkan di integrasi API.")}>
                    Ubah Jadwal
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1 rounded-xl"
                    onClick={handleCancel}
                    disabled={isCancelling}
                  >
                    {isCancelling ? "Membatalkan..." : "Batalkan Kunjungan"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Laporan Helper jika selesai */}
            {status === "selesai" && (
              <Card className="shadow-sm bg-green-50/50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Laporan & Health Snapshot</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic">Menunggu implementasi API untuk memuat data laporan dari Helper.</p>
                  <Button className="mt-4 w-full" variant="outline" asChild>
                     <Link href={`/lansia/${task.lansia_id}/riwayat`}>Lihat di Riwayat Rangkul</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Rincian Biaya - Pindah ke bawah card utama */}
            {(() => {
              const basePrice = task.harga_dasar;
              const extraTimePrice = (task.harga_final && task.harga_final > task.harga_dasar) ? (task.harga_final - task.harga_dasar) : 0;
              const serviceFee = 2500;
              const tax = Math.round((basePrice + extraTimePrice + serviceFee) * 0.11);
              const total = basePrice + extraTimePrice + serviceFee + tax;

              return (
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                  <p className="text-lg font-bold text-foreground border-b border-primary/10 pb-4 mb-5">Rincian Biaya</p>
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
                </div>
              );
            })()}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="shadow-sm border-none bg-white overflow-hidden">
              <div className="h-48 bg-muted relative group">
                <a href={task.lansia.foto_url || "https://api.dicebear.com/9.x/avataaars/svg?seed=lansia"} target="_blank" rel="noreferrer">
                  <img src={task.lansia.foto_url || "https://api.dicebear.com/9.x/avataaars/svg?seed=lansia"} alt={task.lansia.nama} className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-pointer" />
                </a>
              </div>
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-xl">{task.lansia.nama}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 mt-1">Lansia yang Didampingi</p>
              </CardContent>
            </Card>

            {task.helper ? (
              <Card className="shadow-sm border-none bg-white overflow-hidden">
                <div className="h-48 bg-muted relative group">
                  {task.helper.foto_url ? (
                    <a href={task.helper.foto_url} target="_blank" rel="noreferrer">
                      <img src={task.helper.foto_url} alt={task.helper.user.full_name} className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-pointer" />
                    </a>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-5xl">
                      {task.helper.user.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-xl">{task.helper.user.full_name}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 mt-1">Helper Terpercaya</p>
                  <div className="text-sm font-medium text-amber-600 flex items-center justify-center gap-1">
                    ⭐ {task.helper.rating_avg} <span className="text-muted-foreground">({task.helper.total_tugas_selesai} tugas)</span>
                  </div>
                  <div className="mt-6">
                    <Button className="w-full rounded-xl" variant="outline">Hubungi Helper</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[200px]">
                  <Clock className="w-8 h-8 mb-2 opacity-50" />
                  <p>Mencari Helper di sekitar lokasi...</p>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
