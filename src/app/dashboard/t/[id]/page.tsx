import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { sql } from "@/lib/db";
import type { TailorResult } from "@/lib/ai";
import { CopyButton } from "@/components/CopyButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tailored application — Tailorly" };

function Score({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent ? "text-emerald-600" : "text-slate-700"}`}>{v}%</p>
      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${accent ? "bg-emerald-500" : "bg-slate-400"}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export default async function TailoringPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const rows = (await sql()`SELECT result, created_at FROM tailorings WHERE id = ${id} AND user_id = ${user.id}`) as {
    result: TailorResult;
    created_at: string;
  }[];
  if (!rows[0]) notFound();
  const r = rows[0].result;
  const allBullets = r.tailored_bullets.map((b) => `• ${b.rewritten}`).join("\n");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">← Back to dashboard</Link>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">{r.job_title || "Tailored application"}</h1>
        <p className="text-slate-600">{r.company || "Unknown company"} · {new Date(rows[0].created_at).toLocaleString("en-US")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Score label="Match — original resume" value={r.match_score_before} />
        <Score label="Match — with tailored content" value={r.match_score_after} accent />
      </div>

      <section className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Professional summary</h2>
          <CopyButton text={r.professional_summary} />
        </div>
        <p className="mt-3 text-slate-700 leading-relaxed">{r.professional_summary}</p>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Rewritten resume bullets</h2>
          <CopyButton text={allBullets} label="Copy all" />
        </div>
        <ul className="mt-4 space-y-4">
          {r.tailored_bullets.map((b, i) => (
            <li key={i} className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-400 line-through decoration-slate-300">{b.original}</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <p className="font-medium text-slate-900">{b.rewritten}</p>
                <CopyButton text={b.rewritten} />
              </div>
              <p className="mt-2 text-xs text-brand-700">Why: {b.why}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-semibold">Keywords you match</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {r.matched_keywords.map((k) => (
              <span key={k} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{k}</span>
            ))}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="font-semibold">Gaps to address</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {r.missing_keywords.length === 0 && <span className="text-sm text-slate-500">No major gaps found.</span>}
            {r.missing_keywords.map((k) => (
              <span key={k} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">{k}</span>
            ))}
          </div>
        </section>
      </div>

      <section className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Cover letter</h2>
          <CopyButton text={r.cover_letter} />
        </div>
        <div className="mt-4 whitespace-pre-wrap leading-relaxed text-slate-700">{r.cover_letter}</div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">Interview talking points</h2>
        <ul className="mt-3 list-disc pl-5 space-y-2 text-slate-700">
          {r.interview_tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </section>
    </div>
  );
}
