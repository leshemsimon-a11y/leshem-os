# CHANGELOG — Clean 8G: Asset Intake Flow

Baseline: Vercel-confirmed Clean 8F. Product-flow sprint — additive; no
protected store internals edited; no packages, APIs, Airtable, pricing,
certificates, render engines, external AI services, or persistence keys
added; /studio/design and /studio/workstation untouched; no new viewer; no
file upload in the Create Flow; no Work Tray logic changes.

## Changed files (5 changed + 2 new + this file)

1. `lib/studio/attachedAssets.js` (additive)
2. `lib/studio/outputPack.js` (additive + one 1-char ASCII fix, see below)
3. `components/studio/assets/AssetIntakePanel.js` (NEW)
4. `components/studio/assets/AssetObjectCard.js`
5. `components/studio/assets/AttachToActiveWork.js`
6. `components/studio/projects/ProjectAssetsStrip.js` (NEW)
7. `pages/studio/create.js`
8. `CHANGELOG-CLEAN-8G.md` (new)

NOT changed: `pages/studio/projects.js` and `WorkFilesPanel.js` — the
projects-integration requirement (attached count + role chips + media result
count per Work File card) is ALREADY live since Clean 8C/8E and re-verified
in this milestone's QA; the new role labels flow through automatically.

## Role persistence — solved through an EXISTING public API (no gap)

The asset role persists ON the asset object through the EXISTING public
`assetsStore.setCatalog(objectId, { assetRole })` (whitelisted field, thin
wrap over the public `updateObject`): `normalizeObject` has preserved the
free-form `assetRole` string field since Clean 4B.4a
(`assetRole: typeof raw.assetRole === 'string' ? raw.assetRole : null`).
Proven in QA that the field survives the normalize round-trip. NO store
internals edited, NO new persistence key, NO missing API to report for role
persistence. Canonical English values are stored; Hebrew appears only in UI.

## What was added

### 1. «מה לעשות עם הנכס?» — AssetIntakePanel (NEW)
Grouped intake action area on every Asset Object card:
- Role actions (label per spec; stored value canonical English):
  «השתמש כרפרנס» (designReference), «סמן כאבן / מלאי» (inventoryStone —
  NEW role), «סמן כמודל תכשיט» (jewelryModel), «סמן כסקיצה» (sketch),
  «סמן כקובץ לקוח» (clientFile), «סמן כתוצאת מדיה» (mediaAsset). The active
  role is highlighted with a ✓; current role line («תפקיד הנכס: …» / «טרם
  הוגדר תפקיד לנכס»); toast on save.
- «צרף לתיק פעיל» — the EXISTING Clean 8C AttachToActiveWork flow rendered
  inside the area, behavior unchanged, including the no-active helper
  «אין תיק פעיל. צור או פתח תיק עבודה כדי לצרף נכס.» (spec text, already
  exact since 8C).
- «פתח פרטים» — triggers the card's existing expand action.
- File-type line («סוג קובץ: תמונה / קובץ מודל תלת־ממד / קובץ 3DM /
  מסמך PDF / קובץ לא מזוהה») + the 3DM notice
  «תמיכת 3DM תהיה זמינה בהמשך».
- «הוסף למגש עבודה» remains available exactly where it was — inside the
  existing destination-aware AssetNextActions block (untouched).

### 2. lib/studio/attachedAssets.js — roles + file-type awareness (additive)
- ATTACHED_ROLE += `inventoryStone` («אבן / מלאי»); mediaAsset label aligned
  to the spec role list: «תוצאת מדיה» (was «נכס מדיה»; the CANONICAL stored
  value `mediaAsset` is unchanged, so existing records keep working).
- File types: `glb`/`gltf` now classify as usable models alongside stl/obj;
  NEW `document` type for `pdf`; NEW exported Hebrew label map
  ATTACHED_FILE_TYPE_HE (incl. «קובץ לא מזוהה» for unknown) + the
  MODEL_3DM_NOTICE_HE constant.
- English prompt phrases (ASCII-proven): image phrase aligned to spec
  wording («…as visual inspiration.»), model phrase aligned to spec wording
  («Use the attached model file as a base jewelry form reference.» — also
  correct now that GLB counts as a model), NEW media-result phrase
  («Use the attached previous media result as visual continuity
  reference.»).

### 3. lib/studio/outputPack.js — attached assets influence all outputs
- The three ENGLISH prompts (realistic render / sketch / client
  presentation) now all carry: media-result continuity phrase (via the
  shared phrases), NEW PDF phrase («A PDF document is attached as project
  context.»), and the presentation prompt now also carries the 3DM/client-
  file/PDF extra phrases (previously render+sketch only).
- Hebrew production notes: NEW lines for an attached previous media result
  and an attached PDF; the model line broadened to STL/OBJ/GLB.
- Hebrew view labels: model label now «קובץ מודל (STL/OBJ/GLB)», NEW
  «מסמך PDF», unknown now «קובץ לא מזוהה».
- The Hebrew professional summary and client description already list
  attached assets by role since 8C — the new roles flow automatically.
- ASCII fix (disclosed): the 8D 3DM phrase contained a typographic em dash
  (U+2014) — replaced with an ASCII hyphen so ALL English prompt text now
  passes the strict ASCII guard (proven by regex in QA).

