import { cpaLead, click, offer } from "@openpromoter/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { createId } from "@/lib/id";
import { db } from "@/server/db";

/** CPAHouse-compatible conversion callback. Configure CPA_POSTBACK_SECRET before enabling it. */
export async function GET(req: NextRequest) {
 const secret=process.env.CPA_POSTBACK_SECRET;
 if(!secret) return NextResponse.json({error:"Postback is not configured"},{status:503});
 const q=req.nextUrl.searchParams;
 if((q.get("secret")??req.headers.get("x-postback-secret"))!==secret) return NextResponse.json({error:"Unauthorized"},{status:401});
 const clickId=q.get("click_id")??q.get("clickid")??"";
 const transactionId=q.get("txid")??q.get("transaction_id")??q.get("sale_id")??"";
 const payout=Number(q.get("payout")??"0");
 const status=(q.get("status")??"").toLowerCase();
 if(!clickId||!transactionId||!Number.isFinite(payout)||payout<0||payout>1_000_000) return NextResponse.json({error:"Invalid postback parameters"},{status:400});
 const [row]=await db().select({click,offer}).from(click).innerJoin(offer,eq(click.offerId,offer.id)).where(eq(click.id,clickId)).limit(1);
 if(!row) return NextResponse.json({error:"Unknown click_id"},{status:404});
 const leadStatus=status==="approved"||status==="1"?"approved":status==="rejected"||status==="declined"?"rejected":"pending";
 try { await db().insert(cpaLead).values({id:createId("lead"),offerId:row.offer.id,partnerId:row.click.partnerId,clickId,transactionId,status:leadStatus,payoutAmount:Math.round(payout*100),currency:row.offer.currency}); }
 catch(error) { if(error&&typeof error==="object"&&"code" in error&&(error as {code?:string}).code==="23505") return NextResponse.json({ok:true,duplicate:true}); throw error; }
 return NextResponse.json({ok:true,lead_id:transactionId});
}
