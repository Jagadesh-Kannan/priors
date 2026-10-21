import { Suspense } from "react";
import { InstallHint } from "@/components/install-hint";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "./login/actions";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>Priors</h1>
      <Suspense fallback={<p className={styles.muted}>Loading…</p>}>
        <Household />
      </Suspense>
      <InstallHint />
    </main>
  );
}

async function Household() {
  const user = await getCurrentUser();
  return (
    <>
      <p>
        Signed in as <strong>{user.name}</strong> · {user.householdName}
      </p>
      <p className={styles.muted}>The shared watch list arrives in Phase 1.</p>
      <form action={logout}>
        <button type="submit" className={styles.secondary}>
          Sign out
        </button>
      </form>
    </>
  );
}
