# CHANGELOG — Clean 8C: Active Work Control + Attach Assets

Baseline: Vercel-confirmed Clean 8B. Additive-only; no protected store
internals edited; no packages, APIs, Airtable, pricing, certificates, render
engines, or persistence keys added.

## What was added

### 1. Active Work Control bar in the Studio (/studio/design)
- NEW `components/studio/shared/ActiveWorkControlBar.js` — a clearly visible
  full-width control row (not a chip) showing «תיק פעיל» + the active Work
  File name when available, «אין תיק פעיל» otherwise, plus two actions:
  «פתח תיקי עבודה» (routes to /studio/projects) and «נקה סטודיו».
- `components/studio/design/shell/StudioShell.js` — minimal integration only:
  one import, one JSX block rendering the bar between the existing top row
  and the middle grid, and ONE style value change
  (`gridTemplateRows: 'auto minmax(0,1fr) auto'` →
  `'auto auto minmax(0,1fr) auto'`) so the always-rendered bar has its own
  explicit grid row and the middle/bottom rows keep their exact sizing.
  No restructure; the 8B chips, command bar, canvas, drawers are untouched.
- «נקה סטודיו» reuses the EXISTING Clean 8B confirm-guarded
  `handleClearStudio` unchanged: `tray.clear()` (clearTray),
  `briefStore.clear()` (clearBrief — resets תפריט עיצוב, כיווני עיצוב,
  כיוון נבחר and outputs to emptyBrief), `clearActiveWork()`. All public
  APIs; saved Work Files, inventory, and uploaded assets are never deleted.
  Confirm text is the exact approved 8B string. NO missing public reset
  APIs — the session clears fully.

### 2. Attach assets to the active Work File (/studio/assets)
- NEW `components/studio/assets/AttachToActiveWork.js` — «צרף לתיק פעיל» on
  every Asset Object card, with a role select:
  רפרנס עיצוב / מודל תכשיט / סקיצה / קובץ לקוח / נכס מדיה
  (canonical English values: designReference / jewelryModel / sketch /
  clientFile / mediaAsset). With no active Work File the action is disabled
  with the helper «אין תיק פעיל. צור או פתח תיק עבודה כדי לצרף נכס.»
- `components/studio/assets/AssetObjectCard.js` — one import + one JSX line
  rendering the control below the existing AssetNextActions.
- Persistence goes ONLY through the EXISTING public `updateProject(id,
  { assets })` into the project's EXISTING reserved `assets` array
  (normalizeProject has preserved it since Clean 4A). Re-attaching the same
  asset updates its role instead of duplicating. Stored per asset:
  assetId, name, type, fileType (image / model / modelFuture / other),
  fileExtension, previewFileId, role, source ('assetLibrary'), attachedAt.
  NOTE — previewUrl is intentionally NOT stored: uploaded files resolve only
  to ephemeral IndexedDB blob URLs (assetsStore.getFileUrl), which do not
  survive a session; the durable previewFileId is stored instead so a future
  milestone can resolve thumbnails through the existing store.
- STL/OBJ classify as attached model files; 3DM classifies as `modelFuture`
  (future support). No viewer, no Three.js additions, no parser packages.

### 3. Attached assets on Work File cards (/studio/projects)
- `components/studio/projects/WorkFilesPanel.js` — compact additive line per
  Work File: «צורפו N נכסים» + unique role chips (e.g. «רפרנס עיצוב»,
  «מודל תכשיט»). Renders only when assets are attached; the «תיק פעיל»
  badge and all existing rows/actions are unchanged. No redesign.

