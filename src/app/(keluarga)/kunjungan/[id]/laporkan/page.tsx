"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Upload, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LaporHelperPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description) return;
    
    setIsSubmitting(true);
    // Mock API call latency
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="w-24 h-24 bg-blue-100 text-[#0D47A1] rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Laporan Diterima</h1>
        <p className="text-gray-500 mb-8 font-medium">Laporan Anda telah masuk ke sistem kami dan sedang ditinjau oleh Koordinator serta tim Admin Rangkul.</p>
        
        <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200 mb-8 text-left flex gap-4">
          <Info className="w-6 h-6 text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-800 font-medium">Jika ini merupakan kondisi medis darurat atau ancaman keamanan langsung, mohon hubungi pihak berwenang (112 atau 119) sesegera mungkin.</p>
        </div>

        <Button onClick={() => router.push(`/kunjungan/${id}`)} className="w-full h-14 bg-brand-gradient text-white rounded-xl shadow-lg font-bold">
          Kembali ke Detail Kunjungan
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href={`/kunjungan/${id}`} className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Batal dan Kembali
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2 text-red-600">Laporkan Helper</h1>
        <p className="text-gray-500 font-medium">Harap berikan detail spesifik mengenai masalah yang Anda hadapi. Tim kami menganggap setiap laporan dengan sangat serius.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900">Kategori Masalah <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Tidak Datang Tanpa Kabar",
              "Datang Terlambat Signifikan",
              "Sikap/Perilaku Buruk",
              "Pekerjaan Tidak Sesuai",
              "Keamanan/Darurat",
              "Lainnya"
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`p-4 text-left border rounded-xl text-sm font-medium transition-all ${
                  category === cat 
                    ? 'border-red-600 bg-red-50 text-red-700 ring-1 ring-red-600' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900">Ceritakan Kronologinya <span className="text-red-500">*</span></label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none text-sm"
            placeholder="Jelaskan secara detail apa yang terjadi..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900">Unggah Bukti (Opsional)</label>
          <p className="text-xs text-gray-500 mb-2">Foto percakapan, kondisi, atau dokumen pendukung lainnya.</p>
          <button type="button" className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-[#0D47A1] hover:border-[#0D47A1] transition-colors group">
            <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Klik untuk memilih foto</span>
          </button>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting || !category || !description}
            className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-red-600/20 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Mengirim Laporan...
              </>
            ) : (
              "Kirim Laporan Resmi"
            )}
          </Button>
          <p className="text-xs text-center text-gray-400 mt-4 font-medium px-4">
            Dengan mengirimkan ini, Anda menyatakan bahwa informasi yang diberikan adalah jujur dan dapat dipertanggungjawabkan.
          </p>
        </div>
      </form>
    </div>
  );
}
