# CHANGELOG — Clean 8E: Media Workflow v1

Baseline: Vercel-confirmed Clean 8D. Additive-only; no protected store
internals edited; no packages, APIs, Airtable, pricing, certificates, render
engines, external AI services (no Gemini/Stability/Sora connections), or
persistence keys added. Manual workflow management only.

## Changed files (3 changed + 2 new + this file)

1. `lib/studio/mediaWorkflow.js` (NEW — pure helper)
2. `components/studio/projects/MediaWorkflowPanel.js` (NEW — panel)
3. `components/studio/projects/WorkFilesPanel.js`
4. `components/studio/projects/OutputPackPanel.js`
5. `pages/studio/projects.js`
6. `CHANGELOG-CLEAN-8E.md` (new)

No changes to /studio/design, /studio/create, /studio/workstation, or any
store/lib beyond the new helper.

## Storage decision (public API only — no gap)

All media-workflow data lives as records inside the project's EXISTING
reserved `renders` array — the field `normalizeProject` has explicitly
preserved since Clean 4A as a placeholder for future renders/media
(`renders: Array.isArray(raw.renders) ? raw.renders : []`). Persistence goes
ONLY through the EXISTING public `updateProject(id, { renders })` — the same
pattern Clean 8B rename and Clean 8C attach use. `updateProject` runs the
patch through normalizeProject and the array round-trips intact (proven in
QA). NO new persistence key, NO store-internal edit, NO schema change.

Record shapes (both carry a `kind` discriminator; any foreign record found
in `renders` is always preserved untouched — proven in QA):
- ONE state record: `{ renderId: 'mediaWorkflowState', kind:
  'mediaWorkflowState', mediaStatus, selectedTool, selectedPromptKey,
  sentAt, updatedAt }`
- result records: `{ renderId: 'media_…', kind: 'mediaResult', title, tool,
  url, notes, status, createdAt }`

## What was added

### 1. lib/studio/mediaWorkflow.js — pure helper
- Statuses (canonical English + Hebrew labels): notPrepared «לא הוכן»,
  promptReady «מוכן להדמיה», sentToTool «נשלח לכלי חיצוני», resultReceived
  «התקבלה תוצאה», clientReady «מוכן ללקוח».
- Tools: gemini «Gemini / Nano Banana», stability «Stability», sora «Sora»,
  midjourney «Midjourney», other «אחר».
- Prompt options mapped to the Clean 8D pack fields (mediaPromptEn /
  sketchPromptEn / presentationPromptEn).
- Pure readers/builders: getMediaState, getMediaResults, buildStatePatch
  (single-record upsert; invalid status/tool values are ignored),
  buildMarkSentPatch, buildMediaResultRecord (title required),
  buildResultPatch, mediaStatusLineHe («מדיה: …» — shown only once the
  workflow was touched, so pre-8E cards render byte-for-byte the same),
  mediaResultsCountHe («2 תוצאות מדיה» / «תוצאת מדיה אחת»),
  mediaNextActionHe, isSafeLinkUrl / isSafeImageUrl (https-only; image by
  extension; javascript:/data: URLs rejected — nothing is ever fetched).

### 2. components/studio/projects/MediaWorkflowPanel.js — «מדיה והדמיות»
Compact overlay (same pattern as OutputPackPanel) per Work File:
- Next-action hint per status.
- Status chips (manual update) + target-tool chips.
- Prompts from the Clean 8D Output Pack with per-prompt
  «השתמש לפרומפט הדמיה» + «העתק פרומפט» (native clipboard, «הועתק»
  feedback), and «סמן כנשלח» — sets status to «נשלח לכלי חיצוני», saves the
  selected tool and the sent date/time; the sent line shows date + tool.
- Manual result form: שם תוצאה / כלי / קישור או URL לתמונה / הערות / סטטוס +
  «שמור תוצאת מדיה» (metadata/URL/notes only — no upload). Title required.
- Saved-results list (newest first): title, tool, status, created date,
  notes; https image-looking URLs render a small preview (onError hides it),
  other https URLs render as a safe link (rel="noopener noreferrer"),
  non-https strings render as plain text.
- PRESENTATIONAL: receives the FRESH project (looked up by id in the page so
  every store update re-renders state/results) + callbacks.

### 3. WorkFilesPanel.js — card summary + action
- Compact media line per card: «מדיה: <סטטוס>» + results-count chip — only
  when the workflow was touched or results exist (pre-8E cards unchanged,
  proven in QA).
- Third card action «מדיה והדמיות» (renders only when the onOpenMedia
  handler is provided — defensive like onRename).
- `WORK_FILES_HE` keeps every existing key; one key added.

