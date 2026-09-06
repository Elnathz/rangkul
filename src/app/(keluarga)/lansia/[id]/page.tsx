"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { SignedImage } from "@/components/ui/SignedImage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Loader2,
  ArrowLeft,
  Pencil,
  Trash2,
  AlertCircle,
  HeartPulse,
  HeartHandshake,
  MapPin,
  Stethoscope,
  Calendar,
  Clock,
  User,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

type LansiaDetail = {
  id: string;
  nama: string;
  umur: number;
  catatan_kondisi: string;
  tingkat_mobilitas: string;
  kebutuhan_khusus: string;
  hubungan_keluarga: string;
  foto_url: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten_kota: string;
  provinsi: string;
  domisili_lat: number | null;
  domisili_lng: number | null;
};

type NextTask = {
  id: string;
  status: string;
  jadwal_waktu: string;
  harga_final: number;
  service_name: string;
  duration_minutes: number;
  helper_name: string | null;
  helper_photo: string | null;
};

type LatestSnapshot = {
  energi: string;
  mobilitas: string;
  mood: string;
  cerita_hari_ini: string;
  date: string;
};

type LansiaStats = {
  total_kunjungan: number;
  kunjungan_terakhir: string | null;
  helper_terakhir: string | null;
};

function formatSchedule(value: string | null) {
  if (!value) return "-";
  try {
    const d = new Date(value);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d).replace(".", ":");
  } catch {
    return value;
  }
}

function formatShortDate(value: string | null) {
  if (!value) return "-";
  try {
    const d = new Date(value);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return value;
  }
}

function formatRatingLabel(metric: "energi" | "mood" | "mobilitas", value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "Stabil";
  
  const num = typeof value === "number" ? value : parseInt(String(value), 10);
  if (isNaN(num)) {
    return String(value);
  }

  if (metric === "energi") {
    if (num >= 5) return "Penuh & Aktif";
    if (num === 4) return "Baik";
    if (num === 3) return "Stabil";
    if (num === 2) return "Cepat Lelah";
    return "Perlu Perhatian";
  }

  if (metric === "mood") {
    if (num >= 5) return "Sangat Ceria";
    if (num === 4) return "Senang";
    if (num === 3) return "Tenang";
    if (num === 2) return "Kurang Semangat";
    return "Gelisah";
  }

  if (metric === "mobilitas") {
    if (num >= 5) return "Sangat Leluasa";
    if (num === 4) return "Mandiri";
    if (num === 3) return "Stabil";
    if (num === 2) return "Perlu Bantuan";
    return "Sangat Terbatas";
  }

  return String(value);
}

function getMobilityBadge(mobilitas: string) {
  const m = (mobilitas || "").toLowerCase();
  if (m.includes("mandiri")) {
    return {
      label: "Mandiri",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      dotClass: "bg-emerald-500",
    };
  }
  if (m.includes("bantuan") || m.includes("perlu") || m.includes("terbatas")) {
    return {
      label: "Perlu Pendampingan",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
      dotClass: "bg-amber-500",
    };
  }
  if (m.includes("ranjang") || m.includes("total") || m.includes("bedridden")) {
    return {
      label: "Bantuan Penuh",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80",
      dotClass: "bg-rose-500",
    };
  }
  return {
    label: mobilitas || "Mandiri",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    dotClass: "bg-slate-400",
  };
}

function formatAddressSummary(lansia: LansiaDetail) {
  const partsLine1: string[] = [];
  if (lansia.kelurahan) partsLine1.push(lansia.kelurahan);
  if (lansia.kecamatan) partsLine1.push(lansia.kecamatan);

  const partsLine2: string[] = [];
  if (lansia.kabupaten_kota) {
    const rawKota = lansia.kabupaten_kota.trim();
    const kota = rawKota.toLowerCase().startsWith("kabupaten") || rawKota.toLowerCase().startsWith("kota")
      ? rawKota
      : `Kabupaten ${rawKota}`;
    partsLine2.push(kota);
  }
  if (lansia.provinsi) {
    partsLine2.push(lansia.provinsi);
  }
  if (lansia.rt || lansia.rw) {
    const rtStr = lansia.rt ? String(lansia.rt).padStart(2, "0") : "01";
    const rwStr = lansia.rw ? String(lansia.rw).padStart(2, "0") : "01";
    partsLine2.push(`RT ${rtStr} / RW ${rwStr}`);
  }

  if (partsLine1.length > 0 || partsLine2.length > 0) {
    return {
      line1: partsLine1.length > 0 ? partsLine1.join(", ") : (lansia.alamat.split(",")[0] || "Alamat Lansia"),
      line2: partsLine2.join(", "),
    };
  }

  const raw = lansia.alamat || "";
  const rawParts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  if (rawParts.length <= 2) {
    return {
      line1: rawParts.join(", ") || "Alamat belum diisi",
      line2: "",
    };
  }

  return {
    line1: `${rawParts[0]}${rawParts[1] ? `, ${rawParts[1]}` : ""}`,
    line2: rawParts.slice(2, 4).join(", "),
  };
}

