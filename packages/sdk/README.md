# leadxmedia

TypeScript SDK for [LeadXMedia](https://leadxmedia.com), the open-source affiliate and referral platform for SaaS.

```bash
npm install leadxmedia
```

```ts
import { LeadXMedia, trackSignup, stripeCheckoutParams, readReferralCookie, verifyWebhook } from "leadxmedia";

const op = new LeadXMedia({ apiKey: process.env.LEADXMEDIA_API_KEY!, baseUrl: "https://app.leadxmedia.com" });

// 1. after signup (any auth: Better Auth, NextAuth, Clerk, Supabase)
await trackSignup(op, { programId: "prg_...", email: user.email, cookieHeader: req.headers.get("cookie") });

// 2. when creating a Stripe Checkout Session, attribute without cookies
const ref = readReferralCookie(req.headers.get("cookie"));
const session = await stripe.checkout.sessions.create({ ...yourOptions, ...stripeCheckoutParams(ref) });

// 2b. give referred customers their discount automatically (your Stripe coupon id; leave out allow_promotion_codes)
const discounted = await stripe.checkout.sessions.create({
  ...yourOptions,
  ...stripeCheckoutParams(ref, { coupon: process.env.LEADXMEDIA_COUPON }),
});

// 3. other billing systems: report payments yourself (idempotent on paymentId)
await op.conversions.create({ programId: "prg_...", paymentId: "inv_1", customerId: "cus_1", amount: 4900, currency: "usd", interval: "month" });

// 4. verify webhooks
const event = verifyWebhook(rawBody, req.headers.get("leadxmedia-signature"), process.env.LEADXMEDIA_WEBHOOK_SECRET!);
```

Payouts created with `op.payouts.prepare()` always wait for a person to approve them in the dashboard.

License: [MIT](LICENSE)
