import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";
export async function GET(){
 const {supabase,user,authorized}=await requireAdmin();
 if(!user)return NextResponse.json({error:"Sign in required"},{status:401});
 if(!authorized)return NextResponse.json({error:"Staff access required"},{status:403});
 const {data,error}=await supabase.from("orders").select("id,order_number,customer_name,phone,fulfillment,notes,items,total_amount,payment_status,status,created_at").order("created_at",{ascending:false}).limit(100);
 if(error)return NextResponse.json({error:"Could not retrieve orders"},{status:500});
 return NextResponse.json(data);
}