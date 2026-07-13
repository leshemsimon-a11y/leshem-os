# LESHEM.S OS — Clean 8J: Render Studio Scene Library

Builds on the Vercel-confirmed Clean 8I baseline (including the post-8I QA
fix to `lib/studio/renderPromptFinalizer.js` documented in
`CHANGELOG-CLEAN-8I.md`, which is preserved untouched). Adds a structured
Render Studio Scene Library — render PACKS, SCENES, quality levels with
credit/USD cost estimates, and batch planning — on top of the existing
Clean 8I prompt finalizer. Still no external AI service, no real render
engine, no image generation: this milestone is planning and UI only.

No protected store internals, `package.json`, external APIs, Airtable,
pricing, certificates, a real render engine, new packages, new persistence
keys, or `/studio/workstation` were touched.

---

## Baseline safety check (before any 8J work)

The uploaded ZIP was compared file-for-file against the Clean 8I delivery.
Exactly two files differed, both already documented in the uploaded
`CHANGELOG-CLEAN-8I.md` under "QA correction — Work File free-text and
non-image asset context": `lib/studio/renderPromptFinalizer.js` gained
explicit English instructions for recorded request/reference text, client
file / PDF mentions, and a sketch-over-generic-image preference — plus a
`warnNoRefs` fix so a textual reference no longer triggers a false "no
references attached" warning. Nothing else in the tree differed from the
delivered 8I baseline. This was accepted as the safe, current baseline and
Clean 8I was **not** rebuilt.

---

## Changed files (2 new · 2 changed · 1 changelog)

### NEW — `lib/studio/renderSceneLibrary.js`
Pure helper (constants + pure functions only; no store, no persistence key,
no network, no package):

- **8 scenes** (`SC-01`…`SC-08`) — background / angle / aspect ratio /
  Hebrew name / Hebrew use-case / English opener + closing sentence for
  each, exactly matching the spec's scene table (Catalog White Front,
  Catalog White 3/4, Macro Detail, Dark Luxury, Soft Editorial, On Hand, On
  Model, Cluster Composition). Every English string passes an ASCII check.
- **4 render packs** (`catalog`, `client`, `social`, `handModel`) — Hebrew
  label, purpose, ordered scene-id list, and default-outputs-per-scene,
  matching the spec exactly (Catalog Pack: SC-01/02/03 × 4; Client Pack:
  SC-01/04/05 × 4; Social Pack: SC-05/04/08 × 3; Hand/Model Pack: SC-06/07
  × 3).
- **3 quality levels** (`draft`, `standard`, `high`) — Hebrew label,
  purpose, suggested engine (Stable Image Core / SD3.5 Large or Core /
  Stable Image Ultra), and credit cost per image (3 / 6.5 / 8), matching
  the spec exactly.
- `estimateCost`, `estimateCostLineHe` — per-selection credit/USD cost;
  `estimateCostLineHe({ quality: 'high', outputCount: 4 })` reproduces the
  spec's exact example string: *"עלות משוערת: 4 תמונות × 8 קרדיטים = 32
  קרדיטים ≈ $0.32"* (verified in the logic sandbox, character-for-character).
