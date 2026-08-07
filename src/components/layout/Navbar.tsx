"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
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

const navLinks = [
  { href: "/#layanan", label: "Layanan" },
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#peran", label: "Bergabung" },
  { href: "/help/faq", label: "FAQ" },
];

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

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

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group shrink-0">
          <Image
            src="/long-logo.svg"
            alt="Rangkul"
            width={110}
            height={32}
            className="transition-transform group-hover:scale-[1.02]"
            priority
            unoptimized
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="hover:text-primary transition-colors">
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative profile-dropdown-container">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="flex items-center gap-2 hover:bg-gray-100 p-1 pl-1 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4`} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-gray-200 object-cover bg-blue-50"
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
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </div>
              )}
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

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Buka menu navigasi"
        >
          <HamburgerIcon open={menuOpen} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border px-6 py-4 flex flex-col gap-4 shadow-lg">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-foreground hover:text-primary py-1"
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
                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4`} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full border border-gray-200 bg-blue-50"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-gray-900 truncate">@{username}</span>
                    <span className="text-xs text-gray-500 capitalize">{role}</span>
                  </div>
                </div>
                <Button variant="outline" asChild className="w-full justify-center bg-white shadow-sm">
                  <Link href={profileHref} onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
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
    </header>
  );
}
