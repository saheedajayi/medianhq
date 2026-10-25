# Payments: pending tasks

Status of the Paystack integration as of 25 Oct 2026, and what's left before payments can be relied on in dev and production.

## Where things stand

Tested end to end on local dev with a Paystack **test** key:

1. A mentee books a paid session and is sent to Paystack checkout.
2. After paying, Paystack sends them back to the app (the callback URL), and the API confirms the charge with Paystack (`GET /api/v1/payments/verify/:reference`).
3. The booking moves to **Pending** and the mentor has 24 hours to accept.
4. Cancelling the request sends a real Paystack test refund (accepted by Paystack, refund reference `18846504`).

Also done in code (not yet committed or deployed):

- The webhook (`POST /api/v1/payments/webhook/paystack`) now only accepts requests signed by Paystack. See `apps/api/src/modules/payments/paystack-signature.guard.ts`. Unsigned or tampered requests get `401`.
- If payments aren't configured, users see "Payments aren't available right now. Please try again later." instead of an internal config message. The missing setting is logged on the server.

## Pending tasks

### 1. Stop charging mentees Paystack's fee

**Problem:** Checkout charged **NGN 25,482.24** for a ₦25,000 session. Paystack adds its transaction fee on top because of an account setting. Our booking confirmation shows ₦25,000, so the two don't match.

**Current behaviour:** the code takes a flat platform fee of 4% + ₦100 from the mentor's earnings (`apps/api/src/modules/bookings/booking-policy.ts`), and the mentee pays the listed price only. This is being replaced by the service charges in [Pricing and service charges](#pricing-and-service-charges) below.

**To do (Paystack dashboard):**

- [ ] Go to **Settings → Preferences → Transaction charges** and choose **"Charge me for the transaction fees"**. Save.
- [ ] Check the same setting in both **Test Mode** and **Live Mode**.
- [ ] Book a paid test session and confirm checkout shows exactly the session price (e.g. NGN 25,000.00).

**Business check:**

- [ ] Paystack's fee is then taken from Median's payout. Confirm the service charges below stay above Paystack's (and Flutterwave's) current charges for our typical prices, including the largest sessions. Check the providers' pricing pages for current rates and caps.

### 2. Set up the webhook

Paystack only sends webhooks to the URL saved in its dashboard (**Settings → API Keys & Webhooks**), one per mode. The **Test Webhook URL** is currently empty, so test events go nowhere.

**Why it matters:** if a mentee pays and closes the tab before being sent back, the callback never happens and the webhook is the only way we learn the payment succeeded. Refund results also arrive only through the webhook. Without it, refunds stay "pending" in our database (as the local test refund does now).

**To do:**

- [ ] Deploy the signature check to api-dev first. Until then the deployed endpoint accepts unsigned requests.
- [ ] Make sure api-dev's `PAYSTACK_SECRET_KEY` is the same test key as the dashboard. With the signature check, a different key means every webhook is rejected.
- [ ] Confirm api-dev is serving the API. On 25 Oct, `https://api-dev.medianhq.co/health` returned 404.
- [ ] Set **Test Webhook URL** to `https://api-dev.medianhq.co/api/v1/payments/webhook/paystack` and save.
- [ ] Make a test payment and a test refund, then check the transaction's logs in the Paystack dashboard show the webhook as delivered, and that the refund is marked processed in our database.
- [ ] For production, set the **Live Webhook URL** to the production API, e.g. `https://api.medianhq.co/api/v1/payments/webhook/paystack`. Never point test mode at production.

For local testing only: run `ngrok http 4000` and temporarily set the Test Webhook URL to the ngrok address plus `/api/v1/payments/webhook/paystack`.

### 3. Keys

- [ ] Production must use the **live** secret key (`sk_live_…`); test keys never move real money.
- [ ] Keep secret keys only in env files that git ignores (locally: `apps/api/.env.local`) and in the hosting provider's secrets.
- [ ] The test secret key appeared in a dashboard screenshot. If that screenshot was shared anywhere, use **Generate new secret key** in the dashboard and update every environment that uses it.
- [ ] Leave the **Test Callback URL** field empty: the API sends its own callback URL with each payment, which takes priority.

### 4. Smaller follow-ups

- [ ] If starting a payment fails (for example Paystack is unreachable), the booking stays in `PENDING_PAYMENT` and holds the time slot for up to 30 minutes. Decide whether to release the slot straight away instead.
- [ ] Older lint warnings in `apps/api/src/modules/payments/payments.service.ts` (`any` types around Paystack responses) could be cleaned up with typed response shapes.

## Pricing and service charges

Source: Median "Pricing & Service Charges" sheet (multi-currency subscription pricing and localized paid-session service charges). This is the pricing payments should be built on.

### Subscription plans

