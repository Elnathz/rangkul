import { apiResponse, createApiError } from "@/lib/api-response";
import { getMidtransServerKey, verifyMidtransSignature } from "@/lib/midtrans";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // Midtrans signs order_id + status_code + gross_amount + ServerKey with SHA-512.
    const payload = await request.json() as {
      order_id?: string;
      transaction_id?: string;
      transaction_status?: string;
      fraud_status?: string;
      status_code?: string;
      gross_amount?: string;
      signature_key?: string;
    };
    getMidtransServerKey();
    if (!verifyMidtransSignature(payload)) return createApiError("invalid_signature", "Signature Midtrans tidak valid", 401);

    const supabase = await createAdminClient();
    const success = payload.transaction_status === "settlement" || (payload.transaction_status === "capture" && payload.fraud_status !== "challenge");
    if (success) {
      const { data, error } = await supabase.rpc("settle_midtrans_payment", {
        p_order_id: payload.order_id!,
        p_gateway_ref: payload.transaction_id || payload.order_id!,
        p_payload: payload as unknown as import("@/types/database").Json,
      });
      if (error) return createApiError("server_error", error.message, 500);
      return apiResponse({ received: true, payment: data });
    }

    return apiResponse({ received: true, status: payload.transaction_status || "unknown" });
  } catch (error: unknown) {
    return createApiError("webhook_error", error instanceof Error ? error.message : "Webhook Midtrans gagal diproses", 400);
  }
}
