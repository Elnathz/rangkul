/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  UserRound, 
  MapPin, 
  FileText, 
  Calendar, 
  Activity, 
  Stethoscope, 
  Phone, 
  Mail, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  Maximize2,
  ExternalLink,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedImage } from "@/components/ui/SignedImage";
import { useSignedFile } from "@/hooks/use-signed-file";

type LansiaDetail = {
  id: string;
  nama: string;
  umur?: number | null;
  jenis_kelamin?: string | null;
  golongan_darah?: string | null;
  catatan_kondisi?: string | null;
  tingkat_mobilitas?: string | null;
  kebutuhan_khusus?: string | null;
  alamat?: string | null;
  rt?: string | null;
  rw?: string | null;
  kelurahan?: string | null;
  kecamatan?: string | null;
  kabupaten_kota?: string | null;
  provinsi?: string | null;
  foto_url?: string | null;
  dokumen_identitas_lansia_url?: string | null;
  dokumen_hubungan_keluarga_url?: string | null;
  verified_status?: "pending" | "verified" | "rejected";
  nama_keluarga?: string | null;
  email_keluarga?: string | null;
  telepon_keluarga?: string | null;
};

// Sample placeholder documents if no file was uploaded during demo creation
const SAMPLE_KTP = "https://images.unsplash.com/photo-1618042164219-62c820f10723?q=80&w=1000&auto=format&fit=crop";
const SAMPLE_KK = "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=1000&auto=format&fit=crop";

function DocumentPreviewCard({
  title,
  path,
  fallbackSampleUrl,
  onOpenPreview
}: {
  title: string;
  path: string | null | undefined;
  fallbackSampleUrl: string;
  onOpenPreview: (title: string, resolvedUrl: string) => void;
}) {
  const { url: signedUrl, status } = useSignedFile(path);
  const displayUrl = signedUrl || (path ? null : fallbackSampleUrl);

  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-blue-300">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-800">{title}</p>
        {path ? (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Berkas Terunggah
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Dokumen Contoh (Demo)
          </span>
        )}
      </div>

      <div 
        onClick={() => displayUrl && onOpenPreview(title, displayUrl)}
        className="group relative min-h-[210px] w-full cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-inner flex items-center justify-center transition-all hover:shadow-md"
      >
        {status === "loading" && path ? (
          <div className="flex items-center justify-center p-8 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
          </div>
        ) : displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt={title}
              className="h-56 w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 transition-opacity group-hover:opacity-100 flex flex-col items-center justify-center text-white gap-2 backdrop-blur-[2px]">
              <Maximize2 className="h-7 w-7" />
              <span className="text-xs font-bold px-3 py-1 bg-white/20 rounded-full border border-white/30 backdrop-blur-md">
                Klik untuk memperbesar
              </span>
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-xs font-medium text-slate-400">Dokumen tidak tersedia</p>
          </div>
        )}
      </div>

      {displayUrl && (
        <button
          type="button"
          onClick={() => onOpenPreview(title, displayUrl)}
          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 py-2 rounded-xl border border-blue-100 transition-colors"
        >
          <Maximize2 className="h-3.5 w-3.5" /> Buka Perbesar Foto {title}
        </button>
      )}
    </div>
  );
}

export default function KoordinatorDetailLansiaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lansia, setLansia] = useState<LansiaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [lightbox, setLightbox] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    let active = true;
    const fetchDetail = async () => {
      setError("");
      try {
        const response = await fetch(`/api/lansia/${id}`, { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "Gagal memuat detail lansia");
        if (active) setLansia(payload.profile);
      } catch (err: unknown) {
        if (active) setError((err as Error).message || "Terjadi kesalahan sistem");
      } finally {
        if (active) setLoading(false);
      }
    };

    if (id) void fetchDetail();
    return () => {
      active = false;
    };
  }, [id]);

  const handleVerify = async (status: "verified" | "rejected") => {
    if (!lansia) return;
    setVerifying(true);
    setError("");
    setSuccessMsg("");
    try {
      const response = await fetch("/api/koordinator/lansia", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lansia.id, status }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Gagal memperbarui verifikasi");

      setLansia((prev) => prev ? { ...prev, verified_status: status } : null);
      setSuccessMsg(`Status lansia berhasil diubah menjadi ${status === "verified" ? "Terverifikasi" : "Ditolak"}.`);
    } catch (err: unknown) {
      setError((err as Error).message || "Gagal memproses status verifikasi");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  if (error && !lansia) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-lg font-bold text-slate-800">Gagal Memuat Data Lansia</h2>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Button onClick={() => router.push("/koordinator/lansia")} className="mt-4 rounded-xl">
          Kembali ke Daftar Lansia
        </Button>
      </div>
    );
  }

  if (!lansia) return null;

  const status = lansia.verified_status ?? "verified";

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-3 py-6 pb-32 sm:px-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/koordinator/lansia")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Verifikasi Lansia
        </button>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            status === "verified"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : status === "rejected"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          {status === "verified" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : status === "rejected" ? (
            <XCircle className="h-3.5 w-3.5" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5" />
          )}
          {status === "verified" ? "Terverifikasi" : status === "rejected" ? "Ditolak" : "Perlu Verifikasi"}
        </span>
      </div>

      {successMsg ? (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* Header Profile Info */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-50 shadow-md">
            {lansia.foto_url ? (
              <SignedImage path={lansia.foto_url} alt={lansia.nama} className="h-full w-full object-cover" />
            ) : (
              <UserRound className="h-full w-full p-6 text-slate-400" />
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{lansia.nama}</h1>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                <Calendar className="h-3.5 w-3.5" /> {lansia.umur ?? "-"} Tahun
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                <Activity className="h-3.5 w-3.5" /> {lansia.tingkat_mobilitas || "Mobilitas Standar"}
              </span>
              {lansia.golongan_darah ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
                  Goldar {lansia.golongan_darah}
                </span>
              ) : null}
            </div>

            <p className="flex items-start justify-center sm:justify-start gap-1.5 text-xs text-slate-600 pt-2">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                {lansia.alamat || "Alamat belum diisi"}, RT {lansia.rt || "-"}/RW {lansia.rw || "-"}, Kel. {lansia.kelurahan || "-"}, Kec. {lansia.kecamatan || "-"}, {lansia.kabupaten_kota || "-"}, {lansia.provinsi || "-"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Data Keluarga Pendaftar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Data Penanggung Jawab / Keluarga</h3>
              <p className="text-xs text-slate-500">Akun keluarga yang mendaftarkan lansia</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Nama Keluarga</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{lansia.nama_keluarga || "Keluarga Rangkul"}</p>
            </div>
            {lansia.email_keluarga ? (
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{lansia.email_keluarga}</span>
              </div>
            ) : null}
            {lansia.telepon_keluarga ? (
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{lansia.telepon_keluarga}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Kondisi Medis & Kebutuhan */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Kondisi Medis & Catatan Kesehatan</h3>
              <p className="text-xs text-slate-500">Catatan khusus dari keluarga</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Catatan Kondisi</p>
              <p className="font-semibold text-slate-700 mt-0.5 leading-relaxed">
                {lansia.catatan_kondisi || "Tidak ada catatan khusus."}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Kebutuhan Khusus</p>
              <p className="font-semibold text-slate-700 mt-0.5 leading-relaxed">
                {lansia.kebutuhan_khusus || "Tidak ada kebutuhan khusus spesifik."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dokumen Ajuan Verifikasi (KTP & KK) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Dokumen Berkas Pendaftaran (Klik Gambar untuk Memperbesar)</h3>
              <p className="text-xs text-slate-500">KTP Lansia dan Dokumen Kartu Keluarga yang diajukan</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <DocumentPreviewCard
            title="1. KTP Lansia"
            path={lansia.dokumen_identitas_lansia_url}
            fallbackSampleUrl={SAMPLE_KTP}
            onOpenPreview={(title, url) => setLightbox({ title, url })}
          />

          <DocumentPreviewCard
            title="2. Dokumen Kartu Keluarga (KK)"
            path={lansia.dokumen_hubungan_keluarga_url}
            fallbackSampleUrl={SAMPLE_KK}
            onOpenPreview={(title, url) => setLightbox({ title, url })}
          />
        </div>
      </div>

      {/* Action Buttons for Verification */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Aksi Verifikasi Koordinator</h4>
          <p className="text-xs text-slate-500">Pastikan data dan dokumen lansia sudah sesuai sebelum menyetujui.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            disabled={verifying}
            onClick={() => handleVerify("rejected")}
            className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 font-bold rounded-xl min-h-11 shrink-0 px-4"
          >
            <XCircle className="h-4 w-4 mr-1.5 shrink-0" /> Tolak Pendaftaran
          </Button>
          <Button
            type="button"
            disabled={verifying}
            onClick={() => handleVerify("verified")}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md min-h-11 shrink-0 px-4"
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5 shrink-0" /> Setujui Verifikasi
          </Button>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal for Document Image Viewing */}
      {lightbox ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-700" />
                <h3 className="font-bold text-slate-900 text-base">{lightbox.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open(lightbox.url, "_blank")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Buka Tab Baru
                </button>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/5">
              <img
                src={lightbox.url}
                alt={lightbox.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-lg border border-slate-200"
              />
            </div>

            <div className="border-t border-slate-100 px-6 py-3 bg-slate-50 flex justify-end">
              <Button type="button" onClick={() => setLightbox(null)} className="rounded-xl font-bold">
                Tutup Pratinjau
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
