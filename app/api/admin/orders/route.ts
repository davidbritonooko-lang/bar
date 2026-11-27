import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";

const statuses = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"] as const;
const pageSize = 50;

export async function GET(request: Request) {
  const { supabase, user, authorized } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Staff access required" }, { status: 403 });

  const params = new URL(request.url).searchParams;
  const parsedPage = Number.parseInt(params.get("page") || "1", 10);
  const page = Number.isFinite(parsedPage) ? Math.max(1, Math.min(10000, parsedPage)) : 1;
  const status = params.get("status") || "all";
  const search = (params.get("q") || "").trim().slice(0, 100);
  if (status !== "all" && !statuses.includes(status as (typeof statuses)[number])) {
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  }

  let query = supabase
    .from("orders")
    .select("id,order_number,customer_name,phone,fulfillment,notes,items,total_amount,payment_status,status,created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);
  if (search) {
    // Escape PostgREST filter syntax and wildcard characters before using .or().
    const escaped = search.replace(/[\\%_(),]/g, (character) => `\\${character}`);
    const pattern = `%${escaped}%`;
    query = query.or(`order_number.ilike.${pattern},customer_name.ilike.${pattern},phone.ilike.${pattern}`);
  }

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) return NextResponse.json({ error: "Could not retrieve orders" }, { status: 500 });
  return NextResponse.json({ orders: data || [], total: count || 0, page, pageSize });
}
