import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

/** Neon's Vercel integration may use a custom prefix (e.g. STORAGE_DATABASE_URL), so accept those too. */
export function databaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL;
  const key = Object.keys(process.env).find((k) => k.endsWith("_DATABASE_URL") || k.endsWith("_POSTGRES_URL"));
  return key ? process.env[key] : undefined;
}

let _sql: ReturnType<typeof neon> | null = null;

export function sql() {
  if (!_sql) {
    const url = databaseUrl();
    if (!url) throw new Error("DATABASE_URL is not set");
    _sql = neon(url);
  }
  return _sql;
}

export const DEMO_EMAIL = "demo@demo.com";
const DEMO_PASSWORD = "password123!";

let ready: Promise<void> | null = null;

/** Creates tables if missing and seeds the demo account. Runs once per server instance. */
export function ensureDb(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const q = sql();
      await q`CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text UNIQUE NOT NULL,
        name text,
        password_hash text NOT NULL,
        plan text NOT NULL DEFAULT 'free',
        stripe_customer_id text,
        stripe_subscription_id text,
        subscription_status text,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await q`CREATE TABLE IF NOT EXISTS tailorings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_title text,
        company text,
        resume text NOT NULL,
        job_posting text NOT NULL,
        result jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await q`CREATE INDEX IF NOT EXISTS tailorings_user_idx ON tailorings(user_id, created_at DESC)`;
      const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
      await q`INSERT INTO users (email, name, password_hash, plan, subscription_status)
              VALUES (${DEMO_EMAIL}, 'Demo User', ${hash}, 'pro', 'demo')
              ON CONFLICT (email) DO NOTHING`;
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  password_hash: string;
  plan: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  created_at: string;
}

export async function getUserById(id: string): Promise<UserRow | null> {
  await ensureDb();
  const rows = (await sql()`SELECT * FROM users WHERE id = ${id}`) as UserRow[];
  return rows[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  await ensureDb();
  const rows = (await sql()`SELECT * FROM users WHERE email = ${email.toLowerCase().trim()}`) as UserRow[];
  return rows[0] ?? null;
}
