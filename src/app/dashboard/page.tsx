import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getUsage } from "@/lib/usage";
import { sql } from "@/lib/db";
import { TailorForm } from "@/components/TailorForm";

export const metadata = { title: "Dashboard — Tailorly" };
export const dynamic = "force-dynamic";

interface Row { id: string; job_title: string | null; company: string | null; created_at: string; score: number | null }

export default async function Dashboard() {
  const user = await requireUser();
  const { used, limit, plan } = await getUsage(user);
  const history = (await sql()`SELECT id, job_title, company, created_at, (result->>'match_score_after')::int AS score
    FROM tailorings WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 25`) as Row[];
  const last = (await sql()`SELECT resume FROM tailorings WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 1`) as { resume: string }[];
  const pct = Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hi{user.name ? `, ${user.name.split(" ")[0]}` : ""} 👋</h1>
          <p className="text-slate-600">Paste a resume and a job posting to get a tailored application.</p>
        </div>
        <div className="card px-5 py-4 min-w-64">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">{plan.name} plan</span>
            <span className="text-slate-500">{used} / {limit} {plan.id === "free" ? "used" : "this month"}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
          </div>
          {plan.id !== "pro" && (
            <Link href="/dashboard/billing" className="mt-2 inline-block text-xs font-semibold text-brand-600">Upgrade for more →</Link>
          )}
        </div>
      </div>

      <TailorForm lastResume={last[0]?.resume ?? ""} disabled={used >= limit} />

      <section>
        <h2 className="text-lg font-semibold">Your applications</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nothing yet. Your tailored applications will show up here.</p>
        ) : (
          <ul className="mt-3 card divide-y divide-slate-100">
            {history.map((h) => (
              <li key={h.id}>
                <Link href={`/dashboard/t/${h.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{h.job_title || "Untitled role"}</p>
                    <p className="text-sm text-slate-500 truncate">
                      {h.company || "Unknown company"} · {new Date(h.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  {h.score != null && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{h.score}% match</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
