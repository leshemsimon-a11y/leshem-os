# CHANGELOG — CLEAN 7B — Asset-Aware Context v1

**Baseline:** Vercel-confirmed Clean 7A state.
**Scope:** the safe version only — existing asset data becomes design
context across the Studio, Projects and Output Pack. No upload system, no
render engine, no new 3D packages, no schema/persistence changes.

---

## What Clean 7B adds

### 1. Asset normalization helper — `lib/studio/assetContext.js` (NEW)
Read-only collection + normalization over EXISTING fields: a Work File's
`linkedAssetFileIds`, `linkedAssetObjectIds`, `primaryAssetObjectId`, plus
asset objects whose `linkedDesignProjectId` points at the project. Every
asset normalizes to `{ id, name, type, fileType, role, previewUrl, status,
source }`. Roles: the file's real purpose label wins when set (מודל ייצור,
רפרנס הדמיה…); otherwise inferred — מודל תכשיט / רפרנס עיצוב / סקיצה /
קובץ לקוח / נכס מדיה. Image preview URLs resolve through the existing
public `getFileUrl` (IndexedDB blob), fully guarded. Includes a read-only
`createUseWorkAssets(React)` hook. No new storage, no keys, no internals.

### 2. Work Assets panel — `components/studio/shared/WorkAssetsPanel.js` (NEW)
"נכסי עבודה": image/sketch/render assets show a thumbnail when a preview URL
exists; STL/OBJ/GLB/GLTF show a file card with an on-demand
"תצוגה תלת־ממדית" action that lazily mounts the EXISTING `Asset3DViewer`
(`three` is already a real dependency; loaded via `next/dynamic` ssr:false,
nothing mounts until asked); 3DM shows the honest status
"תצוגת 3DM תהיה זמינה בהמשך". Hidden by default when empty; a compact empty
state ("עדיין לא נוספו נכסי עבודה") is available via `showEmpty`.

### 3. Studio (`/studio/design`)
Compact Work Assets area below the canvas, showing the ACTIVE Work File's
assets — rendered ONLY when assets exist, so screens without assets are
pixel-identical to 7A. Smallest safe insertion: **15 added lines, 0
removed** in the design shell (hook import + hook call + one conditional
render). No restructure; every other design-shell file byte-identical.
Because assets derive from the Active Work File at render time, they
reappear automatically after "המשך עבודה" — no new persistence.

### 4. Projects (`/studio/projects`)
Work File cards now show the asset count when direct file linkage exists —
e.g. "3 נכסי עבודה" (sync count from existing fields, no loads).

### 5. Output Pack — asset-aware
`buildOutputPack(project, workAssets?)` — fully backward compatible
(7A regression suite re-passed). When assets are provided:
- **Assets section:** one line per asset — name · file type · role ·
  preview status (including the 3DM future-status line).
- **Hebrew professional summary:** states when the design is based on
  uploaded visual references and/or model files; with 2+ stones (and stone
  usage not "none") adds קלאסטר as a possible direction — text only, no
  enum/schema change.
- **English media prompt:** adds, per the spec logic, "Use the uploaded
  jewelry reference image as visual inspiration." / "Use the uploaded model
  file as a base jewelry form/reference." / "A 3DM model is attached;
  preview support is planned." and "A cluster arrangement of the selected
  stones is a possible design direction." — still proven English-only.
- **Hebrew client description:** mentions the transferred references.
- **References:** real Work Assets count when present; otherwise the
  existing linkage count; otherwise the honest placeholder.
The projects page loads the pack's assets through the existing public
getters when "פתח חבילת פלט" is clicked (guarded; asset-less environments
get a 7A-style pack).

---

## Files changed (8)

1. `lib/studio/assetContext.js` — NEW
2. `components/studio/shared/WorkAssetsPanel.js` — NEW
3. `lib/studio/outputPack.js` — edited (asset-aware, backward compatible)
4. `components/studio/projects/WorkFilesPanel.js` — edited (asset count)
5. `components/studio/projects/OutputPackPanel.js` — edited (assets section)
6. `pages/studio/projects.js` — edited (asset collection on pack open)
7. `components/studio/design/shell/StudioShell.js` — minimal additive edit
   (15 added / 0 removed)
8. `CHANGELOG-CLEAN-7B.md` (this file)

## Real gaps found (reported, not built)

