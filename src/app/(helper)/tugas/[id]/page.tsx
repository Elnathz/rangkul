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
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AlertCircle, ExternalLink, X } from "lucide-react";

export default function TugasHelperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const task = MOCK_TASKS.find(t => t.id === taskId) || MOCK_TASKS[0];
  
  const [status, setStatus] = React.useState<TaskStatus>(task.status);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  
  const [helperStatus, setHelperStatus] = React.useState<string>("unregistered");
  const [warningAction, setWarningAction] = React.useState<"unverified" | "pending" | "rejected" | null>(null);

  React.useEffect(() => {
    const fetchStatus = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase.from('helper_profiles').select('status').eq('user_id', user.id).single();
        if (prof) {
          setHelperStatus(prof.status || "unregistered");
        }
      }
    };
    fetchStatus();
  }, []);
  
  const handleAccept = () => {
    if (helperStatus !== "verified") {
      if (!helperStatus || helperStatus === "unregistered") {
        setWarningAction("unverified");
      } else if (helperStatus === "rejected") {
        setWarningAction("rejected");
      } else {
        setWarningAction("pending");
      }
      return;
    }

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

        <Card className="shadow-lg border-none bg-white overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10 pb-6 px-6">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">{task.service_category.nama}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1.5">{task.service_category.deskripsi}</p>
              </div>
              <TaskStatusBadge status={status} className="text-sm px-4 py-1.5 rounded-full" />
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              {/* Kolom Detail Tugas */}
              <div className="md:col-span-2 p-6 space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#F5F8FC] p-4 rounded-2xl border border-blue-50/50 hover:border-blue-100 transition-colors">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Jadwal Penugasan</p>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-semibold text-slate-700 leading-snug">
                        {taskDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br/>
                        <span className="text-blue-600">Pukul {taskDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#F5F8FC] p-4 rounded-2xl border border-blue-50/50 hover:border-blue-100 transition-colors">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Lokasi Tujuan</p>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-semibold text-slate-700 leading-snug">
                        <span className="line-clamp-2">{task.lansia.alamat}</span>
                        {task.lansia.rt && task.lansia.rw && <span className="block text-xs text-slate-500 mt-0.5">RT {task.lansia.rt}/RW {task.lansia.rw}</span>}
                        <span className="text-primary hover:underline cursor-pointer flex items-center gap-1 mt-1.5 text-xs font-bold">
                          <Navigation2 className="w-3.5 h-3.5" /> Buka Maps
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Profil Lansia</h3>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0 border-2 border-white shadow-sm">
                      {task.lansia.foto_url ? (
                        <a href={task.lansia.foto_url} target="_blank" rel="noreferrer">
                          <img src={task.lansia.foto_url} alt={task.lansia.nama} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                        </a>
                      ) : (
                        task.lansia.nama.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-slate-800">{task.lansia.nama}</p>
                      <p className="text-sm text-slate-500 line-clamp-2 mt-0.5 font-medium">{task.lansia.catatan_kondisi || "Tidak ada catatan kesehatan khusus."}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Aksi Tugas */}
              <div className="p-6 bg-slate-50 flex flex-col h-full">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Aksi Tugas</h3>
                
                <div className="bg-white text-slate-800 p-5 rounded-2xl border border-green-100 shadow-sm text-center mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Potensi Pendapatan</p>
                  <p className="text-2xl font-black text-green-600">Rp {(task.harga_dasar * 0.9).toLocaleString('id-ID')}</p>
                </div>

                <div className="mt-auto space-y-3">
                  {status === "diajukan" && (
                    <Button 
                      className="w-full bg-brand-gradient text-white shadow-md rounded-xl h-12 font-bold text-base hover:opacity-90 transition-opacity" 
                      onClick={handleAccept}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Memproses..." : "Terima Tugas"}
                    </Button>
                  )}

                  {status === "dikonfirmasi" && (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-xl h-12 font-bold text-base" 
                      onClick={handleStart}
                      disabled={isProcessing}
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {isProcessing ? "Check-in..." : "Check-in"}
                    </Button>
                  )}

                  {status === "dikerjakan" && (
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md rounded-xl h-12 font-bold text-base" 
                      asChild
                    >
                      <Link href={`/tugas/${task.id}/lapor`}>
                        <FileText className="w-5 h-5 mr-2" />
                        Buat Laporan & Selesai
                      </Link>
                    </Button>
                  )}

                  {['selesai', 'menunggu_persetujuan_keluarga'].includes(status) && (
                    <div className="text-center p-4 bg-slate-100 rounded-xl text-sm font-medium text-slate-500 border border-slate-200">
                      Tugas ini telah diselesaikan dan sedang menunggu validasi keluarga.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Warning Action Modal --- */}
      {warningAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in transition-all">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden text-center p-8 animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setWarningAction(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-orange-200 animate-ping rounded-full opacity-20"></div>
              <AlertCircle className="w-10 h-10 text-orange-500 relative z-10" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {warningAction === "unverified" ? "Lengkapi Profil Utama" : warningAction === "rejected" ? "Pendaftaran Ditolak" : "Sedang Ditinjau"}
            </h3>
            
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
              {warningAction === "unverified" 
                ? "Anda belum melengkapi formulir verifikasi Helper Rangkul. Harap lengkapi dan serahkan dokumen KTP Anda sebelum dapat mengambil pekerjaan."
                : warningAction === "rejected"
                ? "Mohon maaf, pendaftaran Anda sebelumnya ditolak. Silakan perbaiki dan ajukan ulang dokumen Anda pada halaman verifikasi."
                : "Akun Anda saat ini masih dalam proses peninjauan oleh Koordinator setempat. Anda baru bisa mengambil pekerjaan setelah status berpindah diverifikasi."}
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => {
                   if (warningAction === "unverified" || warningAction === "rejected") router.push("/helper/verifikasi");
                   else router.push("/helper/dashboard");
                }} 
                className="w-full bg-[#0D47A1] hover:bg-blue-800 h-12 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {warningAction === "unverified" ? "Lengkapi Profil" : warningAction === "rejected" ? "Perbaiki Dokumen" : "Kembali ke Dashboard"}
                <ExternalLink size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