- `estimateForPack`, `estimateForPackLineHe` — total credit/USD cost for an
  entire pack (all its scenes at their pack's own default output count).
- `scenesForPack`, `resolveSceneIdForPack` — scene list scoped to a pack,
  with a safe fallback when a requested scene doesn't belong to the pack.
- `buildRenderBatchPlan(project, { packId, sceneId, qualityId,
  outputCount })` — the full Render Studio result: resolved pack/scene/
  quality, the Clean-8I-integrated final prompt + negative prompt (via the
  new `sceneOverride` parameter — see below), per-selection AND per-pack
  cost estimates, and the Clean 8J "future API readiness" data shape
  (`engine`, `prompt`, `negativePrompt`, `aspectRatio`, `outputCount`,
  `sceneId`, `packId`, `quality`, `estimatedCredits`, `estimatedUsd`,
  `workFileId`) — never called, data preparation only.
- **Persistence (public API only):** the batch plan is stored as ONE
  `kind: 'renderBatchPlan'` record inside the project's EXISTING reserved
  `renders` array — the identical Clean 8E/8I kind-discriminated,
  foreign-record-preserving upsert pattern (`buildRenderBatchPlanPatch`,
  `getSavedRenderBatchPlan`, `isRenderBatchPlanRecord`). The Clean 8I
  `renderPackage` record already living in that array is explicitly proven
  to survive this upsert (see QA below). Persisted ONLY through the
  EXISTING public `updateProject(id, patch)`. **This is not a new
  persistence key** — it is one more record kind inside the array that has
  held media-workflow state, media results, and the 8I render package since
  Clean 8E/8I.

### CHANGED — `lib/studio/renderPromptFinalizer.js` (additive only)
`buildRenderPackage(project, preset)` gains one **optional** third
parameter, `sceneOverride`. When `renderSceneLibrary.js` needs the opener/
closing sentence and recommended settings to reflect a specific scene
instead of a flat preset, it passes a plain object here instead of
duplicating any of this function's subject/stone/cluster/direction/asset/
warning logic. **Every existing call site is unchanged** —
`buildRenderPackage(project, preset)` with no third argument produces
byte-identical output to before, because `sceneOverride` defaults to `null`
and every affected field falls back to the exact pre-8J preset-profile
value. This is the "use the existing render prompt finalizer from 8I"
integration the milestone asked for — not a rebuild of it. Verified: the
full, unmodified 44-assertion Clean 8I logic sandbox was re-run against this
file with zero changes to the test and zero failures.

### NEW — `components/studio/projects/RenderStudioPanel.js`
The «סטודיו הדמיות» overlay. Auto-builds a complete batch plan the moment it
opens (Catalog Pack + Catalog White 3/4 + High quality + 4 images + 1:1 —
the exact spec defaults), so the user sees a useful recommendation with zero
required configuration. Every chip/stepper change instantly rebuilds the
plan via the same reactive pattern `RenderPromptPanel` already established
in Clean 8I.

- **פרטי החבילה** — pack chips, scene chips (scoped live to the chosen
  pack), quality chips, an output-count stepper, and read-only aspect-ratio
  + suggested-engine display (kept read-only/secondary, per "do not make
  this technical").
- **תוכנית ההדמיה** — selected pack + its purpose, the full list of scenes
  included in that pack, and the total planned image count across the pack.
- **פרומפט סופי להדמיה** / **Negative Prompt** — the Clean-8I-integrated
  English prompt/negative-prompt for the currently selected scene, each with
  its own copy button.
- **עלות משוערת** — two lines: cost for the currently selected scene/count
  (exact spec format) and total cost for the whole pack (all scenes at
  their own default counts) — see "Known limitations" for why these are
  shown as two distinct numbers.
- **מה חסר לשיפור התוצאה** — reuses the Clean 8I warnings verbatim (never
  blocking).
- Actions: «הכן הדמיה» · «העתק פרומפט» · «העתק Negative Prompt» · «שמור
  תוכנית הדמיה» (persists via `buildRenderBatchPlanPatch` + the existing
  public `updateProject`) · «פתח מדיה והדמיות» (closes back to the Media
  Workflow beneath).
- Rendered as a React Fragment SIBLING of the Media Workflow panel's own
  backdrop (not a DOM descendant) — the same fix already applied to
  `RenderPromptPanel` in Clean 8I, so a click on its own backdrop closes
  only itself.

### CHANGED — `components/studio/projects/MediaWorkflowPanel.js`
One additive secondary entry card: «סטודיו הדמיות», placed directly below
the EXISTING Clean 8I «הכן הדמיה» primary card (which is completely
unchanged in behavior — same button, same label, same `RenderPromptPanel`
it always opened). The two overlays (`RenderPromptPanel` and the new
`RenderStudioPanel`) are mutually exclusive — opening one closes the other,
matching the existing precedent in `pages/studio/projects.js` for the
Output Pack / Media Workflow pair. Every existing section (status, tool,
prompts-from-Output-Pack, manual result form, saved results) is untouched.

### NEW — `CHANGELOG-CLEAN-8J.md`
This file.

---

## Product flow (unchanged shape, new capability)

```
Work File → Media Workflow
  ├── «הכן הדמיה» (Clean 8I, unchanged) → RenderPromptPanel (presets)
  └── «סטודיו הדמיות» (Clean 8J, new)   → RenderStudioPanel
        → pick pack → scene auto-scoped to pack → pick quality
        → final prompt + negative prompt (Clean-8I-integrated)
        → per-scene cost + per-pack cost
        → «שמור תוכנית הדמיה» (persists into the existing `renders` array)
```

Both panels are independent, additive, and share the same underlying Clean
8I prompt-building logic — no duplication, no drift.

---

## QA summary

**Bundle regression (esbuild, all 10 studio pages):** all bundle cleanly.

**renderSceneLibrary.js logic sandbox (82 assertions, all PASS):**
- Exactly 8 scenes, 4 packs, 3 quality levels defined.
- Every pack's scene-id list and default-outputs-per-scene matches the spec
  exactly (catalog/client × 4, social/handModel × 3).
- Every scene's aspect ratio, and every scene's opener/closing English text,
  is ASCII-only.
- Defaults match the spec exactly: Catalog Pack, SC-02 (Catalog White 3/4),
  High quality, 4 images, 1:1 aspect ratio.
- `resolveSceneIdForPack` scopes correctly (valid scene kept; invalid scene
  for a pack falls back to that pack's first scene).
- Quality profiles match the spec exactly (engine name + credit cost for
  draft/standard/high).
- **The exact spec cost-line example reproduces character-for-character:**
  `estimateCostLineHe({ quality: 'high', outputCount: 4 })` →
  `"עלות משוערת: 4 תמונות × 8 קרדיטים = 32 קרדיטים ≈ $0.32"`.
- Pack-level cost estimate verified (catalog: 3 scenes × 4 images = 12
  images × 8 credits = 96 credits ≈ $0.96).
- `buildRenderBatchPlan` on an empty project: defaults applied, ASCII-only
  prompt/negative prompt, prompt reflects the SC-02 scene's own language,
  missing-context warnings present, `futureApiRequest` shape populated.
- `buildRenderBatchPlan` on a full project with an explicit scene (SC-08,
  social pack, draft quality, 3 images): cluster language present (scene +
  multi-stone project data), metal appears in English, **no Hebrew leaked
  into the English prompt**, engine matches the chosen quality level.
- Invalid pack/scene/quality/output-count inputs all fall back safely with
  no crash.
- **Persistence upsert:** three foreign `renders` records — a
  `mediaWorkflowState`, a `mediaResult`, AND a Clean 8I `renderPackage` —
  all survive a `buildRenderBatchPlanPatch` upsert untouched; a second
  upsert with different pack/scene/quality still totals exactly 4 records
  (no duplicate batch-plan record); `getSavedRenderBatchPlan` reflects the
  latest upserted selection. Defensive null-input case returns `null` with
  no crash.

**renderPromptFinalizer.js — zero-regression proof (44 assertions,
unmodified from Clean 8I, all PASS):** the exact same Clean 8I logic
sandbox — empty project, full cluster project, 3DM asset, negative-prompt
content, preset validation, persistence upsert with foreign-record
preservation — was re-run against the Clean 8J version of this file with
**zero changes to the test itself**. All 44 assertions still pass,
confirming the new optional `sceneOverride` parameter is fully
backward-compatible.

**outputPack.js regression (16 assertions, all PASS):** re-run unmodified
(this file was not touched in Clean 8J) to confirm the shared prompt-context
export Clean 8I added is still intact.

**SSR smoke tests:**
- `RenderStudioPanel` renders to static markup with a real project
  (includes the «סטודיו הדמיות» title, the default pack label, and a scene
  label) and renders nothing (no crash) with `project: null`.
- `MediaWorkflowPanel` renders to static markup and includes BOTH the
  unchanged Clean 8I «הכן הדמיה» label and the new Clean 8J «סטודיו הדמיות»
  label.
- Full pages — `/studio/projects`, `/studio/create`, `/studio/design` — all
  SSR-render non-empty markup. (The two pre-existing React DOM attribute
  warnings reproduce identically to prior milestones — confirmed unrelated.)

**Structural verification:**
- `comm -23` export-removal proof on both changed files: **zero exports
  removed** from either; the `buildRenderPackage` signature change is a
  parameter addition, not a new/removed export name.
- Default export signatures on `MediaWorkflowPanel.js` are byte-identical.
- `cmp` byte-identity on every protected store/UI file (`designProjects.js`,
  `workTray.js`, `designBriefStore.js`, `designDraft.js`,
  `activeWorkStore.js`, `assetsStore.js`, `assetsDb.js`, `package.json`,
  `AssetPicker.js`, `DesignConceptPanel.js`, `DesignOutputPanel.js`) **plus**
  `mediaWorkflow.js` and `outputPack.js` (both reused read-only, neither
  needed for scene integration): **all byte-identical — untouched.**
- `cmp` byte-identity on `pages/studio/projects.js`,
  `pages/studio/workstation.js`, `OutputPackPanel.js`, `WorkFilesPanel.js`,
  `RenderPromptPanel.js`, `CreateFlowShell.js`: **all byte-identical —
  untouched.**
- Forbidden-token scan (diff-only added/new lines, 1207 lines scanned): no
  `three/next-dynamic` import, no basket/checkout/עגלה language, no Airtable
  reference, no pricing/certificate logic, no external API call (no
  `fetch`/`axios`/Stability-API/`http://`/`https://` of any kind — this
  milestone contains zero network-capable code), no `NEXT_PUBLIC` secret
  exposure, no new `localStorage` key or persistence key. **Clean.**
- `package.json` diff: **unchanged** — confirmed no new dependency.

**Manual QA checklist (per the 16-point request):**
1. `/studio/projects` opens — SSR-verified. ✓
2. Existing Work Files still appear — `WorkFilesPanel.js` untouched. ✓
3. Media Workflow still opens — all existing sections preserved, SSR-verified.
   ✓
4. Render Studio panel appears — new «סטודיו הדמיות» secondary card in
   Media Workflow, SSR-verified for both the card and the panel it opens. ✓
5. «הכן הדמיה» creates a render plan — verified in the logic sandbox
   (`buildRenderBatchPlan` returns a complete plan on every call, including
   with zero configuration). ✓
6. User can choose render pack — pack chips, verified via `packId` state
   changing the resolved plan. ✓
7. User can choose scene — scene chips scoped live to the chosen pack via
   `scenesForPack`/`resolveSceneIdForPack`, verified in the logic sandbox.
   ✓
8. User can choose quality — quality chips, verified (`qualityId` changes
   the resolved engine + cost). ✓
9. Estimated credits and USD cost appear — both a per-selection line and a
   per-pack line, verified in the logic sandbox including the exact spec
   example string. ✓
10. Prompt updates according to selected scene — verified (SC-02 → "three-
    quarter" language; SC-08 → cluster language). ✓
11. Catalog Pack includes multiple scenes — verified (SC-01/02/03, 3
    scenes). ✓
12. Cost estimate for pack appears — `packCostLineHe`, verified (96 credits
    / $0.96 for the catalog pack at high quality). ✓
13. Copy prompt works — native clipboard call wired (same pattern as
    Output Pack / Media Workflow / Render Prompt Panel copy buttons). ✓
14. Copy negative prompt works — same mechanism, separate `copiedKey`. ✓
15. No protected stores edited — `cmp` byte-identity confirmed above. ✓
16. No package/API/render engine/persistence key added — confirmed above.
    ✓

---

## Confirmation

- **No protected stores were edited.** Verified byte-identical via `cmp`
  against the accepted Clean 8I baseline for all 11 protected files, plus
  `mediaWorkflow.js` and `outputPack.js` (read-only reuse only).
- **No packages were added.** `package.json` is byte-identical to the
  baseline.
- **No new persistence key was created.** The render batch plan lives
  inside the project's pre-existing reserved `renders` array (the same
  array `mediaWorkflow.js` has used since Clean 8E and the Clean 8I render
  package already used), written only through the pre-existing public
  `updateProject`.
- **No external API was connected, and no image was generated.**
  `renderSceneLibrary.js` performs string/data preparation and arithmetic
  only — the forbidden-token scan confirms zero occurrences of `fetch`,
  `axios`, any Stability/Gemini/Sora reference, or any `http://`/`https://`
  URL anywhere in the new or changed code.
- **`/studio/workstation` was not touched** — confirmed byte-identical.
- **Clean 8I was not rebuilt** — `RenderPromptPanel.js` and
  `CreateFlowShell.js` are both byte-identical to the accepted baseline;
  `renderPromptFinalizer.js`'s only change is the additive, proven-
  backward-compatible `sceneOverride` parameter.

## Known limitations

- The «כמות תמונות» stepper in `RenderStudioPanel` only affects the
  currently-previewed scene's own prompt package and its "cost for selected
  scene" line; the separate "cost for whole pack" line always uses each
  scene's pack-level default output count, uniformly, regardless of the
  stepper. This keeps the two numbers independently meaningful (one
  scene's actual planned count vs. the pack's own defaults) rather than
  coupling them in a way the spec didn't fully specify; a future milestone
  could let each scene in a pack carry its own overridden count if that
  granularity is wanted.
- SC-07 (On Model) and SC-08 (Cluster Composition) each have a spec-noted
  alternate value (aspect ratio 9:16 for SC-07; angle top_macro for SC-08)
  that is not exposed as a separate selectable option — the canonical
  default (4:5 / three_quarter) is used, keeping the UI simple per "do not
  make this technical." The alternate value is preserved as data
  (`altAspectRatio` on SC-07) for a future milestone to expose if needed.
- The render batch plan is saved as the single most-recent pack/scene/
  quality/count selection per Work File (upsert, not a history) — matching
  the exact pattern the Clean 8I render package and Clean 8E media state
  already use. A history of saved plans would need a new array-of-records
  design and is out of scope here.
- `RenderStudioPanel` rebuilds (and, if the user later clicks «שמור תוכנית
  הדמיה» again, re-persists) the plan reactively on every selector change —
  the same trade-off Clean 8I's `RenderPromptPanel` already accepts for its
  own preset chips.
- As specified, the underlying Clean 8I `preset` passed to
  `buildRenderPackage` is always `'catalog'` for every Render Studio pack
  (it only affects the negative prompt's fantasy-style restriction, which
  should stay on for every real product-photography pack here) — the
  actual visual differentiation between packs/scenes comes entirely from
  the new `sceneOverride`, not from cycling through the 8I presets.
- No Stability/Gemini/Sora API is called anywhere; the `futureApiRequest`
  shape in `buildRenderBatchPlan`'s return value is prepared data only, per
  requirement 6, ready for a future milestone to wire up.

## Upload checklist

1. Upload at the repo root with 1:1 paths (no wrapper folder):
   - `lib/studio/renderSceneLibrary.js` (new)
   - `lib/studio/renderPromptFinalizer.js` (changed — additive only)
   - `components/studio/projects/RenderStudioPanel.js` (new)
   - `components/studio/projects/MediaWorkflowPanel.js` (changed)
   - `CHANGELOG-CLEAN-8J.md` (new)
2. Commit and push to GitHub.
3. Verify the Vercel deployment builds successfully.
4. Manually click through the 16-point QA checklist above on the live
   deployment (open a Work File → Media Workflow → «סטודיו הדמיות»).
5. Once confirmed on Vercel, export the repo as the next baseline ZIP for
   the following milestone.

---

## Post-delivery QA correction — one clear render path + real batch plan

A product-flow review found three issues that were not build failures but
would have weakened the next API milestone:

1. The Media Workflow exposed two overlapping render entry points
   (the Clean 8I quick prompt panel and the new Render Studio). They are now
   unified: the existing primary «הכן הדמיה» action opens the Render Studio
   directly with a useful default plan already prepared.
2. The output-count selector now means «כמות תמונות לכל סצנה» and applies to
   every scene in the selected pack. Pack totals and estimated cost update
   consistently with that choice.
3. The saved plan now contains a real multi-scene `batchItems` array and a
   `futureApiBatchRequest`, with one scene-specific prompt/request per scene.
   This prepares catalog automation instead of saving only the currently
   previewed scene.

The redundant no-op «הכן הדמיה» button inside the already-prepared panel was
removed. The panel now has one primary action: «שמור תוכנית הדמיה».

QA after correction:
- `next build` passes successfully.
- Catalog pack with 6 outputs per scene produces 3 scene items, 18 total
  planned images, and matching pack cost.
- Each scene receives its own scene-specific final prompt.
- Existing foreign records in `project.renders`, including the Clean 8I
  `renderPackage`, survive the batch-plan upsert.
- No protected store, package, API, route, or persistence key was changed.

