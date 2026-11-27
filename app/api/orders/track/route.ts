import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/);

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const parsed = tokenSchema.safeParse(token);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid tracking link." }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Order tracking is unavailable." }, { status: 503 });

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const tokenHash = createHash("sha256").update(parsed.data).digest("hex");
  const { data, error } = await supabase.from("orders")
    .select("order_number,status,fulfillment,items,created_at,updated_at")
    .eq("tracking_token_hash", tokenHash).maybeSingle();

  if (error) {
    console.error("Order tracking lookup failed", error.message);
    return NextResponse.json({ error: "Order tracking is unavailable." }, { status: 503 });
  }
  if (!data) return NextResponse.json({ error: "Order not found. Check your tracking link." }, { status: 404 });
  return NextResponse.json(data);
}
