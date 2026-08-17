"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TaskStatusBadge } from "@/components/ui/TaskStatusBadge";
import { MOCK_TASKS } from "@/lib/mock/tasks";
import { Calendar, MapPin, Clock } from "lucide-react";

export default function KunjunganPage() {
  const [tasks] = React.useState(MOCK_TASKS);
  const [activeTab, setActiveTab] = React.useState<"mendatang" | "riwayat">("mendatang");

  // In a real app, this would be fetched from /api/tasks?role=keluarga
  const mendatangTasks = tasks.filter(t => 
    ["diajukan", "dikonfirmasi", "dikerjakan", "menunggu_persetujuan_koordinator", "menunggu_persetujuan_keluarga"].includes(t.status)
  );
  
  const riwayatTasks = tasks.filter(t => 
    ["selesai", "dibatalkan"].includes(t.status)
  );

  const displayedTasks = activeTab === "mendatang" ? mendatangTasks : riwayatTasks;

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Daftar Kunjungan</h1>
          <Button variant="outline" asChild>
            <Link href="/cari-helper">Pesan Baru</Link>
          </Button>
        </div>

        <div className="flex space-x-2 bg-white p-1 rounded-xl border border-border shadow-sm">
          <button
            onClick={() => setActiveTab("mendatang")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "mendatang" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Akan Datang & Aktif ({mendatangTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "riwayat" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Riwayat ({riwayatTasks.length})
          </button>
        </div>

        <div className="space-y-4">
          {displayedTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-12 text-center shadow-sm">
              <p className="text-muted-foreground mb-4">Tidak ada kunjungan di tab ini.</p>
              {activeTab === "mendatang" && (
                <Button asChild>
                  <Link href="/cari-helper">Cari Helper Sekarang</Link>
                </Button>
              )}
            </div>
          ) : (
            displayedTasks.map((task: any) => {
              const taskDate = new Date(task.jadwal_waktu);
              const estimasiSelesai = new Date(taskDate.getTime() + task.service_category.estimasi_durasi_menit * 60000);
              
              return (
                <Card key={task.id} className="overflow-hidden shadow-md hover:shadow-lg transition-all border-none">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between items-start gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">ID: {task.id.substring(0,8)}</span>
                          <TaskStatusBadge status={task.status} />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-foreground">{task.service_category.nama}</h3>
                      </div>
                      <div className="w-full md:w-auto text-left md:text-right border-t border-border md:border-none pt-4 md:pt-0">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Biaya</p>
                        <p className="text-xl font-bold text-primary">Rp {(task.harga_final || task.harga_dasar).toLocaleString('id-ID')}</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border border-border p-4 rounded-lg bg-white shadow-sm">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Jadwal & Waktu</p>
                            <div className="flex items-start gap-3 text-sm font-medium">
                              <Calendar className="w-4 h-4 text-primary mt-0.5" />
                              <div>
                                <p className="mb-1">{taskDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-muted-foreground font-normal">Mulai: {taskDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                                <p className="text-muted-foreground font-normal">Estimasi Selesai: {estimasiSelesai.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border border-border p-4 rounded-lg bg-white shadow-sm">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Lansia & Lokasi</p>
                            <div className="flex items-start gap-3 text-sm font-medium">
                              <MapPin className="w-4 h-4 text-primary mt-0.5" />
                              <div>
                                <p className="font-bold mb-1">{task.lansia.nama}</p>
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
                      </div>
                      
                      {task.helper && (
                        <div className="md:w-56 bg-[#F5F8FC] rounded-2xl overflow-hidden flex flex-col">
                          <div className="h-40 bg-muted relative">
                            {task.helper.foto_url ? (
                              <img src={task.helper.foto_url} alt={task.helper.user.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-4xl">
                                {task.helper.user.full_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="p-3 text-center bg-white flex-1 flex flex-col justify-center">
                            <p className="text-sm font-bold truncate">{task.helper.user.full_name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Helper Terpercaya</p>
                            <div className="text-xs font-medium text-amber-600 flex items-center justify-center gap-1">
                              ⭐ {task.helper.rating_avg} <span className="text-muted-foreground">({task.helper.total_tugas_selesai} tugas)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 py-4 flex justify-end">
                    <Button asChild className="rounded-xl px-6 font-bold shadow-sm">
                      <Link href={`/kunjungan/${task.id}`}>Lihat Detail Tugas</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}