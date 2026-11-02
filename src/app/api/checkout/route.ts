import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { PLANS, PAID_PLANS, type PlanId } from "@/lib/plans";
import { stripe, appUrl } from "@/lib/stripe";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const user = await currentUser();
  const base = appUrl(req);
  const form = await req.formData().catch(() => null);
  const planId = String(form?.get("plan") ?? "") as PlanId;

  if (!user) return NextResponse.redirect(`${base}/signup?plan=${encodeURIComponent(planId)}`, 303);
  if (!PAID_PLANS.includes(planId)) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

  // Already on this plan? Send them to the billing portal instead of double-subscribing.
  // (Switching to a different plan goes through Checkout; the old subscription is canceled on completion.)
  if (user.plan === planId && user.stripe_customer_id) {
    const portal = await stripe().billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${base}/dashboard/billing`,
    });
    return NextResponse.redirect(portal.url, 303);
  }

  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe().customers.create({ email: user.email, name: user.name ?? undefined, metadata: { userId: user.id } });
    customerId = customer.id;
    await sql()`UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${user.id}`;
  }

  const plan = PLANS[planId];
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    metadata: { userId: user.id, plan: plan.id },
    subscription_data: { metadata: { userId: user.id, plan: plan.id } },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: plan.priceCents,
          recurring: { interval: "month" },
          product_data: { name: `Tailorly ${plan.name}`, description: `${plan.limit} tailored applications per month` },
        },
      },
    ],
    allow_promotion_codes: true,
    success_url: `${base}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/dashboard/billing?canceled=1`,
  });
  return NextResponse.redirect(session.url!, 303);
}
