import { getSessionUser } from "@/lib/auth";
import { householdPrefix, readPhoto } from "@/lib/storage";

export async function GET(_request: Request, ctx: RouteContext<"/photos/[...path]">) {
  const user = await getSessionUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const pathname = (await ctx.params).path.join("/");
  // Members can only see their own household's photos.
  if (!pathname.startsWith(householdPrefix(user.householdId)) || pathname.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const body = await readPhoto(pathname);
  if (!body) return new Response("Not found", { status: 404 });

  return new Response(body, {
    headers: {
      "Content-Type": "image/jpeg",
      // Pathnames are unique per upload, so the browser can keep them.
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
