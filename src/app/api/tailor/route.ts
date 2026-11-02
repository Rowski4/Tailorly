import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { currentUser } from "@/lib/session";
import { getUsage } from "@/lib/usage";
import { sql } from "@/lib/db";
import { tailorApplication, AIError } from "@/lib/ai";

export const maxDuration = 300;

const MAX_RESUME = 20000;
const MAX_JOB = 15000;

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const resume = String(body?.resume ?? "").trim();
  const job = String(body?.jobPosting ?? "").trim();
  if (resume.length < 200) return NextResponse.json({ error: "Paste your full resume (at least a few lines)." }, { status: 400 });
  if (job.length < 150) return NextResponse.json({ error: "Paste the full job posting (at least a few lines)." }, { status: 400 });
  if (resume.length > MAX_RESUME) return NextResponse.json({ error: `Resume is too long (max ${MAX_RESUME} characters).` }, { status: 400 });
  if (job.length > MAX_JOB) return NextResponse.json({ error: `Job posting is too long (max ${MAX_JOB} characters).` }, { status: 400 });

  const { used, limit, plan } = await getUsage(user);
  if (used >= limit) {
    const msg = plan.id === "free"
      ? "You've used your 3 free tailorings. Upgrade to keep going."
      : `You've reached this month's ${limit} tailorings on ${plan.name}.`;
    return NextResponse.json({ error: msg, upgrade: true }, { status: 402 });
  }

  try {
    const result = await tailorApplication(resume, job);
    const rows = (await sql()`INSERT INTO tailorings (user_id, job_title, company, resume, job_posting, result)
      VALUES (${user.id}, ${result.job_title}, ${result.company}, ${resume}, ${job}, ${JSON.stringify(result)})
      RETURNING id`) as { id: string }[];
    return NextResponse.json({ id: rows[0].id, result });
  } catch (e) {
    if (e instanceof AIError) return NextResponse.json({ error: e.message }, { status: 422 });
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "We're busy right now. Please try again in a minute." }, { status: 429 });
    }
    if (e instanceof Anthropic.APIError) {
      console.error("Anthropic API error", e.status, e.message);
      return NextResponse.json({ error: "The AI service had a problem. Please try again." }, { status: 502 });
    }
    console.error(e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
