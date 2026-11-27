import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const { supabase, user, authorized } = await requireAdmin();
 if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
 if (!authorized) return NextResponse.json({ error: "Staff access required" }, { status: 403 });
 const { data, error } = await supabase.from("order_status_history")
  .select("id,from_status,to_status,note,changed_at,actor_user_id")
  .eq("order_id", id).order("changed_at", { ascending: true });
 if (error) return NextResponse.json({ error: "Could not retrieve status history" }, { status: 500 });
 return NextResponse.json(data);
}
