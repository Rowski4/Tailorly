import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, syncSubscription, syncCheckoutSession } from "@/lib/stripe";
import { ensureDb } from "@/lib/db";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), sig, secret);
  } catch (e) {
    return NextResponse.json({ error: `Bad signature: ${(e as Error).message}` }, { status: 400 });
  }

  await ensureDb();
  switch (event.type) {
    case "checkout.session.completed":
      await syncCheckoutSession(event.data.object.id);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      break;
  }
  return NextResponse.json({ received: true });
}
