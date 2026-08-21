"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, User, Users, ShieldCheck, Edit } from "lucide-react";

export default function KeluargaProfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [lansias, setLansias] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
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
        setProfile({
          ...userProfile,
          email: user.email,
          phone: user.user_metadata?.phone || "",
          foto_url: user.user_metadata?.avatar_url || "",
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
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0D47A1]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-extrabold text-gray-900 tracking-tight">Profil Keluarga</h1>
            <p className="text-gray-500 mt-1">Informasi detail mengenai keluarga dan lansia tersimpan</p>
          </div>
          <Button asChild className="bg-white text-[#0D47A1] hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
            <Link href="/beranda/profil/edit">
              <Edit className="w-4 h-4 mr-2" /> Edit Profil
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kolom Kiri: Profil Keluarga */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-br from-blue-600 to-[#0D47A1]"></div>
              
              <div className="relative pt-8">
                {profile?.foto_url ? (
                  <img src={profile.foto_url} alt="Profile" className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-white shadow-md bg-white" />
                ) : (
                  <div className="w-24 h-24 mx-auto rounded-full bg-blue-50 border-4 border-white shadow-md flex items-center justify-center text-blue-600 text-2xl font-bold">
                    {profile?.full_name?.charAt(0) || "K"}
                  </div>
                )}
                
                <h2 className="mt-4 text-xl font-bold text-gray-900">{profile?.full_name || "Keluarga"}</h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Akun Keluarga
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100 text-left space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-500 font-medium mb-0.5">Nomor Telepon</p>
                    <p className="text-gray-900 font-semibold">{profile?.phone || "-"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-500 font-medium mb-0.5">Email</p>
                    <p className="text-gray-900 font-semibold">{profile?.email || "-"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-500 font-medium mb-0.5">Alamat Domisili</p>
                    <p className="text-gray-900 font-semibold leading-relaxed">{profile?.alamat_detail || "Alamat belum diatur"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Daftar Lansia */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-full">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#0D47A1]" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Daftar Lansia</h2>
                </div>
              </div>

              {lansias.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-900 font-bold mb-1">Belum ada data Lansia</h3>
                  <p className="text-sm text-gray-500 mb-4">Tambahkan profil lansia untuk mulai mencari Helper.</p>
                  <Button asChild className="bg-[#0D47A1] hover:bg-blue-800 text-white rounded-xl">
                    <Link href="/lansia/tambah">Tambah Profil Lansia</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lansias.map((lansia) => (
                    <div key={lansia.id} className="bg-[#F5F8FC] p-4 rounded-xl border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                        <Users className="w-16 h-16 text-[#0D47A1]" />
                      </div>
                      <div>
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-blue-100 text-blue-700 mb-2 inline-block">
                          {lansia.hubungan_keluarga || 'Keluarga'}
                        </span>
                        <h3 className="text-base font-bold text-gray-900 mb-1">{lansia.nama}</h3>
                        <p className="text-xs font-medium text-gray-500 line-clamp-2 mb-4">
                          {lansia.catatan_kondisi || 'Tidak ada catatan khusus'}
                        </p>
                      </div>
                      <div className="flex gap-2 relative z-10 w-full mt-2">
                        <Button asChild variant="outline" size="sm" className="flex-1 text-xs font-semibold rounded-lg h-8 bg-white text-[#0D47A1] border-gray-200 hover:bg-gray-50">
                          <Link href={`/lansia/${lansia.id}/edit`}>Detail Profil</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Link href="/lansia/tambah" className="bg-transparent border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-4 text-gray-500 hover:text-[#0D47A1] hover:border-[#0D47A1] hover:bg-blue-50/50 transition-all min-h-[140px]">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </div>
                    <span className="font-semibold text-xs">Tambah Lansia</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
