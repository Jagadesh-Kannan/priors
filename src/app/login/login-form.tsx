"use client";

import { useActionState } from "react";
import { login } from "./actions";
import styles from "../page.module.css";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className={styles.form}>
      <label>
        Email
        {/* React resets the form after each submit; defaultValue keeps the email. */}
        <input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.email}
          required
        />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state?.error && <p className={styles.error}>{state.error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
