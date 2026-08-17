"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { Loader2, AlertCircle, MapPin, User, List } from "lucide-react";

export default function HelperEditProfilPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    alamat: "",
  });

  const [dbCategories, setDbCategories] = useState<{id: string, nama: string}[]>([]);
  const [kategoriIds, setKategoriIds] = useState<string[]>([]);
  const [helperProfileId, setHelperProfileId] = useState<string | null>(null);

  const tiers = [
    {
      id: "ringan",
      title: "Ringan",
      desc: "Aktivitas harian ringan & non-medis.",
      catNames: ["Pengingat Obat", "Menemani Mengobrol (singkat)", "Bantuan Teknologi (singkat)", "Bersih-bersih Ringan", "Antar Obat (dekat, ≤1 km)"]
    },
    {
      id: "sedang",
      title: "Sedang",
      desc: "Bantuan rutinitas harian untuk lansia semi-mandiri.",
      catNames: ["Menemani Mengobrol (lama)", "Bantuan Teknologi (lama)", "Antar Obat (sedang, 1–3 km)", "Belanja Kebutuhan (standar)"]
    },
    {
      id: "berat",
      title: "Berat",
      desc: "Perawatan khusus dan penanganan medis dasar.",
      catNames: ["Antar Obat (jauh, >3 km)", "Bersih-bersih Menyeluruh", "Kontrol Kesehatan (antar ke faskes)", "Belanja Kebutuhan (besar/jauh)"]
    }
  ];

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      // Set username
      const name = user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0] || "";
      
      const { data: profile } = await supabase
        .from('helper_profiles')
        .select('id, wilayah_domisili')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setHelperProfileId(profile.id);
        setForm(prev => ({
          ...prev,
          username: name,
          alamat: profile.wilayah_domisili || "",
        }));

        const { data: cats } = await supabase
          .from('helper_service_categories')
          .select('service_category_id')
          .eq('helper_id', profile.id);
          
        if (cats) {
          setKategoriIds(cats.map(c => c.service_category_id));
        }
      }

      const { data: allCats } = await supabase.from('service_categories').select('id, nama').eq('is_active', true);
      if (allCats) setDbCategories(allCats);
    };
    fetchData();
  }, [supabase, router]);

  const toggleKategori = (catId: string) => {
    setKategoriIds(prev => prev.includes(catId) ? prev.filter(k => k !== catId) : [...prev, catId]);
  };

  const selectAllInTab = (tabId: string) => {
    const tier = tiers.find(t => t.id === tabId);
    if (!tier) return;
    const idsToAdd = dbCategories.filter(c => tier.catNames.includes(c.nama)).map(c => c.id);
    setKategoriIds(prev => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const deselectAllInTab = (tabId: string) => {
    const tier = tiers.find(t => t.id === tabId);
    if (!tier) return;
    const idsToRemove = dbCategories.filter(c => tier.catNames.includes(c.nama)).map(c => c.id);
    setKategoriIds(prev => prev.filter(id => !idsToRemove.includes(id)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    if (form.password && form.password !== form.confirmPassword) {
      showToast("Password dan Konfirmasi Password tidak cocok.");
      setLoading(false);
      return;
    }

    if (kategoriIds.length === 0) {
      showToast("Harap pilih minimal 1 kategori layanan.");
      setLoading(false);
      return;
    }

    try {
      // MOCKUP API UPDATE
      // In a real app, this would call Supabase to update auth.users, public.users, helper_profiles, and helper_service_categories
      // Since we are mocking the backend, we simulate a successful update delay.
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast("Profil berhasil diperbarui!", "success");
      setTimeout(() => router.push("/helper/dashboard"), 2000);
    } catch {
      showToast("Terjadi kesalahan.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 sm:px-6 relative pb-24">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] max-w-sm w-full p-4 rounded-xl shadow-lg border animate-in slide-in-from-top-4 fade-in duration-300 ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${toast.type === 'error' ? 'text-red-500' : 'text-green-500'}`} />
            <div>
              <p className="font-semibold text-sm mb-0.5">{toast.type === 'error' ? 'Peringatan' : 'Berhasil'}</p>
              <p className="text-xs opacity-90">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Profil</h1>
          <p className="text-slate-500 mt-2 font-medium max-w-xl leading-relaxed">
            Perbarui informasi akun, keamanan, dan layanan Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Akun & Keamanan */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b pb-4 border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <User className="w-5 h-5 text-[#0D47A1]" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Akun & Keamanan</h2>
            </div>
            
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Username / Nama Lengkap</Label>
              <Input value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Nama Anda" className="rounded-xl h-11" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Password Baru (Opsional)</Label>
                <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Ketik password baru" className="rounded-xl h-11" />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Konfirmasi Password</Label>
                <Input type="password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} placeholder="Ulangi password baru" className="rounded-xl h-11" />
              </div>
            </div>
          </div>

          {/* Kategori Layanan */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b pb-4 border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <List className="w-5 h-5 text-[#0D47A1]" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Kategori Layanan</h2>
            </div>

            <div className="space-y-6">
              {tiers.map((tier) => (
                <div key={tier.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 capitalize">{tier.title}</h3>
                      <p className="text-xs text-slate-500">{tier.desc}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => selectAllInTab(tier.id)}>Pilih Semua</Button>
                      <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px] text-red-500 hover:text-red-600" onClick={() => deselectAllInTab(tier.id)}>Hapus Semua</Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {dbCategories.filter(c => tier.catNames.includes(c.nama)).map(cat => {
                      const isSelected = kategoriIds.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleKategori(cat.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            isSelected ? "bg-[#0D47A1] text-white border-[#0D47A1]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {cat.nama}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alamat */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b pb-4 border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#0D47A1]" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Alamat Domisili</h2>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-orange-800">Peringatan Mengubah Alamat</h3>
                <p className="text-sm text-orange-700 mt-1 leading-relaxed">
                  Jika Anda mengubah alamat domisili operasional, Anda diwajibkan untuk <b>menghadap dan memverifikasi ulang</b> data Anda ke Koordinator setempat.
                </p>
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Detail Alamat Lengkap</Label>
              <Textarea value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} placeholder="Contoh: Jl. Merdeka No.1 RT 01/RW 02, Kelurahan, Kecamatan..." className="rounded-xl min-h-[100px] bg-slate-50 border-slate-200" />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#0D47A1] to-[#1976D2] hover:opacity-90 text-white font-bold h-14 rounded-xl text-lg shadow-lg transition-all active:scale-[0.98]">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}