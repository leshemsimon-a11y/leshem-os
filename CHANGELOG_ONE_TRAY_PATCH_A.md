# LESHEM.S OS — Patch A: Core Workflow Wiring V1 — "One Tray"

Baseline: leshem-os-main.zip (md5 fb8b5ebfe722750787fbe4e7764c7323)

## Goal
Eliminate the demo/real Work Tray fork. The core workflow is now truthful:
Inventory → הוסף למגש עבודה → real Work Tray (מגש עבודה) → Design Studio → concepts.
The user sees exactly the stones they selected. No silent demo fallback.

## Files changed (2 + this changelog)
1. components/studio/demo/DemoInventoryWorkspace.js
2. components/studio/design/shell/StudioShell.js   (the Design Studio workstation shell)

No other files were touched. No protected files edited
(lib/studio/workTray.js, designBriefStore.js, designProjects.js, designDraft.js,
DesignConceptPanel.js, DesignOutputPanel.js, AssetPicker.js, shared/tokens.js — all untouched).
No new packages, no new persistence keys, no Airtable/API/pricing/certificate changes.

## How the fork was removed

### Inventory (DemoInventoryWorkspace.js)
- "הוסף למגש עבודה" now calls the REAL Work Tray store through the existing
  exported hook: createUseWorkTray → tray.addItem(toStudioTrayItem(item));
  removal calls tray.remove(id). Both bridges already existed — they were
  simply never called from this screen.
- "In tray" card state, the inspector action button, and the "במגש העבודה"
  stat now derive from REAL tray membership (tray.has via an id set), not
  from the demo selectedForTray flag. Demo item ids are preserved verbatim
  by toStudioTrayItem, so membership is a direct id lookup.
- The demo selectedForTray flag is kept only as a MIRROR of real membership:
  synced on each toggle and reconciled once after hydration (and after
  "אפס דמו"), via the existing saveDemoInventorySnapshot path. This keeps
  read-only demo consumers (Dashboard Inventory Pulse, demo activity feed)
  truthful without editing them, and clears the seed's pre-selected flags
  that previously fed the studio's fallback.
- Toast/status strings reuse existing labels (STUDIO_5D_HE.toastAddedToTray /
  toastRemovedFromTray). The side note box now describes the real flow.
- Demo inventory remains demo SEED data: filters, inspect/edit fields,
  reset-demo, images, and layout are unchanged.

### Design Studio (design/shell/StudioShell.js)
- Deleted the Demo Operating Layer fallback: demoTrayItems state, its
  storage/focus refresh listeners, showDemoLayer, displayTrayItems, and the
  ENABLE_DEMO_OPERATING_LAYER / getDemoStudioTrayItems imports.
- The REAL Work Tray is the single source for the stone strip, left stone
  panel, and right inspector. Default active stone still prefers a
  center-stone-role item (Core Flow Polish V1 behavior preserved).
- Empty tray → the existing guided empty state (hero). Its "צור תכשיט
  מאבנים" choice now routes to /studio/inventory (the real stone source);
  metal-only and open-tray choices unchanged; the AssetPicker stays
  reachable from the stone strip's add button.
- Zone 2 primary action: every stone shown IS a real tray item now, so the
  action is always "הסר מהמגש" via the existing tray.remove.
- Demo-SOURCED tray items still resolve their richer inspect view through
  the existing getDemoInspectStoneFromTrayItem helper — per selected item
  only (guarded by item.isDemoAsset), never as an injected list. Non-demo
  items gracefully fall back to their tray snapshot via stoneView.js.

## QA performed (offline)
- Brace/paren/bracket balance on both JSX files: BALANCED.
- Import resolution: every imported symbol verified against its source module.
- Export diff (comm -23): zero exports removed from either file — additive-only.
- Forbidden-token scan on changed files: no commerce language (basket/cart/עגלה),
  no Airtable writes, no NEXT_PUBLIC, no \uXXXX Hebrew escapes. אגס/כרית appear
  only in pre-existing, untouched input-normalizers — no visible labels.
- Logic sandbox (node, localStorage stub, real modules):
  toStudioTrayItem keeps id + primaryImage + centerStone role → addItemToTray
  adds → isInTray true → duplicate add de-duped → getDemoInspectStoneFromTrayItem
  resolves rich view from the stored real item → removeFromTray by string id
  works → mirror-flag persistence via saveDemoInventorySnapshot verified.
  ALL ASSERTIONS PASSED.
- /studio/tray rendering of demo-sourced items verified by code path:
  TrayItemCard falls to MediaPreview(snapshot.primaryImage) — image + Hebrew
  title render with no tray-page changes.

## Known limitations (disclosed)
1. Real `next build` is not possible in this offline environment — Vercel
   deployment confirmation is required before this becomes the next baseline.
2. The Work Tray indicator is not rendered on fullBleed desktop pages
   (Inventory, Design Studio) — pre-existing app-frame behavior, scoped to
   the App Frame milestone. Immediate feedback on the inventory page comes
   from the real-count "במגש העבודה" stat, the in-tray card badge, and the
   status toast. The indicator/badge works as before on Dashboard, Projects,
   Assets, Tray, and on mobile.
3. Stones added from demo inventory arrive with role 'centerStone'
   (existing toStudioTrayItem behavior, unchanged); roles remain editable in
   the Work Tray as before.
4. Dashboard "Inventory Pulse" reads the demo snapshot; its in-tray figure
   becomes accurate after the first Inventory visit post-deploy (the one-time
   mirror reconcile), since the seed ships with 3 pre-flagged stones.
5. If concepts already exist and the tray is emptied, the studio shows the
   concepts step with a "מתכת בלבד" strip (existing semantics), not the hero —
   the hero appears only when both stones and concepts are absent (unchanged).

## Upload checklist
1. Upload/replace exactly these files at their real paths:
   - components/studio/demo/DemoInventoryWorkspace.js
   - components/studio/design/shell/StudioShell.js
2. Commit → push → wait for Vercel build to pass.
3. Verify core flow (desktop + mobile):
   a. /studio/inventory → add a stone → toast + green in-tray badge + stat count.
   b. /studio/tray → the exact same stone appears, with image and role chips.
   c. /studio/design → the exact same stone(s) in the strip; center stone active.
   d. Remove from the studio's left panel → disappears from tray and inventory badge.
   e. Empty tray → guided start state; "צור תכשיט מאבנים" opens Inventory.
   f. Direction selection, הפק כיווני עיצוב, and concept selection still work.
   g. אפס דמו still restores demo fields; in-tray badges still match the real tray.
