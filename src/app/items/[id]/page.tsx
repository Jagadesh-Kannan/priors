import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getShoppableStores, getWatchListItem } from "@/lib/watch-list";
import { deleteItem, updateItem } from "../actions";
import { DeleteButton } from "../delete-button";
import { ItemForm } from "../item-form";
import styles from "../../watch-list.module.css";

export const metadata: Metadata = { title: "Edit item" };

export default function EditItemPage({ params }: PageProps<"/items/[id]">) {
  return (
    <main className={styles.main}>
      <Link href="/" className={styles.back}>
        ← Watch list
      </Link>
      <Suspense fallback={<p className={styles.muted}>Loading…</p>}>
        <EditItem params={params} />
      </Suspense>
    </main>
  );
}

async function EditItem({ params }: Pick<PageProps<"/items/[id]">, "params">) {
  const user = await getCurrentUser();
  const { id } = await params;
  const [item, stores] = await Promise.all([
    getWatchListItem(user.householdId, id),
    getShoppableStores(),
  ]);
  if (!item) notFound();

  return (
    <>
      <h1>{item.name}</h1>
      {item.addedByName && <p className={styles.muted}>Added by {item.addedByName}</p>}
      <ItemForm
        action={updateItem.bind(null, item.id)}
        stores={stores}
        defaultName={item.name}
        defaultStoreSlugs={item.storeSlugs}
        photoPath={item.photoPath}
        submitLabel="Save"
      />
      <form action={deleteItem.bind(null, item.id)}>
        <DeleteButton name={item.name} />
      </form>
    </>
  );
}
