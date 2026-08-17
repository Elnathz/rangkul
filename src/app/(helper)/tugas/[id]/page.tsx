"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatusBadge } from "@/components/ui/TaskStatusBadge";
import { MOCK_TASKS } from "@/lib/mock/tasks";
import { Calendar, MapPin, ArrowLeft, CheckCircle2, Navigation2, FileText } from "lucide-react";
import { TaskStatus } from "@/lib/constants/task-status";

export default function TugasHelperDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  const task = MOCK_TASKS.find(t => t.id === taskId) || MOCK_TASKS[0];
  
  const [status, setStatus] = React.useState<TaskStatus>(task.status);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  
  const handleAccept = () => {
    setIsProcessing(true);
    // Simulasi 409 error dari TDD jika dicoba ambil
    if (Math.random() < 0.2) {
      setTimeout(() => {
        setErrorMsg("Tugas ini telah diambil oleh Helper lain.");
        setIsProcessing(false);
      }, 800);
      return;
    }

    setTimeout(() => {
      setStatus("dikonfirmasi");
      setIsProcessing(false);
    }, 800);
  };

  const handleStart = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setStatus("dikerjakan");
      setIsProcessing(false);
    }, 800);
  };

  const taskDate = new Date(task.jadwal_waktu);

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="rounded-xl px-4 font-semibold hover:bg-gray-50 flex items-center justify-center gap-2">
            <Link href="/tugas">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Detail Tugas</h1>
            <p className="text-sm text-muted-foreground">ID: {task.id}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-md border-none bg-white">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{task.service_category.nama}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{task.service_category.deskripsi}</p>
                  </div>
                  <TaskStatusBadge status={status} className="text-sm px-3 py-1" />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F5F8FC] p-4 rounded-2xl">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Jadwal</p>
                    <div className="flex items-start gap-1.5 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-primary mt-0.5" />
                      <span>
                        {taskDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br/>
                        Pukul {taskDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#F5F8FC] p-4 rounded-2xl">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Lokasi</p>
                    <div className="flex items-start gap-1.5 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-primary mt-0.5" />
                      <span>
                        {task.lansia.alamat}
                        {task.lansia.rt && task.lansia.rw ? `, RT ${task.lansia.rt}/RW ${task.lansia.rw}` : ''}<br/>
                        <span className="text-primary hover:underline cursor-pointer flex items-center gap-1 mt-1">
                          <Navigation2 className="w-3 h-3" /> Buka Maps
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Profil Lansia:</h3>
                  <div className="bg-white p-4 rounded-xl border border-border flex gap-4 items-center">
                    <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
                      {task.lansia.foto_url ? (
                        <a href={task.lansia.foto_url} target="_blank" rel="noreferrer">
                          <img src={task.lansia.foto_url} alt={task.lansia.nama} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                        </a>
                      ) : (
                        task.lansia.nama.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{task.lansia.nama}</p>
                      <p className="text-sm text-muted-foreground">{task.lansia.catatan_kondisi || "Tidak ada catatan kesehatan khusus."}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-md border-none bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Aksi Tugas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 text-green-800 p-3 rounded-lg border border-green-200 text-center mb-4">
                  <p className="text-xs font-semibold uppercase mb-1">Potensi Pendapatan</p>
                  <p className="text-xl font-bold">Rp {(task.harga_dasar * 0.9).toLocaleString('id-ID')}</p>
                </div>

                {status === "diajukan" && (
                  <Button 
                    className="w-full bg-brand-gradient text-white shadow-sm" 
                    size="lg"
                    onClick={handleAccept}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Memproses..." : "Terima Tugas"}
                  </Button>
                )}

                {status === "dikonfirmasi" && (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                    size="lg"
                    onClick={handleStart}
                    disabled={isProcessing}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {isProcessing ? "Check-in..." : "Check-in (Mulai Kunjungan)"}
                  </Button>
                )}

                {status === "dikerjakan" && (
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm" 
                    size="lg"
                    asChild
                  >
                    <Link href={`/tugas/${task.id}/lapor`}>
                      <FileText className="w-4 h-4 mr-2" />
                      Buat Laporan & Selesai
                    </Link>
                  </Button>
                )}

                {['selesai', 'menunggu_persetujuan_keluarga'].includes(status) && (
                  <div className="text-center p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                    Tugas ini telah dilaporkan. Menunggu validasi keluarga.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