### 4. AttachToActiveWork — attach role follows the classified role
The attach dropdown now DEFAULTS to the asset's persisted `assetRole` when
valid (and follows later classifications); manual selection still overrides
freely. Everything else (record shape, upsert, public updateProject into the
project's reserved `assets` array) is byte-for-byte the 8C flow.

### 5. Create Flow — «רפרנסים ונכסים» (ProjectAssetsStrip, NEW)
Compact read-only strip mounted BELOW the existing flow in
pages/studio/create.js (CreateFlowShell itself untouched):
- Active Work File's attached assets: name + Hebrew role chip + file-type
  label per asset.
- Empty state: «אפשר להוסיף רפרנסים וקבצים דרך ספריית הנכסים.»
- No active Work File: explanatory line (assets appear after saving a Work
  File).
- «פתח ספריית נכסים» → /studio/assets.
- Hydration-gated: renders nothing server-side (SSR parity proven).

## QA summary (all offline; esbuild via the tsx package binary)

- esbuild compile PASS on all touched + adjacent files. NOTE: the assets
  page compile requires `--external:three` because the BASELINE
  Asset3DViewer.js imports three.js — `three@^0.160.0` is a PRE-EXISTING
  dependency already in package.json (untouched; proven byte-identical),
  and the baseline fails the offline resolve identically. No NEW code
  imports three or next/dynamic (explicit import scan on both new files).
- 32-check logic sandbox with REAL exports: role set/labels, glb/gltf/pdf/
  3dm/unknown classification, assetRole normalize round-trip, attach
  records per type, full project round-trip through public updateProject,
  Output Pack assertions (all new phrases present; all three English
  prompts strictly ASCII by regex; Hebrew production-note lines; role
  listing; references count; document label), Clean 8E media-workflow
  regression (state round-trip intact; assets array untouched by media
  patches), and a no-assets project producing zero asset phrases
  (backward compatibility).
- SSR: intake panel renders all states (no-role, persisted-role-active,
  3DM notice, file-type chip, all seven actions); ProjectAssetsStrip is
  SSR-silent (no hydration mismatch); SSR BYTE-PARITY vs the 8F baseline
  for /studio/design, /studio/projects, /studio/create AND /studio/assets
  (asset cards are hydration-gated).
- `comm -23` export-removal proof: PASS on every changed file.
- Forbidden-token scan on NEW lines: clean (no next/dynamic, no three
  imports, no Airtable usage, no NEXT_PUBLIC, no \uXXXX escapes, no
  commerce language, no storage keys).
- Protected files byte-identity (`cmp`): designProjects.js, workTray.js,
  designBriefStore.js, designDraft.js, activeWorkStore.js, assetsStore.js,
  assetsDb.js, package.json — ALL IDENTICAL. Full-tree diff: exactly the
  listed files.

## Confirmations

- NO protected stores edited (byte-identity proven).
- NO packages added (package.json byte-identical).
- NO new APIs, persistence keys, render engine, or external AI.

## Known limitations / missing public APIs

- Asset-role persistence needed NO new API (see above) — nothing to report
  there.
- Preview URL on attached records: still previewFileId (not a URL) by the
  8C design — uploaded files resolve only to EPHEMERAL IndexedDB blob URLs,
  so a durable URL cannot be stored; resolving thumbnails on the projects
  side would need a small approved read helper in a future milestone.
- STYLE_PREFERENCE still lacks a real cluster value (known since 6D;
  heuristic detection still active); FILE_PURPOSE still lacks
  sketch/client-file/media values on the FILES axis — the 8G role now
  covers this need at the OBJECT level via assetRole.
- 3DM remains detect-and-label only («תמיכת 3DM תהיה זמינה בהמשך») —
  rhino3dm wasm is a new package, out of scope.

## Upload checklist

1. Unzip `LESHEMS_OS_Clean_8G_Asset_Intake_Flow_ROOT_READY.zip` at the repo
   ROOT (1:1 paths). Overwrite the 5 existing files; AssetIntakePanel.js,
   ProjectAssetsStrip.js and this changelog are new.
2. Commit, push, wait for the Vercel build.
3. Verify:
   - /studio/assets: each card shows «מה לעשות עם הנכס?» with the role
     actions, file-type line, «פתח פרטים», and the 8C «צרף לתיק פעיל» flow;
     marking a role persists (survives reload) and highlights with ✓; a 3dm
     asset shows «תמיכת 3DM תהיה זמינה בהמשך».
   - Attaching with an active Work File works; without one the helper
     «אין תיק פעיל. צור או פתח תיק עבודה כדי לצרף נכס.» shows.
   - /studio/create shows «רפרנסים ונכסים» with the active file's assets
     (or the library helper) + «פתח ספריית נכסים».
   - /studio/projects cards still show attached count, role chips (new
     labels included), and media counts.
   - Output Pack: prompts and production notes reflect attached
     image/model/sketch/client/PDF/media-result assets; English sections
     contain no Hebrew.
   - /studio/design, Media Workflow (8E/8F deep link) unchanged.
4. Once Vercel is confirmed, export the repo ZIP as the Clean 8G baseline.
