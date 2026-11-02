"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SAMPLE_JOB, SAMPLE_RESUME } from "@/lib/sample";

const STAGES = [
  "Reading your resume…",
  "Analyzing the job posting…",
  "Matching your experience to the requirements…",
  "Rewriting your bullets…",
  "Drafting your cover letter…",
  "Final polish…",
];

export function TailorForm({ lastResume, disabled }: { lastResume: string; disabled: boolean }) {
  const router = useRouter();
  const [resume, setResume] = useState(lastResume);
  const [job, setJob] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<{ msg: string; upgrade?: boolean } | null>(null);

  useEffect(() => {
    if (!loading) return;
    setStage(0);
    const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 7000);
    return () => clearInterval(t);
  }, [loading]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobPosting: job }),
      });
      const data = await res.json().catch(() => ({ error: "The request timed out. Please try again." }));
      if (!res.ok) {
        setError({ msg: data.error || "Something went wrong.", upgrade: data.upgrade });
        setLoading(false);
        return;
      }
      router.push(`/dashboard/t/${data.id}`);
      router.refresh();
    } catch {
      setError({ msg: "Network error. Please try again." });
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">New tailored application</h2>
        <button
          type="button"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
          onClick={() => {
            setResume(SAMPLE_RESUME);
            setJob(SAMPLE_JOB);
          }}
        >
          Fill with sample data
        </button>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Your resume</span>
          <textarea
            className="input mt-1 h-72 font-mono !text-xs leading-relaxed"
            placeholder="Paste your resume as plain text…"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            maxLength={20000}
            required
          />
          <span className="mt-1 block text-xs text-slate-400">{resume.length.toLocaleString()} / 20,000</span>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Job posting</span>
          <textarea
            className="input mt-1 h-72 font-mono !text-xs leading-relaxed"
            placeholder="Paste the full job description…"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            maxLength={15000}
            required
          />
          <span className="mt-1 block text-xs text-slate-400">{job.length.toLocaleString()} / 15,000</span>
        </label>
      </div>
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 flex flex-wrap items-center justify-between gap-3">
          <span>{error.msg}</span>
          {error.upgrade && <Link href="/dashboard/billing" className="btn-primary !py-1.5">Upgrade</Link>}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button className="btn-primary !px-6" disabled={loading || disabled}>
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Tailoring…
            </>
          ) : (
            "Tailor my application"
          )}
        </button>
        {loading && <span className="text-sm text-slate-500">{STAGES[stage]} This usually takes 30–60 seconds.</span>}
        {disabled && !loading && (
          <span className="text-sm text-slate-600">
            You&apos;ve hit your plan limit. <Link href="/dashboard/billing" className="font-semibold text-brand-600">Upgrade</Link> to keep going.
          </span>
        )}
      </div>
    </form>
  );
}
