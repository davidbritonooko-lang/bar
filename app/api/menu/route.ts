import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { menu as demoMenu } from "@/lib/menu";
export async function GET(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return NextResponse.json(demoMenu.map(item=>({...item,available:true,published:true})));
 const supabase=createClient(url,key,{auth:{persistSession:false}});
 const {data,error}=await supabase.from("menu_items").select("id,name,description,price,category,image,tag,is_available,is_published,sort_order").eq("is_published",true).order("sort_order",{ascending:true});
 if(error){console.error("Public menu query failed",error.message);return NextResponse.json({error:"Menu is temporarily unavailable."},{status:503});}
 return NextResponse.json(data.map(item=>({...item,available:item.is_available,published:item.is_published})));
}