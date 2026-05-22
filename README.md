# Tripp

Next.js travel planning website.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Push `main` to GitHub and connect the repo to Vercel.

## Deploy to GitHub Pages (static-only)

This project uses Next.js with server routes and Supabase integrations, which are not supported on GitHub Pages. You can export a static-only version of the site, but server-side features (API routes, auth callbacks, Supabase server helpers, etc.) will not work.

To publish a static export to GitHub Pages (best-effort):

1. The repository contains an Action that runs on `push` to `main` and will attempt to build and export the site and publish the `out/` folder to the `gh-pages` branch.

2. Commit and push changes to `main` — GitHub Actions will run `npm run export` and deploy `out/` to `gh-pages`.

3. In the repository Settings → Pages, set the Source to the `gh-pages` branch and the site will be served at `https://<your-username>.github.io/<repo>`.

Notes:
- If your site uses dynamic server features, consider migrating those features to client-only calls or hosting on Vercel for full support.
- Review the Action logs (Actions tab) after the first push to see if `next export` succeeded. If it fails, you'll need to remove or adapt server-dependent code.