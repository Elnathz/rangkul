"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TaskStatusBadge } from "@/components/ui/TaskStatusBadge";
import { MOCK_TASKS } from "@/lib/mock/tasks";
import { Calendar, MapPin, Clock } from "lucide-react";

export default function TugasHelperPage() {
  const [tasks] = React.useState(MOCK_TASKS);
  const [activeTab, setActiveTab] = React.useState<"tersedia" | "aktif" | "riwayat">("tersedia");

  // Filter mock
  const tersediaTasks = tasks.filter(t => t.status === "diajukan" && t.helper_id === null);
  const aktifTasks = tasks.filter(t => 
    ["dikonfirmasi", "dikerjakan", "menunggu_persetujuan_koordinator", "menunggu_persetujuan_keluarga"].includes(t.status) && t.helper_id === "help1"
  );
  const riwayatTasks = tasks.filter(t => 
    ["selesai", "dibatalkan"].includes(t.status) && t.helper_id === "help1"
  );

  let displayedTasks = tersediaTasks;
  if (activeTab === "aktif") displayedTasks = aktifTasks;
  if (activeTab === "riwayat") displayedTasks = riwayatTasks;

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Papan Tugas</h1>
        </div>

        <div className="flex space-x-2 bg-white p-1 rounded-xl border border-border shadow-sm">
          <button
            onClick={() => setActiveTab("tersedia")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "tersedia" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Tersedia ({tersediaTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("aktif")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "aktif" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Aktif ({aktifTasks.length})
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
              <p className="text-muted-foreground mb-4">Tidak ada tugas di tab ini.</p>
            </div>
          ) : (
            displayedTasks.map((task) => {
              const taskDate = new Date(task.jadwal_waktu);
              
              return (
                <Card key={task.id} className="overflow-hidden shadow-md hover:shadow-lg transition-all border-none bg-white">
                  <div className="bg-primary/5 px-6 py-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ID: {task.id.substring(0,8)}</span>
                    <TaskStatusBadge status={task.status} />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-1">{task.service_category.nama}</h3>
                          <div className="flex items-center text-sm text-muted-foreground gap-1.5 font-medium">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>Estimasi waktu: {task.service_category.estimasi_durasi_menit} mnt</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-[#F5F8FC] p-4 rounded-2xl">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Jadwal</p>
                            <div className="flex items-start gap-1.5 text-sm font-medium">
                              <Calendar className="w-4 h-4 text-primary mt-0.5" />
                              <span>
                                {taskDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br/>
                                Pukul {taskDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Area</p>
                            <div className="flex items-start gap-1.5 text-sm font-medium">
                              <MapPin className="w-4 h-4 text-primary mt-0.5" />
                              <span>
                                {task.lansia.alamat}
                                {task.lansia.rt && task.lansia.rw ? `, RT ${task.lansia.rt}/RW ${task.lansia.rw}` : ''}<br/>
                                <span className="text-xs text-muted-foreground font-normal">~ 2.5 km dari Anda</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-[#F5F8FC]/50 px-6 py-4 flex justify-between items-center">
                    <div className="text-sm font-bold text-foreground">
                      Potensi Pendapatan: <span className="text-primary">Rp {(task.harga_dasar * 0.9).toLocaleString('id-ID')}</span>
                    </div>
                    <Button asChild size="sm" className="rounded-xl px-4 font-bold shadow-sm">
                      <Link href={`/tugas/${task.id}`}>Lihat Detail</Link>
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
