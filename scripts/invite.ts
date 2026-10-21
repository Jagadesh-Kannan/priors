import { randomBytes } from "node:crypto";
import { parseArgs } from "node:util";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { client, db } from "./db";
import { households, users } from "../src/db/schema";

// Usage: npm run invite -- --email you@example.com --name "Your Name" [--household Home] [--password ...]
const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    household: { type: "string", default: "Home" },
    password: { type: "string" },
  },
});

if (!values.email || !values.name) {
  console.error('Usage: npm run invite -- --email you@example.com --name "Your Name" [--household Home]');
  process.exit(1);
}

const email = values.email.trim().toLowerCase();
const password = values.password ?? randomBytes(9).toString("base64url");

// v1 has one shared household: join it by name, or create it on the first invite.
let [household] = await db.select().from(households).where(eq(households.name, values.household));
if (!household) {
  [household] = await db.insert(households).values({ name: values.household }).returning();
}

const passwordHash = await bcrypt.hash(password, 12);
await db
  .insert(users)
  .values({ email, name: values.name, householdId: household.id, passwordHash })
  .onConflictDoUpdate({ target: users.email, set: { name: values.name, passwordHash } });

console.log(`Invited ${email} to "${household.name}".`);
if (!values.password) console.log(`Password: ${password}`);
await client.end();
