# Clean 6B — Studio Flow Clarity + Visible Design Directions

Root-ready patch. 7 files (all edits, no new components) + this changelog.
Baseline: leshem-os-clean-6a-code-only.zip — the scoped Clean 6A GitHub
export, drift-verified: all 7 Clean 6A files byte-matched the delivered
patch, and every protected file byte-matched the prior verified baseline.

## Files changed
1. lib/studio/labels.js
   • Additive: NEW export `STUDIO_6B_HE` (escape-nav labels, direction
     actions, next-step hints).
   • Four surgical terminology VALUE fixes (keys unchanged, consumers
     grepped first): CONCEPT_HE.directionTitle 'כיוון עיצוב' → 'כוונת עיצוב'
     (it titles the INPUT form = Design Intent); CONCEPT_HE.styleDirectionLabel
     'כיוון סגנוני' → 'סגנון'; CONCEPT_HE.notesPlaceholder drops the
     misleading 'לכיוון'; STUDIO_5D_HE.variantsTitle 'כיוונים' →
     'כיווני עיצוב' (the palette explicitly reads as design directions).
     These flow into DesignConceptPanel through labels it already consumes —
     the panel file itself is untouched.
2. components/studio/design/shell/StudioCommandBar.js — calm always-visible
   escape breadcrumb: מלאי · מגש עבודה (icon + short label; icon-only on
   narrow), plus the existing Home exit retitled 'חזרה ללוח הבקרה'. Plain
   navigation callbacks from the shell; presentation only.
3. components/studio/design/shell/StudioShell.js — Clean 6B wiring only:
   • browseDirections UI flag: shows the full directions palette while a
     direction is selected, WITHOUT losing the selection (the panel shows
     its 'כיוון נבחר' badge); auto-resets when selection clears.
   • 'בטל בחירה' via the EXISTING briefStore.selectConcept(null) — the
     export already supports null; no store change.
   • 'צור כיוונים חדשים' routes to the same design step the primary CTA
     already uses; 'חזרה לכיוון הנבחר' chip appears in the canvas header
     while browsing with a live selection.
   • One-line next-step hint state machine derived from existing state
     (hero / intent / concepts / staleness / selection).
   • Escape navigation callbacks (router pushes) passed to the command bar.
4. components/studio/design/shell/StudioCanvas.js — selected state is no
   longer a trap: calm 'חזרה לכיוונים' + 'בטל בחירה' chips at the top of the
   selected view (rendered only when the callbacks exist).
5. components/studio/design/shell/StudioBottomStrip.js — palette header now
   reads 'כיווני עיצוב' (via the label fix); small refresh icon action
   ('צור כיוונים חדשים', shown only when directions exist); compact
   'השלב הבא: …' hint beside the primary CTA.
6. components/studio/design/shell/StudioIntentDrawer.js — small leading
   icons on every section label (product / style / metal / stone usage /
   freedom / note): reads as a studio tool, not a text form. Chip controls
   and store wiring unchanged.
7. components/studio/design/shell/StudioIcons.js — additive icons only:
   TrayNavIcon, GridViewIcon, RefreshIcon, ClearIcon, GemIcon, StyleIcon,
   FreedomIcon, NoteIcon.

## NOT changed
DesignConceptPanel.js — untouched, cmp-verified (terminology fixes reach it
via labels.js values). All protected stores untouched and cmp-verified:
workTray.js, designDraft.js, designBriefStore.js, designProjects.js,
AssetPicker.js, DesignOutputPanel.js. No Airtable/API, no pricing, no
certificates, no render engine, no new packages, no new persistence keys,
no /mvp, no /v2, no dashboard changes, no inventory schema changes.

## Offline QA run
• Baseline drift check: delivered Clean 6A files byte-matched the GitHub
  export before any 6B work started.
• comm -23 export proofs — 0 exports removed in every edited file.
• CONCEPT_HE deep key audit — 77 keys checked, zero removed.
• Brace/bracket balance clean on all edited JSX; ESM syntax check on labels.
• Import-resolution check — every import resolves on disk.
• Forbidden-token scan on NEW lines only (via diff) — clean.
• Logic sandbox vs real modules, stubbed browser — 16/16 passed, including:
  selectConcept(null) clears the selection (deselect proof), hint machine
  wired to staleness, browse-directions keeps selection while showing the
  palette, terminology fixes exact, intent-drawer title untouched.
• Honest disclosure: a real `next build` cannot run offline — Vercel is the
  final gate.

## Upload checklist
1. Upload contents to the repo root (1:1 paths, no wrapper folder): the 7
   files listed above (all overwrites, no new paths).
2. Wait for the Vercel build to pass.
3. QA per the milestone list:
   a. Open /studio/design directly → the command bar shows מלאי · מגש עבודה
      escapes + the Home exit ('חזרה ללוח הבקרה'). Leaving is obvious.
   b. Add/select stones → the bottom strip shows 'השלב הבא: הגדירו כוונת
      עיצוב' (or the matching state).
   c. Open the intent drawer → titled 'כוונת עיצוב', sections have icons.
   d. Generate → the input form section is titled 'כוונת עיצוב'; the
      generated area reads 'כיווני עיצוב מוצעים'; the strip header reads
      'כיווני עיצוב'.
   e. Select a direction → top of canvas shows 'חזרה לכיוונים' and
      'בטל בחירה'. 'חזרה לכיוונים' shows all directions with the selection
      badge kept, and a 'חזרה לכיוון הנבחר' chip appears in the header.
   f. 'בטל בחירה' clears the selection and returns to the palette.
   g. The refresh icon beside the palette routes to direction generation.
   h. Narrow window: breadcrumb collapses to icons; direction actions wrap;
      hint truncates gracefully.
4. Regression pass: calculator, certificates, inventory Airtable read, Work
   Tray add/remove, save/resume תיק עבודה, Clean 6A features (4-action hero,
   composition board, sketches).
5. On green: export the repo ZIP from GitHub — it becomes the next baseline.
