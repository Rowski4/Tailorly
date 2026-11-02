import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Header } from "@/components/Header";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tailorly — Tailor your resume and cover letter to any job in 60 seconds",
  description:
    "Paste your resume and a job posting. Tailorly's AI rewrites your bullets to match, drafts a specific cover letter, and shows the keywords you're missing.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500 flex flex-col sm:flex-row gap-3 justify-between">
            <p>© {new Date().getFullYear()} Tailorly. Built for job seekers.</p>
            <nav className="flex gap-5">
              <Link href="/#pricing" className="hover:text-slate-900">Pricing</Link>
              <Link href="/terms" className="hover:text-slate-900">Terms</Link>
              <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
              {process.env.CONTACT_EMAIL && (
                <a href={`mailto:${process.env.CONTACT_EMAIL}`} className="hover:text-slate-900">Contact</a>
              )}
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
