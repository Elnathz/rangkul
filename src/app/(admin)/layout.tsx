"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
const navItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Pengguna",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/admin/helpers",
    label: "Helper",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    href: "/admin/helpers/fallback",
    label: "Fallback verifikasi",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/admin/koordinator/pengajuan",
    label: "Pengajuan Koordinator",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    href: "/admin/banding",
    label: "Banding",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: "/admin/categories",
    label: "Kategori",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    href: "/admin/reports",
    label: "Laporan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    href: "/admin/audit-logs",
    label: "Audit Log",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    href: "/admin/pesan",
    label: "Pesan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("sb-mock-session");
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-[#F5F8FC]">
      <div className="md:hidden">
        <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-white px-4 shadow-sm">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5"><Image src="/logo.svg" alt="Rangkul Admin" width={30} height={30} /><span className="font-display text-sm font-bold text-foreground">Rangkul Admin</span></Link>
          <button type="button" onClick={() => setMobileOpen((open) => !open)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}>{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
        {mobileOpen ? <><button type="button" className="fixed inset-0 z-40 bg-slate-950/20" onClick={() => setMobileOpen(false)} aria-label="Tutup navigasi" /><aside className="fixed inset-y-0 left-0 z-50 flex w-[min(19rem,86vw)] flex-col border-r border-border bg-white pt-16 shadow-xl"><nav className="flex-1 gap-1 overflow-y-auto p-3">{navItems.map(({ href, label, icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${pathname === href ? "bg-blue-50 text-[#0D47A1]" : "text-muted-foreground hover:bg-[#F5F8FC] hover:text-foreground"}`}><span className="shrink-0 text-[#0D47A1]">{icon}</span>{label}</Link>)}</nav><div className="border-t border-border p-3"><Link href="/" onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground">Kembali ke Beranda</Link></div></aside></> : null}
      </div>
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-white md:flex">
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
            <Image 
              src="/logo.svg" 
              alt="Rangkul Admin" 
              width={32} 
              height={32} 
              className="w-8 h-8 transition-transform group-hover:scale-105" 
            />
            <span className="font-display font-bold text-sm text-foreground">
              Rangkul Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
                  isActive 
                    ? "bg-blue-50 text-[#0D47A1]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-[#F5F8FC]"
                }`}
              >
                <span className={`shrink-0 transition-colors ${isActive ? "text-[#0D47A1]" : "group-hover:text-[#0D47A1]"}`}>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-4 pt-0 sm:px-8 md:pt-0">
          <div className="w-10 md:hidden" aria-hidden="true" />
          <h1 className="font-display font-semibold text-base text-foreground">
            Panel Admin
          </h1>
          <div className="flex items-center gap-3 relative">
            <span className="text-xs text-muted-foreground mr-1">Admin Rangkul</span>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-gradient"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4 h-4">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">Admin System</p>
                  <p className="text-xs text-gray-500 truncate">Platform Administrator</p>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center w-full gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 text-left transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 pb-6 pt-20 sm:px-6 sm:pt-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
