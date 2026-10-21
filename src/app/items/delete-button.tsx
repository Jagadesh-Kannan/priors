"use client";

import styles from "../watch-list.module.css";

export function DeleteButton({ name }: { name: string }) {
  return (
    <button
      type="submit"
      className={styles.danger}
      onClick={(e) => {
        if (!confirm(`Remove "${name}" from the watch list?`)) e.preventDefault();
      }}
    >
      Remove from list
    </button>
  );
}
