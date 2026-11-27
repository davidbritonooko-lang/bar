import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";

const statuses = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"] as const;
const timeZone = "Africa/Nairobi";

function getTodayRange() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  const year = Number(part("year"));
  const month = Number(part("month"));
  const day = Number(part("day"));
  const date = [part("year"), part("month"), part("day")].join("-");
  // Nairobi is UTC+03:00 year-round; convert local midnight to UTC.
  const start = new Date(Date.UTC(year, month - 1, day) - 3 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { date, start: start.toISOString(), end: end.toISOString() };
}

export async function GET() {
  const { supabase, user, authorized } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Staff access required" }, { status: 403 });

  const range = getTodayRange();
  const counts: Record<string, number> = Object.fromEntries(statuses.map((status) => [status, 0]));
  let totalOrders = 0;
  let completedSales = 0;
  let completedCount = 0;
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from("orders").select("status,total_amount,created_at").gte("created_at", range.start).lt("created_at", range.end).order("created_at", { ascending: true }).order("id", { ascending: true }).range(offset, offset + 999);
    if (error) return NextResponse.json({ error: "Could not retrieve daily report" }, { status: 500 });
    const batch = data ?? [];
    totalOrders += batch.length;
    for (const order of batch) {
      if (order.status in counts) counts[order.status] += 1;
      if (order.status === "completed") { completedSales += order.total_amount; completedCount += 1; }
    }
    if (batch.length < 1000) break;
  }
  return NextResponse.json({ reportDate: range.date, totalOrders, counts, completedSales, averageCompletedOrderValue: completedCount ? completedSales / completedCount : 0 }, { headers: { "Cache-Control": "no-store" } });
}
