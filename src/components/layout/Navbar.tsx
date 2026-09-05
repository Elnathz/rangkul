"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, LogOut, Menu, Pencil, ShieldAlert, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import { NavigationIcon } from "@/components/layout/NavigationIcon";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import SOSDialog from "@/components/ui/SOSDialog";
import { Button } from "@/components/ui/button";
import { ROLE_NAVIGATION, isNavigationItemActive, type AppRole, type NavigationItem } from "@/lib/navigation/role-navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const publicNavigation: readonly NavigationItem[] = [
  { href: "/#apa-itu-rangkul", label: "Tentang", icon: "home" },
  { href: "/#cara-kerja", label: "Cara Kerja", icon: "clipboard" },
  { href: "/#layanan", label: "Layanan", icon: "calendar" },
  { href: "/#riwayat-rangkul", label: "Riwayat", icon: "file" },
  { href: "/#peran", label: "Peran", icon: "users" },
];

const liquidTransition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };
const instantTransition = { duration: 0 };

function isAppRole(value: unknown): value is AppRole {
  return value === "keluarga" || value === "helper" || value === "koordinator" || value === "admin";
}

function profileHref(role: AppRole | null) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "helper") return "/helper/dashboard";
  if (role === "koordinator") return "/koordinator/dashboard";
  return "/beranda";
}

function editProfileHref(role: AppRole | null) {
  if (role === "helper") return "/helper/profil/edit";
  if (role === "koordinator") return "/koordinator/profil/edit";
  if (role === "keluarga") return "/beranda/profil/edit";
  return null;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "R";
}

function roleLabel(role: AppRole | null) {
  if (!role) return null;
  return role[0].toUpperCase() + role.slice(1);
}

