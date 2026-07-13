# LESHEM.S OS — Clean 8H: Guided Create Path + Instant Feedback

Builds on the Vercel-confirmed Clean 8G baseline. Turns `/studio/create` into
the main guided creation path — eight visible steps, one primary action per
step, instant feedback after every input — and de-emphasizes the data-losing
classic asset-creation form in favor of the safe Quick Create flow.

No protected store internals, `package.json`, APIs, Airtable, pricing,
certificates, render engine, external AI, new packages, new persistence keys,
or `/studio/workstation` were touched.

---

## Changed files (2 changed · 2 new · 1 changelog)

### NEW — `lib/studio/createIntake.js`
Pure intake-normalization helper (constants + pure functions only; no store,
no persistence key, no network, no package). Turns everything the flow can
receive — pasted text, pasted URL, pasted image, dragged file, uploaded file —
into one session-held record with a detected type and a suggested attach role:

- Type detection: image / text reference / URL / 3D model (STL, OBJ, GLB,
  GLTF) / 3DM (future-support) / PDF document / unknown — reusing the Clean 8G
  `classifyExtension` so files behave exactly like attached assets.
- Suggested roles map to the canonical Clean 8C/8G values
  (`designReference`, `jewelryModel`, `clientFile`).
- Hebrew type + status labels («נקלט», «דורש שמירת תיק», …).
- `intakeToReferenceText` — synthesizes the existing createFlow
  `referenceText` input (Hebrew is safe there: it only feeds Hebrew echoes and
  the brief's `intention` free-text field; the English prompt path never
  embeds it).
- `intakeObjectInput` / `intakeFileRow` — build inputs for the EXISTING public
  `assetsStore.createObjectWithFiles` (identical shape to the Quick Create
  wizard), using VALID existing enum members only.
- `intakeCounts` / `intakeSummaryHe` — step-4 summary + counters.

### NEW — `components/studio/create/CreateIntakeArea.js`
The «רפרנסים ונכסים» intake area. Browser APIs only:

- Paste — clipboard image files become item cards; pasted text/URL becomes an
  item card immediately.
- Drag-and-drop files; upload via a hidden file input.
- Each input creates an instant item card: name · detected type · suggested
  role · «נקלט» + «דורש שמירת תיק», with a session-only object-URL thumbnail
  for images (revoked on unmount) and the 3DM future-support notice.
- «הסר» is the only thing that removes an item — no silent loss.

### CHANGED — `components/studio/create/CreateFlowShell.js`
Rewritten from the Clean 8A/8B seven-step MVP into the eight-step guided path.
The exported `CREATE_HE` label map is preserved (export-removal proof passes);
`generateCreateDirections` / `buildCreateBrief` / `buildCreateOutputPack` are
consumed unchanged.

- **Step 1 — הגדרת תיק העבודה:** name · type · style · free request, with a
  live summary card «אנחנו יוצרים: [type] בסגנון [style]». Primary enabled
  once type + style are chosen.
- **Step 2 — אבנים ופריטי עבודה:** real Work Tray list + «נבחרו X אבנים
  לעבודה»; empty state «אפשר להמשיך בלי אבנים…» with primary «המשך בלי אבנים»
  and secondary «פתח מלאי».
- **Step 3 — רפרנסים ונכסים:** the CreateIntakeArea (above).
- **Step 4 — סיכום מוכן ליצירה:** «מה המערכת תשתמש בו» recap (name, type,
  style, stone count, refs summary, request) with gentle, non-blocking
  warnings — «לא נבחרו אבנים — הכיוונים יהיו רעיוניים בלבד.» and a no-refs
  note.
- **Step 5 — יצירת כיווני עיצוב:** primary «צור כיווני עיצוב» → 3 local
  directions, then advances to selection.
- **Step 6 — בחירת כיוון:** «נוצרו 3 כיווני עיצוב. בחר כיוון כדי להמשיך.»;
  on select «נבחר כיוון: [title]» + recommended next action; a per-card
  reference-influence line appears when refs exist; secondary «צור כיוונים
  מחדש».
- **Step 7 — שמירת תיק עבודה:** save recap + primary «שמור כתיק עבודה».
- **Step 8 — הצלחה ופלט:** «התיק נוצר ונשמר בהצלחה.» + asset-save result line,
  next actions «פתח תיק עבודה» / «פתח בסטודיו» / «הכן מדיה והדמיות»
  (the Clean 8E media workflow (`?focus=media` if supported) link) / «צור עוד תכשיט», and an output
  preview (Hebrew client description + English render prompt + «פתח חבילת פלט
  מלאה»).

**Save chain (the only persistence moment):**
1. `projectsStore.save(...)` (existing public API) + `setActiveWorkId`.
2. For each file/image intake item: `createObjectWithFiles` +
   `linkObjectToProject` (existing public APIs), then a Clean 8C attach record
   via `buildAttachedAssetRecord` / `upsertAttachedAsset`, persisted with the
   existing public `updateProject({ assets })`.
3. Text/URL references are carried in the brief's existing `intention`
   free-text field.
