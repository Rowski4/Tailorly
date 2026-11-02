"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Could not create account.");
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result || result.error) throw new Error("Incorrect email or password.");
      window.location.href = next;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold tracking-tight">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === "login" ? "Log in to tailor your next application." : "Your first 3 tailored applications are free."}
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <label className="block">
              <span className="text-sm font-medium">Name</span>
              <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input className="input mt-1" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              className="input mt-1"
              type="password"
              required
              minLength={mode === "signup" ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
            {mode === "signup" && <span className="mt-1 block text-xs text-slate-500">At least 8 characters.</span>}
          </label>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          {mode === "login" ? (
            <>New here? <Link className="font-semibold text-brand-600" href="/signup">Create an account</Link></>
          ) : (
            <>Already have an account? <Link className="font-semibold text-brand-600" href="/login">Log in</Link></>
          )}
        </p>
      </div>
      {mode === "login" && (
        <p className="mt-4 text-center text-xs text-slate-500">
          Just looking? Demo account: <span className="font-mono">demo@demo.com</span> / <span className="font-mono">password123!</span>
        </p>
      )}
    </div>
  );
}