| Plan | Nigeria (NGN) | International anchor (USD) |
|---|---|---|
| Mentee Pro | NGN 5,000 monthly · NGN 14,000 quarterly · NGN 48,000 yearly | $7 monthly · $19 quarterly · $68 yearly |
| Mentor Pro | NGN 12,000 monthly · NGN 33,000 quarterly · NGN 115,600 yearly | $15 monthly · $40 quarterly · $148 yearly |

Commercially rounded local prices for the website and product:

| Currency | Mentee monthly | Mentee quarterly | Mentee yearly | Mentor monthly | Mentor quarterly | Mentor yearly |
|---|---|---|---|---|---|---|
| NGN - Nigerian Naira | NGN 5,000 | NGN 14,000 | NGN 48,000 | NGN 12,000 | NGN 33,000 | NGN 115,600 |
| USD - US Dollar | $7 | $19 | $68 | $15 | $40 | $148 |
| GBP - British Pound | £5 | £14 | £50 | £11 | £30 | £110 |
| EUR - Euro | €6 | €17 | €60 | €13 | €35 | €130 |
| CAD - Canadian Dollar | C$10 | C$27 | C$95 | C$21 | C$56 | C$205 |
| GHS - Ghanaian Cedi | GH₵80 | GH₵220 | GH₵780 | GH₵175 | GH₵460 | GH₵1,700 |
| KES - Kenyan Shilling | KSh900 | KSh2,450 | KSh8,800 | KSh1,950 | KSh5,200 | KSh19,200 |
| ZAR - South African Rand | R115 | R310 | R1,100 | R245 | R650 | R2,400 |
| EGP - Egyptian Pound | E£365 | E£990 | E£3,550 | E£780 | E£2,080 | E£7,700 |
| INR - Indian Rupee | ₹675 | ₹1,825 | ₹6,500 | ₹1,440 | ₹3,850 | ₹14,200 |
| RWF - Rwandan Franc | RF10,300 | RF28,000 | RF100,000 | RF22,100 | RF59,000 | RF218,000 |
| TZS - Tanzanian Shilling | TSh18,500 | TSh50,000 | TSh180,000 | TSh39,500 | TSh106,000 | TSh392,000 |
| UGX - Ugandan Shilling | USh27,500 | USh75,000 | USh268,000 | USh59,000 | USh157,500 | USh583,000 |
| ZMW - Zambian Kwacha | ZK140 | ZK375 | ZK1,350 | ZK295 | ZK785 | ZK2,900 |
| XOF - West African CFA Franc | CFA4,000 | CFA10,850 | CFA38,800 | CFA8,550 | CFA22,850 | CFA84,500 |
| XAF - Central African CFA Franc | FCFA4,000 | FCFA10,850 | FCFA38,800 | FCFA8,550 | FCFA22,850 | FCFA84,500 |
| COP - Colombian Peso | COP22,000 | COP60,000 | COP216,000 | COP47,500 | COP127,000 | COP470,000 |
| SLE - Sierra Leonean Leone | Le160 | Le440 | Le1,560 | Le345 | Le920 | Le3,400 |

Nigeria plan savings:

| Plan | Quarterly saving vs monthly | Yearly saving vs monthly |
|---|---|---|
| Mentee Pro | NGN 1,000 | NGN 12,000 |
| Mentor Pro | NGN 3,000 | NGN 28,400 |

### Paid-session service charges

The same Free or Pro service-charge rate applies to both mentees and mentors on that plan.

How to read this table: for NGN, the booking band is exactly NGN 50,000 and the fixed fee is NGN 800. For other currencies, the booking band and fixed component are clean localized equivalents of the international reference. The foreign fixed-fee base is $1.

