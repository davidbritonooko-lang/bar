import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { menu } from "@/lib/menu";
const schema=z.object({customerName:z.string().trim().min(2).max(80),phone:z.string().trim().min(7).max(20),fulfillment:z.enum(["pickup","dine-in"]),notes:z.string().max(300).optional(),items:z.array(z.object({id:z.string(),quantity:z.number().int().min(1).max(20)})).min(1).max(30)});
export async function POST(req:Request){
 try{
  const body=await req.json();const parsed=schema.safeParse(body);if(!parsed.success)return NextResponse.json({error:"Please check your order details."},{status:400});
  const itemMap=new Map(menu.map(item=>[item.id,item]));const orderItems=parsed.data.items.map(line=>{const item=itemMap.get(line.id);if(!item)return null;return {id:item.id,name:item.name,quantity:line.quantity,unitPrice:item.price,lineTotal:item.price*line.quantity};});
  if(orderItems.some(i=>!i))return NextResponse.json({error:"One or more menu items are unavailable."},{status:400});
  const cleanItems=orderItems as NonNullable<typeof orderItems[number]>[];const total=cleanItems.reduce((sum,item)=>sum+item.lineTotal,0);const orderNumber="NE-"+randomUUID().replace(/-/g,"").slice(0,12).toUpperCase();
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return NextResponse.json({error:"Order backend is not configured yet. Please try again later."},{status:503});
  const supabase=createClient(url,key,{auth:{persistSession:false}});const {error}=await supabase.from("orders").insert({order_number:orderNumber,customer_name:parsed.data.customerName,phone:parsed.data.phone,fulfillment:parsed.data.fulfillment,notes:parsed.data.notes??null,items:cleanItems,total_amount:total,payment_status:"unpaid",status:"pending"});
  if(error){console.error("Order insert failed",error.message);return NextResponse.json({error:"We couldn't save your order. Please try again."},{status:500});}
  return NextResponse.json({orderNumber,total,status:"pending"},{status:201});
 }catch{ return NextResponse.json({error:"Invalid request."},{status:400});}
}