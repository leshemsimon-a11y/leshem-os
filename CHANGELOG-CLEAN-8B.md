# CHANGELOG — CLEAN 8B — Work Session Management

**Baseline:** Vercel-confirmed Clean 8A (built on the 7A safe baseline; 7B
remains excluded).
**Scope:** Work File naming, rename, Active Work name visibility, a
confirm-guarded "נקה סטודיו", and terminology cleanup. No redesign of
`/studio/design`, no workstation promotion.

---

## What Clean 8B adds

### 1. Work File name in the Create Flow (`/studio/create`)
Step 1 now opens with **"שם תיק העבודה"** (placeholder
"לדוגמה: טבעת קלאסטר אמרלד ללקוחה"). If left empty, a smart default is
built from the choices — e.g. **"תיק עיצוב · טבעת · קלאסטר"** — with a
date/time fallback when nothing was chosen. Saving uses this name, and the
success state shows **"נשמר בשם: [השם]"**.
(Note: the 8A default prefix "תיק יצירה" is replaced by the spec'd
"תיק עיצוב · …" default; the Create-Flow origin marker in `brief.notes`
remains.)

### 2. Rename Work File (`/studio/projects`)
Each card gains **"שנה שם"** → inline input → **"שמור שם"** (or ביטול).
Persistence goes through the EXISTING public `updateProject(id, { name })`;
the projects hook refreshes automatically via the store's own event.
**No missing API — no store internals touched.** Empty names are ignored;
input is trimmed; everything else on the Work File stays intact.

### 3. Active Work name visibility (`/studio/design`)
The 7A chip (same insertion point) now shows: **"תיק פעיל"** · the Work File
name · item count · an explicit **"פתח תיקי עבודה"** link (previously the
link was the whole chip with a tooltip only).

### 4. "נקה סטודיו" (`/studio/design`)
A quiet button in the same chip row. Before clearing, the EXACT browser
confirm:
"ניקוי הסטודיו יסיר את העבודה הפעילה, האבנים, תפריט העיצוב וכיווני העיצוב
מהמסך. תיקי עבודה שמורים לא יימחקו. להמשיך?"
On confirm it clears ONLY the live session through existing public APIs:
the Work Tray (`tray.clear` → `clearTray`), the full design brief — תפריט
עיצוב, כיווני עיצוב, כיוון נבחר and outputs (`briefStore.clear` →
`clearBrief`), and the Active Work pointer (`clearActiveWork`), then shows a
reassuring toast. **Saved Work Files, inventory and uploaded assets are
never touched — nothing is deleted from any store.**
**No missing reset API — everything needed exists publicly.**

### 5. Terminology cleanup (`lib/studio/labels.js` — values only)
All six visible occurrences updated (proven by diff to be the ONLY changes
in the file; no keys renamed, no variables touched):
- `BRIEF_HE.intentionLabel`, `SNAPSHOT_HE.intention`,
  `INTENT_HE.drawerTitle`, `INTENT_HE.openIntent` — "כוונת עיצוב" →
  **"תפריט עיצוב"**
- `SNAPSHOT_HE.status.draftBody` — "…וכוונת עיצוב לתקציר" →
  "…ותפריט עיצוב לתקציר"
- `INTENT_HE.summaryEmpty` — "הגדר כוונת עיצוב" → **"פתח תפריט עיצוב"**
  (also avoids the banned "הגדרה" family for this surface)
No occurrences of "כוונות עיצוב" or "כוונה נבחרת" existed; "כיווני עיצוב" /
"כיוון נבחר" were already canonical since 6B.1.

### 6. Dashboard
Untouched — "צור תכשיט חדש" and "פתח סטודיו עיצוב" both remain as in 8A
(no copy issues found there).

---

## Files changed (6)

1. `components/studio/create/CreateFlowShell.js` — edited (name field,
   smart default, success name).
2. `components/studio/projects/WorkFilesPanel.js` — edited (inline rename UI;
   persistence stays in the caller).
