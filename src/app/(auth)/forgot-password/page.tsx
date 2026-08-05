"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Masukkan alamat email yang valid");
      return;
    }
    setError("");
    setSent(true);
    // TODO: call password reset API
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center px-4 py-10">
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#90CAF9]/15 blur-[100px] -translate-y-1/3 translate-x-1/3" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#0D47A1]/05 blur-[80px]" />

      <div className="w-full max-w-[420px] relative">
        <div className="bg-white rounded-3xl border border-border shadow-[0_12px_48px_rgba(13,71,161,0.10)] p-8">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="mb-3">
              <Image
                src="/logo.png"
                alt="Rangkul"
                width={56}
                height={56}
                className="rounded-2xl"
                priority
                unoptimized
              />
            </Link>
            <h1 className="font-display font-extrabold text-2xl text-foreground">
              Lupa Kata Sandi
            </h1>
            <p className="text-muted-foreground text-sm mt-1 text-center max-w-xs">
              Masukkan emailmu, kami akan mengirim tautan untuk mengatur ulang kata sandi.
            </p>
          </div>

          {sent ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
              <p className="text-sm font-semibold text-green-700">Tautan dikirim</p>
              <p className="text-xs text-green-600 mt-1">
                Cek inbox emailmu. Tautan berlaku selama 15 menit.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div>
                <Label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (submitted && e.target.value) setError("");
                  }}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className={`h-11 rounded-xl ${error ? "border-red-400" : "border-border focus-visible:border-[#0D47A1]"}`}
                />
                {error && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 shrink-0">
                      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1-9a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1Z" />
                    </svg>
                    {error}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="h-11 w-full bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-90 shadow-sm"
              >
                Kirim Tautan Reset
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link href="/login" className="text-[#0D47A1] font-bold hover:underline">
              Kembali ke halaman masuk
            </Link>
          </p>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
