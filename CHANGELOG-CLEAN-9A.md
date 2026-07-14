# LESHEM.S OS — Clean 9A: Flagship Creation + Render Flow (major reset)

## Baseline

Built on the Clean 8L tree just delivered (`AtelierCreateShell.js` mounted at
`/studio/create`, five states). Per instruction, this is a **reset of the
flagship journey**, not another patch on top of 8L: a new orchestrator
component (`FlagshipCreateShell.js`) implements the full seven-stage journey
from scratch, rather than growing more stages onto the 8L component. The
proven, already-QA'd pure logic underneath (product-type parsing/
enforcement, direction generation, brief building, intake normalization) is
reused unchanged — resetting the UX/flow layer does not mean re-deriving
logic that already works and was already verified.

`AtelierCreateShell.js`, `atelierStyle.js`, `atelierCreate.js`, the older
`CreateFlowShell.js`, and `goldenPath.js` are now **all dormant** — left in
the repo, untouched, simply not mounted. `lib/studio/renderSceneLibrary.js`,
`renderPromptFinalizer.js`, `mediaWorkflow.js`, and `outputPack.js` (the
legacy Render Studio / Media Workflow / Output Pack system used by
`/studio/projects`' panels) are also untouched and not imported anywhere in
this milestone — per "no pricing," since those modules mix scene selection
with credit/USD cost estimation in the same files. Stage 6 of this milestone
gets its own fresh, pricing-free preset module instead.

## Changed files

1. **`lib/studio/renderPrep.js`** — **new**, pure. The Stage 6 vocabulary:
   6 scene presets (Catalog White / Dark Luxury / Hand Shot / Model-
   Lifestyle / Box-Tray / Macro Stone Focus), 5 angle presets (Front / 3/4 /
   Top / Side / Macro), 4 format presets (Square / Portrait / Landscape /
   Story, each carrying its aspect ratio only — no pricing), output-count
   options (1/3/6), and 4 creativity levels (Precise / Balanced / Creative /
   Free). Plus two pure line-builders (`buildRenderPrepLineHe` /
   `buildRenderPrepLineEn`) that turn a selection into plain text — no
   external engine call, no persistence.

2. **`lib/studio/flagshipCreate.js`** — **new**, pure. `FLAGSHIP_STAGE` (7
   stages) + `FLAGSHIP_STAGE_ORDER` / `previousFlagshipStage` (component-
   owned back-navigation, no URL involvement); `ENTRY_MODE` (stone / idea /
   collection) + `requiresStone`; `inferCreativityLevel` (reads the
   already-existing `'free'` style key from `createFlow.js`'s
   `CREATE_STYLE_OPTIONS` to suggest a Stage 6 default). Re-exports the
   proven `parseRequestHe` / `buildRequestUnderstandingHe` /
   `expectedProductTypeFor` / `enforceDirectionsProductType` /
   `centerStoneNameHe` from `goldenPath.js` (same helpers Clean 8L verified)
   so the component imports from one place.

3. **`components/studio/create/flagshipStyle.js`** — **new**, additive on
   top of Clean 8L's `atelierStyle.js` (which is untouched) — same warm-
   ivory / graphite / muted-gold "Atelier White" language, extended with the
   shapes the new stages need: a 3-option welcome grid, preset chip grids,
   compact icon-action buttons, copy blocks, and a client-presentation card.

4. **`components/studio/create/FlagshipCreateShell.js`** — **new**, the
   orchestrator implementing all seven stages:
   - **Welcome** — three real entry cards (stone / idea / collection) plus
     one central free-text field; all three share the same Stage 2 (no
     parallel routes) and only change what's emphasized/required there.
   - **Intake** — stone/asset focus (required only for the "stone" entry;
     optional for "idea"; multi-item for "collection", reusing the same
     `AssetPicker` add-flow repeatedly) + the free-text request field + the
     **existing, unmodified** `CreateIntakeArea` component for drag/drop,
     upload, paste-text, paste-URL, paste-image, and STL/OBJ/GLB/GLTF file
     references (already classified by `attachedAssets.js`) — grouped with
     instant per-item feedback, exactly as it already worked.
   - **Understanding** — jewelry type / stone-or-asset summary / style /
     metal / creative-freedom level (from `inferCreativityLevel`) / a short
     reference-note clip. Confirm (disabled until a real product type is
     recognized) / Edit / Cancel, plus Back via the context bar.
   - **Directions** — exactly 3 directions from the **existing**
     `generateCreateDirections`, independently re-checked by
     `enforceDirectionsProductType` (same guard verified in Clean 8L).
     Each card has one visual placeholder, title, one description line, the
     stone/asset role, and a single "בחר" (select) action — selecting
     immediately advances to Refine.
   - **Refine** — free-text refinement bound to the selected direction's
     **existing** `conceptNotes` field, plus five quick-action chips that
     append a phrase rather than replace it; edit / regenerate / back.
   - **Render Prep** — the five preset groups from `renderPrep.js`, each a
     single-select chip row; defaults are pre-filled (Catalog White / 3-4 /
     Square / 3 outputs / the Stage-3-inferred creativity level unless the
     person overrides it). Preparation only — nothing is sent anywhere.
   - **Save + Present** — "שמור תיק יצירה" persists via the **existing**
     `projectsStore.save` + `setActiveWorkId` (unchanged from 8L); "הכן
     חבילת מדיה" reveals two copy blocks (a Hebrew render brief built from
     the **existing** `buildCreateOutputPack` professional summary plus the
     Stage-6 line, and an English ASCII-only media prompt, same pattern);
     "הצג ללקוח" shows a calm, image-first client-presentation card; a
     success card with "פתח תיקי יצירה" / "צור עוד תכשיט" appears after save.

   Every stage after Welcome keeps the same context bar pattern proven in
   8L: back (steps through `FLAGSHIP_STAGE_ORDER`), live creation title,
   stage label, a "שנה בקשה" shortcut back to Intake, and the options menu
   (שמור וצא / התחל מחדש / בטל יצירה). `stage` is a single `useState`; no
   `next/dynamic`, no Three.js, no URL/query-param stage sync anywhere.