export default function LansiaProfilPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lansia, setLansia] = useState<LansiaDetail | null>(null);
  const [nextTask, setNextTask] = useState<NextTask | null>(null);
  const [latestSnapshot, setLatestSnapshot] = useState<LatestSnapshot | null>(null);
  const [stats, setStats] = useState<LansiaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteLansia = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/lansia/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus profil lansia");
      }
      setDeleteDialogOpen(false);
      router.push(backHref);
      router.refresh();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchLansia = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push("/login");

        const { data: userProfile } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        const role = userProfile?.role || user.user_metadata?.role || "keluarga";
        setUserRole(role);

        const response = await fetch(`/api/lansia/${id}`, { cache: "no-store" });
        const payload = await response.json();

        if (response.ok && payload.profile) {
          const data = payload.profile;
          const rt = data.rt ? String(data.rt) : "";
          const rw = data.rw ? String(data.rw) : "";
          const alamat = data.alamat || "";

          // Memetakan catatan_kondisi asli dari database
          const catatan_kondisi = data.catatan_kondisi || data.kondisi_medis || "";
          const kebutuhan_khusus = data.kebutuhan_khusus || "";
          const hubungan_keluarga = data.hubungan_keluarga || "Orang Tua";

          setLansia({
            id: data.id,
            nama: data.nama,
            umur: data.umur ?? 0,
            catatan_kondisi,
            tingkat_mobilitas: data.tingkat_mobilitas || "Mandiri",
            kebutuhan_khusus,
            hubungan_keluarga,
            foto_url: data.foto_url || "",
            alamat,
            rt,
            rw,
            kelurahan: data.kelurahan || "",
            kecamatan: data.kecamatan || "",
            kabupaten_kota: data.kabupaten_kota || "",
            provinsi: data.provinsi || "",
            domisili_lat: data.lat ?? null,
            domisili_lng: data.lng ?? null,
          });

          if (payload.next_task) {
            setNextTask(payload.next_task);
          }

          if (payload.latest_snapshot) {
            setLatestSnapshot(payload.latest_snapshot);
          }

          if (payload.stats) {
            setStats(payload.stats);
          }
        }
      } catch {
        // handle error silently or show error state
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLansia();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D47A1]" />
      </div>
    );
  }

  if (!lansia) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Profil Lansia Tidak Ditemukan</h2>
        <Button onClick={() => router.push("/beranda")} variant="outline" className="mt-4 rounded-xl min-h-[44px]">
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  const backHref = userRole === "admin" ? "/admin/lansia" : userRole === "koordinator" ? "/koordinator/lansia" : "/beranda";
  const mobilityBadge = getMobilityBadge(lansia.tingkat_mobilitas);
  const addressSummary = formatAddressSummary(lansia);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32 pt-6 sm:pt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        {/* Navigation & Clean Header Bar */}
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center text-slate-600 hover:text-[#0D47A1] text-sm font-semibold transition-colors min-h-[44px] py-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Lansia
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Profil Lansia
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Pusat informasi, pemantauan perkembangan harian, dan jadwal pendampingan keluarga.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link href={`/lansia/${id}/edit`} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-white border-slate-300 text-slate-700 hover:text-[#0D47A1] hover:border-[#0D47A1] rounded-xl font-bold min-h-[44px] px-4 shadow-sm"
                >
                  <Pencil className="w-4 h-4 mr-2" /> Edit Profil
                </Button>
              </Link>

              {userRole === "keluarga" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteDialogOpen(true);
                  }}
                  className="w-full sm:w-auto bg-white border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 rounded-xl font-bold min-h-[44px] px-4 shadow-sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Hapus Lansia
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
            {/* Avatar Photo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-50/60 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
              {lansia.foto_url ? (
                <SignedImage
                  path={lansia.foto_url}
                  alt={lansia.nama}
                  className="w-full h-full object-cover"
                  fallbackClassName="w-full h-full"
                />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight truncate">
                    {lansia.nama}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">
                    {lansia.hubungan_keluarga || "Orang Tua"} · {lansia.umur ? `${lansia.umur} tahun` : "Usia belum diisi"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${mobilityBadge.badgeClass}`}>
                    <span className={`w-2 h-2 rounded-full ${mobilityBadge.dotClass}`} />
                    {mobilityBadge.label}
                  </span>
                </div>
              </div>

              {/* Formatted Address Summary */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-start gap-2.5 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <div className="font-semibold text-slate-800">{addressSummary.line1}</div>
                  {addressSummary.line2 && (
                    <div className="text-slate-500 text-xs sm:text-sm mt-0.5">{addressSummary.line2}</div>
                  )}

                  {lansia.alamat && (
                    <button
                      type="button"
                      onClick={() => setShowFullAddress(!showFullAddress)}
                      className="text-xs text-[#0D47A1] font-bold mt-1.5 inline-flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {showFullAddress ? (
                        <>Sembunyikan alamat lengkap <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Lihat alamat lengkap <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  )}

                  {showFullAddress && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      {lansia.alamat}
                    </div>
                  )}
                </div>
              </div>

              {/* Compact Stats Row if real visit history exists */}
              {stats && stats.total_kunjungan > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Total Kunjungan</span>
                    <span className="text-base sm:text-lg font-black text-slate-900 block mt-0.5">
                      {stats.total_kunjungan}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Kunjungan Terakhir</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-1 truncate">
                      {formatShortDate(stats.kunjungan_terakhir)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Helper Terakhir</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-1 truncate">
                      {stats.helper_terakhir || "Helper"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Riwayat Rangkul Card (Hero Card: Satu-satunya kartu biru menonjol) */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0D47A1] via-[#0B3D8D] to-[#082B66] text-white p-6 sm:p-7 shadow-lg shadow-blue-950/15 border border-blue-700/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            {/* Badge & Timestamp */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-xs font-bold border border-white/15 backdrop-blur-sm">
                <HeartPulse className="w-3.5 h-3.5 text-rose-300" />
                <span>RIWAYAT RANGKUL · HEALTH SNAPSHOT</span>
              </div>
              {latestSnapshot?.date && (
                <span className="text-xs text-blue-200/90 font-medium">
                  Terakhir diperbarui {formatShortDate(latestSnapshot.date)}
                </span>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Riwayat Pendampingan {lansia.nama}
              </h2>
              <p className="text-sm text-blue-100/90 mt-1 max-w-2xl leading-relaxed">
                Pantau perkembangan kondisi kesehatan non-medis, suasana hati harian, serta dokumentasi cerita interaktif dari Helper.
              </p>
            </div>

            {/* Preview 3 Pilar Metrik */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-1">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
                <span className="text-[11px] font-semibold text-blue-200 block uppercase tracking-wider">Energi</span>
                <span className="text-sm sm:text-base font-bold text-white capitalize mt-0.5 block truncate">
                  {latestSnapshot ? formatRatingLabel("energi", latestSnapshot.energi) : "Stabil"}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
                <span className="text-[11px] font-semibold text-blue-200 block uppercase tracking-wider">Mood</span>
                <span className="text-sm sm:text-base font-bold text-white capitalize mt-0.5 block truncate">
                  {latestSnapshot ? formatRatingLabel("mood", latestSnapshot.mood) : "Tenang"}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
                <span className="text-[11px] font-semibold text-blue-200 block uppercase tracking-wider">Mobilitas</span>
                <span className="text-sm sm:text-base font-bold text-white capitalize mt-0.5 block truncate">
                  {latestSnapshot ? formatRatingLabel("mobilitas", latestSnapshot.mobilitas) : (mobilityBadge.label || "Mandiri")}
                </span>
              </div>
            </div>

            {/* Story Snippet */}
            <div className="bg-blue-950/40 rounded-xl p-3.5 sm:p-4 border border-white/10">
              <span className="text-xs font-bold text-blue-200 block mb-1">
                Cerita Terakhir (Memory Capsule)
              </span>
              <p className="text-sm text-white/95 italic leading-relaxed">
                {latestSnapshot?.cerita_hari_ini
                  ? `“${latestSnapshot.cerita_hari_ini}”`
                  : `“Catatan cerita kehangatan dan aktivitas harian ${lansia.nama} akan otomatis tampil setelah Helper menyelesaikan kunjungan perdana.”`}
              </p>
            </div>

            {/* Action CTA */}
            <div className="pt-1">
              <Link href={`/lansia/${id}/riwayat`} className="inline-block w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white text-[#0D47A1] hover:bg-blue-50 font-black rounded-xl px-6 py-2.5 min-h-[44px] shadow-md transition-all">
                  Buka Riwayat Lengkap <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Kunjungan Berikutnya Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0D47A1] flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Kunjungan Berikutnya</h3>
                <p className="text-xs text-slate-500">Jadwal pendampingan yang telah terkonfirmasi</p>
              </div>
            </div>
            {nextTask && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                Mendatang
              </span>
            )}
          </div>

          {nextTask ? (
            <div className="space-y-4 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{nextTask.service_name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatSchedule(nextTask.jadwal_waktu)}</span>
                    <span className="text-slate-300">•</span>
                    <span>{nextTask.duration_minutes} Menit</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-white shadow-sm shrink-0 flex items-center justify-center">
                    {nextTask.helper_photo ? (
                      <SignedImage
                        path={nextTask.helper_photo}
                        alt={nextTask.helper_name || "Helper"}
                        className="w-full h-full object-cover"
                        fallbackClassName="w-full h-full"
                      />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Helper Pendamping</span>
                    <span className="text-sm font-bold text-slate-900 block">{nextTask.helper_name || "Helper Rangkul"}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href={`/kunjungan/${nextTask.id}`} className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto rounded-xl font-bold min-h-[44px] border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Lihat Detail Kunjungan <ChevronRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">Belum ada kunjungan mendatang</p>
                <p className="text-xs text-slate-500 max-w-md">
                  Jadwalkan pendampingan untuk {lansia.nama} kapan pun keluarga membutuhkan bantuan terpercaya.
                </p>
              </div>
              <Link href={`/booking/new?lansia_id=${id}`} className="w-full sm:w-auto shrink-0">
                <Button className="w-full sm:w-auto bg-[#0D47A1] hover:bg-blue-800 text-white rounded-xl font-bold min-h-[44px] px-5 shadow-sm">
                  <Plus className="w-4 h-4 mr-1.5" /> Buat Kunjungan
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Informasi Penting: Catatan Kondisi & Kebutuhan Khusus */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Informasi Penting</h3>
            <Link href={`/lansia/${id}/edit?tab=kondisi`}>
              <span className="text-xs font-bold text-[#0D47A1] hover:underline cursor-pointer">
                Kelola Catatan
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Catatan Kondisi */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0D47A1] flex items-center justify-center">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">Catatan Kondisi</h4>
                  </div>
                  <Link href={`/lansia/${id}/edit?tab=kondisi`}>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-bold text-slate-600 hover:text-[#0D47A1]">
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed min-h-[48px]">
                  {lansia.catatan_kondisi ? (
                    lansia.catatan_kondisi
                  ) : (
                    <span className="text-slate-400 italic">Belum ada catatan kondisi atau pesan khusus untuk Helper.</span>
                  )}
                </p>
              </div>
              {!lansia.catatan_kondisi && (
                <div className="pt-3 border-t border-slate-100 mt-3">
                  <Link href={`/lansia/${id}/edit?tab=kondisi`}>
                    <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-bold min-h-[36px] text-slate-700">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Tambahkan Catatan
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Kebutuhan Khusus */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">Kebutuhan Khusus</h4>
                  </div>
                  <Link href={`/lansia/${id}/edit?tab=kondisi`}>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-bold text-slate-600 hover:text-[#0D47A1]">
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed min-h-[48px]">
                  {lansia.kebutuhan_khusus ? (
                    lansia.kebutuhan_khusus
                  ) : (
                    <span className="text-slate-400 italic">Belum ada pantangan atau kebutuhan pendampingan khusus.</span>
                  )}
                </p>
              </div>
              {!lansia.kebutuhan_khusus && (
                <div className="pt-3 border-t border-slate-100 mt-3">
                  <Link href={`/lansia/${id}/edit?tab=kondisi`}>
                    <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-bold min-h-[36px] text-slate-700">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Tambahkan Kebutuhan
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteError(null);
        }}
        title={`Hapus Profil ${lansia.nama}?`}
        description="Profil lansia ini akan dinonaktifkan dari akun Anda. Data riwayat kunjungan yang telah selesai akan tetap tersimpan di arsip."
        confirmLabel="Ya, Hapus Profil"
        tone="danger"
        loading={isDeleting}
        onConfirm={handleDeleteLansia}
      >
        {deleteError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 leading-relaxed">
            {deleteError}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}

