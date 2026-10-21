import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { households, users } from "@/db/schema";
import { getSession } from "./session";

export type User = {
  id: string;
  name: string;
  householdId: string;
  householdName: string;
};

async function findUser(userId: string): Promise<User | undefined> {
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      householdId: users.householdId,
      householdName: households.name,
    })
    .from(users)
    .innerJoin(households, eq(users.householdId, households.id))
    .where(eq(users.id, userId));
  return row;
}

// For pages: cached per browser session, redirects to /login when signed out.
export async function getCurrentUser(): Promise<User> {
  "use cache: private";
  const { userId } = await getSession();
  if (!userId) redirect("/login");
  const user = await findUser(userId);
  if (!user) redirect("/login");
  return user;
}

// For Server Actions and Route Handlers, which must verify the session themselves.
export async function getSessionUser(): Promise<User | null> {
  const { userId } = await getSession();
  if (!userId) return null;
  return (await findUser(userId)) ?? null;
}
