import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Log in — Tailorly" };

export default async function LoginPage() {
  if ((await auth())?.user?.id) redirect("/dashboard");
  return <AuthForm mode="login" next="/dashboard" />;
}
