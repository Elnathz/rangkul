"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { isUrgentProbationBooking } from "@/lib/helper/task-acceptance";
import LansiaSelect from "@/components/keluarga/booking/LansiaSelect";
import CustomServiceTierSelect, { type ServiceCategoryItem } from "@/components/keluarga/booking/CustomServiceTierSelect";
import DateTimePicker from "@/components/keluarga/booking/DateTimePicker";

interface Lansia {
  id: string;
  nama: string;
  alamat?: string;
}

type HelperDetail = {
  tingkat_kepercayaan: "probation" | "terpercaya";
  users: { full_name: string | null } | null;
};

export default function BookingPage({ params }: { params: Promise<{ helper_id: string }> }) {
  const router = useRouter();
  const { helper_id } = use(params);

  const [lansiaList, setLansiaList] = useState<Lansia[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [helper, setHelper] = useState<HelperDetail | null>(null);

  const [form, setForm] = useState({
    lansia_id: "",
    service_category_id: "",
    jadwal_waktu: "",
    catatan: "",
  });

  useEffect(() => {
    const supabase = createClient();
    async function loadData() {
      try {
        const querySchedule = new URLSearchParams(window.location.search).get("jadwal_waktu") ?? "";
        if (querySchedule) setForm((current) => ({ ...current, jadwal_waktu: querySchedule }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: lansiaData } = await supabase
            .from("lansia_profiles")
            .select("id, nama, alamat")
            .eq("keluarga_id", user.id);
          if (lansiaData) setLansiaList(lansiaData);
        }

        const { data: catData } = await supabase
          .from("service_categories")
          .select("id, nama, harga_dasar, tingkat, estimasi_durasi_menit, is_high_risk")
          .eq("is_active", true);
        if (catData) setCategories(catData as unknown as ServiceCategoryItem[]);

        if (helper_id !== "direct") {
          const response = await fetch(`/api/helpers/${helper_id}`);
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.message || "Profil Helper tidak dapat dimuat.");
          setHelper(payload.helper ?? payload.data?.helper ?? null);
        }
      } catch (reason: unknown) {
        setErrorMsg(reason instanceof Error ? reason.message : "Data booking tidak dapat dimuat.");
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, [helper_id]);

  const urgentProbation = helper
    ? isUrgentProbationBooking(helper.tingkat_kepercayaan, form.jadwal_waktu)
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/booking/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          helper_id: helper_id !== "direct" ? helper_id : undefined,
          jadwal_waktu: new Date(form.jadwal_waktu).toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let msg = data.message || "Gagal membuat pemesanan task.";
        if (data.fieldErrors) {
          const errors = Object.values(data.fieldErrors).flat().join(', ');
          msg += ` (${errors})`;
        }
        setErrorMsg(msg);
        setLoading(false);
        return;
      }

      router.push("/kunjungan");
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="rounded-xl px-4 font-semibold hover:bg-gray-50 flex items-center justify-center gap-2">
            <Link href="/cari-helper">
              <ChevronLeft className="size-4" />
              Kembali
            </Link>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Pesan Pendampingan Helper</h1>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
          {errorMsg && (
            <div className="fixed top-6 right-6 z-[100] max-w-sm w-full p-4 rounded-xl shadow-lg border animate-in slide-in-from-top-4 fade-in duration-300 bg-red-50 border-red-200 text-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                <div>
                  <p className="font-semibold text-sm mb-0.5">Peringatan</p>
                  <p className="text-xs opacity-90">{errorMsg}</p>
                </div>
              </div>
            </div>
          )}

          {fetching ? (
            <p className="text-sm text-muted-foreground text-center py-6">Memuat data lansia dan layanan...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {helper && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-bold text-slate-900">{helper.users?.full_name || "Helper Rangkul"}</p>
                  <p className="mt-1">Tingkat kepercayaan: <span className="font-semibold capitalize">{helper.tingkat_kepercayaan}</span></p>
                  {helper.tingkat_kepercayaan === "probation" && <p className="mt-2 text-xs leading-relaxed text-amber-800">Booking ini membutuhkan persetujuan Koordinator. Untuk jadwal kurang dari tiga jam, pilih Helper terpercaya.</p>}
                </div>
              )}

              {/* Lansia Selection */}
              {lansiaList.length === 0 ? (
                <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  Belum ada profil lansia. Silakan{" "}
                  <Link href="/lansia/tambah" className="underline font-bold">
                    tambah profil lansia
                  </Link>{" "}
                  terlebih dahulu.
                </div>
              ) : (
                <LansiaSelect
                  lansiaList={lansiaList}
                  selectedId={form.lansia_id}
                  onSelect={(id) => setForm({ ...form, lansia_id: id })}
                  label="Pilih Lansia yang Didampingi"
                  required
                  helperText="Pilih lansia yang akan menerima pendampingan dari Helper."
                />
              )}

              {/* Kategori Layanan dibedakan per tingkatan */}
              <CustomServiceTierSelect
                categories={categories}
                selectedId={form.service_category_id}
                onSelect={(id) => setForm({ ...form, service_category_id: id })}
                label="Kategori Layanan"
                required
                allowHighRisk={true}
                helperText="Layanan dikelompokkan berdasarkan tingkatan durasi dan kebutuhan pendampingan."
              />

              {/* Custom DateTimePicker */}
              <DateTimePicker
                value={form.jadwal_waktu}
                onChange={(newVal) => setForm({ ...form, jadwal_waktu: newVal })}
                label="Jadwal Waktu Kunjungan"
                required
                helperText="Helper probation tidak dapat menerima jadwal mendesak (kurang dari 3 jam)."
              />

              <div className="space-y-1.5">
                <Label htmlFor="catatan" className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Catatan Tambahan untuk Helper
                </Label>
                <Textarea
                  id="catatan"
                  rows={3}
                  placeholder="Contoh: Tolong dampingi minum obat pukul 10:00 pagi."
                  value={form.catatan}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, catatan: e.target.value })}
                  className="rounded-xl border-slate-200"
                />
              </div>

              {form.service_category_id && (() => {
                const selectedCat = categories.find(c => c.id === form.service_category_id);
                const basePrice = selectedCat?.harga_dasar || 0;
                return (
                  <div className="bg-primary/5 p-5 rounded-xl border border-primary/20 mt-6 space-y-4">
                    <p className="text-base font-bold text-foreground border-b border-primary/10 pb-3">Rincian Biaya (Fix Price)</p>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Harga Dasar Layanan</span>
                        <span className="font-medium text-foreground">Rp {basePrice.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                    <div className="border-t border-primary/20 pt-4 flex justify-between items-center mt-4">
                      <p className="text-base font-bold text-foreground">Total Pembayaran</p>
                      <p className="text-2xl font-black text-primary">Rp {basePrice.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-200 text-xs mt-4">
                <strong>Perhatian:</strong> Tugas yang diajukan akan otomatis dibatalkan jika tidak diterima oleh Helper dalam waktu <strong>1 jam</strong>.
              </div>

              {urgentProbation && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">Helper probation tidak tersedia untuk jadwal kurang dari tiga jam. Kembali ke katalog dan pilih Helper terpercaya.</div>}

              <Button
                type="submit"
                disabled={loading || lansiaList.length === 0 || urgentProbation || !form.lansia_id || !form.service_category_id || !form.jadwal_waktu}
                className="w-full h-12 bg-[#0D47A1] hover:bg-blue-800 text-white font-bold rounded-xl shadow-sm transition-all mt-4"
              >
                {loading ? "Memproses..." : "Pesan Sekarang"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
