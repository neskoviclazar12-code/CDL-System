# SEO / GEO strategy — cdlsystem.com
Status: v1, 2026-11-17. Volumes below come from seodata.dev (Google Ads API data, US) and are **job-seeker keywords, not our buyers**.
B2B keyword volumes (carrier- and recruiter-side) were **not retrieved** — validate in Google Keyword Planner / Ahrefs / Semrush before committing content.

## 1. Two audiences, two keyword worlds
**Do not chase the driver-job head terms.** "cdl a jobs" (40,500/mo, CPC ≈ $5.45), "truck driving jobs" (33,100), "class a cdl jobs" (≈12,100) are owned by Indeed, CDLjobs.com, carrier career sites and job aggregators, and the visitor is a driver — not our customer. CDL System is not a job board.
Our customers search B2B and recruiter-side intents:

| Cluster | Example queries (to validate) | Page |
|---|---|---|
| Carrier: buy recruiting | truck driver recruiting agency · cdl driver recruiting services · outsource driver recruiting · pay per hire truck drivers · third party driver recruiting | `/for-carriers/`, guides |
| Carrier: how-to | how to hire cdl drivers · cost per hire truck driver · reduce driver turnover · driver recruiting strategies 2026 | `/resources/` guides |
| Recruiter: income | independent cdl recruiter · become a truck driver recruiter · 1099 truck driver recruiter · truck driver recruiter commission | `/for-recruiters/`, guides |
| Recruiter: tools | driver recruiting software · cdl recruiting crm · tenstreet alternative · driver recruiting spreadsheet template | `/compare/…`, `/resources/` |
| Compliance/news (GEO + links) | non-domiciled cdl rule · english proficiency trucking · driver qualification file checklist | guides, glossary |

Reference data point (job-seeker side, for context only): seodata.dev — "class a driver jobs" 3,600/mo; "cdl jobs no experience" 12,100; "trucking companies hiring" 1,900 at CPC ≈ $10 (shows how expensive the driver-side auction is).

## 2. Page & content plan (priority order)
1. **Rewrite money pages** (`/`, `/for-carriers/`, `/for-recruiters/`, `/for-agencies/`, `/how-it-works/`): unique titles/descriptions (drafts in `design/COPY.md`), one H1, FAQ + FAQPage schema, internal links between audiences.
2. **Glossary** (`/glossary/`): DQ file, MVR, PSP, CDL Class A, endorsements (H, N, T, X), DOT physical, ELD, OTR/regional/local, owner-operator, lease-purchase, ELP, non-domiciled CDL, recruiter fee/placement, guarantee window. Short definitions with a "term → deeper guide" link. Good for GEO: definitions are what AI answers quote.
3. **Guides** (`/resources/<slug>/`, 1,200–2,000 words each, sourced, dated, with a named reviewer):
   - How much does it cost to hire a CDL driver in 2026? (cost-per-hire formula + ranges — sourced in `MARKET-RESEARCH.md`)
   - Third-party driver recruiting: how the models differ (agency, network, software) — **no CDL System fees, terms or workflow detail**
   - How to become an independent CDL recruiter (what carriers want, commission norms, compliance)
   - Driver qualification file checklist for recruiters
   - What the non-domiciled CDL rule and ELP enforcement mean for your hiring (update quarterly)
   - Spreadsheet vs. recruiting pipeline (`/compare/spreadsheets/`)
4. ~~Calculator~~ — dropped (D10: no pricing/fee surfaces). Keep guides general-industry; never tie them to CDL System's terms.
5. **Programmatic later**: carrier/lane/state pages only with real, consented data — never thin template pages.

## 3. On-page & technical checklist
- Titles ≤ 60 chars with the primary term first; descriptions 120–155 chars; one H1; canonical; hreflang not needed (en-US only).
- Structured data: Organization + WebSite (exists), FAQPage, BreadcrumbList, Article/BlogPosting for guides, `SoftwareApplication` only if there is a public product page with pricing.
- `sitemap.xml` must list every indexable page and carry real `lastmod` (today all 11 pages share 2026-11-07). Submit in Google Search Console and Bing Webmaster; verify the domain.
- `robots.txt` is fine; add `Disallow` for `/demo/thank-you/` if it returns.
- **Core Web Vitals**: 8 CSS files (~146 KB) + 9–10 JS files (~87 KB) load on every page → consolidate/minify (see `docs/ANALYSIS.md`), self-host fonts (currently Google Fonts, blocks render + privacy), preload the hero font, `font-display: swap`, lazy-init the particle canvas after first paint.
- OG image exists (`og-default.png`, 1200×630) — create per-page variants for guides.
- Replace the 11 `noindex` meta-refresh stubs with 301s in `vercel.json`.
- Internal links: every guide links to the relevant audience page with a descriptive anchor; footer + nav carry Resources.

## 4. GEO (generative-engine optimization)
Because AI assistants increasingly answer "which recruiting network / agency should I use", make the site quotable:
- Keep `llms.txt` minimal and accurate (exists; add Resources and glossary; **never** fees or product mechanics — D10).
- Lead each guide with a 40–60-word direct answer; use definition lists, tables with units and sources, dates, and an author/reviewer line.
- State entity facts consistently everywhere: legal name **CDL System LLC**, "CDL Class A", "U.S. trucking", "not a job board", contact details, founding/operating facts `[DECIDE]`.
- Earn third-party mentions: trucking associations, recruiter communities, podcasts, directories; consistent NAP data.

## 5. Measurement
Search Console (queries/pages), GA4 or Plausible with consent mode (nothing installed today), events: `route_click_carrier`, `route_click_recruiter`, `wizard_step`, `form_submit_success`. KPI order: qualified form submissions → carrier vs recruiter split → organic landing-page share → impressions for the B2B clusters.

## 6. Risks
- Over-claiming ("largest", "guaranteed hires") — avoid; carriers' compliance teams read it.
- Thin duplicate pages across carriers/states — avoid until data exists.
- Publishing statistics without sources — every number needs unit, period, source.
