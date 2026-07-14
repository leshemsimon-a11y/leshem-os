# LESHEM.S OS — Clean 8K-R4: Golden Path Reset

## Baseline

Built on the verified **Clean 8K-R3 QA Fixed (Atelier Experience System)**
baseline. This is a reset, not another feature: it replaces the internals of
`/studio/create`'s guided flow with ONE reliable, fully-reversible scenario —
"יש לי אבן ואני רוצה ליצור תכשיט" — and enforces product-type consistency in
code rather than relying on prompt wording. `/studio` (Welcome Studio, four
entry paths), inventory, projects, and every protected store are untouched.

## Changed files

1. `lib/studio/goldenPath.js` — **new file**, pure helpers only (no store, no
   persistence, no network):
   - `parseRequestHe(text)` — parses a free-text Hebrew request into the
     SAME `product`/`style` vocabulary `generateCreateDirections` /
     `buildCreateBrief` already accepted from the old chip pickers, plus a
     metal preference using the existing `METAL_PREFERENCE` values.
     "Other"/ambiguous requests are deliberately left undetected rather than
     guessed, so the understanding gate's confirm action stays disabled
     until a real product type is found.
   - `buildRequestUnderstandingHe(...)` — the "מה הבנתי" sentence. Returns
     `null` when nothing was understood (gates the primary action).
   - `directionsMatchProductType` / `enforceDirectionsProductType` — the
     explicit product-type enforcement guard described below.
   - `deriveResumeStage(brief, trayItems)` / `isCreateFlowProject(project)` —
     resume support, derived entirely from already-existing, already-valid
     brief fields. No new persistence key or field anywhere.

2. `lib/studio/createFlow.js` — **additive only**, nothing removed
   (`comm -23` proof: zero exports removed, one added — `PRODUCT_TO_BRIEF`,
   made visible so the enforcement guard can compute the expected type
   independently instead of duplicating the mapping table):
   - `generateCreateDirections` / `buildCreateBrief` / `buildCreateOutputPack`
     now accept an optional `metalPreference` and use it — metal is threaded
     into `metalSuggestion` on every generated direction (was always `''`),
     into the brief's existing `metalPreference` field, and into the client
     description / EN render-prompt hint. Absent metal degrades to the
     exact previous copy.

