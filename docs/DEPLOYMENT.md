# Deployment: GitHub → Vercel → cdlsystem.com
Status 2026-11-17: **repo initialised locally (branch `main`, 2 commits); NOT pushed.** The GitHub token available in the build environment was invalid (`gh auth status` → token invalid) and no existing CDL repo was visible, so nothing could be created or pushed from here.

## 1. Push to GitHub (owner or any agent with a valid token)
```bash
cd cdl-system-site
gh auth login                      # or set a valid GH_TOKEN
gh repo create <org>/cdl-system-site --private --source=. --remote=origin --push
```
(or create an empty repo in the GitHub UI, then `git remote add origin … && git push -u origin main`).
Recommended: protect `main`, require the `npm run check` status (add a GitHub Action later), work in feature branches → PR → Vercel preview.

## 2. Vercel
1. Vercel → Add New Project → import the GitHub repo.
2. Framework Preset: **Other**. Build Command: *(empty)*. Output Directory: **public** (also set in `vercel.json`). Install Command: *(empty)*.
3. Deploy → check the `*.vercel.app` URL.
4. Domains: add `cdlsystem.com` and `www.cdlsystem.com` (redirect www → apex or vice-versa; canonical in the pages is **`https://cdlsystem.com/`**). Set DNS at the registrar: apex `A 76.76.21.21`, `www CNAME cname.vercel-dns.com` (confirm current values in Vercel's domain screen).
5. Environment variables (when forms are wired): `LEAD_WEBHOOK_URL` (if using a serverless function). A client-side direct webhook needs none but exposes the URL.

## 3. Pre-launch checklist
- [ ] Forms post to a real endpoint and a test lead arrives; success + error states exist
- [ ] Analytics + consent live; events firing
- [ ] `npm run check` = 0 problems; Lighthouse mobile ≥ 90 (Perf), ≥ 95 (SEO/A11y/Best Practices)
- [ ] `sitemap.xml` correct `lastmod`; submitted to Search Console + Bing
- [ ] 301s for removed stub URLs; custom 404 renders
- [ ] `theme-color`, manifest, OG image match the light theme
- [ ] Legal pages reviewed (privacy, terms, SMS terms, cookies)
- [ ] Reduced-motion and no-JS views checked
- [ ] Email deliverability for `info@cdlsystem.com` (SPF/DKIM/DMARC on the cdlsystem.com Google Workspace)

## 4. Rollback
Vercel → Deployments → promote the previous deployment (instant). Git: `git revert <sha>` and push.
