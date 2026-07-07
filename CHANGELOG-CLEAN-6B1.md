# Clean 6B.1 — Design Menu Visibility + Terminology

Tiny root-ready patch. 3 files + this changelog.
Baseline: the restored Clean 6A stable baseline (the drift-verified scoped
GitHub export). Contains NOTHING from the rolled-back Clean 6B patch: no
navigation, no breadcrumbs, no new icons, no direction actions, no hints.

## Files changed
1. lib/studio/labels.js
   • Two surgical VALUE fixes (keys unchanged, single consumers grepped):
     - CONCEPT_HE.directionTitle: 'כיוון עיצוב' → 'תפריט עיצוב'
       (this titles the INPUT form inside DesignConceptPanel; the panel file
       is untouched — the fix flows through the label it already consumes;
       'כיוון' is now reserved for generated directions only)
     - STUDIO_5D_HE.variantsTitle: 'כיוונים' → 'כיווני עיצוב'
       (the palette explicitly reads as generated design directions)
   • Additive NEW export STUDIO_6B1_HE: 'מה ניצור?', subtitle,
     'פתח תפריט עיצוב', 'ערוך תפריט עיצוב', 'עריכה'.
2. components/studio/design/shell/StudioCanvas.js — the design menu is now
   VISIBLE in the main flow: in the pre-concepts state (stones/metal chosen,
   directions not yet generated) a compact card appears in the canvas —
   title 'מה ניצור?', subtitle 'בחר סוג תכשיט, סגנון, מתכת ורמת חופש פעולה',
   primary 'פתח תפריט עיצוב'. When intent is already set, the card shows the
   compact summary (e.g. 'טבעת · יוקרתי · זהב צהוב · מאוזן') and the action
   becomes 'ערוך תפריט עיצוב'. Additive props only (intentSummary,
   onOpenIntent); text button, no icons; opens the EXISTING intent drawer.
3. components/studio/design/shell/StudioShell.js — passes the ALREADY-
   computed intentSummary + the existing drawer opener to the canvas; after
   concepts exist the existing header summary chip gains a quiet '· עריכה'
   suffix so editing stays obvious in the collapsed state.

## NOT changed
StudioIntentDrawer.js (its exported intentSummaryText already produces the
requested 'product · style · metal · usage · freedom' summary — reused 1:1),
DesignConceptPanel.js, designDraft.js, designBriefStore.js, workTray.js,
designProjects.js — all cmp-verified byte-identical. No navigation, no
breadcrumbs, no icons, no Airtable/API, no pricing, no new packages, no new
persistence keys, no /mvp, no /v2.

## Offline QA run
• Exactly 3 changed files (diff -rq proof).
• comm -23 export proofs — 0 exports removed; exactly ONE new export.
• Deep key audit — zero keys removed across CONCEPT_HE + STUDIO_5D_HE.
• Brace/bracket balance clean; imports resolve.
• Forbidden-token scan on NEW lines (incl. icon/router/breadcrumb checks per
  the 6B.1 restrictions) — clean.
• Logic sandbox — 13/13 passed (label values exact, generated labels intact,
  card open/edit CTA switching, drawer untouched).
• Honest disclosure: no offline `next build` — Vercel is the final gate.

## Upload checklist
1. Upload to repo root (1:1 paths, no wrapper):
   - lib/studio/labels.js (overwrite)
   - components/studio/design/shell/StudioCanvas.js (overwrite)
   - components/studio/design/shell/StudioShell.js (overwrite)
2. Wait for the Vercel build to pass.
3. QA:
   a. Studio with stones but no directions → the 'מה ניצור?' card is visible
      in the canvas with 'פתח תפריט עיצוב'; clicking opens the intent drawer.
   b. Set type/style/metal in the drawer, close → the card now shows the
      compact summary and 'ערוך תפריט עיצוב'.
   c. Open the concepts panel → the input form section is titled
      'תפריט עיצוב' (not 'כיוון עיצוב').
   d. Generate → the generated area reads 'כיווני עיצוב מוצעים' and the
      bottom palette reads 'כיווני עיצוב'; nothing calls concepts 'כוונות'.
   e. With concepts present → the header chip shows the summary + '· עריכה'.
   f. Narrow window → the card stacks cleanly above the preview slots.
4. Regression: calculator, certificates, inventory read, Work Tray, save/
   resume, Clean 6A hero/board/sketches.
5. On green: export the repo ZIP — it becomes the next baseline.
