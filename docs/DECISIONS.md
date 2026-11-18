# Decision log (ADR-lite)
Newest last. Format: decision · why · consequences · status.

**D1 — Keep the site static (HTML/CSS/vanilla JS), no framework** · The baseline is already static, 11 pages, deploys to Vercel with zero build; a framework adds nothing for launch. · Shared header/footer are duplicated until a generator is introduced (see ARCHITECTURE § Future). · Accepted 2026-11-17.

**D2 — Target look = the light/red design in the owner's GIF; retire the dark theme** · The owner said "use the environment as in the GIF" and supplied a light hero with a red header and red dotted wave. The zip's `dark.css` re-colours everything dark and is loaded last. · Plan: stop loading `dark.css`, move it to `archive/`, fix leftover colour overrides in `hero-particles.js` (`GRAPHITE '#FFFFFF'`), `particle-logo.js`, `stage.css`, `theme-color`, manifest. **Assumption — confirm with owner** if a dark variant is still wanted (it can return later as a separate role mapping, not an inversion). · Proposed (not yet applied to code).

**D3 — Vercel config** · `outputDirectory: public`, `trailingSlash: true`, long-cache for `/assets/*`, basic security headers, 301s for `/privacy` and `/terms`. · No build step. · Applied.

**D4 — English (US) site** · Audience is U.S. carriers and recruiters. Docs and code comments are English so any agent can continue; chat with the owner is in Serbian. · Applied.

**D5 — Feature pages stay redirects until real content exists** · 9 `/features/*` URLs redirect to home/carriers. Promoting them as thin pages would hurt SEO. Promote 3–4 (lead management, application tracking, follow-ups, billing) after copy + screenshots exist. · Proposed.

**D6 — Derived "action red" for buttons/links** · Brand Firebrick `#F62817` is 4.0:1 against white — fails 4.5:1 for small text and white button labels. Use a derived deeper red (candidate `#C22114`, 5.96:1) for interactive elements; keep Firebrick for logo, dots and large display. · Values must be verified in browser and frozen in `site.css` tokens. · Proposed.

**D7 — No fabricated proof** · No logos, quotes, or statistics without real sources. Proof section is "undecided" until the owner supplies real customers/numbers; sourced industry context is optional. · Applied in `design/COPY.md`.

**D8 — Direction chosen by external roll + pinned by brief** · `roll.py` returned candidate #1 of 6 (halftone wave → symbol + product-as-hero), which is also what the GIF pins. · Applied.

**D9 — GitHub push blocked in build environment** · Invalid token; repo prepared locally. · Owner/next agent pushes per `docs/DEPLOYMENT.md`. · Open.

**D10 — Disclosure policy: no prices, no full product disclosure** · Owner decision 2026-11-17: do not publish prices/fees/commissions and do not reveal everything CDL System does, to reduce copying by competitors as AI lowers the cost of cloning. · Public site states outcomes, not mechanics; stylized board instead of real UI; no feature pages; fee/payout questions answered with "agreed per partner"; AI training crawlers disallowed in `robots.txt`; mechanics shown on a live call. Details in `docs/DISCLOSURE-POLICY.md`. · Applied to docs + robots.txt; **live pages still need trimming** (see HANDOFF). · Accepted.

**D11 — Light/red theme built; app-screen section kept** · 2026-11-17 · The owner approved the GIF look (white page, red header, wave-to-symbol hero, two routing cards) and asked to keep the "whole pipeline in one screen" section. `dark.css` is retired (replaced by `light.css`). The pipeline window is a stylised sample (statuses and counts, no fee/price panel, labelled "Illustration. Sample data."). The pinned dark Route/My Day walkthroughs were removed from the home page and un-pinned elsewhere (`data-walk` dropped). The carrier path (home card -> `/for-carriers/#request`) embeds the 9-step FMCSA form; `/hire-drivers/` carries the same form. Recruiter path unchanged. · Accepted.
