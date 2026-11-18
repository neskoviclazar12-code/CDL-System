# Disclosure policy — what the public site may and may not say
Owner decision 2026-11-17 (D10): don't publish prices, and don't reveal everything CDL System does, to protect against competitors — especially as AI makes copying a product from its public description cheap.

## Reality check (so expectations are right)
Anything public can be read, copied and summarised by people and by AI. `robots.txt` and terms are *advisory/legal*, not technical locks.
The real protection is (1) publishing little, (2) a moat that isn't on a web page: carrier relationships, recruiter network, data, speed, and (3) showing mechanics only in conversation.

## Never publish
- Prices, fees, commissions, payout terms or examples (even "sample" figures), fee-calculators, billing/invoicing mechanics.
- Internal workflow detail: module names, fields, statuses logic beyond the six public stage names, automations, integrations, AI/automation features.
- Real product screens or recordings. Use a stylized illustration labelled *Illustration. Sample data.*
- Carrier names/terms or recruiter identities without written consent.
- Detailed "how we do it" guides, templates, checklists or scripts that are the product (give these to partners).

## Publish (outcome level)
- Who it's for (carriers, recruiters, agencies), what they can rely on (organized submissions, a status and owner for each, carriers decide every hire, Class A only, U.S. only).
- General industry education (market, regulation) that does not describe CDL System's own mechanics.
- A way to talk to us: pricing and mechanics are discussed after a conversation (qualify first, NDA if needed).

## Standard answers
- "What does it cost?" → *Terms are agreed with each partner. Tell us what you need and we'll reply with details.*
- "How do you do X?" → *We'll walk you through it on a call.*

## Technical measures
- `public/robots.txt` disallows AI **training** crawlers (GPTBot, ClaudeBot, anthropic-ai, CCBot, Google-Extended, Applebot-Extended, Bytespider, cohere-ai, Meta-ExternalAgent) and leaves search/answer crawlers allowed, so the company still appears in search and AI answers. Trade-off: if the owner wants *zero* AI visibility, block all and accept lower GEO reach.
- `llms.txt` stays minimal. No `/features/*` pages (they redirect). No public demo; a live demo is gated behind a request.
- Add to `terms-of-service` a clause against scraping/copying/reverse-engineering and a copyright/trademark notice — **have a lawyer draft it** (not legal advice from this repo).
- Product itself (app.cdlsystem.com or similar) stays behind login; never indexable (`noindex`, auth).
- Consider trademark registration for "CDL System" and the symbol (lawyer), and keep brand assets in the repo licensed/"all rights reserved".

## Open questions
- Is the GIF's dashboard window acceptable as a *stylized* board (recommended), or remove it?
- Block all AI crawlers (max protection, lower AI visibility) or training-only (current)?
