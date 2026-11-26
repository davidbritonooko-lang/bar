"use client";
import { useMemo, useState } from "react";
import { menu, formatPrice } from "@/lib/menu";
import { useCart } from "@/components/cart-context";
const categories=["all","small plates","from the fire","comfort","sides","zero-proof"];
export default function MenuPage(){
 const [category,setCategory]=useState("all"); const {add}=useCart();
 const items=useMemo(()=>menu.filter(m=>category==="all"||m.category===category),[category]);
 return <main><section className="page-hero"><p className="eyebrow">The kitchen & the bar</p><h1>Good things,<br/><em>made with intention.</em></h1><p>Bold flavours, comforting favourites, and thoughtful details. Find your next favourite.</p></section><section className="menu-page-section"><div className="menu-filter">{categories.map(c=><button key={c} className={`filter-pill ${category===c?"active":""}`} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="menu-grid">{items.map(item=><article className="dish-card" key={item.id}><div className="dish-image" style={{backgroundImage:`url("${item.image}")`}}>{item.tag&&<span className="dish-tag">{item.tag}</span>}</div><div className="dish-body"><h3>{item.name}</h3><p>{item.description}</p><div className="dish-bottom"><span className="price">{formatPrice(item.price)}</span><button className="add-btn" onClick={()=>add(item)}>Add +</button></div></div></article>)}</div><p style={{fontSize:10,color:"var(--muted)",textAlign:"center",marginTop:30}}>Menu and prices shown are fictional concept content.</p></section></main>;
}