| Currency | Lower booking band | Free: at / below band | Free: above band | Pro: at / below band | Pro: above band |
|---|---|---|---|---|---|
| NGN - Nigerian Naira | Up to NGN 50,000 | 10% + NGN 800 | 12% + NGN 800 | 8% + NGN 800 | 10% + NGN 800 |
| USD - US Dollar | Up to $70 | 10% + $1 | 12% + $1 | 8% + $1 | 10% + $1 |
| GBP - British Pound | Up to £50 | 10% + £1 | 12% + £1 | 8% + £1 | 10% + £1 |
| EUR - Euro | Up to €60 | 10% + €1 | 12% + €1 | 8% + €1 | 10% + €1 |
| CAD - Canadian Dollar | Up to C$100 | 10% + C$1 | 12% + C$1 | 8% + C$1 | 10% + C$1 |
| GHS - Ghanaian Cedi | Up to GH₵800 | 10% + GH₵12 | 12% + GH₵12 | 8% + GH₵12 | 10% + GH₵12 |
| KES - Kenyan Shilling | Up to KSh9,000 | 10% + KSh130 | 12% + KSh130 | 8% + KSh130 | 10% + KSh130 |
| ZAR - South African Rand | Up to R1,150 | 10% + R16 | 12% + R16 | 8% + R16 | 10% + R16 |
| EGP - Egyptian Pound | Up to E£3,650 | 10% + E£52 | 12% + E£52 | 8% + E£52 | 10% + E£52 |
| INR - Indian Rupee | Up to ₹6,700 | 10% + ₹100 | 12% + ₹100 | 8% + ₹100 | 10% + ₹100 |
| RWF - Rwandan Franc | Up to RF103,000 | 10% + RF1,500 | 12% + RF1,500 | 8% + RF1,500 | 10% + RF1,500 |
| TZS - Tanzanian Shilling | Up to TSh185,000 | 10% + TSh2,650 | 12% + TSh2,650 | 8% + TSh2,650 | 10% + TSh2,650 |
| UGX - Ugandan Shilling | Up to USh275,000 | 10% + USh4,000 | 12% + USh4,000 | 8% + USh4,000 | 10% + USh4,000 |
| ZMW - Zambian Kwacha | Up to ZK1,400 | 10% + ZK20 | 12% + ZK20 | 8% + ZK20 | 10% + ZK20 |
| XOF - West African CFA Franc | Up to CFA40,000 | 10% + CFA570 | 12% + CFA570 | 8% + CFA570 | 10% + CFA570 |
| XAF - Central African CFA Franc | Up to FCFA40,000 | 10% + FCFA570 | 12% + FCFA570 | 8% + FCFA570 | 10% + FCFA570 |
| COP - Colombian Peso | Up to COP220,000 | 10% + COP3,200 | 12% + COP3,200 | 8% + COP3,200 | 10% + COP3,200 |
| SLE - Sierra Leonean Leone | Up to Le1,600 | 10% + Le23 | 12% + Le23 | 8% + Le23 | 10% + Le23 |

### Implementation notes (from the sheet)

- Free service charge: 10% + fixed fee at or below the local booking band; 12% + fixed fee above it.
- Pro service charge: 8% + fixed fee at or below the local booking band; 10% + fixed fee above it.
- Subscription fees and paid-session service charges are separate.
- If Median hard-codes localized fees, review the non-NGN booking bands and fixed amounts periodically as FX rates move. Alternatively, checkout can convert the international reference dynamically and round to the nearest supported minor unit.
- Payment-provider processing fees, taxes, chargebacks and payout fees are separate unless Median explicitly chooses to absorb them.

### How this differs from the current code

- **Fee:** the code charges 4% + ₦100 (`PLATFORM_FEE_RATE` and `PLATFORM_FEE_FLAT` in `apps/api/src/modules/bookings/booking-policy.ts`). The sheet sets 8–12% + a fixed fee, depending on plan and booking band.
- **Who pays:** the code takes the fee from the mentor only. The sheet says the rate applies to both mentees and mentors on their plan.
- **Plans:** there is no Free/Pro plan or subscription in the code or database yet.
- **Currencies:** the code only handles NGN; there are no other currencies or booking bands.

### Open questions

- [ ] "Applies to both mentees and mentors": is the charge taken from each side, so the mentee pays price + charge and the mentor receives price − charge? Or is it a single charge, and if so, who pays it?
- [ ] When the mentee and mentor are on different plans, does each side use their own plan's rate?
- [ ] Is "above band" applied to the whole booking amount, or only to the part above the band?
- [ ] Which currency does a booking use: the mentor's, the mentee's, or the mentee's local currency?
- [ ] Hard-coded local amounts, or dynamic FX conversion from the USD reference?
- [ ] Should the confirmation screen show the mentee's service charge as its own line in the price breakdown?

## Flutterwave

We will also use **Flutterwave** alongside Paystack. Nothing is built for it yet. Today, payments only go through Paystack (`apps/api/src/modules/payments/`).

To decide and build:

- [ ] Which provider handles which payments: for example by currency or country (Paystack for NGN, Flutterwave for other African currencies and international cards), or as a fallback when one provider fails.
- [ ] Add a provider field to the payment flow. The `Payment` model already has a `provider` column (currently always `PAYSTACK`).
- [ ] Flutterwave checkout initialise and verify, mirroring the Paystack flow.
- [ ] Flutterwave webhook endpoint with its own signature check (Flutterwave's v3 API sends a secret hash in the `verif-hash` header; confirm against the API version we use), plus the dashboard webhook URLs for test and live.
- [ ] Flutterwave refunds, so cancellations, declines, expiries and no-shows refund through whichever provider took the payment.
- [ ] Flutterwave test and live keys in each environment, kept out of git.
- [ ] Set Flutterwave's fee setting the same way as Paystack's, so mentees pay exactly the price shown.
- [ ] Subscriptions (Mentee Pro / Mentor Pro): decide which provider runs recurring billing.
