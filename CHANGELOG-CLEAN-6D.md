# CHANGELOG — CLEAN 6D — Studio Workstation Prototype

**Baseline:** Vercel-confirmed Clean 6B.1 ZIP (leshem-os-main).
**Route:** `/studio/workstation` — a SAFE PARALLEL prototype of the North Star
workstation direction. The stable `/studio/design` screen is completely
untouched.

---

## What Clean 6D adds

A functional (not mock) workstation screen exploring the North Star layout,
working against the SAME existing stores through their public exports only:

1. **Top stone/material ribbon** — real Work Tray items as thumbnails with
   role chips, selection, and an add-from-inventory affordance (the exact
   Clean 6A inline-picker pattern: read-only demo snapshot →
   `InlineInventoryPicker` → `toStudioTrayItem` → `tray.addItem`).
2. **Left icon-first tool rail** — שולחן / אבנים / תפריט / כיוונים / בריף / פלט.
   "תפריט" toggles the docked Design Menu; the rest switch the canvas view.
3. **Center split canvas** — concept preview pane (honest deterministic
   schematic + "בקרוב" badge — NO fake renders, NO render engine) side by
   side with a technical sketch/blueprint pane. Both reuse the existing
   `ConceptSketch` unchanged. Additional views: stones board, read-only brief
   snapshot, and the existing `DesignOutputPanel` rendered unchanged on a
   light "document sheet".
4. **Right docked Design Menu (תפריט עיצוב)** — visible by default on
   desktop. Product type / style / metal / stone usage / freedom level /
   note, all writing to the existing brief store (`update`), so it stays in
   live sync with the stable Studio.
5. **Bottom Design Directions palette (כיווני עיצוב)** — sketch thumbnails,
   selection, "חזרה לכל הכיוונים", and generate/regenerate wired to the exact
   existing contract: `generateConcepts` → `computeInputSignature` →
   `setConcepts` → defensive Active-Work sync (`getActiveWorkId` +
   `updateProject` + `buildDesignSnapshot`) — identical to
   `DesignConceptPanel`.
6. **Process strip** — אבנים → תפריט עיצוב → כיווני עיצוב → כיוון נבחר → בריף,
   derived entirely from existing state (done/stale flags), clickable.

Visual direction: dark graphite table, ivory/platinum text, subtle gold
hairline accents, layered glass cards — scoped in `wsStyle.js`, fully
separate from `tokens.js` and from the stable Studio's light reset.

Mobile/narrow (<1100px): single-column stack; the Design Menu becomes a
toggle; nothing crashes on an empty state.

---

## Files changed — ALL NEW, zero existing files edited

1. `pages/studio/workstation.js`
2. `components/studio/design/workstation/WorkstationShell.js`
3. `components/studio/design/workstation/WorkstationRibbon.js`
4. `components/studio/design/workstation/WorkstationRail.js`
5. `components/studio/design/workstation/WorkstationCanvas.js`
6. `components/studio/design/workstation/WorkstationMenu.js`
7. `components/studio/design/workstation/WorkstationDirections.js`
8. `components/studio/design/workstation/WorkstationProcessStrip.js`
9. `components/studio/design/workstation/wsStyle.js`
10. `components/studio/design/workstation/wsLabels.js`
11. `CHANGELOG-CLEAN-6D.md` (this file)

---

## Stop-and-report: Cluster / קלאסטר style

Adding "Cluster" as a real style value requires changing the PROTECTED
`lib/studio/designDraft.js`: the `STYLE_PREFERENCE` enum has no `cluster`,
and `normalizeBrief` validates `styleDirection` via `isValidStyle`, so an
unknown value would be stripped on load. Per the Clean 6D instructions this
part was NOT coded. The docked menu renders the existing style values only.
If approved, it is a tiny additive enum + label change in a future patch.

## Notes

- The North Star reference image was not present in the upload (only the
  baseline ZIP arrived), so the visual direction follows the written spec.
- The route is reachable by direct URL only. `navConfig.js` was deliberately
  not touched — adding a nav entry is a one-line future decision.
- The inert Clean 6C rollback stub
  `components/studio/design/shell/StudioProcessStrip.js` was left untouched;
  the workstation uses its own separate strip component.

---

## QA proofs (all run against the delivered tree)

- **Logic + SSR sandbox (22/22 passed)** — real repo modules with stubbed
  browser storage: tray add, brief field writes, `generateConcepts` (3
  concepts), signature stamping, staleness false after stamp,
  select/deselect (`selectConcept(null)` returns to all directions); SSR
  render of every zone with realistic props (ribbon shows stone + role, rail
  labels, menu titled תפריט עיצוב without קלאסטר, directions palette with
  thumbs + back button, all 4 canvas views incl. split preview + technical
  sketch SVGs, process strip full flow); full page mount of
  `/studio/workstation`; `/studio/design` still mounts; narrow empty-state
  render.
- **Additive-only** — `comm` file-list proof: 10 new files, ZERO removed;
  `cmp` loop over every baseline file: zero pre-existing files modified.
- **Protected files byte-identical** (`cmp`): designDraft.js,
  designBriefStore.js, workTray.js, designProjects.js, AssetPicker.js,
  DesignConceptPanel.js, DesignOutputPanel.js, pages/studio/design.js,
  design shell StudioShell.js.
- **Forbidden-token scan on new code lines** — clean: no commerce language,
  no Airtable, no pricing/certificates, no render engine/WebGL, no
  `\uXXXX` Hebrew escapes, no direct localStorage use, no new persistence
  keys, no new packages.
- **Brace/bracket balance** — all 10 files balanced; non-JSX modules pass
  `node --check`.

---

## Upload checklist

1. Open the current Vercel-confirmed repo (Clean 6B.1 baseline).
2. Copy the ZIP contents into the repo root — everything is ADDITIVE:
   - `pages/studio/workstation.js` (new file)
   - `components/studio/design/workstation/` (new folder, 9 files)
   - `CHANGELOG-CLEAN-6D.md`
   No existing file is overwritten; if Git shows anything as *modified*
   rather than *added*, stop and report.
3. Commit: `Clean 6D — Studio Workstation Prototype (parallel route)`.
4. Wait for the Vercel build to pass.
5. Verify in production:
   - `/studio/design` unchanged and fully working.
   - `/studio/workstation` opens (direct URL).
   - Tray stones appear in the top ribbon; add-from-inventory works.
   - Docked תפריט עיצוב visible on desktop; edits reflect in the stable
     Studio too (same brief).
   - כיווני עיצוב palette: generate, select, חזרה לכל הכיוונים.
   - Process strip updates as the flow advances.
   - Mobile: page stacks, nothing crashes.
   - מחשבון / תעודות / מלאי / קליטה untouched and working.


## QA fix applied by ChatGPT review

- `WorkstationShell.js` now uses the existing standalone `setConcepts` / `selectConcept` persistence exports for concept mutations before syncing Active Work.
- Reason: the React hook wrappers update state but do not return the next brief object; using the standalone exports matches the stable `DesignConceptPanel` contract and avoids syncing an empty/undefined brief into an active project.
