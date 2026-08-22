"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PembayaranPage({ params }: { params: Promise<{ task_id: string }> }) {
  const router = useRouter();
  const { task_id } = use(params);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [demoBalance, setDemoBalance] = useState(500000);
  const [totalPrice] = useState(75000); // Mock data

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Mock API call latency
    await new Promise((resolve) => setTimeout(resolve, 2500));
    
    setIsProcessing(false);
    setIsSuccess(true);
    setDemoBalance((prev) => prev - totalPrice);
    
    // Redirect after showing success for a bit
    setTimeout(() => {
      router.push(`/kunjungan/${task_id}`);
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Pembayaran Berhasil!</h1>
        <p className="text-gray-500 mb-8 font-medium">Dana Anda saat ini ditahan secara aman dan baru akan diteruskan ke Helper setelah tugas selesai.</p>
        
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 text-left">
          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-gray-500">Sisa Saldo Demo</span>
            <span className="font-semibold text-gray-900">Rp {demoBalance.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">ID Referensi</span>
            <span className="font-medium text-gray-900 font-mono">TRX-{task_id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>

        <Button onClick={() => router.push(`/kunjungan/${task_id}`)} className="w-full h-14 bg-brand-gradient text-white rounded-xl shadow-lg">
          Kembali ke Detail Kunjungan
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href={`/kunjungan/${task_id}`} className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali ke Kunjungan
      </Link>

      <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Penyelesaian Pembayaran</h1>
      <p className="text-gray-500 mb-8 font-medium">Selesaikan pembayaran untuk mengkonfirmasi kunjungan Anda.</p>

      {/* Saldo Card */}
      <div className="bg-gradient-to-br from-[#0D47A1] to-blue-800 rounded-3xl p-6 text-white mb-8 shadow-xl shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Wallet className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <p className="text-blue-100 text-sm font-medium mb-1">Saldo Demo Anda</p>
          <h2 className="text-4xl font-black tabular-nums tracking-tight mb-6">
            Rp {demoBalance.toLocaleString('id-ID')}
          </h2>
          <div className="flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
            <ShieldCheck className="w-4 h-4 text-green-300" />
            <span className="font-medium">Transaksi Terlindungi</span>
          </div>
        </div>
      </div>

      {/* Rincian Pembayaran */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mb-8 space-y-4">
        <h3 className="font-bold text-gray-900 text-lg mb-2">Rincian Transaksi</h3>
        
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Tugas Pendampingan Lansia</span>
          <span className="font-medium">Rp 75.000</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Biaya Layanan Rangkul</span>
          <span className="font-medium text-green-600">Gratis (Promo)</span>
        </div>
        
        <hr className="border-gray-100 my-4" />
        
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-900 text-lg">Total Bayar</span>
          <span className="font-black text-2xl text-[#0D47A1]">Rp {totalPrice.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <Button 
        onClick={handlePayment} 
        disabled={isProcessing || demoBalance < totalPrice}
        className="w-full h-14 bg-brand-gradient hover:opacity-90 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98]"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Memproses Pembayaran...
          </>
        ) : (
          "Bayar Sekarang"
        )}
      </Button>

      {demoBalance < totalPrice && (
        <p className="text-red-500 text-sm text-center mt-3 font-medium">Saldo Demo Anda tidak mencukupi.</p>
      )}

      <p className="text-xs text-center text-gray-400 mt-6 font-medium max-w-sm mx-auto">
        Dengan menekan tombol Bayar, Anda menyetujui bahwa dana akan ditahan menggunakan sistem <span className="font-bold">Dummy Ledger Rangkul</span>.
      </p>
    </div>
  );
}
