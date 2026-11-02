import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { stripe, appUrl } from "@/lib/stripe";

export async function POST(req: Request) {
  const user = await currentUser();
  const base = appUrl(req);
  if (!user) return NextResponse.redirect(`${base}/login`, 303);
  if (!user.stripe_customer_id) return NextResponse.redirect(`${base}/dashboard/billing`, 303);
  const portal = await stripe().billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${base}/dashboard/billing`,
  });
  return NextResponse.redirect(portal.url, 303);
}
