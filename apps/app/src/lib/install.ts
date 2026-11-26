export function snippets(appUrl: string, slug: string, programId: string, couponId?: string | null) {
  const script = `<script async src="${appUrl}/op.js" data-program="${slug}"></script>`;
  const coupon = couponId ? `, { coupon: "${couponId}" }` : "";
  const checkout = `// Server: attribute the sale even when cookies are blocked later on.
import { readReferralCookie, stripeCheckoutParams } from "leadxmedia";

const ref = readReferralCookie(req.headers.get("cookie"));
const session = await stripe.checkout.sessions.create({
  // ...your existing options
  ...stripeCheckoutParams(ref${coupon}),
});${couponId ? "\n// Referred customers get your coupon automatically. Leave out allow_promotion_codes." : ""}`;
  const npm = `npm install leadxmedia

import { LeadXMedia, trackSignup } from "leadxmedia";
const op = new LeadXMedia({ apiKey: process.env.LEADXMEDIA_API_KEY, baseUrl: "${appUrl}" });

// after signup, before payment (it never throws):
await trackSignup(op, { programId: "${programId}", email: user.email, cookieHeader: req.headers.get("cookie") });`;
  const prompt = `Add the LeadXMedia affiliate program to this app.

1. Add this script tag to the <head> of every marketing and app page:
   ${script}
2. When a user signs up, call window.leadxmedia.signup({ email }) in the browser (it records the referral as a lead).
3. Wherever this app creates a Stripe Checkout Session, pass the visitor's click id:
   client_reference_id: <value of window.leadxmedia.clickId sent from the browser>
   and subscription_data.metadata.op_click with the same value.${couponId ? ` For a visitor who arrived through a partner (a click id is present), also add discounts: [{ coupon: "${couponId}" }] and leave out allow_promotion_codes.` : ""} If the app uses Stripe Payment Links or the Pricing Table, nothing else is needed for tracking: op.js adds client_reference_id automatically.${couponId ? " Payment Links and the Pricing Table don't apply the coupon. Use a Checkout Session for the discount." : ""}
4. Do not change prices, plans or any other billing logic.
5. Afterwards, load the site once so LeadXMedia can verify the install.

Docs: https://leadxmedia.com/docs/tracking`;
  return { script, checkout, npm, prompt };
}
