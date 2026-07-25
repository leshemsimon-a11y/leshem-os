# LESHEM.S OS — Clean 11A.2
## Atelier Refinement, UX Polish & Real Manufacturing Logic

### Baseline
Built directly on Clean 11A.1 (Living Atelier Foundation + Real Render Bridge).

### Change surface
Two new files, nine modified. Nothing else in the repository was touched.

**New**
- `lib/atelier/componentsBank.js`
- `lib/atelier/manufacturingSpec.js`

**Modified**
- `lib/atelier/livingAtelier.js`
- `lib/atelier/atelierBridge.js`
- `components/atelier/DesignPalette.js`
- `components/atelier/RenderStudioScreen.js`
- `components/atelier/UnderstandingScreen.js`
- `components/atelier/DirectionsScreen.js`
- `components/atelier/PendantVisualizer.js`
- `components/atelier/atelier.module.css`
- `pages/atelier/index.js`

Verified byte-identical after this milestone:
- `components/studio/**` (all legacy Studio UI)
- `lib/studio/**` (all shared helpers and protected stores)
- `package.json` / `package-lock.json` — no new package
- No new localStorage key, no new store, no schema change

---

## 1. UX/UI polish — Quiet Luxury

### The real problem found during review
The Atelier did not read as a technical tool because of its layout — it read that
way because of its **type scale**. The stylesheet shipped 65 declarations below
12px, including **7px and 7.5px** body text in `#66706c` grey on scene cards,
quality buttons, brief hints and render notes. That is illegible on a laptop and
invisible on a phone.

### Design system now enforced
| Token | Value |
| --- | --- |
| App background | `#FAFAFA` |
| Surface / cards | `#FFFFFF` |
| Primary text | `#1A1A1A` |
| Secondary text / labels | `#737373` |
| Borders / dividers | `#E5E5E5` |
| Primary button | `#1A1A1A` bg, `#FFFFFF` text, hover `#333333` |
| Corner radius | `2px` everywhere except true circles |
| Button padding | `12px` vertical, `24px` horizontal |
| Body weight | `300` |
| Button / header weight | `500` |

### Applied
- **No font below 12px anywhere.** Final scale is 12 / 13 / 14 / 15 / 16px plus
  headings. Every `font-weight` of 600–900 was normalised to 500.
- **Contrast fixed on every button state.** The disabled state was `#737373` on
  `#E5E5E5` (≈2.5:1, fails AA); it is now `#737373` on `#F5F5F5` (≈4.7:1, passes).
- **Selected states are unmistakable.** Previously "selected" was a faint tint;
  every selected control is now ink-filled with white text, and nested labels
  invert with it. Added `:focus-visible` outlines to every interactive control.
- **Flat surfaces.** Removed the ambient gradient wash, the translucent
  `backdrop-filter` bars, the gradient tiles and the drop shadows on primary
  buttons. Metal swatch gradients were deliberately **kept** — those represent
  real material colour, not UI decoration.
- **Technical clutter removed from view:** the "Stability-ready" engine badge,
  the `STABILITY_API_KEY` note that was being shown to clients, and the raw
  "what goes into the engine brief" drawer.

### Technical AI controls stripped
Deleted entirely — data model, UI and CSS:
- The four design sliders: **presence, modernity, richness, stoneFocus**
- Render **creativity** (precise / balanced / expressive)
- Render **quality** tier (Core / Ultra)

The client now sees only jewelry decisions. Quality is fixed at the studio's
standard; interpretation is no longer offered because the manufacturing spec is
authoritative.

---

## 2. The Components Bank

`lib/atelier/componentsBank.js` — the studio's standard default catalog. Pure
data and pure functions; no store, no network, no persistence key.

**Metals** — 14K and 18K in yellow / white / rose, plus platinum 950. Each
carries real alloy purity (585 / 750 / 950) and published density
(13.07 / 15.58 / 20.9 g/cm³ etc.), so a Rhino/Matrix volume converts to a true
casting weight via `metalWeightFromVolume()`.

**Melee** — natural diamond, lab-grown diamond, blue sapphire, ruby, emerald,
and none. Standard round melee sizing from 1.0mm to 3.0mm with accepted trade
weights (1.5mm = 0.015ct, 2.0mm = 0.03ct …) and `meleeTotalCarat()`.

**Settings** — 4-prong, 6-prong, bezel, halo. `prongCount` is carried as a hard
geometric constraint, and the halo carries its own `haloStoneCount`.

**Fixed components** — cable and box chains (length, gauge, weight), push /
screw / alpha earring backs, hidden and V-bail pendant bails.

### Pricing: fields prepared, numbers never invented
Every priceable component ships `pricingStatus: 'pendingAirtable'` with its cost
fields set to `null` — `costPerCarat`, `settingCostPerStone`, `costPerGram`,
`settingLabor`, `costPerUnit`, `costPerPair`.

`estimateCreationCost(spec, pricebook)` is fully functional today. Given an empty
pricebook it returns `complete: false`, `isQuote: false` and an explicit
`missing[]` array naming every input the studio still owes. Given real rates it
returns a full line-item breakdown. It will never produce a number that looks
like a quote but isn't one.

Verified:
```
empty pricebook  -> complete: false | missing: metal, centerStone,
                    meleeStones, meleeSetting, settingLabor
real rates       -> complete: true  | subtotal: 2272.2
                    metal 3.2g = 198.4 · center = 1800 · melee 0.24ct = 100.8
                    · melee setting x16 = 128 · 4-prong labour = 45
```

Every record is Airtable-sync-shaped (`key` / `sku` / `source` / `airtableId`)
so a later sync updates records in place instead of restructuring the bank.

