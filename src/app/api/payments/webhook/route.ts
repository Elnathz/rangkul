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

    const status = payload.transaction_status?.toLowerCase();
    const success = status === "settlement" || (status === "capture" && payload.fraud_status?.toLowerCase() !== "challenge");
    if (!success) return apiResponse({ received: true, status: status || "unknown" });

    const supabase = await createAdminClient();
    const providerEvent = {
      order_id: payload.order_id,
      transaction_id: payload.transaction_id,
      transaction_status: payload.transaction_status,
      fraud_status: payload.fraud_status,
      status_code: payload.status_code,
      gross_amount: payload.gross_amount,
    } satisfies import("@/types/database").Json;
    const { data, error } = await supabase.rpc("settle_midtrans_payment", {
      p_order_id: payload.order_id!,
      p_gateway_ref: payload.transaction_id || payload.order_id!,
      p_payload: providerEvent,
    });
    if (error) {
      const statusCode = error.code === "P0002" ? 404 : error.code === "22023" ? 422 : 500;
      return createApiError(statusCode === 404 ? "not_found" : statusCode === 422 ? "validation_error" : "server_error", error.message, statusCode);
    }
    return apiResponse({ received: true, payment: data });
  } catch (error: unknown) {
    return createApiError("webhook_error", error instanceof Error ? error.message : "Webhook Midtrans gagal diproses", 400);
  }
}
