import crypto from "node:crypto";

const MIDTRANS_API_URL = "https://app.sandbox.midtrans.com/snap/v1/transactions";

export type MidtransCheckout = {
  token: string;
  redirect_url?: string;
  order_id: string;
};

export function getMidtransServerKey() {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi");
  return key;
}

export function verifyMidtransSignature(payload: {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
}) {
  const signature = payload.signature_key;
  if (!signature || !payload.order_id || !payload.status_code || !payload.gross_amount) return false;
  const expected = crypto
    .createHash("sha512")
    .update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${getMidtransServerKey()}`)
    .digest("hex");
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function createMidtransCheckout(input: {
  orderId: string;
  amount: number;
  customer: { name: string; email: string; phone?: string | null };
}) {
  const response = await fetch(MIDTRANS_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${getMidtransServerKey()}:`).toString("base64")}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      transaction_details: { order_id: input.orderId, gross_amount: input.amount },
      customer_details: {
        first_name: input.customer.name,
        email: input.customer.email,
        phone: input.customer.phone || undefined,
      },
      callbacks: { finish: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/kunjungan` },
    }),
    cache: "no-store",
  });

  const body = await response.json().catch(() => null) as { token?: string; redirect_url?: string; error_messages?: string[] } | null;
  if (!response.ok || !body?.token) {
    throw new Error(body?.error_messages?.join(", ") || "Midtrans belum dapat membuat checkout");
  }
  return { token: body.token, redirect_url: body.redirect_url, order_id: input.orderId } satisfies MidtransCheckout;
}

export async function refundMidtrans(orderId: string, amount: number, refundKey: string) {
  const response = await fetch(`https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/refund`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${getMidtransServerKey()}:`).toString("base64")}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ refund_key: refundKey, amount, reason: "Pembatalan tugas Rangkul" }),
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error((body as { status_message?: string })?.status_message || "Refund Midtrans gagal");
  return body as { transaction_status?: string; refund_amount?: string; order_id?: string };
}
