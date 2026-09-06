"use client";

import { useEffect, useState } from "react";
import { Search, UserRound, MapPin, RefreshCw, ShieldAlert, HeartHandshake, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";
import { SignedImage } from "@/components/ui/SignedImage";
import { AdminLoadingRows } from "@/components/admin/AdminPrimitives";

type LansiaItem = {
  id: string;
  nama: string;
  nama_keluarga?: string | null;
  telepon_keluarga?: string | null;
  email_keluarga?: string | null;
  alamat: string;
  provinsi?: string | null;
  kabupaten_kota?: string | null;
  kecamatan?: string | null;
  kelurahan?: string | null;
  rt?: number | null;
  rw?: number | null;
  catatan_kondisi?: string | null;
  kebutuhan_khusus?: string | null;
  tingkat_mobilitas?: string | null;
  umur?: number | null;
  foto_url?: string | null;
  dokumen_identitas_lansia_url?: string | null;
  dokumen_hubungan_keluarga_url?: string | null;
  created_at: string;
};

export default function KoordinatorLansiaDirectoryPage() {
  const [lansiaList, setLansiaList] = useState<LansiaItem[]>([]);
  const [wilayahLabel, setWilayahLabel] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const loadLansia = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/koordinator/lansia", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Gagal memuat lansia di wilayah Anda");
      setLansiaList(payload.profiles ?? []);
      setWilayahLabel(payload.wilayah_label || "");
    } catch (err: unknown) {
      setError((err as Error).message || "Terjadi kesalahan saat memuat data lansia");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchLansia = async () => {
      setError("");
      try {
        const response = await fetch("/api/koordinator/lansia", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "Gagal memuat lansia di wilayah Anda");
        if (active) {
          setLansiaList(payload.profiles ?? []);
          setWilayahLabel(payload.wilayah_label || "");
        }
      } catch (err: unknown) {
        if (active) setError((err as Error).message || "Terjadi kesalahan saat memuat data lansia");
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchLansia();
    return () => {
      active = false;
    };
  }, []);

  const filtered = lansiaList.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.nama.toLowerCase().includes(q) ||
      (item.alamat && item.alamat.toLowerCase().includes(q)) ||
      (item.kelurahan && item.kelurahan.toLowerCase().includes(q)) ||
      (item.catatan_kondisi && item.catatan_kondisi.toLowerCase().includes(q)) ||
      (item.nama_keluarga && item.nama_keluarga.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-32 px-3 sm:px-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Operasional Wilayah</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Data Lansia Wilayah</h1>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Pantau daftar lansia dan kondisi kesehatan warga yang terdaftar di wilayah pengawasan Anda.
          </p>
          {wilayahLabel ? (
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3 py-1 text-xs font-semibold text-blue-900">
              <MapPin className="h-3.5 w-3.5 text-blue-700 shrink-0" />
              <span>Pengawasan: {wilayahLabel}</span>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={loadLansia}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Segarkan
        </button>
      </header>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          <ShieldAlert className="h-4 w-4 shrink-0" /> {error}
        </div>
      ) : null}

      <section className="space-y-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-xs sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama lansia, kondisi, kelurahan, atau nama keluarga..."
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6">
          <p className="text-sm font-semibold text-slate-600">
            {filtered.length.toLocaleString("id-ID")} Lansia Terdaftar di Wilayah
          </p>
        </div>

        {loading ? (
          <AdminLoadingRows columns={4} />
        ) : filtered.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <UserRound className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="mt-4 font-bold text-slate-800 text-base">Belum ada data lansia di wilayah Anda</h3>
            <p className="mt-1.5 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {search
                ? "Tidak ada lansia yang cocok dengan kata kunci pencarian Anda. Coba periksa kembali ejaan nama atau alamat."
                : "Data lansia akan otomatis tercatat di sini saat keluarga warga di wilayah pengawasan Anda mendaftarkan orang tua mereka di Rangkul."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-3 sm:p-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const locationParts: string[] = [];
              if (item.rt && item.rw) {
                locationParts.push(`RT ${String(item.rt).padStart(2, "0")}/RW ${String(item.rw).padStart(2, "0")}`);
              }
              if (item.kelurahan) {
                locationParts.push(`Kel. ${item.kelurahan}`);
              }

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:shadow-md min-w-0"
                >
                  <div className="space-y-3 min-w-0">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="size-12 shrink-0 overflow-hidden rounded-full bg-blue-50 border border-slate-200">
                        {item.foto_url ? (
                          <SignedImage path={item.foto_url} alt={item.nama} className="h-full w-full object-cover" />
                        ) : (
                          <UserRound className="h-full w-full p-2.5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="truncate font-bold text-slate-900 text-base">{item.nama}</h3>
                          {typeof item.umur === "number" && item.umur > 0 ? (
                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                              {item.umur} thn
                            </span>
                          ) : null}
                        </div>
                        <p className="truncate text-xs font-semibold text-blue-700">
                          Keluarga: {item.nama_keluarga || "Keluarga Rangkul"}
                        </p>
                        {locationParts.length > 0 ? (
                          <p className="truncate text-[11px] text-slate-500 font-medium">
                            {locationParts.join(" - ")}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 min-w-0">
                      <p className="flex items-start gap-1.5 min-w-0">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="break-words line-clamp-2 min-w-0">{item.alamat || "Alamat belum diisi lengkap"}</span>
                      </p>
                      <p className="text-slate-500 line-clamp-2 break-words min-w-0">
                        Catatan: <span className="italic text-slate-700">{item.catatan_kondisi || "Tidak ada catatan khusus"}</span>
                      </p>
                      {item.kebutuhan_khusus ? (
                        <div className="mt-1 flex items-start gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 rounded-lg px-2 py-1 border border-amber-200/60">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{item.kebutuhan_khusus}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <Link
                      href={`/koordinator/lansia/${item.id}`}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-xs font-bold text-white shadow-xs transition hover:bg-blue-800 active:scale-95"
                    >
                      <Eye className="h-4 w-4 shrink-0" />
                      <span>Detail Lansia</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
