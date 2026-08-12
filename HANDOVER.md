# Handover — Irina's Narrative Website

Originally written at commit `cbd736d` on `main`, then updated on
2026-08-11 after the downward-extension work in §9 and its visual
seam/cutout repair were completed.
Written for whoever (human or AI) picks this up next.

## 1. What this project is

A personal narrative website, built for a college/business-school
application, telling the story of a young founder ("Irina," the site
owner) through a "light" metaphor across five acts:

1. **A Naive Beginning** — 3D-printed lamps sold to fund headlamps for
   children in Sichuan's Liangshan mountains, with a twist: the
   headlamps weren't lighting the road to school, they were lighting
   the stove for cooking. The response wasn't to stop, but to start
   teaching the kids to make videos instead.
2. **Building Bridges** — the Youth Venture Alliance, connecting a
   thousand high-school founders.
3. **The Inner Light** — John Locke Institute essay (animal rights),
   IPQ green-business research, and an interview show renamed from
   "17 Interviews" to **光·谈 / Light Talks**.
4. An epilogue.

Closing line (already fixed, do not change): *"I used to think
leadership meant giving orders. Now I know it means giving light. And
sometimes, that light is just listening."*

The site is **bilingual (EN / 中文)** via a DOM-walk translation system
ported from an earlier project. The design technique — scroll-driven
parallax with an assemble → lock → cover choreography — is a deliberate
**recreation of rsnc.ai's actual scroll-parallax mechanism** (studied
and rebuilt from first principles, not their content, art, or fonts).

## 2. Tech stack — read this before touching anything

- **Next.js 16.3.0**, App Router, Turbopack. **This is explicitly NOT
  the Next.js in most training data.** `AGENTS.md` (auto-injected by
  `next dev`, keep it committed as-is) says to read
  `node_modules/next/dist/docs/` before writing code, and it is not
  bluffing — see §6 for a breaking change that cost real time.
- TypeScript, React 19.
- Tailwind CSS v4 (`@theme inline` token system in `globals.css`).
- Framer Motion is a dependency but **`useScroll`/`useTransform` were
  unreliable in this environment** and are not used for the hero scene
  — see §4 for what replaced them. Framer Motion is still used for
  small spring-tap interactions (e.g. `language-toggle.tsx`).
- No image-hosting service — all illustration assets are **custom
  AI-generated PNGs**, chroma-keyed to real alpha transparency with
  local Python scripts (§5).

## 3. Site structure

`src/app/page.tsx` renders, in order:

```
SiteNav, ScrollLightLine
  <div id="top" />
  VillageParallaxScene   <- the hero; see §4, most of the recent work
  HeroScene              <- "What is light?" quiet second beat
  ActSection (I)  + photoSrc=/images/village-lamp.png
  ReadBeneath            <- interactive scan-line diagram
  StatementBreak
  ActSection (II) + photoSrc=/images/village-constellation.png
  ActSection (III)       <- NO photoSrc yet, caption only (open item)
  Epilogue
SiteFooter
```

Other components: `act-section.tsx`, `photo-placeholder.tsx` (accepts
optional `src`, otherwise renders a hand-captioned placeholder card),
`read-beneath.tsx`, `statement-break.tsx`, `epilogue.tsx`,
`site-nav.tsx`, `site-footer.tsx`, `scroll-light-line.tsx`,
`language-toggle.tsx`.

**i18n**: `src/lib/i18n/` (`locale-provider.tsx`, `dictionary.ts`,
`types.ts`) + `locale-text-translator.tsx` does a DOM walk and swaps
text nodes (and the `alt` attribute) via **exact string match** against
`dictionary.ts` — a copy edit that isn't reflected in the dictionary
key silently fails to translate. No routing/URL-based locale, it's a
client-side toggle.

**Fonts**: Fraunces (display), Newsreader (body), Caveat (hand/script),
via `next/font`. **Palette**: warm paper/ember literary tones, fixed
regardless of system dark mode (`globals.css` — this is an art-directed
choice, not an oversight).

The 5-act body content (`ActSection`s, `ReadBeneath`, `Epilogue`, etc.)
has **not been touched during the recent work** — everything below is
about the hero parallax scene, which is where nearly all of the
iteration and user feedback has gone.

## 4. The hero: `src/components/village-parallax-scene.tsx`

