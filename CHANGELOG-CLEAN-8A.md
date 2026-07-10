# CHANGELOG — CLEAN 8A — Create Flow MVP

**Baseline:** Clean 7A (the stable Vercel-confirmed baseline).
**Clean 7B was abandoned and is NOT part of this delivery** — this milestone
was built directly on the 7A tree, verified byte-for-byte before work began
(every 7B change reverted, every 7B file absent).

**Scope:** a new guided, mobile-friendly creation flow at `/studio/create` —
describe the piece, use real Work Tray stones, pick style and product type,
generate 3 local structured design directions, save a Work File, and get an
initial Output Pack. Text-based directions and prompts only; no image
generation, no external AI, no render engine.

---

## What Clean 8A adds

### `/studio/create` — guided wizard (7 steps)
1. **מה ניצור?** — טבעת / תליון / עגילים / צמיד / שרשרת / תכשיט קלאסטר / אחר
2. **באיזה סגנון?** — קלאסי / מודרני / עדין / יוקרתי / וינטג׳ / קלאסטר /
   מינימליסטי / חופשי־פתוח
3. **אבני עבודה** — the REAL Work Tray items (name, role, shape, carat,
   thumbnail). Empty state: "עדיין לא נבחרו אבנים…" + a למלאי action. No new
   inventory selection (per spec).
4. **רפרנסים** — text area with the exact placeholder + helper
   "בשלב הבא נחבר העלאת קבצים אמיתית." (no real upload this milestone).
5. **מה חשוב לך בעיצוב?** — free request with the exact example placeholder.
6. **צור כיווני עיצוב** — 3 LOCAL deterministic directions
   (`lib/studio/createFlow.js`), each with a title, Hebrew explanation,
   stone usage, design logic, production note, and an English media-prompt
   hint. Non-generic by construction: they name the actual stones
   (name/shape/carat), honor the chosen product+style, echo the reference
   ("בהשראת הרפרנס…") and the request ("בהתאם לבקשה…"), and switch to
   cluster logic whenever style/product is קלאסטר or 2+ stones exist
   (classic-cluster / spread-constellation / contrast archetypes). A
   direction can be selected (optional).
7. **שמור כתיק עבודה** + Output Pack preview — saving uses the EXISTING
   public `designProjects.save` with name `תיק יצירה · [סוג] · [תאריך]`, the
   real tray items, a VALID brief, and the standard snapshot
   (`buildDesignSnapshot`), then `setActiveWorkId`. Success state
   "התיק נוצר ונשמר" with: "פתח תיקי עבודה" → `/studio/projects`,
   "פתח בסטודיו" → `/studio/design`, "צור עוד תכשיט" → reset.

### Work File compatibility (no schema change)
The saved brief uses only existing enum values and persisted fields:
`productType`/`styleDirection` map to the closest valid enums
(תכשיט קלאסטר → `other`, קלאסטר style → `halo`, חופשי → `custom` — full
fidelity kept in the text), the free request lives in `designGoal`, the
reference text in `intention`, and a "נוצר במסלול היצירה (Create Flow)"
marker in `notes`. The 3 directions are stored as **studio-compatible
concepts** (proven to round-trip through the real `normalizeBrief` with the
English hint persisting in the existing `renderBriefText` field), so the
saved file works everywhere: `/studio/projects` cards show its direction and
status, המשך עבודה restores it into the stable Studio with the directions
visible and selectable, and the 7A Output Pack builds from it.

### Output Pack (in-flow, local)
- **A. Hebrew professional summary** — what's being designed, the stones,
  the style, reference + request, the chosen direction, cluster note.
- **B. English media prompt** — jewelry type, gemstone details, style, the
  selected direction's English hint, cluster design language when relevant,
  realistic jewelry-rendering language. Hebrew free-text is referenced
  neutrally ("Follow the attached design reference description…") and NEVER
  embedded — the prompt is proven Hebrew-free.
- **C. Hebrew client description** — short and polished.

### Dashboard
A new prominent tile "צור תכשיט חדש" with the helper
"מסלול מהיר לבחירת אבנים, רפרנסים, כיווני עיצוב ושמירת תיק עבודה" →
`/studio/create`. The existing "פתח סטודיו עיצוב" entry is untouched; still
no workstation promotion.

### Projects page
NOT edited — the 7A page already lists any saved Work File. Create-Flow
origin is visible through the file name prefix "תיק יצירה" (see limitations).

---

## Files changed (5)

1. `pages/studio/create.js` — NEW route (mounts the existing app shell).
2. `components/studio/create/CreateFlowShell.js` — NEW guided wizard
   (local page state only).
3. `lib/studio/createFlow.js` — NEW pure helper (options, direction
   generation, brief builder, output pack).
4. `components/studio/shell/UnifiedDashboard.js` — edited (create tile:
   local labels, small local glyph, render wiring; 6G primary tile behavior
   preserved).
