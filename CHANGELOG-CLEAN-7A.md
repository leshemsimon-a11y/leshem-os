# CHANGELOG — CLEAN 7A — Work File Backbone MVP

**Baseline:** Vercel-confirmed Clean 6G state.
**Scope:** product-backbone sprint. Work Files become the central object of
the loop: Inventory/Tray → stable Studio → Save Work File → Projects →
Continue Work (with REAL restored context) → back in the Studio → Output
Pack. `/studio/design` remains the main Studio; `/studio/workstation`
remains a direct-URL sandbox. Text-based media output only — no image
generation, no render engine, no external API.

---

## What Clean 7A adds

### 1. Real Continue Work (`/studio/projects`)
"המשך עבודה" now performs a FULL restore through existing public APIs only —
the exact pattern the projects library's own open flow already uses:
`tray.replace(project.trayItems)` + `brief.set(project.brief)` (restoring
stones, the whole design menu, generated directions, the selected direction,
and outputs, since they all live on the saved brief), then
`setActiveWorkId(project.id)` and route to `/studio/design`. If the current
session holds work (stones or a chosen product type), a browser confirm is
shown first with the exact text:
"פתיחת תיק העבודה תחליף את העבודה הנוכחית בסטודיו. להמשיך?"
**No public API gap was found — no store internals were touched.**

### 2. Active Work indicator in the stable Studio
A compact chip in the Studio canvas-header chip row (next to the existing
intent chip): badge **"תיק פעיל"** · project name · stone/item count; tapping
it opens `/studio/projects`. Implemented as the smallest safe insertion —
one additive edit inside the design shell using the `activeProject` it
already resolves. **66 added lines, zero removed** (the single changed line
is the label import gaining `PROJECTS_HE`). No restructure; every other file
in `components/studio/design/shell/` is byte-identical.

### 3. Work File context expansion (`/studio/projects`)
The 6F strip is superseded by the richer **WorkFilesPanel**: each card shows
name, created/updated dates (he-IL), stone/item count, product type, style,
selected direction title, brief/output status, the **"תיק פעיל"** badge, and
the two actions — "המשך עבודה" and "פתח חבילת פלט". Compact rows, no
redesign. (`ContinueWorkFilesStrip.js` remains on disk untouched and unused —
flagged as a deletion candidate for a future cleanup milestone.)

### 4. Output Pack — "פתח חבילת פלט"
Opens an overlay built entirely from data the Work File already holds, via
the new pure helper `lib/studio/outputPack.js`:
- **A. סיכום מקצועי (Hebrew):** what is being designed, stones/items with
  roles and carats, style/metal, selected direction + its description and
  layout, design notes, output status.
- **B. Media Prompt (ENGLISH ONLY):** a clean visualization prompt built
  exclusively from canonical English enum values (product type, style,
  metal, stone shape/type/carat/role) — non-ASCII (Hebrew) stone fields are
  filtered out by design, so Hebrew can never leak into the prompt. Includes
  a native-clipboard "העתק פרומפט" action and an honest note that output is
  text-only at this stage.
- **C. תיאור ללקוח (Hebrew):** a short polished client-facing description.
- **רפרנסים:** projects have no dedicated reference field (no schema change
  made); existing `linkedAssetFileIds` counts are shown when present,
  otherwise the placeholder "עדיין לא נוספו רפרנסים לתיק זה". No upload.

### 5. Save behavior
Untouched. The existing Studio save action and semantics are exactly as
before; no duplicate save buttons anywhere.

---

## Files changed (6)

1. `pages/studio/projects.js` — edited: real-restore continue with confirm,
   WorkFilesPanel + OutputPackPanel wiring.
2. `components/studio/design/shell/StudioShell.js` — minimal additive edit:
   the Active Work chip (66 added lines / 0 removed; import line extended).
