"use client";

import type { PointerEvent } from "react";
import { useMemo } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { BookHeart, CheckCircle2, HeartPulse, Sparkles } from "lucide-react";

const previewIndicators = [
  { label: "Energi", value: "Stabil" },
  { label: "Mood", value: "Tenang" },
  { label: "Mobilitas", value: "Tercatat" },
];

export default function HeroProductStack() {
  const shouldReduceMotion = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springOptions = useMemo(() => ({ damping: 22, stiffness: 170, mass: 0.6 }), []);
  const springRotateX = useSpring(rotateX, springOptions);
  const springRotateY = useSpring(rotateY, springOptions);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (shouldReduceMotion || event.pointerType !== "mouse") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    rotateX.set(y * -7);
    rotateY.set(x * 8);
  }

  function resetTilt() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      className="relative mx-auto w-full max-w-[31rem] select-none [perspective:1100px]"
      onPointerLeave={resetTilt}
      onPointerMove={handlePointerMove}
    >
      <div className="pointer-events-none absolute inset-x-10 bottom-2 h-16 rounded-full bg-[#0D47A1]/20 blur-3xl" aria-hidden="true" />

      <motion.div
        className="relative min-h-[29rem] [transform-style:preserve-3d] sm:min-h-[31rem]"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={shouldReduceMotion ? undefined : { rotateX: springRotateX, rotateY: springRotateY }}
      >
        <motion.div
          className="absolute right-0 top-4 w-[76%] rounded-[22px] border border-[#BFD9F1] bg-[#EAF4FF] p-4 shadow-[0_18px_40px_rgba(13,71,161,0.14)] [transform:translateZ(-32px)_rotate(6deg)] sm:p-5"
          initial={shouldReduceMotion ? false : { opacity: 0, x: 18, y: -8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.16, duration: 0.55, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#0D47A1]">
            <BookHeart className="size-4" aria-hidden="true" />
            Memory Capsule
          </div>
          <p className="mt-3 font-heading text-base font-bold text-[#16233A]">Cerita yang tetap dekat</p>
          <p className="mt-2 text-sm leading-6 text-[#4E5F75]">Waktu mengobrol dan aktivitas ringan disimpan sebagai cerita untuk keluarga.</p>
        </motion.div>

        <motion.div
          className="absolute bottom-3 left-1 z-20 flex items-center gap-3 rounded-2xl border border-[#C9E8D6] bg-white/95 px-4 py-3 shadow-[0_14px_32px_rgba(22,35,58,0.14)] backdrop-blur"
          initial={shouldReduceMotion ? false : { opacity: 0, x: -18, y: 14 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-[#ECF8F0] text-[#168A4A]">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-[#4E5F75]">Status kunjungan</p>
            <p className="text-sm font-bold text-[#16233A]">Catatan siap dibaca</p>
          </div>
        </motion.div>

        <motion.article
          className="absolute left-0 top-16 z-10 w-[88%] rounded-[24px] border border-[#D7E5F3] bg-white p-5 shadow-[0_22px_56px_rgba(13,71,161,0.18)] [transform:translateZ(34px)] sm:p-6"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.62, ease: "easeOut" }}
          aria-label="Contoh tampilan snapshot kunjungan dan Riwayat Rangkul"
        >
          <div className="flex items-start justify-between gap-3 border-b border-[#DCE6F1] pb-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-[#0D47A1]">CONTOH TAMPILAN</p>
              <h2 className="mt-2 font-heading text-xl font-bold text-[#16233A]">Health Snapshot kunjungan</h2>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0D47A1]">
              <HeartPulse className="size-5" aria-hidden="true" />
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {previewIndicators.map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-[#F8FAFD] p-2.5 sm:p-3">
                <p className="text-[11px] font-medium text-[#6B7A90]">{label}</p>
                <p className="mt-1 text-xs font-bold text-[#16233A]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#CFE3FA] bg-[#F3F8FF] p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D47A1]">
              <Sparkles className="size-4" aria-hidden="true" />
              CERITA HARI INI
            </div>
            <p className="mt-2 text-sm leading-6 text-[#4E5F75]">Catatan sederhana dari kunjungan membantu keluarga tetap terhubung dari jauh.</p>
          </div>
        </motion.article>
      </motion.div>
    </div>
  );
}
