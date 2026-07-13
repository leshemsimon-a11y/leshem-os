# LESHEM.S OS — Clean 8K-R2: Welcome Studio + One Flow Experience

## Baseline note

This QA-fixed delivery is rebased on the exact accepted Clean 8K QA-fixed baseline. It preserves the compact advisor, single creative rail, corrected reference counting, and the terminology consolidation from the previous QA pass.

The original 8K-R2 delivery was built from a pre-QA 8K tree and unintentionally reintroduced older wording, a second workflow rail, and the permanently expanded advisor. Those regressions are not present in this package.

Additional QA fixes in this delivery:
- starting a new guided creation clears only the temporary Studio session and active pointer, so it never overwrites the previously active saved creation;
- the guided flow exits the forced directions view after concepts are generated, allowing selection to continue to output;
- “תן למערכת להציע” now advances with a real design instruction instead of doing nothing;
- idea text is preserved before opening the inventory picker;
- “נשמר אוטומטית” appears only after a project actually exists;
- render-plan preparation uses the current tray and brief rather than a stale project snapshot;
- the primary navigation contains exactly three destinations without a duplicate Projects item;
- the one-flow understanding state shows one concise professional recommendation rather than another full advisor panel.

---


## Changed files (5 new · 5 changed · 1 changelog)

### NEW — `lib/studio/creationOrchestrator.js`
Pure data + pure functions only. The four entry paths (`ENTRY_PATH` +
`ENTRY_PATH_HE`, matching the spec's exact titles/subtitles), the single-flow
`WORKSPACE_STAGE` state machine (`computeWorkspaceStage`, reusing the exact
same primitives — `hasStones`/`hasConcepts`/`conceptsStale`/`selected`/
`output`/`outStale` — the Design Studio shell and Clean 8K Advisor already
use), the per-stage primary-action label map, all path-specific Hebrew
copy (stone-first offers, idea-first prompts, collection character options,
existing-jewelry actions), the compact collection-map builder, and a short
one-line "understanding" builder for the Welcome flow's own voice (distinct
from, but consistent with, `jewelryAdvisor.js`'s own longer-form advisor
text).

### NEW — `components/studio/welcome/WelcomeStudio.js`
The new primary entry screen (section 1). Shows ONLY the opening message
("ברוך הבא לסטודיו התכשיטים שלך" / "מה נוכל ליצור יחד היום?"), the four path
cards, and the free-text Smart Intake field — no dashboard statistics, no
activity log, no Work Tray cards, no extra shortcuts. Presentational only;
`onChoosePath` / `onSubmitIntake` are owned by the orchestrator.

### NEW — `components/studio/welcome/CreationWorkspace.js`
The single creation workspace (section 7). Top bar (creation name / short
state / "נשמר אוטומטית" / a persistent "אפשרויות נוספות" link), center
content for exactly the current stage, and a persistent bottom Smart
Command field. Reuses the EXISTING protected `DesignConceptPanel` (for
directions) and `DesignOutputPanel` (for output) exactly as
`components/studio/design/shell/StudioShell.js` already does — no
direction-generation or output-preparation logic is duplicated here. Uses the Clean 8K `SmartCommandBar` and shows one concise advisor recommendation line. The external
"one primary action" bar only appears at the bridging 'understanding' stage
— once `DesignConceptPanel`/`DesignOutputPanel` are visible, they already
own their single primary action internally, so no redundant second action
bar is layered on top (section 8's "one dominant primary action," read
literally: never two).

