export const metadata = { title: "Terms — Tailorly" };
export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 space-y-4 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
      <p>By using Tailorly you agree to these terms. Tailorly provides AI-generated suggestions for resumes and cover letters. You are responsible for reviewing all output and ensuring it accurately represents your experience before using it.</p>
      <h2 className="text-xl font-semibold text-slate-900">Subscriptions</h2>
      <p>Paid plans are billed monthly in advance through Stripe and renew automatically until canceled. You can cancel anytime from the Billing page; access continues until the end of the paid period. Usage limits reset each calendar month.</p>
      <h2 className="text-xl font-semibold text-slate-900">Refunds</h2>
      <p>If you&apos;re unhappy within 7 days of your first payment, contact us for a full refund.</p>
      <h2 className="text-xl font-semibold text-slate-900">Acceptable use</h2>
      <p>Don&apos;t submit content you don&apos;t have the right to use, or attempt to abuse, overload, or reverse-engineer the service.</p>
      <p className="text-sm text-slate-500">The service is provided “as is”, without warranties of any kind.</p>
    </div>
  );
}
