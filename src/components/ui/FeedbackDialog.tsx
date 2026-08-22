"use client"

import * as React from "react"
import { CheckCircle2, Info, XCircle } from "lucide-react"

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

type FeedbackDialogTone = "success" | "danger" | "info"

type FeedbackDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  actionLabel?: string
  tone?: FeedbackDialogTone
}

const toneStyles: Record<FeedbackDialogTone, { bar: string; icon: string; Icon: React.ElementType }> = {
  success: { bar: "bg-emerald-500", icon: "bg-emerald-100 text-emerald-600", Icon: CheckCircle2 },
  danger: { bar: "bg-red-500", icon: "bg-red-100 text-red-600", Icon: XCircle },
  info: { bar: "bg-[#0D47A1]", icon: "bg-blue-100 text-[#0D47A1]", Icon: Info },
}

export function FeedbackDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel = "Mengerti",
  tone = "info",
}: FeedbackDialogProps) {
  const styles = toneStyles[tone]
  const Icon = styles.Icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-3xl border-0 p-0 shadow-2xl sm:max-w-[440px]"
      >
        <div className={cn("h-1.5 w-full", styles.bar)} />
        <div className="p-6 sm:p-7">
          <DialogHeader className="gap-4 text-left">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", styles.icon)}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold text-slate-950">{title}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-slate-600">
                {description}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-7 sm:justify-end">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className={cn(
                "rounded-xl px-6 font-bold",
                tone === "danger" && "bg-red-600 text-white hover:bg-red-700",
                tone === "success" && "bg-emerald-600 text-white hover:bg-emerald-700",
                tone === "info" && "bg-[#0D47A1] text-white hover:bg-blue-800",
              )}
            >
              {actionLabel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
