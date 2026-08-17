"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { MOCK_TASKS } from "@/lib/mock/tasks";
import { Calendar, MapPin, AlertTriangle, CheckCircle2, XCircle, UserCheck } from "lucide-react";

export default function AntreanPersetujuanPage() {
  const [tasks, setTasks] = React.useState(MOCK_TASKS);
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  // Filter tugas yang butuh approval koordinator
  const antreanTasks = tasks.filter(t => t.status === "menunggu_persetujuan_koordinator");

  const handleApprove = (id: string) => {
    setProcessingId(id);
    setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== id));
      setProcessingId(null);
    }, 1000);
  };

  const handleReject = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menolak Helper ini untuk mengambil tugas?")) {
      setProcessingId(id);
      setTimeout(() => {
        setTasks(prev => prev.filter(t => t.id !== id));
        setProcessingId(null);
      }, 1000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans pb-24 max-w-5xl mx-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Antrean Persetujuan Tugas</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{antreanTasks.length} Tugas Menunggu</h2>
              <p className="text-sm text-gray-500">Validasi pengambilan tugas berisiko tinggi atau Helper masa percobaan.</p>
            </div>
          </div>

          <div className="space-y-4">
            {antreanTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Semua Aman!</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Saat ini tidak ada tugas berisiko tinggi yang menunggu persetujuan Anda.
                </p>
              </div>
            ) : (
              antreanTasks.map((task) => {
                const taskDate = new Date(task.jadwal_waktu);
                const isProcessing = processingId === task.id;
                
                return (
                  <div key={task.id} className="p-5 rounded-xl shadow-md hover:shadow-lg transition-all group bg-white border-none">
                    <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                      <div className="flex-1 w-full space-y-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">{task.service_category.nama}</h3>
                            {task.service_category.is_high_risk && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">
                                Risiko Tinggi
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">ID Tugas: {task.id.substring(0,8)}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F5F8FC] p-4 rounded-2xl">
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Jadwal</p>
                            <div className="flex items-start gap-2 text-sm font-medium text-foreground">
                              <Calendar className="w-4 h-4 text-primary mt-0.5" />
                              <span>
                                {taskDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}<br/>
                                <span className="text-muted-foreground">{taskDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Lokasi</p>
                            <div className="flex items-start gap-2 text-sm font-medium text-foreground">
                              <MapPin className="w-4 h-4 text-primary mt-0.5" />
                              <span>
                                {task.lansia.alamat}
                                {task.lansia.rt && task.lansia.rw ? `, RT ${task.lansia.rt}/RW ${task.lansia.rw}` : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {task.helper && (
                        <div className="md:w-56 w-full shrink-0 border-none shadow-sm rounded-xl p-4 bg-[#F5F8FC] flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                            <UserCheck className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Helper Pemohon</p>
                            <p className="text-sm font-bold text-foreground truncate">{task.helper.user.full_name}</p>
                            <p className="text-xs text-amber-600 font-medium mt-0.5">⭐ {task.helper.rating_avg} ({task.helper.total_tugas_selesai} tugas)</p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-center gap-2 w-full mt-3 pt-4 border-t border-gray-100 md:w-auto md:mt-0 md:pt-0 md:border-0 md:flex-col lg:flex-row">
                        <Button 
                          variant="outline" 
                          className="w-full sm:flex-none border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl flex items-center justify-center gap-2"
                          onClick={() => handleReject(task.id)}
                          disabled={isProcessing}
                        >
                          <XCircle className="w-4 h-4" />
                          Tolak
                        </Button>
                        <Button 
                          className="w-full sm:flex-none bg-[#0D47A1] text-white hover:bg-blue-800 rounded-xl flex items-center justify-center gap-2"
                          onClick={() => handleApprove(task.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? "Memproses..." : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Setujui
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