export default function Navbar() {
  const pathname = usePathname();
  const isPublicSurface = pathname === "/";
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [badges, setBadges] = useState<Record<string, number>>({});
  const [publicActive, setPublicActive] = useState<string | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const role = isAppRole(user?.user_metadata?.role) ? user.user_metadata.role : null;
  const username = String(user?.user_metadata?.full_name ?? user?.user_metadata?.username ?? user?.email?.split("@")[0] ?? "Profil");
  const navigation = isPublicSurface ? publicNavigation : role ? ROLE_NAVIGATION[role] : publicNavigation;
  const profileEditHref = editProfileHref(role);
  const isConsumerRole = role === "keluarga" || role === "helper";
  const showInlineNavigation = isPublicSurface || isConsumerRole;
  const showMobileDrawerTrigger = !isConsumerRole;
  const currentPageLabel = navigation.find((item) => isNavigationItemActive(pathname, item))?.label ?? roleLabel(role);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    let active = true;
    const loadNotifications = async () => {
      try {
        const response = await fetch("/api/notifications?limit=1", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json() as { unread_count?: number; badges?: Record<string, number> };
        if (active) {
          setUnreadCount(payload.unread_count ?? 0);
          setBadges(payload.badges ?? {});
        }
      } catch {
        if (active) setBadges({});
      }
    };

    void loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 60_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [user]);

  useEffect(() => {
    if (!isPublicSurface) return;
    const sectionIds = publicNavigation.map((item) => item.href.replace("/#", ""));
    const updateFromHash = () => setPublicActive(window.location.hash || null);
    updateFromHash();
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setPublicActive(`#${visible.target.id}`);
    }, { rootMargin: "-35% 0px -55% 0px", threshold: [0.1, 0.35] });
    sectionIds.map((id) => document.getElementById(id)).filter((element): element is HTMLElement => Boolean(element)).forEach((element) => observer.observe(element));
    window.addEventListener("hashchange", updateFromHash);
    return () => { observer.disconnect(); window.removeEventListener("hashchange", updateFromHash); };
  }, [isPublicSurface]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const menuTrigger = menuTriggerRef.current;
    const focusableElements = () => Array.from(drawerRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])") ?? []).filter((element) => !element.hasAttribute("disabled"));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = focusableElements();
      const first = focusable.at(0);
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => focusableElements().at(0)?.focus(), 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      menuTrigger?.focus();
    };
  }, [menuOpen]);

  const getBadgeCount = (item: NavigationItem) => Math.max(
    badges[item.href] ?? 0,
    ...(item.aliases ?? []).map((alias) => badges[alias] ?? 0),
  );

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("sb-mock-session");
    setProfileOpen(false);
    setMenuOpen(false);
    router.push("/login");
    router.refresh();
  };

  const drawerItems = useMemo(() => navigation, [navigation]);

  return (
    <>
      <header className={cn("fixed inset-x-0 top-0 z-50", isPublicSurface ? "border-b border-[#DDE9F5] bg-white/80 backdrop-blur-xl" : "border-b border-border bg-card/95 shadow-[0_1px_0_rgba(13,71,161,0.04)]", role === "koordinator" || role === "admin" ? "lg:left-64" : "")}>
        <nav className={cn("flex h-[var(--header-height)] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8", showInlineNavigation ? "mx-auto max-w-7xl" : "")} aria-label={isPublicSurface ? "Navigasi landing" : "Navigasi workspace"}>
          {showInlineNavigation ? <Link href={isPublicSurface ? "/" : profileHref(role)} className="flex min-h-11 shrink-0 items-center gap-2 rounded-md pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <Image src="/logo.png" alt="" aria-hidden="true" width={44} height={44} className="size-10 object-contain sm:size-11" priority />
            <span className="font-heading text-lg font-extrabold tracking-[-0.03em] text-primary sm:text-xl">Rangkul</span>
            {!isPublicSurface && role ? <span className="hidden rounded-full border border-primary/15 bg-primary/5 px-2 py-1 text-[11px] font-bold text-primary sm:inline-flex">{roleLabel(role)} Workspace</span> : null}
          </Link> : <div className="min-w-0"><p className="truncate font-heading text-base font-bold tracking-[-0.02em] text-foreground">{currentPageLabel}</p><p className="hidden text-xs font-medium text-muted-foreground sm:block">{roleLabel(role)} Rangkul</p></div>}

          {showInlineNavigation ? <LayoutGroup id="desktop-navigation"><ul className="hidden min-w-0 items-center gap-1 lg:flex">{navigation.map((item) => {
            const active = isPublicSurface ? publicActive === item.href.replace("/", "") : isNavigationItemActive(pathname, item);
            const badgeCount = getBadgeCount(item);
            return <li key={item.href}><Link href={item.href} aria-current={active ? "page" : undefined} className={cn("relative inline-flex min-h-11 items-center overflow-hidden rounded-md px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2", active ? "text-primary" : isPublicSurface ? "text-[#4E5F75] hover:text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              {active ? <motion.span layoutId="desktop-active-navigation" aria-hidden="true" className="absolute inset-0 rounded-md bg-primary/10" transition={prefersReducedMotion ? instantTransition : liquidTransition} /> : null}
              <span className="relative z-10">{item.label}</span>
              {badgeCount > 0 ? <span className="relative z-10 ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">{badgeCount > 99 ? "99+" : badgeCount}</span> : null}
            </Link></li>;
          })}</ul></LayoutGroup> : <p className="hidden text-sm font-medium text-muted-foreground lg:block">Pilih grup di sidebar untuk membuka menu.</p>}

          <div className="flex shrink-0 items-center gap-1.5">
            {role === "helper" ? <button type="button" onClick={() => setSosOpen(true)} className="hidden min-h-11 items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:inline-flex"><ShieldAlert className="size-4" aria-hidden="true" />SOS</button> : null}
            {user ? <>
              <NotificationDropdown
                role={role}
                unreadCount={unreadCount}
                onUnreadCountChange={setUnreadCount}
              />
              <div className="relative hidden sm:block">
                <button type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-controls="profile-menu" className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials(username)}</span><span className="max-w-28 truncate">{username}</span><ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
                </button>
                {profileOpen ? <div id="profile-menu" className="absolute right-0 top-full mt-2 w-56 rounded-md border border-border bg-card p-1.5 shadow-[var(--shadow-overlay)]"><p className="px-3 py-2 text-sm font-semibold text-foreground">{username}</p><p className="px-3 pb-2 text-xs capitalize text-muted-foreground">{role}</p><Link href={profileHref(role)} onClick={() => setProfileOpen(false)} className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-foreground hover:bg-muted">Beranda</Link>{profileEditHref ? <Link href={profileEditHref} onClick={() => setProfileOpen(false)} className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-foreground hover:bg-muted"><Pencil className="size-4" aria-hidden="true" />Edit profil</Link> : null}<button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-semibold text-destructive hover:bg-red-50"><LogOut className="size-4" aria-hidden="true" />Keluar</button></div> : null}
              </div>
            </> : <div className="hidden items-center gap-2 sm:flex"><Button variant="ghost" asChild className="min-h-11"><Link href="/login">Masuk</Link></Button><Button asChild className="min-h-11 bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90"><Link href="/register">Daftar</Link></Button></div>}
            {showMobileDrawerTrigger ? <button ref={menuTriggerRef} type="button" onClick={() => setMenuOpen(true)} className="inline-flex size-11 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:hidden" aria-label="Buka menu"><Menu className="size-5" aria-hidden="true" /></button> : null}
          </div>
        </nav>
      </header>

      {menuOpen ? <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu navigasi"><button type="button" className="absolute inset-0 bg-slate-950/35" onClick={() => setMenuOpen(false)} aria-label="Tutup menu" /><aside ref={drawerRef} className="relative flex h-full w-[min(21rem,88vw)] flex-col bg-card shadow-[var(--shadow-overlay)]"><div className="flex h-[var(--header-height)] items-center justify-between border-b border-border px-4"><span className="font-heading text-base font-bold text-foreground">Menu {roleLabel(role) ?? "Rangkul"}</span><button type="button" onClick={() => setMenuOpen(false)} className="inline-flex size-11 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Tutup menu"><X className="size-5" aria-hidden="true" /></button></div><nav className="flex-1 overflow-y-auto p-3" aria-label="Menu perangkat kecil"><ul className="space-y-1">{drawerItems.map((item) => { const active = isPublicSurface ? publicActive === item.href.replace("/", "") : isNavigationItemActive(pathname, item); return <li key={item.href}><Link href={item.href} aria-current={active ? "page" : undefined} onClick={() => setMenuOpen(false)} className={cn("flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><NavigationIcon name={item.icon} className="size-5" />{item.label}</Link></li>; })}</ul></nav><div className="border-t border-border p-3">{user ? <button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-sm font-semibold text-destructive hover:bg-red-50"><LogOut className="size-4" aria-hidden="true" />Keluar</button> : <div className="grid gap-2"><Button variant="outline" asChild className="min-h-11"><Link href="/login" onClick={() => setMenuOpen(false)}>Masuk</Link></Button><Button asChild className="min-h-11"><Link href="/register" onClick={() => setMenuOpen(false)}>Daftar</Link></Button></div>}</div></aside></div> : null}
      {role === "keluarga" || role === "helper" ? <MobileBottomNavigation role={role} items={ROLE_NAVIGATION[role]} badges={badges} /> : null}
      <SOSDialog isOpen={sosOpen} onClose={() => setSosOpen(false)} userRole={role} />
    </>
  );
}
