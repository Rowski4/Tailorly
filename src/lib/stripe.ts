import Stripe from "stripe";
import { sql } from "./db";
import { isPlanId } from "./plans";

let _stripe: Stripe | null = null;
export function stripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export function appUrl(req: Request): string {
  return process.env.APP_URL?.replace(/\/$/, "") || new URL(req.url).origin;
}

const ACTIVE = new Set(["active", "trialing", "past_due"]);

/** Write a subscription's state onto the user it belongs to. */
export async function syncSubscription(sub: Stripe.Subscription, userIdHint?: string) {
  const plan = sub.metadata?.plan;
  const userId = sub.metadata?.userId || userIdHint;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const active = ACTIVE.has(sub.status) && isPlanId(plan);
  if (active && userId) {
    await sql()`UPDATE users SET plan = ${plan}, stripe_customer_id = ${customerId},
      stripe_subscription_id = ${sub.id}, subscription_status = ${sub.status} WHERE id = ${userId}`;
  } else {
    // Inactive (canceled, unpaid...): only downgrade if this is still the user's current subscription.
    await sql()`UPDATE users SET plan = ${active ? plan! : "free"}, subscription_status = ${sub.status}
      WHERE stripe_subscription_id = ${sub.id}`;
  }
}

/** Look up a completed Checkout Session and apply it. Safe to call repeatedly. */
export async function syncCheckoutSession(sessionId: string, expectedUserId?: string) {
  const session = await stripe().checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
  const userId = session.client_reference_id ?? session.metadata?.userId;
  if (!userId || (expectedUserId && userId !== expectedUserId)) return null;
  if (session.status !== "complete" || !session.subscription || typeof session.subscription === "string") return null;
  const before = (await sql()`SELECT stripe_subscription_id FROM users WHERE id = ${userId}`) as { stripe_subscription_id: string | null }[];
  const previous = before[0]?.stripe_subscription_id;
  await syncSubscription(session.subscription, userId);
  // Switching plans: cancel the old subscription (prorated) so the user is never billed twice.
  if (previous && previous !== session.subscription.id) {
    await stripe().subscriptions.cancel(previous, { prorate: true }).catch((e) => console.error("cancel old sub", e));
  }
  return session.subscription.metadata?.plan ?? null;
}