### 4. OutputPackPanel.js — call-to-action
- «העבר למדיה והדמיות» button in the panel header (gold accent), rendered
  only when onOpenMedia is provided. Clicking closes the pack and opens the
  Media Workflow for the same Work File. All 8D sections and the six copy
  buttons are unchanged (proven in QA). `OUTPUT_PACK_HE` keeps every
  existing key; one key added.

### 5. pages/studio/projects.js — wiring
- mediaProjectId state (id, not a snapshot) + fresh lookup from the
  projects hook, so updateProject → store event → hook refresh → panel
  re-render with fresh state/results.
- handleUpdateMediaState / handleSaveMediaResult persist via the EXISTING
  public updateProject with the helper-built `renders` patches.
- WorkFilesPanel gets onOpenMedia; OutputPackPanel gets onOpenMedia.
- Existing continue/pack/rename wiring untouched.

## QA summary (all passed)

- esbuild compile + import resolution: both new files, all three changed
  files, and pages/studio/{design,create,index,assets,inventory,tray,
  workstation}.js + pages/index.js.
- Store round-trip sandbox (27 checks) against the REAL public
  designProjects store (stubbed browser storage): status/tool/prompt-key
  persist and survive normalizeProject; partial updates keep prior fields;
  «סמן כנשלח» sets sentToTool + tool + sentAt; two results persist newest-
  first while the state record survives; count/status card lines correct;
  title-required validation; https/image/javascript:/data: URL safety;
  FOREIGN records in `renders` preserved through every patch; invalid
  status/tool values ignored.
- SSR render smoke test (36 checks): media panel renders all five statuses,
  all five tools, prompt rows + three action labels, result form fields,
  save button, results list; image URL → <img> preview, non-image URL →
  link only; pack CTA renders with handler and is hidden without (defensive);
  pack still shows all six 8D copy buttons; card shows media status line +
  «2 תוצאות מדיה» + media action; pre-8E card renders with NO media line and
  NO media button.
- `comm -23` export-removal proofs: NO exports removed from any changed file.
- Full-tree diff vs the Clean 8D baseline ZIP: exactly 3 changed + 2 new
  files (+ this changelog); everything else byte-identical.
- Forbidden-token scan: no localStorage/sessionStorage/fetch/axios/network
  code in the new files (persistence is exclusively the public store call);
  no Airtable/NEXT_PUBLIC/basket/checkout; Hebrew as native literals (no
  \uXXXX). The single scan hit was a documentation comment ("updateProject
  API. No API…") — verified no real network/API code exists.

## Confirmations

- No protected store internals edited (designProjects.js, workTray.js,
  designBriefStore.js, designDraft.js, activeWorkStore.js, labels.js keys,
  package.json — all byte-identical to the 8D baseline).
- No packages added. No APIs added. No render engine. No external AI
  service connected. No new persistence key.
- /studio/workstation untouched, not promoted.

## Known limitations

- Result URLs are user-entered metadata; the small preview renders only for
  plain https URLs ending in an image extension and hides itself on load
  error. Nothing is fetched or validated by code; there is no file upload
  yet (per spec).
- The media state is per-Work-File; there is no cross-project media
  dashboard yet.
- «סמן כנשלח» uses the currently selected tool (defaults to «אחר» when none
  was chosen) — the sent line always shows which tool was recorded.
- Editing/deleting a saved media result is not part of v1; results are
  append-only records (a future milestone can add manage actions through the
  same public patch pattern).

## Upload checklist

1. Upload the ZIP contents to the repo root (1:1 paths, no wrapper folder):
   - `lib/studio/mediaWorkflow.js` (new)
   - `components/studio/projects/MediaWorkflowPanel.js` (new)
   - `components/studio/projects/WorkFilesPanel.js` (replace)
   - `components/studio/projects/OutputPackPanel.js` (replace)
   - `pages/studio/projects.js` (replace)
   - `CHANGELOG-CLEAN-8E.md` (new)
2. Commit: `Clean 8E — Media Workflow v1`
3. Wait for the Vercel build to pass.
4. Verify: /studio/design opens · /studio/create opens · /studio/projects
   opens · existing Work Files appear · חבילת פלט opens with the
   «העבר למדיה והדמיות» CTA · «מדיה והדמיות» opens · status + tool select
   works · prompt copy works · «סמן כנשלח» sets «נשלח לכלי חיצוני» ·
   «שמור תוצאת מדיה» saves and the result appears · card shows
   «מדיה: …» + results count · calculator, certificates, Airtable
   read/create flows untouched.
5. Only after Vercel confirmation: this ZIP becomes the Clean 8E baseline.
