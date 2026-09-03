import { WalletCards } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const formatRupiah = (amount: number) => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
}).format(amount);

const paymentStatusLabel: Record<string, string> = {
  pending: "Menunggu pembayaran",
  held_escrow: "Dana ditahan",
  released: "Dana tersedia",
  refunded: "Dana dikembalikan",
  disputed: "Dalam sengketa",
  dibatalkan_kompensasi: "Pembatalan dengan kompensasi",
};

export default async function PenghasilanHelperPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("helper_profiles")
    .select("id, saldo_tersedia")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/helper/verifikasi");

  const { data: payments, error } = await supabase
    .from("payments")
    .select("id, helper_share, status, released_at, created_at, tasks!inner(id, helper_id, service_categories(nama))")
    .eq("tasks.helper_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8">
      <header className="border-b border-border pb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Penghasilan</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Saldo dan pembayaran dari kunjungan yang ditugaskan kepada Anda.</p>
      </header>

      <section className="mt-6 rounded-2xl bg-primary p-5 text-primary-foreground shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-primary-foreground/80">Saldo tersedia</p><p className="mt-2 font-heading text-3xl font-bold tabular-nums">{formatRupiah(Number(profile.saldo_tersedia))}</p><p className="mt-2 text-sm leading-6 text-primary-foreground/80">Saldo bertambah setelah pembayaran kunjungan berstatus released.</p></div><WalletCards className="size-6 shrink-0 text-primary-foreground/80" aria-hidden="true" /></div>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-4 sm:px-6"><h2 className="font-heading text-lg font-bold text-foreground">Riwayat pembayaran</h2><p className="mt-1 text-sm text-muted-foreground">Bagian Helper yang tercatat untuk tiap kunjungan.</p></div>
        {error ? <div role="alert" className="px-4 py-8 text-sm text-destructive sm:px-6">Riwayat belum dapat dimuat. Coba muat ulang halaman.</div> : (payments ?? []).length === 0 ? <div className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-6">Belum ada pembayaran yang dapat ditampilkan.</div> : <div className="divide-y divide-border">{(payments ?? []).map((payment) => {
          const task = Array.isArray(payment.tasks) ? payment.tasks[0] : payment.tasks;
          const category = task?.service_categories;
          const categoryName = Array.isArray(category) ? category[0]?.nama : category?.nama;
          return <div key={payment.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{categoryName || "Kunjungan Rangkul"}</p><p className="mt-1 text-xs text-muted-foreground">{paymentStatusLabel[payment.status] ?? payment.status}</p></div><div className="sm:text-right"><p className="text-sm font-bold tabular-nums text-foreground">{formatRupiah(Number(payment.helper_share))}</p><p className="mt-1 text-xs text-muted-foreground">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(payment.released_at ?? payment.created_at))}</p></div></div>;
        })}</div>}
      </section>
    </main>
  );
}
