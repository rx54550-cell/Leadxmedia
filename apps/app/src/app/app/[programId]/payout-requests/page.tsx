import { cpaLead, offer, partner, payoutRequest } from "@leadxmedia/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { PageHeader, Stat } from "@/components/page";
import { programCtx } from "@/server/context";
import { db } from "@/server/db";

export const metadata={title:"CPA Payout Requests · LeadXMedia"};
export default async function PayoutRequestsPage({params}:{params:Promise<{programId:string}>}) {
 const {programId}=await params; const {program:prog}=await programCtx(programId,"money.write");
 const requests=await db().select({request:payoutRequest,name:partner.name,email:partner.email}).from(payoutRequest).innerJoin(partner,eq(partner.id,payoutRequest.partnerId)).where(and(eq(payoutRequest.workspaceId,prog.workspaceId),eq(partner.programId,programId))).orderBy(desc(payoutRequest.createdAt));
 const [[publishers],[offers],[leads],[payouts]]=await Promise.all([
  db().select({n:sql<number>`count(*)::int`}).from(partner).where(eq(partner.programId,programId)),
  db().select({n:sql<number>`count(*)::int`}).from(offer).where(eq(offer.workspaceId,prog.workspaceId)),
  db().select({n:sql<number>`count(*)::int`}).from(cpaLead).innerJoin(offer,eq(offer.id,cpaLead.offerId)).where(eq(offer.workspaceId,prog.workspaceId)),
  db().select({n:sql<number>`count(*)::int`}).from(payoutRequest).where(eq(payoutRequest.workspaceId,prog.workspaceId)),
 ]);
 async function decide(form:FormData){"use server"; const {program:p}=await programCtx(programId,"money.write"); const id=String(form.get("id")??""), status=String(form.get("status")??""); if(!id||!(status==="approved"||status==="rejected")) return; await db().update(payoutRequest).set({status:status as "approved"|"rejected",reviewedAt:new Date()}).where(and(eq(payoutRequest.id,id),eq(payoutRequest.workspaceId,p.workspaceId),eq(payoutRequest.status,"pending"))); revalidatePath(`/app/${programId}/payout-requests`); }
 return <main className="mx-auto max-w-6xl space-y-6 p-6"><PageHeader title="Payout Requests" description="Review publisher USDT TRC20 payout requests."/><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat label="Total Publisher" value={String(publishers?.n ?? 0)}/><Stat label="Total Offer" value={String(offers?.n ?? 0)}/><Stat label="Total Lead" value={String(leads?.n ?? 0)}/><Stat label="Total Payout" value={String(payouts?.n ?? 0)}/></div><div className="overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Publisher</th><th className="p-3">Amount</th><th className="p-3">Method / Address</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead><tbody>{requests.map(({request:r,name,email})=><tr key={r.id} className="border-b"><td className="p-3">{name}<div className="text-muted">{email}</div></td><td className="p-3">{(r.amount/100).toFixed(2)} {r.currency.toUpperCase()}</td><td className="max-w-56 break-all p-3">{r.method}<br/>{r.destination}</td><td className="p-3">{r.status}</td><td className="p-3">{r.status==="pending"?<form action={decide} className="flex gap-2"><input type="hidden" name="id" value={r.id}/><button name="status" value="approved" className="rounded bg-green-700 px-3 py-1 text-white">Approve</button><button name="status" value="rejected" className="rounded border px-3 py-1">Reject</button></form>:"—"}</td></tr>)}</tbody></table>{!requests.length&&<p className="p-6 text-muted">Kono payout request nei.</p>}</div></main>;
}
