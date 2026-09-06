"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Info, Loader2, MapPin, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ServiceCoverageManagerProps = {
  initialRadius: number;
  wilayahDomisili: string;
};

const PRESET_RADIUS = [1, 3, 5, 10, 15, 25];

export function ServiceCoverageManager({
  initialRadius,
  wilayahDomisili,
}: ServiceCoverageManagerProps) {
  const router = useRouter();
  const [currentRadius, setCurrentRadius] = useState(initialRadius || 5);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(initialRadius || 5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const openModal = () => {
    setSelectedRadius(currentRadius);
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/helper/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ radius_layanan_km: selectedRadius }),
      });

      const result = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(result?.message || "Gagal memperbarui radius jangkauan layanan.");
      }

      setCurrentRadius(selectedRadius);
      setModalOpen(false);
      setSuccessToast(`Radius layanan berhasil diubah menjadi ${selectedRadius} km.`);
      setTimeout(() => setSuccessToast(null), 4000);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const getRadiusContext = (km: number) => {
    if (km <= 2) return "Lingkungan RT/RW setempat (Sangat cocok jalan kaki / sepeda).";
    if (km <= 5) return "Satu Kelurahan atau Kecamatan sekitar (Akses cepat berkendara 10-15 menit).";
    if (km <= 12) return "Wilayah Kota/Kabupaten terdekat (Akses berkendara 20-30 menit).";
    return "Jangkauan maksimal regional lintas wilayah (Pastikan kesiapan transportasi Anda).";
  };

  return (
    <>
      <div className="mt-4 rounded-xl border border-border/60 bg-[var(--surface-subtle)] p-3.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Radius Layanan
          </p>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            Aktif
          </span>
        </div>
        <p className="mt-1 font-heading text-xl font-bold tabular-nums text-foreground">
          {currentRadius} km
        </p>
        <p className="text-xs text-muted-foreground">Titik domisili: {wilayahDomisili}</p>
      </div>

      {successToast ? (
        <div
          role="status"
          className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800 animate-in fade-in"
        >
          <Check className="size-4 shrink-0 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      ) : null}

      <div className="mt-4 border-t border-border/70 pt-3.5">
        <button
          type="button"
          onClick={openModal}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Atur jangkauan
        </button>
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => (open ? openModal() : closeModal())}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground">
              Atur Jangkauan Layanan
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Tentukan jarak radius maksimal pencarian tugas pendampingan lansia dari titik domisili Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Lokasi Domisili */}
            <div className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-muted/40 p-3 text-xs text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-foreground block">Pusat Domisili Anda:</span>
                <span className="line-clamp-2">{wilayahDomisili}</span>
              </div>
            </div>

            {/* Slider dan Tampilan Angka */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Radius Jangkauan
              </span>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="font-heading text-4xl font-extrabold text-primary tabular-nums">
                  {selectedRadius}
                </span>
                <span className="font-heading text-lg font-bold text-primary">KM</span>
              </div>
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                {getRadiusContext(selectedRadius)}
              </p>
            </div>

            {/* Input Range Slider */}
            <div className="space-y-1.5 px-1">
              <input
                id="radius-slider"
                type="range"
                min={1}
                max={25}
                step={1}
                value={selectedRadius}
                onChange={(e) => setSelectedRadius(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Geser radius jangkauan dalam kilometer"
              />
              <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                <span>1 km (RT/RW)</span>
                <span>12 km</span>
                <span>25 km (Maksimal)</span>
              </div>
            </div>

            {/* Presets Cepat */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">Pilih Cepat:</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_RADIUS.map((km) => {
                  const isSelected = selectedRadius === km;
                  return (
                    <button
                      key={km}
                      type="button"
                      onClick={() => setSelectedRadius(km)}
                      className={`min-h-9 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border border-border/80 bg-background text-foreground hover:bg-muted/60"
                      }`}
                    >
                      {km} km
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info Catatan */}
            <div className="flex items-start gap-2 rounded-lg bg-blue-50/60 p-2.5 text-xs text-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
              <Info className="size-4 shrink-0 text-blue-600 mt-0.5 dark:text-blue-400" />
              <p className="leading-relaxed">
                Hanya tugas dalam radius ini yang akan ditampilkan pada radar Cari Tugas. Perubahan ini berlaku instan tanpa verifikasi ulang Koordinator.
              </p>
            </div>

            {error ? (
              <p role="alert" className="text-xs font-semibold text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={saving}
              className="min-h-11 w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="min-h-11 w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
