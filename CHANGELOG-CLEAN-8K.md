# LESHEM.S OS — Clean 8K: Human Jewelry Intelligence + Visual Workspace Consolidation

Builds on the Vercel-confirmed Clean 8J baseline (including the post-8J QA
correction — one clear render entry point, real multi-scene batch planning —
documented in the uploaded `CHANGELOG-CLEAN-8J.md`, preserved untouched).
This milestone is UX, terminology, visual hierarchy, and workflow
consolidation only: no external AI API, no real render generation, no
packages, no new persistence keys, no protected-store edits, and
`/studio/workstation` was not touched. Existing routes and internal data
structures are unchanged; only VISIBLE strings and a small number of new,
additive UI insertion points changed.

---

## Baseline safety check (before any 8K work)

The uploaded ZIP was compared file-for-file against the Clean 8J delivery.
Four files differed: `CHANGELOG-CLEAN-8J.md`, `MediaWorkflowPanel.js`,
`RenderStudioPanel.js`, and `renderSceneLibrary.js` — all four already
documented in the uploaded changelog under "Post-delivery QA correction —
one clear render path + real batch plan" (Media Workflow now opens the
Render Studio directly as the single render entry point; the output-count
selector applies per-scene across the whole pack; the saved plan now
contains a real multi-scene `batchItems` array and a `futureApiBatchRequest`).
Nothing else in the tree differed. This was accepted as the safe, current
baseline; Clean 8I/8J were **not** rebuilt.

---

## Changed files (6 new · 8 changed · 1 changelog)

### NEW — `lib/studio/humanTerms.js`
Pure data + pure string functions only. The Primary Visible Terms table
(section 1), the Creative-Area rail labels/tooltips (section 2), the
"אפשרויות נוספות" constant (section 3), the terminology/microcopy mapping
(section 6), and the section-7 jewelry-aware feedback phrase builders
(`stonesFeedbackHe`, `metalFeedbackHe`, `referenceFeedbackHe`,
`directionsFeedbackHe`). No store access anywhere in this file.

### NEW — `lib/studio/jewelryAdvisor.js`
Pure, deterministic, LOCAL logic only — no AI API, no randomness, no
network. `buildAdvisorInsight(ctx)` builds the three Advisor sections
("מה הבנתי" / "המלצת המעצב" / "הצעד הבא") from data the Design Studio
already holds (tray items, brief, concepts, selected concept, output),
reusing the EXACT SAME primitives (`hasStones`, `hasConcepts`,
`conceptsStale`, `selected`, `output`, `outStale`) the shell's own primary
button already computes, so the advisor never contradicts the button the
user sees. `buildContextSummaryHe` builds the compact "3 אבנים · 2 רפרנסים
· כיוון אחד נבחר" line for the Active Creation Context.

### NEW — `lib/studio/smartCommand.js`
Pure, deterministic, LOCAL keyword classifier only — no AI API. Maps free
text to one of 7 known safe intents (`OPEN_STONES`, `OPEN_REFERENCES`,
`ADD_REFERENCE_TEXT`, `OPEN_DIRECTIONS`, `OPEN_RENDER_STUDIO`,
`OPEN_PRESENTATION`, `EXPLAIN_NEXT_STEP`) or `UNKNOWN`. Ships the exact
required fallback message and per-intent "before performing a known action"
interpretation lines from the spec. `classifyCommand()` has zero side
effects — it only decides what should happen; the Design Studio shell
performs the actual (already-existing, already-safe) action.

### NEW — `components/studio/shared/AdvisorPanel.js`
Presentational only. Exactly three short sections, no more. Uses the
existing near-white/graphite `reset` style module (no gold decoration).
Renders nothing (`null`) when no insight is supplied.

