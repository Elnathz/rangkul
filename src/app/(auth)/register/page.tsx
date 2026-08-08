"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ---- Types ----
type FieldErrors = Record<string, string>;

// ---- Password strength ----
function getPasswordChecks(password: string) {
  return [
    { label: "Min. 8 karakter", ok: password.length >= 8 },
    { label: "Maksimal 128 karakter", ok: password.length <= 128 || password.length === 0 },
    { label: "Mengandung minimal 1 simbol", ok: /[^A-Za-z0-9]/.test(password) },
  ];
}

// ---- Validation ----
// Nomor HP Indonesia: total 10–13 digit, dimulai 08
// Disimpan ke DB lengkap dengan 08 di awal
function validateRegister(data: {
  username: string;
  full_name: string;
  email: string;
  phone: string;
  password: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (data.username.length < 6) {
    errors.username = "Username minimal 6 karakter";
  } else if (data.username.length > 20) {
    errors.username = "Username maksimal 20 karakter";
  } else if (!/^[a-zA-Z0-9._-]+$/.test(data.username)) {
    errors.username = "Hanya huruf, angka, titik, underscore, dan dash";
  }
  if (data.full_name.length < 2) {
    errors.full_name = "Nama lengkap minimal 2 karakter";
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Format email tidak valid";
  }
  // Phone wajib, format: dimulai dengan 08, panjang 10-13 digit
  if (!data.phone || data.phone.trim() === "" || data.phone === "08") {
    errors.phone = "Nomor HP wajib diisi";
  } else if (!/^08[0-9]{8,11}$/.test(data.phone)) {
    errors.phone = "Nomor tidak valid (harus dimulai 08, total 10–13 digit)";
  }
  if (data.password.length < 8) {
    errors.password = "Password minimal 8 karakter";
  } else if (data.password.length > 128) {
    errors.password = "Password maksimal 128 karakter";
  } else if (!/[^A-Za-z0-9]/.test(data.password)) {
    errors.password = "Password harus mengandung minimal 1 simbol";
  }
  return errors;
}

// ---- Icon components ----
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

// ---- Role definitions ----
const roles = [
  {
    value: "keluarga",
    label: "Keluarga",
    desc: "Pantau kondisi lansia dari mana saja",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5 shrink-0">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    value: "helper",
    label: "Helper",
    desc: "Jadilah pendamping lokal terverifikasi",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5 shrink-0">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    value: "koordinator",
    label: "Koordinator RT/RW",
    desc: "Verifikasi helper dan pantau wilayahmu",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5 shrink-0">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
] as const;

type Role = (typeof roles)[number]["value"];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const initialRole: Role =
    roleParam === "helper" || roleParam === "koordinator" || roleParam === "keluarga"
      ? roleParam
      : "keluarga";

  const [role, setRole] = useState<Role>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [fields, setFields] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: "08", 
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const set =
    (key: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // Make 08 prefix undeletable for phone input
      if (key === 'phone') {
        value = value.replace(/[^0-9]/g, ''); // Ensure only numbers
        if (!value.startsWith('08')) {
          value = '08';
        }
      }

      const next = { ...fields, [key]: value };
      setFields(next);
      if (submitted) setErrors(validateRegister(next));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setApiError("");

    const errs = validateRegister(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: fields.username.trim(),
          full_name: fields.full_name.trim(),
          email: fields.email.trim(),
          phone: fields.phone,
          password: fields.password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) {
          const flat: FieldErrors = {};
          Object.keys(data.fieldErrors).forEach((key) => {
            flat[key] = data.fieldErrors[key][0];
          });
          setErrors(flat);
        }
        setApiError(data.message || "Gagal melakukan registrasi.");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setApiError("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  const pwChecks = getPasswordChecks(fields.password);
  const showPwChecks = fields.password.length > 0 || submitted;

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center px-4 py-10">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#90CAF9]/15 blur-[100px] -translate-y-1/3 translate-x-1/3" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#0D47A1]/05 blur-[80px]" />

      <div className="w-full max-w-[480px] relative">
        <div className="bg-white rounded-3xl border border-border shadow-[0_12px_48px_rgba(13,71,161,0.10)] p-8">
          {/* Logo — sama seperti login */}
          <div className="flex flex-col items-center mb-7">
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
              Buat Akun
            </h1>
            <p className="text-muted-foreground text-sm mt-1 text-center">
              Pilih peranmu untuk memulai
            </p>
          </div>

          {apiError && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-red-500">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1-9a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1Z" />
              </svg>
              {apiError}
            </div>
          )}

          {/* Role picker */}
          <div className="flex flex-col gap-3 mb-6">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex items-start sm:items-center gap-3.5 w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-300 transform active:scale-95 relative ${
                  role === r.value
                    ? "border-[#0D47A1] bg-[#0D47A1]/08 text-[#0D47A1] shadow-md scale-[1.03] z-10 ring-1 ring-[#0D47A1]/20"
                    : "border-border bg-[#F5F8FC] text-foreground hover:border-[#0D47A1]/40 hover:bg-white hover:shadow hover:scale-[1.02] z-0"
                }`}
              >
                <div className={`mt-0.5 sm:mt-0 shrink-0 p-1.5 rounded-lg ${role === r.value ? "bg-[#0D47A1] text-white" : "bg-white border text-muted-foreground"}`}>
                  {r.icon}
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <span className={`font-semibold text-sm block mb-0.5 ${role === r.value ? "text-[#0D47A1]" : "text-foreground"}`}>
                    {r.label}
                  </span>
                  <span className={`text-xs block leading-snug ${role === r.value ? "text-[#0D47A1]/80" : "text-muted-foreground"}`}>
                    {r.desc}
                  </span>
                </div>
                {role === r.value && (
                  <div className="shrink-0 absolute right-4 top-1/2 -translate-y-1/2 hidden sm:block">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#0D47A1]">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Username */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Username
              </Label>
              <Input
                value={fields.username}
                onChange={set("username")}
                placeholder="min. 6 karakter, huruf/angka/._-"
                autoComplete="username"
                className={`h-11 rounded-xl ${errors.username ? "border-red-400 focus-visible:ring-red-300" : "border-border focus-visible:border-[#0D47A1]"}`}
              />
              <FieldError message={errors.username} />
            </div>

            {/* Nama Lengkap */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Nama Lengkap
              </Label>
              <Input
                value={fields.full_name}
                onChange={set("full_name")}
                placeholder="Nama sesuai KTP"
                autoComplete="name"
                className={`h-11 rounded-xl ${errors.full_name ? "border-red-400 focus-visible:ring-red-300" : "border-border focus-visible:border-[#0D47A1]"}`}
              />
              <FieldError message={errors.full_name} />
            </div>

            {/* Email */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Email
              </Label>
              <Input
                type="email"
                value={fields.email}
                onChange={set("email")}
                placeholder="nama@email.com"
                autoComplete="email"
                className={`h-11 rounded-xl ${errors.email ? "border-red-400 focus-visible:ring-red-300" : "border-border focus-visible:border-[#0D47A1]"}`}
              />
              <FieldError message={errors.email} />
            </div>

            {/* Phone */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                No. HP <span className="text-red-500">*</span>
              </Label>
              <Input
                type="tel"
                inputMode="numeric"
                value={fields.phone}
                onChange={set("phone")}
                placeholder="Contoh: 08123456789"
                maxLength={13}
                autoComplete="tel"
                className={`h-11 rounded-xl ${errors.phone ? "border-red-400 focus-visible:ring-red-300" : "border-border focus-visible:border-[#0D47A1]"}`}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Gunakan format 08 (minimal 10 dan maksimal 13 digit).</p>
              <FieldError message={errors.phone} />
            </div>

            {/* Password */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Kata Sandi
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={fields.password}
                  onChange={set("password")}
                  placeholder="Min. 8 karakter, mengandung simbol"
                  autoComplete="new-password"
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

              {showPwChecks && (
                <div className="mt-2 flex flex-col gap-1">
                  {pwChecks.map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5">
                      {c.ok ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-green-500 shrink-0">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-red-400 shrink-0">
                          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L10 8.586 7.707 6.293a1 1 0 0 0-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 1 0 1.414 1.414L10 11.414l2.293 2.293a1 1 0 0 0 1.414-1.414L11.414 10l2.293-2.293Z" />
                        </svg>
                      )}
                      <span className={`text-xs ${c.ok ? "text-green-600" : "text-red-400"}`}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-90 shadow-sm mt-1"
            >
              {loading ? "Memproses Registrasi..." : "Buat Akun"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[#0D47A1] font-bold hover:underline">
              Masuk
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center p-8 text-center text-muted-foreground">Memuat...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
