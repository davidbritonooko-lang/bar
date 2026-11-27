"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type TrackedOrder = {
  order_number: string;
  status: string;
  fulfillment: string;
  items: { name: string; quantity: number }[];
  created_at: string;
  updated_at: string;
};
const stages = ["pending", "confirmed", "preparing", "ready", "completed"];

function TrackingContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setError("Tracking link is missing."); setLoading(false); return; }
    let cancelled = false;
    fetch("/api/orders/track?token=" + encodeURIComponent(token), { cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load order.");
        if (!cancelled) setOrder(data);
      })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load order."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  const current = order ? stages.indexOf(order.status) : -1;
  return <main><section className="page-hero"><p className="eyebrow">NOIR & EMBER · ORDER DESK</p><h1>Follow the<br/><em>flavour.</em></h1><p>Your order status, without the guesswork.</p></section><section className="menu-page-section"><article className="order-panel" style={{maxWidth:720,margin:"0 auto"}}>{loading ? <p className="empty-cart">Loading order status…</p> : error ? <p className="order-message" role="status">{error}</p> : order ? <><p className="eyebrow">{order.order_number}</p><h2 style={{textTransform:"capitalize"}}>{order.status.replaceAll("_"," ")}</h2><p style={{color:"var(--muted)"}}>Fulfilment: {order.fulfillment} · Placed {new Date(order.created_at).toLocaleString()}</p>{order.status === "cancelled" ? <p className="order-message">This order was cancelled.</p> : <div style={{display:"grid",gap:12,margin:"28px 0"}}>{stages.map((stage,index)=><div key={stage} style={{display:"flex",gap:14,alignItems:"center"}}><span aria-hidden="true" style={{width:14,height:14,borderRadius:"50%",border:"1px solid var(--gold)",background:index<=current?"var(--gold)":"transparent",flexShrink:0}}/><span style={{textTransform:"capitalize",opacity:index<=current?1:.5}}>{stage.replaceAll("_"," ")}</span></div>)}</div>}<h3>Items</h3><ul style={{lineHeight:1.9,color:"var(--muted)"}}>{order.items.map((item,i)=><li key={i}>{item.quantity} × {item.name}</li>)}</ul><p style={{fontSize:12,color:"var(--muted)"}}>Last updated {new Date(order.updated_at).toLocaleString()}</p></> : null}</article></section></main>;
}

export default function TrackPage() {
  return <Suspense fallback={<main><section className="page-hero"><p className="eyebrow">NOIR & EMBER · ORDER DESK</p><h1>Follow the<br/><em>flavour.</em></h1><p>Loading tracking details…</p></section></main>}><TrackingContent /></Suspense>;
}
