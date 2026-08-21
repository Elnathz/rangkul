import React from 'react';
import Link from 'next/link';
import { Clock, CheckCircle2, XCircle, AlertTriangle, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
type KoordinatorProfile = {
  id: string;
  wilayah: string;
  status: string;
};

interface KoordinatorStatusGuardProps {
  koordinator: KoordinatorProfile | null;
  children: React.ReactNode;
}

export default function KoordinatorStatusGuard({ koordinator, children }: KoordinatorStatusGuardProps) {
  // 1. Empty state: Belum pernah mengisi form pengajuan
  if (!koordinator) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <FileCheck className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Lengkapi Pengajuan Profil Koordinator</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Anda belum mengisi dokumen pengajuan dan mengatur wilayah operasional. Silakan isi form pengajuan untuk melanjutkan.
          </p>
          <Button asChild className="bg-[#0D47A1] text-white hover:bg-blue-800">
            <Link href="/koordinator/pengajuan">Isi Formulir Pengajuan Sekarang</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 2. Pending State
  if (koordinator.status === 'pending_verification') {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-[#0D47A1]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Pengajuan Sedang Ditinjau</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Terima kasih telah mendaftar! Profil dan dokumen SK Anda sedang dalam tahap verifikasi oleh Tim Admin Rangkul. Harap bersabar, proses ini mungkin memakan waktu 1-2 hari kerja.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-[#0D47A1] rounded-full text-sm font-semibold">
            Status: Menunggu Verifikasi
          </div>
        </div>
      </div>
    );
  }

  // 3. Rejected State
  if (koordinator.status === 'rejected') {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Pengajuan Ditolak</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Mohon maaf, dokumen atau data pengajuan Koordinator Anda tidak memenuhi syarat atau tidak valid setelah diverifikasi oleh Admin.
          </p>
          <Button asChild variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
            <Link href="/koordinator/pengajuan">Ajukan Ulang / Perbarui Dokumen</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 4. Suspended State
  if (koordinator.status === 'suspended') {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Akun Ditangguhkan</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Akses Koordinator Anda sedang ditangguhkan oleh sistem atau Admin karena adanya pelanggaran. Silakan hubungi layanan bantuan Rangkul untuk informasi lebih lanjut.
          </p>
          <Button variant="default" disabled>
            Hubungi Bantuan
          </Button>
        </div>
      </div>
    );
  }

  // 5. Verified State - Render Children (Dashboard or Antrean)
  if (koordinator.status === 'verified') {
    return <>{children}</>;
  }

  return null;
}