3. `components/studio/create/CreateFlowShell.js` — **full rewrite** (as in
   Clean 8H, this file's structural changes are large enough to replace
   wholesale rather than patch). Implements the golden path exactly:
   stone → request → understanding gate (confirm / edit) → exactly 3
   product-type-enforced directions → select → refine (free text, persisted
   into the concept's existing `conceptNotes` field) → presentation → save.
   Every stage after Stone exposes חזרה, a "שנה בקשה" shortcut, and a
   compact options menu (שמור וצא / התחל מחדש / בטל יצירה). No stage is
   one-way. Work Tray / Output Pack / Render Plan / Media Workflow / "פלט"
   are not surfaced anywhere in this component.

4. `CHANGELOG-CLEAN-8K-R4.md` — this file.

## Product-type enforcement (the critical requirement)

`generateCreateDirections` already derives one product type from its
`product` input and stamps it on all 3 directions from a single computed
value — so in this codebase a mismatch could only arise from the NEW
free-text parsing step choosing the wrong type going in, not from the
generator diverging internally. The golden path treats this as a
belt-and-suspenders problem rather than a single point of trust:

- The understanding gate's primary action ("נכון, הצע כיוונים") is disabled
  until `parseRequestHe` finds a real product type — an unclear request
  cannot proceed to generation at all.
- After generation, `enforceDirectionsProductType` independently recomputes
  the expected type from `PRODUCT_TO_BRIEF` (the same table
  `buildCreateBrief` uses) and force-corrects any direction whose
  `productType` does not match, rather than trusting the generator's
  output as-is.
- Verified directly: for **"תליון עדין ומודרני בזהב לבן"**, all 3 generated
  directions are `productType: 'pendant'`, zero are `'ring'`. For **"טבעת
  קלאסטר מודרנית"**, all 3 are `'ring'`, zero are `'pendant'`. A tampered
  set (one direction manually flipped to `'ring'` mid-test) is detected and
  self-healed back to full consistency.

## Normalized creation brief

Single source of truth from the understanding gate onward, carrying exactly
the fields the milestone asked for, all on the brief's EXISTING schema:

```
{
  productType,       // existing PRODUCT_TYPE value (e.g. 'pendant')
  styleDirection,    // existing STYLE_PREFERENCE value (e.g. 'delicate')
  metalPreference,   // existing METAL_PREFERENCE value or null (e.g. 'whiteGold')
  designGoal,        // the verbatim free-text request
  concepts,          // the 3 generated directions, each carrying its own
                      // validated productType + conceptNotes (refinement)
  selectedConceptId, // id of the chosen direction, or null
}
```

## Navigation / reversibility

- חזרה — steps back one stage; never clears any field.
- שנה בקשה — jumps directly to the request stage from Understanding,
  Directions, Refine, or Presentation, with the original text intact.
- Options menu (every stage): שמור וצא (commits progress via the existing
  save/update path, then leaves) · התחל מחדש (clears the in-progress local
  session only — a prior שמור וצא is not deleted) · בטל יצירה (clears the
  active-work pointer and leaves).
- Browser back: each stage mirrors into a shallow `?stage=` query param
  (first stage via `router.replace`, every later change via `router.push`),
  so the browser's own back button moves between stages of the same
  mounted session instead of leaving the page and losing state.

## Save / reopen

`שמור וצא` and `שמור ביצירה` both call the same commit path: the existing
`projectsStore.save(...)` the first time, then the existing
`updateProject(id, patch)` on every save after that for the SAME project
(tracked locally, never a duplicate). Reopening reads `getActiveWorkId()` +
`getProject(id)`, confirms the project actually belongs to this flow via
`isCreateFlowProject` (an existing marker string already written into the
brief's `notes` field — never hijacks a `/studio/design` project), and
derives the resume stage from the brief's existing shape.

## Known, accepted gap

If the person closes the tab mid-flow without ever pressing שמור וצא, that
in-progress state is not recoverable — the same "persistence only at an
explicit save point" rule the prior Create Flow already followed. The
options menu keeps שמור וצא one tap away from every stage precisely so this
is rarely reached; fixing it fully would require a new autosave persistence
key, which was out of scope to add silently.

## Safety

- No protected store internals edited — verified byte-identical to baseline:
  `designProjects.js`, `workTray.js`, `designBriefStore.js`, `designDraft.js`,
  `activeWorkStore.js`, `assetsStore.js`, `assetsDb.js`, `package.json`.
- No protected UI files edited — verified byte-identical to baseline:
  `AssetPicker.js`, `DesignConceptPanel.js`, `DesignOutputPanel.js`.
- No new packages (`package.json` byte-identical to baseline).
- No new persistence key or schema field — `metalPreference` and
  `conceptNotes` were already valid, already-persisted fields the Create
  Flow simply never populated before.
- The QA pass changes only the visible orchestration points required to make
  the Golden Path genuinely primary: `WelcomeCreationFlow.js`, the inventory
  CTA, the focused `/studio/create` mount, and one additive StudioShell prop.
  No Welcome visuals, store schemas, or advanced Studio internals were changed.
- No Stability API connection, no real render generation.
- Full repo diff confirms 7 changed/added source files plus this changelog;
  nothing was deleted.

## QA — golden scenario (verified this session)

Verified directly against the real logic (not simulated): a stone-select →
free-text request → understanding → generate → select → refine → save →
resume sequence was run through the actual `generateCreateDirections`,
`buildCreateBrief`, and the actual `designProjects.js` / `activeWorkStore.js`
store modules (in-memory localStorage stub, no browser needed):

- "תליון עדין ומודרני בזהב לבן" → understanding gate reads exactly
  **"תליון עדין ומודרני בזהב לבן, כשהאבן המרכזית היא האמרלד."** → 3/3
  directions `productType: 'pendant'`, 0 rings.
- Changed the request to "טבעת קלאסטר מודרנית" → 3/3 directions
  `productType: 'ring'`, 0 pendants.
- Selected a direction, added the refinement "פחות גבוה ועם שיניים עדינות
  יותר" → persisted into that concept's `conceptNotes` and survives a full
  save → reload round-trip.
- First save creates one project; a second save (simulating שמור וצא
  pressed again) updates the SAME project — confirmed exactly one project
  exists in storage afterward, never a duplicate.
- Reloading from `getActiveWorkId()` + `getProject()` correctly resumes at
  the Refine stage (a direction was already selected).
- An unrelated `/studio/design`-style brief is correctly NOT recognized as a
  resumable create-flow project.
- 36/36 pure-logic assertions, 15/15 store-integration assertions, 3/3 SSR
  smoke-test assertions — all passing.

## Build verification — QA environment

The merged Clean 8K-R3 QA baseline + R4 + this QA integration pass was built
locally with the repository's real production command:

- `npm ci --ignore-scripts` — completed.
- `npm run build` — passed on Next.js 16.2.9.
- All 20 routes, including `/studio`, `/studio/create`, `/studio/inventory`,
  `/studio/design`, and `/studio/projects`, compiled and prerendered cleanly.
- The exact Hebrew request `תליון עדין ומודרני בזהב לבן` was executed through
  the real parser/generator helpers: 3/3 directions were `pendant`, zero rings.

## Upload checklist

Apply the QA-fixed Git Slim ZIP at repo root. It contains exactly these files:

1. `lib/studio/createFlow.js`
2. `lib/studio/goldenPath.js`
3. `components/studio/create/CreateFlowShell.js`
4. `components/studio/demo/DemoInventoryWorkspace.js`
5. `components/studio/shell/StudioShell.js`
6. `components/studio/welcome/WelcomeCreationFlow.js`
7. `pages/studio/create.js`
8. `CHANGELOG-CLEAN-8K-R4.md`

Then commit, push, confirm Vercel green, and manually run the exact Golden Path.


## QA integration fix

The original R4 source logic compiled, but the real primary journey still had
three integration leaks outside those files. This QA pass corrects them:

- `יש לי אבן` on the Welcome Studio now opens `/studio/create`, the canonical
  Golden Path, instead of the older Welcome workspace.
- Inventory's visible `צור איתה / צור עם האבנים שנבחרו` action now returns to
  `/studio/create`, not `/studio/design`.
- `/studio/create` keeps global navigation but hides duplicate Active Session
  and Work Tray chrome, and no longer mounts the legacy Materials/Assets strip
  below the focused flow.
- `התחל מחדש` and `בטל יצירה` clear the temporary tray and active pointer via
  existing public APIs, so the next creation does not inherit the old stone.
- `החלף אבן` clears the current selection and opens inventory.
- Editing the source request invalidates old directions immediately; a browser
  back into the directions URL shows a safe re-confirm message rather than
  stale suggestions from the previous product type.

No protected store internals, packages, APIs, or persistence keys were changed.