### 4. Output Pack mentions attached assets
- `lib/studio/outputPack.js` — additive enrichment of buildOutputPack:
  - Hebrew professional summary: «נכסים מצורפים לתיק:» role+name lines and
    «העיצוב מתבסס על האבנים שנבחרו ועל הרפרנסים והנכסים המצורפים.»
  - English media prompt (English-only, name-free — asset titles may be
    Hebrew and are never included): image → "Use the attached jewelry
    reference image as design inspiration."; STL/OBJ → "Use the attached
    STL/OBJ model as a base jewelry form reference."; when assets + stones →
    "Adapt the design to the selected gemstones."; multiple stones (or an
    explicit cluster style value, checked defensively) → cluster design
    language line.
  - Hebrew client description mentions attached references when relevant.
  - references section gains `attachedAssetsCount` and appends the attached
    count to the text; with nothing attached, every output is byte-for-byte
    the same text as 8B (proven in the QA sandbox).
- NEW `lib/studio/attachedAssets.js` — small shared PURE helper (roles,
  Hebrew labels, English phrases, record builder, upsert, formatting). No
  store, no persistence, no side effects.

## Files changed (7 + this changelog)
Modified:
1. components/studio/design/shell/StudioShell.js
2. components/studio/assets/AssetObjectCard.js
3. components/studio/projects/WorkFilesPanel.js
4. lib/studio/outputPack.js
New:
5. components/studio/shared/ActiveWorkControlBar.js
6. components/studio/assets/AttachToActiveWork.js
7. lib/studio/attachedAssets.js
8. CHANGELOG-CLEAN-8C.md

## QA summary (sandbox: esbuild bundle + node logic/render harness)
- Bundle/import-resolution pass on all 7 changed/new files AND all 10
  /studio pages (design, create, projects, assets, index, inventory, tray,
  workstation, demo-gemstones, inventory-demo) — full 6D→8C page surface.
- 24 logic assertions pass: attach/upsert persistence through public
  updateProject; role updates without duplication; Hebrew summaries; English
  prompt phrases; mediaPromptEn proven Hebrew-free by regex (with and
  without assets); Output Pack identical to 8B behavior when no assets;
  clear-Studio clears tray+brief+active work while saved Work Files AND
  their attached assets survive.
- SSR render checks: control bar (badge, name, both buttons, empty state),
  attach control (disabled state + exact helper text; enabled branch with
  all five role options via a QA-only hook double), WorkFilesPanel attached
  line + «תיק פעיל» badge, /studio/design shell hydration gate.
- comm -23 export-removal proof: no exports removed from any changed file.
- cmp byte-identity: designProjects.js, workTray.js, designBriefStore.js,
  designDraft.js, activeWorkStore.js, labels.js, package.json,
  AssetPicker.js, DesignConceptPanel.js, DesignOutputPanel.js — all
  IDENTICAL to the 8B baseline. Full-tree diff shows exactly the files
  listed above and nothing else.
- Forbidden-token scan on new lines only: no commerce wording, no
  «כוונות עיצוב», no «נקה תיק עבודה», no NEXT_PUBLIC, no \uXXXX Hebrew
  escapes, no storage/API/package additions. Visible UI uses «תפריט עיצוב» /
  «כיווני עיצוב» / «כיוון נבחר».
- «נקה סטודיו» button text exact; confirm text exact match to the approved
  string.

## Missing public APIs
None. Clearing and attaching are both fully covered by existing public
exports (clearTray / clearBrief / clearActiveWork / updateProject +
the reserved project `assets` array).

## Upload checklist
1. Upload/replace the 7 code files + this changelog at the exact paths above
   (ZIP is root-ready, 1:1 path mapping, no wrapper folder).
2. Deploy on Vercel; confirm build passes.
3. Open /studio/design — Active Work Control bar visible near the top;
   «נקה סטודיו» asks the exact confirm and clears only the live session.
4. Open /studio/assets — asset cards show «צרף לתיק פעיל» (disabled with
   helper when no Active Work); attach with a role.
5. Open /studio/projects — the Work File shows «צורפו N נכסים» + role chips;
   «פתח חבילת פלט» mentions the attached assets in all three sections.
6. Regression: /studio/create opens; calculator, certificates, Airtable
   read/create flows untouched by this milestone (no files in those areas
   changed).
7. After Vercel confirmation, this tree becomes the Clean 8C baseline.
