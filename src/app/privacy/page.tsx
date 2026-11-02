export const metadata = { title: "Privacy — Tailorly" };
export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 space-y-4 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p>We collect your email, name, a securely hashed password, and the resumes and job postings you submit, so we can provide the service and show your history.</p>
      <p>Submitted text is sent to our AI provider (Anthropic) to generate results. Payments are handled by Stripe; we never see or store your card number.</p>
      <p>We don&apos;t sell your data. You can ask us to delete your account and all associated data at any time.</p>
    </div>
  );
}
