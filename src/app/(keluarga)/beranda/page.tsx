"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Users, Calendar, Activity, ArrowRight, Clock } from "lucide-react";

export default function KeluargaBerandaPage() {
  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] pb-20">
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white pt-10 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-display font-extrabold mb-2">Selamat Datang, Bapak Budi</h1>
          <p className="text-teal-100 max-w-lg mb-6">
            Pantau terus kondisi dan jadwal kunjungan anggota keluarga Anda.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 grid lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Profil Lansia */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Users size={24} className="text-teal-700" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-slate-800">Daftar Lansia Keluarga</h2>
                <p className="text-sm text-slate-500">Belum ada lansia yang didaftarkan.</p>
              </div>
            </div>
            
            <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
              <Link href="/lansia/tambah">
                <Plus size={18} className="mr-1" />
                Tambah Lansia
              </Link>
            </Button>
          </div>

          {/* Section Placeholder Jadwal */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Calendar size={20} className="text-slate-400" />
                Jadwal Kunjungan Mendatang
              </h2>
            </div>
            
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                 <Clock size={28} className="text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-600 mb-2">Belum Ada Kunjungan Terjadwal</h3>
              <p className="text-sm text-slate-400 max-w-sm mb-6">
                Silakan tambahkan profil lansia terlebih dahulu sebelum dapat memesan layanan pendamping.
              </p>
              <Button asChild variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                <Link href="/cari-helper">
                  Lihat Katalog Helper <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Summary / Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-6 shadow-sm">
            <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <Activity size={18} />
              Info Riwayat Rangkul
            </h3>
            <p className="text-sm text-indigo-700/80 leading-relaxed mb-4">
              Semua hasil kunjungan Helper memuat foto dan 5 metrik kesehatan lansia yang tercatat rapi di halaman Riwayat Rangkul Anda.
            </p>
            <div className="bg-white rounded-xl p-3 border border-indigo-50 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                0
              </span>
              <span className="text-xs font-semibold text-slate-600">Total Kunjungan Tercatat</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}