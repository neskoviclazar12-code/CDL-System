# Design plan — cdlsystem.com
Last updated: 2026-11-17
Produced with the `bol-design` plugin (design-direction, section-patterns, color-system, typography, motion-language, anti-generic).
Precedence: brief (the GIF + user message) > brand tokens in `public/assets/css/site.css` > this plan > craft skills > defaults.
There is no `brand/design.md`; the only brand source is `site.css` tokens and the logo SVGs in `public/assets/brand/logo/`.

## Subject
CDL System — a U.S. CDL Class A recruiting network that connects trucking carriers with independent recruiters and
recruiting agencies. Every submission has a status, every follow-up has an owner, every hiring decision stays with the carrier.
Audiences: (1) carriers / carrier recruiting managers, (2) independent CDL recruiters, (3) recruiting agencies.
The page's single job: make a carrier or a recruiter pick their side and start (Partner as a Carrier / Apply as a Recruiter).

## Intent mode
**Persuade** — landing site; the visitor decides and acts. (The product window inside it is a demonstration, not an app surface.)

## Register
**Standard marketing with a product-as-hero.** Space-to-ink 0.60, 8–12 elements per viewport, display ÷ body ≈ 3.5×,
section padding ≈ 0.07 of container, 3–4 distinct hues (red ramp, warm neutral, graphite, one status hue).
Because the GIF hero is dense on the left (copy + two routing cards) and open on the right (the wave field); that asymmetry is the register.

## Direction (assigned by roll)
Roll: `roll.py --slug cdl-system-site --count 6 --register plain` → **candidate #1** (1-based), which is also the direction the brief pins
(the GIF). Candidate list, ranked before the roll:
1. **Halftone wave that resolves into the symbol + product-as-hero** ← assigned and pinned by the GIF
2. Type-only manifesto: "Nothing falls through." with a live status ticker
3. Live demo: a draggable pipeline board in the hero
4. Diagram hero: the carrier ↔ recruiter network as a graph
5. Editorial split with documentary road photography
6. Index/search-first hero (search bar as the hero)

## Colour (roles; values from `site.css` unless marked derived)
| Role | Job | Source |
|---|---|---|
| **Ground** | the page; white with a faint red-tinted wash under the wave field | white + chalk `#F2F0E9` for alternate bands |
| **Ink** | headlines and body; warm graphite, never pure black | `--graphite #252724`, `--ink #111210` |
| **Signal red (brand)** | the logo, the halftone dots, large display accents only — Firebrick `#F62817` is only 4.0:1 on white, so it must not carry small text or white-on-red button labels | `--firebrick #F62817` |
| **Action red (derived)** | the one thing that means "click": buttons, links. Derived by lowering OKLCH L of the brand seed (L 0.62→0.52, chroma ×0.88, hue held at ≈30°) → candidate `#C22114`, white text 5.96:1 | derived, **verify in browser, then freeze** |
| **Deep red** | header bar, product-window frame, footer close. Measured roughly from the GIF (≈ `#9C1E1A`; frame ≈ `#7F0402`) — dithered GIF, so **re-measure from the real source before freezing** | undecided until measured |
| **Status** | pipeline chips (Leads, Submitted, In process, Approved, Hired, Retained) — one hue each, tinted backgrounds, text ≥4.5:1; `--hivis #FFD100` is the warning hue | `site.css` |
Neutrals: warm-tinted (C ≈ 0.004–0.012, hue toward the red), because the page is red-led and a cool grey would read dirty next to it.
Accent scarcity: action red appears only on interactive things. The halftone field uses brand red at low alpha so it never reads as a button.
Dark mode: **not in scope for launch.** `dark.css` (10 Nov dark theme) is archived, not deleted — see `docs/DECISIONS.md` D2.

## Type
- **Display** — heavy, tight grotesque (current: Inter Tight 700/800). Must hold at 52–72px with tracking −0.02em and 1.05–1.1 line height; ≤3 lines.
- **Body** — quiet humanist/neutral sans (current: Inter 400/500). 16–18px, line height 1.5–1.6, measure 50–60ch.
- **Utility** — mono (current: JetBrains Mono 500/600) under a tenth of text: statuses, counts, kicker, sample-data labels. Tabular figures on every counter.
Contrast axis: weight + width (Inter Tight 800 vs Inter 400 ≥ 300 units, ≥3.5× size). Same superfamily on purpose, so no x-height compensation needed.
Scale: **1.25** (marketing), steps strictly to h3, display hand-set. Kicker: ≤4 words, letterspaced +0.08em, and it must carry information
("THE CDL CLASS A RECRUITING NETWORK" says what the thing is — keep). English-US only, so no extended-Latin test needed.

