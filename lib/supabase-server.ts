import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createSupabaseServerClient(){
 const cookieStore=await cookies();
 return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{
  cookies:{getAll(){return cookieStore.getAll();},setAll(values){try{values.forEach(({name,value,options})=>cookieStore.set(name,value,options));}catch{ /* Middleware refreshes cookies when server components cannot write. */ }}}
 });
}
export async function requireAdmin(){
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return {supabase,user:null,authorized:false};
 const {data:profile}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();
 return {supabase,user,authorized:profile?.role==="admin"||profile?.role==="staff"};
}