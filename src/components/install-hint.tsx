"use client";

import { useSyncExternalStore } from "react";
import styles from "@/app/page.module.css";

const subscribe = () => () => {};

// Safari on iOS has no install prompt, so point people at Share → Add to Home Screen.
export function InstallHint() {
  const show = useSyncExternalStore(
    subscribe,
    () =>
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !window.matchMedia("(display-mode: standalone)").matches,
    () => false,
  );
  if (!show) return null;

  return (
    <p className={styles.hint}>
      Install on this iPhone: tap Share, then <strong>Add to Home Screen</strong>.
    </p>
  );
}
