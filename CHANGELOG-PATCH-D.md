# Patch D — Inventory / Tray / Studio Usability V1

Root-ready patch. 9 changed files + this changelog. Additive-only (comm -23 export proof passed on every file). No protected store internals, no Airtable/API, no /mvp, no /v2, no new packages, no new persistence keys.

## Changed files
1. components/studio/demo/DemoInventoryWorkspace.js — catalog grid rework (visual/structural; Patch A data flow preserved verbatim)
2. components/studio/shared/InlineInventoryPicker.js — NEW generic presentational picker (props-only, no stores)
3. components/studio/tray/WorkTray.js — "הוסף פריטים" inline inventory add wired to real Work Tray exports; text reduction
4. components/studio/tray/TrayItemCard.js — icon-only remove, role hint to tooltip
5. components/studio/design/shell/StudioShell.js — group indicator in canvas header; passes trayItems to inspector
6. components/studio/design/shell/StudioStoneStrip.js — role badges on chips + stone count
7. components/studio/design/shell/StudioStonePanel.js — role badge on active stone
8. components/studio/design/shell/StudioInspectorDrawer.js — stone branch de-duplicated: session summary + collapsed advanced details, no repeated stone card
9. lib/studio/labels.js — NEW additive export USABILITY_D_HE (no existing key touched)

## Inventory
- Compact image-first cards: square contain image, short title, one metadata line (shape · carat · color), source/status chips, price
- Icon actions per card: inspect / add-remove tray (real Work Tray) / start design
- Chip filters: stone type visible; source + status collapsed behind "סינון"
- Details + existing edit fields moved to an overlay drawer (side panel desktop / bottom sheet mobile)
- Removed always-visible text: subtitle paragraph, activity feed row, stats row, explanatory note box; save/reset feedback is now a toast
- In-tray = sage top bar + check badge; active = charcoal border (unchanged visual language)

## Mobile inventory
- 2-column grid, compact tappable cards
- Sticky bottom action bar for the active item (details + tray toggle)
- Bottom-sheet details drawer; no desktop side panels squeezing content

## Work Tray inline add
- "הוסף פריטים" opens InlineInventoryPicker (overlay sheet) — search + compact rows + add/remove
- Adds via existing toStudioTrayItem → tray.addItem; removes via tray.remove; membership truth = real tray only
- No route jump; closing returns to the same tray screen
- AssetPicker untouched and still reachable (empty state + meta row)
- Draft note and status-strip body moved to tooltips

## Design Studio multi-stone
- Top ribbon: role badge per chip (מרכזית/צד/אבנים נוספות…), stone count when >1
- Left panel: active stone control + role badge (unchanged actions)
- Right inspector (stone branch): work-session summary (per-role counts via existing summarizeDraft) + active stone by name + collapsed advanced details — the duplicate stone card is gone
- Canvas header: group line "N אבנים · מרכזית: X" when the session has multiple stones
- Concept/output inspector branches unchanged

## Intentionally not done (approved)
- Full cross-screen 5-step stepper (kept existing studio stepper; later patch)
- DesignConceptPanel internals untouched — group awareness added around it

## QA (offline)
- brace/bracket balance on all JSX files; node --check on labels.js
- comm -23 additive export proof per file
- forbidden-token scans: commerce language, אגס/כרית, \uXXXX Hebrew, Airtable writes, localStorage/new keys — clean
- import resolution + named-export verification
- logic sandbox against REAL workTray + demoInventoryLayer + designDraft modules (stubbed localStorage): inline add/remove, duplicate-add guard, summarizeDraft keys — passed
- Real `next build` not possible offline — Vercel deploy confirmation required before this becomes the next baseline