3. `pages/studio/projects.js` — edited (rename handler via public
   `updateProject`).
4. `components/studio/design/shell/StudioShell.js` — minimal additive edit
   (**63 added / 1 removed** — the removed line is the hook destructure
   extended to include the existing `clearActiveWork`): explicit
   open-projects link on the chip, "נקה סטודיו" + handler + styles.
5. `lib/studio/labels.js` — 6 string VALUES swapped (diff-proven exact).
6. `CHANGELOG-CLEAN-8B.md` (this file).

## Missing public APIs

**None.** Rename uses the existing `updateProject`; clearing uses the
existing `clearTray` / `clearBrief` / `clearActiveWork` — all session parts
(Active Work, tray, design menu, directions, selection, outputs) are
clearable through public APIs.

---

## QA summary (all run against the delivered tree)

- **Clean 8B sandbox suite — 31/31 passed** against the real modules:
  rename persists (trimmed) through the public API, keeps stones/selection
  intact, ignores empty names; the clear flow asks the EXACT confirm text,
  declining changes nothing, accepting empties the tray, resets the full
  brief (menu, directions, selection), clears Active Work — and the saved
  Work Files are proven untouched; name logic — user name wins, smart
  default equals "תיק עיצוב · טבעת · קלאסטר", partial and date fallbacks,
  save persists the smart name; cards show both names + two "שנה שם"
  actions; create-shell and studio-shell wiring proven (exact labels,
  confirm text, public-API-only clear); terminology proven at both the
  source level (zero "כוונת עיצוב" values remain) and the import level
  (`INTENT_HE` / `SNAPSHOT_HE` / `BRIEF_HE` now read "תפריט עיצוב");
  `/studio`, `/studio/create`, `/studio/design`, `/studio/projects`,
  `/studio/workstation` all mount; only pre-existing persistence keys.
- **Regressions:** 8A 41/41, 7A 33/33, 6G 19/19, 6F 20/20, 6E 22/22,
  6D 22/22.
- **labels.js diff** — exactly the 6 value swaps, nothing else.
- **Forbidden-token scan** on all new lines: clean.
- **Brace balance** on all five changed files; labels passes `node --check`.

## Confirmations

- **No protected stores were edited** — `designProjects.js`, `workTray.js`,
  `designBriefStore.js`, `designDraft.js`, `activeWorkStore.js` all
  `cmp`-proven byte-identical to baseline.
- **No packages were added** — `package.json` byte-identical.
- `/studio/design` was NOT redesigned — one small additive chip-row edit at
  the same 7A insertion point; `pages/studio/design.js` byte-identical.
- `/studio/workstation` untouched and not promoted.

---

## Upload checklist

1. Open the current Vercel-confirmed repo (Clean 8A state).
2. Copy the ZIP contents into the repo root. Expected Git status:
   - *modified*: `components/studio/create/CreateFlowShell.js`,
     `components/studio/projects/WorkFilesPanel.js`,
     `pages/studio/projects.js`,
     `components/studio/design/shell/StudioShell.js`,
     `lib/studio/labels.js`
   - *added*: `CHANGELOG-CLEAN-8B.md`
   If ANY other file shows as modified — stop and report.
3. Commit: `Clean 8B — Work Session Management`.
4. Wait for the Vercel build to pass.
5. Verify in production:
   - `/studio/create`: name field at step 1; leave empty → save → success
     shows "נשמר בשם: תיק עיצוב · …"; enter a name → it's used.
   - `/studio/projects`: the name shows; "שנה שם" → edit → "שמור שם" —
     the card updates.
   - `/studio/design`: the chip shows תיק פעיל · name · פתח תיקי עבודה;
     "נקה סטודיו" asks the confirm, then empties the tray/menu/directions
     while `/studio/projects` still shows every saved file.
   - The intent drawer / chip now reads "תפריט עיצוב" everywhere.
   - `/studio/workstation` still direct-URL only.
   - מחשבון / תעודות / מלאי / קליטה untouched and working.
