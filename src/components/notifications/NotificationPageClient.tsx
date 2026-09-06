"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  Clock3,
  Loader2,
  MessageSquare,
  ReceiptText,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type NotificationType = "task" | "payment" | "emergency" | "message" | "system" | "koordinator_info";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
};

type TabFilter = "all" | "service" | "general";

const notificationMeta: Record<
  NotificationType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; surface: string }
> = {
  task: { label: "Tugas", icon: Clock3, color: "text-blue-700", surface: "bg-blue-50" },
  payment: { label: "Pembayaran", icon: ReceiptText, color: "text-emerald-700", surface: "bg-emerald-50" },
  emergency: { label: "Darurat", icon: TriangleAlert, color: "text-red-700", surface: "bg-red-50" },
  message: { label: "Pesan", icon: MessageSquare, color: "text-violet-700", surface: "bg-violet-50" },
  system: { label: "Sistem", icon: Bell, color: "text-slate-700", surface: "bg-slate-100" },
  koordinator_info: { label: "Koordinator", icon: ShieldCheck, color: "text-amber-700", surface: "bg-amber-50" },
};

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function resolveNotificationTarget(item: NotificationItem, role?: string | null): string {
  if (item.type === "task") {
    if (role === "helper") return "/helper/tugas";
    if (role === "keluarga") return "/kunjungan";
    if (role === "koordinator") return "/koordinator/persetujuan";
    if (role === "admin") return "/admin/dashboard";
  }
  if (item.type === "payment") {
    if (role === "helper") return "/helper/penghasilan";
    if (role === "keluarga") return "/saldo";
    if (role === "koordinator") return "/koordinator/komisi";
    if (role === "admin") return "/admin/demo-wallet";
  }
  if (item.type === "emergency") {
    if (role === "koordinator") return "/koordinator/darurat";
  }
  if (item.type === "koordinator_info") {
    if (role === "helper") return "/helper/verifikasi";
  }
  if (item.type === "message") {
    if (role === "helper") return "/helper/pesan";
    if (role === "keluarga") return "/beranda/pesan";
    if (role === "koordinator") return "/koordinator/pesan";
    if (role === "admin") return "/admin/pesan";
  }
  return "/notifikasi";
}

function getRoleActionLink(role?: string | null): { label: string; href: string } | null {
  if (role === "helper") return { label: "Buka papan tugas", href: "/helper/tugas" };
  if (role === "keluarga") return { label: "Buka daftar kunjungan", href: "/kunjungan" };
  if (role === "koordinator") return { label: "Buka persetujuan tugas", href: "/koordinator/persetujuan" };
  if (role === "admin") return { label: "Buka panel admin", href: "/admin/dashboard" };
  return null;
}

