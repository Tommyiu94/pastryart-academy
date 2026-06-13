# Bakery Academy Portal

A small web app for the academy's students and admins:

- **Students** log in with a shared password for their intake (batch) and can view/download
  their theory curriculum PDFs, organized by pastry, plus a shared recipe library.
- **Admins** log in with a single admin password and manage intakes, pastries, lessons (PDF
  uploads), and the recipe library.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your own values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — a Postgres connection string. For local dev, copy the value from your
     Vercel project's `DATABASE_URL` env var (Settings → Environment Variables), or point at
     your own local/dev Postgres instance.
   - `ADMIN_PASSWORD` — the password used to access `/admin`.
   - `SESSION_SECRET` — a long random string used to sign session cookies. Generate one with:

     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

   - `BLOB_READ_WRITE_TOKEN` — leave unset for local dev (PDFs are saved to `public/uploads`).

3. Apply database migrations:

   ```bash
   npx prisma migrate dev --name init
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000`:
   - `/admin/login` — sign in with `ADMIN_PASSWORD` to create intakes, pastries, lessons,
     and recipes.
   - `/login` — sign in with an intake's shared password to view its curriculum and the
     recipe library.

## Deploying to Vercel (free tier)

The app needs a persistent database and persistent file storage in production — the local
filesystem doesn't survive on Vercel's serverless infrastructure, so we use Postgres (e.g.
Neon, via the Vercel integration) and Vercel Blob.

1. **Push this repo to GitHub**, then import it into [Vercel](https://vercel.com/new).

2. **Add a Postgres database**: in the Vercel project, go to Storage → Create Database →
   choose the Neon (Postgres) integration, with environment variable prefix `DATABASE` so it
   sets `DATABASE_URL` on your project.

3. **Add Vercel Blob storage**: Storage → Create → Blob, then connect it to this project.
   With Blob connected, uploaded PDFs are stored in Blob instead of the local filesystem.

   - If your Blob store was connected via `BLOB_STORE_ID` (OIDC auth) rather than a
     `BLOB_READ_WRITE_TOKEN`, also add a `BLOB_READ_WRITE_TOKEN` env var (find it on the
     Blob store's page in Vercel, under its `.env.local`/Quickstart tab). This token is
     required so the browser can upload large PDFs **directly** to Blob, bypassing the
     ~4.5MB request body limit on serverless functions. Without it, uploads larger than
     that limit will fail.

4. **Set the remaining environment variables** in Project Settings → Environment Variables:
   - `ADMIN_PASSWORD` — a strong password for the admin panel.
   - `SESSION_SECRET` — a long random string (see command above).

5. **Set the build command** to apply pending migrations before building (Project Settings →
   Build & Development Settings → Build Command: `npx prisma migrate deploy && next build`).

6. **Deploy**. Once deployed, visit `/admin/login`, create your intakes (set a password per
   intake), add pastries, and upload lesson and recipe PDFs.

## Subdomain layout

The app serves two audiences on two subdomains of the same Vercel project:

- `learn.pastryart-academy.com` — student portal (`/login`, `/curriculum`, `/recipes`). The
  `/admin` and `/api/admin` routes return 404 here.
- `admin.pastryart-academy.com` — admin panel. Visiting `/` redirects to `/admin`, and all
  non-admin routes return 404 here.

To set this up:

1. In the Vercel project, go to Settings → Domains and add `admin.pastryart-academy.com` (in
   addition to `learn.pastryart-academy.com`).
2. At Porkbun, add a CNAME record for `admin` pointing at the same target Vercel gives you for
   `learn` (typically `cname.vercel-dns.com`).
3. Wait for DNS to propagate and Vercel to issue the certificate, then visit
   `https://admin.pastryart-academy.com/admin/login`.

Other hostnames (localhost, Vercel preview URLs, etc.) are unaffected and can reach both the
student and admin routes as before.

## Notes

- Each intake has one shared password — give it to all students in that batch.
- A student session grants access to that intake's curriculum **and** the shared recipe
  library, so graduates can keep using their login to reference recipes after the course ends.
