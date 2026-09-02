"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Edit, AlertCircle, Heart, Activity, UserRound, Calendar, MapPin, Stethoscope, HeartPulse } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/types/database";

type LansiaDb = Database["public"]["Tables"]["lansia_profiles"]["Row"] & {
  umur?: number | null;
  kondisi_medis?: string | null;
  tingkat_mobilitas?: string | null;
  kebutuhan_khusus?: string | null;
  wilayah_domisili?: string | null;
  domisili_lat?: number | null;
  domisili_lng?: number | null;
};

type Lansia = {
  id: string;
  nama: string;
  umur: number;
  kondisi_medis: string;
  tingkat_mobilitas: string;
  kebutuhan_khusus: string;
  foto_url: string;
  alamat: string;
  rt: string;
  rw: string;
  region: { kelurahan: string, kecamatan: string, kota: string, provinsi: string } | null;
  domisili_lat: number | null;
  domisili_lng: number | null;
};

export default function LansiaProfilPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [lansia, setLansia] = useState<Lansia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLansia = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: dbData } = await supabase
        .from('lansia_profiles')
        .select('*')
        .eq('id', id)
        .eq('keluarga_id', user.id)
        .single();
        
      const data = dbData as unknown as LansiaDb | null;
        
      if (data) {
        // mock parsing
        let region: Lansia["region"] = null;
        let rt = "", rw = "", alamat = data.alamat || "";
        
        if (data.wilayah_domisili) {
          const parts = data.wilayah_domisili.split(' | ');
          if (parts.length >= 3) {
             const adminParts = parts[0].split(', ');
             if (adminParts.length >= 4) {
                region = {
                  kelurahan: adminParts[0],
                  kecamatan: adminParts[1],
                  kota: adminParts[2],
                  provinsi: adminParts[3]
                };
             }
             const rtrw = parts[1].match(/RT (\d+)\/RW (\d+)/);
             if (rtrw) {
                rt = rtrw[1];
                rw = rtrw[2];
             }
             alamat = parts[2];
          }
        }

        setLansia({
          id: data.id,
          nama: data.nama,
          umur: data.umur ?? 0,
          kondisi_medis: data.kondisi_medis || "-",
          tingkat_mobilitas: data.tingkat_mobilitas || "-",
          kebutuhan_khusus: data.kebutuhan_khusus || "-",
          foto_url: data.foto_url || "",
          alamat,
          rt,
          rw,
          region,
          domisili_lat: data.domisili_lat ?? null,
          domisili_lng: data.domisili_lng ?? null
        });
      }
      setLoading(false);
    };

    if (id) fetchLansia();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D47A1]" />
      </div>
    );
  }

  if (!lansia) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Profil Lansia Tidak Ditemukan</h2>
        <Button onClick={() => router.push("/beranda")} variant="outline" className="mt-4 rounded-xl">Kembali ke Beranda</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FC] pb-24">
      {/* Dynamic Header */}
      <div className="bg-gradient-to-br from-[#0D47A1] to-[#1976D2] pt-8 pb-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-12 -left-12 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <Link href="/beranda" className="inline-flex items-center text-white/80 hover:text-white mb-6 text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Link>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Profil Lansia</h1>
              <p className="text-blue-100 mt-1.5 opacity-90">Data kesehatan dan detail dari lansia kesayangan Anda.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/lansia/${id}/riwayat`}>
                <Button className="bg-[#0D47A1] text-white hover:bg-blue-800 rounded-xl shadow-lg font-bold border border-white/20">
                  <HeartPulse className="w-4 h-4 mr-2" /> Riwayat Rangkul
                </Button>
              </Link>
              <Link href={`/lansia/${id}/edit`}>
                <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white hover:text-[#0D47A1] rounded-xl shadow-lg backdrop-blur-md transition-all font-bold">
                  <Edit className="w-4 h-4 mr-2" /> Edit Profil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-24 relative z-20 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-32 h-32 rounded-3xl bg-blue-50 flex items-center justify-center shrink-0 border-4 border-white shadow-lg overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              {lansia.foto_url ? (
                <img src={lansia.foto_url} alt={lansia.nama} className="w-full h-full object-cover" />
              ) : (
                <UserRound className="w-12 h-12 text-[#0D47A1]/40" />
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-3 pt-2">
              <h2 className="text-2xl font-black text-slate-900">{lansia.nama}</h2>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" /> {lansia.umur} Tahun
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                  <Activity className="w-3.5 h-3.5 mr-1.5" /> {lansia.tingkat_mobilitas}
                </span>
              </div>

              <div className="pt-2 text-sm text-slate-600 flex items-start justify-center sm:justify-start gap-2 max-w-lg">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <span className="leading-relaxed text-left">
                  {lansia.alamat}<br/>
                  {lansia.region && <span className="opacity-80">RT {lansia.rt}/RW {lansia.rw}, {lansia.region.kelurahan}, {lansia.region.kecamatan}, {lansia.region.kota}, {lansia.region.provinsi}</span>}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Riwayat Rangkul Access Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-[#0D47A1] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold border border-blue-400/30">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <span>Health Snapshot & Memory Capsule</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">Riwayat Pendampingan {lansia.nama}</h3>
            <p className="text-sm text-blue-100/90 leading-relaxed max-w-xl">
              Pantau laporan perkembangan kesehatan, mood, energi, serta foto kegiatan harian dari Helper yang mendampingi.
            </p>
          </div>
          <Link href={`/lansia/${id}/riwayat`} className="shrink-0 w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-white text-[#0D47A1] hover:bg-blue-50 font-black rounded-xl px-6 py-4 shadow-md transition-all">
              Buka Riwayat →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kondisi Medis */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-50 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Kondisi Medis Utama</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed min-h-[40px]">
              {lansia.kondisi_medis !== "-" ? lansia.kondisi_medis : <span className="italic opacity-60">Belum ada catatan kondisi medis...</span>}
            </p>
          </div>

          {/* Kebutuhan Khusus */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-50 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Heart className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Kebutuhan Khusus</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed min-h-[40px]">
              {lansia.kebutuhan_khusus !== "-" ? lansia.kebutuhan_khusus : <span className="italic opacity-60">Tidak ada kebutuhan khusus spesifik...</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
