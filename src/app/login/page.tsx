import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className={styles.main}>
      <h1>Priors</h1>
      <p className={styles.muted}>Household essentials tracker. Invited members only.</p>
      <LoginForm />
    </main>
  );
}
