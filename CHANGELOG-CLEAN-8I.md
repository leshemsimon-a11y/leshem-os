# LESHEM.S OS — Clean 8I: Render Engine Prep + One-Click Prompt Finalizer

Builds on the Vercel-confirmed Clean 8H baseline. Adds the internal render
engine PREP layer for the Media Workflow: one primary action — «הכן הדמיה»
— automatically gathers everything the Work File already holds and prepares
a final, media-ready English prompt, a strong negative prompt, and
recommended settings. No external AI service is connected; this is data
preparation only, wired to the exact Clean 8E persistence pattern.

No protected store internals, `package.json`, external APIs, Airtable,
pricing, certificates, a real render engine, new packages, new persistence
keys, or `/studio/workstation` were touched.

---

## Changed files (2 new · 3 changed · 1 changelog)

### NEW — `lib/studio/renderPromptFinalizer.js`
Pure helper (constants + pure functions only; no store, no persistence key,
no network, no package). Builds the complete render package from a Work
File's existing data:

- `RENDER_PRESET` / `RENDER_PRESET_HE` — five presets, canonical English
  values + Hebrew labels («הדמיית קטלוג ריאליסטית» default, «סקיצת קונספט»,
  «פרזנטציה ללקוח», «מאקרו אבן / פרטים», «חופשי / יצירתי»).
- `buildRenderPackage(project, preset)` — returns `{ title, preset, presetHe,
  finalPromptEnglish, negativePromptEnglish, promptHebrewSummary,
  recommendedAspectRatio, recommendedOutputCount, recommendedQuality,
  suggestedTool, sourceContextSummary, warnings }`. Reads the SAME shared
  English prompt context `buildOutputPack` uses (via the new
  `buildPromptContextEn` export in `lib/studio/outputPack.js`), so the
  Output Pack and the Render Finalizer never drift apart.
- `buildNegativePromptEn(preset)` — a strong jewelry-render negative prompt
  (exaggerated stones, impossible prongs, distorted proportions, fake
  plastic look, blurry metal, extra stones, unreadable text, hands, warped
  symmetry, low-quality reflections, plus more) with the fantasy-style
  restriction lifted only for the «חופשי / יצירתי» preset.
- Every English prompt line passes an ASCII guard (`asciiLinesOnly`) before
  being joined — Hebrew can never leak into `finalPromptEnglish` /
  `negativePromptEnglish`, matching the existing 8D/8G discipline.
- Missing-context Hebrew warnings use the EXACT spec wording (metal / refs /
  stones) and never block the user — a package is always produced.
- **Persistence (public API only):** the finalized package is stored as ONE
  `kind: 'renderPackage'` record inside the project's EXISTING reserved
  `renders` array — the identical Clean 8E kind-discriminated,
  foreign-record-preserving upsert pattern (`buildRenderPackagePatch`,
  `getSavedRenderPackage`, `isRenderPackageRecord`). Persisted ONLY through
  the EXISTING public `updateProject(id, patch)`. No new store, no new
  persistence key, no schema change.

### CHANGED — `lib/studio/outputPack.js` (additive only)
One new export, `buildPromptContextEn(project)`, exposing the existing
internal English enum maps, stone phrases, and cluster detection as shared
prompt context. `buildOutputPack` and every existing export are otherwise
byte-for-byte the same logic (verified — see QA below). Read `import {
MEDIA_TOOL } from './mediaWorkflow'` was NOT added here; it lives in the new
finalizer file instead, keeping this file's import surface unchanged besides
the one new export.

### NEW — `components/studio/projects/RenderPromptPanel.js`
The «הדמיה מוכנה» overlay, opened from the Media Workflow panel's primary
action. Auto-builds the package on open (default preset pre-selected — zero
configuration required before seeing a result); changing a preset chip
instantly rebuilds it. Sections: «מה המערכת הבינה» · «פרומפט סופי להדמיה» ·
«Negative Prompt» · «הגדרות מומלצות» · «מה חסר לשיפור התוצאה». Actions:
«העתק פרומפט» · «העתק Negative Prompt» · «סמן כמוכן להדמיה» · «פתח מדיה
והדמיות» (closes back to the Media Workflow beneath). Rendered as a REACT
FRAGMENT SIBLING of the Media Workflow panel's own backdrop (not a DOM
descendant), so a click on its backdrop closes only itself.

### CHANGED — `components/studio/projects/MediaWorkflowPanel.js`
- «הכן הדמיה» added as the panel's PRIMARY action — a gold-accent card at
  the top of the body, above the existing status/tool/prompts sections
  (all of which are unchanged and remain available).
- One click opens `RenderPromptPanel`; the panel persists the finalized
  package via the existing public `updateProject` (a local
  `persistRenderPackage` helper using the new `buildRenderPackagePatch`) and
  supports «סמן כמוכן להדמיה» by reusing the EXISTING `onUpdateState`
  callback with `mediaStatus: 'promptReady'` — the exact call `markSent`
  already makes for `sentToTool`.
