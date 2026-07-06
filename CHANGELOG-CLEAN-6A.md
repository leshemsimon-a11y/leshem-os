# Clean 6A — Studio Entry + Multi-Stone Composition + Concept Sketches

Root-ready patch. 7 files (5 edited + 2 new) + this changelog.
Baseline: leshem-os-main.zip (md5 7281e7381ab458802b5dff589354a050), the
Vercel-confirmed GitHub export containing Patch D, Clean 5E, 5E-Global,
Clean 5F (Core Flow Polish V1), 5G, 5H and Patches A/B/C. Named Clean 6A
because "Clean 5F" is already taken in this repo's history.

## Files changed
1. lib/studio/labels.js — additive ONLY: one NEW export `STUDIO_6A_HE`
   (hero 4-action labels, Composition Board labels, sketch captions).
   Diff proof: 41 lines added, 0 removed. Native Hebrew, no escapes.
2. components/studio/design/shell/StudioCanvas.js — hero State A is now the
   approved 4-action start panel: בחר אבנים מהמלאי (primary) · העלה אבן / נכס
   · התחל מתכשיט / מודל קיים (HONEST disabled placeholder, "בקרוב" badge) ·
   התחל ללא אבנים. Grid uses auto-fit so it wraps 4→2→1 on narrow screens
   with no media query. Optional small SECONDARY "המשך תיק עבודה" chip below
   the cards (never a primary action). Selected-direction blueprint pane now
   shows the DERIVED concept sketch with the honest caption
   "סקיצה סכמטית — לא הדמיה"; falls back to the original blueprint
   placeholder if the concept is missing — the pane is never blank.
   DISCLOSED contract change: the old third hero card "פתח מגש עבודה" is
   replaced per the approved 6A spec (the tray remains reachable via the app
   nav and the stone strip); the unused `onOpenTray` prop and TrayIcon import
   were removed from this file's hero path.
3. components/studio/design/shell/StudioShell.js — wiring only, no logic
   changes to concepts/output/staleness:
   • "בחר אבנים מהמלאי" opens the IN-STUDIO InlineInventoryPicker — the
     approved preferred path WAS feasible (no fallback routing needed). It
     reuses the exact Patch-D Work-Tray pattern: read-only
     getDemoInventorySnapshot → display entries → toStudioTrayItem →
     tray.addItem. Membership truth = the real Work Tray.
   • "העלה אבן / נכס" opens the EXISTING AssetPicker instance.
   • Resume chip restores via the same store calls as the Command Center's
     openProject flow (tray.replace + briefStore.set + setActiveWork); shown
     only when a resumable saved session exists.
   • New "קומפוזיציה" chip in the canvas header (visible once stones exist)
     opens the Composition Board; role edits go through the existing
     tray.setRole.
4. components/studio/design/shell/StudioBottomStrip.js — each variant thumb
   now renders the direction's derived ConceptSketch (28px) instead of one
   generic gem glyph; additive optional props stoneShapes /
   fallbackProductType. Selection logic untouched.
5. components/studio/design/shell/StudioIcons.js — additive: UploadIcon,
   LayersIcon. No existing icon touched.
6. NEW components/studio/design/shell/ConceptSketch.js — pure presentational
   deterministic schematic SVG derived AT RENDER TIME from existing concept /
   brief / tray data (product silhouette + stone-shape head glyph + up to 4
   distinct side marks + a per-conceptId head-treatment variant via a tiny
   string hash). No stored sketch field, no schema change, no store imports,
   no state, no staleness impact. Deliberately line-art — never a fake render.
7. NEW components/studio/design/shell/CompositionBoard.js — presentational
   role-grouped board over the EXISTING buildDesignGroups export (center
   stones individually addressable, never quantity-collapsed). Role editing:
   role badge + small "ערוך תפקיד" per item expands the EXISTING shared
   RoleChips inline for that item only (approved density rule — eight 44px
   chips always-open per item would be unusably dense). Desktop side drawer /
   narrow bottom sheet, mirroring the 5E intent-drawer pattern.

## NOT changed
All protected stores and components (workTray.js, designDraft.js,
designBriefStore.js, designProjects.js, AssetPicker.js, DesignConceptPanel.js,
DesignOutputPanel.js) — byte-identical, cmp-verified. No Airtable/API, no
pricing, no certificates, no tokens.js, no new packages, no new persistence
keys, no /mvp, no /v2, no dashboard changes.

## Offline QA run
• comm -23 export-removal proofs — 0 exports removed in every edited file.
• Brace/bracket balance on all JSX (paren counter false-positive re-verified
  against baseline); node --input-type=module --check on labels.js.
• Import-resolution check — every import in changed/new files resolves.
• Forbidden-token scans (commerce, Airtable writes, pricing, render APIs,
  new packages, \uXXXX Hebrew escapes, new persistence in new files) — clean;
  all scanner hits are pre-existing baseline comment/label lines.
• Logic sandbox vs REAL modules with stubbed localStorage — 21/21 passed:
  labels intact + new export; workTray setRole/addItem; buildDesignGroups
  grouping invariants; ConceptSketch determinism (exact source of the pure
  fns); generateConcepts export intact; designProjects save/get for resume.
• Honest disclosure: a real `next build` cannot run offline — Vercel remains
  the final gate.

## Upload checklist
1. Upload the ZIP contents to the repo root (1:1 paths, no wrapper folder):
   - lib/studio/labels.js (overwrite)
   - components/studio/design/shell/StudioShell.js (overwrite)
   - components/studio/design/shell/StudioCanvas.js (overwrite)
   - components/studio/design/shell/StudioBottomStrip.js (overwrite)
   - components/studio/design/shell/StudioIcons.js (overwrite)
   - components/studio/design/shell/ConceptSketch.js (new)
   - components/studio/design/shell/CompositionBoard.js (new)
2. Wait for the Vercel build to pass.
3. Verify on /studio/design with an EMPTY tray: 4 start cards render; the
   third card ("התחל מתכשיט / מודל קיים") is visibly disabled with "בקרוב";
   if a saved תיק עבודה exists, a small "המשך תיק עבודה" chip appears below.
4. Click "בחר אבנים מהמלאי" → the in-Studio picker opens (no navigation);
   add 2–3 stones → hero closes, stones appear in the strip.
5. Click "העלה אבן / נכס" on a fresh empty state → the AssetPicker opens.
6. With stones present: the "קומפוזיציה" chip appears in the canvas header;
   open it, edit a role via "ערוך תפקיד" → the change reflects in the tray
   page and the stone panel badge. Test once on a narrow window (bottom sheet).
7. Generate directions → bottom-strip thumbs show distinct schematic
   sketches; select a direction → the right pane shows the sketch with
   "סקיצה סכמטית — לא הדמיה".
8. Regression pass: calculator opens, certificates open, inventory Airtable
   read works, Work Tray add/remove works, save/resume תיק עבודה works.
9. On green: export the repo ZIP from GitHub — it becomes the Clean 6B baseline.