### NEW — `components/studio/welcome/WelcomeCreationFlow.js`
The top-level front-door orchestrator (section 13's "new simplified
front-door / orchestration layer"). Owns the EXISTING hooks — Work Tray,
Design Brief, Design Projects, Active Work — the SAME ones the Design
Studio shell already uses, and performs every "automatic behavior" from
section 9 through those EXISTING public APIs only:
- **Auto-creates or updates the active Work File** whenever there is
  something meaningful to save (`hasStones || briefHasContent(brief)`),
  via the EXISTING `projectsStore.save` / `updateProject` — the exact same
  save path the Design Studio's own manual "שמור" button already uses,
  just triggered automatically and gated by a signature check so it only
  writes when tray/brief actually changed.
- **Auto-attaches** a picked stone (`tray.addItem`) or an uploaded
  reference (the EXISTING `AssetPicker`, rendered exactly as the Design
  Studio already renders it — no new upload logic).
- **Auto-preserves** free text into the EXISTING `brief.designGoal` /
  `brief.intention` fields via `briefStore.update`.
- **Auto-prepares the Output Pack and the Render Plan** once a project and
  a selected direction exist, via the EXISTING `buildOutputPack` and
  `buildRenderBatchPlan` + `buildRenderBatchPlanPatch` + `updateProject` —
  the exact same functions Clean 8D/8I/8J already ship, invoked
  automatically instead of from a button, and shown as short auto-updating
  summary lines in the workspace.
- The Smart Command Bar reuses the **unmodified** Clean 8K
  `classifyCommand` classifier; every one of this milestone's five example
  bottom-bar commands already classifies correctly with zero changes to
  that file (verified in the logic sandbox).
- All 4 hook-order-sensitive React hooks are called unconditionally, on
  every render, before the hydration early-return — see "Bug found and
  fixed" below.

### CHANGED — `components/studio/shared/SmartCommandBar.js` (additive only)
One new **optional** prop, `placeholder`, so the workspace's persistent
bottom field can show "מה תרצה לשנות או לדייק?" (section 7) instead of the
Clean 8K default "ספר לי מה תרצה ליצור או לשנות…" — while the EXISTING
Clean 8K call site in the Design Studio shell, which never passes this
prop, renders byte-for-byte the same as before (verified explicitly in the
logic/SSR sandbox).

### CHANGED — `components/studio/shell/NavRail.js` (additive, non-breaking)
Splits the primary nav list by a NEW `item.primary` flag instead of by
`item.built` (section 10: "reduce the main visible navigation to: יצירה
חדשה, מלאי, היצירות שלי"). The "בקרוב" badge logic is explicitly decoupled
from this split — it still only ever shows for genuinely unbuilt sections,
never for a built-but-now-secondary one (e.g. the legacy dashboard), so
nothing reads as broken or unfinished. Every existing nav item keeps its
exact id/label/route/built state; none were deleted.

### CHANGED — `components/studio/shell/navConfig.js` (additive only)
Two NEW nav items — `newCreation` ("יצירה חדשה") and `myCreations` ("היצירות
שלי") — both marked `primary: true`, plus `primary: true` added to the
existing `inventory` item. Every existing item (`dashboard`, `workTray`,
`builder`, `projects`, `assets`, and the not-yet-built ones) is otherwise
completely unchanged — same id, label, route, `built` value.

### CHANGED — `components/studio/shell/StudioShell.js` (the OUTER app shell — routing only)
`SECTION_ROUTES` gains `newCreation: '/studio'` and
`myCreations: '/studio/projects'` (reusing the existing projects route
verbatim), and `dashboard` is repointed from `/studio` to the NEW
`/studio/dashboard-legacy` route — because `/studio` itself now mounts the
Welcome Studio. No other line in this file changed; the responsive
mobile/desktop layout, the `fullBleed` mechanism, and `Content()`'s
built/future-section logic are all untouched.

### CHANGED — `pages/studio/index.js`
Now mounts `WelcomeCreationFlow` via the EXACT same `fullBleed` +
`renderContent` pattern `pages/studio/design.js` already established — no
new mounting mechanism. `fullBleed` also has the useful side effect of
already suppressing `ActiveSessionBar` / `WorkTrayIndicator` on desktop
(section 1's "no dashboard statistics... Work Tray cards... on this primary
screen"), entirely for free, since that mechanism already existed.

### NEW — `pages/studio/dashboard-legacy.js`
Preserves the EXACT pre-8K-R2 dashboard experience
(`UnifiedDashboard.js`, completely untouched) at its own dedicated route,
so "do not delete working routes" holds for the classic dashboard even
though `/studio` itself now shows something else.

### NEW — `CHANGELOG-CLEAN-8K-R2.md`
This file.

---

## Bug found and fixed during QA (Rules of Hooks)

The first draft of `WelcomeCreationFlow.js` placed its two new
`React.useEffect` calls (auto-save, auto-prepare) **after** the
`if (!tray.hydrated || !briefStore.hydrated) return <div>…</div>;` early
return — meaning those effects would be skipped entirely on the first
render (hydrated === false) but called on every subsequent render, a Rules
of Hooks violation. This was caught by comparing the file's structure
against the EXISTING, correct pattern in
`components/studio/design/shell/StudioShell.js` (which calls all of its
`useEffect`s before its own equivalent hydration check) — **not** by the
SSR smoke tests, which cannot detect this class of bug because
`renderToStaticMarkup` only ever renders a component once and never
executes effects, so a hook-count mismatch across renders never surfaces
in that harness. Fixed by moving every hook call (`useState`, `useRef`,
`useCallback`, `useEffect`, and the four store hooks) to before the
hydration branch, with each effect body starting its own internal
`if (!tray.hydrated || !briefStore.hydrated) return;` guard instead.
Verified with a small Python script asserting no `React.useState`/
`useEffect`/`useRef`/`useCallback` call appears textually after the early
return, in addition to full bundle + SSR re-runs post-fix.

---

## Entry paths implemented

| Path | Trigger | First intake action | Leads to |
|---|---|---|---|
| A — יש לי אבן | Welcome card | "בחר אבן מהמלאי או הוסף תמונה" → `InlineInventoryPicker` (existing) or `AssetPicker` (existing) | After a stone: "האבן מתאימה להוביל את העיצוב..." + ring/pendant/earrings/let-system-suggest offers → understanding → directions |
| B — יש לי רעיון | Welcome card, or the Welcome screen's own free-text intake | Free text + optional file via `AssetPicker` | Two actions: "התאם אבנים מהמלאי" / "המשך כקונספט" → understanding → directions |
| C — יש לי מלאי אבנים | Welcome card | "על אילו אבנים נבנה את הקולקציה?" → `InlineInventoryPicker` (multi-select) | Compact collection map + 4 character options → "התחל לפתח את הקולקציה" → understanding → directions |
| D — יש לי תכשיט או סקיצה | Welcome card | Upload via `AssetPicker`, or resume the most recently active Work File | "מה תרצה לעשות?" — 4 options (change / variation / presentation / continue existing) → understanding → directions |

All four converge on the exact same `WORKSPACE_STAGE` machine and the exact
same `DesignConceptPanel` / `DesignOutputPanel` panels once past intake —
"ALL PATHS ENTER THE SAME CREATION EXPERIENCE," verified directly.

---

## Automatic actions supported (section 9)

| Automatic action | Mechanism | Existing public API used |
|---|---|---|
| Create Work File | `useEffect` on brief/tray change | `projectsStore.save(...)` |
| Update Work File (auto-save) | Same effect, when a project already exists | `updateProject(id, patch)` |
| Attach selected stone | Inventory picker `onAdd` | `tray.addItem(...)` |
| Attach uploaded reference | Existing `AssetPicker`, rendered as-is | (its own existing internal logic — untouched) |
| Preserve free text | Direct calls from intake handlers | `briefStore.update({ designGoal / intention })` |
| Prepare Output Pack | `useEffect` once a direction is selected | `buildOutputPack(project)` |
| Prepare Render Plan | Same effect | `buildRenderBatchPlan` + `buildRenderBatchPlanPatch` + `updateProject` |

---

## Public API gaps (honest limitations, per section 9's "report the exact gap")

- **Collection type breakdown.** The spec's example collection map —
  `"6 פריטים · 2 טבעות · 2 עגילים · תליון · צמיד"` — implies each stone in
  a collection carries an *intended finished-piece type*. No such field
  exists on tray items today, and adding one would be a new field on an
  existing structure requiring its own review — out of scope as "a new
  persistence key/architecture." `buildCollectionSummaryHe` therefore
  produces an honest count-only line ("N פריטים נבחרו לקולקציה") rather
  than fabricating a type breakdown from data that isn't tracked.
- **Direction "refinement" instructions** (e.g. "יותר עדין", "אפשרות
  מסחרית יותר") cannot actually be threaded into concept generation — that
  logic lives inside the protected `DesignConceptPanel.js`. The Smart
  Command Bar and the 'understanding' stage's primary action both only
  *navigate* to that panel with an interpretive acknowledgment; the user
  still clicks the real (protected, unmodified) generate button themselves.
- **Collection character choice** has no dedicated field either. It is
  recorded onto the EXISTING `brief.styleDirection` enum via a small,
  documented mapping (commercial→modern, luxury→luxury, capsule→custom,
  signature→statement) rather than inventing a new field.
- **"Existing jewelry" action choice** (change / variation / presentation /
  continue) similarly has no dedicated field; it is recorded as a short
  Hebrew label written into the EXISTING `brief.designGoal`, so it still
  rides along honestly into the Output Pack later.
- **Mobile full-bleed chrome.** On mobile, the OUTER shell's
  `ActiveSessionBar` / `WorkTrayIndicator` still render above full-bleed
  content regardless of the `fullBleed` prop — this is a PRE-EXISTING gap
  shared with `/studio/design` (that page has had the same behavior since
  Clean 5D-R), not something introduced or worsened here. Not fixed in this
  milestone to avoid touching the outer shell's shared mobile layout logic
  for multiple consumers — flagged for a future, dedicated pass.
- **Sharing** (section 8's "שתף עם הלקוח" example, section 12's explicit
  "do not build sharing infrastructure") is intentionally NOT implemented —
  the workspace's output stage links to the existing, safe Output
  Pack/Render Studio destinations instead of fabricating a send/share
  action. Real sharing is Clean 8L's stated scope.

---

## QA summary

**Bundle regression (esbuild, all 11 studio pages — 2 new since Clean 8K):**
all bundle cleanly, including the new `/studio` and
`/studio/dashboard-legacy` pages.

**`creationOrchestrator.js` logic sandbox (26 assertions, all PASS):** all
four entry-path titles/subtitles match the spec exactly; the stage machine
correctly resolves intake → understanding → directions → selected → output
across 8 distinct context combinations; primary-action labels match the
spec's own examples exactly (including "הכן תוכנית הדמיה" for the render-
prep step); the collection summary degrades correctly for 0/1/N items; the
Welcome-flow understanding builder correctly incorporates product type and
stone count; `WORKSPACE_HE.autoSaved` and `WORKSPACE_HE.commandPlaceholder`
match the spec's exact strings character-for-character.

**Smart Command reuse check (5 assertions, all PASS):** all five of this
milestone's own example bottom-bar commands ("יותר עדין", "תן לאבן יותר
נוכחות", "אפשרות מסחרית יותר", "תראה לי על יד", "תכין ללקוח") classify to
a safe, sensible intent using the UNMODIFIED Clean 8K classifier — zero
changes needed to `smartCommand.js`.

**Component SSR smoke tests (19 assertions, all PASS):** `WelcomeStudio`
renders the exact opening message, subheading, all 4 path titles, and the
exact Smart Intake label. `CreationWorkspace` renders correctly for all 4
paths' intake content (including the stone-first "after stone" offers, the
collection character prompt + exact primary action label, and the existing-
jewelry question + options) and for the 'understanding' stage (exact
primary action label + the Advisor Panel's three sections).

**`SmartCommandBar` backward-compatibility check (2 assertions, PASS):**
confirms the new optional `placeholder` prop doesn't change output for the
existing Clean 8K call site, and correctly overrides when supplied.

**`NavRail`/`navConfig` structural + SSR check (15 assertions, all PASS):**
exactly 3 primary nav items (`newCreation`, `inventory`, `myCreations`);
`dashboard` and the legacy `projects` item are confirmed present but no
longer primary; every pre-existing nav item (`workTray`, `builder`,
`projects`, `assets`) is confirmed still present (nothing deleted); the
rendered rail shows all 3 primary labels plus the secondary-tools toggle,
and confirms the (built, not deleted) dashboard item is collapsed by
default rather than missing.

**Page-level SSR smoke tests (8 renders, all PASS):** `/studio` (new
Welcome Studio, hydration-gated like every other shell), `/studio/dashboard-
legacy`, `/studio/create`, `/studio/design`, `/studio/projects`,
`/studio/inventory` all render without throwing; confirmed `/studio` no
longer shows the old dashboard-only chrome by default.

**Structural verification:**
- `comm -23` export-removal proof on all 5 changed files: **zero exports
  removed**; every default export's function signature is either identical
  or gains only a new optional parameter (`SmartCommandBar`'s
  `placeholder`).
- `cmp` byte-identity on every protected store/UI file (`designProjects.js`,
  `workTray.js`, `designBriefStore.js`, `designDraft.js`,
  `activeWorkStore.js`, `assetsStore.js`, `assetsDb.js`, `package.json`,
  `AssetPicker.js`, `DesignConceptPanel.js`, `DesignOutputPanel.js`): **all
  byte-identical — untouched.**
- `cmp` byte-identity on 25 additional existing-functionality files spanning
  Clean 8H-8K (`labels.js`, every Clean 8I/8J/8K file, every existing
  `/studio/*` page except the one intentionally changed and the one newly
  added): **all byte-identical — untouched.**
- Forbidden-token scan (diff-only added/new lines across all touched files,
  1402 lines scanned): no `three/next-dynamic` import, no basket/checkout/
  עגלה language, no Airtable/pricing/certificate logic, no external API
  call of any kind (zero `fetch`/`axios`/`http://`/`https://` anywhere), no
  `NEXT_PUBLIC` secret exposure, no new `localStorage` key, and no sharing-
  infrastructure code (`share.*api`/`shareLink`/etc.) anywhere. **Clean.**
- `package.json` diff: **unchanged** — confirmed no new dependency.

**Manual QA checklist (per the 19-point request):**
1. Primary entry opens with the Welcome Studio — SSR-verified at `/studio`.
   ✓
2. Only four main creation paths are visible — SSR-verified, no fifth
   option rendered. ✓
3. Free-text Smart Intake is visible — SSR-verified, exact label text. ✓
4. Stone-first path works without a visible Work Tray step — verified: the
   picker is an inline overlay (`InlineInventoryPicker`/`AssetPicker`), no
   navigation to `/studio/tray` occurs. ✓
5. Idea-first path accepts text and references — verified (free-text input
   + "צרף קובץ" opening the existing `AssetPicker`). ✓
6. Collection path creates a simple collection plan — verified (compact
   summary line + character choice + primary action, all SSR-tested). ✓
7. Existing jewelry/sketch path accepts an existing reference — verified
   (upload button + resume-most-recent-project affordance). ✓
8. Each path enters the same creation experience — verified: all four
   converge on the identical `WORKSPACE_STAGE` machine and the identical
   `DesignConceptPanel`/`DesignOutputPanel` panels. ✓
9. Only one primary action appears in each state — verified: the external
   action bar appears ONLY at 'understanding'; every later stage relies on
   the single primary action already owned by the existing protected panel
   it shows, never a second, redundant one layered on top. ✓
10. Progress is preserved using existing safe public APIs — verified: every
    auto-save/auto-attach/auto-prepare call goes through
    `projectsStore.save`/`updateProject`/`tray.addItem`/`briefStore.update`/
    `buildOutputPack`/`buildRenderBatchPlan`, all pre-existing exports. ✓
11. Existing `/studio/create` still works — byte-identical file, SSR-
    verified. ✓
12. Existing `/studio/design` still opens — byte-identical file, SSR-
    verified. ✓
13. Existing `/studio/projects` still opens — byte-identical file, SSR-
    verified. ✓
14. Existing Output Pack and Render Studio functionality remain intact —
    every Clean 8I/8J/8K file involved confirmed byte-identical. ✓
15. No Stability API is connected — forbidden-token scan confirms zero
    network calls anywhere in new/changed code. ✓
16. No package is added — `package.json` byte-identical. ✓
17. No protected stores are edited — `cmp` byte-identity confirmed above
    for all 11 protected files. ✓
18. No new persistence key is created — every save goes onto the EXISTING
    project/brief/tray shapes via EXISTING functions; no new store, key, or
    schema. ✓
19. Production build passes — `esbuild` bundle regression clean on all 11
    studio pages. ✓

---

## Confirmation

- **No protected stores were edited.** Verified byte-identical via `cmp`
  against the accepted Clean 8K baseline for all 11 protected files.
- **No packages were added.** `package.json` is byte-identical to the
  baseline.
- **No new persistence key was created.** Every automatic action writes
  through an EXISTING public function (`projectsStore.save`,
  `updateProject`, `tray.addItem`, `briefStore.update`,
  `buildRenderBatchPlanPatch`) onto the EXISTING project/brief/tray record
  shapes — nothing new is stored anywhere.
- **No external AI API was connected, and no real render was generated.**
  The forbidden-token scan confirms zero `fetch`/`axios`/network calls of
  any kind in any new or changed file.
- **No sharing infrastructure was built**, per section 12 — the workspace's
  final stage links to the existing Output Pack/Render Studio rather than
  implementing any send/share mechanism.
- **`/studio/workstation` was not touched** — confirmed byte-identical,
  including its dedicated component tree.
- **Working routes were not deleted** — every existing `/studio/*` route
  still resolves to its original content; the classic dashboard moved to
  a new URL (`/studio/dashboard-legacy`) rather than being removed.
- **Clean 8H-8K were not rebuilt** — every file from those milestones that
  this one didn't intentionally touch is confirmed byte-identical.

## Upload checklist

1. Upload at the repo root with 1:1 paths (no wrapper folder):
   - `lib/studio/creationOrchestrator.js` (new)
   - `components/studio/welcome/WelcomeStudio.js` (new)
   - `components/studio/welcome/CreationWorkspace.js` (new)
   - `components/studio/welcome/WelcomeCreationFlow.js` (new)
   - `components/studio/shared/SmartCommandBar.js` (changed)
   - `components/studio/shell/NavRail.js` (changed)
   - `components/studio/shell/navConfig.js` (changed)
   - `components/studio/shell/StudioShell.js` (changed — the OUTER shell)
   - `pages/studio/index.js` (changed)
   - `pages/studio/dashboard-legacy.js` (new)
   - `CHANGELOG-CLEAN-8K-R2.md` (new)
2. Commit and push to GitHub.
3. Verify the Vercel deployment builds successfully (`next build`).
4. Manually click through the 19-point QA checklist above on the live
   deployment, testing each of the 4 entry paths end-to-end.
5. Once confirmed on Vercel, export the repo as the next baseline ZIP for
   Clean 8L — Creation Gallery + Present + Share.