- Every existing section (status, tool, prompts-from-Output-Pack, manual
  result form, saved results) is untouched in behavior.

### CHANGED — `components/studio/create/CreateFlowShell.js` (copy + order only)
Step-8 success-state next-action clarity (requirement 9): «הכן הדמיה» is now
the PRIMARY button, routing to the EXISTING `/studio/projects?focus=media`
deep link (already supported since Clean 8F) — which auto-opens the Media
Workflow, where «הכן הדמיה» is itself the panel's primary action. «פתח תיק
עבודה» and «פתח בסטודיו» remain as secondary actions; «צור עוד תכשיט» stays
the ghost action. No other step or logic in this 1061-line file was touched.

### NEW — `CHANGELOG-CLEAN-8I.md`
This file.

---


### QA correction — Work File free-text and non-image asset context
Post-delivery QA found that the panel correctly reported the existence of a
free-text request/reference, but the English final prompt did not yet carry an
actionable instruction to honor that stored context. The finalizer now adds
English-only guidance for the recorded client request and textual reference,
mentions client/PDF attachments, prefers the specific sketch instruction over
a duplicate generic image instruction, and no longer shows “לא צורפו
רפרנסים” when a textual reference is present. No schema, API, package, route,
or protected-store change was required.

## Product flow (unchanged shape, new capability)

```
Create Flow / Work File
  → selected direction
  → Output Pack (unchanged)
  → Media Workflow
      → «הכן הדמיה» (NEW primary action)
      → RenderPromptPanel: final render prompt + negative prompt +
        recommended settings + Hebrew understanding summary +
        Hebrew missing-context feedback
      → copy / «סמן כמוכן להדמיה»
```

The Output Pack and the Render Finalizer work together, as specified: the
Output Pack remains the professional text package; the Render Finalizer adds
the final, media-ready prompt + settings layer on top, sharing the same
English prompt-context source.

---

## QA summary

**Bundle regression (esbuild, all 10 studio pages):** all bundle cleanly.
`pages/studio/design.js` shows one PRE-EXISTING `duplicate-object-key`
warning in `StudioStoneStrip.js` (confirmed present in the untouched 8H
baseline too — not introduced by this milestone).

**Logic sandbox (`renderPromptFinalizer.js` — 41 assertions, all PASS):**
- Empty project → default preset auto-selected, ASCII-only prompts, warnings
  present, catalog settings correct (1:1 / 4 / high / stability).
- Full project (2 stones, metal, style, direction, image + model assets) →
  cluster language present, metal appears in English, attached-reference and
  attached-model phrases present, **no Hebrew leaked into the English
  prompt**, fewer warnings than the empty case, Hebrew source summary
  includes the product label.
- 3DM asset → exact spec sentence present; presentation preset aspect ratio
  is 4:5.
- Negative prompt → every required term present (exaggerated / prongs /
  distorted / plastic / blurry / extra stones / text / hands / fantasy /
  reflections); creative preset lifts the fantasy-style restriction; both
  ASCII-only.
- Preset validation (valid/invalid/fallback) correct.
- **Persistence upsert:** two foreign `renders` records (a `mediaWorkflowState`
  and a `mediaResult`) survive a `buildRenderPackagePatch` upsert; a SECOND
  upsert with a different preset still totals exactly 3 records (no
  duplicate package record); `getSavedRenderPackage` reflects the latest
  preset. Defensive null-input case returns `null` with no crash.

**outputPack.js regression + shared-context test (16 assertions, all PASS):**
every existing `buildOutputPack` field (professionalHe, mediaPromptEn,
clientHe, sketchPromptEn, presentationPromptEn, productionNotesHe,
attachedAssets, isCluster, references.text) still present and correct; the
new `buildPromptContextEn` export returns matching product/style/metal/stone
context for the same project.

**SSR smoke tests (`node -r ./preload.cjs`):**
- `RenderPromptPanel` renders to static markup with a real project (includes
  the «הדמיה מוכנה» title) and renders nothing (no crash) with `project:
  null`.
- `MediaWorkflowPanel` renders to static markup and includes the new «הכן
  הדמיה» primary-action label.
- Full pages — `/studio/create`, `/studio/projects`, `/studio/design` — all
  SSR-render non-empty markup under the `next/router` / `next/head`
  preload stubs. (Two React DOM warnings about `jsx`/`global` attributes are
  PRE-EXISTING — reproduced identically against the untouched 8H baseline.)

**Structural verification:**
- `comm -23` export-removal proof on all 3 changed files: **zero exports
  removed** on any of them; `outputPack.js` gains exactly one new export
  (`buildPromptContextEn`); default exports on the two component files are
  byte-identical in signature.
- `cmp` byte-identity on every protected store/UI file (`designProjects.js`,
  `workTray.js`, `designBriefStore.js`, `designDraft.js`,
  `activeWorkStore.js`, `assetsStore.js`, `assetsDb.js`, `package.json`,
  `AssetPicker.js`, `DesignConceptPanel.js`, `DesignOutputPanel.js`): **all
  byte-identical — untouched.**
