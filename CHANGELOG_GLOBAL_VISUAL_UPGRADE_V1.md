# LESHEM.S OS — Global Visual Upgrade V1 (Clean 5E-Global)
Patch-only ZIP. 8 files changed, 0 added, 0 deleted. Visual/layout pass only — no
business logic, Airtable, pricing, or certificate code touched anywhere.

## 1. Exact files changed
1. `components/studio/shared/tokens.js` — retinted values only (see §3)
2. `components/studio/shell/StudioShell.js` — app shell content padding tightened
3. `components/studio/shell/NavRail.js` — compacted width/padding; not-yet-built
   sections (Calculator, Certificates, Quotes, Settings, Models, Render, Media)
   visually de-emphasized to a quieter secondary row (same click → same honest
   FutureSection placeholder as before)
4. `components/studio/shell/UnifiedDashboard.js` — tightened heading sizes,
   active-work band, and guided-action cards (spacing/typography only)
5. `components/studio/demo/DemoInventoryWorkspace.js` — full visual rewrite:
   now uses the shared tokens palette (previously fully self-contained hex),
   stone images changed from a cropped 1/0.78 "cover" rectangle to a square
   "contain" frame, tray actions gained small inline icons. All state, handlers,
   and `lib/studio/demoInventoryLayer.js` calls are byte-identical to before.
6. `components/studio/assets/AssetLibraryPanel.js` — fixed one real issue: the
   primary "create" button used `tokens.color.gold` as a full background fill
   (a large gold surface); changed to graphite, matching every other primary
   button in the app. Also tightened the oversized page title.
7. `components/studio/tray/WorkTray.js` — tightened the oversized page title
8. `components/studio/assets/AssetPicker.js` — light additive restyle only, as
   approved: modal backdrop tone updated to match the graphite direction. No
   props, handlers, selection logic, or asset logic touched.

## 2. Screens visually upgraded
- **Global Shell/Navigation** (all `/studio/*` pages that use the app shell)
- **Dashboard** (`/studio`)
- **Inventory** (`/studio/inventory`, `/studio/inventory-demo`)
- **Asset Library** (`/studio/assets`) — primarily inherited, one direct fix
- **Work Tray** (`/studio/tray`) — primarily inherited, one direct fix
- **Asset Picker modal** (used from Work Tray and Design Studio)
- Indirectly, via the shared tokens.js retint: every screen that reads
  `components/studio/shared/tokens.js`, including the 5 shared UI atoms
  (`FutureSection`, `FuturePlaceholder`, `StudioStates`, `RoleChips`,
  `ActiveWorkBadge` — needed **zero direct edits**, fully token-driven
  already) and the untouched Design Studio panels (`DesignConceptPanel.js`'s
  un-modified parts, `DesignOutputPanel.js`), so the "coming soon" screens and
  the Design Studio's own remaining chrome now read consistently too.

## 3. Shared tokens/components changed
`components/studio/shared/tokens.js` — **values only, zero keys renamed or
removed** (verified: 38 keys before, 38 after, identical set). Direction:
near-white/graphite (was warm ivory/gold), radius reduced (`md` 14px→8px,
`lg` 22px→12px), shadows flattened, `goldFaint` (used everywhere as a
large-surface fill for badges/selected-states) changed from a strong beige
wash to near-neutral, `font.display` switched from Merriweather serif to DM
Sans to match the Design Studio reset. This one file cascades to **59
consumers** — confirmed none of them are in `/mvp` or `/v2`.

No other shared component needed direct edits — I checked all 5 shared UI
atoms line-by-line and they're 100% token-driven already.

## 4. Files intentionally not touched
- `pages/mvp.js` and every file it exclusively uses (`CalculatorForm.jsx`,
  `CostSummary.jsx`, `Certificate.jsx`, `CertificateEditor.jsx`,
  `JewelryValuationCertificate.jsx`, `InventoryPreview.jsx`, `UI.jsx`,
  `StoneBlock.jsx`, `components/inventory/*`, `components/reports/*`,
  `lib/calculations.js`, `lib/constants.js`, `lib/printCss.js`,
  `lib/reports/*`) — confirmed byte-identical.
- `pages/v2.js` and `components/v2/*` — confirmed byte-identical.
- `pages/api/*` and `lib/airtable/*` — confirmed byte-identical.
- Dead/unreachable code, left alone per your instruction: all 8 files in
  `components/studio/inventory/*`, `components/studio/shell/DashboardHome.js`,
  `components/studio/assets/AssetCard.js` (confirmed 0 importers each).
