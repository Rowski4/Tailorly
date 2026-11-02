export type PlanId = "free" | "starter" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  priceCents: number;
  /** Tailorings allowed. Free = lifetime total, paid = per calendar month. */
  limit: number;
  blurb: string;
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    priceCents: 0,
    limit: 3,
    blurb: "Try it on a real application.",
    features: ["3 tailored applications", "Resume bullet rewrites", "Cover letter draft", "Keyword match score"],
  },
  starter: {
    id: "starter",
    name: "Starter",
    priceCents: 100,
    limit: 15,
    blurb: "For a focused, light job search.",
    features: ["15 tailored applications / month", "Everything in Free", "Saved history", "Cancel anytime"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceCents: 900,
    limit: 150,
    blurb: "For an active, high-volume search.",
    features: ["150 tailored applications / month", "Everything in Starter", "Priority processing", "Cancel anytime"],
  },
};

export const PAID_PLANS: PlanId[] = ["starter", "pro"];

export function isPlanId(x: unknown): x is PlanId {
  return x === "free" || x === "starter" || x === "pro";
}
