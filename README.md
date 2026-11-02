# Tailorly

AI resume and cover-letter tailoring SaaS. Paste a resume and a job posting, and Claude rewrites your bullets to match, drafts a role-specific cover letter, scores the match, and lists keyword gaps.

**Stack:** Next.js 15 (App Router) · Auth.js v5 (email + password, bcrypt) · Neon Postgres · Stripe Checkout subscriptions · Anthropic Claude (structured outputs)

## Plans
| Plan | Price | Limit |
|---|---|---|
| Free | $0 | 3 tailorings total |
| Starter | $1 / month | 15 / month |
| Pro | $9 / month | 150 / month |

Stripe prices are created inline at checkout, so you don't need to set up any products in the Stripe dashboard.

## Demo account
`demo@demo.com` / `password123!`. This account is created automatically on first request and always has Pro access.

## Deploy (Vercel)
1. Import this GitHub repo in Vercel.
2. **Storage → Create/Connect Database → Neon** to add `DATABASE_URL`. Tables are created automatically.
3. **Settings → Environment Variables**: set `AUTH_SECRET`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `APP_URL` (see `.env.example`).
4. **Stripe → Developers → Webhooks**: add the endpoint `https://<domain>/api/stripe/webhook` with the events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`.
5. **Stripe → Settings → Billing → Customer portal**: activate it so the "Manage subscription" button works.
6. Redeploy.

## Local dev
```bash
cp .env.example .env.local   # fill in values
npm install
npm run dev
```