- `cmp` byte-identity on `pages/studio/projects.js`, `OutputPackPanel.js`,
  `WorkFilesPanel.js`, `pages/studio/workstation.js`: **all byte-identical —
  untouched** (none were in this milestone's allowed-file list).
- Forbidden-token scan (diff-only added/new lines, 1023 lines scanned): no
  `three/next-dynamic` import, no basket/checkout/עגלה language, no Airtable
  reference, no pricing/certificate logic, no external API call
  (fetch/axios/stability-api/generativelanguage/openai/sora), no
  `NEXT_PUBLIC` secret exposure. **Clean.**
- `package.json` diff: **unchanged** — confirmed no new dependency.

**Manual QA checklist (per the 18-point request):**
1. `/studio/create` still opens — SSR-verified. ✓
2. `/studio/projects` still opens — SSR-verified. ✓
3. `/studio/design` still opens — SSR-verified. ✓
4. Existing Work Files still appear — `WorkFilesPanel.js` untouched. ✓
5. Output Pack still opens — `OutputPackPanel.js` untouched. ✓
6. Media Workflow still opens — all existing sections preserved. ✓
7. «הכן הדמיה» appears clearly — primary gold-accent card at the top of the
   Media Workflow panel body, plus the Create Flow's primary success action.
   ✓
8. Clicking «הכן הדמיה» creates a final render package — logic-tested. ✓
9. Final prompt uses Work File context — product/style/metal/stones/
   direction all verified in the logic sandbox. ✓
10. Cluster logic appears when relevant — verified (2-stone project). ✓
11. Attached assets are mentioned when available — image + model + 3DM all
    verified. ✓
12. Negative prompt appears — verified, all required terms present. ✓
13. Recommended settings appear — aspect ratio / count / quality / tool, all
    verified per preset. ✓
14. Missing-context feedback appears when data is missing — verified (empty
    project → all three example warnings present with exact spec wording).
    ✓
15. Copy prompt works — native clipboard call wired (same pattern as
    Output Pack / Media Workflow copy buttons). ✓
16. Copy negative prompt works — same mechanism, separate `copiedKey`. ✓
17. No protected stores edited — `cmp` byte-identity confirmed above. ✓
18. No package/API/render engine/persistence key added — confirmed above.
    ✓

---

## Confirmation

- **No protected stores were edited.** Verified byte-identical via `cmp`
  against the Clean 8H baseline for all 11 protected files.
- **No packages were added.** `package.json` is byte-identical to the
  baseline.
- **No new persistence key was created.** The render package lives inside
  the project's pre-existing reserved `renders` array (the same array
  `mediaWorkflow.js` has used since Clean 8E), written only through the
  pre-existing public `updateProject`.
- **No external API was connected.** `renderPromptFinalizer.js` performs
  string/data preparation only — no `fetch`, no SDK, no network call of any
  kind.

## Known limitations

- The render package is saved as the single most-recent preset choice per
  Work File (upsert, not a history) — matching the Clean 8E media-state
  pattern (one current state record). Saving a history of prior packages
  would need a new array-of-records design and is out of scope for this
  milestone.
- `RenderPromptPanel` rebuilds and re-persists the package each time the
  preset chip changes, so switching presets several times writes several
  times; this is the same trade-off Clean 8E's `buildStatePatch` already
  accepts for chip-driven state.
- As specified, `suggestedTool` always resolves to Stability — no tool
  picker is exposed in this panel (the existing Media Workflow panel's own
  «כלי יעד» chips remain the place to record the human's actual chosen
  tool).
- 3DM preview still requires the (out-of-scope, unapproved) `rhino3dm` wasm
  package — unchanged from Clean 8H; the finalizer only emits the required
  mention sentence.
- The `STYLE_PREFERENCE` enum still lacks a dedicated "cluster" value
  (known open item since Clean 6D); cluster detection here reuses the same
  broadened heuristic (`stoneCount > 1` OR existing cluster-identity text)
  that `lib/studio/outputPack.js` has used since Clean 8D.

## Upload checklist

1. Upload at the repo root with 1:1 paths (no wrapper folder):
   - `lib/studio/renderPromptFinalizer.js` (new)
   - `lib/studio/outputPack.js` (changed)
   - `components/studio/projects/RenderPromptPanel.js` (new)
   - `components/studio/projects/MediaWorkflowPanel.js` (changed)
   - `components/studio/create/CreateFlowShell.js` (changed)
   - `CHANGELOG-CLEAN-8I.md` (new)
2. Commit and push to GitHub.
3. Verify the Vercel deployment builds successfully.
4. Manually click through the 18-point QA checklist above on the live
   deployment (open a Work File → Media Workflow → «הכן הדמיה»).
5. Once confirmed on Vercel, export the repo as the next baseline ZIP for
   the following milestone.
