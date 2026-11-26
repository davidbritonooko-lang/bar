"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
export default function AdminLogin(){
 const router=useRouter();const params=useSearchParams();const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);const {error}=await supabase.auth.signInWithPassword({email,password});if(error){setError("Sign-in failed. Check your credentials and try again.");setBusy(false);return;}router.replace(params.get("next")||"/admin");router.refresh();}
 return <main className="page-hero" style={{minHeight:"80vh"}}><p className="eyebrow">NOIR & EMBER · STAFF</p><h1>Back of<br/><em>house.</em></h1><div className="order-panel" style={{maxWidth:400,textAlign:"left",margin:"35px auto"}}><form onSubmit={submit}><div className="form-field"><label htmlFor="email">Staff email</label><input id="email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value}/></div><div className="form-field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value}/></div><button className="btn btn-primary" style={{width:"100%"}} disabled={busy}>{busy?"Signing in…":"Sign in"}</button>{error&&<p className="order-message" role="alert">{error}</p>}</form></div></main>;
}