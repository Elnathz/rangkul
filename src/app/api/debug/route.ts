import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const res = await supabase.from("messages").select("*").limit(1);
  return NextResponse.json(res);
}
