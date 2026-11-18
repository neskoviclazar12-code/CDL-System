# Animation spec — match the reference GIF
Reference: `design/reference-hero-wave.gif` (553×466, 6 frames, 220 ms/frame — a *sampling* of the loop, not its real timing).

## What the GIF shows
- **Light page**, white ground with a pale red wash behind the right half of the hero.
- A **halftone field of red dots** (varying dot size) laid out as a flowing **wave/ribbon** that sweeps from upper right toward lower left.
- Mid-loop the dots **gather into the CDL symbol** (the two linked "C/L" forms), cropped by the right viewport edge; the symbol then **dissolves back into the wave**.
- Wave stays *behind* the copy (copy never loses contrast) and is strongest on the right 45% of the hero.
- Header is a deep-red bar with white logo/nav; hero cards are white with red buttons; product window is dark red.

## What exists today (`public/assets/js/hero-particles.js`, 17 KB)
- Samples `cdl-symbol-duo.svg` into 4,000–8,000 circular particles (device-profiled), assembles it oversized → shrinks into place (3.2 s), then
  on scroll releases into a "woven stream" that crosses the viewport, passes under the dark stage and regroups beside the "Eight things" rules.
- Pointer/touch repel; one fixed full-viewport canvas; reduced-motion = static logos. Colours are hard-coded for the dark theme:
  `RED '#F62817'` and `GRAPHITE '#FFFFFF'` (white left link).
- Related: `particle-logo.js` (footer logo), `crop-particles.js`, `stage.js`/`stage.css` (dark stage), `home.js` (My Day / Route scroll walkthroughs).

## Target behaviour (what to build)
1. **Light-theme palette**: dots in brand red (`#F62817`) with tints (alpha 0.25–1.0); the second link of the symbol in graphite/white-on-red per the logo `duo` SVG on light ground. Remove the white particles.
2. **Wave generator**: a dot grid (≈ 14–18 px pitch desktop) whose dot radius = f(distance to a moving sine ribbon) → halftone. Ribbon = 2 summed sines (long wavelength ≈ 0.9×hero width, amplitude ≈ 18% of hero height), drifting at 12–20 s per loop; secondary ribbon at 30–50% amplitude, offset 50–100 ms, different phase (motion-language layering).
3. **Morph**: the same particle set interpolates between *wave targets* and *symbol targets* (the existing sampler already produces symbol targets). Cycle: wave (≈ 4 s) → gather (≈ 1.2 s ease-in-out) → hold symbol (≈ 2.5 s) → release (≈ 1.0 s ease-out) → wave. First load: start already in wave, form the symbol once, then copy settles (the one orchestrated moment). After the first cycle, loop only while the hero is in view (IntersectionObserver); pause when the tab is hidden.
4. **Layering**: primary = symbol formation; secondary = the second ribbon + dot-size ripple; ambient = slow wave drift (10–20% amplitude).
5. **Scroll behaviour**: *simplify* — drop the cross-page "woven stream → regroup at rules" path unless it can be kept without hurting the light layout. Recommended: the field fades/eases out as the hero leaves the viewport; the footer particle logo (`particle-logo.js`) stays.
6. **Copy safety**: the field must not reduce body text contrast below 4.5:1 — keep dot alpha ≤ 0.35 under the left 55% of the hero, or mask the left side with a gradient.
7. **Performance budget**: ≤ 4,500 particles desktop, ≤ 2,200 mobile, canvas 2D, DPR capped at 2, one rAF loop, sprites pre-rendered (already done via `SPRITE_SCALE`); target 60 fps on a mid laptop, degrade (`profile()`) on ≤ 2 cores / ≤ 2 GB.
8. **Reduced motion / no JS**: static composed frame (symbol formed + wave fixed), no loop. The `<img class="hero__symbol-src">` fallback must still show a branded hero.
9. **Accessibility**: canvas is `aria-hidden`; no information lives only in the animation; no flashing; pointer-repel is optional and off on touch.

## Test checklist
- Compare 6 sampled moments against the GIF frames (wave only / gather / symbol held / dissolve / wave).
- Lighthouse performance ≥ 90 mobile with the animation running; CLS 0; no long tasks > 50 ms from the loop.
- `prefers-reduced-motion: reduce` → no motion. Tab hidden → loop paused.
- Dark layer removed: `dark.css` must no longer load (see `docs/DECISIONS.md` D2) or every white-particle override will fight the new palette.

## Status
Spec only. **Not implemented yet.** Next agent: start with item 1 (palette) → item 2 (wave) → item 3 (morph), commit each separately.
