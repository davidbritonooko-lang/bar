import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: { default: "NOIR & EMBER — Where flavour meets the night", template: "%s | NOIR & EMBER" },
  description: "An evening shaped by flame, flavour, and atmosphere. Explore the menu, discover events, and order your favourites.",
  openGraph: { title: "NOIR & EMBER", description: "Where flavour meets the night.", type: "website" }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body><CartProvider><SiteHeader />{children}<SiteFooter /></CartProvider></body></html>;
}