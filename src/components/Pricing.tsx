import Link from "next/link";
import { PLANS, type PlanId } from "@/lib/plans";

export function Pricing({ currentPlan, signedIn }: { currentPlan?: PlanId; signedIn: boolean }) {
  const order: PlanId[] = ["free", "starter", "pro"];
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {order.map((id) => {
        const p = PLANS[id];
        const featured = id === "pro";
        const current = currentPlan === id;
        return (
          <div key={id} className={`card p-6 flex flex-col ${featured ? "ring-2 ring-brand-600" : ""}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              {featured && <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">Most popular</span>}
            </div>
            <p className="mt-1 text-sm text-slate-500">{p.blurb}</p>
            <p className="mt-5">
              <span className="text-4xl font-bold">${p.priceCents / 100}</span>
              <span className="text-slate-500">{id === "free" ? " forever" : " / month"}</span>
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-700 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-none text-brand-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              {current ? (
                <button className="btn-secondary w-full" disabled>Current plan</button>
              ) : id === "free" ? (
                signedIn ? (
                  <Link href="/dashboard" className="btn-secondary w-full">Go to dashboard</Link>
                ) : (
                  <Link href="/signup" className="btn-secondary w-full">Start free</Link>
                )
              ) : signedIn ? (
                <form action="/api/checkout" method="POST">
                  <input type="hidden" name="plan" value={id} />
                  <button className={`${featured ? "btn-primary" : "btn-secondary"} w-full`}>Get {p.name}</button>
                </form>
              ) : (
                <Link href={`/signup?plan=${id}`} className={`${featured ? "btn-primary" : "btn-secondary"} w-full`}>Get {p.name}</Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
