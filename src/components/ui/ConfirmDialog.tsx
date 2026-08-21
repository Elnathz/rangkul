"use client"

import * as React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type ConfirmDialogTone = "primary" | "danger" | "warning"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
  tone?: ConfirmDialogTone
  icon?: React.ReactNode
}

const toneStyles: Record<ConfirmDialogTone, { bar: string; icon: string; button: string }> = {
  primary: {
    bar: "bg-[#0D47A1]",
    icon: "bg-blue-100 text-[#0D47A1]",
    button: "bg-[#0D47A1] text-white hover:bg-blue-800",
  },
  danger: {
    bar: "bg-red-500",
    icon: "bg-red-100 text-red-600",
    button: "bg-red-600 text-white hover:bg-red-700",
  },
  warning: {
    bar: "bg-amber-500",
    icon: "bg-amber-100 text-amber-700",
    button: "bg-amber-600 text-white hover:bg-amber-700",
  },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  loading = false,
  tone = "primary",
  icon,
}: ConfirmDialogProps) {
  const styles = toneStyles[tone]

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !loading && onOpenChange(nextOpen)}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-3xl border-0 p-0 shadow-2xl sm:max-w-[440px]"
      >
        <div className={cn("h-1.5 w-full", styles.bar)} />
        <div className="p-6 sm:p-7">
          <DialogHeader className="gap-4 text-left">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", styles.icon)}>
              {icon ?? <AlertTriangle className="h-6 w-6" aria-hidden="true" />}
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold text-slate-950">{title}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-slate-600">
                {description}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-7 gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-xl border-slate-200 font-semibold"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={cn("rounded-xl font-bold shadow-sm", styles.button)}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {loading ? "Memproses..." : confirmLabel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
