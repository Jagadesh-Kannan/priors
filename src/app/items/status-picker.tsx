"use client";

import { useOptimistic, useTransition } from "react";
import { REFILL_STATUS_OPTIONS, type RefillStatus } from "@/lib/refill-status";
import { setRefillStatus } from "./actions";
import styles from "../watch-list.module.css";

export function StatusPicker({ itemId, status }: { itemId: string; status: RefillStatus }) {
  const [optimistic, setOptimistic] = useOptimistic(status);
  const [, startTransition] = useTransition();

  return (
    <div className={styles.status} role="radiogroup" aria-label="Refill status">
      {REFILL_STATUS_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={optimistic === value}
          data-status={value}
          onClick={() =>
            startTransition(async () => {
              setOptimistic(value);
              await setRefillStatus(itemId, value);
            })
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
