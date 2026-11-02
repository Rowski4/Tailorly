import { NextResponse } from "next/server";
import { ensureDb, databaseUrl } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Reports which configuration is present (booleans only, never values) and whether the database is reachable. */
export async function GET() {
  const env = {
    DATABASE_URL: !!databaseUrl(),
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_MODE: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") ? "live" : process.env.STRIPE_SECRET_KEY ? "test" : null,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    APP_URL: process.env.APP_URL ?? null,
  };
  let database = "ok";
  try {
    await ensureDb();
  } catch (e) {
    database = `error: ${(e as Error).message.slice(0, 200)}`;
  }
  return NextResponse.json({ env, database });
}
