import { NextResponse } from "next/server";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const schema = z.object({
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
  fulfillment: z.enum(["pickup", "dine-in"]),
  notes: z.string().max(300).optional(),
  items: z.array(z.object({ id: z.string(), quantity: z.number().int().min(1).max(20) })).min(1).max(30),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Please check your order details." }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ error: "Order backend is not configured yet. Please try again later." }, { status: 503 });

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data: liveItems, error: menuError } = await supabase.from("menu_items")
      .select("id,name,description,price,category,image,tag")
      .eq("is_published", true).eq("is_available", true);
    if (menuError) {
      console.error("Order menu lookup failed", menuError.message);
      return NextResponse.json({ error: "Menu unavailable for ordering. Please try again later." }, { status: 503 });
    }

    const itemMap = new Map((liveItems ?? []).map(item => [item.id, item]));
    const orderItems = parsed.data.items.map(line => {
      const item = itemMap.get(line.id);
      if (!item) return null;
      return { id: item.id, name: item.name, quantity: line.quantity, unitPrice: item.price, lineTotal: item.price * line.quantity };
    });
    if (orderItems.some(item => !item)) return NextResponse.json({ error: "One or more menu items are unavailable." }, { status: 400 });

    const cleanItems = orderItems as NonNullable<typeof orderItems[number]>[];
    const total = cleanItems.reduce((sum, item) => sum + item.lineTotal, 0);
    if (!Number.isSafeInteger(total)) return NextResponse.json({ error: "Order total is invalid." }, { status: 400 });

    const orderNumber = "NE-" + randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
    const trackingToken = randomBytes(32).toString("hex");
    const trackingTokenHash = createHash("sha256").update(trackingToken).digest("hex");
    const { error } = await supabase.from("orders").insert({
      order_number: orderNumber,
      customer_name: parsed.data.customerName,
      phone: parsed.data.phone,
      fulfillment: parsed.data.fulfillment,
      notes: parsed.data.notes ?? null,
      items: cleanItems,
      total_amount: total,
      payment_status: "unpaid",
      status: "pending",
      tracking_token_hash: trackingTokenHash,
    });
    if (error) {
      console.error("Order insert failed", error.message);
      return NextResponse.json({ error: "We couldn't save your order. Please try again." }, { status: 500 });
    }
    return NextResponse.json({ orderNumber, total, status: "pending", trackingToken }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
