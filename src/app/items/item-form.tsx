"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { resizeImage } from "@/lib/resize-image";
import type { ShoppableStore } from "@/lib/watch-list";
import type { ItemFormState } from "./actions";
import styles from "../watch-list.module.css";

type Props = {
  action: (prev: ItemFormState, formData: FormData) => Promise<ItemFormState>;
  stores: ShoppableStore[];
  defaultName?: string;
  defaultStoreSlugs: string[];
  photoPath?: string | null;
  submitLabel: string;
};

export function ItemForm(props: Props) {
  const [state, formAction] = useActionState(props.action, undefined);

  async function submit(formData: FormData) {
    const photo = formData.get("photo");
    if (photo instanceof File && photo.size > 0) {
      try {
        formData.set("photo", await resizeImage(photo));
      } catch {
        // Let the server reject it with a friendly message.
      }
    }
    formAction(formData);
  }

  // Remount after each successful save so the form and photo preview start fresh.
  return (
    <form key={state?.savedAt} action={submit} className={styles.itemForm}>
      <ItemFields {...props} />
      {state?.error && <p className={styles.error}>{state.error}</p>}
      <SubmitButton label={props.submitLabel} />
    </form>
  );
}

function ItemFields({ stores, defaultName, defaultStoreSlugs, photoPath }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <>
      <input
        name="name"
        defaultValue={defaultName}
        placeholder="Type or dictate an item"
        aria-label="Item name"
        autoComplete="off"
        enterKeyHint="done"
        maxLength={120}
      />
      <fieldset className={styles.storePicker}>
        <legend>Buy at</legend>
        {stores.map((s) => (
          <label key={s.slug}>
            <input
              type="checkbox"
              name="store"
              value={s.slug}
              defaultChecked={defaultStoreSlugs.includes(s.slug)}
            />
            {s.label}
          </label>
        ))}
      </fieldset>
      <div className={styles.photoRow}>
        {(preview ?? photoPath) && (
          // eslint-disable-next-line @next/next/no-img-element -- local preview / auth-gated photo
          <img src={preview ?? `/photos/${photoPath}`} alt="" className={styles.thumb} />
        )}
        <label className={styles.photoButton}>
          {photoPath || preview ? "Change photo" : "Add photo"}
          <input
            type="file"
            name="photo"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
        </label>
        {photoPath && !preview && (
          <label className={styles.inline}>
            <input type="checkbox" name="removePhoto" /> Remove
          </label>
        )}
      </div>
    </>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}
