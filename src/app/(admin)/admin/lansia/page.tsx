"use client";

import { useEffect, useState } from "react";
import { Search, UserRound, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { AdminLoadingRows } from "@/components/admin/AdminPrimitives";
import { SignedImage } from "@/components/ui/SignedImage";

type LansiaItem = {
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
  foto_url: string | null;
  created_at: string;
};

export default function AdminLansiaPage() {
  const [lansiaList, setLansiaList] = useState<LansiaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const loadLansia = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/lansia", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Gagal memuat data lansia");
      setLansiaList(payload.profiles ?? []);
    } catch (err: unknown) {
      setError((err as Error).message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchLansia = async () => {
      setError("");
      try {
        const response = await fetch("/api/admin/lansia", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "Gagal memuat data lansia");
        if (active) setLansiaList(payload.profiles ?? []);
      } catch (err: unknown) {
        if (active) setError((err as Error).message || "Terjadi kesalahan saat memuat data");
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchLansia();
    return () => {
      active = false;
    };
  }, []);

  const filteredLansia = lansiaList.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.nama.toLowerCase().includes(q) ||
      item.alamat?.toLowerCase().includes(q) ||
      item.kecamatan?.toLowerCase().includes(q) ||
      item.kabupaten_kota?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-24">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Data Master</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Daftar Seluruh Lansia</h1>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Monitoring dan kelola profil lansia terdaftar di platform Rangkul secara nasional.
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

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {error}
        </div>
      ) : null}

      <section className="space-y-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-xs sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama lansia, alamat, kecamatan, atau kota..."
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6">
          <p className="text-sm font-semibold text-slate-600">
            {filteredLansia.length.toLocaleString("id-ID")} Lansia Terdaftar
          </p>
        </div>

        {loading ? (
          <AdminLoadingRows columns={4} />
        ) : filteredLansia.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <UserRound className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-800">Tidak ada lansia ditemukan.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-bold">Lansia</th>
                    <th className="px-6 py-3 font-bold">Wilayah & Alamat</th>
                    <th className="px-6 py-3 font-bold">Catatan Kondisi</th>
                    <th className="px-6 py-3 text-right font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLansia.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50/80">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 shrink-0 overflow-hidden rounded-full bg-blue-50 border border-slate-200">
                            {item.foto_url ? (
                              <SignedImage path={item.foto_url} alt={item.nama} className="h-full w-full object-cover" />
                            ) : (
                              <UserRound className="h-full w-full p-2 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-950">{item.nama}</p>
                            <p className="text-xs font-semibold text-blue-700">
                              Keluarga: {item.nama_keluarga || "Keluarga Rangkul"}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Terdaftar: {new Date(item.created_at).toLocaleDateString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-800 font-medium">{item.alamat || "-"}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {[item.kecamatan, item.kabupaten_kota, item.provinsi].filter(Boolean).join(", ") || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="max-w-xs truncate text-xs text-slate-600">
                          {item.catatan_kondisi || "Tidak ada catatan"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/lansia/${item.id}`}
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-800"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Detail & Berkas KTP
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {filteredLansia.map((item) => (
                <article key={item.id} className="space-y-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded-full bg-blue-50 border border-slate-200">
                      {item.foto_url ? (
                        <SignedImage path={item.foto_url} alt={item.nama} className="h-full w-full object-cover" />
                      ) : (
                        <UserRound className="h-full w-full p-2 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-950">{item.nama}</p>
                      <p className="truncate text-xs font-semibold text-blue-700">
                        Keluarga: {item.nama_keluarga || "Keluarga Rangkul"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {[item.kecamatan, item.kabupaten_kota].filter(Boolean).join(", ") || "Alamat -"}
                      </p>
                    </div>
                    <Link
                      href={`/admin/lansia/${item.id}`}
                      className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-blue-700"
                    >
                      Detail
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
