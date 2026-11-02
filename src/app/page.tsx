import Link from "next/link";
import { Pricing } from "@/components/Pricing";
import { currentUser } from "@/lib/session";
import { planFor } from "@/lib/usage";

const steps = [
  { n: "1", t: "Paste your resume", d: "Plain text from your doc or LinkedIn. No reformatting needed." },
  { n: "2", t: "Paste the job posting", d: "The full description — responsibilities, requirements, all of it." },
  { n: "3", t: "Get a tailored application", d: "Rewritten bullets, a specific cover letter, and your keyword gaps in about a minute." },
];

const features = [
  { t: "Bullets rewritten for this job", d: "Your real experience, re-angled in the posting's language — with a note on why each change helps." },
  { t: "A cover letter that isn't generic", d: "Specific to the company and role, signed with your name. No “I am writing to express my interest.”" },
  { t: "Match score + keyword gaps", d: "See how well you match before and after, which keywords you hit, and which ones you're honestly missing." },
  { t: "No made-up experience", d: "Tailorly never invents jobs, tools or numbers. Where a metric would help, it leaves a [X%] for you to fill in." },
  { t: "Interview talking points", d: "3–5 role-specific points to prepare, so the tailored resume holds up in the room." },
  { t: "Everything saved", d: "Every application you tailor is kept in your history to copy, reuse and compare." },
];

export default async function Home() {
  const user = await currentUser().catch(() => null);
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,#e0e7ff_0%,transparent_100%)]" />
        <div className="mx-auto max-w-4xl px-4 pt-20 pb-16 text-center">
          <p className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
            AI resume tailoring · first 3 free
          </p>
          <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight text-slate-900">
            Tailor your resume to any job <span className="text-brand-600">in 60 seconds.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            Recruiters skim for fit. Paste your resume and a job posting — Tailorly rewrites your bullets to match,
            drafts a cover letter for that exact role, and shows the keywords you&apos;re missing.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={user ? "/dashboard" : "/signup"} className="btn-primary !px-6 !py-3 !text-base">
              {user ? "Open dashboard" : "Tailor my first application — free"}
            </Link>
            <a href="#pricing" className="btn-secondary !px-6 !py-3 !text-base">See pricing</a>
          </div>
          <p className="mt-4 text-sm text-slate-500">No credit card required. Cancel paid plans anytime.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="card p-6 sm:p-8 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Before</p>
            <p className="mt-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              • Worked on the checkout page and fixed bugs.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">After — tailored to “Senior Frontend Engineer, Payments”</p>
            <p className="mt-2 rounded-lg bg-brand-50 p-4 text-sm text-slate-800">
              • Rebuilt the React checkout flow and resolved 40+ payment-path defects, cutting checkout errors by [X%] and
              improving conversion for a high-traffic e-commerce funnel.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl font-bold tracking-tight text-center">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand-600 font-bold text-white">{s.n}</div>
                <h3 className="mt-4 font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-bold tracking-tight text-center">Why it&apos;s worth paying for</h2>
        <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
          Tailoring one application by hand takes 30–60 minutes. Most people send the same resume everywhere instead —
          and get filtered out. Tailorly does it in a minute, for less than a coffee a month.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.t} className="card p-6">
              <h3 className="font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-white border-t border-slate-200 scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl font-bold tracking-tight text-center">Simple pricing</h2>
          <p className="mt-3 text-center text-slate-600">Start free. Upgrade when you&apos;re applying in earnest.</p>
          <div className="mt-12">
            <Pricing signedIn={!!user} currentPlan={user ? planFor(user).id : undefined} />
          </div>
        </div>
      </section>
    </>
  );
}
