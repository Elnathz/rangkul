"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center px-4 py-20">
      {/* Blobs */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#90CAF9]/15 blur-[100px] -translate-y-1/3 translate-x-1/3" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#0D47A1]/05 blur-[80px]" />

      <div className="w-full max-w-[420px] relative">
        {/* Card */}
        <div className="bg-white rounded-3xl border border-border shadow-[0_12px_48px_rgba(13,71,161,0.10)] p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-[14px] bg-brand-gradient flex items-center justify-center shadow mb-4">
              <span className="text-white font-display font-black text-lg">R</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl text-foreground">
              Selamat Datang
            </h1>
            <p className="text-muted-foreground text-sm mt-1 text-center">
              Masuk ke akunmu untuk melanjutkan
            </p>
          </div>

          <form className="flex flex-col gap-5">
            {/* Email/HP */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Email / No. HP
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                className="h-11 rounded-xl border-border focus-visible:ring-[#0D47A1]/30 focus-visible:border-[#0D47A1]"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Kata Sandi
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#0D47A1] hover:underline font-medium"
                >
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  className="h-11 rounded-xl border-border focus-visible:ring-[#0D47A1]/30 focus-visible:border-[#0D47A1] pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="h-11 w-full bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-90 shadow-sm shadow-[#0D47A1]/20 gap-2 mt-1"
            >
              <LogIn size={16} />
              Masuk
            </Button>
          </form>

          <Separator className="my-6" />

          <p className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-[#0D47A1] font-bold hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center mt-5">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
