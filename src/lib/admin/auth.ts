import { createAdminClient, createClient } from "@/lib/supabase/server";

export class AdminAuthError extends Error {
  constructor(
    public readonly code: "unauthorized" | "forbidden",
    message: string,
    public readonly status: 401 | 403,
  ) {
    super(message);
    this.name = "AdminAuthError";
  }
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new AdminAuthError("unauthorized", "Anda harus login", 401);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, role, email")
    .eq("id", user.id)
    .maybeSingle();

  let resolvedProfile = profile;
  if (!resolvedProfile && user.email) {
    const admin = await createAdminClient();
    resolvedProfile = (await admin
      .from("users")
      .select("id, role, email")
      .ilike("email", user.email)
      .maybeSingle()).data;
  }

  const effectiveRole = resolvedProfile?.role || user.user_metadata?.role;

  if (effectiveRole !== "admin") {
    throw new AdminAuthError("forbidden", "Akses ditolak. Hanya Admin.", 403);
  }

  return { supabase, user, profile: resolvedProfile };
}

export function adminAuthErrorResponse(error: unknown) {
  if (error instanceof AdminAuthError) {
    return Response.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }

  return null;
}
