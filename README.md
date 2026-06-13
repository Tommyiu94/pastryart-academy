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

3. **Add Vercel Blob storage**: Storage → Create → Blob. This automatically sets
   `BLOB_READ_WRITE_TOKEN` on your project. With this set, uploaded PDFs are stored in Blob
   instead of the local filesystem.

4. **Set the remaining environment variables** in Project Settings → Environment Variables:
   - `ADMIN_PASSWORD` — a strong password for the admin panel.
   - `SESSION_SECRET` — a long random string (see command above).

5. **Set the build command** to apply pending migrations before building (Project Settings →
   Build & Development Settings → Build Command: `npx prisma migrate deploy && next build`).

6. **Deploy**. Once deployed, visit `/admin/login`, create your intakes (set a password per
   intake), add pastries, and upload lesson and recipe PDFs.

## Notes

- Each intake has one shared password — give it to all students in that batch.
- A student session grants access to that intake's curriculum **and** the shared recipe
  library, so graduates can keep using their login to reference recipes after the course ends.
