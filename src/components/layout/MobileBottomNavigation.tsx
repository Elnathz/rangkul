"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";

import { NavigationIcon } from "@/components/layout/NavigationIcon";
import { isNavigationItemActive, type AppRole, type NavigationItem } from "@/lib/navigation/role-navigation";
import { cn } from "@/lib/utils";

type MobileBottomNavigationProps = {
  role: Extract<AppRole, "keluarga" | "helper" | "koordinator" | "admin">;
  items: readonly NavigationItem[];
  badges: Record<string, number>;
};

const liquidTransition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };
const instantTransition = { duration: 0 };

export function MobileBottomNavigation({ role, items, badges }: MobileBottomNavigationProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const mobileItems = role === "keluarga"
    ? [...items].sort((left, right) => {
      const order = ["/beranda", "/kunjungan", "/booking/new", "/lansia", "/beranda/pesan"];
      return order.indexOf(left.href) - order.indexOf(right.href);
    })
    : role === "koordinator"
    ? [...items].sort((left, right) => {
      const order = ["/koordinator/dashboard", "/koordinator/lansia", "/koordinator/antrean", "/koordinator/persetujuan", "/koordinator/helper"];
      return order.indexOf(left.href) - order.indexOf(right.href);
    })
    : role === "admin"
    ? [...items].sort((left, right) => {
      const order = ["/admin/dashboard", "/admin/users", "/admin/lansia", "/admin/helpers", "/admin/reports"];
      return order.indexOf(left.href) - order.indexOf(right.href);
    })
    : items;

  return (
    <nav
      aria-label={`Navigasi utama ${role}`}
      className="fixed inset-x-3 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-50 rounded-[1.4rem] border border-white/70 bg-card/80 p-1 shadow-[0_12px_32px_rgba(13,71,161,0.18)] backdrop-blur-xl md:hidden"
    >
      <LayoutGroup id="bottom-navigation">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {mobileItems.slice(0, 5).map((item) => {
            const active = isNavigationItemActive(pathname, item);
            const badgeCount = Math.max(badges[item.href] ?? 0, ...(item.aliases ?? []).map((alias) => badges[alias] ?? 0));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-11 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-[1rem] px-1 py-1.5 text-[11px] font-semibold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    active ? "text-primary-foreground" : "text-muted-foreground hover:bg-card hover:text-foreground",
                  )}
                >
                  {active ? <motion.span layoutId="bottom-navigation-active" aria-hidden="true" className="absolute inset-0 rounded-[1rem] border border-white/40 bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" transition={prefersReducedMotion ? instantTransition : liquidTransition} /> : null}
                  <span className="relative z-10">
                    <NavigationIcon name={item.icon} className="h-5 w-5" />
                    {badgeCount > 0 ? (
                      <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white" aria-label={`${badgeCount > 99 ? "99+" : badgeCount} pembaruan`}>
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    ) : null}
                  </span>
                  <span className="relative z-10 max-w-full truncate">{item.mobileLabel ?? item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </LayoutGroup>
    </nav>
  );
}
