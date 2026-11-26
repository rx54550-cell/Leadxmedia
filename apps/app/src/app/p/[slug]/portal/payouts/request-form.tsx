"use client";
import { useState } from "react";
import { requestCpaPayout } from "../../portal-actions";
export function RequestCpaPayout({ slug, balance }: { slug: string; balance: number }) {
 const [message,setMessage]=useState("");
 async function submit(form:FormData){const result=await requestCpaPayout(slug,{amount:String(form.get("amount")??""),address:String(form.get("address")??""),method:"USDT (TRC20)"});setMessage(result.ok?"Payout request sent for admin review.":result.error);}
 return <form action={submit} className="space-y-3 rounded-xl border p-5"><h2 className="font-semibold">Request Payout</h2><p className="text-sm text-muted">Available CPA balance: ${(balance/100).toFixed(2)} USDT</p><input name="amount" type="number" min="1" step="0.01" max={(balance/100).toFixed(2)} required placeholder="Amount in USDT" className="w-full rounded border p-2"/><input name="address" required placeholder="USDT address (TRC20)" className="w-full rounded border p-2"/><select disabled className="w-full rounded border p-2"><option>USDT (TRC20)</option></select><button className="rounded bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">Request Payout</button>{message&&<p role="status" className="text-sm">{message}</p>}</form>;
}