---

## 3. Strict geometric accuracy — the render bridge

`lib/atelier/manufacturingSpec.js` builds one deterministic spec from the
selected components plus the real Work Tray stones, then renders it as a
numbered, non-negotiable English instruction.

### Three hallucination sources found and closed

1. **Metal karat was being discarded.** `METAL_EN` in `lib/studio/outputPack.js`
   hardcodes `18k` for every gold — a 14K selection silently rendered as 18K.
2. **Cuts were never resolving.** Inventory stores shapes as display text
   (`"Round Brilliant"`, `"אמרלד קאט"`), which never matched the lowercase
   `SHAPE_EN` keys. Cuts were passing through unmapped.
3. **Two competing descriptions in one prompt.** The generic opener described
   the same piece in looser terms alongside the spec.

The Atelier now builds its own authoritative prompt and strips the superseded
lines from the shared package. `lib/studio/**` was not modified.

### What the lock enforces
- Exact piece count (a pair of earrings is two mirror-identical pieces)
- Exact alloy and colour, with no second metal anywhere
- Exact cut, with its correct facet count, and an instruction not to substitute
- Exact prong count — "exactly 4 prongs", "exactly 6 prongs", or none for bezel
- Exact melee count, size and total carat weight
- Single halo row only — no second row, no hidden halo, no unrequested pave
- Explicit manufacturability and a clause stating the spec overrides all style

### Material accuracy
A gem-optics table gives each species its true optical identity, because a
render engine will otherwise draw every transparent stone as a diamond:

- **Quartz** — *"low refractive index with calm gentle sparkle, minimal
  dispersion, explicitly NOT diamond-like brilliance or fire"*
- **Lab-grown diamond** — *"true diamond optics identical to a natural diamond"*
  (it is optically identical and must not render as something lesser)
- **Emerald** keeps its jardin; **Paraiba** keeps its neon cuprian glow;
  **opal** and **pearl** stay unfaceted

The negative prompt adapts to refractive index: low-RI stones block
"diamond-like fire", high-RI stones block "dull glassy low-brilliance".

### Directions now share one component spec
Previously card 2 forced a bezel and card 3 forced a halo regardless of the
selection — so the client chose a card the render would not match. All three
directions now preview the **selected** components and differ only in design
language. The component choice is treated as final.

---

## 4. Cataloging & persistence

`normalizeBrief()` in `lib/studio/designDraft.js` whitelists brief fields, so any
new field would be silently dropped on save. The components therefore travel
through the **existing** encoded-notes channel that 11A.1 established, with the
marker advanced to `LESHEMS_ATELIER_11A2`.

Every completed creation now records:
- exact metal (alloy + colour + SKU), setting (+ prong count), melee (type,
  origin, count, size, total carat), chain, bail and earring back
- a human-readable Hebrew production line inside the notes
- the same component fields on **each saved render result**, so any image traces
  back to a manufacturable spec

`buildCatalogRecord(project)` returns a flat, Airtable-friendly record derived on
read. `listAtelierWorkFiles()` now returns `metalKey`, `settingKey`, `meleeKey`,
`meleeCount` and `specSummaryHe`, so saved work is filterable and priceable.

### Backward compatibility
11A.1 creations migrate forward on open: `prong` → `prong4`, `fineCable` →
`cable`, `classic` bail → `vBail`, `metalPreference: whiteGold` →
`gold18kWhite`. Sliders are dropped. User-written notes survive the round trip
and the old marker is removed. Verified.

---

## Verification performed

- Full Atelier surface parses clean (TypeScript in JSX mode, all components,
  lib and pages).
- **Zero missing CSS-module class references**; braces balanced; zero sub-12px
  font sizes remaining.
- `components/studio/**`, `lib/studio/**` and `package.json` confirmed
  byte-identical to the 11A.1 baseline.
- Pure logic executed under Node against real inventory records: emerald
  pendant, rose-quartz ring, platinum earring pair, 11A.1 config migration,
  notes round-trip, and both cost-engine paths.
- One bug found and fixed during that run: earrings produced *"a matched pair of
  matched pair of earrings"*. `PRODUCT_RULES.earrings.en` is now the bare noun.

### Not verified
`npm ci` and `npm run build` were **not** run — the build container has no
network access, so `node_modules` could not be installed. Please run both before
deploying. No new import points outside `lib/atelier/*` were introduced, so the
risk is low, but the build is genuinely unverified.

---

## Recommended QA after Vercel is green

1. Open `/atelier` on desktop **and phone**. Confirm no text is smaller than the
   Hebrew body copy and every button label is legible.
2. Choose the emerald from inventory. Write `תליון עדין ומודרני בזהב ורוד`.
3. Select pendant → 14K → rose → halo → lab-grown melee → 1.25mm → 16 stones →
   box chain → V-bail. Confirm the live carat readout shows `0.136 קראט`.
4. Confirm no slider, no "creativity", no "quality" control appears anywhere.
5. Continue to "מה הבנתי" and verify the production spec line lists metal,
   setting, melee count and findings.
6. Generate three directions — all three must preview the **same** components.
7. Enter the render bench. Confirm the spec strip shows the manufacturing line
   and that only scene / angle / format / count are offered.
8. Generate one render. Confirm it comes back as **14K rose gold**, not 18K
   white, and that the halo is a single row of 16 stones.
9. Reopen through "היצירות שלי" and confirm every component returns.
10. Open a creation saved under 11A.1 and confirm it migrates without error.

## Recommended commit
`Clean 11A.2 Components Bank, geometry lock and Quiet Luxury UI`
