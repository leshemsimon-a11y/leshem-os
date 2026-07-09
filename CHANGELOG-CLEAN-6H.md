# CHANGELOG — CLEAN 6H — Active Work Resume in Stable Studio

**Baseline:** Vercel-confirmed Clean 6G GitHub export
(md5 1d4fa8912eb058fdabb94217f253d078), inspected before any code.
**Scope:** make the Active Work (תיק פעיל) visible and useful inside the
STABLE `/studio/design` — no redesign, no hydration, no store edits.
`/studio/design` remains the primary Studio; `/studio/workstation` remains
sandbox-only and is not promoted or referenced by anything new.

## Inspection findings that shaped this patch
• The stable shell already tracks Active Work and its save action ALREADY
  updates the active project (updateProject + "עודכן" toast) — so "save
  clarity" is purely a label fix that now matches existing behavior.
• `clearActiveWork()` already exists as a safe public export — so
  "נקה תיק פעיל" ships (clears the pointer only; the file stays saved).
• `/studio/projects` already has "תיק פעיל" + "המשך עבודה" → /studio/design
  from Clean 6G — left completely untouched (no duplication).
• The dashboard already reads Active Work safely and has a continue action —
  part 4 became a one-string label clarification on the existing button.

## Files changed (4)
1. NEW `components/studio/design/shell/ActiveWorkBanner.js` — compact
   presentational banner: "תיק פעיל" badge, project name, and the SAVED
   file's own stats — אבנים (count), בריף (יש/—), כיוון נבחר (יש/—) — plus
   "פתח תיקי עבודה" and "נקה תיק פעיל". No store imports, no state, no
   routing inside. Honesty by design: the stats describe the saved Work
   File, not the live session (no hydration this milestone). Hebrew labels
   are local native literals — labels.js is outside this milestone's
   approved file list (Clean 6G dashboard precedent).
2. `components/studio/design/shell/StudioShell.js` — ONE additive block at
   the safe insertion point (between the top row and the middle grid):
   renders the banner when an active project exists, wired through existing
   exports only (getProject, clearActiveWork, router.push). No structural
   change anywhere else in the shell.
3. `components/studio/design/shell/StudioCommandBar.js` — the SAME single
   save button now reads "שמור עדכון בתיק פעיל" when Active Work exists and
   "שמור תיק עבודה" otherwise. Save logic untouched; no duplicate button.
4. `components/studio/shell/UnifiedDashboard.js` — the existing active-work
   continue button now reads "המשך תיק פעיל" (+ project name in the
   tooltip). Same button, same pre-existing openProject flow, same
   /studio/design route. Other branches untouched.

## NOT changed (cmp-proven byte-identical)
workTray.js, designDraft.js, designBriefStore.js, designProjects.js,
activeWorkStore.js, labels.js, DesignConceptPanel.js, pages/studio/design.js,
pages/studio/projects.js, pages/studio/workstation.js, package.json.
No APIs, no Airtable, no pricing, no certificates, no render engine, no new
packages, no new persistence keys, no store hydration, no schema changes.

Carry-forward note (unchanged from 6G disclosure): the internal header
comment in ContinueWorkFilesStrip.js still mentions the old workstation
route — that file is outside this milestone's approved list, so the one-line
comment fix remains queued for a milestone that includes it.

## Offline QA run
• Exactly 4 changed files (diff -rq proof) + this changelog.
• comm -23 export proofs — 0 exports removed anywhere.
• Brace/bracket balance clean; all imports resolve.
• Forbidden-token scan on new lines (incl. a no-"workstation" check on all
  6H additions) — clean.
• Logic sandbox vs REAL stores — 15/15: set/get/clear Active Work; saved
  project round-trip; banner stats verified against the exact source
  (including graceful missing-field handling); save-label switch; dashboard
  label + unchanged flow. One sandbox iteration fixed TEST DATA, not code:
  normalizeBrief correctly drops an orphaned selectedConceptId, so the test
  now mirrors real saved projects (selection + its concept together).
• Honest disclosure: no offline `next build` — Vercel is the final gate.

## Upload checklist (matches the milestone QA list)
1. Upload to repo root (1:1 paths): ActiveWorkBanner.js (new),
   StudioShell.js, StudioCommandBar.js, UnifiedDashboard.js (overwrites).
2. Vercel green. Then: /studio opens; /studio/design opens;
   /studio/projects opens.
3. From projects, "המשך עבודה" routes to /studio/design and the banner
   appears with the project name, אבנים / בריף / כיוון נבחר stats.
4. "פתח תיקי עבודה" routes back to /studio/projects; "נקה תיק פעיל"
   removes the banner (the file remains in the library).
5. Save with no active work: "שמור תיק עבודה" creates a file; with active
   work: button reads "שמור עדכון בתיק פעיל" and updates the same file
   (existing behavior, now labeled truthfully).
6. Dashboard with active work shows "המשך תיק פעיל" → /studio/design.
7. /studio/workstation still opens by direct URL; nothing links to it.
8. On green: export the repo ZIP — it becomes the next baseline.
