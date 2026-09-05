"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, XCircle, Loader2, UploadCloud, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function HelperVerificationButtons({ helperId }: { helperId: string }) {
  const router = useRouter();
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [alasanPenolakan, setAlasanPenolakan] = useState("");
  const [fotoPenolakanFile, setFotoPenolakanFile] = useState<File | null>(null);
  const [fotoPenolakanUrl, setFotoPenolakanUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApprove = async () => {
    setLoadingApprove(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/helper/${helperId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catatan: "" })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyetujui helper");
      
      router.refresh();
      router.push('/koordinator/antrean');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyetujui helper");
      setIsApproveModalOpen(false);
    } finally {
      setLoadingApprove(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(`Lampiran ditolak: ${file.name}. Ukuran file maksimal 5MB.`);
        e.target.value = "";
        return;
      }
      setErrorMsg("");
      setFotoPenolakanFile(file);
      setFotoPenolakanUrl(URL.createObjectURL(file));
    }
  };

  const submitReject = async () => {
    if (alasanPenolakan.length < 5) {
      setErrorMsg("Alasan penolakan minimal 5 karakter.");
      return;
    }
    
    setLoadingReject(true);
    setErrorMsg("");
    
    try {
      let uploadedUrl = null;
      
      // Jika ada file bukti penolakan, unggah dulu
      if (fotoPenolakanFile) {
        const formData = new FormData();
        formData.append("file", fotoPenolakanFile);
        formData.append("docType", "dokumen_koordinator");
        
        const uploadRes = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });
        
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.message || "Gagal mengunggah foto bukti");
        }
        uploadedUrl = uploadData.data?.path || uploadData.path;
      }
      
      const res = await fetch(`/api/helper/${helperId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          alasan: alasanPenolakan,
          foto_url: uploadedUrl 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menolak helper");
      
      setIsRejectModalOpen(false);
      router.refresh();
      router.push('/koordinator/antrean');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menolak helper");
    } finally {
      setLoadingReject(false);
    }
  };

  return (
    <>
      <div className="bg-[#F5F8FC] p-6 md:p-8 flex flex-col gap-4 border-t border-gray-100">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-2 border border-red-100">
            {errorMsg}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            className="flex-1 h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white shadow-sm font-bold"
            onClick={() => {
              setErrorMsg("");
              setIsRejectModalOpen(true);
            }}
            disabled={loadingApprove || loadingReject}
          >
            {loadingReject ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <XCircle className="w-5 h-5 mr-2" />} 
            Tolak Pendaftaran
          </Button>
          <Button 
            className="flex-1 h-12 bg-[#0D47A1] text-white hover:bg-blue-800 shadow-md font-bold"
            onClick={() => {
              setErrorMsg("");
              setIsApproveModalOpen(true);
            }}
            disabled={loadingApprove || loadingReject}
          >
            {loadingApprove ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />} 
            Setujui Helper
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={isApproveModalOpen}
        onOpenChange={setIsApproveModalOpen}
        title="Setujui Helper?"
        description="Helper ini akan mendapatkan akses untuk mengambil tugas setelah verifikasi disetujui. Pastikan dokumen identitas dan foto sudah sesuai."
        confirmLabel="Ya, Setujui Helper"
        tone="primary"
        icon={<CheckCircle2 className="h-6 w-6" aria-hidden="true" />}
        loading={loadingApprove}
        onConfirm={handleApprove}
      />

      <Dialog open={isRejectModalOpen} onOpenChange={(open) => !loadingReject && setIsRejectModalOpen(open)}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
          <div className="bg-red-500 h-2 w-full absolute top-0 left-0" />
          
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    Penolakan Helper
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 mt-1 leading-relaxed">
                    Tuliskan alasan penolakan secara jelas agar Helper dapat memperbaikinya di pengajuan berikutnya.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-5">
              {errorMsg && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div className="space-y-2.5">
                <Label htmlFor="alasan" className="text-sm font-bold text-gray-700 flex items-center">
                  Alasan Penolakan <span className="text-red-500 ml-1 text-lg leading-none">*</span>
                </Label>
                <Textarea
                  id="alasan"
                  placeholder="Contoh: Foto KTP terpotong / buram, Wajah tidak sesuai dengan identitas, dll."
                  value={alasanPenolakan}
                  onChange={(e) => setAlasanPenolakan(e.target.value)}
                  className="min-h-[110px] resize-none border-gray-200 focus-visible:ring-red-500 focus-visible:border-red-500 rounded-xl bg-gray-50/50 text-sm"
                />
                <p className={`text-xs ${alasanPenolakan.length > 0 && alasanPenolakan.length < 5 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                  Minimal 5 karakter.
                </p>
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-gray-700">Foto Bukti / Lampiran (Opsional)</Label>
                {!fotoPenolakanUrl ? (
                  <div 
                    className="border-2 border-dashed border-gray-200 hover:border-red-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-red-50/30 transition-all duration-200 group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-red-50 flex items-center justify-center mb-3 transition-colors">
                      <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-red-600 transition-colors">Klik untuk mengunggah foto</p>
                    <p className="text-xs text-gray-400 mt-1">Maksimal 5MB (JPG, PNG)</p>
                  </div>
                ) : (
                  <div className="relative border border-gray-200 rounded-xl overflow-hidden group shadow-sm bg-gray-50 p-1">
                    <img src={fotoPenolakanUrl} alt="Preview Lampiran" className="w-full h-36 object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="rounded-full shadow-lg font-semibold px-4"
                        onClick={() => { setFotoPenolakanFile(null); setFotoPenolakanUrl(""); }}
                      >
                        <X className="w-4 h-4 mr-1.5" /> Hapus Foto
                      </Button>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/jpeg, image/png"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            
            <DialogFooter className="mt-8 sm:justify-end gap-3 sm:gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsRejectModalOpen(false)}
                disabled={loadingReject}
                className="rounded-xl font-semibold hover:bg-gray-100"
              >
                Batal
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={submitReject}
                disabled={loadingReject || alasanPenolakan.length < 5}
                className="rounded-xl font-bold px-6 shadow-md shadow-red-500/20"
              >
                {loadingReject ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Konfirmasi Penolakan
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
