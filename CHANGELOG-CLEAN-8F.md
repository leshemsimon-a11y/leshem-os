# CHANGELOG — Clean 8F: Media Access From Studio

Baseline: Vercel-confirmed Clean 8E. Product-flow/access sprint only —
additive; no protected store internals edited; no packages, APIs, Airtable,
pricing, certificates, render engines, external AI services, or persistence
keys added; no Studio redesign, no StudioShell restructure, no changes to
/studio/workstation, /studio/create, OutputPackPanel, or MediaWorkflowPanel.

## Changed files (4 changed + this file)

1. `components/studio/shared/ActiveWorkControlBar.js`
2. `components/studio/design/shell/StudioShell.js` (minimal insertion: props
   at the ONE existing ActiveWorkControlBar call site)
3. `pages/studio/projects.js`
4. `components/studio/projects/WorkFilesPanel.js`
5. `CHANGELOG-CLEAN-8F.md` (new)

## What was added

### 1. «פתח מדיה והדמיות» in the stable Studio (/studio/design)

The Clean 8C Active Work Control bar (the visible row under the top strip:
«תיק פעיל» / «פתח תיקי עבודה» / «נקה סטודיו») gains an OPTIONAL media action:

- With an active Work File: a gold-accent button «פתח מדיה והדמיות» that
  routes to `/studio/projects?focus=media`.
- Without one: the same button rendered disabled plus the helper line
  «צריך לשמור או לפתוח תיק עבודה לפני ניהול מדיה והדמיות».

The new props (`onOpenMedia`, `mediaEnabled`) are optional and additive —
proven by SSR test that a legacy call without them renders exactly the same
bar as before. The bar stays PRESENTATIONAL: the design shell passes only a
routing callback (`router.push({ pathname: '/studio/projects', query:
{ focus: 'media' } })`) and `mediaEnabled={Boolean(activeProject)}` — the
`activeProject` value the shell already resolves since Clean 7A. Two props at
the existing call site; nothing else in the shell changed.

### 2. `?focus=media` deep link on /studio/projects

Page-local effect (guarded by `router.isReady`, the projects store's own
`hydrated` flag, and a run-once ref):

- Reads the Active Work pointer through the EXISTING public
  `getActiveWorkId()` (already imported by this page since 7A).
- If the active project resolves in the store list → marks it active in the
  Work Files panel (existing highlight) and auto-opens its «מדיה והדמיות»
  panel using the SAME local `setMediaProjectId` state the 8E buttons use.
  No new store, no new persistence, no state management beyond the page.
- If it does not resolve (session cleared / project archived meanwhile) →
  the simple safe fallback: a top notice «פתח את תיק העבודה הפעיל כדי לנהל
  מדיה והדמיות», while the «מדיה והדמיות» button remains visible on every
  Work File card.

### 3. Work File card action clarity

Each card now shows three clearly separated actions:
- «המשך עבודה» (unchanged — filled primary)
- «חבילת פלט» (label shortened from «פתח חבילת פלט» per the 8F spec;
  behavior unchanged)
- «מדיה והדמיות» (unchanged behavior; now visually distinct with its own
  gold-accent outline style instead of sharing the pack button style)

### 4. Output Pack handoff — kept as-is

«העבר למדיה והדמיות» inside the Output Pack (Clean 8E) already opens/focuses
the same project's Media Workflow through the page's `openMedia`. Verified
working; deliberately NOT modified (zero-diff on OutputPackPanel.js).

## QA (all offline; npm egress disabled — esbuild via the tsx package binary)

- esbuild compile PASS on all touched + adjacent studio files
  (design.js, projects.js, create.js, ActiveWorkControlBar, design-shell
  StudioShell, WorkFilesPanel, OutputPackPanel, MediaWorkflowPanel).
- `comm -23` export-removal proof: NO export removed from any changed file.
- Forbidden-token scan on NEW lines only (diff-based): no next/dynamic,
  no three.js, no Airtable/fetch, no NEXT_PUBLIC, no \uXXXX escapes, no
  commerce language, no storage keys. (Only match: the English word
  "three" inside a code comment — not an import.)
- Explicit import scan: no dynamic/three/require in changed files.
- Protected files byte-identity (`cmp`): designProjects.js, workTray.js,
  designBriefStore.js, designDraft.js, activeWorkStore.js, assetsStore.js,
  assetsDb.js, package.json — ALL IDENTICAL to baseline.
- Full-tree diff vs baseline: EXACTLY the 4 listed files differ.
- SSR smoke (renderToString): ActiveWorkControlBar in all three states —
  legacy call renders WITHOUT the media button (backward compatible),
  enabled state renders the button, disabled state renders `disabled` + the
  Hebrew helper text.
- SSR byte-parity: server output of BOTH /studio/design and /studio/projects
  is byte-identical to the Clean 8E baseline (all 8F UI is client-side,
  gated on hydration/state — no hydration-mismatch risk).
- Deep-link chain proof with REAL store exports (no re-implementation):
  saveProject → setActiveWorkId → getActiveWorkId → find in
  getAllProjects() resolves the active project; cleared pointer correctly
  falls through to the notice path.

## Upload checklist

1. Unzip `LESHEMS_OS_Clean_8F_Media_Access_From_Studio_ROOT_READY.zip` at the
   repository ROOT (paths map 1:1 — `pages/`, `components/` at top level).
2. Overwrite the 4 existing files; `CHANGELOG-CLEAN-8F.md` is new.
3. Commit, push, wait for the Vercel build.
4. Verify:
   - `/studio/design` opens; the control row shows «פתח מדיה והדמיות».
   - With no active Work File: button disabled + helper text
     «צריך לשמור או לפתוח תיק עבודה לפני ניהול מדיה והדמיות».
   - Save a session (or open a Work File) → button enabled → click →
     `/studio/projects?focus=media` opens with the active project's
     «מדיה והדמיות» panel already open and the active card highlighted.
   - Work File cards show «המשך עבודה» / «חבילת פלט» / «מדיה והדמיות».
   - Output Pack → «העבר למדיה והדמיות» still opens the Media Workflow.
   - `/studio/create` unchanged; MVP `/` and `/v2` untouched.
5. Once Vercel is confirmed, export the repo ZIP — that ZIP becomes the
   Clean 8F baseline for the next milestone.
