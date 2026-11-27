import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { experienceExamples } from "@/lib/events";
export async function GET(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return NextResponse.json(experienceExamples);
 const supabase=createClient(url,key,{auth:{persistSession:false}});
 const {data,error}=await supabase.from("events").select("id,title,label,description,image,event_date,start_time,end_time,venue,is_published,is_featured,sort_order").eq("is_published",true).order("event_date",{ascending:true,nullsFirst:false}).order("sort_order",{ascending:true});
 if(error){console.error("Events query failed",error.message);return NextResponse.json({error:"Events are temporarily unavailable."},{status:503});}
 return NextResponse.json(data?.length?data:experienceExamples);
}