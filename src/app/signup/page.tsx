import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/AuthForm";
import { PAID_PLANS, type PlanId } from "@/lib/plans";

export const metadata = { title: "Sign up — Tailorly" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  if ((await auth())?.user?.id) redirect("/dashboard");
  const { plan } = await searchParams;
  const next = plan && PAID_PLANS.includes(plan as PlanId) ? `/dashboard/billing?plan=${plan}` : "/dashboard";
  return <AuthForm mode="signup" next={next} />;
}