1. **3DM preview** — the existing `Asset3DViewer` deliberately falls back to
   a saved-message for 3DM (Rhino wasm path unstable). Real 3DM preview
   needs `rhino3dm` wasm integration → a new package + build config. Out of
   scope; the honest status card is shown instead.
2. **Asset linking from the Studio** — Work Files gain assets today only via
   the assets library flows (`linkObjectToProject`, object creation with a
   project link, or save-time `linkedAssetFileIds`). There is no "attach
   asset to the current Work File" action inside `/studio/design`; adding
   one would need a small UI + a call to existing `updateProject` — a good
   future milestone, not built now.
3. **Direction/brief text generation** (`lib/studio/designConcepts.js`) was
   NOT enriched with asset context — the file is outside this milestone's
   allowed list and editing generation logic is exactly the risky edit the
   spec said to skip. The Output Pack carries the asset context instead.
4. **Tray items carry no asset linkage** — tray snapshots only hold
   `primaryImage`; stone images are shown as stones (ribbon/strip), not
   duplicated as Work Assets. Linking tray items to asset files would be a
   schema addition (skipped).

---

## QA summary (all run against the delivered tree)

- **Clean 7B sandbox suite — 38/38 passed** against the real modules
  (files/objects built with the REAL `normalizeFile`/`normalizeObject`):
  collection across all three linkage paths with dedupe; normalized shape;
  role precedence (real purpose wins) + all inferred roles; graceful
  degradation without IndexedDB; sync asset count; panel shows title,
  image thumbnail from an existing URL, on-demand 3D action for STL/OBJ,
  honest 3DM status, roles; hidden-when-empty + compact empty state; pack
  assets section lines incl. 3DM status; Hebrew summary mentions
  references+models and קלאסטר; EN prompt includes all four context lines
  and remains Hebrew-free; client text mentions references; references
  reflect the real count; asset-less pack identical to 7A behavior; cards
  show "3 נכסי עבודה"; Output Pack overlay renders the section; Studio
  wiring proven (active-project hook, render-only-when-assets);
  `/studio/design`, `/studio/projects`, `/studio/workstation` mount; only
  pre-existing persistence keys.
- **Regressions:** Clean 7A 33/33 (proves `buildOutputPack` backward
  compatibility), 6G 19/19, 6F 20/20, 6E 22/22, 6D 22/22.
- **Forbidden-token scan** on new lines + new files: clean — no commerce
  language, external APIs, pricing, certificates, direct storage, or new
  keys; no direct `three` import in new code (the existing viewer is reused
  lazily).
- **Brace balance** on all seven changed/new files.

## Confirmations

- **No protected stores were edited** — `designProjects.js`, `workTray.js`,
  `designBriefStore.js`, `designDraft.js`, `activeWorkStore.js`,
  `assetsStore.js`, `assetsDb.js`, `labels.js`, `Asset3DViewer.js`,
  `DesignProjectsLibrary.js` all `cmp`-proven byte-identical to baseline.
- **No packages were added** — `package.json` byte-identical; the 3D viewer
  reuses the existing `three` dependency, loaded on demand only.

---

## Upload checklist

1. Open the current Vercel-confirmed repo (Clean 7A state).
2. Copy the ZIP contents into the repo root. Expected Git status:
   - *modified*: `pages/studio/projects.js`,
     `components/studio/design/shell/StudioShell.js`,
     `lib/studio/outputPack.js`,
     `components/studio/projects/WorkFilesPanel.js`,
     `components/studio/projects/OutputPackPanel.js`
   - *added*: `lib/studio/assetContext.js`,
     `components/studio/shared/WorkAssetsPanel.js`,
     `CHANGELOG-CLEAN-7B.md`
   If ANY other file shows as modified — stop and report.
3. Commit: `Clean 7B — Asset-Aware Context v1`.
4. Wait for the Vercel build to pass.
5. Verify in production:
   - `/studio/design` unchanged when the Active Work File has no assets.
   - Link an asset object to a Work File (assets library flow), continue
     that file → the "נכסי עבודה" area appears under the canvas; image
     thumbnails show; STL/OBJ open the existing 3D viewer on demand; 3DM
     shows the future-status card.
   - `/studio/projects` cards show "N נכסי עבודה" when files are linked.
   - "פתח חבילת פלט" → assets section + enriched summary/prompt/client
     text; asset-less files show the 7A pack with the placeholder.
   - מחשבון / תעודות / מלאי / קליטה untouched and working.
