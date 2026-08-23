"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, AlertCircle } from "lucide-react";
import SOSDialog from "@/components/ui/SOSDialog";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

function HamburgerIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// Static fallback links for unauthenticated users
const defaultNavLinks = [
  { href: "/#layanan", label: "Layanan" },
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#peran", label: "Bergabung" },
  { href: "/help/faq", label: "FAQ" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("sb-mock-session");
    router.push("/login");
    router.refresh();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.profile-dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const role = data.user.user_metadata?.role;
        if (role === 'helper') {
          const { data: prof } = await supabase.from('helper_profiles').select('id, foto_wajah_url').eq('user_id', data.user.id).single();
          if (prof) {
            setIsVerified(true);
            if (prof.foto_wajah_url) setAvatarUrl(prof.foto_wajah_url);
          } else {
            setIsVerified(false);
          }
        } else if (role === 'koordinator') {
          const { data: prof } = await supabase.from('koordinator_profiles').select('id').eq('user_id', data.user.id).single();
          if (prof) {
            setIsVerified(true);
          } else {
            setIsVerified(false);
          }
        } else {
          setIsVerified(true);
        }
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;
    const loadUnreadNotifications = async () => {
      try {
        const response = await fetch("/api/notifications?limit=1", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json() as { unread_count?: number };
        if (isMounted) setUnreadNotificationCount(data.unread_count || 0);
      } catch {
        if (isMounted) setUnreadNotificationCount(0);
      }
    };

    void loadUnreadNotifications();
    const intervalId = window.setInterval(loadUnreadNotifications, 60000);
    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [user]);

  const role = user?.user_metadata?.role;
  const username =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Profil";

  const profileHref =
    role === "admin"
      ? "/admin/dashboard"
      : role === "helper"
      ? "/helper/dashboard"
      : role === "koordinator"
      ? "/koordinator/dashboard"
      : "/beranda";

  const editProfileHref = 
    role === "helper" ? "/helper/profil/edit" :
    role === "koordinator" ? "/koordinator/profil/edit" : 
    role === "keluarga" ? "/beranda/profil/edit" : "#";

  let currentNavLinks = defaultNavLinks;
  if (pathname === '/') {
    currentNavLinks = defaultNavLinks;
  } else if (role === 'keluarga') {
    currentNavLinks = [
      { href: "/beranda", label: "Dashboard" },
      { href: "/cari-helper", label: "Cari Helper" },
      { href: "/kunjungan", label: "Kunjungan" },
      { href: "/beranda/profil", label: "Profil Keluarga" },
      { href: "/beranda/pesan", label: "Pesan" },
    ];
  } else if (role === 'helper') {
    currentNavLinks = [
      { href: "/helper/dashboard", label: "Dashboard" },
      { href: "/helper/tugas/baru", label: "Cari Tugas" },
      { href: "/tugas", label: "Papan Tugas" },
      { href: "/helper/pesan", label: "Pesan" },
      ...(isVerified === false ? [{ href: "/helper/verifikasi", label: "Verifikasi Profil" }] : []),
    ];
  } else if (role === 'koordinator') {
    currentNavLinks = [
      { href: "/koordinator/dashboard", label: "Dashboard" },
      { href: "/koordinator/antrean", label: "Antrean Helper" },
      { href: "/koordinator/helper", label: "Helper Terverifikasi" },
      { href: "/koordinator/antrean-persetujuan", label: "Persetujuan Tugas" },
      { href: "/koordinator/pesan", label: "Pesan" },
      ...(isVerified === false ? [{ href: "/koordinator/pengajuan", label: "Data RT/RW" }] : []),
    ];
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="w-full max-w-7xl mx-auto px-4 lg:px-5 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group shrink-0">
          <img
            src="/long-logo.svg"
            alt="Rangkul"
            width={110}
            height={32}
            className="transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8 text-base font-semibold text-muted-foreground">
          {currentNavLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link href={href} className={isActive ? "text-[#0D47A1] font-bold" : "hover:text-[#0D47A1] transition-colors"}>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {role === "helper" && (
            <button 
              onClick={() => setSosOpen(true)}
              className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold transition-colors border border-red-200 shadow-sm mr-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span>SOS</span>
            </button>
          )}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/notifikasi"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-slate-50 hover:text-[#0D47A1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1] focus-visible:ring-offset-2"
                aria-label={unreadNotificationCount > 0 ? `Notifikasi, ${unreadNotificationCount} belum dibaca` : "Notifikasi"}
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white" role="status" aria-live="polite">
                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                  </span>
                )}
              </Link>
              <div className="relative profile-dropdown-container">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-transparent p-1 pl-1 pr-3 transition-colors hover:border-gray-200 hover:bg-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4`}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full border border-gray-200 bg-blue-50 object-cover"
                  />
                  <span className="text-sm font-semibold text-gray-700">@{username}</span>
                </button>

                {dropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{username}</p>
                    <p className="text-xs text-gray-500 truncate capitalize">{role}</p>
                  </div>
                  <Link 
                    href={profileHref} 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Dashboard Anda
                  </Link>
                  {role !== "admin" && (
                    <Link 
                      href={editProfileHref} 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit Profil
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="font-medium">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-brand-gradient hover:opacity-90 text-white font-semibold px-5 shadow-sm"
              >
                <Link href="/register">Daftar</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile SOS & hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {role === "helper" && (
            <button 
              onClick={() => setSosOpen(true)}
              className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-full flex items-center justify-center transition-colors border border-red-200 shadow-sm"
              aria-label="Darurat SOS"
            >
              <AlertCircle className="w-5 h-5" />
            </button>
          )}
          <button
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Buka menu navigasi"
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border px-6 py-4 flex flex-col gap-4 shadow-lg">
          {currentNavLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-base font-semibold text-foreground hover:text-[#0D47A1] py-1"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            {user ? (
              <div className="flex flex-col gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3 p-2 mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4`} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full border border-gray-200 bg-blue-50 object-cover"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-gray-900 truncate">@{username}</span>
                    <span className="text-xs text-gray-500 capitalize">{role}</span>
                  </div>
                </div>
                <Button variant="outline" asChild className="w-full justify-center bg-white shadow-sm">
                  <Link href="/notifikasi" onClick={() => setMenuOpen(false)}>
                    <Bell className="mr-2 h-4 w-4" aria-hidden="true" />
                    Notifikasi{unreadNotificationCount > 0 ? ` (${unreadNotificationCount})` : ""}
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-center bg-white shadow-sm">
                  <Link href={profileHref} onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
                {role !== "admin" && (
                  <Button variant="outline" asChild className="w-full justify-center bg-white shadow-sm gap-2">
                    <Link href={editProfileHref} onClick={() => setMenuOpen(false)}>
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit Profil
                    </Link>
                  </Button>
                )}
                <Button variant="outline" onClick={handleLogout} className="w-full justify-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-100 shadow-sm gap-2">
                  <LogOut className="w-4 h-4" />
                  Keluar
                </Button>
              </div>
            ) : (
              <>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login" onClick={() => setMenuOpen(false)}>Masuk</Link>
                </Button>
                <Button asChild className="w-full bg-brand-gradient text-white hover:opacity-90">
                  <Link href="/register" onClick={() => setMenuOpen(false)}>Daftar</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      <SOSDialog isOpen={sosOpen} onClose={() => setSosOpen(false)} userRole={role} />
    </header>
  );
}
