import { z } from "zod";

export const demoWalletChargeSchema = z.object({
  idempotency_key: z
    .string()
    .min(1, "Idempotency key wajib diisi pada retry")
    .max(128, "Idempotency key maksimal 128 karakter")
    .optional()
    .nullable(),
});

export type DemoWalletChargeInput = z.infer<typeof demoWalletChargeSchema>;

export const demoWalletTopupSchema = z.object({
  amount: z
    .number()
    .int("Jumlah harus bilangan bulat")
    .positive("Jumlah harus lebih dari 0")
    .max(10_000_000, "Maksimal top up Rp 10.000.000 per transaksi"),
});

export type DemoWalletTopupInput = z.infer<typeof demoWalletTopupSchema>;