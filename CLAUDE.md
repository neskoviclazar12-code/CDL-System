# CLAUDE.md — cdlsystem.com marketing site

You are continuing work on the public website of **CDL System** (CDL System LLC), a U.S. CDL Class A driver-recruiting network that connects
trucking carriers with independent recruiters and recruiting agencies. The site is static (HTML/CSS/vanilla JS), hosted on **Vercel** from **GitHub**.
Owner: Lazar Neskovic ("Mike" in the recruiting business). Chat with the owner in **Serbian**; code, docs and site copy in **English (US)**.

## Read in this order
1. `docs/HANDOFF.md` — what is done, what is next, open questions (start here)
2. `design/design-plan.md` — the design contract (direction, colour roles, type, layout, signature, motion)
3. `design/COPY.md`, `design/SITE-STRUCTURE.md`, `design/ANIMATION-SPEC.md`
4. `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/ANALYSIS.md`, `docs/DEPLOYMENT.md`
5. `research/MARKET-RESEARCH.md`, `research/SEO-STRATEGY.md`

## Commands
```bash
npm run dev     # preview public/ on :3000
npm run check   # must print "0 problem(s)" before any push
```
No build step. Deploy = push to `main` (Vercel). Output directory is `public/`.

## Non-negotiables
- **Positioning**: a recruiting *network*, "Not a job board. Carriers make every hiring decision." Never imply CDL System screens, employs or hires drivers; never promise outcomes or guarantees without `[DECIDE]` being resolved.
- **Disclosure policy (D10)**: never publish prices, fees, commission or payout figures/terms, billing mechanics, internal workflow/field names, automation/AI details, or real product screens. Read `docs/DISCLOSURE-POLICY.md` before writing any copy or visual.
- **Look (built 2026-11-17)**: white page, red header, red action buttons, red halftone wave that forms the CDL symbol. Source of truth: `assets/css/light.css`. Do not reintroduce `dark.css`.
- **No fabricated proof**: no invented customers, logos, quotes or statistics. Every number needs unit + period + source. Label demo data "Sample data".
- **Look**: light page, red brand, halftone-wave signature per `design/reference-hero-wave.gif`. Dark theme (`dark.css`) is being retired (D2).
- **Colour**: use tokens from `public/assets/css/site.css`. Brand Firebrick `#F62817` fails 4.5:1 on white — buttons/links use the derived action red (D6). No gradient text, glass, glows, icon-card triplets, or banned copy words (see COPY.md).
- **Accessibility**: one `<h1>` per page, visible focus, 4.5:1 body contrast, content visible without JS, `prefers-reduced-motion` honoured (substitute, don't just disable).
- **Motion**: obey `design/design-plan.md` § Motion and `ANIMATION-SPEC.md`; one orchestrated moment (hero), reveal once and never re-hide.
- **SMS**: nothing may text drivers without recorded consent; keep `/sms-terms/` accurate.
- Do not commit secrets (`.env*`, webhook URLs with tokens). Lead endpoint URLs go in Vercel env vars.

## Working agreements
- Use the **bol-design** plugin for design decisions (agent `bol-design:design-director`; skills `design-direction`, `page-composition`, `section-patterns`, `typography`, `color-system`, `surface-depth`, `interaction-states`, `motion-language`, `transitions`, `design-critique`, `anti-generic`). Write decisions back into `design/design-plan.md`; do not let code drift from the plan.
- Build fully, review once (design-critique, batched), fix once, stop.
- Small conventional commits (`feat:`/`fix:`/`docs:`/`chore:`); separate commits for theme, layout, animation, copy.
- When you finish a session: update `docs/HANDOFF.md` (done / next / open questions) and `docs/DECISIONS.md` for any new decision.
- Verify visually at 375 / 768 / 1280 px and with reduced motion before calling anything done; say what you could not verify.

## Business context you may need (do not publish)
Nexus Driver Solutions (the owner's recruiting agency) is a separate business; CDL System is the owner's 100%-owned software/network company with its own carrier deals. Keep the two brands separate on this site.