export default function NotificationPageClient() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<TabFilter>("all");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [markingId, setMarkingId] = React.useState<string | null>(null);

  const loadNotifications = React.useCallback(async () => {
    setError(null);
    try {
      const response = await fetch("/api/notifications?limit=100", { cache: "no-store" });
      const data = (await response.json()) as {
        notifications?: NotificationItem[];
        unread_count?: number;
        role?: string | null;
        message?: string;
      };
      if (!response.ok) throw new Error(data.message || "Notifikasi belum dapat dimuat.");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
      if (data.role) setUserRole(data.role);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : "Notifikasi belum dapat dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel: any = null;

    const initDataAndRealtime = async () => {
      await loadNotifications();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        if (!userRole) {
          const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
          if (userRow?.role) setUserRole(userRow.role);
        }

        channel = supabase
          .channel(`user-notifications-${Math.random().toString(36).substring(7)}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              void loadNotifications();
            }
          )
          .subscribe();
      }
    };

    void initDataAndRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadNotifications, userRole]);

  async function markAsRead(id: string, event?: React.MouseEvent) {
    if (event) event.stopPropagation();
    setMarkingId(id);
    try {
      const response = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message || "Notifikasi belum dapat ditandai.");
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Notifikasi belum dapat ditandai.");
    } finally {
      setMarkingId(null);
    }
  }

  function handleNotificationClick(item: NotificationItem) {
    if (!item.is_read) {
      void markAsRead(item.id);
    }
    const target = resolveNotificationTarget(item, userRole);
    if (target && target !== "/notifikasi") {
      router.push(target);
    }
  }

  const filteredNotifications = notifications.filter((item) => {
    if (tab === "service") {
      return item.type === "task" || item.type === "emergency" || item.type === "koordinator_info";
    }
    if (tab === "general") {
      return item.type === "system" || item.type === "payment" || item.type === "message";
    }
    return true;
  });

  const serviceCount = notifications.filter(
    (item) => item.type === "task" || item.type === "emergency" || item.type === "koordinator_info"
  ).length;

  const generalCount = notifications.filter(
    (item) => item.type === "system" || item.type === "payment" || item.type === "message"
  ).length;

  const roleAction = getRoleActionLink(userRole);

  return (
    <main className="min-h-screen bg-[#F5F8FC] px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Banner Header */}
        <section className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-lg shadow-blue-900/10 sm:p-8">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-50">
                <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                Pusat Notifikasi
              </span>
              <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">Tetap tahu apa yang perlu dilakukan</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100 sm:text-base">
                Pembaruan tugas, konfirmasi layanan, dan pengumuman akun penting akan muncul di sini.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-semibold text-blue-100">Belum dibaca</p>
              <p className="mt-1 text-2xl font-black" aria-live="polite">
                {unreadCount}
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-bold">Notifikasi belum siap</p>
              <p className="mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                void loadNotifications();
              }}
              className="shrink-0 rounded-lg px-3 py-2 font-bold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Content Card */}
        <section
          className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"
          aria-labelledby="notification-list-title"
        >
          {/* Header Action Row */}
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="notification-list-title" className="text-lg font-bold text-slate-950">
                Daftar Notifikasi
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pilih tab untuk menyaring jenis notifikasi atau klik item untuk menuju halaman terkait.
              </p>
            </div>
            {roleAction ? (
              <Link
                href={roleAction.href}
                className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-[#0D47A1] hover:underline"
              >
                {roleAction.label} <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>

          {/* Segmented Filter Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab("all")}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
                tab === "all"
                  ? "bg-[#0D47A1] text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              <span>Semua Notifikasi</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  tab === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {notifications.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTab("service")}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
                tab === "service"
                  ? "bg-[#0D47A1] text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              <span>Layanan & Tugas</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  tab === "service" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {serviceCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTab("general")}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
                tab === "general"
                  ? "bg-[#0D47A1] text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              <span>Umum & Sistem</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  tab === "general" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {generalCount}
              </span>
            </button>
          </div>

          {/* Notification Items */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm font-semibold text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-[#0D47A1]" aria-hidden="true" /> Memuat notifikasi...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0D47A1]">
                <Bell className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-bold text-blue-950">
                {tab === "service"
                  ? "Belum ada notifikasi layanan"
                  : tab === "general"
                  ? "Belum ada notifikasi umum"
                  : "Belum ada notifikasi"}
              </h3>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-blue-900">
                {tab === "service"
                  ? "Pemberitahuan pemesanan dan jadwal kunjungan baru akan muncul di sini."
                  : tab === "general"
                  ? "Pemberitahuan sistem, pembayaran, dan pesan baru akan muncul di sini."
                  : "Saat keluarga membuat booking atau ada pembaruan tugas, informasinya akan tampil di sini."}
              </p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {filteredNotifications.map((notification) => {
                const meta = notificationMeta[notification.type] || notificationMeta.system;
                const Icon = meta.icon;
                return (
                  <article
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "group flex cursor-pointer gap-4 rounded-2xl p-4 transition-all hover:bg-slate-50",
                      notification.is_read ? "opacity-80" : "bg-blue-50/40"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                        meta.surface,
                        meta.color
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <span className={cn("text-[10px] font-black uppercase tracking-wider", meta.color)}>
                            {meta.label}
                          </span>
                          <h3 className="mt-0.5 text-base font-bold text-slate-950 group-hover:text-[#0D47A1] transition-colors">
                            {notification.title}
                          </h3>
                        </div>
                        {!notification.is_read ? (
                          <span
                            className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#0D47A1]"
                            title="Belum dibaca"
                            aria-label="Belum dibaca"
                          />
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{notification.body}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <time dateTime={notification.created_at} className="text-xs font-medium text-slate-400">
                          {formatNotificationDate(notification.created_at)}
                        </time>
                        <div className="flex items-center gap-2">
                          {!notification.is_read ? (
                            <button
                              type="button"
                              onClick={(event) => void markAsRead(notification.id, event)}
                              disabled={markingId === notification.id}
                              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-white hover:text-[#0D47A1] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1] focus-visible:ring-offset-2"
                            >
                              {markingId === notification.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                              ) : (
                                <Check className="h-4 w-4" aria-hidden="true" />
                              )}
                              Tandai sudah dibaca
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                              <CheckCheck className="h-4 w-4" aria-hidden="true" /> Sudah dibaca
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0D47A1] group-hover:underline">
                            Buka detail <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
