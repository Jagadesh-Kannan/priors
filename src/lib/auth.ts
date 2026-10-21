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

export async function getCurrentUser(): Promise<User> {
  "use cache: private";
  const { userId } = await getSession();
  if (!userId) redirect("/login");

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

  if (!row) redirect("/login");
  return row;
}
