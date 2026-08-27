"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    snap?: { pay: (token: string, callbacks?: Record<string, () => void>) => void };
  }
}

type Task = { id: string; status: string; harga_dasar: number; harga_final: number };
type Payment = {
  status: string;
  amount: number;
  jumlah_total: number;
  helper_share: number;
  platform_fee: number;
  koordinator_share: number;
  midtrans_order_id: string | null;
  released_at: string | null;
};

const money = (value: number | null | undefined) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

export default function PembayaranPage({ params }: { params: Promise<{ task_id: string }> }) {
  const router = useRouter();
  const { task_id: taskId } = use(params);
  const [task, setTask] = useState<Task | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setError(null);
    const [taskResponse, paymentResponse] = await Promise.all([
      fetch(`/api/tasks/${taskId}`, { cache: "no-store" }),
      fetch(`/api/payments/${taskId}/status`, { cache: "no-store" }),
    ]);
    const taskBody = await taskResponse.json().catch(() => null) as { task?: Task; message?: string } | null;
    const paymentBody = await paymentResponse.json().catch(() => null) as { payment?: Payment; message?: string } | null;
    if (!taskResponse.ok) throw new Error(taskBody?.message || "Detail tugas tidak dapat dimuat");
    if (!paymentResponse.ok) throw new Error(paymentBody?.message || "Status pembayaran tidak dapat dimuat");
    setTask(taskBody?.task || null);
    setPayment(paymentBody?.payment || null);
  };

  useEffect(() => {
    const scriptId = "midtrans-snap-script";
    if (!document.getElementById(scriptId) && process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
      script.dataset.clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
      document.body.appendChild(script);
    }
    // This effect synchronizes data fetched from the payment API into the page state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Data pembayaran tidak dapat dimuat")).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      const response = await fetch(`/api/payments/${taskId}/charge`, { method: "POST" });
      const body = await response.json().catch(() => null) as { checkout?: { token: string; redirect_url?: string }; message?: string } | null;
      if (!response.ok || !body?.checkout) throw new Error(body?.message || "Checkout Midtrans gagal dibuat");
      if (window.snap) {
        window.snap.pay(body.checkout.token, {
          onSuccess: () => void loadData(),
          onPending: () => void loadData(),
          onError: () => setError("Pembayaran belum berhasil. Silakan cek status pembayaran."),
        });
      } else if (body.checkout.redirect_url) {
        window.location.assign(body.checkout.redirect_url);
      } else {
        throw new Error("Komponen checkout Midtrans belum siap");
      }
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Pembayaran belum dapat diproses");
    } finally {
      setProcessing(false);
    }
  };

  const releasePayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, { method: "PATCH" });
      const body = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(body?.message || "Pembayaran belum dapat dicairkan");
      await loadData();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Pembayaran belum dapat dicairkan");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="mx-auto max-w-xl px-4 py-20 text-center text-slate-500"><Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin" />Memuat pembayaran...</div>;
  if (error && !task) return <div className="mx-auto max-w-xl px-4 py-20 text-center"><p className="mb-5 text-red-600">{error}</p><Button onClick={() => void loadData()} variant="outline">Coba lagi</Button></div>;
  if (!task) return null;

  const isHeld = payment?.status === "held_escrow";
  const isReleased = payment?.status === "released";
  const isRefunded = payment?.status === "refunded" || payment?.status === "dibatalkan_kompensasi";
  const canRelease = isHeld && task.status === "selesai";

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link href={`/kunjungan/${taskId}`} className="mb-8 inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Kunjungan</Link>
      <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900">Pembayaran Kunjungan</h1>
      <p className="mb-8 font-medium text-slate-500">Pembayaran diproses melalui Midtrans Sandbox. Status akhir hanya mengikuti webhook server.</p>
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D47A1] to-blue-800 p-6 text-white shadow-xl"><Wallet className="absolute right-8 top-8 h-28 w-28 opacity-10" /><p className="relative text-sm text-blue-100">Total dari server</p><h2 className="relative mt-1 text-4xl font-black tabular-nums">{money(task.harga_final)}</h2><div className="relative mt-6 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm"><ShieldCheck className="h-4 w-4 text-green-300" />Midtrans Sandbox</div></div>
      <div className="mb-8 space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"><h3 className="text-lg font-bold text-slate-900">Rincian Transaksi</h3><div className="flex justify-between text-sm text-slate-600"><span>Harga dasar layanan</span><span className="font-semibold text-slate-900">{money(task.harga_dasar)}</span></div>{task.harga_final !== task.harga_dasar && <div className="flex justify-between text-sm text-slate-600"><span>Layanan tambahan disetujui</span><span className="font-semibold text-slate-900">{money(task.harga_final - task.harga_dasar)}</span></div>}<div className="flex justify-between border-t border-slate-100 pt-4 text-lg font-black text-slate-900"><span>Total bayar</span><span className="text-[#0D47A1]">{money(task.harga_final)}</span></div>{payment && <p className="text-sm text-slate-500">Status: <span className="font-bold text-slate-900">{payment.status}</span></p>}</div>
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {isHeld && <div className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">Pembayaran sudah diterima dan ditahan sampai Keluarga mengonfirmasi tugas selesai.</div>}
      {isHeld && !canRelease && <div className="mb-4 rounded-xl bg-blue-50 p-4 text-sm font-medium text-blue-800">Tunggu Helper mengirim laporan kunjungan. Tombol pencairan muncul setelah task berstatus selesai.</div>}
      {isReleased && <div className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">Pembayaran sudah dicairkan ke pihak terkait.</div>}
      {isRefunded && <div className="mb-4 rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-800">Pembayaran sudah masuk proses refund atau kompensasi.</div>}
      {!isHeld && !isReleased && !isRefunded && <Button onClick={handlePayment} disabled={processing} className="h-14 w-full rounded-2xl bg-brand-gradient text-lg font-bold text-white shadow-xl">{processing ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" />Menyiapkan Midtrans...</> : "Bayar dengan Midtrans"}</Button>}
      {canRelease && <Button onClick={() => void releasePayment()} disabled={processing} className="h-14 w-full rounded-2xl bg-brand-gradient text-lg font-bold text-white shadow-xl">{processing ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" />Mencairkan pembayaran...</> : "Konfirmasi selesai dan cairkan dana"}</Button>}
      {isReleased && <Button onClick={() => router.push(`/kunjungan/${taskId}`)} className="h-14 w-full rounded-2xl bg-brand-gradient font-bold text-white"><CheckCircle2 className="mr-2 h-5 w-5" />Kembali ke Detail Kunjungan</Button>}
      <p className="mt-6 text-center text-xs font-medium text-slate-400">Nominal pembayaran dan pembagian dana ditentukan server Rangkul. Browser tidak dapat mengubahnya.</p>
    </div>
  );
}