## Layout
Concept: an asymmetric hero — a 55/45 split where the left column carries copy and the two routing cards, and the right 45% is the halftone
field bleeding off the viewport edge; below the fold the product window bleeds *through* the fold (the GIF's dashboard).
```
┌ red header bar: logo · How It Works · For Recruiters ▾ · For Carriers ▾ · Resources ········ [Get Started] ┐
│ ── THE CDL CLASS A RECRUITING NETWORK                                      ░ ░░ ·· ░░░ ░               │
│ Carriers and recruiters.                                              ░ ·· ░░░░░░░ ░░ ·· ░             │
│ One network. Nothing                                                ░░ ░░░░ halftone wave ░░░░          │
│ falls through.                                                       resolving into the CDL symbol       │
│ lead paragraph (50–60ch)                                                                                 │
│ ┌ I'm a Carrier ───────┐ ┌ I'm a Recruiter ─────┐                                                         │
│ │ …  [Partner as a …→] │ │ …  [Apply as a …  →] │      "Not a job board. Carriers make every decision."   │
│ └──────────────────────┘ └──────────────────────┘                                                         │
│ ─ See the whole pipeline in one screen. ─────────  ┌ dark-red product window, cut by the fold ──────────┐ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
Grid: 12 columns; hero 7/5; feature rows 7/5 (never 6/6); containers vary section to section (1240 / 1040 / full-bleed).
The two hero cards are a **fork between two different audiences** (carrier vs recruiter), not two equal CTAs on one decision — the GIF pins them.
Header "Get Started" is the single global action; hero buttons are the routing.

## Signature
**The halftone wave that resolves into the CDL symbol.** It is the one place boldness is spent. Everything else stays quiet: no gradients on text,
no glow, no glass, no icon-card triplets. See `design/ANIMATION-SPEC.md` for how the existing particle code is corrected to match the GIF.

## Motion
**Corporate** archetype (≈90%) with a premium, slow ambient layer on the wave only.
- Signature easing: one ease-out for entrances, one ease-in for exits (values to be fixed once in `site.css` tokens).
- Durations: quick 150ms, standard 280ms, slow 500ms; exits 65–75% of entrances; focal reveal ≤1000ms.
- One orchestrated moment: the hero (wave forms → symbol resolves → copy settles). Everything else: reveal once, never re-hide, visible by default if JS fails.
- Ambient: wave drift 12–20s sine loop, 10–20% amplitude. Reduced motion: static composed frame (symbol formed), no loop.
- Mobile ×0.8 durations, no parallax, ≤ half the particle count.

## Page-level sequence (8 types, 1 repeated deliberately)
1. Hero — product-as-hero + wave signature
2. **Demonstration** — "See the whole pipeline in one screen" as a stylized, disclosure-safe status board (labelled *Illustration. Sample data.*)
3. Audience split — carriers / recruiters / agencies as alternating 7/5 rows (the repeated type, ×3, varying copy length)
4. **Sequence** — "Nothing falls through": lead → submitted → in process → approved → hired → retained, as a sticky-scroll (genuinely ordered)
5. **One break** — statement: "Not a job board. Carriers make every hiring decision."
6. Proof at decision weight — *undecided* (needs real customers/numbers; see Open items) — until then: how-it-works guarantees and sourced industry context, no invented logos/quotes
7. Objections — FAQ (carriers, recruiters, fees, compliance, SMS)
8. Action + big-type footer close
Navigation: full bar, one action (matches the GIF). Footer: composed sitemap with unequal columns — the site is small, so no mega-footer.

## What I changed after the freshness test, and why
- The GIF's two equal red buttons would be an "unmade decision" on one choice; kept them because they route two different audiences, and gave the header "Get Started" the global role.
- Dropped the "number strip" and logo wall ideas — there are no real numbers or logos yet; fabricating either is the exact tell the anti-generic skill names.
- The brand Firebrick fails 4.5:1 against white for small text/buttons (4.0:1), so buttons use a derived deeper red; Firebrick is kept for large display, dots and the logo.
- Replaced "icon + 2 words + 12 words" cards in the existing home page with alternating rows and a sequence section.
- The existing dark theme was the wrong environment for the pinned look; retired rather than patched.

## Directions ruled out
Type-only manifesto; draggable live-demo board (strong, but needs product API — revisit after launch); network-graph hero; documentary photography
(no rights-cleared imagery supplied); index/search hero. Also ruled out: dark theme, purple/blue gradients, glass cards, any "AI-powered" framing.

## Disclosure constraint (owner decision 2026-11-17)
The owner does not want prices published, nor a full account of what CDL System does, to avoid being copied by competitors (AI makes copying cheap).
Consequences for the plan: the pipeline demonstration becomes a **stylized status board** (statuses + counts, no module/field names, no billing panel, no real UI);
the sticky "sequence" section stays at outcome level (what the partner can rely on, not how it's built); feature pages stay redirects (D5); no pricing/payout/fee calculator, no
cost guides tied to our terms; the primary conversion is *talk to us*, with mechanics shown on a live call. See `docs/DISCLOSURE-POLICY.md`.

## Open items (undecided, with what would decide them)
- Exact deep-red and action-red values → measure from the real design file or logo/SVG source; run the contrast script.
- Proof section → real carrier/recruiter names, a number with unit + period + source, or one attributable quote.
- Photography → none supplied; use the product window and the halftone as the only imagery until rights-cleared photos exist.
