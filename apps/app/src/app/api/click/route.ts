import { click, offer, partner } from "@openpromoter/db";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { createId } from "@/lib/id";
import { hashIp } from "@/lib/crypto";
import { db } from "@/server/db";
import { limit } from "@/server/ratelimit";

export async function GET(req: NextRequest) {
 const offerId=req.nextUrl.searchParams.get("offer_id")??"", pubId=req.nextUrl.searchParams.get("pub_id")??"", sub=req.nextUrl.searchParams.get("sub1")?.slice(0,120)??null;
 const [o,p]=await Promise.all([db().select().from(offer).where(and(eq(offer.id,offerId),eq(offer.status,"active"))).limit(1),db().select().from(partner).where(and(eq(partner.id,pubId),eq(partner.status,"approved"))).limit(1)]);
 if(!o[0]||!p[0]||o[0].workspaceId!==p[0].workspaceId) return NextResponse.json({error:"Offer or publisher unavailable"},{status:404});
 const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??"unknown";
 if(!(await limit(`cpa-click:${ip}`,120,60_000)).ok) return NextResponse.json({error:"Too many requests"},{status:429});
 const id=createId("clk"), userAgent=req.headers.get("user-agent")?.slice(0,500)??null;
 const destination=new URL(o[0].trackingUrl); destination.searchParams.set("click_id",id); destination.searchParams.set("sub1",sub??"");
 await db().insert(click).values({id,programId:p[0].programId,partnerId:p[0].id,offerId:o[0].id,linkId:null,visitorId:id,ipHash:hashIp(ip),userAgent,referrer:req.headers.get("referer"),landingUrl:o[0].trackingUrl,country:null,subId:sub,utm:null,isBot:/bot|crawler|spider/i.test(userAgent??"")});
 return NextResponse.redirect(destination,302);
}
