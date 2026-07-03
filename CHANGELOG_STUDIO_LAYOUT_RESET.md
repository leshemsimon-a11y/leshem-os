# LESHEM.S OS — Studio Layout Reset (Clean 5D-R4)
Design Studio screen only. Root-ready ZIP for GitHub upload.

## Files changed (10)
- lib/studio/labels.js — additive only (new keys, none removed/renamed)
- components/studio/design/DesignConceptPanel.js — narrow approved exception (see below)
- components/studio/design/shell/StudioShell.js — 4-zone re-wiring
- components/studio/design/shell/StudioStoneStrip.js — Zone 1 restyle
- components/studio/design/shell/StudioCanvas.js — Zone 3 restyle (logic unchanged)
- components/studio/design/shell/StudioInspectorDrawer.js — Zone 4 restyle + generalized
- components/studio/design/shell/StudioBottomStrip.js — restyle only
- components/studio/design/shell/StudioWorkflowRail.js — repurposed (vertical rail → compact step indicator)
- components/studio/design/shell/StudioCommandBar.js — restyle + exit control added
- components/studio/design/shell/StudioIcons.js — additive (+MoreIcon)

## Files added (3)
- components/studio/design/shell/studioResetStyle.js — scoped visual constants (NOT shared tokens.js)
- components/studio/design/shell/stoneView.js — shared read-only stone view-model (used by Zone 2 + Zone 4)
- components/studio/design/shell/StudioStonePanel.js — NEW Zone 2 (left selected-stone panel)

