import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserById, type UserRow } from "./db";

/** Current user from the database, or null if signed out. */
export async function currentUser(): Promise<UserRow | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return getUserById(id);
}

export async function requireUser(): Promise<UserRow> {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
