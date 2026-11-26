"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart-context";
export function SiteHeader() {
  const [open, setOpen] = useState(false); const { count } = useCart();
  const links = [{ href: "/", label: "Home" }, { href: "/menu", label: "The menu" }, { href: "/events", label: "Experiences" }, { href: "/#story", label: "Our story" }];
  return <header className="site-header">
    <Link href="/" className="brand" aria-label="Noir and Ember home"><span className="brand-mark">N<span>&</span>E</span><span className="brand-name">NOIR <i>&</i> EMBER</span><span className="brand-caption">DINING · LOUNGE · MOMENTS</span></Link>
    <nav className="desktop-nav">{links.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}</nav>
    <div className="header-actions"><Link href="/order" className="order-link">Order <span>↗</span></Link><Link href="/order" className="cart-link" aria-label={`Cart, ${count} items`}><ShoppingBag size={17}/><span className="cart-count">{count}</span></Link><button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X/> : <MenuIcon/>}</button></div>
    {open && <div className="mobile-menu">{links.map(l => <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>)}<Link href="/order" onClick={() => setOpen(false)}>Order food</Link></div>}
  </header>;
}