"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Clock3,
  ReceiptText,
  TriangleAlert,
  MessageSquare,
  ShieldCheck,
  Check,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType =
  | "task"
  | "payment"
  | "emergency"
  | "message"
  | "system"
  | "koordinator_info";

export type NotificationItem = {
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

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} mnt lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Kemarin";
  if (diffInDays < 7) return `${diffInDays} hari lalu`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 5) return `${diffInWeeks} minggu lalu`;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(date);
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

interface NotificationDropdownProps {
  role?: string | null;
  unreadCount: number;
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationDropdown({
  role,
  unreadCount,
  onUnreadCountChange,
}: NotificationDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<TabFilter>("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const fetchPreviewNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/notifications?limit=20", { cache: "no-store" });
      if (!response.ok) throw new Error("Gagal memuat notifikasi");
      const data = (await response.json()) as {
        notifications?: NotificationItem[];
        unread_count?: number;
      };
      setNotifications(data.notifications || []);
      if (typeof data.unread_count === "number" && onUnreadCountChange) {
        onUnreadCountChange(data.unread_count);
      }
    } catch {
      setError("Notifikasi belum dapat dimuat");
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

  const handleToggle = () => {
    if (!isOpen) {
      void fetchPreviewNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Keyboard navigation & click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setMarkingId(id);
    try {
      const response = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (response.ok) {
        setNotifications((current) =>
          current.map((item) => (item.id === id ? { ...item, is_read: true } : item))
        );
        if (onUnreadCountChange) {
          onUnreadCountChange(Math.max(0, unreadCount - 1));
        }
      }
    } catch {
      // Abaikan bila gagal jaringan sesaat
    } finally {
      setMarkingId(null);
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.is_read) {
      void handleMarkAsRead(item.id);
    }
    handleClose();
    const targetUrl = resolveNotificationTarget(item, role);
    router.push(targetUrl);
  };

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
    (item) => !item.is_read && (item.type === "task" || item.type === "emergency" || item.type === "koordinator_info")
  ).length;

  const generalCount = notifications.filter(
    (item) => !item.is_read && (item.type === "system" || item.type === "payment" || item.type === "message")
  ).length;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={unreadCount ? `Notifikasi, ${unreadCount} belum dibaca` : "Buka notifikasi"}
        className={cn(
          "relative inline-flex size-11 items-center justify-center rounded-md transition-colors",
          "text-muted-foreground hover:bg-muted hover:text-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isOpen ? "bg-muted text-primary" : ""
        )}
      >
        <Bell className="size-5" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {/* Backdrop for click-outside */}
      {isOpen ? (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-40 bg-slate-950/20 sm:bg-transparent"
          aria-hidden="true"
        />
      ) : null}

      {/* Popover Panel */}
      {isOpen ? (
        <div
          role="dialog"
          aria-label="Panel notifikasi"
          className={cn(
            "fixed inset-x-3 top-16 z-50 mx-auto max-w-sm rounded-2xl border border-border bg-card shadow-[var(--shadow-overlay)]",
            "sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:mx-0",
            "flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-border p-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
                <Bell className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Notifikasi</h3>
                <p className="text-xs text-muted-foreground">
                  {role === "helper"
                    ? "Pembaruan tugas dan info warga"
                    : role === "koordinator"
                    ? "Pengawasan wilayah dan verifikasi"
                    : role === "admin"
                    ? "Peringatan sistem dan audit"
                    : "Pembaruan pendampingan keluarga"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Tutup notifikasi"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          {/* Segmented Filter Tabs */}
          <div className="border-b border-border p-2 bg-slate-50/30">
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/80 p-1 text-xs">
              <button
                type="button"
                onClick={() => setTab("all")}
                className={cn(
                  "flex h-8 items-center justify-center gap-1 rounded-lg font-bold transition-all",
                  tab === "all"
                    ? "bg-card text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Semua</span>
                {unreadCount > 0 ? (
                  <span className="rounded-full bg-primary/15 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                    {unreadCount}
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => setTab("service")}
                className={cn(
                  "flex h-8 items-center justify-center gap-1 rounded-lg font-bold transition-all",
                  tab === "service"
                    ? "bg-card text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Layanan</span>
                {serviceCount > 0 ? (
                  <span className="rounded-full bg-primary/15 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                    {serviceCount}
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => setTab("general")}
                className={cn(
                  "flex h-8 items-center justify-center gap-1 rounded-lg font-bold transition-all",
                  tab === "general"
                    ? "bg-card text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Umum</span>
                {generalCount > 0 ? (
                  <span className="rounded-full bg-primary/15 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                    {generalCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          {/* Scrollable Notification List */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-border">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-xs font-semibold text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
                Memuat notifikasi...
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-xs text-destructive">{error}</p>
                <button
                  type="button"
                  onClick={() => void fetchPreviewNotifications()}
                  className="mt-2 text-xs font-bold text-primary underline"
                >
                  Coba lagi
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  <Bell className="size-5" aria-hidden="true" />
                </div>
                <p className="mt-2 text-xs font-bold text-foreground">Tidak ada notifikasi</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {tab === "service"
                    ? "Belum ada notifikasi terkait tugas atau layanan."
                    : tab === "general"
                    ? "Belum ada notifikasi sistem atau akun."
                    : "Semua pembaruan telah kamu ketahui."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const meta = notificationMeta[item.type] || notificationMeta.system;
                const Icon = meta.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "group relative flex cursor-pointer items-start gap-3 p-3.5 transition-colors",
                      "hover:bg-muted/50",
                      item.is_read ? "opacity-75" : "bg-primary/5"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl",
                        meta.surface,
                        meta.color
                      )}
                    >
                      <Icon className="size-4" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-[10px] font-black uppercase tracking-wider", meta.color)}>
                          {meta.label}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {formatRelativeTime(item.created_at)}
                        </span>
                      </div>

                      <h4 className="mt-0.5 text-xs font-bold text-foreground line-clamp-1">
                        {item.title}
                      </h4>

                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.body}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary group-hover:underline">
                          Buka detail <ChevronRight className="size-3" aria-hidden="true" />
                        </span>

                        {!item.is_read ? (
                          <button
                            type="button"
                            onClick={(event) => void handleMarkAsRead(item.id, event)}
                            disabled={markingId === item.id}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            aria-label="Tandai sudah dibaca"
                          >
                            {markingId === item.id ? (
                              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                            ) : (
                              <Check className="size-3" aria-hidden="true" />
                            )}
                            Tandai dibaca
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* Unread indicator dot */}
                    {!item.is_read ? (
                      <span
                        className="mt-1 size-2 shrink-0 rounded-full bg-primary"
                        aria-label="Belum dibaca"
                      />
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer - View All */}
          <div className="border-t border-border p-2.5 bg-slate-50/50">
            <Link
              href="/notifikasi"
              onClick={handleClose}
              className={cn(
                "flex h-10 w-full items-center justify-center gap-1.5 rounded-xl",
                "bg-card border border-border text-xs font-bold text-foreground",
                "hover:bg-muted hover:text-primary transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )}
            >
              <span>Lihat Semua Notifikasi</span>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
