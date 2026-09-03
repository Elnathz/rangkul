"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { NavigationIcon } from "@/components/layout/NavigationIcon";
import { ROLE_NAVIGATION, isNavigationItemActive, type AppRole, type NavigationItem } from "@/lib/navigation/role-navigation";
import { cn } from "@/lib/utils";

type OperationalRole = Extract<AppRole, "koordinator" | "admin">;

type RoleSidebarProps = {
  role: OperationalRole;
};

function groupedNavigation(role: OperationalRole) {
  return ROLE_NAVIGATION[role].reduce<Array<{ label: string; items: NavigationItem[] }>>((groups, item) => {
    const label = item.group ?? "Lainnya";
    const current = groups.at(-1);
    if (current?.label === label) {
      current.items.push(item);
      return groups;
    }
    groups.push({ label, items: [item] });
    return groups;
  }, []);
}

export function RoleSidebar({ role }: RoleSidebarProps) {
  const pathname = usePathname();
  const groups = groupedNavigation(role);
  const homeHref = role === "admin" ? "/admin/dashboard" : "/koordinator/dashboard";
  const [openGroups, setOpenGroups] = useState(() => new Set(groups.map((group) => group.label)));

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-[var(--surface-subtle)] lg:flex" aria-label={`Navigasi ${role}`}>
      <Link href={homeHref} className="flex h-16 items-center gap-2 border-b border-border px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
        <Image src="/logo.png" alt="" aria-hidden="true" width={40} height={40} className="size-9 object-contain" priority />
        <span className="font-heading text-base font-extrabold tracking-[-0.03em] text-primary">Rangkul</span>
        <span className="ml-1 border-l border-border pl-2 text-xs font-semibold capitalize text-muted-foreground">{role}</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Navigasi sisi">
        <div className="space-y-2">
          {groups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <button type="button" onClick={() => setOpenGroups((current) => { const next = new Set(current); if (next.has(group.label)) next.delete(group.label); else next.add(group.label); return next; })} aria-expanded={openGroups.has(group.label)} aria-controls={`sidebar-group-${role}-${group.label}`} className="flex min-h-11 w-full items-center justify-between rounded-md px-3 text-left text-xs font-semibold text-muted-foreground transition-colors hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"><span>{group.label}</span><ChevronDown className={cn("size-4 transition-transform duration-200", openGroups.has(group.label) && "rotate-180")} aria-hidden="true" /></button>
              {openGroups.has(group.label) ? <ul id={`sidebar-group-${role}-${group.label}`} className="space-y-1 pb-2">
                {group.items.map((item) => {
                  const active = isNavigationItemActive(pathname, item);
                  return <li key={item.href}><Link href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2", active ? "bg-primary text-primary-foreground shadow-[var(--shadow-card)]" : "text-muted-foreground hover:bg-white hover:text-foreground")}><NavigationIcon name={item.icon} className="size-5 shrink-0" /> <span className="min-w-0 truncate">{item.label}</span></Link></li>;
                })}
              </ul> : null}
            </section>
          ))}
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <Link href="/" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <NavigationIcon name="home" className="size-5" /> Kembali ke Beranda
        </Link>
      </div>
    </aside>
  );
}
