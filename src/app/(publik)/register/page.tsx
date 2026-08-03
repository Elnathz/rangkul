"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, UserPlus, Users, Briefcase, Shield, AlertCircle } from "lucide-react";

const roles = [
  { value: "keluarga", label: "Keluarga", icon: Users },
  { value: "helper", label: "Helper", icon: Briefcase },
  { value: "koordinator", label: "Koordinator RT/RW", icon: Shield },
];

function CommonFields({
  showPassword,
  onTogglePassword,
}: {
  showPassword: boolean;
  onTogglePassword: () => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Nama Lengkap
        </Label>
        <Input
          placeholder="Nama sesuai KTP"
          className="h-11 rounded-xl border-border focus-visible:ring-[#0D47A1]/30 focus-visible:border-[#0D47A1]"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Email
          </Label>
          <Input
            type="email"
            placeholder="nama@email.com"
            className="h-11 rounded-xl border-border focus-visible:ring-[#0D47A1]/30 focus-visible:border-[#0D47A1]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            No. HP
          </Label>
          <Input
            type="tel"
            placeholder="08xxxxxxxxxx"
            className="h-11 rounded-xl border-border focus-visible:ring-[#0D47A1]/30 focus-visible:border-[#0D47A1]"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Kata Sandi
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 karakter"
            className="h-11 rounded-xl border-border focus-visible:ring-[#0D47A1]/30 focus-visible:border-[#0D47A1] pr-11"
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
    </>
  );
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center px-4 py-20">
      {/* Blobs */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#90CAF9]/15 blur-[100px] -translate-y-1/3 translate-x-1/3" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#0D47A1]/05 blur-[80px]" />

      <div className="w-full max-w-[480px] relative">
        <div className="bg-white rounded-3xl border border-border shadow-[0_12px_48px_rgba(13,71,161,0.10)] p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-12 h-12 rounded-[14px] bg-brand-gradient flex items-center justify-center shadow mb-4">
              <span className="text-white font-display font-black text-lg">R</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl text-foreground">
              Buat Akun
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Pilih peran untuk memulai
            </p>
          </div>

          <Tabs defaultValue="keluarga">
            {/* Role tabs */}
            <TabsList className="w-full mb-6 h-auto p-1 bg-[#F5F8FC] rounded-xl gap-1">
              {roles.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex-1 flex flex-col items-center gap-1 py-2.5 text-xs rounded-lg data-[state=active]:bg-[#0D47A1] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                >
                  <Icon size={14} />
                  <span className="leading-tight text-center">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Keluarga */}
            <TabsContent value="keluarga">
              <form className="flex flex-col gap-4">
                <CommonFields
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword((v) => !v)}
                />
                <Button
                  type="submit"
                  className="h-11 w-full bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-90 shadow-sm gap-2 mt-1"
                >
                  <UserPlus size={16} />
                  Buat Akun Keluarga
                </Button>
              </form>
            </TabsContent>

            {/* Helper */}
            <TabsContent value="helper">
              <form className="flex flex-col gap-4">
                <CommonFields
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword((v) => !v)}
                />
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Wilayah Domisili (RT/RW)
                  </Label>
                  <Input
                    placeholder="Contoh: RT 03 / RW 05"
                    className="h-11 rounded-xl border-border focus-visible:ring-[#0D47A1]/30 focus-visible:border-[#0D47A1]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Radius Layanan (km)
                  </Label>
                  <Input
                    type="number"
                    placeholder="Contoh: 3"
                    min={1}
                    max={20}
                    className="h-11 rounded-xl border-border focus-visible:ring-[#0D47A1]/30 focus-visible:border-[#0D47A1]"
                  />
                </div>
                <div className="rounded-xl border border-[#0D47A1]/20 bg-[#0D47A1]/04 p-3 flex gap-2.5">
                  <AlertCircle size={14} className="text-[#0D47A1] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#0D47A1]/80 leading-relaxed">
                    Verifikasi dilakukan Koordinator RT/RW domisilimu. Setelah disetujui, kamu dapat mulai menerima tugas.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-90 shadow-sm gap-2 mt-1"
                >
                  <UserPlus size={16} />
                  Daftar sebagai Helper
                </Button>
              </form>
            </TabsContent>

            {/* Koordinator */}
            <TabsContent value="koordinator">
              <form className="flex flex-col gap-4">
                <CommonFields
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword((v) => !v)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Wilayah RT/RW
                    </Label>
                    <Input
                      placeholder="RT 03 / RW 05"
                      className="h-11 rounded-xl border-border focus-visible:ring-[#0D47A1]/30 focus-visible:border-[#0D47A1]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Tingkat
                    </Label>
                    <select className="h-11 rounded-xl border border-border bg-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/30 focus:border-[#0D47A1] text-foreground">
                      <option value="rt">RT</option>
                      <option value="rw">RW</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Dokumen Jabatan
                  </Label>
                  <label className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl border-2 border-dashed border-border bg-[#F5F8FC] cursor-pointer hover:border-[#0D47A1]/40 hover:bg-[#0D47A1]/03 transition-colors">
                    <Shield size={18} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground text-center">
                      Upload SK / Surat Keterangan RT/RW
                    </span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" />
                  </label>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex gap-2.5">
                  <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Akun berstatus <strong>pending_verification</strong> sampai dokumen diverifikasi Admin Rangkul. Proses biasanya 1×24 jam.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-90 shadow-sm gap-2 mt-1"
                >
                  <UserPlus size={16} />
                  Ajukan Akun Koordinator
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />
          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[#0D47A1] font-bold hover:underline">
              Masuk
            </Link>
          </p>
        </div>

        <div className="text-center mt-5">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