5. `CHANGELOG-CLEAN-8A.md` (this file).

## Known limitations

- **Origin marker is name/notes-based** — the project schema has no origin
  field (and store internals are untouched), so "Create Flow" origin shows
  via the "תיק יצירה" name prefix and a marker in `brief.notes`. A dedicated
  origin field would need an approved additive store change.
- **Enum mapping** — קלאסטר style saves as `halo`, תכשיט קלאסטר as `other`,
  חופשי/פתוח as `custom` (closest valid values; the cluster identity is
  fully carried in the directions and pack text). Adding real
  `cluster` enum values remains the known protected-enum change from 6D.
- **References are text-only** this milestone (per spec); real upload later.
- **Direction generation is local/deterministic** — 3 archetypes seeded by
  the inputs; no external AI by design.
- Public API gaps: **none** — everything needed existed
  (`designProjects.save`, `setActiveWorkId`, tray hook, `normalizeBrief`
  round-trip, `buildDesignSnapshot`).

---

## QA summary (all run against the delivered tree)

- **Clean 8A sandbox suite — 41/41 passed** against the real modules:
  exact option lists (7 products incl. תכשיט קלאסטר, 8 styles incl. קלאסטר);
  cluster context detection; 3 structured distinct directions that name the
  real stone, use cluster logic, echo the request and the reference; English
  hints Hebrew-free with real stone details ("1.52 ct oval sapphire");
  no-stones generation still valid; brief uses valid enums and round-trips
  through the REAL `normalizeBrief` (free text, 3 concepts, selection, and
  the EN hint all survive; `getSelectedConcept` resolves); Output Pack —
  Hebrew summary with product/style/stones/reference/request/direction, EN
  prompt with jewelry/stones/reference/preferences/direction/cluster +
  realistic-rendering language and proven English-only, Hebrew client text;
  save creates the Work File, sets it Active, and the `/studio/projects`
  card shows it with its direction and "תיק פעיל"; all exact UI strings
  wired (step titles, placeholders, helper, buttons, success actions);
  dashboard card wired with the design entry kept and zero workstation
  references; `/studio`, `/studio/create`, `/studio/design`,
  `/studio/projects`, `/studio/workstation` all mount; only pre-existing
  persistence keys.
- **Baseline reversion proof:** before building, the tree was proven equal
  to baseline + 6D + 6E + 6F + 6G + 7A deliveries (latest-wins `cmp` on
  every delivered file; all 7B files absent; every 7B-edited file restored
  to its exact 7A bytes).
- **Regressions:** Clean 7A 33/33, 6G 19/19, 6F 20/20, 6E 22/22, 6D 22/22.
- **Forbidden-token scan** on new lines + new files: clean.
- **Brace balance** on all four changed/new files; the helper passes
  `node --check`.

## Confirmations

- **`/studio/design` was not touched** — `pages/studio/design.js`
  byte-identical to baseline; the design shell folder byte-identical to its
  deployed 7A state (7B's shell edit fully reverted, proven by `cmp`).
- **No protected stores were edited** — `designProjects.js`, `workTray.js`,
  `designBriefStore.js`, `designDraft.js`, `activeWorkStore.js`,
  `labels.js` all `cmp`-proven byte-identical to baseline.
- **No packages were added** — `package.json` byte-identical.
- `/studio/workstation` untouched (still direct-URL only).

---

## Upload checklist

1. Open the current Vercel-confirmed repo — the **Clean 7A** state. If 7B
   was pushed to a branch/preview, do NOT include it; this ZIP applies to
   the 7A tree.
2. Copy the ZIP contents into the repo root. Expected Git status:
   - *modified*: `components/studio/shell/UnifiedDashboard.js`
   - *added*: `pages/studio/create.js`,
     `components/studio/create/CreateFlowShell.js`,
     `lib/studio/createFlow.js`, `CHANGELOG-CLEAN-8A.md`
   If ANY other file shows as modified — stop and report.
3. Commit: `Clean 8A — Create Flow MVP`.
4. Wait for the Vercel build to pass.
5. Verify in production:
   - `/studio` shows "צור תכשיט חדש" (and the untouched "פתח סטודיו עיצוב").
   - `/studio/create` walks through all 7 steps on mobile width; tray stones
     show; empty-tray message appears when the tray is empty.
   - "צור כיווני עיצוב" yields 3 directions naming your stones/style/request;
     select one; the Output Pack preview shows all three sections.
   - "שמור כתיק עבודה" → "התיק נוצר ונשמר"; the three follow-up actions work.
   - `/studio/projects` shows the "תיק יצירה" file with its direction, and
     המשך עבודה restores it into the stable Studio.
   - `/studio/design` behaves exactly as in 7A.
   - מחשבון / תעודות / מלאי / קליטה untouched and working.
