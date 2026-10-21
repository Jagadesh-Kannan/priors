# Priors

A household essentials tracker. Priors keeps a shared watch list, builds real price history at Costco and Lowe's, and alerts you when it's a good time to buy. It's a PWA hosted on Vercel and installed on iPhones with Add to Home Screen.

**Status:** Phases 0 and 1 are done:
- the installable app, the database schema, and invite-only sign-in for one shared household;
- the shared watch list: add items by typing, keyboard dictation or a photo; set a refill status; and filter by store.

## Stack

- Next.js 16 (App Router, Cache Components), deployed on Vercel
- Postgres (Neon or Supabase) through Drizzle ORM
- Session cookie signed with `jose`, passwords hashed with bcrypt
- Vercel Blob (private) for item, tag and receipt photos, served only to the owning household through `/photos/`

## Setup

1. Create a Postgres database and copy `.env.example` to `.env`, then fill in:
   - `DATABASE_URL`: the database connection string. On Vercel, use the pooled one.
   - `SESSION_SECRET`: generate it with `openssl rand -base64 48`.
   - `BLOB_READ_WRITE_TOKEN`: create a Blob store in Vercel (Storage → Blob) and connect it to the project. In local dev you can leave it unset, and photos are saved to `.uploads/` instead.
2. Install the dependencies and set up the database:

   ```sh
   npm install
   npm run db:migrate   # apply the migrations in drizzle/
   npm run db:seed      # add Costco Tyvola, Costco Matthews, Costco.com and Lowes.com
   ```

3. Invite both members into the same household. There is no public sign-up.

   ```sh
   npm run invite -- --email you@example.com --name "Your Name" --household Home
   npm run invite -- --email partner@example.com --name "Partner" --household Home
   ```

   Each run prints a generated password. You can pass `--password` to set your own. Running it again for an existing email resets that user's password.

4. Start the dev server with `npm run dev`.

## Deploying to Vercel

Import the repo into Vercel, set `DATABASE_URL` and `SESSION_SECRET` in the project's environment variables, and connect a Blob store (that adds `BLOB_READ_WRITE_TOKEN`). Run `npm run db:migrate` against the production database whenever the schema changes.

## Installing on iPhone

Open the deployed URL in Safari, tap **Share**, then **Add to Home Screen**. Web push notifications (Phase 4) only work in the installed app.

## Schema changes

Edit `src/db/schema.ts`, then run `npm run db:generate` to write a new migration to `drizzle/`, and then `npm run db:migrate`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `npm run db:generate` / `db:migrate` | Drizzle Kit migrations |
| `npm run db:seed` | Seed or update the stores (safe to re-run) |
| `npm run invite` | Add or reset a household member |
