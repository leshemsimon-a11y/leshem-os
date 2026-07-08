# Clean 6C — Studio North Star Workstation

Root-ready patch. 7 files (6 edits + 1 new) + this changelog.
Baseline: Clean 6B.1 stable — verified by byte-matching the uploaded 6B.1
patch ZIP against the applied tree before any 6C work began.
The North Star image was used as a visual/functional target, not copied
pixel-perfect. Studio only; nothing outside the studio shell was touched.

## Files changed
1. lib/studio/labels.js — additive ONLY: NEW export STUDIO_6C_HE (dock
   title 'תפריט עיצוב', process-strip vocabulary אבנים / תפריט עיצוב /
   כיווני עיצוב / כיוון נבחר / בריף, quick actions, 'צור כיוונים חדשים').
   Design Menu and Design Directions terminology never mixed.
2. components/studio/design/shell/StudioIntentDrawer.js — ADDITIVE
   extraction: the drawer's control stack (jewelry type, style, metal,
   stone usage, freedom level, note) is now the exported DesignMenuBody
   component; the drawer's default export keeps its exact signature and
   renders the same body inside its unchanged overlay chrome. Every tap
   still writes through the EXISTING brief store exports — multiple mounted
   surfaces stay live-synced via the store's existing pub/sub (the already-
   documented drawer + concept-panel pattern).
3. components/studio/design/shell/StudioShell.js —
   • Docked תפריט עיצוב panel at the top of the existing right column on
     wide viewports, VISIBLE BY DEFAULT, with a small collapse toggle
     (UI-only state, nothing persisted) and an internal scroll cap so the
     inspector below keeps room. Grid template untouched.
   • On wide, the intent chip and the 6B.1 'מה ניצור?' card focus the
     docked panel; the overlay drawer mounts ONLY on narrow — mobile keeps
     the current bottom-sheet behavior byte-for-byte.
   • Derived process steps passed to the new strip (stones counts as passed
     for the explicit metal-only start; brief = existing output presence).
   • Calm quick actions in the right column: חזרה למלאי · חזרה למגש עבודה ·
     חזרה ללוח הבקרה (plain route pushes).
   • '+' generation tile routes to the EXISTING design step.
4. components/studio/design/shell/StudioCanvas.js — split-canvas depth:
   the selected-direction preview pane reads as an elevated card and the
   sketch pane as a drafting surface (existing reset tokens only; the 6A
   schematic ConceptSketch remains the honest visual — no fake renders).
5. components/studio/design/shell/StudioBottomStrip.js — the כיווני עיצוב
   palette became North Star direction cards: larger visible sketches
   (44px stage), name under each card, clear selected state (strong border
   + check + lift), and a calm dashed '+ צור כיוונים חדשים' tile shown once
   directions exist. Selection logic unchanged.
6. components/studio/design/shell/StudioIcons.js — additive: DirectionsIcon,
   ChosenIcon.
7. NEW components/studio/design/shell/StudioProcessStrip.js — the compact
   derived process strip. Status only (done/active/pending per node), no
   state, no store imports, NO navigation — the workflow rail remains the
   navigator. Horizontal scroll on narrow.

## NOT changed
DesignConceptPanel.js and all protected stores (workTray.js, designDraft.js,
designBriefStore.js, designProjects.js, AssetPicker.js, DesignOutputPanel.js)
— cmp-verified byte-identical. No render engine, no fake photorealistic
previews, no real 3D, no pricing, no certificates, no Airtable/API, no new
packages, no new persistence keys, no dashboard/inventory/tray/projects
changes, no studioResetStyle retint.

## Offline QA run
• Baseline verification: uploaded 6B.1 patch ZIP byte-matched the applied
  tree before work began.
• comm -23 export proofs — 0 exports removed anywhere; DesignMenuBody and
  STUDIO_6C_HE are the only new exports plus 2 icons.
• Brace/bracket balance clean on all 7 files; import-resolution clean.
• Forbidden-token scan on new lines only — clean.
• Protected files cmp-verified untouched.
• Logic sandbox — 15/15 passed: label terminology exact; updateBrief write
  path; drawer signature unchanged; drawer renders the shared body; overlay
  gated to narrow; dock default-open; process steps derived from existing
  state only; process strip has zero navigation; generate tile gating.
• Honest disclosure: no offline `next build` — Vercel is the final gate.

## Upload checklist (matches the milestone QA list)
1. Upload to repo root (1:1 paths): the 7 files above (6 overwrites,
   StudioProcessStrip.js is new).
2. Vercel build green, Studio opens without client-side error.
3. Desktop: docked תפריט עיצוב visible by default on the right; collapse
   toggle works; edits persist (type/style/metal/usage/freedom/note) and
   reflect in the summary chip + concept panel.
4. Mobile/narrow: intent chip and 'מה ניצור?' card still open the bottom
   sheet; no docked panel.
5. Stone ribbon works incl. add tile.
6. Generate concepts → כיווני עיצוב cards visible and visually stronger
   with sketches + names; '+' tile appears and routes to generation.
7. Select a direction → strong selected card state + split preview/sketch
   canvas with depth; deselect/return via the existing panel flow works.
8. Process strip reflects reality end-to-end: אבנים → תפריט עיצוב →
   כיווני עיצוב → כיוון נבחר → בריף (metal-only start marks אבנים passed).
9. Quick actions navigate to מלאי / מגש עבודה / לוח הבקרה.
10. Render Brief still works; save/resume session works; Clean 6A hero /
    composition board / in-Studio picker intact.
11. On green: export the repo ZIP — it becomes the next baseline.