3. `lib/studio/outputPack.js` — NEW pure formatting helper (no storage).
4. `components/studio/projects/WorkFilesPanel.js` — NEW presentational panel.
5. `components/studio/projects/OutputPackPanel.js` — NEW presentational
   overlay.
6. `CHANGELOG-CLEAN-7A.md` (this file).

## Public API gaps found

**None.** Tray restore (`replaceTray` / hook `replace`), brief restore
(`setBrief` / hook `set`), Active Work (`get/setActiveWorkId`), and output
reading (`getSelectedConcept`, `getActiveOutput`) are all existing public
exports.

---

## QA summary (all run against the delivered tree)

- **Clean 7A sandbox suite — 33/33 passed** against the real modules:
  existing projects still appear; Output Pack Hebrew summary includes
  product, stones with roles/carats, selected direction, notes and output
  status; English prompt includes product/style/metal/stone details, is
  verified to contain ZERO Hebrew characters, and Hebrew-valued stone fields
  are proven filtered out; short Hebrew client description; references
  placeholder; Work File cards show count/product/style/direction/output
  status/dates + "תיק פעיל" + both actions; Output Pack overlay renders all
  four sections with the copy action and the honest text-only note; continue
  shows the exact Hebrew confirm — declining changes nothing, accepting
  restores the tray AND the brief (menu + selected direction verified),
  sets Active Work and routes to `/studio/design`; the Studio chip wiring is
  proven (badge, name, count, projects link, active-only render) and
  `/studio/design` mounts with the edited shell; `/studio`,
  `/studio/projects` and `/studio/workstation` all mount; only pre-existing
  persistence keys in use.
- **Regressions:** Clean 6G 19/19, Clean 6F 20/20, Clean 6E 22/22, Clean 6D
  22/22 — all passed on the 7A tree.
- **Export-removal proof** (`comm -23`) on both edited files: none removed.
- **Forbidden-token scan** on new lines + new files: clean — no commerce
  language, no Airtable/external APIs, no pricing, no certificates, no
  render engine, no direct storage, no new keys, no packages.
- **Brace balance** on all five changed/new files; the helper passes
  `node --check`.

## Confirmations

- **Store internals were not edited** — `designProjects.js`, `workTray.js`,
  `designBriefStore.js`, `designDraft.js`, `activeWorkStore.js`,
  `package.json`, `labels.js`, `DesignProjectsLibrary.js` all `cmp`-proven
  byte-identical to baseline.
- **`/studio/design` was not redesigned** — the only Studio change is the
  additive Active Work chip in the existing chip row; save behavior,
  layout, and every other design-shell file are byte-identical.

---

## Upload checklist

1. Open the current Vercel-confirmed repo (Clean 6G state).
2. Copy the ZIP contents into the repo root. Expected Git status:
   - *modified*: `pages/studio/projects.js`,
     `components/studio/design/shell/StudioShell.js`
   - *added*: `lib/studio/outputPack.js`,
     `components/studio/projects/WorkFilesPanel.js`,
     `components/studio/projects/OutputPackPanel.js`,
     `CHANGELOG-CLEAN-7A.md`
   If ANY other file shows as modified — stop and report.
3. Commit: `Clean 7A — Work File Backbone MVP`.
4. Wait for the Vercel build to pass.
5. Verify in production:
   - `/studio` opens; `/studio/design` opens with everything working.
   - Save a Work File in the Studio; the "תיק פעיל" chip appears in the
     canvas header with name + count; tapping it opens `/studio/projects`.
   - The Work File card shows the richer context lines.
   - "המשך עבודה" on a different file → Hebrew confirm → accepting loads its
     stones + design menu + selected direction into the Studio.
   - "פתח חבילת פלט" → overlay with the Hebrew summary, the English prompt
     (copy works), the client description, and the רפרנסים placeholder.
   - `/studio/workstation` still opens by direct URL only.
   - מחשבון / תעודות / מלאי / קליטה untouched and working.
