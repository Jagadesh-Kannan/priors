import Link from "next/link";
import { Suspense } from "react";
import { InstallHint } from "@/components/install-hint";
import { RefreshWhenVisible } from "@/components/refresh-when-visible";
import { getCurrentUser } from "@/lib/auth";
import { getShoppableStores, getWatchList } from "@/lib/watch-list";
import { addItem } from "./items/actions";
import { ItemForm } from "./items/item-form";
import { StatusPicker } from "./items/status-picker";
import { logout } from "./login/actions";
import styles from "./watch-list.module.css";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className={styles.main}>
      <h1>Watch list</h1>
      <Suspense fallback={<p className={styles.muted}>Loading…</p>}>
        <WatchList searchParams={searchParams} />
      </Suspense>
      <InstallHint />
    </main>
  );
}

async function WatchList({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const user = await getCurrentUser();
  const stores = await getShoppableStores();
  const { store } = await searchParams;
  const active = stores.find((s) => s.slug === store);
  const items = await getWatchList(user.householdId, active?.slug);
  const labels = new Map(stores.map((s) => [s.slug, s.label]));

  // New items default to the store being viewed, or every Costco warehouse.
  const defaultStores = active
    ? [active.slug]
    : stores.filter((s) => s.chain === "costco").map((s) => s.slug);

  return (
    <>
      <nav className={styles.filters} aria-label="Filter by store">
        <Link href="/" aria-current={active ? undefined : "page"}>
          All
        </Link>
        {stores.map((s) => (
          <Link
            key={s.slug}
            href={`/?store=${s.slug}`}
            aria-current={active?.slug === s.slug ? "page" : undefined}
          >
            {s.label}
          </Link>
        ))}
      </nav>

      <details className={styles.add}>
        <summary>Add item</summary>
        <ItemForm
          action={addItem}
          stores={stores}
          defaultStoreSlugs={defaultStores}
          submitLabel="Add to list"
        />
      </details>

      {items.length === 0 ? (
        <p className={styles.muted}>
          {active ? `Nothing on the list for ${active.label} yet.` : "Nothing on the list yet."}
        </p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <Link href={`/items/${item.id}`} className={styles.itemMain}>
                {item.photoPath ? (
                  // eslint-disable-next-line @next/next/no-img-element -- auth-gated photo route
                  <img src={`/photos/${item.photoPath}`} alt="" className={styles.thumb} />
                ) : (
                  <span className={styles.thumb} aria-hidden />
                )}
                <span>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.meta}>
                    {item.storeSlugs.map((slug) => labels.get(slug)).join(" · ")}
                  </span>
                </span>
              </Link>
              <StatusPicker itemId={item.id} status={item.refillStatus} />
            </li>
          ))}
        </ul>
      )}

      <footer className={styles.footer}>
        <span>
          {user.name} · {user.householdName}
        </span>
        <form action={logout}>
          <button type="submit" className={styles.link}>
            Sign out
          </button>
        </form>
      </footer>
      <RefreshWhenVisible />
    </>
  );
}
