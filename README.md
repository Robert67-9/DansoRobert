<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e19623d9-8893-4e57-a4ae-be26c211e516

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set `OWNER_PASSCODE` to a unique secret of at least 12 characters. Set `GEMINI_API_KEY` if you want to use the AI features.
3. Run the app:
   `npm run dev`

## Work Photo Gallery

The Gallery section is public. Sign in through the **Owner access** link in the footer to upload or remove projects. Each project can contain up to seven JPEG, PNG, or WebP images (up to 8 MB each, 56 MB combined).

When Supabase env vars (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`) are set, projects and images are stored in Supabase PostgreSQL + the public `work-gallery` Storage bucket (see `supabase/migrations/`). Without them, the server falls back to the local `storage/` directory (excluded from source control, dev only).

## Resume / Certificates Unlock ($0.50)

Visitors unlock the CV + certificates vault via `/api/payments/resume-unlock`. Set `PAYMENT_GATEWAY_SECRET` to any non-empty secret to enable it. Owners bypass the paywall automatically once logged in with `OWNER_PASSCODE`.

## Deploy on Vercel

1. Push this repo and import it in Vercel.
2. Set env vars: `OWNER_PASSCODE` (min 12 chars), `PAYMENT_GATEWAY_SECRET`, `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_URL`.
3. Apply the migrations in `supabase/migrations/` to your Supabase project (linked project: `DansoRobert`).
4. Deploy — `/api/*` is served by `api/index.ts` (see `vercel.json`).
