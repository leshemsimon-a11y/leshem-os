# CHANGELOG — CLEAN 6F — Continue Work File Flow

**Baseline:** Vercel-confirmed Clean 6E state (Clean 6B.1 + 6D + 6E).
**Scope:** product-flow milestone — closes the first real loop:
save a Work File from `/studio/workstation` → open `/studio/projects` →
"המשך עבודה" → back in `/studio/workstation` with the file as Active Work.
No redesign, no scope expansion.

---

## What Clean 6F adds

### /studio/projects
A compact **"תיקי עבודה"** strip ABOVE the (untouched) Design Projects
library. Each saved Work File shows its name and stone count (existing
`PROJECTS_HE.itemsCount`), the current Active Work is marked **"תיק פעיל"**
(existing `getActiveWorkId`), and each file has a **"המשך עבודה"** action
that calls the existing `setActiveWorkId(project.id)` and routes to
`/studio/workstation`. Deliberately NO tray/brief hydration — per spec the
continue loop is context-only in this milestone. The library's existing
"פתיחה בסטודיו" flow is unchanged.

### /studio/workstation
When an Active Work exists, a compact **"תיק פעיל"** banner appears under the
header: subtitle **"נפתח להמשך עבודה"**, the Work File name, stone/item
count, direction status (כיוון נבחר / ללא כיוון נבחר), plus two actions —
**"פתח תיקי עבודה"** (routes to `/studio/projects`) and
**"שמור גרסה חדשה"**, which is exactly the existing Clean 6E save behavior
(always a NEW Work File that becomes Active; no update/overwrite yet, and it
respects the same empty-tray guard). With no Active Work, nothing changes —
current workstation behavior stays as-is.

No new storage key, no schema change, no store edit, no new dependency,
no API/Airtable/pricing/certificates/render-engine changes.

---

## Files changed (6)

1. `pages/studio/projects.js` — edited (small page-level container wiring the
   continue strip; renders it above the untouched library).
2. `components/studio/projects/ContinueWorkFilesStrip.js` — NEW small
   presentational component (props only; no store imports).
3. `components/studio/design/workstation/WorkstationShell.js` — edited
   (resolves the Active Work from the existing projects hook +
   `getActiveWorkId`, renders the banner, one extra grid row when present).
4. `components/studio/design/workstation/WorkstationActiveWork.js` — NEW
   small presentational banner component (props only).
5. `components/studio/design/workstation/wsLabels.js` — edited
   (`WS_HE.activeWork` strings, native Hebrew literals).
6. `CHANGELOG-CLEAN-6F.md` (this file).

---

## QA summary (all run against the delivered tree)

- **Clean 6F sandbox suite — 20/20 passed** against the real modules:
  saved Work Files listed in the strip by name with stone counts; exactly one
  "תיק פעיל" mark matching `getActiveWorkId`; "המשך עבודה" per project;
  continue behavior sets the clicked project as Active Work and routes to
  `/studio/workstation`; the Active Work banner renders name, "תיק פעיל",
  "נפתח להמשך עבודה", item count, direction status, and both actions;
  "שמור גרסה חדשה" disabled without stones; saving a new Work File still
  works (6E behavior, count +1, becomes Active); only pre-existing storage
  keys in use; `/studio/design`, `/studio/workstation` and `/studio/projects`
  (with the strip) all mount.
- **Clean 6E regression suite — 22/22 passed.**
- **Clean 6D regression suite — 22/22 passed.**
- **Export-removal proof** (`comm -23`) on all three edited files: none.
- **Forbidden-token scan on new lines only:** clean (single hit is a code
  comment; no code touches storage directly).
- **Brace/bracket balance** on all five changed code files; `wsLabels.js`
  passes `node --check`.

## Confirmations

- **`/studio/design` was not touched** — `pages/studio/design.js` and the
  entire `components/studio/design/shell/` folder are `cmp`-proven
  byte-identical to the baseline.
- **Protected stores were not edited** — `designProjects.js`, `workTray.js`,
  `designBriefStore.js`, `designDraft.js`, `activeWorkStore.js` all
  `cmp`-proven byte-identical, as are `package.json`,
  `DesignProjectsLibrary.js` and `tokens.js`.


## QA fix applied before upload

`WorkstationShell.js` now uses the direct public `setConcepts` / `selectConcept` exports when it needs the next brief object for Active Work sync. The React hook methods still update UI state, but they do not return the next brief object; using the direct exports prevents Active Work from being synced with an empty/incorrect brief after generating or selecting directions. No protected store was edited.

---

## Upload checklist

1. Open the current Vercel-confirmed repo (Clean 6E state).
2. Copy the ZIP contents into the repo root. Expected Git status:
   - *modified*: `pages/studio/projects.js`,
     `components/studio/design/workstation/WorkstationShell.js`,
     `components/studio/design/workstation/wsLabels.js`
   - *added*: `components/studio/projects/ContinueWorkFilesStrip.js`,
     `components/studio/design/workstation/WorkstationActiveWork.js`,
     `CHANGELOG-CLEAN-6F.md`
   If ANY other file shows as modified — stop and report.
3. Commit: `Clean 6F — Continue Work File Flow`.
4. Wait for the Vercel build to pass.
5. Verify in production:
   - `/studio/design` unchanged and working.
   - `/studio/workstation` opens; save a Work File (6E flow).
   - `/studio/projects` opens; the saved file appears in the "תיקי עבודה"
     strip and is marked "תיק פעיל".
   - Click "המשך עבודה" on a file → routed to `/studio/workstation`, the
     banner shows that file's name, count and direction status.
   - "פתח תיקי עבודה" from the banner returns to `/studio/projects`.
   - "שמור גרסה חדשה" creates another Work File and it becomes Active.
   - מחשבון / תעודות / מלאי / קליטה untouched and working.