Per-item failures never lose data — a failed file is reported by name and its
description is still echoed as text inside the brief; the project save itself
is never blocked.

### CHANGED — `components/studio/assets/AssetLibraryPanel.js`
Fixes the classic-creation data-loss issue by de-emphasizing that form:

- The classic metadata-only form is collapsed behind a «◂ יצירה קלאסית
  (מתקדם)» toggle — Quick Create (which safely creates object + files in one
  flow) remains the primary path.
- Collapsing/expanding or switching tabs NEVER clears a typed draft; the
  toggle shows a « · טיוטה פעילה» indicator when a draft exists.
- Fields clear ONLY after a successful create, and success is announced
  explicitly with a toast `הנכס "…" נוצר ✓`.

---

## QA summary

- **esbuild compile:** PASS on all touched + adjacent files (`create.js`,
  `assets.js`, `projects.js`, `design.js`, both new files, both changed files,
  and the createFlow/outputPack consumers).
- **Protected byte-identity (`cmp`):** IDENTICAL for all protected stores and
  `package.json`, plus `createFlow.js`, `outputPack.js`, `mediaWorkflow.js`,
  and `attachedAssets.js`.
- **Full-tree diff vs baseline:** exactly the four files above.
- **Export-removal proof (`comm -23`):** PASS — `CREATE_HE` and the default
  export preserved; no export removed from AssetLibraryPanel.
- **Forbidden-token + persistence-key scan (new lines only):** CLEAN — no
  `next/dynamic`, no `three` import, no `NEXT_PUBLIC`, no Airtable, no
  `fetch(`, no `\uXXXX` escapes, no commerce language, no new persistence key.
- **Logic sandbox (34 checks, real exports, in-memory IndexedDB + localStorage
  stubs):** PASS — detection, item building, reference synthesis, 3 directions
  with active cluster logic (style = קלאסטר + multi-stone), `brief.intention`
  persistence, the FULL save chain (assets created with `assetRole`, linked to
  the project, files stored + `approved` + primary image resolved, 2 attach
  records on the project), the saved project's REAL Output Pack reflecting the
  flow assets with ASCII-only English prompts, and the flow preview pack
  staying ASCII-clean despite Hebrew references.
- **SSR smoke:** PASS — CreateFlowShell, CreateIntakeArea (empty + populated),
  and AssetLibraryPanel render without throwing; intake cards show «נקלט» /
  «דורש שמירת תיק» / the 3DM notice. Page-level SSR length is byte-identical to
  baseline for both `/studio/create` and `/studio/assets` (both gate on store
  hydration, so the guided flow renders client-side after hydration — the
  established studio pattern).

---

## Confirmations

- **No protected stores edited** — all eight protected files `cmp`-proven
  byte-identical.
- **No packages added** — `package.json` byte-identical; no new npm dependency;
  no `three` / `next/dynamic` import in any new code.
- **No new APIs, persistence keys, schema, render engine, or external AI.**
- `/studio/workstation` untouched; `/` and `/v2` untouched.

## Persistence gaps (reported, not hacked around)

- **Text/URL references** persist inside the brief's existing `intention`
  free-text field (not as separate library objects) — there is no public API
  to store a standalone text/URL asset without a file blob, and adding one
  would require a protected store change. This is by design and clearly
  labeled in the flow.
- **Pasted-image thumbnails** in the intake area are ephemeral object URLs for
  session display only; the durable copy is the blob written to IndexedDB via
  the public `createObjectWithFiles` path at save time.
- **`/studio/design` intentionally unchanged** — the Clean 8E media action
  already surfaces active-work clarity and the media workflow there; per the
  spec's "keep the full guided flow in `/studio/create`" guidance, no new
  controls were added to the design board to avoid clutter.
- Pre-existing, unchanged since earlier milestones: `STYLE_PREFERENCE` still
  lacks a formal `cluster` enum value and `FILE_PURPOSE` lacks sketch/
  client-file/media axis values (both require approved protected store edits);
  3DM is detect-and-label only (preview needs the out-of-scope `rhino3dm`
  wasm package).

---

## Upload checklist

1. Unzip at the repository root — paths map 1:1
   (`components/…`, `lib/…`, `CHANGELOG-CLEAN-8H.md`); no wrapper folder.
2. Confirm the four code paths overwrote/created:
   - `components/studio/create/CreateFlowShell.js` (changed)
   - `components/studio/create/CreateIntakeArea.js` (new)
   - `lib/studio/createIntake.js` (new)
   - `components/studio/assets/AssetLibraryPanel.js` (changed)
3. Commit and push; let Vercel build.
4. Verify per the spec QA list: `/studio/create` opens as a clear step-by-step
   flow with one primary action per step; name/type/style (incl. קלאסטר)
   selectable; tray stones shown / continue-without works; paste text, paste
   URL, upload/drag a file all create instant item cards; Generate makes 3
   directions using stones/refs/request/style; select a direction; Save creates
   a Work File with a clear success state and next actions;
   `/studio/design` and `/studio/projects` still open; classic asset creation
   no longer silently loses data.
5. Once Vercel confirms, export the repository ZIP as the next baseline.
