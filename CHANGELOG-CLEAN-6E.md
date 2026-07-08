# CHANGELOG — CLEAN 6E — Save Work File from Workstation

**Baseline:** Vercel-confirmed Clean 6D delivery (Clean 6B.1 + the 6D
workstation prototype).
**Scope:** product-flow milestone only — no visual redesign. `/studio/workstation`
can now save the current state as a real Work File (Design Project).

---

## What Clean 6E adds

1. **"שמור כתיק עבודה"** — a clear save action in the workstation header.
2. **Save behavior** — creates a NEW Design Project through the EXISTING
   public API only: `useDesignProjects().save({ name, trayItems, brief,
   snapshot })` with `snapshot` from the existing `buildDesignSnapshot`.
   Name format: `תיק עיצוב · [סוג מוצר] · [תאריך]` when a product type is
   chosen in the Design Menu, otherwise `תיק עיצוב · [תאריך]`.
3. **After save** — the new Work File becomes the Active Work via the
   existing `setActiveWorkId(saved.id)`; success toast
   **"העבודה נשמרה כתיק עבודה"**; a quiet **"פתח תיקי עבודה"** action appears
   and routes to `/studio/projects`.
4. **Empty guard** — with an empty Work Tray the button is disabled and shows
   **"צריך לבחור לפחות אבן אחת לפני שמירת תיק עבודה"**.
5. **Active Work kept simple by spec** — always save-as-new + set active; no
   update/replace logic in this milestone.

No new storage key, no schema change, no store edit, no new dependency.

---

## Files changed (4)

1. `components/studio/design/workstation/WorkstationShell.js` — edited
   (projects hook instance, save handler, save bar in header).
2. `components/studio/design/workstation/wsLabels.js` — edited (new
   `WS_HE.save` strings, native Hebrew literals).
3. `components/studio/design/workstation/WorkstationSaveBar.js` — NEW small
   presentational component (button + guard text + open-projects action; no
   store imports, no state of its own).
4. `CHANGELOG-CLEAN-6E.md` (this file).

Everything else — including `/studio/design`, `components/studio/design/shell/*`,
`designProjects.js`, `workTray.js`, `designBriefStore.js`, `designDraft.js`,
`activeWorkStore.js`, `package.json` — is byte-identical to the baseline
(`cmp`-proven).

---

## QA proofs (all run against the delivered tree)

- **Clean 6E sandbox suite — 22/22 passed** against the real modules with
  stubbed browser storage: disabled save + guard text on empty tray; with a
  stone + Design-Menu fields + a selected direction, save creates a project;
  name format verified; new project becomes Active Work; project listed by
  the store; saved project contains the tray items, the brief/design-menu
  data (productType/style/metal), the selected direction id + all 3
  concepts, and the snapshot; only pre-existing storage keys in use; post-save
  UI shows "פתח תיקי עבודה"; `/studio/workstation`, `/studio/design` and
  `/studio/projects` all still mount.
- **Full Clean 6D regression suite — 22/22 passed** on the 6E tree.
- **Export-removal proof** (`comm -23`) on both edited files: none removed.
- **Forbidden-token scan on new lines only** (diff-based): clean — no
  commerce language, Airtable, pricing, certificates, `\uXXXX` escapes,
  direct storage, or new packages.
- **Brace/bracket balance** on all changed files; `wsLabels.js` passes
  `node --check`.
- **Protected/do-not-touch files** byte-identical to baseline (`cmp`),
  including the entire `components/studio/design/shell/` folder.

---

## Upload checklist

1. Open the current Vercel-confirmed repo (Clean 6D state).
2. Copy the ZIP contents into the repo root:
   - `components/studio/design/workstation/WorkstationShell.js` — overwrites
     the 6D file (expected: Git shows *modified*)
   - `components/studio/design/workstation/wsLabels.js` — overwrites the 6D
     file (expected: Git shows *modified*)
   - `components/studio/design/workstation/WorkstationSaveBar.js` — new file
   - `CHANGELOG-CLEAN-6E.md` — new file
   If Git shows ANY other file as modified — stop and report.
3. Commit: `Clean 6E — Save Work File from Workstation`.
4. Wait for the Vercel build to pass.
5. Verify in production:
   - `/studio/design` unchanged and working.
   - `/studio/workstation` opens.
   - Empty tray → save disabled + helper text.
   - Add a stone → save enabled; click → toast "העבודה נשמרה כתיק עבודה" and
     "פתח תיקי עבודה" appears.
   - `/studio/projects` shows the new Work File with the stones, the Design
     Menu data, and the selected direction (if one was selected).
   - The new Work File is the Active Work.
   - מחשבון / תעודות / מלאי / קליטה untouched and working.
