# LESHEM.S OS — Terminology & Microcopy QA Pass (Clean 5G)
Patch-only ZIP. 7 files (6 edited + 1 new). Display-label fixes only — no
enum changes, no Airtable/API/backend changes, no calculator/certificate
logic, no business logic beyond safe display-mapping/matcher aliases.

## Exact files changed

### 1. `lib/studio/demoInventoryLayer.js`
- Fixed shape display terms in the demo dataset: Pear ("אגס"→"טיפה"),
  Cushion ("כרית"→"קושן") — in both `shapeHe` fields and the compound
  `titleHe` strings that had them baked in (e.g. "יהלום אגס"→"יהלום טיפה",
  "רובי כרית"→"רובי קושן").
- Fixed spelling: "Paraiba Tourmaline" was "טורמלין פראיבה" everywhere;
  now "טורמלין פאראיבה" per your required term (`stoneTypeHe` + `titleHe`).
- Fixed 3 mixed Hebrew/English activity-feed strings (e.g. "...ל־Work Tray",
  "...למצב Inspect", "...כ־Supplier Available" → fully Hebrew, matching your
  terminology table).
- `getSourceLabelHe('supplier')`: "ספק / וירטואלי" → short **"ספק"**, per your
  refinement.
- `getSourceLabelHe('client-owned')`: "אבן לקוח" → **"של לקוח"** (the old
  wording hardcoded "stone," which is wrong once an inventory item is a
  Jewelry Part or Finished Jewelry, not just a stone).
