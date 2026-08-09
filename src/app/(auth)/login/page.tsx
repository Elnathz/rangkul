"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function EyeIcon({ off }: { off?: boolean }) {
  return off ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 shrink-0">
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1-9a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1Z" />
      </svg>
      {message}
    </p>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [fields, setFields] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (data: typeof fields) => {
    const errs: Record<string, string> = {};
    if (!data.identifier.trim()) errs.identifier = "Username atau email wajib diisi";
    if (!data.password) errs.password = "Password wajib diisi";
    return errs;
  };

  const set =
    (key: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = { ...fields, [key]: e.target.value };
      setFields(next);
      if (submitted) setErrors(validate(next));
    };

  const [apiError, setApiError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setApiError("");
    
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setApiError(data.message || "Gagal masuk. Coba lagi nanti.");
        return;
      }
      
      // Success, redirect based on user role
      const roleRoutes: Record<string, string> = {
        keluarga: '/beranda',
        helper: '/helper/dashboard',
        koordinator: '/koordinator/dashboard',
        admin: '/admin/dashboard',
      };
      const targetRoute = roleRoutes[data.user?.role] || '/beranda';
      window.location.href = targetRoute;
    } catch {
      setApiError("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center px-4 py-10">
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#90CAF9]/15 blur-[100px] -translate-y-1/3 translate-x-1/3" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#0D47A1]/05 blur-[80px]" />

      <div className="w-full max-w-[420px] relative">
        <div className="bg-white rounded-3xl border border-border shadow-[0_12px_48px_rgba(13,71,161,0.10)] p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="mb-3">
              <Image
                src="/logo-markdown.svg"
                alt="Rangkul"
                width={80}
                height={80}
                priority
                unoptimized
              />
            </Link>
            <h1 className="font-display font-extrabold text-2xl text-foreground">
              Selamat Datang
            </h1>
            <p className="text-muted-foreground text-sm mt-1 text-center">
              Masuk ke akunmu untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div>
              <Label
                htmlFor="identifier"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block"
              >
                Username atau Email
              </Label>
              <Input
                id="identifier"
                value={fields.identifier}
                onChange={set("identifier")}
                placeholder="username atau nama@email.com"
                autoComplete="username"
                className={`h-11 rounded-xl ${errors.identifier ? "border-red-400 focus-visible:ring-red-300" : "border-border focus-visible:border-[#0D47A1]"}`}
              />
              <FieldError message={errors.identifier} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
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
                  value={fields.password}
                  onChange={set("password")}
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  className={`h-11 rounded-xl pr-11 ${errors.password ? "border-red-400 focus-visible:ring-red-300" : "border-border focus-visible:border-[#0D47A1]"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
              <FieldError message={errors.password} />
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1-9a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1Z" />
                </svg>
                {apiError}
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-90 shadow-sm"
            >
              Masuk
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Belum punya akun?{" "}
            <Link href="/register" className="text-[#0D47A1] font-bold hover:underline">
              Daftar sekarang
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
