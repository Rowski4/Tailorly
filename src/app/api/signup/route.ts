import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureDb, sql } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").toLowerCase().trim();
  const password = String(body?.password ?? "");
  const name = String(body?.name ?? "").trim().slice(0, 100) || null;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 200) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  await ensureDb();
  const hash = await bcrypt.hash(password, 10);
  const rows = (await sql()`INSERT INTO users (email, name, password_hash) VALUES (${email}, ${name}, ${hash})
                            ON CONFLICT (email) DO NOTHING RETURNING id`) as { id: string }[];
  if (rows.length === 0) {
    return NextResponse.json({ error: "An account with that email already exists. Try logging in." }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
