# LESHEM.S OS — Clean 11A.3
## "Quiet Luxury" Mobile-First UX Injection

### Baseline
Built on Clean 11A.2 (Components Bank, Geometry Lock, Quiet Luxury tokens).

### Change surface — visual and layout only
**Modified**
- `components/atelier/StoneRequestScreen.js` — rewritten as a guided flow
- `components/atelier/DesignPalette.js` — split into standalone step panels
- `components/atelier/atelier.module.css` — mobile-first layer + cleanup

**Verified byte-identical to 11A.2** (the critical boundary you set):
- `lib/atelier/atelierBridge.js`
- `lib/atelier/componentsBank.js`
- `lib/atelier/manufacturingSpec.js`
- `lib/atelier/livingAtelier.js`
- `components/studio/**`, `lib/studio/**`, `package.json`

No generation logic, no data structure and no Components Bank field was touched.

---

## 1. Design system — already in place, now audited

The token system you specified shipped in 11A.2 and is unchanged: `#FAFAFA`
app / `#FFFFFF` surfaces, `#1A1A1A` primary text, `#737373` secondary,
`#E5E5E5` borders, 2px radii, 12px/24px button padding, weight 300 body and
500 for titles and buttons.

Re-audited after this milestone:
- **0** font declarations below 12px
- **0** missing CSS-module class references
- **0** orphaned CSS classes
- Primary buttons `#1A1A1A` / `#FFFFFF`, hover `#333333`; secondary transparent
  with an `#E5E5E5` border and `#1A1A1A` text
- Selection state is a 1px `#1A1A1A` border with an ink fill — no coloured
  shadows anywhere

Added in this milestone: every interactive element now has a **44px minimum
touch target**, and the sticky bottom bar respects `env(safe-area-inset-bottom)`
so it clears the iOS home indicator.

---

## 2. UX restructuring — the guided flow

### What was wrong
The intent phase was a single scrolling form that asked for everything at once:
stone hero, structural preview, live understanding card, free-text request, six
component groups (product, style, metal, setting, melee, findings) and the
reference drawer. On a phone that is a very long column of unrelated decisions.
That, more than the styling, is what made it read as a dashboard.

### What it is now
Four deliberate steps, one decision at a time:

| Step | Decision |
| --- | --- |
| 1 · האבן | Stone selection + the free-text request + references |
| 2 · התכשיט | Product type + design language |
| 3 · המתכת | Alloy (14K / 18K / platinum) + colour |
| 4 · הרכיבים | Setting + melee + findings |

- A horizontal step rail sticks under the header, scrolls on narrow screens and
  lets the user jump **back** to any completed step (never forward past an
  unmade decision).
- Each step declares its own precondition, so a user is never blocked by a
  requirement belonging to a different step — "בחר אבן" only gates step 1,
  "בחר סוג תכשיט" only gates step 2.
- The piece under construction stays visible at every step: the stone, the
  live structural preview (from step 2 onward) and the running production spec.

`DesignPalette.js` was split into `ProductPanel`, `StylePanel`, `MetalPanel`,
`SettingPanel`, `MeleePanel` and `FindingsPanel`. Each takes a `bare` prop that
drops the card chrome when it renders inside the guided flow. The composed
default export is retained, so a single-page view remains available.

### Mobile-first, genuinely
The previous stylesheet was desktop-first: full desktop layout in the base
rules, then three `max-width` blocks tearing it down. The guided flow is built
the other way — the phone layout is the base rule, and wider viewports are
additive `min-width` enhancements at 768px, 901px and 1024px. The two-column
desktop layout is now the enhancement rather than the assumption.

The duplicate journey stepper in the header is hidden below 680px; the guided
rail already states position, and two stacked steppers on a 380px screen is
noise rather than orientation.

### Technical clutter
Confirmed still absent from the UI: creativity, quality tier, and the four
design sliders (presence / modernity / richness / stoneFocus). Their data model
was deleted in 11A.2 — there is nothing left to hide. The render bench continues
to expose only scene, angle, format and image count.

