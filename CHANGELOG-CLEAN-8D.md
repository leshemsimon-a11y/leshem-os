# CHANGELOG — Clean 8D: Output Pack Pro + Media Prep

Baseline: Vercel-confirmed Clean 8C. Additive-only; no protected store
internals edited; no packages, APIs, Airtable, pricing, certificates, render
engines, external AI/media services, or persistence keys added. Not a render
sprint — structured text and prompts only, for MANUAL copy into external
media tools.

## Changed files (2 changed + this file)

1. `lib/studio/outputPack.js`
2. `components/studio/projects/OutputPackPanel.js`
3. `CHANGELOG-CLEAN-8D.md` (new)

`pages/studio/projects.js`, `pages/studio/create.js`,
`WorkFilesPanel.js`, and `lib/studio/attachedAssets.js` required NO changes —
the existing wiring (`pack={buildOutputPack(packProject)}`) carries the new
pack fields automatically, and Create-Flow Work Files already persist the
request/reference/direction context in existing brief fields.

## What was added

### 1. lib/studio/outputPack.js — professional output package (additive)

`buildOutputPack(project)` keeps its four existing return fields
(`professionalHe`, `mediaPromptEn`, `clientHe`, `references`) and adds:

- `sketchPromptEn` — ENGLISH-ONLY design concept / sketch prompt (D).
- `presentationPromptEn` — ENGLISH-ONLY client presentation prompt (E).
- `productionNotesHe` — Hebrew practical production notes (F): stone
  placement logic (selected direction's layout when real, otherwise derived
  from the tray), design structure, possible setting direction from the
  style, the selected direction's production notes, per-asset-type
  model/reference influence bullets, cluster note, and a fixed
  "לבדוק לפני ייצור" risk line.
- `attachedAssets` — per-asset view rows for the panel's «נכסים ורפרנסים»
  section: name, Hebrew role, Hebrew file-type label
  (תמונה / קובץ מודל (STL/OBJ) / קובץ 3DM / קובץ), and preview status
  (kept honest: previewFileId present → «תצוגה מקדימה קיימת»; 3DM →
  «תמיכה בתצוגה מתוכננת»; otherwise «ללא תצוגה מקדימה»).
- `isCluster` — the computed cluster flag.

Section A (Hebrew professional summary) enrichment:
- `brief.intention` (the Create Flow persists the reference description here,
  already prefixed «רפרנס: ») now appears in the summary.
