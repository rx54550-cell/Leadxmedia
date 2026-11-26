# LeadX Media — General CPA Network PRD

## 1. Product overview
LeadX Media is a self-hosted, multi-vertical CPA network. Advertisers add offers; approved publishers browse eligible offers, create tracking links, review performance, and request payouts. The platform records clicks and conversions from signed postbacks, including CPAHouse-compatible macros.

## 2. Goals
- Support general CPA offers across multiple verticals.
- Provide publisher approval, offer access, click/lead reporting, and payout requests.
- Give admins tools to manage offers, publishers, postbacks, and payout decisions.
- Run locally with Docker Compose and deploy the app container with a persistent PostgreSQL database on Railway or similar platforms.

## 3. Roles
- **Admin:** manage offers, publisher applications, postback settings, conversion review, and payout requests.
- **Publisher:** apply, browse available offers, generate tracking links, view statistics, and request payouts.

## 4. Offer model
Each offer contains:
- Offer name and description
- Category: E-commerce Offer, Finance / Loan Offer, Health / Nutra Offer, Gaming Offer, Mobile App Install Offer, Lead Gen Offer, Sweepstakes Offer, Gambling, or Other
- Payout model: CPL, CPA, or CPI
- Payout amount and currency
- Allowed GEOs (ISO country codes such as BD, ID, US, IN)
- Advertiser destination/tracking URL
- Enabled/paused state
- Optional advertiser postback URL and conversion rules

Gambling is an optional category only. The platform is vertical-neutral and does not hard-code any vertical-specific flow.

## 5. Publisher experience
- Application status and profile
- Offer list with filters for category, GEO, and payout model
- Offer details, payout, allowed countries, and description
- Tracking-link generation with publisher and optional sub-ID parameters
- Click, conversion/lead, and earnings statistics by date and offer
- Payout request flow; payout method and currency are configurable (USDT is a requested option and must be manually settled unless a compliant payout integration is configured)

## 6. Admin experience
- Create, edit, pause, and archive offers
- Approve, reject, or pause publishers
- Configure offer-specific conversion postback URL and macros
- Inspect click/conversion records and duplicate/rejected postbacks
- Review, approve, or reject payout requests; mark manual transfers as paid with a reference

## 7. Tracking and CPAHouse-compatible postbacks
- Redirect route records click ID, publisher ID, offer ID, GEO, timestamp, and optional sub-ID, then redirects to the advertiser destination.
- Each generated link includes an opaque click identifier (`click_id`) and CPAHouse-compatible aliases such as `{click_id}`, `{payout}`, `{status}`, `{txid}` where required by the configured endpoint.
- Inbound conversion endpoint accepts a unique transaction/event ID, click ID, payout, and status. Duplicate transaction IDs are idempotently ignored.
- Validate offer and publisher state, required parameters, payout bounds, and signatures/secrets before crediting a conversion.
- Persist raw event metadata with redaction of secrets; show accepted/rejected reason in admin reporting.
- Postback delivery uses a retry queue with capped exponential backoff and event logs.

## 8. Data and access controls
- Tenant scoping for offers, publishers, clicks, conversions, and payout requests.
- Role checks on every admin action; publishers only see their own performance and requests.
- Audit log for status, payout, and postback-setting changes.
- Rate limits and idempotency on public tracking endpoints.
- Store only payout details required for settlement; protect secrets at rest.

## 9. Deployment
- Docker Compose for local app + PostgreSQL; persistent database volume.
- Railway: deploy the Dockerfile and attach PostgreSQL, configure environment variables and persistent database backups.
- Vercel does not run Docker Compose; Next.js may be deployed there separately, but persistent Postgres and background jobs remain external services.
- No Stripe, Paddle, or Lemon Squeezy billing requirement in the CPA product flow.

## 10. Delivery phases
1. LeadX branding and general CPA product language.
2. Offer schema, category/GEO/payout filters, admin offer management.
3. Publisher application and approval, tracking-link redirect, click reporting.
4. Signed/idempotent CPAHouse-style postback ingestion and conversion stats.
5. Payout request ledger and admin review, with USDT as a manual payout method.
6. Deployment documentation, migrations, and verification.

## 11. Acceptance criteria
- Admin can create an offer with all fields above and select a category.
- Publisher can filter offers by category, GEO, and payout model.
- Generated links identify publisher, offer, and click without exposing private credentials.
- A valid postback creates at most one conversion per transaction ID; invalid or repeated events do not duplicate earnings.
- Publisher sees only their own statistics and can submit a payout request.
- Admin can review and resolve publisher applications and payout requests.
- Docker Compose starts the app and persistent PostgreSQL locally.
