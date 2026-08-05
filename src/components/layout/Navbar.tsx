"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <Image
            src="/logo_high.svg"
            alt="Rangkul"
            width={40}
            height={40}
            className="transition-transform group-hover:scale-105"
            priority
            unoptimized
          />
          <span className="font-display font-bold text-lg text-foreground">
            Rangkul
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <li>
            <Link href="/#layanan" className="hover:text-primary transition-colors">
              Layanan
            </Link>
          </li>
          <li>
            <Link href="/#cara-kerja" className="hover:text-primary transition-colors">
              Cara Kerja
            </Link>
          </li>
          <li>
            <Link href="/#helper" className="hover:text-primary transition-colors">
              Jadi Helper
            </Link>
          </li>
          <li>
            <Link href="/help/faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
          </li>
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="font-medium">
            <Link href="/login">Masuk</Link>
          </Button>
          <Button size="sm" asChild className="bg-brand-gradient hover:opacity-90 text-white font-semibold px-5 shadow-sm">
            <Link href="/register">Daftar Gratis</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border px-6 py-4 flex flex-col gap-4 shadow-lg">
          {["/#layanan", "/#cara-kerja", "/#helper", "/help/faq"].map(
            (href, i) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-foreground hover:text-primary py-1"
                onClick={() => setMenuOpen(false)}
              >
                {["Layanan", "Cara Kerja", "Jadi Helper", "FAQ"][i]}
              </Link>
            )
          )}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Button variant="outline" asChild className="w-full">
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild className="w-full bg-brand-gradient text-white hover:opacity-90">
              <Link href="/register">Daftar Gratis</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