- Cluster note line when cluster context is detected.
- WORDING CHANGE (disclosed): the free-request line label changed from
  «הערות עיצוב:» to «בקשת העיצוב:» to match the spec ("client request/free
  text") and the Create Flow's own wording. Same field (brief.designGoal),
  same position.

Section C (realistic render prompt) enrichment:
- Extra English asset phrases computed locally (attachedAssets.js untouched):
  3DM → "A 3DM model file is attached; preview/use support is planned…";
  client file → "A client-provided file is attached as contextual reference…".
- Selected direction included as "Selected design direction: …" ONLY when the
  concept's renderBriefText is real English — guarded by an exact-match
  filter against the two known Hebrew placeholder strings written by
  designConcepts.js PLUS an ASCII-only check, so Hebrew can never leak into
  English output (proven in QA).
- Cluster condition broadened: multiple stones OR explicit cluster enum OR
  cluster identity preserved in existing text fields (the Create Flow maps
  cluster→halo in styleDirection and keeps the identity in notes/concept
  text — detection inspects Hebrew text but never embeds it). Cluster line
  now uses the spec language (balanced multi-stone composition, intentional
  gemstone grouping, styled arrangement, practical setting spacing).
- Closing photography line extended with "clean background", "soft studio
  lighting", "accurate proportions" per spec.

### 2. components/studio/projects/OutputPackPanel.js — output workspace

Upgraded section order: A סיכום מקצועי → B תיאור ללקוח → נכסים ורפרנסים
(compact rows, only when assets are attached) → C פרומפט הדמיה ריאליסטית →
D פרומפט סקיצה / קונספט → E פרומפט מצגת ללקוח → F הערות ייצור → רפרנסים
(existing linkage line, unchanged behavior).

Six copy buttons (native clipboard API only, no package), each with its own
«הועתק» feedback (1800ms, single shared state):
העתק סיכום · העתק תיאור לקוח · העתק פרומפט הדמיה · העתק פרומפט סקיצה ·
העתק פרומפט מצגת · העתק הערות ייצור.

The `OUTPUT_PACK_HE` export keeps every existing key (title, close,
sectionProfessional, sectionPrompt, sectionClient, copyPrompt, copied,
mediaNote) and adds new keys only. All 8D sections render DEFENSIVELY —
only when their pack field exists — so the panel cannot crash on a
legacy-shaped pack (proven in QA).

## QA summary (all passed)

- esbuild compile + import resolution: outputPack.js, OutputPackPanel.js,
  WorkFilesPanel.js, pages/studio/{projects,create,design,index,assets,
  inventory,tray,workstation}.js, pages/index.js.
- Logic sandbox (47 checks): empty project no-throw; legacy single-stone
  project unchanged semantics (no cluster language); Create-Flow cluster
  Work File (cluster detected via preserved text, request + reference in
  summary, English selected direction in prompt, cluster language in all
  three prompts and production notes); studio placeholder concept — Hebrew
  placeholders filtered from prompts and production notes; attached assets
  (image/STL/3DM/client file) — correct English phrases, view rows, Hebrew
  labels, preview statuses, production-note bullets; asset NAMES never enter
  English prompts.
- Hebrew-leak proof: regex /[\u0590-\u05FF]/ is negative on mediaPromptEn,
  sketchPromptEn, presentationPromptEn across ALL fixtures.
- SSR render smoke test: all seven sections + all six copy buttons render;
  legacy pack shape renders without crash.
- `comm -23` export-removal proof: NO exports removed from either changed
  file.
- Full-tree diff vs the Clean 8C baseline ZIP: ONLY the two listed files
  differ; everything else byte-identical. No new persistence keys, no
  protected store edits, no package.json change, no API/Airtable change.
- Forbidden-token scan on new lines: clean (no basket/checkout/localStorage/
  fetch/airtable/NEXT_PUBLIC/כוונת עיצוב/הגדרה); Hebrew as native string
  literals (no \uXXXX escapes).

## Known limitations

- The «נכסים ורפרנסים» rows show textual preview STATUS only — no thumbnail
  rendering (previews resolve through ephemeral IndexedDB URLs; a future
  milestone can resolve them via previewFileId through the existing store).
- «Selected design direction» appears in English prompts only for concepts
  carrying real English renderBriefText (Create-Flow directions). Studio-
  generated concepts hold an inert Hebrew placeholder there by design and
  are correctly skipped; their Hebrew names still appear in the Hebrew
  summary.
- Copy uses navigator.clipboard (requires a secure context — fine on
  Vercel HTTPS); failure is logged, never thrown.
- Cluster detection via text inspection is heuristic by necessity (the
  brief enum has no cluster value; changing enums is out of scope per the
  critical rule — gap reported, existing data used).

## Upload checklist

1. Upload the ZIP contents to the repo root (1:1 paths, no wrapper folder):
   - `lib/studio/outputPack.js` (replace)
   - `components/studio/projects/OutputPackPanel.js` (replace)
   - `CHANGELOG-CLEAN-8D.md` (new)
2. Commit: `Clean 8D — Output Pack Pro + Media Prep`
3. Wait for the Vercel build to pass.
4. Verify: /studio/design opens · /studio/create opens · /studio/projects
   opens · existing Work Files appear · «פתח חבילת פלט» opens the upgraded
   pack · all six copy buttons show «הועתק» · attached assets and cluster
   language appear when relevant · calculator, certificates, and Airtable
   read/create flows untouched (no files in those areas changed).
5. Only after Vercel confirmation: this ZIP becomes the Clean 8D baseline.
