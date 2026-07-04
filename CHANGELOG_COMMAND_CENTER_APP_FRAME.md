# LESHEM.S OS — Command Center + Unified App Frame + Studio Flow Clarity (Clean 5H)
Patch-only ZIP. 7 files changed, 0 added, 0 deleted.

## Files changed

### 1. `pages/studio/inventory.js`
Now mounts the shared app-level `StudioShell` (`fullBleed` + `renderContent`)
around `DemoInventoryWorkspace`, exactly the mechanism `pages/studio/design.js`
already uses — instead of mounting `DemoInventoryWorkspace` standalone with no
navigation. Route unchanged.

### 2. `pages/studio/inventory-demo.js`
Same treatment as above.

### 3. `components/studio/demo/DemoInventoryWorkspace.js`
One structural change: the outer page wrapper used to own the full viewport
(`minHeight: 100vh`) because it rendered standalone. Now that it lives inside
the shell's fixed-height content slot, it fills and scrolls within that slot
instead (`height: 100%`, `overflowY: auto`). **This is the only functional
change in this file** — verified by diff: every state, handler, and
data-flow call (`persist`, `updateActive`, `toggleTray`, `resetDemo`, every
`lib/studio/demoInventoryLayer.js` import) is byte-identical to before.

### 4. `components/studio/shell/UnifiedDashboard.js` — full content rebuild
See "Dashboard changes" below.

