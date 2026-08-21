"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Phone, ShieldAlert, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SOSDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: "helper" | "keluarga" | "koordinator" | "admin" | null;
}

export default function SOSDialog({ isOpen, onClose, userRole }: SOSDialogProps) {
  const [countdown, setCountdown] = useState(5);
  const [isAlerting, setIsAlerting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0 && !isAlerting && !isSent) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0 && !isAlerting && !isSent) {
      handleSendAlert();
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown, isAlerting, isSent]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        setCountdown(5);
        setIsAlerting(false);
        setIsSent(false);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  async function handleSendAlert() {
    setIsAlerting(true);
    // MOCK API Call for SOS
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsAlerting(false);
    setIsSent(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-red-950/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {isSent ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <ShieldAlert className="w-12 h-12 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sinyal Darurat Terkirim!</h2>
              <p className="text-gray-500 mt-2 font-medium">Koordinator dan Keluarga telah diberitahu beserta lokasi Anda saat ini.</p>
            </div>
            
            <div className="pt-4">
              <a href="tel:112" className="block w-full">
                <Button className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-red-600/30">
                  <Phone className="w-5 h-5 mr-2" />
                  Hubungi Layanan Darurat (112)
                </Button>
              </a>
            </div>
            <button onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-slate-600 mt-4 underline underline-offset-4">Tutup Modal</button>
          </div>
        ) : (
          <>
            <div className="bg-red-600 p-8 text-center relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-500 rounded-full animate-ping opacity-20 pointer-events-none" />
              <AlertTriangle className="w-20 h-20 text-white mx-auto relative z-10 drop-shadow-md" />
              <h2 className="text-3xl font-black text-white tracking-tight mt-4 relative z-10">DARURAT!</h2>
            </div>
            
            <div className="p-8 space-y-6 bg-white text-center">
              <p className="text-slate-600 font-medium">Sinyal darurat akan dikirim otomatis ke Koordinator dan Keluarga dalam:</p>
              
              <div className="text-6xl font-black text-red-600 my-4 tabular-nums">
                {countdown}
              </div>

              <div className="space-y-3 pt-2">
                <Button 
                  onClick={handleSendAlert} 
                  disabled={isAlerting}
                  className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-red-600/30 transition-all active:scale-[0.98]"
                >
                  {isAlerting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Kirim Sekarang"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isAlerting}
                  className="w-full h-14 border-slate-200 hover:bg-slate-50 font-bold text-lg rounded-2xl"
                >
                  Batalkan
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
