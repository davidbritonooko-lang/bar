import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase-server";
const bodySchema=z.object({status:z.enum(["pending","confirmed","preparing","ready","completed","cancelled"])});
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const {supabase,user,authorized}=await requireAdmin();
 if(!user)return NextResponse.json({error:"Sign in required"},{status:401});
 if(!authorized)return NextResponse.json({error:"Staff access required"},{status:403});
 const parsed=bodySchema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid status"},{status:400});
 const {data,error}=await supabase.from("orders").update({status:parsed.data.status,updated_at:new Date().toISOString()}).eq("id",id).select("id,status").single();
 if(error)return NextResponse.json({error:"Could not update order"},{status:500});
 return NextResponse.json(data);
}