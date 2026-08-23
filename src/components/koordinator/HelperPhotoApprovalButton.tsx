"use client";

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HelperPhotoApprovalButton({ requestId, photoUrl }: { requestId: string; photoUrl: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function approve() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/helpers/profile/photo/approve', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ request_id: requestId }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'Foto gagal diverifikasi');
      setMessage('Foto baru berhasil diverifikasi. Segarkan halaman untuk melihat foto publik terbaru.');
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Foto gagal diverifikasi');
    } finally {
      setLoading(false);
    }
  }

  return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-amber-800">Pengajuan foto baru</p><img src={photoUrl} alt="Foto baru yang menunggu verifikasi" className="mt-3 aspect-square max-w-[240px] rounded-xl object-cover" /><p className="mt-3 text-sm text-amber-900">Foto lama tetap tampil ke keluarga sampai pengajuan ini disetujui.</p><Button type="button" onClick={approve} disabled={loading} className="mt-4 bg-[#0D47A1] text-white">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}Setujui foto baru</Button>{message && <p className="mt-3 text-xs font-semibold text-amber-900">{message}</p>}</div>;
}
