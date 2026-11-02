import { requireUser } from "@/lib/session";
import { getUsage } from "@/lib/usage";
import { syncCheckoutSession } from "@/lib/stripe";
import { getUserById, DEMO_EMAIL } from "@/lib/db";
import { Pricing } from "@/components/Pricing";
import { PLANS, isPlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const metadata = { title: "Billing — Tailorly" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; canceled?: string; plan?: string }>;
}) {
  let user = await requireUser();
  const sp = await searchParams;
  let notice: { kind: "ok" | "warn"; text: string } | null = null;

  // Returning from Stripe Checkout: confirm the payment directly with Stripe (the webhook does the same thing).
  if (sp.session_id) {
    try {
      const plan = await syncCheckoutSession(sp.session_id, user.id);
      if (plan) {
        user = (await getUserById(user.id))!;
        notice = { kind: "ok", text: `Payment successful — you're on ${isPlanId(plan) ? PLANS[plan].name : plan}. Thank you!` };
      } else {
        notice = { kind: "warn", text: "We couldn't confirm that payment yet. Refresh in a moment." };
      }
    } catch (e) {
      console.error(e);
      notice = { kind: "warn", text: "We couldn't confirm that payment yet. Refresh in a moment." };
    }
  } else if (sp.canceled) {
    notice = { kind: "warn", text: "Checkout canceled — you weren't charged." };
  } else if (sp.plan && isPlanId(sp.plan) && sp.plan !== "free") {
    notice = { kind: "ok", text: `Account created! Choose ${PLANS[sp.plan].name} below to finish upgrading.` };
  }

  const { used, limit, plan } = await getUsage(user);
  const isDemo = user.email === DEMO_EMAIL;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-slate-600">Manage your plan and payment details.</p>
      </div>

      {notice && (
        <p className={`rounded-lg px-4 py-3 text-sm ${notice.kind === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
          {notice.text}
        </p>
      )}

      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Current plan</p>
          <p className="text-xl font-semibold">
            {plan.name}
            {user.subscription_status && user.subscription_status !== "active" && !isDemo && (
              <span className="ml-2 text-sm font-normal text-slate-500">({user.subscription_status})</span>
            )}
          </p>
          <p className="text-sm text-slate-600">
            {used} of {limit} tailorings used {plan.id === "free" ? "in total" : "this month"}.
          </p>
          {isDemo && <p className="mt-1 text-xs text-slate-500">Demo account: Pro access is included so you can try everything.</p>}
        </div>
        {user.stripe_customer_id && (
          <form action="/api/portal" method="POST">
            <button className="btn-secondary">Manage subscription & invoices</button>
          </form>
        )}
      </div>

      <Pricing signedIn currentPlan={isDemo && !user.stripe_subscription_id ? undefined : plan.id} />
      <p className="text-center text-xs text-slate-500">
        Payments are processed securely by Stripe. Plans renew monthly; cancel anytime from “Manage subscription”.
      </p>
    </div>
  );
}
