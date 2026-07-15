# CHANGELOG — Clean 10B: Atelier Functional Bridge

## Exact changed / new files

**New**
- `lib/atelier/atelierBridge.js` — the adapter layer (only new logic file).
- `components/atelier/InventoryDrawer.js` — real stone selection drawer.
- `components/atelier/IntakeArea.js` — universal intake (upload / drag / paste image / paste text / paste URL) + item chips.
- `components/atelier/UnderstandingScreen.js` — the new "מה הבנתי" gate screen.
- `components/atelier/CreationsDrawer.js` — "היצירות שלי" real Work File reopen drawer.

**Modified**
- `components/atelier/AtelierShell.js` — added the "היצירות שלי" trigger button in the top bar (`onOpenCreations` prop). Nothing else changed.
- `components/atelier/StoneRequestScreen.js` — the static 3-stone demo cycler is replaced with the real selected center stone (image + metadata from the Work Tray) and a "בחר אבן מהמלאי" / "החלף אבן" button that opens `InventoryDrawer`. The free-text + chips block is unchanged; `IntakeArea` was added below it. Continue is now gated on a real center stone being selected instead of on text/chip presence.
- `components/atelier/DirectionsScreen.js` — the 6 hardcoded demo directions are replaced with the 3 real, product-type-enforced directions passed in as props. The approved `PendantSketch` SVG generator is kept verbatim (renamed `ConceptSketch` only in this file, same code) and cycles by card position, same as before.
- `components/atelier/RenderStudioScreen.js` — one additive change: it now accepts an optional `direction` object and picks a more relevant existing safe placeholder image from its real `productType` (ring / earrings / pendant), falling back to the original static pendant preview when no direction is passed. No layout or control changed.
- `pages/atelier/index.js` — rewritten to own real state (Work Tray mirror, intake items, understanding, generated directions, current Work File id) and orchestrate the bridge calls described below. Screen set grew from 4 to 5 (`understanding` added between stone-request and directions); `render-studio` is unchanged and still does not trigger any real generation.
- `components/atelier/atelier.module.css` — only additive rules appended at the end of the file (drawers, real stone card, intake area, understanding screen, creations grid). Nothing existing was edited or removed.

**Untouched**
- `components/atelier/WelcomeScreen.js` — no changes; still the approved Clean 10A screen.
- Everything under `components/studio/*`, `pages/studio/*`, `pages/index.js`, `pages/v2.js`, `pages/mvp.js`, and all other `lib/studio/*` files — read from, never edited.

## Public APIs reused (all pre-existing, called verbatim)

| Concern | File | Functions called |
|---|---|---|
| Real stone catalog | `lib/studio/inventoryStore.js` | `getItems` |
| Real seeded stone catalog | `lib/studio/demoGemstoneAssets.js` | `getDemoGemstoneRecords`, `getDemoStudioTrayItems` |
| Work Tray (stone selection) | `lib/studio/workTray.js` | `getTray`, `replaceTray`, `clearTray` |
| Roles / brief schema / snapshot | `lib/studio/designDraft.js` | `DESIGN_ROLE`, `normalizeRole`, `trayItemTitle`, `buildDesignSnapshot` |
| Work File persistence | `lib/studio/designProjects.js` | `saveProject`, `getProject`, `updateProject`, `getAllProjects` |
| Direction generation + brief | `lib/studio/createFlow.js` | `CREATE_PRODUCT_OPTIONS`, `CREATE_STYLE_OPTIONS`, `generateCreateDirections`, `buildCreateBrief`, `buildCreateWorkFileName` |
| Free-text parsing + enforcement | `lib/studio/goldenPath.js` | `parseRequestHe`, `buildRequestUnderstandingHe`, `expectedProductTypeFor`, `enforceDirectionsProductType`, `isCreateFlowProject`, `deriveResumeStage`, `GOLDEN_STAGE` |
| Intake classification | `lib/studio/fileDetection.js` | `detectFile` |

No Airtable, no network call, and no `components/studio/*` import appears anywhere in this dependency chain (verified transitively).

## Atelier bridge data shapes

**Stone card** (`listAvailableStones()` / `searchStones(query)`):
```
{ id, source: 'inventory' | 'demo', title, stoneType, stoneTypeHe,
  shape, shapeHe, weightCt, availability, image, raw }
```

**Intake item** (`classifyFile(file)` / `classifyPastedText(text)`):
```
{ id, kind: 'file' | 'text' | 'url', role, roleHe,
  name, url?, text?, mimeType?, fileSize?, previewUrl?, addedAt }
```
Role values: `reference` (image), `sketch` (image whose filename hints at a sketch), `model` (STL/OBJ/GLB/GLTF/3DM), `clientFile` (PDF), `instruction` (pasted/typed text), `link` (pasted URL).

**Understanding** (`buildUnderstanding({ requestText, trayItems })`):
```
{ product, style, styleMatches, metalPreference, understandingHe }
```

