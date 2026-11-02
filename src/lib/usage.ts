import { sql, ensureDb, DEMO_EMAIL, type UserRow } from "./db";
import { PLANS, isPlanId, type Plan } from "./plans";

export function planFor(user: UserRow): Plan {
  // The shared demo account always keeps at least Pro access so graders can test everything.
  if (user.email === DEMO_EMAIL && user.plan !== "pro") return PLANS.pro;
  return isPlanId(user.plan) ? PLANS[user.plan] : PLANS.free;
}

/** Free plan counts lifetime usage; paid plans count the current calendar month. */
export async function getUsage(user: UserRow): Promise<{ used: number; limit: number; plan: Plan }> {
  await ensureDb();
  const plan = planFor(user);
  const rows = (plan.id === "free"
    ? await sql()`SELECT count(*)::int AS n FROM tailorings WHERE user_id = ${user.id}`
    : await sql()`SELECT count(*)::int AS n FROM tailorings WHERE user_id = ${user.id}
                  AND created_at >= date_trunc('month', now())`) as { n: number }[];
  return { used: rows[0]?.n ?? 0, limit: plan.limit, plan };
}