- **New, additive** `getSourceContextBadge(sourceType)`: returns "וירטואלי"
  for supplier items, `null` otherwise — a *separate* optional badge, so the
  main source label can stay short instead of every source badge carrying
  the virtual/supplier qualifier (per your refinement #2).
- Zero call-site changes to any existing exported function — verified by
  diffing call counts against the pre-pass version.

### 2. `lib/studio/demoGemstoneAssets.js`
- Same shapeHe/titleHe fixes as above, in this dataset's parallel copy of
  the demo items (this file maintains its own item list for its media
  matcher).
- Updated its internal `GEMSTONE_KEYWORD_MAP` regexes so the thumbnail
  matcher recognizes the new Hebrew terms — **old terms kept as aliases**,
  e.g. `/כרית|cushion/` → `/כרית|קושן|cushion/`, `/אגס|pear/` →
  `/אגס|טיפה|pear/`, and the Paraiba regex now matches both spellings.
- Fixed the one mixed-term activity-feed string ("רובי כרית..." → "רובי
  קושן...").

### 3. `lib/studio/assetPack.js`
- Updated `STONE_KEYWORD_MAP` (the Design Studio stone-strip thumbnail
  fallback) the same way — new terms added, old terms kept as aliases, so
  the fallback still resolves correctly for pear/cushion stones.

### 4. `lib/studio/designOutputs.js`
- Narrow, additive-only touch to the design-output English-translation
  table (`SHAPE_EN`): added `'טיפה': 'pear'` and `'קושן': 'cushion'` —
  **existing `'אגס'`/`'כרית'` entries kept**, so the generated English
  design-output text still translates correctly regardless of which term a
  given data source uses.

### 5. `components/studio/design/shell/stoneView.js` (shared Design Studio stone view-model)
- Treatment now goes through the new `getTreatmentLabel()` before display,
  instead of showing the raw English demo string (e.g. "Minor oil / demo
  assumption") directly in the Hebrew UI.
- Added defensive fallbacks: if `shapeHe`/`stoneTypeHe` is ever missing (real,
  non-demo items), it now falls back to `getShapeLabel(shape)` /
  `getStoneTypeLabel(stoneType)` instead of showing nothing — additive only,
  never triggers for current demo data since `shapeHe`/`stoneTypeHe` are
  always present there.
- Added the optional `getSourceContextBadge()` badge alongside the existing
  source/status badges for demo stones.

### 6. `components/studio/demo/DemoInventoryWorkspace.js`
- Fixed its own local `SOURCE_OPTIONS` dropdown labels to stay in sync with
  the corrected `getSourceLabelHe()` ("ספק / וירטואלי"→"ספק",
  "אבן לקוח"→"של לקוח") — this was a duplicated copy that would otherwise
  have drifted out of sync with the fix in `demoInventoryLayer.js`.
- Fixed `TYPE_FILTERS`' Paraiba filter label spelling ("פראיבה"→"פאראיבה").
- Wired the optional "וירטואלי" badge into both the card pills row and the
  inspector's pills row for supplier-sourced items.
- The editable treatment `<input>` in the inspector is **untouched** — still
  bound directly to the raw stored value, so editing/saving demo data is not
  affected by the new display-only treatment label.

### 7. `lib/studio/gemLabels.js` — new file
Centralized, additive-only display-label module:
- `getShapeLabel(shape)`, `getStoneTypeLabel(stoneType)` — new lookup
  functions covering your full required terminology table (13 shapes, 10
  stone types).
- `getTreatmentLabel(treatment)` — new best-effort classifier for the
  free-text treatment strings in the demo data (ordering handles the
  "unheated"/"untreated" substring traps correctly — verified by direct
  testing against all 4 real demo treatment strings plus edge cases).
- `getStatusLabel` / `getSourceTypeLabel` / `getSourceContextBadge` —
  **re-exported** from `demoInventoryLayer.js`, not reimplemented, so there's
  one discoverable name for all 5 label types without duplicating logic that
  already existed and is used by 4+ other files.

## Terminology fixes made
| Term | Before | After |
|---|---|---|
| Pear (shape) | אגס | **טיפה** |
| Cushion (shape) | כרית | **קושן** |
| Paraiba Tourmaline (spelling) | טורמלין פראיבה | **טורמלין פאראיבה** |
| Client-owned (source) | אבן לקוח | **של לקוח** |
| Supplier (source, short label) | ספק / וירטואלי | **ספק** (+ optional separate "וירטואלי" badge) |
| Treatment (display, Design Studio) | raw English (e.g. "Minor oil / demo assumption") | **מטופל / ללא טיפול / לא מחומם / מחומם / לא ידוע** via `getTreatmentLabel()` |
| 3 activity-feed strings | mixed Hebrew/English | fully Hebrew |

## Old terms kept ONLY as backward-compatible aliases (never visible in UI)
- `"אגס"` — in `demoGemstoneAssets.js`'s and `assetPack.js`'s keyword-matcher
  regexes, and as a key in `designOutputs.js`'s `SHAPE_EN` translation table.
- `"כרית"` — same three locations.
- `"פראיבה"` (old spelling) — only in `demoGemstoneAssets.js`'s Paraiba
  matcher regex (now matches both spellings).
- None of these appear in any `shapeHe`, `titleHe`, activity-feed text, or
  any other value a user can actually see — verified by grep across all 7
  changed files, isolating matches to regex/dictionary lines only.

## Terms checked and found already correct (no change made)
Round Brilliant, Oval, Emerald Cut shapes; Diamond, Emerald, Ruby, Sapphire
stone types; all 4 status labels (available/selected/in-design/reserved) —
all already matched your required table exactly.

## Terms checked and intentionally left alone (with reason)
- Asset Library's `secondaryCategoryOptions.clientStone: 'אבן לקוח'`
  (`lib/studio/labels.js`) — a stone-specific taxonomy category label,
  sibling to `naturalDiamond`/`gemstone`/`stonePair` which are *also*
  explicitly stone-scoped there. Contextually correct as-is; a different,
  narrower use than the general source-type badge. Not touched.
- No instance of "אזמרגד" used as a shape label anywhere — only as a
  correct Emerald-stone-type matching synonym.
- No instance of "תעודת אישור" anywhere in the codebase.

## QA performed
- `node --check` passed on all pure-JS files: `gemLabels.js`,
  `demoInventoryLayer.js`, `demoGemstoneAssets.js`, `assetPack.js`,
  `designOutputs.js`.
- Brace/bracket/paren balance verified on the 2 JSX files (`stoneView.js`,
  `DemoInventoryWorkspace.js`) — all balanced.
- **Additive-only export proof**: diffed exported-symbol sets against the
  true original baseline for every file — zero exports lost;
  `demoInventoryLayer.js` gained exactly one new export
  (`getSourceContextBadge`); `gemLabels.js`'s exports confirmed to match
  the intended API (`getShapeLabel`, `getStoneTypeLabel`, `getTreatmentLabel`,
  `getStatusLabel`, `getSourceTypeLabel`, `getSourceContextBadge`).
- **Business-logic call-site diffing**: counted every call to
  `toStudioTrayItem`, `getDemoStudioTrayItems`,
  `getDemoInspectStoneFromTrayItem`, `getDemoInventorySnapshot`,
  `saveDemoInventorySnapshot`, `resetDemoInventorySnapshot`,
  `getDemoActivityFeed`, `findDemoGemstoneAsset`, `getGemstoneThumbFallback`,
  `enShape`, `enProductType`, `enMetal`, `enStyle`, `updateActive`,
  `toggleTray`, `persist`, `resetDemo` — **identical counts before and
  after every one.**
- Directly tested `getTreatmentLabel()` against all 4 real demo treatment
  strings plus edge cases (empty string, bare "Unheated"/"Untreated"/"Heated")
  — confirmed correct classification, including the "unheated"/"untreated"
  substring-containment trap (checked before the generic "heat"/"treated"
  rules so meaning is never inverted).
- Full-tree diff against your original upload: confirms exactly these 7
  files changed in this pass (on top of the files already changed across
  the prior three milestones), zero files deleted this pass or any prior
  one. Re-confirmed `pages/mvp.js`, `pages/v2.js`,
  `lib/studio/designDraft.js`, `designBriefStore.js`, `workTray.js`,
  `designProjects.js`, `DesignOutputPanel.js`, and `pages/api/*` are still
  byte-identical to your original upload.
- Forbidden-token scan: confirmed "אגס"/"כרית" appear ONLY on regex/dictionary
  lines across all 7 files, never as a display value.

## Answering your specific QA checklist
- No visible "אגס" for Pear — confirmed (regex/dictionary aliases only).
- No visible "כרית" for Cushion — confirmed (regex/dictionary aliases only).
- Pear displays as "טיפה" — confirmed in both demo datasets.
- Cushion displays as "קושן" — confirmed in both demo datasets (Diamond and Ruby cushion items).
- Emerald Cut displays as "אמרלד קאט" — unchanged, already correct.
- Paraiba Tourmaline displays as "טורמלין פאראיבה" — confirmed everywhere it's shown.
- Old bad terms remain only as matcher aliases — confirmed.
- Thumbnail fallback still works for pear/cushion — confirmed via the updated regexes (old + new terms both match).
- Design-output English translation still works for pear/cushion — confirmed via the additive `SHAPE_EN` entries.
- Treatment labels no longer leak raw English — confirmed, `getTreatmentLabel()` wired into the one place that showed it.
- Demo stones still appear / Inventory works / Work Tray works / Design Studio works — no store, handler, or data-flow logic touched anywhere; verified via call-site diffing.
- No removed exports, no broken imports — confirmed.

## Limitation
No real `next build` — same constraint as every prior milestone (no network
access to install `node_modules` in this sandbox). QA above is the offline
substitute; Vercel remains the final build gate.