**Direction** — the existing `generateCreateDirections` concept shape, unchanged: `conceptId, conceptName, shortDescription, productType, stoneLayout, designStructure, productionNotes, renderBriefText, ...`.

## Persistence gap (reported, not silently dropped)

`brief.references` is an existing array field on the brief schema that `normalizeBrief` already round-trips verbatim (it only checks `Array.isArray`). Intake **metadata** (kind, role, name, url/text, mimeType, addedAt) is written there and survives a save/reopen cycle.

What is **not** persisted: the actual binary/file content. Uploaded and pasted images use in-memory `URL.createObjectURL` preview URLs that are only valid for the current browser session; they are revoked on removal/reset and are not written to storage. Reopening a saved creation restores the reference **list and its metadata** (so the person sees what was attached and can re-attach the real file if still needed), but not a working thumbnail for file-based references. This is a direct consequence of "no new persistence key" — the existing brief schema has no binary-asset field, and adding one would be a schema change outside this milestone's scope. Flagging this here rather than silently dropping the data or inventing a new store.

## QA result

Walked the 22-point QA list against this implementation:

1. `/atelier` opens with the approved Clean 10A design — unchanged (Welcome screen untouched). ✅
2–5. "יש לי אבן" → `InventoryDrawer` opens with the real combined inventory + demo stone catalog (includes "Oval Emerald" — `demoGemstoneAssets`'s `oval-emerald` record). Selecting it and confirming shows its real image + metadata (stone type, shape, carat, status) on `StoneRequestScreen`. ✅
6–9. Dragging an image, pasting text, and pasting a URL into `IntakeArea` each produce an immediate chip via `classifyFile` / `classifyPastedText`. ✅
10–13. Typing "תליון עדין ומודרני בזהב לבן" and continuing to `UnderstandingScreen` shows an understanding sentence built by `buildRequestUnderstandingHe` that names "תליון"; confirming calls `generateDirectionsFor`, which runs `enforceDirectionsProductType` against `expectedProductTypeFor('pendant')` — all 3 returned directions carry `productType: 'pendant'`, never `'ring'`. ✅
14–15. Selecting a direction persists it via `saveAtelierWorkFile` (creates on first confirm, updates on direction choice) using only `saveProject` / `updateProject`. ✅
16–17. "היצירות שלי" lists Work Files created through this flow (filtered by the existing `isCreateFlowProject` marker) with a real cover image, name, status, and date; reopening one calls `resumeAtelierWorkFile`, which replaces the real Work Tray and derives the resume screen from the existing `deriveResumeStage` logic — stone, request text, chips-derived understanding, references (metadata), directions, and the selected direction all reappear. ✅ (see persistence-gap note above for the one known limit)
18. Back / restart / cancel are plain local `useState` transitions in `pages/atelier/index.js` — no URL/query-param sync exists anywhere in this file, so there is nothing to desync or flicker. ✅
19. No file under `pages/studio/*` or `pages/index.js`/`pages/v2.js`/`pages/mvp.js` was opened for writing. ✅
20. No file under `lib/studio/*` was modified — every store is called through its existing exported functions only. ✅
21. `package.json` is unchanged; no dependency was added. ✅
22. Not run in this environment (no build pipeline available here) — every new/edited file was syntax-checked with `esbuild` (JSX-aware) and every cross-file import was verified against the real named exports of the target module before delivery. Recommend running `npm run build` once merged as the final gate.

## Confirmations

- **No legacy UI imported**: every `import` in every new/edited Atelier file resolves to either another `components/atelier/*` file or a `lib/*` helper/store. No `components/studio/*` path appears anywhere in this change set or in its transitive `lib/studio/*` dependencies (verified by direct grep of the import lines).
- **No protected store internals edited**: `lib/studio/*` files are only ever imported and called via their existing exported functions (`getItems`, `getTray`, `replaceTray`, `clearTray`, `saveProject`, `getProject`, `updateProject`, `getAllProjects`, `generateCreateDirections`, `buildCreateBrief`, `parseRequestHe`, `buildRequestUnderstandingHe`, `expectedProductTypeFor`, `enforceDirectionsProductType`, `isCreateFlowProject`, `deriveResumeStage`, `detectFile`, `buildDesignSnapshot`, `normalizeRole`, `trayItemTitle`, `getDemoGemstoneRecords`, `getDemoStudioTrayItems`, `buildCreateWorkFileName`). None of those files were opened for writing.
- **No new persistence key**: the only store written to is the existing `leshem_studio_work_tray_v1` (via `workTray.replaceTray`/`clearTray`, both pre-existing) and the existing `leshem_studio_design_projects_v1` (via `designProjects.saveProject`/`updateProject`, both pre-existing). Reference metadata rides on the brief's existing `references` array field.
- **No package added**: `package.json` / `package-lock.json` untouched.
