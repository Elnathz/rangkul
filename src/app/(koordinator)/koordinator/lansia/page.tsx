"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Search, UserRound, MapPin, ExternalLink, ShieldAlert, Check, RefreshCw } from "lucide-react";
import Link from "next/link";
import { SignedImage } from "@/components/ui/SignedImage";
import { AdminLoadingRows, AdminModal } from "@/components/admin/AdminPrimitives";

type LansiaVerificationItem = {
  id: string;
  nama: string;
  nama_keluarga?: string | null;
  alamat: string;
  provinsi: string | null;
  kabupaten_kota: string | null;
  kecamatan: string | null;
  kelurahan: string | null;
  rt: string | null;
  rw: string | null;
  catatan_kondisi: string | null;
  dokumen_identitas_lansia_url: string | null;
  dokumen_hubungan_keluarga_url: string | null;
  foto_url: string | null;
  verified_status?: "pending" | "verified" | "rejected";
  created_at: string;
};

export default function KoordinatorLansiaVerificationPage() {
  const [lansiaList, setLansiaList] = useState<LansiaVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedLansia, setSelectedLansia] = useState<LansiaVerificationItem | null>(null);
  const [verifying, setVerifying] = useState(false);

  const loadLansia = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/koordinator/lansia", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Gagal memuat lansia di wilayah Anda");
      setLansiaList(payload.profiles ?? []);
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
        if (active) setLansiaList(payload.profiles ?? []);
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

  const handleVerify = async (status: "verified" | "rejected") => {
    if (!selectedLansia) return;
    setVerifying(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/koordinator/lansia", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedLansia.id, status }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Gagal memproses verifikasi");

      setLansiaList((current) =>
        current.map((item) =>
          item.id === selectedLansia.id ? { ...item, verified_status: status } : item
        )
      );
      setNotice(`Lansia ${selectedLansia.nama} berhasil di-${status === "verified" ? "verifikasi" : "tolak"}.`);
      setSelectedLansia(null);
    } catch (err: unknown) {
      setError((err as Error).message || "Gagal memproses verifikasi");
    } finally {
      setVerifying(false);
    }
  };

  const filtered = lansiaList.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.nama.toLowerCase().includes(q) ||
      item.alamat?.toLowerCase().includes(q) ||
      item.kelurahan?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-32 px-3 sm:px-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Operasional Wilayah</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Verifikasi Lansia</h1>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Tinjau data lansia dan kelengkapan dokumen keluarga yang didaftarkan di wilayah Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={loadLansia}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" /> Segarkan
        </button>
      </header>

      {notice ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <Check className="h-4 w-4" /> {notice}
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          <ShieldAlert className="h-4 w-4" /> {error}
        </div>
      ) : null}

      <section className="space-y-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-xs sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama lansia, kelurahan, atau alamat di wilayah Anda..."
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
          <div className="px-4 py-14 text-center">
            <UserRound className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-800">Tidak ada lansia di wilayah Anda saat ini.</p>
          </div>
        ) : (
          <div className="grid gap-4 p-3 sm:p-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const status = item.verified_status ?? "verified";
              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:shadow-md min-w-0"
                >
                  <div className="space-y-3 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="size-10 shrink-0 overflow-hidden rounded-full bg-blue-50 border border-slate-200">
                          {item.foto_url ? (
                            <SignedImage path={item.foto_url} alt={item.nama} className="h-full w-full object-cover" />
                          ) : (
                            <UserRound className="h-full w-full p-2 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-bold text-slate-900 text-sm">{item.nama}</h3>
                          <p className="truncate text-xs font-semibold text-blue-700">
                            Keluarga: {item.nama_keluarga || "Keluarga Rangkul"}
                          </p>
                          <p className="truncate text-[11px] text-slate-500">
                            {item.kelurahan ? `Kel. ${item.kelurahan}` : "Wilayah terdaftar"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          status === "verified"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : status === "rejected"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {status === "verified" ? "Terverifikasi" : status === "rejected" ? "Ditolak" : "Perlu Verifikasi"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 min-w-0">
                      <p className="flex items-start gap-1.5 min-w-0">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="break-words line-clamp-2 min-w-0">{item.alamat || "Alamat belum diisi"}</span>
                      </p>
                      <p className="text-slate-500 line-clamp-2 break-words min-w-0">
                        Catatan: <span className="italic">{item.catatan_kondisi || "Tidak ada catatan khusus"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <Link
                      href={`/koordinator/lansia/${item.id}`}
                      className="inline-flex min-h-9 items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Detail & Berkas KTP
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelectedLansia(item)}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-blue-700 px-3 text-xs font-bold text-white hover:bg-blue-800 active:scale-95 transition-all"
                    >
                      Verifikasi
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {selectedLansia ? (
        <AdminModal
          title={`Verifikasi Lansia: ${selectedLansia.nama}`}
          description="Periksa dokumen identitas dan hubungan keluarga lansia sebelum memberikan persetujuan."
          onClose={() => setSelectedLansia(null)}
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 space-y-2 text-xs">
              <p><b>Alamat:</b> {selectedLansia.alamat || "-"}</p>
              <p><b>Wilayah:</b> RT {selectedLansia.rt || "-"}/RW {selectedLansia.rw || "-"}, {selectedLansia.kelurahan || "-"}, {selectedLansia.kecamatan || "-"}</p>
              <p><b>Kondisi:</b> {selectedLansia.catatan_kondisi || "-"}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-3 space-y-2 text-center">
                <p className="text-xs font-bold text-slate-700">Dokumen Identitas Lansia</p>
                {selectedLansia.dokumen_identitas_lansia_url ? (
                  <SignedImage path={selectedLansia.dokumen_identitas_lansia_url} alt="KTP Lansia" className="h-32 w-full object-cover rounded-lg" />
                ) : (
                  <div className="h-32 bg-slate-100 flex items-center justify-center rounded-lg text-xs text-slate-400 font-medium">Dokumen belum diunggah</div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 p-3 space-y-2 text-center">
                <p className="text-xs font-bold text-slate-700">Dokumen Hubungan Keluarga (KK)</p>
                {selectedLansia.dokumen_hubungan_keluarga_url ? (
                  <SignedImage path={selectedLansia.dokumen_hubungan_keluarga_url} alt="KK Keluarga" className="h-32 w-full object-cover rounded-lg" />
                ) : (
                  <div className="h-32 bg-slate-100 flex items-center justify-center rounded-lg text-xs text-slate-400 font-medium">Dokumen belum diunggah</div>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedLansia(null)}
                className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={verifying}
                onClick={() => handleVerify("rejected")}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 hover:bg-red-100"
              >
                <XCircle className="h-4 w-4" /> Tolak
              </button>
              <button
                type="button"
                disabled={verifying}
                onClick={() => handleVerify("verified")}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800"
              >
                <CheckCircle2 className="h-4 w-4" /> Setujui Verifikasi
              </button>
            </div>
          </div>
        </AdminModal>
      ) : null}
    </div>
  );
}
