"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { watchListItems, watchListItemStores } from "@/db/schema";
import { getSessionUser, type User } from "@/lib/auth";
import { deletePhoto, MAX_PHOTO_BYTES, savePhoto } from "@/lib/storage";
import { REFILL_STATUSES, type RefillStatus } from "@/lib/refill-status";
import { getShoppableStores } from "@/lib/watch-list";

export type ItemFormState = { error?: string; savedAt?: number } | undefined;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_NAME = 120;

async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

async function parseItemForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, MAX_NAME);
  const photo = formData.get("photo");
  const hasPhoto = photo instanceof File && photo.size > 0;
  if (hasPhoto && (photo.size > MAX_PHOTO_BYTES || !photo.type.startsWith("image/"))) {
    return { error: "That photo couldn't be used. Try another one." } as const;
  }

  const wanted = new Set(formData.getAll("store").map(String));
  const storeIds = (await getShoppableStores()).filter((s) => wanted.has(s.slug)).map((s) => s.id);
  if (storeIds.length === 0) return { error: "Pick at least one store." } as const;

  return { name, photo: hasPhoto ? photo : null, storeIds } as const;
}

export async function addItem(_prev: ItemFormState, formData: FormData): Promise<ItemFormState> {
  const user = await requireUser();
  const parsed = await parseItemForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  if (!parsed.name && !parsed.photo) return { error: "Type a name or add a photo." };

  const photoPath = parsed.photo ? await savePhoto(user.householdId, "items", parsed.photo) : null;
  await db.transaction(async (tx) => {
    const [item] = await tx
      .insert(watchListItems)
      .values({
        householdId: user.householdId,
        // A photo-only item gets a placeholder name to rename later.
        name: parsed.name || "Photo item",
        photoPath,
        addedBy: user.id,
      })
      .returning({ id: watchListItems.id });
    await tx
      .insert(watchListItemStores)
      .values(parsed.storeIds.map((storeId) => ({ itemId: item.id, storeId })));
  });

  refresh();
  return { savedAt: Date.now() };
}

async function findOwnItem(user: User, itemId: string) {
  if (!UUID.test(itemId)) return null;
  const [item] = await db
    .select({ id: watchListItems.id, photoPath: watchListItems.photoPath })
    .from(watchListItems)
    .where(and(eq(watchListItems.id, itemId), eq(watchListItems.householdId, user.householdId)));
  return item ?? null;
}

export async function setRefillStatus(itemId: string, status: RefillStatus) {
  const user = await requireUser();
  if (!REFILL_STATUSES.includes(status)) return;
  const item = await findOwnItem(user, itemId);
  if (!item) return;

  await db
    .update(watchListItems)
    .set({ refillStatus: status, updatedAt: new Date() })
    .where(eq(watchListItems.id, item.id));
  refresh();
}

export async function updateItem(
  itemId: string,
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const user = await requireUser();
  const item = await findOwnItem(user, itemId);
  if (!item) redirect("/");

  const parsed = await parseItemForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  if (!parsed.name) return { error: "Give the item a name." };

  const removePhoto = formData.get("removePhoto") === "on";
  let photoPath = item.photoPath;
  if (parsed.photo) photoPath = await savePhoto(user.householdId, "items", parsed.photo);
  else if (removePhoto) photoPath = null;

  await db.transaction(async (tx) => {
    await tx
      .update(watchListItems)
      .set({ name: parsed.name, photoPath, updatedAt: new Date() })
      .where(eq(watchListItems.id, item.id));
    await tx.delete(watchListItemStores).where(eq(watchListItemStores.itemId, item.id));
    await tx
      .insert(watchListItemStores)
      .values(parsed.storeIds.map((storeId) => ({ itemId: item.id, storeId })));
  });
  if (item.photoPath && item.photoPath !== photoPath) await deletePhoto(item.photoPath);

  redirect("/");
}

export async function deleteItem(itemId: string) {
  const user = await requireUser();
  const item = await findOwnItem(user, itemId);
  if (item) {
    await db.delete(watchListItems).where(eq(watchListItems.id, item.id));
    if (item.photoPath) await deletePhoto(item.photoPath);
  }
  redirect("/");
}
