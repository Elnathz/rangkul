"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LocationPicker from "@/components/ui/LocationPicker";
import RegionSelect from "@/components/ui/RegionSelect";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { getSelectableServiceCategories, groupSelectableServiceCategories, type ServiceCategoryRow } from "@/lib/service-category-tree";
import ServiceSelectionModal from "@/components/services/ServiceSelectionModal";

type KoordinatorOption = {
  id: string;
  wilayah: string;
  tingkat: string;
  users: {
    full_name: string | null;
  } | null;
};
type OwnHelperProfile = {
  id: string;
  bio: string | null;
  domisili_lat: number | null;
  domisili_lng: number | null;
  radius_layanan_km: number;
  ktp_url: string | null;
  foto_wajah_url: string | null;
  koordinator_id: string | null;
  suspend_reason: string | null;
  status: string;
  wilayah_domisili: string;
  helper_service_categories: Array<{
    service_categories: { id: string } | Array<{ id: string }> | null;
  }> | null;
};
type ServiceCategoryOption = ServiceCategoryRow & { parentName: string | null };

export default function HelperVerifikasiPage() {
  const router = useRouter();
  const ktpInputRef = useRef<HTMLInputElement>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [rejectionPhoto, setRejectionPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('ringan'); // used in Step 2 preview
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState('ringan'); // used in Modal
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  
  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  
  const [dbCategories, setDbCategories] = useState<ServiceCategoryOption[]>([]);
  const [kategoriIds, setKategoriIds] = useState<string[]>([]);
  const [ktpFileName, setKtpFileName] = useState<string | null>(null);
  const [fotoFileName, setFotoFileName] = useState<string | null>(null);
  const [koordinators, setKoordinators] = useState<KoordinatorOption[]>([]);
  const [koordinatorsLoading, setKoordinatorsLoading] = useState(false);
  const [koordinatorsError, setKoordinatorsError] = useState(false);
  const [koordinatorsRetry, setKoordinatorsRetry] = useState(0);
  const [koordModalOpen, setKoordModalOpen] = useState(false);
  const [showKoordDropdown, setShowKoordDropdown] = useState(false);

  const tiers = [
    {
      id: "ringan",
      title: "Ringan",
      desc: "Aktivitas harian ringan & non-medis.",
    },
    {
      id: "sedang",
      title: "Sedang",
      desc: "Bantuan rutinitas harian untuk lansia semi-mandiri.",
    },
    {
      id: "berat",
      title: "Berat",
      desc: "Perawatan khusus dan penanganan medis dasar.",
    }
  ];

  const [form, setForm] = useState({
    bio: "",
    alamat: "",
    rt: "",
    rw: "",
    region: { provinsi: "", kota: "", kecamatan: "", kelurahan: "" },
    domisili_lat: null as number | null,
    domisili_lng: null as number | null,
    radius_layanan_km: 1, // Minimum 1 KM
    ktp_url: "",
    foto_url: "",
    koordinator_id: "",
  });

  useEffect(() => {
    const fetchExistingProfileAndCats = async () => {
      const supabase = createClient();
      
      // Fetch categories
      const { data: cats } = await supabase
        .from('service_categories')
        .select('id, nama, tingkat, parent_id, is_active');
      if (cats) setDbCategories(getSelectableServiceCategories(cats as unknown as ServiceCategoryRow[]));

      // Fetch user profile if exists
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profileResponse = await fetch('/api/helper/profile', { cache: 'no-store' });
        const profilePayload = await profileResponse.json().catch(() => null) as {
          data?: { profile?: OwnHelperProfile };
          profile?: OwnHelperProfile;
        } | null;
        const profile = profileResponse.ok ? (profilePayload?.data?.profile ?? profilePayload?.profile ?? null) : null;

        if (profile) {
          if ((profile.status as string) === 'rejected') {
            if (profile.suspend_reason) {
              const parts = profile.suspend_reason.split('\n\nLampiran Foto: ');
              setRejectionReason(parts[0]);
              if (parts.length > 1) {
                setRejectionPhoto(parts[1]);
              }
            } else {
              setRejectionReason('Pengajuan Anda sebelumnya ditolak. Silakan perbarui data Anda.');
            }
          }
          // Format: "Kelurahan, Kecamatan, Kota, Provinsi | RT X/RW Y | Alamat"
          const region = { provinsi: "", kota: "", kecamatan: "", kelurahan: "" };
          let rt = "", rw = "", alamat = "";
          
          if (profile.wilayah_domisili) {
            const parts = profile.wilayah_domisili.split(' | ');
            if (parts.length >= 3) {
               const adminParts = parts[0].split(', ');
               if (adminParts.length >= 4) {
                  region.kelurahan = adminParts[0];
                  region.kecamatan = adminParts[1];
                  region.kota = adminParts[2];
                  region.provinsi = adminParts[3];
               }
               const rtrw = parts[1].match(/RT (\d+)\/RW (\d+)/);
               if (rtrw) {
                  rt = rtrw[1];
                  rw = rtrw[2];
               }
               alamat = parts[2];
            } else {
               alamat = profile.wilayah_domisili;
            }
          }

          setForm(prev => ({
            ...prev,
            bio: profile.bio || "",
            domisili_lat: profile.domisili_lat,
            domisili_lng: profile.domisili_lng,
            radius_layanan_km: profile.radius_layanan_km || 1,
            ktp_url: profile.ktp_url || "",
            foto_url: profile.foto_wajah_url || "",
            koordinator_id: profile.koordinator_id || "",
            region,
            rt,
            rw,
            alamat
          }));

          const helperCategoryIds = (profile.helper_service_categories ?? [])
            .map((relation) => Array.isArray(relation.service_categories)
              ? relation.service_categories[0]?.id
              : relation.service_categories?.id)
            .filter((categoryId): categoryId is string => Boolean(categoryId));
          setKategoriIds(helperCategoryIds);
        }
      }
    };
    fetchExistingProfileAndCats();
  }, []);

  useEffect(() => {
    if (
      !form.region.kelurahan ||
      !form.region.kecamatan ||
      !form.region.kota ||
      !form.region.provinsi ||
      !form.rt ||
      !form.rw
    ) {
      queueMicrotask(() => {
        setKoordinators([]);
        setKoordinatorsError(false);
        setKoordinatorsLoading(false);
      });
      return;
    }

    let cancelled = false;
    const fetchKoords = async () => {
      setKoordinatorsLoading(true);
      setKoordinatorsError(false);
      try {
        const params = new URLSearchParams();
        if (form.region.kelurahan) params.set('kelurahan', form.region.kelurahan);
        if (form.region.kecamatan) params.set('kecamatan', form.region.kecamatan);
        if (form.region.kota) params.set('kota', form.region.kota);
        if (form.region.provinsi) params.set('provinsi', form.region.provinsi);
        params.set('rt', form.rt);
        params.set('rw', form.rw);

        const response = await fetch(`/api/koordinator/by-region?${params.toString()}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Gagal mencari koordinator');

        if (!cancelled) {
          const nextCoordinators = (result.koordinators ?? []) as KoordinatorOption[];
          setKoordinators(nextCoordinators);
          setForm((current) => current.koordinator_id && !nextCoordinators.some((item) => item.id === current.koordinator_id)
            ? { ...current, koordinator_id: '' }
            : current);
          setKoordinatorsError(false);
          setKoordinatorsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setKoordinators([]);
          setKoordinatorsError(true);
          setKoordinatorsLoading(false);
        }
      }
    };

    void fetchKoords();
    return () => {
      cancelled = true;
    };
  }, [form.region.kelurahan, form.region.kecamatan, form.region.kota, form.region.provinsi, form.rt, form.rw, koordinatorsRetry]);

  // Helper to toggle by ID
  const toggleKategori = (catId: string) => {
    setKategoriIds(prev => 
      prev.includes(catId) ? prev.filter(k => k !== catId) : [...prev, catId]
    );
  };

  const selectAllInTab = (tabId: string) => {
    const tier = tiers.find(t => t.id === tabId);
    if (!tier) return;
    const idsToAdd = dbCategories
      .filter(c => c.tingkat === tier.id)
      .map(c => c.id);
    setKategoriIds(prev => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const deselectAllInTab = (tabId: string) => {
    const tier = tiers.find(t => t.id === tabId);
    if (!tier) return;
    const idsToRemove = dbCategories
      .filter(c => c.tingkat === tier.id)
      .map(c => c.id);
    setKategoriIds(prev => prev.filter(id => !idsToRemove.includes(id)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);
    setFieldErrors({});

    if (kategoriIds.length === 0) {
      showToast("Harap pilih minimal 1 kategori layanan sebelum menyimpan profil Anda.");
      setLoading(false);
      return;
    }

    try {
      let ktpUrl = null;
      let fotoUrl = null;
      
      const fileKtp = ktpInputRef.current?.files?.[0];
      if (!fileKtp && !form.ktp_url) {
        showToast("Harap unggah foto KTP/Dokumen Identitas.");
        setFieldErrors({ ktp_url: ["Foto KTP wajib diunggah"] });
        setLoading(false);
        return;
      }

      const fileFoto = fotoInputRef.current?.files?.[0];
      if (!fileFoto && !form.foto_url) {
        showToast("Harap unggah Foto Profil Anda.");
        setFieldErrors({ foto_url: ["Foto Profil wajib diunggah"] });
        setLoading(false);
        return;
      }

      if (fileKtp) {
        const formData = new FormData();
        formData.append("file", fileKtp);
        formData.append("docType", "ktp");
        
        const uploadRes = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });
        
        const uploadData = await uploadRes.json();
        
        if (!uploadRes.ok) {
          showToast(uploadData.message || "Gagal mengunggah KTP.");
          setLoading(false);
          return;
        }
        ktpUrl = uploadData.data?.path;
      } else {
        ktpUrl = form.ktp_url;
      }

      if (fileFoto) {
        const formData = new FormData();
        formData.append("file", fileFoto);
        formData.append("docType", "foto_helper");
        
        const uploadRes = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });
        
        const uploadData = await uploadRes.json();
        
        if (!uploadRes.ok) {
          showToast(uploadData.message || "Gagal mengunggah Foto Profil.");
          setLoading(false);
          return;
        }
        fotoUrl = uploadData.data?.path;
      } else {
        fotoUrl = form.foto_url;
      }

      const payload = {
        bio: form.bio,
        wilayah_domisili: `${form.region.kelurahan}, ${form.region.kecamatan}, ${form.region.kota}, ${form.region.provinsi} | RT ${form.rt}/RW ${form.rw} | ${form.alamat}`,
        domisili_lat: form.domisili_lat,
        domisili_lng: form.domisili_lng,
        radius_layanan_km: form.radius_layanan_km,
        ktp_url: ktpUrl,
        foto_wajah_url: fotoUrl,
        kategori_ids: kategoriIds,
        koordinator_id: form.koordinator_id || null,
        provinsi: form.region.provinsi,
        kabupaten_kota: form.region.kota,
        kecamatan: form.region.kecamatan,
        kelurahan: form.region.kelurahan,
        rt: parseInt(form.rt, 10),
        rw: parseInt(form.rw, 10),
      };

      const res = await fetch("/api/helper/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        showToast(data.message || "Gagal menyimpan profil helper.");
        setLoading(false);
        return;
      }

      router.push("/helper/dashboard");
    } catch {
      showToast("Terjadi kesalahan koneksi jaringan.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 sm:px-6 relative">
      {/* Toast Notification */}
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
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Verifikasi & Profil Helper</h1>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">

          {rejectionReason && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-3 animate-in fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-red-800">Alasan Penolakan Sebelumnya</h3>
                  <p className="text-sm text-red-700 mt-1">{rejectionReason}</p>
                </div>
              </div>
              {rejectionPhoto && (
                <div className="mt-2 ml-8">
                  <a href={rejectionPhoto} target="_blank" rel="noreferrer" className="block w-24 h-24 rounded-lg overflow-hidden border border-red-200 shadow-sm hover:opacity-90 transition-opacity">
                    <img src={rejectionPhoto} alt="Lampiran Penolakan" className="w-full h-full object-cover" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          <div className="flex gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <button 
                key={s} 
                type="button"
                onClick={() => setStep(s)}
                className={`h-2 flex-1 rounded-full transition-colors cursor-pointer ${step >= s ? 'bg-[#0D47A1]' : 'bg-gray-200'}`} 
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={step === 1 ? "block animate-in fade-in" : "hidden"}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Langkah 1: Domisili Wilayah</h2>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Wilayah Administrasi Domisili <span className="text-red-500">*</span>
              </Label>
              <RegionSelect 
                onRegionChange={(region, coords) => {
                  setForm(f => ({
                    ...f,
                    region,
                    koordinator_id: "",
                    ...(coords ? { 
                      domisili_lat: coords.lat, 
                      domisili_lng: coords.lng,
                      ...(coords.address ? { alamat: coords.address } : {})
                    } : {})
                  }));
                }}
              />

              <div className="grid grid-cols-2 gap-4 mt-4 mb-2">
                <div>
                  <Label htmlFor="rt" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    RT <span className="text-red-500">*</span>
                  </Label>
                  <Input id="rt" type="number" min={1} required placeholder="Contoh: 1" value={form.rt} onChange={(e) => setForm({ ...form, rt: e.target.value, koordinator_id: "" })} className="rounded-xl" />
                </div>
                <div>
                   <Label htmlFor="rw" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    RW <span className="text-red-500">*</span>
                  </Label>
                  <Input id="rw" type="number" min={1} required placeholder="Contoh: 5" value={form.rw} onChange={(e) => setForm({ ...form, rw: e.target.value, koordinator_id: "" })} className="rounded-xl" />
                </div>
              </div>

              {form.region.kelurahan && (
                <div className="relative mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
                  <Label className="mb-3 block text-xs font-bold uppercase tracking-wider text-[#0D47A1]">
                    Koordinator RT/RW
                  </Label>

                  {koordinatorsLoading ? (
                    <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white/80 px-4 py-3 text-sm text-slate-600">
                      <Loader2 className="h-4 w-4 animate-spin text-[#0D47A1]" aria-hidden="true" />
                      <span>Mencari Koordinator di {form.region.kelurahan}...</span>
                    </div>
                  ) : koordinatorsError ? (
                    <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-800">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">Daftar Koordinator belum dapat dimuat</p>
                        <p className="mt-1 leading-6 text-red-700/90">Coba lagi untuk memeriksa Koordinator di Kelurahan {form.region.kelurahan}.</p>
                        <button
                          type="button"
                          className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-red-300 bg-white px-4 py-2 font-semibold text-red-800 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                          onClick={() => setKoordinatorsRetry((retry) => retry + 1)}
                        >
                          Coba lagi
                        </button>
                      </div>
                    </div>
                  ) : koordinators.length === 0 ? (
                    <div role="status" aria-live="polite" className="rounded-xl border border-emerald-200 bg-white/90 p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">Verifikasi Admin akan digunakan</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Belum ada Koordinator terverifikasi di Kelurahan {form.region.kelurahan}. Anda tetap dapat mengirim pengajuan, lalu Admin akan memeriksa profil Anda.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
                        <span className="text-slate-500">Status wilayah</span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">Menunggu verifikasi Admin</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <p className="mb-3 text-sm leading-6 text-blue-800/80">
                        {koordinators.length} Koordinator terverifikasi sesuai RT/RW domisili Anda tersedia.
                      </p>
                      <button
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={showKoordDropdown}
                        className="flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-900 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/30"
                        onClick={() => setShowKoordDropdown(!showKoordDropdown)}
                      >
                        <span>
                          {form.koordinator_id
                            ? koordinators.find(k => k.id === form.koordinator_id)?.users?.full_name || 'Koordinator terpilih'
                            : 'Pilih Koordinator'}
                        </span>
                        <svg className={`h-5 w-5 text-slate-400 transition-transform ${showKoordDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" aria-hidden="true"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" /></svg>
                      </button>
                    </div>
                  )}

                  {showKoordDropdown && koordinators.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
                        <div className="max-h-64 overflow-y-auto">
                           <button 
                             type="button"
                             className={`w-full text-left p-3 text-sm hover:bg-blue-50 border-b border-gray-50 ${!form.koordinator_id ? 'bg-blue-50/50 font-semibold text-[#0D47A1]' : 'text-gray-700'}`}
                             onClick={() => { setForm({...form, koordinator_id: ''}); setShowKoordDropdown(false); }}
                           >
                             -- Saya tidak mengetahui Koordinator saya --
                           </button>
                           
                           {koordinators.slice(0, 5).map(k => (
                                   <button 
                                     key={k.id}
                                     type="button"
                                     className={`w-full text-left p-3 hover:bg-blue-50 border-b border-gray-50 flex items-start gap-3 transition-colors ${form.koordinator_id === k.id ? 'bg-blue-50/50 border-l-2 border-l-[#0D47A1]' : ''}`}
                                     onClick={() => { setForm({...form, koordinator_id: k.id}); setShowKoordDropdown(false); }}
                                   >
                                     <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center border border-gray-100">
                                       <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                     </div>
                                     <div>
                                       <div className="font-bold text-gray-900 text-sm flex items-center gap-1">
                                         {k.users?.full_name} 
                                         {form.koordinator_id === k.id && <svg className="w-4 h-4 text-[#0D47A1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                       </div>
                                       <div className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded w-max mt-0.5 mb-1">{k.tingkat?.replace('_', ' ') || 'Koordinator'}</div>
                                       <div className="mt-1 text-xs text-gray-500 line-clamp-2">{k.wilayah}</div>
                                     </div>
                                   </button>
                                 ))}
                                 
                                 {koordinators.length > 5 && (
                                   <div className="p-2 border-t border-gray-50 bg-white sticky bottom-0">
                                     <button 
                                       type="button" 
                                       className="w-full py-2 bg-gray-50 hover:bg-blue-50 text-[#0D47A1] text-xs font-bold rounded-lg transition-colors border border-gray-100"
                                       onClick={() => { setKoordModalOpen(true); setShowKoordDropdown(false); }}
                                     >
                                       Lihat Semua Koordinator ({koordinators.length})
                                     </button>
                                   </div>
                                 )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              <Label htmlFor="alamat" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 mt-4">
                Alamat Spesifik Tempat Tinggal / Detail Patokan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="alamat"
                rows={3}
                placeholder="Jl. Sudirman No. 12, Kel. Sukamaju, RT 02 / RW 05"
                value={form.alamat}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, alamat: e.target.value })}
                className="rounded-xl mt-2 mb-4"
              />
              
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2 mt-4 flex items-center justify-between">
                <span>Titik Koordinat Pusat Domisili <span className="text-red-500">*</span></span>
                {form.domisili_lat && form.domisili_lng && (
                  <span className="text-[10px] text-green-600 font-mono bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    {form.domisili_lat.toFixed(5)}, {form.domisili_lng.toFixed(5)}
                  </span>
                )}
              </Label>
              <p className="text-xs text-slate-500 mb-3">Ketuk map di bawah untuk mengatur titik pusat domisili Anda. Ini digunakan untuk kalkulasi jarak radius pelayanan (maksimal {form.radius_layanan_km || 1} km).</p>
              <LocationPicker 
                position={form.domisili_lat && form.domisili_lng ? { lat: form.domisili_lat, lng: form.domisili_lng } : null}
                onPositionChange={(pos, targetAddress) => {
                   setForm(f => ({ ...f, domisili_lat: pos.lat, domisili_lng: pos.lng, ...(targetAddress ? { alamat: targetAddress } : {}) }));
                }}
              />
            </div>

            <div className={step === 2 ? "block animate-in fade-in" : "hidden"}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Langkah 2: Profil & Spesialisasi Layanan</h2>
              
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4 mt-2">
                Kategori Layanan yang Disediakan <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-slate-500 mb-4">Tentukan tugas apa saja yang siap Anda tangani. Pilihlah sesuai dengan kapasitas fisik dan kompetensi Anda.</p>
              <p className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm leading-6 text-blue-900">
                <span className="font-semibold">{dbCategories.length} layanan aktif tersedia.</span> Kategori induk nonaktif hanya digunakan untuk pengelompokan katalog dan tidak dapat dipilih sebagai layanan.
              </p>

              {/* Preview Tabs */}
              <div className="flex gap-2 mb-4 border-b border-gray-100 overflow-x-auto hide-scrollbar">
                 {tiers.map((tier) => (
                   <button
                     key={tier.id}
                     type="button"
                     onClick={() => setActiveTab(tier.id)}
                     className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
                       activeTab === tier.id 
                         ? 'border-[#0D47A1] text-[#0D47A1] bg-blue-50/40' 
                         : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                     }`}
                   >
                     {tier.title}
                   </button>
                 ))}
              </div>

              <div className="space-y-4 mb-2">
                {(() => {
                  const activeTier = tiers.find(t => t.id === activeTab);
                  if (!activeTier) return null;
                  const filteredDbCats = dbCategories.filter(c => c.tingkat === activeTier.id);

                  return groupSelectableServiceCategories(filteredDbCats.slice(0, 4)).map((group) => (
                    <section key={group.key} className="space-y-2">
                      {group.parentName && <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><span>{group.parentName}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">Parent</span></div>}
                      <div className={group.parentName ? "space-y-2 border-l-2 border-blue-100 pl-3" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
                        {group.items.map((cat) => {
                          const isSelected = kategoriIds.includes(cat.id);
                          return (
                            <label key={cat.id} className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${isSelected ? 'border-[#0D47A1] bg-blue-50/50' : 'border-gray-200 bg-white hover:border-blue-200'}`}>
                              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${isSelected ? 'border-[#0D47A1] bg-[#0D47A1]' : 'border-gray-300 bg-white'}`}>
                                {isSelected && <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <span className={`text-sm font-semibold leading-tight ${isSelected ? 'text-[#0D47A1]' : 'text-gray-700'}`}>{cat.nama}</span>
                              <input type="checkbox" checked={isSelected} onChange={() => toggleKategori(cat.id)} className="hidden" />
                            </label>
                          );
                        })}
                      </div>
                    </section>
                  ));
                })()}
              </div>

              <div className="mb-6">
                <button 
                  type="button" 
                  onClick={() => {
                    setModalOpen(true);
                    setModalActiveTab(activeTab); // Langsung buka tab yang sedang dilihat
                  }} 
                  className="text-[#0D47A1] text-sm font-semibold hover:underline flex items-center gap-1 mt-3 transition-colors hover:text-blue-800 focus:outline-none"
                >
                  {(() => {
                    const activeTier = tiers.find(t => t.id === activeTab);
                    const filteredCount = activeTier ? dbCategories.filter(c => c.tingkat === activeTier.id).length : 0;
                    const rem = Math.max(0, filteredCount - 4);
                    return `Tampilkan Semua Kategori ${activeTier?.title} (+${rem} lainnya)`;
                  })()}
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {kategoriIds.length > 0 && (
                <div className="mb-6 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Kategori Terpilih ({kategoriIds.length}):</span>
                  <div className="flex flex-wrap gap-2">
                    {dbCategories.filter(c => kategoriIds.includes(c.id)).map(c => (
                      <span key={c.id} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-[#0D47A1] border border-blue-200 shadow-sm">
                        {c.nama}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 mt-2">
                Bio Singkat & Pengalaman
              </Label>
              <Textarea
                id="bio"
                rows={3}
                placeholder="Ceritakan pengalaman Anda dalam mendampingi lansia..."
                value={form.bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, bio: e.target.value })}
                className="rounded-xl mb-4"
              />
              
              <Label htmlFor="radius" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 mt-4">
                Radius Maksimal Jangkauan Layanan <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-slate-500 mb-3">Seberapa jauh maksimal Anda bersedia bepergian menjangkau rumah Lansia? (minimal 1 KM)</p>
              <div className="relative max-w-32">
                <Input
                  id="radius"
                  type="number"
                  min={1}
                  max={25}
                  value={form.radius_layanan_km || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                     const val = parseInt(e.target.value);
                     setForm({ ...form, radius_layanan_km: isNaN(val) ? 0 : Math.max(1, val) });
                  }}
                  className="h-11 rounded-xl pr-12 text-center font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">KM</span>
              </div>
            </div>

            <div className={step === 3 ? "block animate-in fade-in" : "hidden"}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Langkah 3: Unggah Identitas</h2>
              
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                URL Foto KTP / Dokumen Identitas <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-slate-500 mb-4">Mohon perhatikan tulisan KTP harus jelas dan tidak terpotong atau tertutup silau cahaya.</p>
              
              <Label 
                htmlFor="ktp_upload"
                className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors h-40 group ${
                  form.ktp_url ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-[#F5F8FC] hover:border-[#0D47A1]/40'
                }`}
              >
                <input 
                  type="file" 
                  id="ktp_upload" 
                  ref={ktpInputRef}
                  className="hidden" 
                  accept="image/jpeg, image/png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0];
                      if (file.size > 5 * 1024 * 1024) {
                        showToast("Ukuran file KTP tidak boleh lebih dari 5MB", "error");
                        setFieldErrors(prev => ({...prev, ktp_url: ["File terlalu besar (Maksimal 5MB)"]}));
                        e.target.value = '';
                        setForm({ ...form, ktp_url: "" });
                        setKtpFileName(null);
                        return;
                      }
                      setForm({ ...form, ktp_url: URL.createObjectURL(file) });
                      setKtpFileName(file.name);
                      setFieldErrors(prev => ({...prev, ktp_url: []}));
                    }
                  }}
                />
                
                {form.ktp_url ? (
                  <>
                    <div className="absolute inset-0 w-full h-full z-0 opacity-20 group-hover:opacity-10 transition-opacity">
                       <img src={form.ktp_url} alt="Preview KTP" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-10 text-center p-4">
                      <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md ring-4 ring-white">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-sm font-bold text-slate-800 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm inline-block">{ktpFileName || 'Foto KTP Disimpan'}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0D47A1] flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-[#0D47A1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-[#0D47A1]">Ketuk Area Ini untuk Unggah Foto KTP</p>
                    <p className="text-xs text-gray-500 mt-1">Maksimal ukuran 5MB (Format JPG/PNG)</p>
                  </div>
                )}
              </Label>
              {fieldErrors.ktp_url && (
                <p className="text-xs text-red-500 mt-1 mb-4">{fieldErrors.ktp_url[0]}</p>
              )}
              
              <div className="mt-6 mb-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Foto Profil Anda <span className="text-red-500">*</span>
                </Label>
              </div>
              <p className="text-xs text-slate-500 mb-4">Foto wajah yang jelas untuk dikenali oleh Klien/Lansia saat bertugas.</p>
              
              <Label 
                htmlFor="foto_upload"
                className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors h-40 group ${
                  form.foto_url ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-[#F5F8FC] hover:border-[#0D47A1]/40'
                }`}
              >
                <input 
                  type="file" 
                  id="foto_upload" 
                  ref={fotoInputRef}
                  className="hidden" 
                  accept="image/jpeg, image/png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0];
                      if (file.size > 5 * 1024 * 1024) {
                        showToast("Ukuran file foto profil tidak boleh lebih dari 5MB", "error");
                        setFieldErrors(prev => ({...prev, foto_url: ["File terlalu besar (Maksimal 5MB)"]}));
                        e.target.value = '';
                        setForm({ ...form, foto_url: "" });
                        setFotoFileName(null);
                        return;
                      }
                      setForm({ ...form, foto_url: URL.createObjectURL(file) });
                      setFotoFileName(file.name);
                      setFieldErrors(prev => ({...prev, foto_url: []}));
                    }
                  }}
                />
                
                {form.foto_url ? (
                  <>
                    <div className="absolute inset-0 w-full h-full z-0 opacity-20 group-hover:opacity-10 transition-opacity">
                       <img src={form.foto_url} alt="Preview Foto" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-10 text-center p-4">
                      <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md ring-4 ring-white">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-sm font-bold text-slate-800 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm inline-block">{fotoFileName || 'Foto Profil Disimpan'}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0D47A1] flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-[#0D47A1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-[#0D47A1]">Ketuk Area Ini untuk Unggah Foto Profil</p>
                    <p className="text-xs text-gray-500 mt-1">Maksimal ukuran 5MB (Format JPG/PNG)</p>
                  </div>
                )}
              </Label>
              {fieldErrors.foto_url && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.foto_url[0]}</p>
              )}
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100 mt-8">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                     setToast(null);
                     setStep(s => s - 1);
                  }} 
                  className="font-semibold rounded-xl flex-1 border-gray-200 h-11"
                >
                  Sebelumnya
                </Button>
              )}
              
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={() => {
                    setToast(null);
                    // Validasi khusus tiap langkah sebelum lanjut!
                    if (step === 1 && (!form.region.kelurahan || !form.alamat || !form.rt || !form.rw || form.domisili_lat === null)) {
                       showToast("Harap lengkapi wilayah domisili, (termasuk RT/RW), alamat spesifik, dan koordinat sebelum melanjutkan.");
                       return;
                    }
                    if (step === 2) {
                       if (form.radius_layanan_km < 1) {
                         showToast("Radius minimal adalah 1 KM.");
                         setFieldErrors(prev => ({...prev, radius_layanan_km: ["Minimal 1 KM"]}));
                         return;
                       }
                       if (kategoriIds.length === 0) {
                         showToast("Anda harus memilih minimal satu kategori layanan!");
                         return;
                       }
                    }
                    setStep(s => s + 1);
                  }}
                  className="flex-1 h-11 bg-[#0D47A1] hover:bg-blue-800 text-white font-semibold rounded-xl"
                >
                  Selanjutnya
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] h-11 bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-95 shadow-md flex items-center justify-center transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Sedang Verifikasi...
                    </>
                  ) : (
                    "Kirim Verifikasi Profil"
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Universal ServiceSelectionModal */}
      <ServiceSelectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode="multiple"
        categories={dbCategories}
        selectedIds={kategoriIds}
        onConfirm={(ids) => setKategoriIds(ids)}
        title="Kategori Layanan yang Disediakan"
        subtitle="Pilih ragam tugas pendampingan yang sesuai dengan kemampuan dan pengalaman Anda."
      />

      {/* Koordinator Modal */}
      {koordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 hide-scrollbar">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl min-h-[50vh] max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             
             {/* Modal Header */}
             <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <div>
                  <h3 className="font-bold text-xl text-gray-900">Pilih Koordinator Rangkul</h3>
                  <p className="text-xs text-gray-500 mt-1">Koordinator terverifikasi untuk RT {form.rt}/RW {form.rw}, {form.region.kelurahan}.</p>
               </div>
               <button onClick={() => setKoordModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             
             {/* Modal Content - List */}
             <div className="p-4 overflow-y-auto bg-slate-50/30 flex-1">
                <div className="flex flex-col gap-3">
                  {koordinators.map(k => (
                       <button 
                         key={k.id}
                         type="button"
                         className={`w-full text-left p-4 rounded-2xl border-2 flex items-start gap-4 transition-all hover:shadow-sm ${form.koordinator_id === k.id ? 'bg-blue-50/50 border-[#0D47A1] shadow-sm' : 'bg-white border-gray-100 hover:border-blue-200'}`}
                         onClick={() => { setForm({...form, koordinator_id: k.id}); setKoordModalOpen(false); }}
                       >
                         <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center border-4 border-white shadow-sm">
                           <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                         </div>
                         <div className="flex-1">
                           <div className="flex justify-between items-start">
                             <div>
                               <div className="font-bold text-gray-900 text-lg">{k.users?.full_name}</div>
                               <div className="text-xs uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded w-max my-1">{k.tingkat?.replace('_', ' ') || 'Koordinator'}</div>
                             </div>
                             {form.koordinator_id === k.id && (
                               <div className="bg-[#0D47A1] text-white p-1 rounded-full shrink-0">
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                               </div>
                             )}
                           </div>
                           <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg">{k.wilayah}</div>
                         </div>
                       </button>
                    ))}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
