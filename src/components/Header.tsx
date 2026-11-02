import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function Header() {
  const session = await auth();
  const signedIn = !!session?.user?.id;
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">T</span>
          Tailorly
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4 text-sm">
          {signedIn ? (
            <>
              <Link href="/dashboard" className="hidden sm:inline text-slate-600 hover:text-slate-900">Dashboard</Link>
              <Link href="/dashboard/billing" className="hidden sm:inline text-slate-600 hover:text-slate-900">Billing</Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="btn-secondary !py-2">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/#pricing" className="hidden sm:inline text-slate-600 hover:text-slate-900">Pricing</Link>
              <Link href="/login" className="text-slate-600 hover:text-slate-900">Log in</Link>
              <Link href="/signup" className="btn-primary !py-2">Start free</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