- Ambiguous root-level loose files (`taxonomy.js`, `InventoryStudio.js`,
  `reportUtils.js`, `reportDefaults.js`, `assets.js`, `inventory.js`,
  `printCss.js`, `LocalInventorySections.js`) — not part of this brief's scope.
- Design Studio Layout Reset files from the prior milestone
  (`components/studio/design/shell/*`, `DesignConceptPanel.js`'s approved
  exception) — untouched directly this round; they benefit from the shared
  tokens.js retint only, with no behavior change, per your instruction.
- `RoleChips.js`'s pill-shaped chips — left as-is; chip/tag pills are a
  distinct, idiomatic pattern from "large pill-shaped containers," and the
  file is fully token-driven already.
- `TrayItemCard.js`'s small 84px `cover` thumbnail and `AssetThumbnail.js`'s
  small (44–84px) `cover` thumbnails across Asset Library — left as `cover`
  deliberately: these are exactly the "small thumbnails" the brief says cover
  is acceptable for, not the large/primary previews that need `contain`.

## 5. Risks / limitations
- **No real `next build`** — same as last time, no network access to install
  `node_modules` in this sandbox. QA below is the offline substitute; Vercel
  remains the final gate.
- The `tokens.js` retint changes the *look* of 59 files at once from one
  edit. I spot-checked the highest-frequency combinations (charcoal text,
  cardEdge borders, gold accents at small sizes, goldFaint fills) but a
  visual pass across every one of the 59 screens/components wasn't
  individually re-reviewed pixel-by-pixel — if something reads oddly after
  deploy, it's almost certainly a token-value tweak, not a structural bug.
- `DemoInventoryWorkspace.js` had the largest rewrite in this pass. I
  verified identical tag counts, identical business-logic call sites, and
  identical exports against the previous version, but it's worth a manual
  click-through after deploy given the size of the diff.
- Calculator, Certificates, Quotes, Settings, Models, and Render remain
  "coming soon" placeholders under `/studio`, per your decision — they only
  look better now, they don't do more.

## 6. QA performed
- `node --check` passed on `tokens.js` (the only pure-JS, non-JSX file changed).
- Brace `{}` / bracket `[]` balance verified on all 7 JSX files changed — all
  balanced. Additionally ran a full paren `()` balance and JSX tag-count
  comparison (main/section/aside/article/h1/h2/h3/button/input/select/label)
  on `DemoInventoryWorkspace.js` specifically, since it had the largest diff —
  identical counts before and after.
- **Additive-only proof**: exported-symbol sets diffed old vs. new for all 8
  files — zero exports lost or renamed anywhere.
- Business-logic call-site counts diffed for `DemoInventoryWorkspace.js`
  (`getDemoInventorySnapshot`, `saveDemoInventorySnapshot`,
  `resetDemoInventorySnapshot`, `getDemoActivityFeed`, `getSourceLabelHe`,
  `getStatusLabelHe`, `useState`, `useCallback`, `useEffect`, `useMemo`) —
  identical counts before and after, confirming no logic was added or removed.
- Import-resolution check: every relative import in every changed file
  resolves to a real file — all OK.
- Token key-set diff: 38 keys before, 38 after, identical set — confirms a
  values-only retint with nothing renamed or removed.
- Forbidden-token scans (commerce language, "Build Jewelry" as an active
  button, new Airtable calls, new npm packages, `\uXXXX` Hebrew escapes) —
  clear across all changed files.
- Full-tree diff against your original upload: exactly these 8 files changed,
  zero files deleted, and — explicitly re-verified — `/mvp`, `/v2`,
  `pages/api/*`, `lib/airtable/*`, all pricing/certificate/report files, and
  every dead-code file are byte-identical to your upload.

## How to disable/revert if needed
Every change in this patch is additive/value-only with the original file
still fully intact in your GitHub history — reverting any single file to its
previous version fully undoes that file's part of this pass with no
cross-file side effects, **except** `tokens.js`: since it cascades to 59
consumers, reverting it alone would revert the visual language everywhere at
once (including the "free" improvements to the 5 shared UI atoms and the
untouched Design Studio panels). If you want to keep some changes and revert
others, revert file-by-file starting with the screen-specific files (2–8)
before touching `tokens.js`.
