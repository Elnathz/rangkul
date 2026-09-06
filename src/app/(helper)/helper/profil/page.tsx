import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Pencil,
  Phone,
  Mail,
  Star,
  Briefcase,
  Radio,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/storage/private-files";
import type { Database } from "@/types/database";
import { parseRegionAddress } from "@/lib/region-address";

type TrustTier = Database["public"]["Enums"]["trust_tier"];
type HelperStatus = Database["public"]["Enums"]["helper_status"];

function trustLabel(tier: TrustTier): string {
  const labels: Record<TrustTier, string> = {
    probation: "Dalam Percobaan",
    terpercaya: "Terpercaya",
  };
  return labels[tier] ?? String(tier);
}

function statusBadge(status: HelperStatus): { label: string; color: string } {
  if (status === "verified") return { label: "Terverifikasi", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  if (status === "pending_verification") return { label: "Menunggu Verifikasi", color: "text-amber-700 bg-amber-50 border-amber-200" };
  if (status === "under_review") return { label: "Sedang Ditinjau", color: "text-amber-700 bg-amber-50 border-amber-200" };
  if (status === "rejected") return { label: "Ditolak", color: "text-red-700 bg-red-50 border-red-200" };
  if (status === "suspended") return { label: "Akun Ditangguhkan", color: "text-red-700 bg-red-50 border-red-200" };
  return { label: status, color: "text-slate-600 bg-slate-100 border-slate-200" };
}

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

export default async function HelperProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: helperProfile }, { data: userProfile }, { data: allCategories }] =
    await Promise.all([
      supabase
        .from("helper_profiles")
        .select(
          "id, bio, foto_wajah_url, is_available, radius_layanan_km, rating_avg, saldo_tersedia, status, tingkat_kepercayaan, total_tugas_selesai, wilayah_domisili"
        )
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("users")
        .select("full_name, email, phone, kelurahan, kecamatan, kabupaten_kota, provinsi, rt, rw, alamat_detail")
        .eq("id", user.id)
        .maybeSingle(),
      supabase.from("service_categories").select("id, nama, tingkat, is_active, parent_id").eq("is_active", true),
    ]);

  if (!helperProfile) redirect("/helper/verifikasi");

  // Fetch service categories separately since the join above is complex
  const { data: svcCats } = await supabase
    .from("helper_service_categories")
    .select("service_category_id")
    .eq("helper_id", helperProfile.id);

  const selectedCatIds = new Set((svcCats ?? []).map((c) => c.service_category_id));
  const selectedCategories = (allCategories ?? []).filter((c) => selectedCatIds.has(c.id));

  const byTier = {
    ringan: selectedCategories.filter((c) => c.tingkat === "ringan"),
    sedang: selectedCategories.filter((c) => c.tingkat === "sedang"),
    berat: selectedCategories.filter((c) => c.tingkat === "berat"),
  };

  const parsed = parseRegionAddress(helperProfile.wilayah_domisili);
  const regionShort = [parsed.kelurahan, parsed.kecamatan].filter(Boolean).join(", ");
  const regionFull = [parsed.kotaKabupaten, parsed.provinsi].filter(Boolean).join(", ");
  const badge = statusBadge(helperProfile.status);
  const isVerified = helperProfile.status === "verified";

  const rawFoto =
    helperProfile.foto_wajah_url ||
    (user.user_metadata?.avatar_url as string | null) ||
    (user.user_metadata?.foto_url as string | null) ||
    null;
  const fotoUrl = await getSignedUrl(rawFoto);

  const displayName = userProfile?.full_name ||
    (user.user_metadata?.full_name as string | null) ||
    user.email?.split("@")[0] ||
    "Helper";

  const phone = userProfile?.phone || (user.user_metadata?.phone as string | null) || null;
  const email = userProfile?.email || user.email || null;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-20 pb-28 sm:pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 pt-4 sm:pt-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Profil Helper
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Identitas, layanan, dan ketersediaan Anda.
            </p>
          </div>
          <Link href="/helper/profil/edit" className="shrink-0">
            <Button
              variant="outline"
              className="min-h-[44px] px-4 rounded-xl border-slate-300 text-slate-700 hover:border-[#0D47A1] hover:text-[#0D47A1] font-bold shadow-sm bg-white"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Profil
            </Button>
          </Link>
        </div>

        {/* Identity Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="shrink-0 relative">
              {fotoUrl ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm">
                  <img
                    src={fotoUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0D47A1]/10 flex items-center justify-center border border-[#0D47A1]/20 shadow-sm">
                  <span className="text-2xl sm:text-3xl font-black text-[#0D47A1]">
                    {displayName.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Availability dot */}
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                  helperProfile.is_available ? "bg-emerald-500" : "bg-slate-400"
                }`}
                title={helperProfile.is_available ? "Tersedia" : "Tidak tersedia"}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight truncate">
                {displayName}
              </h2>

              {/* Status + Trust */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${badge.color}`}
                >
                  {isVerified ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  {badge.label}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {trustLabel(helperProfile.tingkat_kepercayaan)}
                </span>
              </div>

              {regionShort && (
                <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-500">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{regionShort}</span>
                </div>
              )}

              {/* Availability */}
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`relative flex h-2.5 w-2.5 ${helperProfile.is_available ? "bg-emerald-500" : "bg-slate-400"} rounded-full shrink-0`}
                >
                  {helperProfile.is_available && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  )}
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {helperProfile.is_available ? "Tersedia menerima tugas" : "Sementara tidak tersedia"}
                </span>
                <Link
                  href="/helper/profil/edit"
                  className="ml-auto text-xs font-bold text-[#0D47A1] hover:underline"
                >
                  Ubah
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Briefcase className="w-4 h-4 text-[#0D47A1]" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Selesai</span>
            </div>
            <p className="text-2xl font-black text-slate-950">
              {helperProfile.total_tugas_selesai > 0
                ? helperProfile.total_tugas_selesai
                : <span className="text-sm text-slate-400 font-medium">Belum ada</span>}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rating</span>
            </div>
            {helperProfile.rating_avg > 0 ? (
              <p className="text-2xl font-black text-slate-950">{Number(helperProfile.rating_avg).toFixed(1)}</p>
            ) : (
              <p className="text-sm text-slate-400 font-medium mt-1">Belum ada penilaian</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Radio className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Radius</span>
            </div>
            <p className="text-2xl font-black text-slate-950">
              {helperProfile.radius_layanan_km}
              <span className="text-sm font-semibold text-slate-500"> km</span>
            </p>
          </div>
        </div>

        {/* Main Content: Services + Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Layanan Saya */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Layanan Saya
                </h2>
                <Link
                  href="/helper/profil/edit"
                  className="text-xs font-bold text-[#0D47A1] hover:underline"
                >
                  Kelola Layanan
                </Link>
              </div>

              {selectedCategories.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500">Belum ada layanan yang dipilih.</p>
                  <Link
                    href="/helper/profil/edit"
                    className="mt-2 inline-block text-sm font-bold text-[#0D47A1] hover:underline"
                  >
                    Tambah Layanan
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {byTier.ringan.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Tingkat Ringan
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {byTier.ringan.map((c) => (
                          <span key={c.id} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {c.nama}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {byTier.sedang.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          Tingkat Sedang
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {byTier.sedang.map((c) => (
                          <span key={c.id} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                            {c.nama}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {byTier.berat.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          Tingkat Berat
                        </span>
                        <span className="text-[10px] text-slate-400">Perlu persetujuan Koordinator</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {byTier.berat.map((c) => (
                          <span key={c.id} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                            {c.nama}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wilayah Layanan */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">
                Wilayah Layanan
              </h2>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  {regionShort && <p className="text-sm font-semibold text-slate-900">{regionShort}</p>}
                  {regionFull && <p className="text-sm text-slate-500">{regionFull}</p>}
                  <p className="mt-2 text-sm font-bold text-[#0D47A1]">
                    Radius layanan: {helperProfile.radius_layanan_km} km
                  </p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">
                Tentang Saya
              </h2>
              {helperProfile.bio ? (
                <p className="text-sm text-slate-700 leading-relaxed">{helperProfile.bio}</p>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Ceritakan sedikit tentang diri Anda agar keluarga lebih mengenal Anda.
                  </p>
                  <Link
                    href="/helper/profil/edit"
                    className="mt-2 inline-block text-sm font-bold text-[#0D47A1] hover:underline"
                  >
                    Tambah Bio
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* Side Column */}
          <div className="space-y-4">

            {/* Status Profil */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">
                Status Profil
              </h2>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  {isVerified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className="font-medium text-slate-700">
                    {isVerified ? "Identitas terverifikasi" : "Menunggu verifikasi"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="font-medium text-slate-700">
                    {trustLabel(helperProfile.tingkat_kepercayaan)}
                  </span>
                </div>
                {!isVerified && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-3">
                    Koordinator sedang meninjau profil Anda. Tunggu konfirmasi.
                  </p>
                )}
              </div>
            </div>

            {/* Saldo Penghasilan */}
            <Link
              href="/helper/penghasilan"
              className="group flex items-center justify-between bg-white rounded-2xl border border-[#0D47A1]/20 p-5 shadow-sm hover:shadow-md hover:border-[#0D47A1]/40 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0D47A1]/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-[#0D47A1]" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Saldo tersedia</p>
                  <p className="text-lg font-black text-slate-950">
                    {formatRupiah(Number(helperProfile.saldo_tersedia))}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0D47A1] transition-colors" />
            </Link>

            {/* Lihat Penghasilan link */}
            <Link
              href="/helper/penghasilan"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0D47A1] text-white font-bold text-sm min-h-[44px] hover:bg-blue-800 transition-colors"
            >
              Lihat Penghasilan
              <ChevronRight className="w-4 h-4" />
            </Link>

          </div>
        </div>

        {/* Informasi Pribadi */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Informasi Pribadi
            </h2>
            <span className="text-[10px] text-slate-400 font-medium bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
              Hanya Anda yang dapat melihat
            </span>
          </div>
          <div className="space-y-3">
            {phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-700">{phone}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-700 break-all">{email}</span>
              </div>
            )}
            {parsed.detail && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-700">{parsed.detail}</p>
                  {regionShort && <p className="text-slate-500">{regionShort}</p>}
                  {parsed.rt && parsed.rw && (
                    <p className="text-slate-400 text-xs mt-0.5">
                      RT {String(parsed.rt).padStart(2, "0")} / RW {String(parsed.rw).padStart(2, "0")}
                    </p>
                  )}
                </div>
              </div>
            )}
            {!phone && !email && !parsed.detail && (
              <p className="text-sm text-slate-400 italic">
                Informasi pribadi belum tersedia. Lengkapi profil Anda.
              </p>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
