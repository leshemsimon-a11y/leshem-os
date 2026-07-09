# CHANGELOG — CLEAN 6G — Stable Studio Product Loop

**Baseline:** Vercel-confirmed Clean 6F state.
**Scope:** approved Option 1 — safe product-loop integration only. The
stable `/studio/design` remains the primary Studio; `/studio/workstation`
stays a sandbox reachable by direct URL only (not deleted, not promoted).

Loop now: Studio dashboard → `/studio/design` → save (existing Studio save
action, unchanged) → `/studio/projects` → "המשך עבודה" → back to
`/studio/design`.

---

## What Clean 6G changes

1. **Dashboard (`/studio`)** — the primary quick-launch tile now reads
   **"פתח סטודיו עיצוב"** with helper text
   **"עבודה על אבנים נבחרות, כיווני עיצוב ושמירת תיק עבודה"**. The route was
   already `/studio/design` and is unchanged. Implemented as a local label
   override inside `UnifiedDashboard.js` — `lib/studio/labels.js` untouched.
   No dashboard entry for `/studio/workstation`.
2. **Stable Studio (`/studio/design`)** — per approved Option 1: NOT touched.
   The existing compact save action ("שמור תיק עבודה" in the command bar) and
   its semantics are unchanged. No duplicate save button was added. The
   entire `components/studio/design/shell/` folder and
   `pages/studio/design.js` are `cmp`-proven byte-identical.
3. **Projects (`/studio/projects`)** — "המשך עבודה" still sets the selected
   project as Active Work (existing `setActiveWorkId`) and now routes to
   **`/studio/design`** instead of the workstation. The Active Work is still
   marked **"תיק פעיל"**. No tray/brief hydration (unchanged from 6F).
4. **Approved copy fix** — one UI string in `ContinueWorkFilesStrip.js`:
   the hint now reads "בחירת תיק ממשיכה את העבודה **בסטודיו** — בלי לשנות את
   המגש הנוכחי."

No protected store edits, no packages, no APIs, no Airtable, no pricing,
no certificates, no render engine, no new persistence keys.

Known cosmetic note (disclosed, not changed): the strip file's internal
header comment still mentions the old workstation route — the approval was
for one UI-string fix only, so the comment was left as-is; happy to fold a
one-line comment correction into the next milestone.

---

## Files changed (4)

1. `components/studio/shell/UnifiedDashboard.js` — edited (approved as the
   real dashboard surface): local `STUDIO_CTA_HE` label + helper on the
   primary tile only, one `quickHelper` style. Route untouched.
2. `pages/studio/projects.js` — edited: continue route →
   `/studio/design`; comment updated to match.
3. `components/studio/projects/ContinueWorkFilesStrip.js` — edited: the
   single approved hint-string fix.
4. `CHANGELOG-CLEAN-6G.md` (this file).

---

## QA summary (all run against the delivered tree)

- **Clean 6G sandbox suite — 19/19 passed** against the real modules:
  dashboard mounts; label "פתח סטודיו עיצוב" + helper present and wired to
  the PRIMARY tile render path only; primary route proven unchanged
  (`/studio/design`); zero `/studio/workstation` references on dashboard code
  lines; `/studio` page mounts; a Work File saved through the existing API
  appears in the "תיקי עבודה" strip; "המשך עבודה" sets it as Active Work and
  routes to `/studio/design`; active file marked "תיק פעיל"; neutral Studio
  hint wording in place; `/studio/design`, `/studio/workstation` and
  `/studio/projects` all mount; only pre-existing persistence keys in use.
- **Regressions:** Clean 6F suite 20/20, Clean 6E suite 22/22, Clean 6D
  suite 22/22 — all passed on the 6G tree.
- **Export-removal proof** (`comm -23`) on all three edited files: none.
- **Forbidden-token scan on new lines only:** every new line reviewed and
  printed in QA — approved scope only; clean of commerce language, Airtable,
  pricing, certificates, `\uXXXX`, storage access.
- **Brace/bracket balance** on all three edited files.

## Confirmations

- **Protected stores were not edited** — `designProjects.js`, `workTray.js`,
  `designBriefStore.js`, `designDraft.js`, `activeWorkStore.js`,
  `package.json`, `lib/studio/labels.js`, `DesignProjectsLibrary.js`, the app
  `StudioShell.js` and `navConfig.js` are all `cmp`-proven byte-identical.
- **`/studio/design` was not redesigned or touched** — `pages/studio/design.js`
  and the entire `components/studio/design/shell/` folder are `cmp`-proven
  byte-identical; save semantics unchanged.

---

## Upload checklist

1. Open the current Vercel-confirmed repo (Clean 6F state).
2. Copy the ZIP contents into the repo root. Expected Git status:
   - *modified*: `components/studio/shell/UnifiedDashboard.js`,
     `pages/studio/projects.js`,
     `components/studio/projects/ContinueWorkFilesStrip.js`
   - *added*: `CHANGELOG-CLEAN-6G.md`
   If ANY other file shows as modified — stop and report.
3. Commit: `Clean 6G — Stable Studio Product Loop`.
4. Wait for the Vercel build to pass.
5. Verify in production:
   - `/studio` shows the primary tile "פתח סטודיו עיצוב" with the helper
     line, opening `/studio/design`; no workstation tile anywhere.
   - `/studio/design` unchanged — existing save action works as before.
   - Save a Work File in the Studio → `/studio/projects` shows it in the
     "תיקי עבודה" strip, marked "תיק פעיל".
   - "המשך עבודה" routes back to `/studio/design` with that file as the
     Active Work.
   - `/studio/workstation` still opens by direct URL only.
   - מחשבון / תעודות / מלאי / קליטה untouched and working.
