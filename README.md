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

The Gallery section is public. Sign in through the **Owner access** link in the footer to upload or remove projects. Each project can contain up to seven JPEG, PNG, or WebP images (up to 8 MB each, 56 MB combined). Uploaded images and gallery metadata are stored in the server's `storage/` directory, which is excluded from source control.

Deployments must provide a persistent writable disk for `storage/`; ephemeral server filesystems will lose uploaded photos when the instance is replaced.