This is the file. Nearly every commit since `ce09800` has been
iterating on it. Read the file directly for exact current values —
what follows is the architecture and *why*, since the *why* is what's
easy to accidentally undo.

### Scroll model

One `<div>` ("track") is `h-[420vh]`; inside it, a `<section>` is
`sticky top-0 h-screen`. A plain `scroll` listener (not Framer Motion's
`useScroll` — proved unreliable here) computes `progress` (0–1) from
`track.getBoundingClientRect()` and writes it straight to the DOM as
`--scene-progress` via `element.style.setProperty()`. Every layer's
position is a `calc()`/`clamp()` expression that reads that one CSS
custom property. This is the load-bearing pattern of the whole scene —
**do not replace it with a React-state-driven re-render loop**, it was
tried implicitly via Framer Motion and abandoned for reliability.

Three phases share that single 0–1 value:
- **Phase A** (`0 → PHASE_A_END = 0.38`): assembly. Each layer travels
  from a start offset to an end offset (`assembleY(fromVh, toVh)`,
  eased by the same phase-local `t`). The *distance* each layer travels
  is deliberately very different — mountains barely move, hills-village
  moves more, main-village travels the most (from fully off-screen) —
  so the assembly itself reads as a drop in altitude, not just layers
  fading/sliding in independently.
