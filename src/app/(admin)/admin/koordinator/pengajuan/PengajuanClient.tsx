"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileCheck, ExternalLink, UserCheck, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function PengajuanClient({ queue }: { queue: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Reject dialog state
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [alasan, setAlasan] = useState('');

  const handleApprove = async (id: string) => {
    try {
      setLoadingId(id);
      const res = await fetch(`/api/admin/koordinator/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catatan: 'Disetujui dari dashboard admin' })
      });
      if (!res.ok) throw new Error('Gagal menyetujui');
      router.refresh();
    } catch (error) {
      alert('Gagal menyetujui pengajuan');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectId || !alasan) return;
    try {
      setLoadingId(rejectId);
      const res = await fetch(`/api/admin/koordinator/${rejectId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alasan })
      });
      if (!res.ok) throw new Error('Gagal menolak');
      setRejectId(null);
      setAlasan('');
      router.refresh();
    } catch (error) {
      alert('Gagal menolak pengajuan');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
        {queue.map((koord: any) => (
          <div key={koord.id} className="p-6 hover:bg-gray-50/50 transition-colors">
            <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
              <div className="flex gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6 text-[#0D47A1]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{koord.users?.full_name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">
                      Menunggu Verifikasi
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Tingkat: Pengurus {koord.tingkat.toUpperCase()}</p>
                  <p className="text-sm text-gray-500 mb-3">{koord.wilayah}</p>
                  
                  <div className="flex gap-3">
                    {koord.dokumen_url && (
                      <a href={koord.dokumen_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#0D47A1] hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg">
                        <FileCheck className="w-4 h-4" /> SK Jabatan <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {koord.ktp_url && (
                      <a href={koord.ktp_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-slate-600 hover:underline flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg">
                        <FileCheck className="w-4 h-4" /> KTP <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-0 border-gray-100">
                <Button 
                  variant="outline" 
                  className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setRejectId(koord.id)}
                  disabled={loadingId === koord.id}
                >
                  <XCircle className="w-4 h-4 mr-2" /> Tolak
                </Button>
                <Button 
                  className="flex-1 md:flex-none bg-[#0D47A1] text-white hover:bg-blue-800"
                  onClick={() => handleApprove(koord.id)}
                  disabled={loadingId === koord.id}
                >
                  <FileCheck className="w-4 h-4 mr-2" /> Setujui SK
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!rejectId} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pengajuan Koordinator</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan agar calon koordinator dapat memperbaiki dokumennya.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Contoh: Dokumen SK buram atau tidak sesuai wilayah."
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleRejectSubmit} disabled={!alasan.trim()}>
              Konfirmasi Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
