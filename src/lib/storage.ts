import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, put } from "@vercel/blob";

// Photos are private: they are stored by pathname and served through /photos/,
// which checks the viewer's household. Without a Blob token (local dev) they go to .uploads/.
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const LOCAL_DIR = path.join(process.cwd(), ".uploads");

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export function householdPrefix(householdId: string) {
  return `households/${householdId}/`;
}

export async function savePhoto(householdId: string, kind: string, photo: Blob) {
  const pathname = `${householdPrefix(householdId)}${kind}/${randomUUID()}.jpg`;
  if (useBlob) {
    await put(pathname, photo, { access: "private", contentType: "image/jpeg" });
  } else {
    if (process.env.VERCEL) throw new Error("Set BLOB_READ_WRITE_TOKEN to store photos");
    const file = path.join(LOCAL_DIR, pathname);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, Buffer.from(await photo.arrayBuffer()));
  }
  return pathname;
}

export async function readPhoto(pathname: string): Promise<BodyInit | null> {
  if (useBlob) {
    const result = await get(pathname, { access: "private" });
    return result?.stream ?? null;
  }
  const file = path.join(LOCAL_DIR, pathname);
  if (!file.startsWith(LOCAL_DIR + path.sep)) return null;
  try {
    return new Uint8Array(await readFile(file));
  } catch {
    return null;
  }
}

export async function deletePhoto(pathname: string) {
  if (useBlob) {
    await del(pathname);
  } else {
    await rm(path.join(LOCAL_DIR, pathname), { force: true });
  }
}