---

## 3. Stone imagery — one finding you should read

> Requirement: *"must flawlessly display the exact selected stone image from the
> inventory (never falling back to a generic placeholder)"*

**This cannot be fully satisfied from the UI layer, and the reason is in the
data, not the CSS.**

`lib/atelier/atelierBridge.js` line 125, `inventoryItemToStoneCard()`:

```js
image: null,
```

Manually-added inventory stones are mapped into the Atelier with **no image
field at all**. Only seeded demo records (line 141) carry
`boxThumb || boxImage`. So for a real stone the studio entered by hand, there is
no photograph in the data for the UI to display. Fixing that means resolving
thumbnails through the Asset Library — which lives in `atelierBridge.js`, the
file this milestone was explicitly forbidden to touch. It was also listed as a
known boundary at the end of 11A.1 and was not closed in 11A.2.

**What was done instead.** The old screen fell back to a generic stock image
(`empty_studio_start_stones_to_jewelry_v01.png`) whenever no image resolved —
exactly the behaviour you want gone. That fallback is deleted. The new
`StoneMedia` component has three honest states:

1. **Image present** → shown whole, `object-fit: contain`, no crop, no zoom, no
   filter. What the studio owns is what appears.
2. **Stone selected but no photograph** → a typographic spec card with the real
   gemological record (name, type, cut, carat) and the note
   *"לרשומה זו עדיין לא צורף צילום"*.
3. **No stone yet** → a dashed prompt to open the inventory.

No generic placeholder is ever shown for a real stone. State 2 is a deliberate
choice: an honest data card is better than a stock photo of a different stone,
which would be precisely the "imaginary geometry" the brief prohibits.

**Recommended for 11A.4:** connect the Asset Library resolver in
`atelierBridge.js` so `inventoryItemToStoneCard()` returns a real thumbnail.
That is a one-file change to a file this milestone deliberately left alone.

### Presentation fidelity
The structural preview is labelled *"המחשת מבנה — לא הדמיה סופית"* at every
step, so a conceptual SVG is never mistaken for a CAD-accurate output. Direction
cards continue to preview the identical selected components (locked in 11A.2),
so the card a client chooses is the piece that gets rendered.

---

## Verification performed

- Full Atelier surface parses clean (TypeScript in JSX mode).
- 0 missing CSS classes, 0 orphaned classes, braces balanced, 0 sub-12px fonts.
- The four core logic files confirmed **byte-identical** to the 11A.2 ZIP via
  `cmp`.
- `lib/studio/**`, `components/studio/**` and `package.json` byte-identical to
  the original baseline.
- `StoneRequestScreen` prop contract unchanged, so `pages/atelier/index.js`
  required no modification in this milestone.

### Not verified
`npm ci` / `npm run build` still **not run** — the container has no network, so
`node_modules` cannot be installed. This carries over from 11A.2 and remains the
one genuine risk. Please run both before deploying.

---

## Recommended QA

1. Open `/atelier` on a phone. The header should show the wordmark and actions
   only — no journey stepper — with the four-step rail beneath it.
2. Step 1: confirm "המשך" is disabled until a stone is chosen, and that the
   stone photo appears uncropped.
3. Pick a **manually-added** inventory stone (not a demo stone). Confirm you get
   the typographic spec card, not a stock photo.
4. Step 2: confirm "המשך" is disabled until a product type is selected.
5. Steps 3–4: confirm the running spec line under the preview updates live as
   metal, setting and melee change.
6. Tap a completed step in the rail — it should navigate back. Tap a future
   step — it should not respond.
7. Rotate to landscape / open on desktop: the preview should become a sticky
   left column at 1024px and above.
8. Confirm no slider, "creativity" or "quality" control appears anywhere.

## Recommended commit
`Clean 11A.3 guided mobile-first Atelier flow`