### NEW — `components/studio/shared/SmartCommandBar.js`
Presentational only — a single labeled free-text input ("ספר לי מה תרצה
ליצור או לשנות…") plus a send button and a response line. It has NO
knowledge of intents, stores, or routing: it hands raw text to the
`onSubmitCommand` prop (owned by the shell) and displays whatever
`{ responseHe }` comes back.

### NEW — `components/studio/shared/CreativeAreaRail.js`
Presentational only. Five inline-SVG icons (no icon package) with short
Hebrew labels, tooltips, and an active state — אבנים / השראה / כיוונים /
הדמיה / הצגה. A NEW, separate small rail: it does not alter or replace the
existing `StudioWorkflowRail.js` step indicator, which keeps working
exactly as it did in Clean 8H/8I/8J (confirmed byte-identical below).

### CHANGED — `components/studio/design/shell/StudioShell.js`
The single largest touched file, edited with the smallest safe insertion
points only — no existing logic, prop, or behavior was altered:

- Added one import block (the 6 new modules/components above).
- Added one new block of READ-ONLY derived state right before the existing
  `staleBanners` computation: `referenceCount`, `contextSummaryHe`,
  `advisorInsight`, `creativeArea`, `onSelectCreativeArea`, and
  `handleSmartCommand` — every one of these is either a pure function call
  over data already computed above, or a handler that only calls EXISTING
  safe actions already used elsewhere in this same file
  (`setActiveStep`, `setPickerOpen`, `router.push`,
  `briefStore.update`). No new store, no new state shape, no protected file
  touched.
- Added ONE optional prop to the existing `<ActiveWorkControlBar>` call
  (`contextSummary`).
- Added ONE new JSX row — `<div style={styles.humanRow}>` containing
  `CreativeAreaRail`, `AdvisorPanel`, `SmartCommandBar` — between the
  existing Active Work Control bar and the existing middle grid. Every
  existing row (`topRow`, `ActiveWorkControlBar`, `middle`) is otherwise
  untouched.
- Updated `styles.shell.gridTemplateRows` from `'auto auto minmax(0, 1fr)
  auto'` to `'auto auto auto minmax(0, 1fr)'` — reassigning track roles to
  match the new 4th top-level child (the flexible `middle` track is now
  correctly the 4th track instead of an unused 4th track sitting after it)
  — and added one new `humanRow` style block. No other style, grid column
  definition, or layout value changed.

### CHANGED — `components/studio/shared/ActiveWorkControlBar.js` (terminology + one new optional prop)
- `activeBadge`: "תיק פעיל" → "היצירה הפעילה"
- `noActive`: "אין תיק פעיל" → "אין יצירה פעילה"
- `openProjects`: "פתח תיקי עבודה" → "פתח תיקי יצירה"
- `clearStudio`: "נקה סטודיו" → "סגור את היצירה הפעילה"
- `openMedia`: "פתח מדיה והדמיות" → "פתח הדמיות ותצוגה"
- `mediaNeedsWorkFile`: updated to use "תיק יצירה" / "הדמיות ותצוגה"
- NEW optional prop `contextSummary` — renders a second compact line under
  the active Work File name when supplied. Existing call sites without this
  prop render byte-for-byte the same bar as before (verified in the logic/
  SSR sandbox).

### CHANGED — `components/studio/design/shell/StudioCommandBar.js` (terminology only)
`saveLabel` now reads "שמור עדכון בתיק היצירה" / "שמור בתיק היצירה" (was
"שמור עדכון בתיק פעיל" / the shared `L.saveSession` value). Kept as a local
literal, following this file's own established Clean 6H convention of not
touching the widely-shared `lib/studio/labels.js` for a single-use label —
`labels.js` is used by ~40+ files including the off-limits
`/studio/workstation` route (`WorkstationCanvas.js` reads
`STUDIO_5D_HE.statusOutputReady`/`statusOutputStale`), so it was left
completely untouched (confirmed byte-identical below) to keep this
milestone's blast radius to exactly the files it names.

### CHANGED — `components/studio/projects/MediaWorkflowPanel.js` (terminology only)
`title`: "מדיה והדמיות" → "הדמיות ותצוגה". Nothing else in this file changed
— the Clean 8I/8J render-entry-point consolidation from the accepted
baseline is fully preserved.

### CHANGED — `components/studio/projects/OutputPackPanel.js` (terminology only)
`title`: "חבילת פלט" → "ערכת הצגה". `sectionAssets`: "נכסים ורפרנסים" →
"חומרי עבודה והשראה". `openMedia`: "העבר למדיה והדמיות" → "העבר להדמיות
ותצוגה".

### CHANGED — `components/studio/projects/WorkFilesPanel.js` (terminology only)
`title`: "תיקי עבודה" → "תיקי יצירה". `openPackAction`: "חבילת פלט" →
"ערכת הצגה". `mediaAction`: "מדיה והדמיות" → "הדמיות ותצוגה".
`activeBadge`: "תיק פעיל" → "היצירה הפעילה" (consistency with the Design
Studio shell's own Active Creation Context term).

### CHANGED — `components/studio/projects/RenderStudioPanel.js` (terminology only)
`openMedia`: "פתח מדיה והדמיות" → "פתח הדמיות ותצוגה". No other line
changed — the accepted post-8J single-primary-action correction
("שמור תוכנית הדמיה") is fully preserved.

### CHANGED — `components/studio/create/CreateFlowShell.js` (terminology only)
- `generate`: "צור כיווני עיצוב" → "הצע כיוונים" (exact spec phrase)
- `regenerate`: "צור כיוונים מחדש" → "הצע כיוונים מחדש"
- `generatedBanner` / `selectHint`: "בחר כיוון כדי להמשיך" → "בחר להמשך"
- `nextRecommended`: "שמור כתיק עבודה" → "שמור בתיק היצירה"
- `step7`: "שמירת תיק עבודה" → "שמירת תיק יצירה"
- `save`: "שמור כתיק עבודה" → "שמור כתיק יצירה"
- `openProjects`: "פתח תיק עבודה" → "פתח תיקי יצירה"
- `openFullPack`: "פתח חבילת פלט מלאה" → "פתח ערכת הצגה מלאה"

`openMedia` ("הכן הדמיה") and `createAnother` ("צור עוד תכשיט") were left
unchanged — the former is the Clean 8I/8J primary render action users
already know, and the latter is "start a new piece," not "generate creative
options," so the "צור"→"הצע" swap doesn't apply to it.

### NEW — `CHANGELOG-CLEAN-8K.md`
This file.

---

## Terminology changes (full table)

| Old (visible) | New (visible) |
|---|---|
| תיק פעיל / תיק עבודה (Active Work File) | היצירה הפעילה |
| תיקי עבודה (Work Files) | תיקי יצירה |
| נכסים ורפרנסים (Assets/References combined) | חומרי עבודה והשראה |
| חבילת פלט (Output Pack) | ערכת הצגה |
| מדיה והדמיות (Media Workflow) | הדמיות ותצוגה |
| נקה סטודיו | סגור את היצירה הפעילה |
| צור כיווני עיצוב / צור כיוונים מחדש | הצע כיוונים / הצע כיוונים מחדש |
| בחר כיוון כדי להמשיך | בחר להמשך |
| שמור (session save, active project) | שמור עדכון בתיק היצירה |
| שמור (session save, no active project yet) | שמור בתיק היצירה |
| שמור כתיק עבודה (Create Flow) | שמור כתיק יצירה |
| שמירת תיק עבודה (Create Flow step title) | שמירת תיק יצירה |
| פתח תיק עבודה / פתח תיקי עבודה | פתח תיקי יצירה |

`כיווני עיצוב` (the noun) was intentionally left as-is per the spec's own
note ("may remain") — only the primary ACTION label changed to "הצע
כיוונים."

---

## Smart Command intents supported

| Intent | Example trigger (from the spec) | Safe action performed |
|---|---|---|
| `OPEN_STONES` | "האמרלד צריך להיות האבן המרכזית" | `setActiveStep('stones')` |
| `OPEN_REFERENCES` | "תעלה קובץ רפרנס חדש" | `setPickerOpen(true)` (existing AssetPicker) |
| `ADD_REFERENCE_TEXT` | "זה רפרנס טוב להשראה" | `briefStore.update({ intention: ... })` (existing public API, existing field) |
| `OPEN_DIRECTIONS` | "תעשה את הכיוון יותר עדין" / "תראה לי אפשרות יותר מסחרית" | `setActiveStep('design')` |
| `OPEN_RENDER_STUDIO` | "אני רוצה לראות את הטבעת על יד" | `router.push('/studio/projects?focus=media')` (existing deep link) |
| `OPEN_PRESENTATION` | "תכין את זה להצגה ללקוח" | `setActiveStep('brief')` |
| `EXPLAIN_NEXT_STEP` | "מה כדאי לעשות עכשיו?" | No navigation — returns the Advisor's own "הצעד הבא" text |
| `UNKNOWN` (fallback) | anything else | Records the raw text as a creation guideline via `briefStore.update` (existing public API); returns the EXACT required fallback message |

All 6 example commands given in the milestone spec were run through
`classifyCommand()` in the logic sandbox and each maps to the intent shown
above, character-for-character on the interpretation text where the spec
gave one.

---

## QA summary

**Bundle regression (esbuild, all 10 studio pages):** all bundle cleanly,
including `/studio/design` with the full `StudioShell.js` integration.

**Clean 8K logic sandbox (36 assertions, all PASS):**
- All 6 example Smart Command sentences from the spec classify to the
  correct intent, with the correct interpretation text where specified
  (including the two exact interpretation strings the spec gives verbatim:
  the "עדינה יותר" and general "הבנתי — נעבור לכיווני העיצוב" lines).
- Upload-file wording and reference/inspiration wording classify correctly;
  gibberish, empty string, and whitespace-only input all classify as
  `UNKNOWN`; the exact required fallback message is present.
- `buildAdvisorInsight` produces non-empty text for all three sections on
  an empty project; on a two-stone project it names the actual center stone
  and recommends a delicate metal for the composition; with concepts/output
  ready it correctly targets the `brief` step — matching the SAME decision
  order the shell's own primary button already uses.
- `buildContextSummaryHe({ stoneCount: 3, referenceCount: 2,
  hasSelectedDirection: true })` reproduces the spec's own example
  character-for-character: `"3 אבנים · 2 רפרנסים · כיוון אחד נבחר"`.
  Degrades correctly to singular phrasing and to the zero-count case.
- `humanTerms.js` feedback builders match the spirit and content of every
  section-7 example; `TERM`/`MICROCOPY_HE`/`CREATIVE_AREA_HE` constants
  match the spec's primary-terms table exactly.

**SSR smoke tests:**
- `AdvisorPanel` renders exactly the three required section labels and
  renders nothing (no crash) with a null insight.
- `SmartCommandBar` renders the exact spec label text.
- `CreativeAreaRail` renders all 5 area labels (אבנים / השראה / כיוונים /
  הדמיה / הצגה).
- `ActiveWorkControlBar` renders the new terminology and the new
  `contextSummary` line when supplied, and still renders correctly (with
  the new default term) when the optional prop is omitted — confirming
  backward compatibility for any other call site.
- Full pages — `/studio/create`, `/studio/design`, `/studio/projects` — all
  SSR-render without throwing. (`/studio/design`'s SSR output is the
  existing hydration-gated loading state, same as every prior milestone,
  since tray/brief hydration runs in a `useEffect` that SSR does not
  execute — this is pre-existing behavior, not something Clean 8K
  introduced or could change.)

**Structural verification:**
- `comm -23` export-removal proof on all 8 changed files: **zero exports
  removed**; `StudioShell.js`'s default export signature
  (`export default function StudioShell()`) is unchanged.
- `cmp` byte-identity on every protected store/UI file (`designProjects.js`,
  `workTray.js`, `designBriefStore.js`, `designDraft.js`,
  `activeWorkStore.js`, `assetsStore.js`, `assetsDb.js`, `package.json`,
  `AssetPicker.js`, `DesignConceptPanel.js`, `DesignOutputPanel.js`): **all
  byte-identical — untouched.**
- `cmp` byte-identity on `lib/studio/labels.js` (deliberately avoided — see
  the `StudioCommandBar.js` section above), `pages/studio/workstation.js`,
  `pages/studio/projects.js`, `StudioWorkflowRail.js`, `StudioIcons.js`,
  `RenderPromptPanel.js`, `renderSceneLibrary.js`,
  `renderPromptFinalizer.js`, `outputPack.js`, `attachedAssets.js`,
  `mediaWorkflow.js`, and the `/studio/workstation`-only
  `WorkstationShell.js`: **all byte-identical — untouched.** Existing
  Clean 8H/8I/8J functionality is fully preserved.
- Forbidden-token scan (diff-only added/new lines, 958 lines scanned): no
  `three/next-dynamic` import, no basket/checkout/עגלה language, no
  Airtable reference, no pricing/certificate logic, no external API call of
  any kind (no `fetch`/`axios`/Stability/Gemini/Sora reference, no
  `http://`/`https://` URL anywhere in the new or changed code), no
  `NEXT_PUBLIC` secret exposure, no new `localStorage` key. **Clean.**
- `package.json` diff: **unchanged** — confirmed no new dependency.

**Manual QA checklist (per the 20-point request):**
1. `/studio/create` opens — SSR-verified. ✓
2. `/studio/design` opens — SSR-verified (hydration-gated, as always). ✓
3. `/studio/projects` opens — SSR-verified. ✓
4. Existing Work Files still appear — `WorkFilesPanel.js`'s data logic
   untouched (terminology only). ✓
5. Existing directions still work — `DesignConceptPanel.js` untouched
   (protected; byte-identical). ✓
6. Existing Output Pack still works — `OutputPackPanel.js`'s logic
   untouched (terminology only). ✓
7. Existing Render Studio still works — `RenderStudioPanel.js`'s logic and
   `renderSceneLibrary.js` fully untouched (terminology-only single-line
   change to one label). ✓
8. Active creation context is clearly visible — "היצירה הפעילה" badge +
   name + new compact context-summary line in `ActiveWorkControlBar`. ✓
9. Main creative areas use compact icons and short labels —
   `CreativeAreaRail` (5 icons, 5 short labels, tooltips, active state). ✓
10. Long visible explanatory text is reduced — the Advisor Panel caps at
    exactly 3 short lines; the icon rail replaces long area descriptions
    with icon+tooltip. ✓
11. Advisor panel shows all three required sections — SSR-verified. ✓
12. Smart Command bar appears in Studio — rendered in the new `humanRow`,
    always visible (not hidden behind a toggle). ✓
13. Known commands navigate to safe existing areas — verified in the logic
    sandbox for all 7 known intents. ✓
14. Unknown commands do not trigger unsafe actions — `UNKNOWN` only calls
    the existing `briefStore.update` on the existing `intention` field;
    verified with gibberish/empty/whitespace input. ✓
15. Jewelry-aware feedback appears — Advisor Panel's "מה הבנתי" /
    "המלצת המעצב" sections, plus the `humanTerms.js` feedback builders
    (available for future wiring into more surfaces). ✓
16. No Stability API is connected — confirmed via the forbidden-token scan
    (zero network calls anywhere in new/changed code). ✓
17. No package is added — `package.json` byte-identical. ✓
18. No protected store internals are edited — confirmed via `cmp`. ✓
19. No new persistence key is created — the Smart Command Bar's
    persistence goes through the EXISTING public `briefStore.update` on the
    EXISTING `brief.intention` field; no new store, key, or schema. ✓
20. Production build passes — `esbuild` bundle regression clean on all 10
    studio pages. ✓

---

## Confirmation

- **No protected stores were edited.** Verified byte-identical via `cmp`
  against the accepted Clean 8J baseline for all 11 protected files.
- **No packages were added.** `package.json` is byte-identical to the
  baseline.
- **No new persistence key was created.** The Smart Command Bar's only
  persistence path is the EXISTING public `briefStore.update()` writing to
  the EXISTING `brief.intention` field (the same field the Create Flow
  already writes reference text into, prefixed `רפרנס:`). Everything else
  in this milestone is either pure display or reads existing data.
- **No external AI API was connected, and no real render was generated.**
  The forbidden-token scan confirms zero occurrences of `fetch`, `axios`,
  any Stability/Gemini/Sora reference, or any `http://`/`https://` URL
  anywhere in the new or changed code — the Smart Command Bar and Jewelry
  Advisor are both 100% local, deterministic logic.
- **`/studio/workstation` was not touched** — confirmed byte-identical,
  including its dedicated `components/studio/design/workstation/*` tree.
- **Clean 8H/8I/8J were not rebuilt** — `StudioWorkflowRail.js`,
  `StudioIcons.js`, `RenderPromptPanel.js`, `renderSceneLibrary.js`,
  `renderPromptFinalizer.js`, `outputPack.js`, `attachedAssets.js`, and
  `mediaWorkflow.js` are all byte-identical to the accepted baseline.

## Known persistence gaps

- **Smart Command Bar "unknown" commands** are recorded as a single
  free-text guideline appended to `brief.intention` (prefixed `הנחיה:`).
  There is no dedicated "command log" or per-command history — only the
  most recent few notes accumulate in that one field, exactly like the
  existing reference-text convention it reuses. A structured command
  history would need a new field/schema and is out of scope for this
  milestone.
- **"Request new directions" / "make it more delicate"** style commands
  (`OPEN_DIRECTIONS`) only navigate to the existing directions step and
  show an interpretation line — they do NOT actually regenerate concepts
  with that stylistic instruction folded in, because concept generation
  logic lives inside the protected `DesignConceptPanel.js`. The user still
  has to click the real (now "הצע כיוונים") button themselves once there.
- **"בחר" → "בחר להמשך"** (section 6) could only be applied where a
  standalone selection button/text existed in an ALLOWED file
  (`CreateFlowShell.js`); the actual per-concept-card "select" control used
  when browsing generated directions lives inside the protected
  `DesignConceptPanel.js` and was left untouched.
- **Reference count** in the Active Creation Context summary is a
  best-effort figure — `attachedCount(activeProject)` (existing public
  export) plus one when `brief.intention` has any text — not an exact,
  independently-audited count of every reference a user might consider
  "attached." This mirrors the same best-effort spirit as the Clean 8I/8J
  Advisor-adjacent warnings, never blocking, never asserting false
  precision.
- **Icon-first rail "active" state** is a best-effort derived mapping over
  existing `activeStep`/picker state (there is no dedicated "which creative
  area am I in" state elsewhere in the app) — it is visually indicative,
  not a new source of truth.

## Upload checklist

1. Upload at the repo root with 1:1 paths (no wrapper folder):
   - `lib/studio/humanTerms.js` (new)
   - `lib/studio/jewelryAdvisor.js` (new)
   - `lib/studio/smartCommand.js` (new)
   - `components/studio/shared/AdvisorPanel.js` (new)
   - `components/studio/shared/SmartCommandBar.js` (new)
   - `components/studio/shared/CreativeAreaRail.js` (new)
   - `components/studio/design/shell/StudioShell.js` (changed)
   - `components/studio/shared/ActiveWorkControlBar.js` (changed)
   - `components/studio/design/shell/StudioCommandBar.js` (changed)
   - `components/studio/projects/MediaWorkflowPanel.js` (changed)
   - `components/studio/projects/OutputPackPanel.js` (changed)
   - `components/studio/projects/WorkFilesPanel.js` (changed)
   - `components/studio/projects/RenderStudioPanel.js` (changed)
   - `components/studio/create/CreateFlowShell.js` (changed)
   - `CHANGELOG-CLEAN-8K.md` (new)
2. Commit and push to GitHub.
3. Verify the Vercel deployment builds successfully (`next build`).
4. Manually click through the 20-point QA checklist above on the live
   deployment, paying particular attention to `/studio/design` (icon rail,
   Advisor panel, Smart Command Bar, and the new context-summary line).
5. Once confirmed on Vercel, export the repo as the next baseline ZIP for
   Clean 8L — Creation Gallery + Present + Share.

---

## Post-delivery QA consolidation

The initial 8K delivery compiled, but its first visual integration added a second creative navigation row while preserving the older workflow rail, and kept all three advisor paragraphs permanently open. That increased visual load instead of consolidating it.

QA correction:
- the new five-area icon rail now replaces the older workflow rail in the canvas header, rather than appearing as a second navigation system;
- the Smart Command remains visible as the primary flexible control;
- the advisor is compact by default and reveals its full reasoning only on demand;
- the command/advisor row uses a two-column wide layout and a single-column narrow layout;
- free design intention text is no longer incorrectly counted as a reference unless it is explicitly stored as a reference;
- remaining visible terminology on the main Dashboard, Create context, Assets attach flow, Projects fallback, global session bar, and navigation was aligned with “תיקי יצירה / היצירה הפעילה / חומרי עבודה / הדמיות ותצוגה”.