## Files NOT touched
Inventory, Calculator, Certificates, Airtable/lib, upload logic, pages/api/*, components/studio/shared/tokens.js,
lib/studio/designDraft.js, designBriefStore.js, workTray.js, designProjects.js, components/studio/assets/AssetPicker.js,
components/studio/design/DesignOutputPanel.js. Verified byte-identical to the uploaded baseline.

---

## What layout was replaced
The Design Studio workstation (`components/studio/design/shell/StudioShell.js`) now renders 4 zones:

1. **Top Work Tray Ribbon** — square contain thumbnails (was circular/cover — full gemstone now visible,
   never cropped), tighter chips, dark-border selected state, tiny neutral status dot.
2. **Left Selected Stone Panel (NEW)** — large square contain image, title, 4-6 compact rows, badges,
   and one **real, wired** primary action (Add / Remove Work Tray) + Start Design / Create Report / More
   icon buttons.
3. **Center Work Canvas** — same 4 states as before (hero / split / starter / flow), now with a compact
   icon-only step indicator + current step title in its header. The bottom variant strip now docks to
   this column only (not the full screen width).
4. **Right Inspector** — advanced/collapsed detail only: concept detail (unchanged) or, when a stone is
   selected, compact rows + source/status + one collapsed "advanced details" section. The old duplicate
   action buttons here (never functional — see below) are gone; the CTA button this panel could render
   was dead code (the shell never fed it) and was removed with it.

Visual reset: near-white/graphite palette, radius reduced across the board, no gold fills (gold kept as a
single hairline accent), heavier shadows removed. Scoped to Design Studio only via a new local
`studioResetStyle.js` — the shared `components/studio/shared/tokens.js` (used by ~60 files across
Inventory/Work Tray/etc.) was deliberately left untouched.

## What logic was preserved
- All data flow unchanged: `useWorkTray`, `useDesignBrief`, `useDesignProjects`, `designDraft.js` selectors
  (`getSelectedConcept`, `getActiveOutput`, `conceptsAreStale`, `outputIsStale`) — same calls, same places.
- `DesignConceptPanel` / `DesignOutputPanel` generation, selection, notes, refresh, remove — unchanged.
- `AssetPicker` wiring — unchanged.
- Demo Operating Layer (`demoInventoryLayer.js`) — unchanged, still read-only/localStorage-only.

## Approved exception — DesignConceptPanel.js (Option B, as authorized)
- **A.** Added a 3-card quick style pick (Classic / Modern / Statement) above the form. It reads/writes
  the *same* `brief.styleDirection` field via the *same* `briefStore.update` call the original 5-value
  chip-select (still present, unchanged) already uses. No new vocabulary — `STATEMENT` is an existing
  `STYLE_PREFERENCE` value.
- **B.** The full existing direction form (product type, working-with, goal, style/metal/stone-usage
  chips, more-fields) now nests under one new "פרטי כיוון מתקדמים" disclosure, collapsed by default.
  Nothing removed — same fields, same handlers, just nested one level deeper.
- **C.** `conceptGrid` changed from a vertical stack to a horizontal scroll row (style-object change
  only — same `ConceptCard`, same data/handlers). `concept.shortDescription` moved from an
  always-visible paragraph into the existing details toggle (still reachable there, plus as a hover
  tooltip on the concept name) — matches the "visual-first, no long text by default" requirement.

## Where demo stones appear
Unchanged behavior: when the real Work Tray is empty, the same 6 demo stones (from
`demoInventoryLayer.js`) populate the top ribbon and, now, the new left panel. Clicking any chip
(demo or real — see behavioral note below) updates both the left panel and the right inspector.

## One behavioral generalization (flagged, not a bug)
Stone-strip click-to-select was previously wired **only** for demo stones (a real Work Tray selection
did nothing). It's now generalized to work for either list, using only pre-existing store methods,
so "click selects stone → updates left panel + inspector" holds regardless of which list is showing.

## One discoverable side effect (flagged, as requested)
"Add to Work Tray" on a demo stone uses the existing `tray.addItem()`. Because the demo layer only
shows *while the real tray is empty* (pre-existing, unchanged rule), adding one demo stone to the real
tray flips the screen out of demo mode on the next render — the other 5 demo suggestions disappear and
only the newly-added real item remains selected (with "Remove from Tray" now available for it). This is
existing logic reached via a newly-wired button, not new behavior — worth trying once deliberately.

## Zone 2 action wiring
- **Add / Remove Work Tray** — real, using only `tray.addItem` / `tray.remove` (existing `useWorkTray`
  hook methods) + the already-tray-shaped demo item. No new business logic.
- **Start Design** — real, calls the existing `setActiveStep('design')`.
- **Create Report / More actions** — honest disabled placeholders with "— בקרוב" labels (Certificates
  untouched, out of scope).

---

## QA performed (offline — see limitations)
- `node --check` passed on all pure-JS (non-JSX) files: `studioResetStyle.js`, `stoneView.js`, `labels.js`.
- Brace `{}` / bracket `[]` balance verified on all 12 touched/added JS(X) files — all balanced.
- Targeted tag-balance checks: `Disclosure` open/close (3/3), fragment `<>`/`</>` (4/4), `div` (8/8) in the
  files with the most structural change.
- **Additive-only proof**: exported-symbol sets diffed old vs. new for every changed file — zero exports
  lost anywhere; `StudioIcons.js` gained exactly one new export (`MoreIcon`); `labels.js` gained new
  *properties* inside existing frozen objects, no new/removed top-level exports.
- Forbidden-token scans: no "basket"/cart language, no "Build Jewelry" button, no new Airtable calls, no
  pricing logic, no Stability/render-generation calls, no new npm packages, no `\uXXXX` Hebrew escapes —
  all clear (only pre-existing comments/labels mention these terms descriptively).
- Import-resolution check: every relative import in every touched/added file resolves to a real file —
  all OK.
- Label cross-reference: every `STUDIO_5D_HE.*` / `CONCEPT_HE.*` / `BRIEF_HE.*` key referenced from the
  new/edited files exists in `labels.js` — all OK.
- Full-tree diff against the uploaded baseline: exactly the approved 10 modified + 3 new files changed;
  zero files deleted; all protected files and out-of-scope directories (Inventory, Airtable, Reports,
  Calculator, `pages/api`) confirmed **byte-identical** to the upload.

## Disclosed limitations
- **No real `next build`** was run — this sandbox has no network access to install `node_modules`, so a
  real Next.js/Webpack build could not be executed. QA above (syntax checks, brace/bracket balance, tag
  balance, export diffing, import resolution, label cross-referencing, full-tree diff) is the offline
  substitute used on every milestone; **Vercel is the final build confirmation gate**, as always.
- Real (non-demo) Work Tray items show fewer advanced fields in the right inspector than demo stones,
  because the real tray snapshot (`workTray.js` → `assetToTrayItem`) doesn't carry SKU/measurements/
  location/owner yet — the advanced section simply doesn't render for those fields rather than showing
  invented placeholders.
- The demo-mode-exit side effect described above is real and by design of the pre-existing Demo
  Operating Layer rule; flagging again here so it isn't a surprise on first click.