5. **`pages/studio/create.js`** — swaps the mounted component from
   `AtelierCreateShell` to `FlagshipCreateShell`. Nothing deleted.

6. **`CHANGELOG-CLEAN-9A.md`** — this file.

## Product-type validation logic (unchanged, re-verified)

Identical mechanism to Clean 8L, re-run in QA for this milestone: free text
is parsed into a product key via the existing `CREATE_PRODUCT_OPTIONS`
vocabulary (never guessed when ambiguous); the Understanding gate's confirm
action is disabled until a real product type is found; `generateCreateDirections`
stamps one product type on all 3 directions; `enforceDirectionsProductType`
independently recomputes the expected type from `PRODUCT_TO_BRIEF` and
self-heals any mismatch before directions are ever set into state. Verified
this milestone for a stone-first pendant request (all 3 `productType:
'pendant'`) and, newly, for an **idea-mode request with no stone at all**
("עגילים גיאומטריים נועזים" → all 3 `productType: 'earrings'`), and for a
**collection-mode** request with 3 tray items (still exactly 3 directions).

## QA results

Full logic sandbox (real `createFlow.js` / `flagshipCreate.js` /
`renderPrep.js` / `designProjects.js` / `designDraft.js` against an
in-memory `localStorage` stub) — all passed:
- Entry-mode stone requirement (`requiresStone`) correct for all three modes.
- Pendant request → understanding + all 3 directions pendant.
- Idea-mode request with zero tray items → understanding + all 3 directions
  earrings (no stone required, per spec).
- Collection-mode request with 3 tray items → still exactly 3 directions.
- Creative-freedom inference: `'free'` style → `'free'` level; otherwise
  `'balanced'`.
- Render-prep preset counts exactly match spec: 6 scenes / 5 angles / 4
  formats / output counts {1,3,6} / 4 creativity levels.
- Render-prep Hebrew + English lines generated correctly; English line is
  strict ASCII; **zero** occurrence of any pricing term (credit, USD, $,
  price, cost, מחיר, עלות) anywhere in the render-prep output.
- A full forbidden-wording scan across every generated string (understanding
  sentences, directions, the existing output-pack summary/prompt/client
  text, and the new render-prep lines) confirms **zero** occurrences of
  "Output Pack", "Render Plan", "Media Workflow", "צור פלט", "עדכן פלט",
  "עגלה", "Basket", "update output", or "output flow".
- Save via the existing `saveProject` API; saved project immediately visible
  via `getAllProjects()` (reopenable from the existing `/studio/projects`).

Additional proofs:
- Full esbuild bundle regression passes on every studio page, including the
  changed `pages/studio/create.js`.
- SSR smoke test (`renderToStaticMarkup`) renders `FlagshipCreateShell`
  without error.
- Rules-of-Hooks check: no hook call appears after the component's
  conditional early-return.
- `comm -23` on `createFlow.js`: 0 exports removed, 1 added
  (`PRODUCT_TO_BRIEF` — same single addition from Clean 8L; nothing further
  changed in this file for 9A).
- `cmp` byte-identity verified against the pristine baseline for all 10
  protected files (`designProjects.js`, `workTray.js`, `designBriefStore.js`,
  `designDraft.js`, `activeWorkStore.js`, `assetsStore.js`, `assetsDb.js`,
  `AssetPicker.js`, `DesignConceptPanel.js`, `DesignOutputPanel.js`).
- Forbidden-token scan (next/dynamic, three, banned jargon) on every
  new/changed line: clean.
- `/studio/design` (incl. `/studio/workstation`), `/studio/projects`,
  `/studio/inventory`, `/mvp`, `components/v2/*`, `pages/api/*` — all
  untouched (`diff -rq` against the pristine baseline shows no differences).
