"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { SignedImage } from "@/components/ui/SignedImage";
import {
  MapPin,
  Phone,
  Mail,
  Pencil,
  Plus,
  Wallet,
  ChevronRight,
  Heart,
  CalendarClock,
} from "lucide-react";
import type { Database } from "@/types/database";

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type LansiaProfile = Database["public"]["Tables"]["lansia_profiles"]["Row"];

type FamilyProfile = UserRow & {
  email: string;
  avatarUrl: string | null;
  phone_meta: string | null;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "K";
}

function formatRegionSummary(profile: FamilyProfile) {
  const parts: string[] = [];
  if (profile.kelurahan) parts.push(profile.kelurahan);
  if (profile.kecamatan) parts.push(profile.kecamatan);
  return parts.join(", ") || null;
}

function formatRegionLine2(profile: FamilyProfile) {
  const parts: string[] = [];
  if (profile.kabupaten_kota) parts.push(profile.kabupaten_kota);
  if (profile.provinsi) parts.push(profile.provinsi);
  const rt = profile.rt ? String(profile.rt).padStart(2, "0") : null;
  const rw = profile.rw ? String(profile.rw).padStart(2, "0") : null;
  const rtRw = rt && rw ? `RT ${rt} / RW ${rw}` : null;
  return { area: parts.join(", ") || null, rtRw };
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20 pb-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-xl" />
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 bg-slate-200 rounded-lg" />
            <div className="h-4 w-32 bg-slate-100 rounded-lg" />
            <div className="h-4 w-56 bg-slate-100 rounded-lg" />
          </div>
        </div>
        <div className="h-5 w-40 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/80 h-44" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function KeluargaProfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FamilyProfile | null>(null);
  const [lansias, setLansias] = useState<LansiaProfile[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: userProfile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: lansiaData } = await supabase
        .from("lansia_profiles")
        .select("*")
        .eq("keluarga_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (userProfile) {
        const rawAvatar =
          (user.user_metadata?.avatar_url as string | null) ||
          (user.user_metadata?.foto_url as string | null) ||
          null;

        let signedAvatarUrl = rawAvatar;
        if (rawAvatar && !rawAvatar.startsWith("http://") && !rawAvatar.startsWith("https://") && !rawAvatar.startsWith("/")) {
          try {
            const res = await fetch(`/api/storage/read?path=${encodeURIComponent(rawAvatar)}`);
            if (res.ok) {
              const body = (await res.json()) as { data?: { url?: string }; url?: string };
              signedAvatarUrl = body?.data?.url || body?.url || null;
            }
          } catch {
            // fallback
          }
        }

        setProfile({
          ...userProfile,
          email: user.email ?? userProfile.email ?? "",
          avatarUrl: signedAvatarUrl,
          phone_meta:
            (user.user_metadata?.phone as string | null) ||
            userProfile.phone ||
            null,
        });
      }

      if (lansiaData) {
        setLansias(lansiaData);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600 font-medium">Gagal memuat profil.</p>
          <Button
            onClick={() => router.push("/beranda")}
            variant="outline"
            className="mt-4 rounded-xl min-h-[44px]"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const regionLine1 = formatRegionSummary(profile);
  const { area: regionLine2, rtRw } = formatRegionLine2(profile);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20 pb-28 sm:pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 pt-4 sm:pt-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Akun &amp; Keluarga
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kelola informasi akun dan orang tersayang.
            </p>
          </div>
          <Link href="/beranda/profil/edit" className="shrink-0">
            <Button
              variant="outline"
              className="min-h-[44px] px-4 rounded-xl border-slate-300 text-slate-700 hover:border-[#0D47A1] hover:text-[#0D47A1] font-bold shadow-sm bg-white"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Profil
            </Button>
          </Link>
        </div>

        {/* Identity Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="shrink-0">
              {profile.avatarUrl ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0D47A1]/10 flex items-center justify-center border border-[#0D47A1]/20 shadow-sm">
                  <span className="text-2xl sm:text-3xl font-black text-[#0D47A1]">
                    {initials(profile.full_name)}
                  </span>
                </div>
              )}
            </div>

            {/* Identity Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight truncate">
                {profile.full_name}
              </h2>
              {regionLine1 && (
                <p className="text-sm text-slate-500 mt-0.5 truncate">{regionLine1}</p>
              )}
              <div className="mt-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  {profile.phone_meta ? (
                    <span>{profile.phone_meta}</span>
                  ) : (
                    <span className="text-slate-400 italic">Nomor telepon belum ditambahkan</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orang Tersayang Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
                Orang Tersayang
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola profil lansia dan pendampingan keluarga yang Anda pantau.
              </p>
            </div>
            <Link href="/lansia/tambah" className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] px-4 rounded-xl border-[#0D47A1]/30 text-[#0D47A1] hover:bg-[#0D47A1]/5 font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Lansia
              </Button>
            </Link>
          </div>

          {lansias.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 border-dashed p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">
                Belum ada orang tersayang yang ditambahkan
              </h3>
              <p className="text-sm text-slate-500 mb-5 max-w-xs mx-auto leading-relaxed">
                Tambahkan profil lansia untuk mulai membuat kunjungan pendampingan.
              </p>
              <Button
                asChild
                className="bg-[#0D47A1] hover:bg-blue-800 text-white rounded-xl min-h-[44px] px-5 font-bold"
              >
                <Link href="/lansia/tambah">
                  <Plus className="w-4 h-4 mr-2" /> Tambah Profil Lansia
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lansias.map((lansia) => (
                <div
                  key={lansia.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-[#0D47A1]/30 transition-all duration-200 flex flex-col gap-3"
                >
                  {/* Card Top: Photo + Identity (clickable to detail) */}
                  <Link
                    href={`/lansia/${lansia.id}`}
                    className="group flex items-start gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1]"
                  >
                    <div className="w-14 h-14 rounded-xl bg-blue-50 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center group-hover:border-[#0D47A1]/50 transition-colors">
                      {lansia.foto_url ? (
                        <SignedImage
                          path={lansia.foto_url}
                          alt={lansia.nama}
                          className="w-full h-full object-cover"
                          fallbackClassName="w-full h-full"
                          fallback={
                            <span className="text-lg font-black text-[#0D47A1]">
                              {initials(lansia.nama)}
                            </span>
                          }
                        />
                      ) : (
                        <span className="text-lg font-black text-[#0D47A1]">
                          {initials(lansia.nama)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D47A1] bg-[#0D47A1]/10 px-2 py-0.5 rounded-full">
                        {lansia.hubungan_keluarga || "Keluarga"}
                      </span>
                      <h3 className="font-black text-slate-950 mt-1.5 truncate group-hover:text-[#0D47A1] transition-colors">
                        {lansia.nama}
                      </h3>
                      {lansia.umur && (
                        <p className="text-xs text-slate-500">{lansia.umur} tahun</p>
                      )}
                    </div>
                  </Link>

                  {/* Mobility Badge */}
                  {lansia.tingkat_mobilitas && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-medium text-slate-600">
                        {lansia.tingkat_mobilitas}
                      </span>
                    </div>
                  )}

                  {/* Catatan Kondisi preview */}
                  {lansia.catatan_kondisi && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {lansia.catatan_kondisi}
                    </p>
                  )}

                  {/* Action Cluster (Unnested separate links) */}
                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/lansia/${lansia.id}`}
                      className="inline-flex min-h-11 items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1] rounded-lg px-2"
                    >
                      Lihat Profil <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/booking/new?lansiaId=${lansia.id}`}
                      className="inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0D47A1] transition-colors px-3 rounded-xl hover:bg-[#0D47A1]/5 border border-slate-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1]"
                    >
                      <CalendarClock className="w-3.5 h-3.5 text-[#0D47A1]" />
                      Buat Kunjungan
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Informasi Akun */}
        <section>
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider mb-4">
            Informasi Akun
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kontak */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
                Kontak
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-0.5">Email</p>
                  <p className="text-sm font-semibold text-slate-900 break-all">
                    {profile.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-0.5">Nomor Telepon</p>
                  {profile.phone_meta ? (
                    <p className="text-sm font-semibold text-slate-900">
                      {profile.phone_meta}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Belum ditambahkan</p>
                  )}
                </div>
              </div>
            </div>

            {/* Domisili */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
                Domisili
              </h3>
              {regionLine1 || regionLine2 || profile.alamat_detail ? (
                <div className="space-y-1 text-sm">
                  {profile.alamat_detail && (
                    <p className="text-slate-700">{profile.alamat_detail}</p>
                  )}
                  {regionLine1 && (
                    <p className="font-medium text-slate-900">{regionLine1}</p>
                  )}
                  {regionLine2 && (
                    <p className="text-slate-600">{regionLine2}</p>
                  )}
                  {rtRw && (
                    <p className="text-xs text-slate-400 font-medium mt-1">{rtRw}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-400 italic">Alamat belum ditambahkan</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Keuangan */}
        <section>
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider mb-4">
            Keuangan
          </h2>
          <Link
            href="/saldo"
            className="flex items-center justify-between bg-white rounded-2xl border border-[#0D47A1]/20 p-5 shadow-sm hover:shadow-md hover:border-[#0D47A1]/40 transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#0D47A1]/10 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-[#0D47A1]" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Saldo Rangkul</p>
                <p className="text-xs text-slate-500 mt-0.5">Isi saldo dan lihat riwayat transaksi</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0D47A1] transition-colors" />
          </Link>
        </section>

      </div>
    </div>
  );
}
