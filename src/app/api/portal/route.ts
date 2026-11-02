import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { stripe, appUrl, existingCustomer, stripeErrorCode } from "@/lib/stripe";

export async function POST(req: Request) {
  const user = await currentUser();
  const base = appUrl(req);
  if (!user) return NextResponse.redirect(`${base}/login`, 303);
  try {
    const customer = await existingCustomer(user);
    if (!customer) return NextResponse.redirect(`${base}/dashboard/billing?error=no_customer`, 303);
    const portal = await stripe().billingPortal.sessions.create({ customer, return_url: `${base}/dashboard/billing` });
    return NextResponse.redirect(portal.url, 303);
  } catch (e) {
    return NextResponse.redirect(`${base}/dashboard/billing?error=${stripeErrorCode(e)}`, 303);
  }
}