- ZIP byte-identity verified after an extraction round-trip.

## Navigation ownership & flicker prevention

Same discipline as Clean 8L: `stage` is one component-owned `useState`;
`FLAGSHIP_STAGE_ORDER` + `previousFlagshipStage` define back-navigation;
`useRouter` is used only for two real navigations (open `/studio/projects`),
never for stage transitions. Browser Back navigates away from the page
entirely (standard Next.js behavior) rather than stepping back one flagship
stage — same documented trade-off as 8L, not a flicker risk either way.

## Persistence limitations (reported)

- Nothing is written to `designProjects` until "שמור תיק יצירה" / "שמור
  וצא" — no mid-draft autosave, no resume-after-refresh for an unsaved
  creation. Identical model to 8L and to the original stable baseline.
- **Render-prep selections and the creative-freedom level are not persisted
  to the project schema** (no new brief field was added). They live in this
  component's state and are only baked into the copy-able render-brief /
  media-prompt text produced at Stage 7. If the person saves, then later
  reopens the project from `/studio/projects`, the render-prep choices are
  not restored — only the saved brief/concepts/refinement text is. This was
  a deliberate choice (no new persistence key) rather than a schema change;
  happy to add a reserved field for this in a future milestone if wanted.
- Collection-mode's multiple tray items are represented as one center stone
  (first item) + accent stones (the rest) purely for the purposes of this
  creation's local brief/snapshot — it does not change any item's role in
  the shared Work Tray itself.

## Confirmations

- No protected store was edited (byte-identity verified).
- No package was added; no `next/dynamic` or Three.js import anywhere in
  new/changed files.
- No external render engine, external AI, pricing, or certificate logic
  anywhere in this milestone.
- `/studio/design`, `/studio/workstation`, `/studio/projects`,
  `/studio/inventory`, `/mvp`, `components/v2/*`, `pages/api/*` untouched.
- Legacy tools (`CreateFlowShell.js`, `AtelierCreateShell.js`, the whole
  Render Studio / Media Workflow / Output Pack panel system under
  `components/studio/projects/`) remain in the repo and functional, simply
  not surfaced anywhere in this main journey.

## Upload checklist

1. Extract `LESHEMS_OS_Clean_9A_Flagship_Creation_Render_Flow_ROOT_READY.zip`
   at the repo root (1:1 path mapping, no wrapper folder) and deploy as usual.
2. Manual click-through recommended before confirming (the logic sandbox
   proves the data/logic layer; a live run proves the actual UI/feel):
   - `/studio/create` → "יש לי אבן" → pick a stone → free text → Intake →
     Understanding (confirm type/style/metal/creativity/ref-note look
     right) → Directions (3 cards, all matching type) → select one → Refine
     (try a quick chip) → Render Prep (pick scene/angle/format/count/
     creativity) → Save + Present → "הכן חבילת מדיה" → copy both blocks →
     "הצג ללקוח" → "שמור תיק יצירה" → "פתח תיקי יצירה" and confirm it's
     there.
   - Repeat quickly for "יש לי רעיון" (no stone) and "יש לי מלאי" (pick 2-3
     assets) to confirm both alternate entry paths reach Directions cleanly.
3. No Airtable/env var changes needed for this milestone.

## QA visual alignment and flow corrections

The delivered 9A logic was retained, but the first implementation did not yet
match the approved four-screen North Star closely enough. This QA pass adds a
substantial visible alignment without changing protected stores or adding a
package:

- `/studio/create` now uses the full-bleed workspace mode, removing the extra
  active-session/work-tray bars from this focused journey while keeping the
  global navigation rail.
- Welcome is now image-first with three large atelier entry tiles and a single
  central Smart Intake field.
- Intake is now a two-panel composition: large stone/reference focus plus the
  natural-language request and existing safe intake controls.
- Understanding uses one large visual and a compact structured summary.
- Direction cards now render the existing deterministic `ConceptSketch`
  drawings instead of empty media placeholders.
- Refinement keeps the selected sketch visually dominant beside the free-text
  direction.
- Render Preparation now resembles a true studio: live large preview, scene
  thumbnails, angle/format/count/creativity controls, and the same safe local
  render-prep data.
- A compact seven-step progress indicator appears after Welcome.
- Responsive reductions are included for tablet/mobile.

Functional QA fixes included in the same pass:

- The Intake Continue action now requires the request text, and requires a
  stone only in stone-first mode.
- Opening the picker records the existing tray IDs; when it closes, the newest
  newly-added stone becomes the selected stone even when another stone was
  previously selected.
- Changing the request or selected stone clears stale directions, selection,
  prepared media state, and client-presentation state.
- Starting a Welcome path no longer silently auto-selects the first stale Work
  Tray item.

Production build: passed on Next.js 16.2.9.