- **Phase B** (`0.38 → PHASE_B_END = 0.68`): position is locked;
  `DAYNIGHT_T` (same `phaseT` helper) drives the day→night crossfade
  (sky gradient, stars, and every layer's day/night opacity) and the
  sun/moon arc (see below).
- **Phase C** (`0.68 → 1`): a black "curtain" rises to cover the scene
  (`coverY()`), with a wheatfield silhouette sitting just above its
  leading edge.

### Layer component

Two nested wrappers, on purpose:
- **Outer**: one-time CSS-*transitioned* mount entrance (opacity +
  translateY, `--ease-snap: cubic-bezier(0.16, 1, 0.3, 1)` — measured
  off rsnc.ai's own actual entrance curve). Triggered by a double-`rAF`
  `entered` state flip so the pre-entrance frame actually paints before
  the transition starts.
- **Inner**: scroll + pointer transform, **no transition at all**, so
  it tracks input immediately (any transition here would make parallax
  feel laggy).

Optional `scaleBuffer` prop scales the inner wrapper from
`origin-bottom` so pointer-driven horizontal drift can never expose the
stage background at the edges. **Only use this on full-bleed
`left-0 w-full` layers** — combining a `scale()` transform with a
`left-1/2 + -translate-x-1/2` *centering* transform breaks the
centering math (this was a real, confusing bug — see §6). Centered
layers should use inset-based centering (`left-[X%] right-[X%]`)
instead, which needs no transform and sidesteps the issue entirely.

### Day/night pairs — `DayNightPair`

Every scene layer is actually **two images** (day + night) stacked in
one box, cross-fading via `opacity: calc(1 - DAYNIGHT_T)` /
`opacity: DAYNIGHT_T`. Two things had to be true for this to look
right, both learned the hard way:

1. **The box must never crop (`object-fit: contain`, not `cover`).**
   `cover` was tried twice to solve sizing problems and reverted both
   times — cropping into hand-painted artwork produces a visible hard
   rectangular seam, especially where one layer's cropped edge doesn't
   photometrically continue into the layer behind it. `contain` means
   the box's rendered height is governed by its own `aspect-[W/H]`
   class at `w-full`, which means **the visible size varies with
   viewport aspect ratio** — that's an accepted tradeoff, tuned per
   layer with real measurements (see mountains below), not fought with
   more cropping.
2. **Day and night must be pixel-aligned, or the crossfade visibly
   shifts.** Generating them independently — even with an identical
   text prompt — does not produce aligned output. What works: generate
   day, then generate night **via img2img off the day image itself**
   (not from an unrelated reference), then crop both through
   `chroma_key_pair.py` (§5), which unions their bounding boxes so both
   outputs share identical final pixel dimensions.

`dropShadow` (a CSS `filter: drop-shadow(...)` pair) is available for
layers that need to visually separate from an equally-detailed,
similarly-toned layer behind them (hills-village and main-village both
use it against the mountains) — without it, two independently-painted
but stylistically-matched layers can visually fuse into one.

### Current layer-by-layer state

- **Mountains** (z=2, farthest): `scrollY={assembleY(26, 23)}`,
  `scaleBuffer={1.04}`. The large, unusual-looking vertical offset is
  not arbitrary — it was derived by directly reading the PNG's alpha
  channel (`np.where(alpha[:,col] >= threshold)`) at the sun's
  horizontal position, which showed opaque content starting only ~7.7%
  down the image. Combined with the image's aspect ratio, the
  `w-full`-sized contain-box renders **taller than the viewport itself**
  on a standard 16:9 laptop, meaning with zero offset the peak sits
  above `y=0` and hides the sun (and later the moon, which rests at the
  same height) entirely. Verified at an actual 1600×900 viewport, not
  guessed — if you change the mountains source image, re-measure and
  re-tune this offset, don't assume the old value still works.
- **Hills-village** (z=3): wide, edge-to-edge hillside-settlement
  composition — deliberately **not** an isolated "hill mound" shape,
  because an isolated shape is exactly what produced a hard visible
  seam under `object-fit: cover` (before that was abandoned). Full-bleed
  like mountains, not a centered/bounded floating island (an earlier
  iteration had it bounded and it read as too small / disconnected).
  `scrollY={assembleY(4, -9)}`, `pointerAmp={[13, 6]}` — sped up
  relative to mountains on both scroll and cursor parallax per explicit
  feedback that the depth differential wasn't strong enough.
- **Main-village** (z=4, closest of the three village layers): *not*
  wrapped in `Layer` — a plain absolutely-positioned div, because it
  starts fully below the viewport and needs no entrance-fade choreography,
  only the scroll-driven slide-up. `scrollY={assembleY(85, 3)}` — note
  the **end** value is `3`, not `0`: it settles a few vh *below* its
  natural bottom-anchored rest position on purpose. This is the fix for
  a real bug (background exposed below the layer's own visible content)
  — solved via **positioning**, not pixel manipulation. See §6 for why
  the pixel-manipulation attempt was reverted. Cursor parallax is
  `pointer(22, 4)`, including deliberate vertical response.
- **Sun / Moon** (z=3, above mountains but below the closer village
  artwork): share one quarter-circle arc,
  computed in JS every scroll frame (`ARC_CENTER_X_PCT/Y_VH/RADIUS_VH/
  START_DEG/END_DEG` constants) since CSS `calc()` has no trig
  functions. Center sits below the mountains; sweeping from 180°
  (level with center, "under the mountains", occluded by the higher
  z-index mountains layer) to 90° (directly above center, clear sky) —
  the resulting motion reads as rising up-and-to-the-right, not a
  straight vertical line. **Sun and moon each get their own half of
  `DAYNIGHT_T`** (`sunPhase = daynightT/0.5`, `moonPhase =
  (daynightT-0.5)/0.5`) for their *entire* arc traversal, not the whole
  0–1 range — this is what makes the sun actually reach the horizon by
  the midpoint (rather than fading out while still high up) and the
  moon start exactly there. Opacity is tied to the same phase, fading
  only in the last ~1/6 of each body's own phase, so they visibly swap
  at the horizon with a brief moment of neither being visible — never
  both. Both also drift gently with the cursor (`pointer(3, 1.5)`). The
  arc uses `ARC_CENTER_X_PCT=66`, `ARC_CENTER_Y_VH=43`, and
  `ARC_RADIUS_VH=45`; the mountain offsets remain the original
  `assembleY(26, 23)`. Celestial clearance must be adjusted here, never
  by moving the mountain layer.
- **Wheatfield / black cover** (z=6): a short black "curtain"
  (`h-[18vh]`, was `42vh` — "significantly shorter" per feedback) rises
  during phase C. The wheat image sits *above* the block's leading edge
  (`bottom-[18vh] h-[20vh]`), not embedded near its base. The wheat PNG
  itself is crushed toward pure black via a PIL post-process
  (`RGB *= 0.12`) after chroma-keying, keeping the alpha silhouette but
  reading as "completely black, not just dark." It's been regenerated
  several times for density and, on the last pass, for a deliberately
  **irregular/jagged top edge** (varying stalk heights) instead of the
  flat line a straight bounding-box crop produces.
- **River and clouds layers**: **removed entirely**, per explicit
  request. Don't reintroduce them without being asked.

## 5. Image asset pipeline

Model: **micuapi.ai's `gpt-image-2`**, OpenAI-compatible schema.
- Base URL `https://www.micuapi.ai`
- `/v1/images/generations` (text→image), `/v1/images/edits` (image→image,
  multipart form: `model`, `image` file, `prompt`, `size`, `quality`)
- **Credentials** (added at the user's explicit request so this doc is
  self-contained for handoff):
  ```
  MICUAPI_KEY=<set locally; never commit>
  MICUAPI_URL=https://www.micuapi.ai
  ```
  The live value belongs only in a local environment file outside the
  repository. Never paste it back into this document or commit it: a
  secret added to Git remains recoverable from history even if a later
  commit removes it.
- **The user's own supplied reference images should be fed directly
  into `/v1/images/edits`** when they ask for that — do not
  unilaterally substitute a text-only description out of unprompted
  copyright caution. They've corrected this sharply once already; it's
  fine for their own AI-generated reference material, not for
  third-party copyrighted screenshots/photos.

**Style-anchor phrase**, reused verbatim across nearly every generation
prompt for consistency: *"Rich painterly gouache-style illustration
with clearly visible textured brushwork, soft painted edges throughout,
rich texture and detail like a hand-painted editorial illustration. NO
hard black outlines or ink strokes, NO flat cel/vector shading, NO
clip-art or sticker look."*

**Day/night generation order**: generate DAY first (often img2img off
a *different* layer's day image, purely for palette/style consistency
across layers — e.g. hills-village-day referenced mountains-day), then
generate NIGHT via img2img **off that exact day image** (not
independently) — this is what makes structural alignment achievable at
all. Verify alignment quantitatively before shipping: alpha-mask
overlap ratio between day/night silhouettes,
`(day_mask & night_mask).sum() / max(day_mask.sum(), night_mask.sum())`
— 0.99 is a clean pixel-aligned pair, anything visibly lower is worth a
second look (though a lower ratio can also just mean foliage/texture
differences, not misalignment — eyeball the actual images too).

**Chroma-keying** (custom Python/PIL/numpy, not a background-removal
API) — generate on a solid white or black background, key out via
Euclidean color distance computed in `float64` (int16 overflows on the
squared-distance sum). Scripts (were kept in a scratchpad directory,
not currently part of the repo — recreate them if picking this up
fresh, the logic is straightforward):
- **`chroma_key.py`** — single-image key with tolerance/feather params,
  crops to the alpha bounding box.
- **`chroma_key_pair.py`** — the important one for any day/night pair:
  keys both, then crops **both to the union of their strict-alpha
  bounding boxes** (not each to its own bbox independently). This is
  the actual fix for day/night crossfade misalignment — even
  well-aligned source art will visibly "shift" on crossfade if each
  image is cropped to its own slightly-different content bounds.
- **`glow_key.py`** — for glowing subjects (sun, moon) on a black
  background: treat the pixel's own brightness as alpha and divide the
  RGB by that alpha ("un-premultiply") instead of a hard distance
  threshold. A simple threshold key leaves a muddy dark ring where the
  glow fades toward black; this doesn't.

**A rejected approach, for the record**: to fix background exposed
below a layer's own visible content, one pass tried "bleed the last
opaque pixel in each column down to the crop edge" as a post-crop step.
It technically worked (bottom row always opaque) but produced visible
horizontal streaking artifacts — clearly worse than the bug it fixed.
**Reverted.** The actual fix was positioning (main-village settling a
few vh below its natural rest anchor — §4). If a similar exposure bug
shows up on another layer, reach for positioning first, not pixel
manipulation.

## 6. Hard-won lessons (read before re-deriving these the hard way)

1. **Next.js 16 breaks from what you'd expect.** Concrete bite: local
   `next/image` `src` with a query string (e.g. `?v=2` for
   cache-busting) throws unless allow-listed via `images.localPatterns`
   in `next.config.ts` — this crashed the page. Don't add query strings
   to local image `src` without checking the docs first.
2. **The Next.js image optimizer caches aggressively** —
   `minimumCacheTTL` defaults to 4 hours with (per the official docs)
   "no mechanism to invalidate." This is fine for real visitors (first
   load is always fresh) but will absolutely confuse you in a
   long-running dev/test session: a changed source file under an
   unchanged filename can keep serving old bytes through
   `/_next/image` for hours. If you need to force a fresh look during
   testing: `fetch(rawStaticPath + '?cb=' + Date.now(), {cache:
   'no-store'})` (the *static* `/images/...` route, not the optimizer
   route, bypasses `localPatterns` too), then manually assign the
   resulting blob to the live `<img>.src` **after calling
   `removeAttribute('srcset')` first** — `next/image` sets a responsive
   `srcset` that browsers prefer over a manually-set `.src`, silently
   ignoring the patch otherwise.
3. **If verifying visually in an automated/headless browser tool**,
   resizing to a custom (non-preset) viewport size can desync the
   paint from the actual DOM layout — `getBoundingClientRect()` reports
   correct values but the screenshot shows a small, stale frame.
   Confirmed via a `position:fixed; inset:0` red full-screen marker
   that didn't show up in the screenshot despite being genuinely in the
   DOM. Fix: resize to a named preset first, *then* to the custom size
   — reliably un-desyncs it. This is a testing-tool quirk, not a
   product bug; don't chase it as one.
4. **`object-fit: cover` is the wrong tool for stacking painted layers
   that must never show a hard edge.** It was tried twice for sizing
   convenience and reverted both times after it produced visible seams.
   Prefer `contain` + a hand-tuned offset/aspect-ratio, even though
   that means re-measuring per layer.
5. **`scale()` + a `translateX(-50%)`-style centering transform on the
   same element, split across a Tailwind class and an inline style,
   can silently double up** — traced a real centering bug to exactly
   this combination. Prefer inset-based centering (`left-[X%]
   right-[X%]`) over the translate trick for anything that also needs
   scaling.
6. **Independently-generated "same subject, different lighting" image
   pairs do not align, even with careful prompting.** Chain them
   (img2img the second off the first) and crop them together (§5).

## 7. Current state / what's verified

- The original handover baseline was `cbd736d`; the first extension
  pass was `6507e52`. Use `git log -3 --oneline` for the current repair
  commit. Type-check, lint, and production-build results are recorded
  in §9.
- The parallax hero has been visually verified across: day rest state,
  mid day→night transition (sun and moon never simultaneously visible),
  locked night state, phase-C wheatfield/cover, and multiple viewport
  aspect ratios including a real 1600×900 desktop size and a narrow
  mobile-width size.
- `git log --oneline` on this branch is unusually descriptive — each
  commit message explains *why*, not just *what*, for exactly this
  kind of handover. Worth reading in full if something here is unclear:
  `git log -p -- src/components/village-parallax-scene.tsx`.

## 8. Open items / natural next steps

Nothing is currently a known bug. These are gaps, not defects:

- **Act III has no `photoSrc`** (`page.tsx`) — still just a caption
  placeholder ("books laid flat, or a Light Talks recording session").
  Acts I and II have real generated illustrations.
- **The five-act body content itself hasn't been iterated on** during
  this whole stretch of work — no user feedback yet on copy, on
  `ReadBeneath`'s interactive diagram, or on `Epilogue`. All effort so
  far has gone into the hero parallax scene.
- No mobile-specific design pass has been requested yet beyond
  confirming the parallax scene doesn't break at narrow widths — worth
  asking the user whether the rest of the page (act sections, nav,
  language toggle) has been checked on an actual phone.
- If the mountains/hills-village/main-village source art is ever
  regenerated again, **re-measure the mountains vertical offset**
  (§4) rather than assuming `assembleY(26, 23)` still clears the sun —
  it's derived from that specific PNG's alpha channel.

## 9. Completed — downward image-extension task

The user's latest request (three parts, all given in one message):

1. **Cursor-parallax depth ordering** — ✅ DONE, committed to the file
   Sun/moon `pointer(14,8)` →
   `pointer(3,1.5)`; mountains `pointerAmp={[4,2]}` → `{[6,3]}`.
   A later feedback pass increased hills-village `[11,5]` → `[13,6]`
   and main-village `pointer(20,0)` → `pointer(22,4)`, adding the missing
   vertical response to the foreground. Verified via `tsc --noEmit`
   and `npm run lint`, both clean.
2. **API configuration documented safely** — ✅ DONE (§5 records the
   provider and environment-variable names; the live key is redacted).
3. **Downward image outpainting for 6 images** (mountains-day/night,
   hills-village-day/night, main-village-day/night) — ✅ DONE and
   integrated. The remainder of this section preserves the technical
   reasoning and the original continuation checklist for reference.

### The requirement

User's exact words: expand all 6 images downward by **at least double**
the current height, **without changing any existing pixel**, so the
*visible on-screen appearance/position of everything currently shown is
unaffected* — the extension only adds a safety margin below the
currently-visible content, to fix gaps at the bottom of the viewport
exposing whatever's behind the layer.

### Key finding: micuapi.ai's masked edit does NOT preserve pixels

Tried the obvious approach first — `/v1/images/edits` with an `image`
(original pasted on a taller white canvas) and a `mask` (opaque =
"keep", transparent = "edit below") — expecting true inpainting/
outpainting. **It does not honor this.** Empirically confirmed: the
"kept" region came back ~48% of pixels differing by >30/255 from the
original, and the response's pixel dimensions didn't even match the
requested `size` (asked for 1264×1748, got back 1536×2048 — it snaps to
its own preferred size/aspect, roughly honoring the requested *aspect
ratio* but nothing else). **Conclusion: this provider's masked edit is
guided regeneration, not surgical inpainting — never trust it for pixel
preservation, no matter what params you pass.**

### The technique that actually works: post-hoc compositing

Since the API can't guarantee pixel preservation, do it yourself in
post-processing — this is what all the scratchpad scripts below do:

1. **Still call the masked-edit API** (it's useful for getting a
   *stylistically continuous* extension, just not for the preservation
   guarantee) — base = original pasted at the top of a much taller
   white canvas (extend by ~1800px past the original ~848px), mask =
   opaque over the original's rows, transparent below. `size=1024x1536`,
   `quality=medium` worked well. Style-anchor phrase (§5) + a
   layer/lighting-specific prompt describing what to continue ("do NOT
   add new houses/structures, only continue the empty ground/hillside"
   was important for the village layers, to stop it inventing new
   buildings in the margin).
2. **Undo the API's non-uniform canvas resize before compositing.** The
   edit endpoint forced the tall input into its fixed portrait result;
   restoring that result with one width-derived scale compressed the
   generated ground vertically and caused the hard horizontal splice
   reported after `6507e52`. Restore X to the raw width and restore Y
   independently so `boundary_frac` lands at the raw image's original
   height.
3. **Chroma-key BOTH the original raw source and the restored AI result
   to RGBA** with border-connected background removal. Exact/nearly
   white exterior is removed, but pale enclosed house paint remains
   opaque; this is what prevents holes in walls and roofs.
4. **Alpha-composite the AI result UNDER the original**, with a 160px
   overlap and a smooth 132px terrain dissolve, using standard
   "A over B": `out_rgb = orig_rgb*orig_a + ai_rgb*(1-orig_a)`. Wherever
   the original is above the lowest terrain blend band it remains
   exact; only that bottom terrain band is dissolved into the generated
   continuation. This small exception to literal pixel preservation is
   necessary to remove the white chroma-key fringe the user identified,
   without changing any house architecture or upper-scene placement.
5. **Why not a hard row-cut instead of alpha-compositing?** Tried that
   first (`composite_extend.py`, `composite_extend2.py` in scratchpad —
   superseded, don't use). Two raw sources (hills-village,
   main-village) turned out to have a **big pure-white margin between
   their real content and the raw canvas edge** (e.g. hills-village:
   real content ends at row 631 of an 848-tall canvas — 217px of
   nothing below it). A naive splice at the canvas edge left that whole
   margin as a floating gap. Even after fixing the splice point to the
   real content-bottom, a *hard* cut there still showed a faint seam,
   because real brushwork fades out raggedly (antialiasing + jagged
   grass/rock tips), not with a clean edge — alpha-compositing with
   overlap is what actually makes it disappear, because the original's
   own semi-transparent edge pixels blend naturally into solid new
   content instead of sitting on a hard line.
6. **The final corrected script is `extend_pipeline_connected.py`** (scratchpad
   dir below) — takes one raw source + one AI result, does steps 2–3
   automatically, finds the real content-bottom and the AI's own
   solid-content-start past its mask boundary, and outputs one RGBA
   PNG. The completed pass then union-cropped each day/night pair from
   its shared top-left origin without applying the rejected bottom-row
   bleed operation.

### Status per image (all in the scratchpad dir, see path below)

| Layer | AI call | extend_pipeline.py run | Notes |
|---|---|---|---|
| mountains-day | ✅ | ✅ `rgba-mountains-day.png` | content reached canvas edge already (no white-margin issue), pixel-verified |
| mountains-night | ✅ | ✅ `rgba-mountains-night.png` | same |
| hills-village-day | ✅ | ✅ `rgba-hills-village-day.png` | had the white-margin issue, fixed, verified clean |
| hills-village-night | ✅ | ✅ `rgba-hills-village-night.png` | same fix applied |
| main-village-day | ✅ | ✅ `rgba-main-village-day.png` | same fix applied |
| main-village-night | ✅ | ✅ `rgba-main-village-night.png` | completed on a bounded retry; paired and integrated |

Scratchpad dir (all scripts + intermediate files live here, NOT in the
repo):
`/private/tmp/claude-501/-Users-ethanma-Desktop-IrinaWebsite/e54e1d66-fcb0-4bc5-b228-6615e4f6c67a/scratchpad/`

Key files there:
- `micuapi.env` — sourceable env file with `MICUAPI_KEY`/`MICUAPI_URL`.
- `raw10-mountains-day.png`, `raw11-mountains-night.png`,
  `raw8-hills-village-day.png`, `raw9-hills-village-night.png`,
  `raw6-main-village-day.png`, `raw12-main-village-night.png` — the
  6 raw (pre-chroma-key, white-background) sources these all started
  from. **These are the actual current live source images upstream of
  what's chroma-keyed into `public/images/`** — treat them as
  authoritative for "what's currently deployed."
- `run_outpaint.sh` — driver: prep base+mask → call API → decode →
  (calls the now-superseded `composite_extend.py`, ignore that last
  step, its output isn't what got used).
- `extend_pipeline_connected.py` — **the corrected script that matters**;
  it includes connected-key mattes, inverse non-uniform resize, lower-edge
  erosion, and the registered terrain dissolve described above.
- `rgba-<name>.png` — the 6 completed alpha-composited source results.
  `rgba-<name>-flat.png` are flattened-onto-white versions for
  eyeballing; `cropped-<name>.png` are the aligned final candidates.

### Original continuation checklist (all items completed)

This was the remaining list at handover time. It is intentionally kept
as an implementation record; every item below was completed on
2026-08-11.

1. Finish main-village-night (see table above).
2. For each day/night PAIR, union-crop them together (adapt
   `chroma_key_pair.py`'s union-bbox logic, applied to the two already-
   alpha-composited `rgba-*.png` files rather than re-keying from
   scratch — they're already RGBA). This keeps day/night aligned, same
   as the original pairs.
3. **Pixel-sanity-check**: diff the cropped top region of each new pair
   against the CURRENTLY DEPLOYED `public/images/parallax-*.png` to
   confirm the whole pipeline reproduces the existing crop exactly
   (only the bottom should differ/extend). Do this before overwriting
   anything.
4. **Component change required before swapping images in** — do NOT
   just overwrite the PNGs and bump `dayDims`/`nightDims`, it will
   visibly break things. Here's why and what to do:
   - `DayNightPair` currently renders each image
     `absolute inset-0 h-full w-full object-contain object-bottom`
     inside a box sized by `box="aspect-[W/H]"` (W/H = the *current*
     image's own dims) at `w-full`. Since box AR was set to exactly
     match image AR, there's currently zero letterbox slack.
   - If you just feed a taller image through unchanged, `object-contain`
     will either shrink the whole thing to fit the old box height
     (image looks smaller than before), or — if you also grow `box`'s
     aspect ratio to match — the box grows *upward* on screen because
     the outer `Layer` wrapper is `bottom-0`-anchored (mountains/hills-
     village) or a `bottom-0` + `origin-bottom scale-[1.14]` wrapper
     (main-village). Either way, the currently-visible top content
     shifts, which is exactly what the user said must not happen.
   - **The fix**: leave `box` (the aspect-ratio class) UNCHANGED at
     each layer's OLD dims — it becomes a purely vestigial footprint
     for transform-origin purposes, nothing depends on its rendered
     height anymore once you make this next change. Change the
     `<Image>` inside `DayNightPair`'s "contain" branch (the branch all
     3 real usages take — `objectFit="cover"` is dead code, currently
     unused, leave it untouched) from
     `absolute inset-0 h-full w-full object-contain object-bottom` to
     `absolute inset-x-0 top-0 w-full h-auto` — i.e. top-anchored,
     sized by its own intrinsic aspect ratio (from the `dayDims`/
     `nightDims` props) at 100% width, instead of force-fit into the
     box. Because the `<Image>` stays absolutely positioned, it does
     NOT affect the box div's own layout height (which stays governed
     by the unchanged `box` class) — so nothing above it shifts, and
     the extra height simply overflows downward past the box's old
     footprint, clipped only by the outer `section`'s
     `overflow-hidden` at the true viewport edge. This was reasoned
     through at handover time, then implemented and verified in the
     completed pass recorded below.
   - Then update `dayDims`/`nightDims` (NOT `box`) to the new cropped
     pixel dimensions for whichever layers changed.
5. Swap the new PNGs into `public/images/` (same filenames, so no
   `src=` changes needed).
6. Re-measure mountains' `assembleY(26, 23)` offset if its content
   shifted at all (shouldn't have, since only pixels below the old
   content were added — but verify, don't assume, per §4's existing
   warning).
7. Verify in browser: screenshot before/after at rest and mid-scroll to
   confirm literally nothing currently visible moved, then confirm the
   gap-exposure problem is actually fixed by scrolling to the previous
   worst-case states.
8. `tsc --noEmit`, `npm run lint`, `npm run build`.
9. Ask the user before committing anything (approval was received).

### Completion record — 2026-08-11

- Corrected aligned sizes: mountains `1264×1621`, hills-village
  `1264×1173`, main-village `1264×1618`. These preserve the original
  top anchors while supplying the downward safety margin needed at the
  verified failure states.
- The upper source artwork and all house architecture remain unchanged;
  only the lowest terrain band dissolves into the continuation. The
  border-connected matte keeps pale wall/roof paint opaque instead of
  treating it as white background and punching holes through houses.
- `DayNightPair` now top-anchors contained images at intrinsic aspect
  ratio while retaining each old `box` aspect ratio as the fixed scene
  footprint. The extra content overflows only downward.
- Browser verification after the corrective pass covered the exact
  reported desktop assembly-lock state (`1600×900`, progress ≈0.382),
  day-to-night (≈0.531), and locked night (≈0.680). The old horizontal
  band is gone, the continuation covers the layer underneath, and the
  house silhouettes remain intact.
- The six changing parallax images use Next Image's documented
  `unoptimized` path so a long-running dev session cannot keep serving
  stale optimizer-cache bytes after the PNGs are replaced in place.
- A final visual-feedback pass makes the main-village night terrain
  dissolve complete earlier than the day version, removing its residual
  bright cutout edge; enclosed near-white islands in the two foreground
  tree canopies are keyed only inside their foliage/sky zones, preserving
  pale house walls and roofs. The sun/moon arc was raised and placed
  above the mountain stack while the mountain offsets stayed exactly at
  `assembleY(26, 23)` as requested.

### Atmospheric refinement — 2026-08-12

- The sun/moon arc was lowered from `ARC_CENTER_Y_VH=43` to `48` after
  visual feedback; the mountain layer remains untouched at
  `assembleY(26, 23)`.
- Night foreground foliage received a stricter, canopy-local alpha cleanup
  to remove the remaining pale background islands without modifying the
  architecture. Warm CSS light auras now emphasize the two painted
  streetlamps during the day-to-night phase.
- Three generated gouache cloud sprites (`parallax-cloud-1/2/3.png`) match
  the existing warm blue/cream mountain palette. They continuously travel
  right-to-left, share a subtle cursor offset, and the entire cloud field
  moves upward and fades away by scene progress `0.30`; reverse scrolling
  restores it. There are exactly three cloud elements, so more than three
  can never be visible simultaneously.
- `tsc --noEmit` and `npm run lint` passed. The production build passed
  with `npx next build --webpack`; default Turbopack could not run its
  internal port-binding worker inside the restricted verification
  sandbox, an environment limitation rather than an application error.