### 5. `lib/studio/labels.js`
- Added `COMMAND_CENTER_HE` (new, additive) — labels for the 7 dashboard
  zones. `DASH_ACTIONS_HE` (the old dashboard's labels) is untouched.
- Fixed `STUDIO_5D_HE.stonesTitle`: "אבנים בעבודה" → **"אבני עבודה"** (exact
  phrase requested for the stone ribbon).

### 6. `components/studio/design/shell/StudioWorkflowRail.js`
Step icons now show short visible labels (was icon-only with a tooltip).
Same steps, same order, same active-step/navigation behavior — visual only.

### 7. `components/studio/design/shell/StudioStonePanel.js`
Option A cleanup, as decided: dropped the disabled "More actions" icon
button (clutter, did nothing). Add/Remove Work Tray toggle, Start Design,
and Report keep their exact existing behavior — nothing new added.

## Dashboard changes (Part 1 — Command Center)
Replaced the old "grid of guided-action cards" with 7 real, live zones:
- **Command Header** — brand, live status ("המערכת מוכנה" or the active
  project's name), one "Continue" action when work is active.
- **Quick Launch Strip** — 5 icon tiles to existing routes (New Design,
  Inventory, Work Tray, Assets, Design Studio) + a muted/disabled "Reports"
  tile (Certificates aren't built yet — shown honestly, not faked).
- **Inventory Pulse** — real counts (total, available, in tray, reserved,
  supplier, client-owned) from `getDemoInventorySnapshot()`, plus 4 small
  square stone thumbnails.
- **Active Work Tray** — the REAL Work Tray's items as horizontal chips
  (not the demo one), or the short empty text "בחר אבנים מהמלאי" if empty.
- **Design Pipeline** — Inventory → Tray → Studio → Concepts → Product,
  with the first 4 stages reflecting real state (has tray items? has
  concepts?) and "Product" always shown in the same muted/future style as
  the Reports tile, since there's no real product/report step yet.
- **Recent Activity** — the real demo activity feed, unchanged source.
- **Next Actions** — "stones in tray" and "concepts pending" are real
  counts; "reports to complete" is muted/future (no fabricated number);
  "assets without a photo" is a real count from the Asset Library store
  (`createUseAssets`, the same hook `TrayItemCard.js` already uses),
  shown as "—" while that store is still hydrating rather than a wrong 0.

The old dashboard's guided-action-card grid and "recent work" project list
are retired in favor of the above — the underlying design-projects store and
"continue work" flow are fully intact (`openProject()` is byte-identical)
and still reachable via the Command Header and the Projects nav item; I did
not delete any store or route, only this screen's presentation of them.

## Navigation changes (Part 2 — Unified App Frame)
Inventory (`/studio/inventory` and `/studio/inventory-demo`) now renders
inside the same app-level `StudioShell`/`NavRail` every other studio screen
uses — the actual fix for "Inventory feels disconnected," not a bolted-on
mini-nav. No routes were added, removed, or renamed.

## Design Studio flow changes (Part 3)
- Step indicator now shows short visible labels next to its icons.
- Stone ribbon title is now the exact phrase "אבני עבודה".
- Left Stone Panel: removed the disabled "More" button per Option A; no new
  behavior added anywhere in the Design Studio.

## What was NOT touched
Airtable/API, pricing, calculator, certificate/report generation logic,
`/mvp`, `/v2`, upload/storage, `designDraft.js`, `designBriefStore.js`,
`workTray.js`, `designProjects.js`, `AssetPicker.js`, `DesignOutputPanel.js`,
the Terminology QA Pass files (`demoInventoryLayer.js`, `demoGemstoneAssets.js`,
`assetPack.js`, `designOutputs.js`, `gemLabels.js`), `components/studio/design/shell/StudioShell.js`
(the Design Studio's own shell — not in the approved file list for this
pass), `components/studio/shared/tokens.js`, and `NavRail.js`/`navConfig.js`
(already solid from the Global Visual Upgrade pass). All re-verified
byte-identical to their prior state.

## Risks / limitations
- No real `next build` — same constraint as every prior milestone (no
  network access to install `node_modules` in this sandbox).
- The Inventory shell-wrap is the one change with genuine layout risk
  (nesting a component that used to own the whole viewport). Verified the
  diff is exactly the one wrapper style change described above, and that
  the internal 3-column grid + sticky panels still have a scrolling
  ancestor to attach to.
- "Assets without a photo" depends on `createUseAssets()`'s async IndexedDB
  hydration; the Dashboard shows "—" (not "0") until that hook reports
  `hydrated: true`, so it never displays a misleading zero while loading.

## QA performed
- `node --check` passed on `labels.js` (only pure-JS file changed).
- Brace/bracket/paren balance verified on all 6 JSX files — all balanced.
- **Additive-only export proof**: diffed exported-symbol sets against the
  true original baseline (or, for the two files created in earlier
  milestones, against their pre-this-pass state) — zero exports lost
  anywhere; `labels.js` gained exactly one new export (`COMMAND_CENTER_HE`).
- **Business-logic call-site diffing**: counted every call to
  `getDemoInventorySnapshot`, `saveDemoInventorySnapshot`,
  `resetDemoInventorySnapshot`, `toggleTray`, `updateActive`, `persist`,
  `onToggleTray`, `onStartDesign` — full diff confirms the only changes in
  `DemoInventoryWorkspace.js` are the header comment and the one style
  object; `StudioStonePanel.js`'s remaining action call counts are
  identical to before.
- Confirmed `UnifiedDashboard.js`'s only store-mutating call site
  (`tray.replace` / `briefStore.set` / `active.setActiveWork` inside
  `openProject()`) is present and unchanged from the previous version.
- Import-resolution check: every relative import in every changed file
  resolves to a real file — all OK.
- Full-tree diff against the original upload: confirms exactly these 7
  files changed in this pass (on top of everything already changed across
  the prior four milestones), zero files deleted or added this round.
  Re-confirmed `pages/mvp.js`, `pages/v2.js`, `lib/studio/designDraft.js`,
  `designBriefStore.js`, `workTray.js`, `designProjects.js`,
  `DesignOutputPanel.js` are still byte-identical to the original upload,
  and the Terminology QA Pass files are untouched this round.
- Re-ran the terminology check across the whole app: no visible "אגס" or
  "כרית" anywhere — confirmed clean.
