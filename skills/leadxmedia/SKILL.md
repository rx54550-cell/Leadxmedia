---
name: leadxmedia
description: Add an LeadXMedia affiliate/referral program to this app (tracking script, signup tracking, Stripe Checkout attribution, webhooks). Use when the user asks to "add an affiliate program", "add referrals", "track partner sales" or mentions LeadXMedia.
---

# Add LeadXMedia to an app

LeadXMedia attributes signups and Stripe payments to partners. It needs three small changes. Never change prices, plans or billing logic.

## 1. Tracking script (every public page)

Add to the root layout `<head>` (Next.js: `app/layout.tsx`; plain HTML: every page):

```html
<script async src="{LEADXMEDIA_URL}/op.js" data-program="{PROGRAM_SLUG}"></script>
```

- EU sites that ask for cookie consent: add `data-consent="required"` and call `window.leadxmedia("consent", true)` after the visitor accepts.
- Stripe Payment Links, Pricing Tables and Buy Buttons need nothing else: op.js adds `client_reference_id`.

## 2. Signup tracking

After a successful signup, record the lead. Browser:

```js
window.leadxmedia?.signup({ email: user.email });
```

Or server-side with the SDK (`npm i leadxmedia`), from the auth library's "user created" hook:

```ts
import { LeadXMedia, trackSignup } from "leadxmedia";
const op = new LeadXMedia({ apiKey: process.env.LEADXMEDIA_API_KEY!, baseUrl: process.env.LEADXMEDIA_URL });
await trackSignup(op, { programId: process.env.LEADXMEDIA_PROGRAM_ID!, email: user.email, cookieHeader: request.headers.get("cookie") });
```

Hooks: Better Auth `databaseHooks.user.create.after`, NextAuth/Auth.js `events.createUser`, Clerk `user.created` webhook, Supabase `auth.users` insert trigger or the signup server action.

## 3. Stripe Checkout attribution (server)

Wherever the app calls `stripe.checkout.sessions.create`, spread the attribution params:

```ts
import { readReferralCookie, stripeCheckoutParams } from "leadxmedia";
const session = await stripe.checkout.sessions.create({
  ...existingParams,
  ...stripeCheckoutParams(readReferralCookie(request.headers.get("cookie"))),
});
```

If the app already sets `metadata` or `subscription_data`, merge the objects instead of overwriting them.

If the program gives referred customers a discount, pass its Stripe coupon id from the environment and remove `allow_promotion_codes` from that call (Stripe allows one or the other):

```ts
...stripeCheckoutParams(readReferralCookie(request.headers.get("cookie")), { coupon: process.env.LEADXMEDIA_COUPON }),
```

## 4. Other billing (Paddle, Lemon Squeezy, Polar)

Pass `op_click` (from `window.leadxmedia.clickId`) as checkout custom data: Paddle `customData`, Lemon Squeezy `checkout[custom][op_click]`, Polar checkout `metadata`. For anything else, call `op.conversions.create(...)` after each successful payment.

## Environment variables to add

```
LEADXMEDIA_URL=https://app.leadxmedia.com   # or your self-hosted URL
LEADXMEDIA_API_KEY=op_live_...                # op_sk_... when self-hosted; scope: tracking:write
LEADXMEDIA_COUPON=...                         # optional: Stripe coupon id for referred customers
LEADXMEDIA_PROGRAM_ID=prg_...
```

## Verify

Load the site once: the LeadXMedia dashboard (Settings → Install) shows "Script seen". Then open `{LEADXMEDIA_URL}/r/{PROGRAM_SLUG}/{partner-code}` and complete a test-mode checkout: a commission appears under Commissions within seconds.
