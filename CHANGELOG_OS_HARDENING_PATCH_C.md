# Patch C — OS Hardening V1 · One Frame · One Nav · One Active Session

Turns the studio from a set of screens into one session-centered operating
frame. No new stores, no backend/Airtable changes, no schema/route deletions,
no visual-token changes, no protected-store internals touched.

## Files changed (6 — 5 edited, 1 new)

1. `components/studio/shell/NavRail.js`
   Primary nav now shows ONLY built, live destinations as one flat list:
   Command Center · Inventory · Work Tray · Design Studio · תיקי עבודה ·
   Asset Library. All 7 not-yet-built sections (models, render, media,
   calculator, certificates, quotes, settings) are folded into ONE quiet
   collapsed «כלים עתידיים» area, closed by default — still reachable, no
   «בקרוב» spam, nothing deleted from navConfig.js, no routes removed.
   Work Tray count badge unchanged.

2. `components/studio/shell/ActiveSessionBar.js` — NEW
   One compact, persistent session context row mounted by the app frame.
   Read-only over existing stores (activeWorkStore, designProjects,
   workTray, designBriefStore). States:
   · active project → «תיק עבודה פעיל» + name + tray-count chip +
     «כיוון נבחר» chip when relevant + CTA «המשך עבודה» → /studio/design
   · stones, no project → «X אבנים במגש» + CTA «פתח סטודיו»
   · nothing → «אין תיק פעיל» + CTA «התחל מהמלאי» → /studio/inventory
   CTA hides when already on its destination. The bar self-hides on
   /studio/design (the workstation has its own command bar — no doubling)
   and before hydration (no SSR flash). Navigation only — restore logic
   stays where it already lives.

3. `components/studio/shell/StudioShell.js` (app frame)
   Mounts ActiveSessionBar: desktop (non-fullBleed pages, above content,
   beside the existing WorkTrayIndicator) and mobile (top of content).
   Nothing else changed.

4. `components/studio/shell/UnifiedDashboard.js` (Command Center)
   · Quick Launch de-duplicated: the Design Studio appeared TWICE
     (newDesign + design → same route); now once, and תיקי עבודה added.
   · The dead disabled «דוחות — בקרוב» tile removed from Quick Launch.
   · Command header is now a real launch/resume surface with four states:
     active session → «המשך עבודה» (same existing openProject restore flow);
     stones only → «פתח סטודיו»; saved sessions only → «המשך עבודה» on the
     most recently updated saved session (by updatedAt, read-only); nothing
     → «התחל מהמלאי». Status line names the state («אין תיק פעיל» /
     «X אבנים במגש» / active project name).
   · Design Pipeline shows only the real backbone stages (מלאי → מגש →
     סטודיו → קונספטים); the future «מוצר · בקרוב» stage removed.
   · Next Actions: the «דוחות להשלמה — בקרוב» card replaced by a REAL
     number — «תיקי עבודה שמורים» → /studio/projects.

5. `lib/studio/labels.js`
   · UI_HE.nav.projects visible VALUE changed to «תיקי עבודה» (key name,
     routes, store files, and storage keys all unchanged).
   · Additive keys only elsewhere: UI_HE.navFutureTools / navFutureToolsHint;
     COMMAND_CENTER_HE noActiveSession / startFromInventory / openStudio /
     stonesInTray / resumeLatest + quickLaunch.projects +
     nextAction.savedSessions; new export SESSION_BAR_HE.
     Zero keys removed or renamed (proof run in QA).

## Intentionally not touched
navConfig.js, all store internals (workTray, designProjects, designBriefStore,
designDraft, activeWorkStore), DesignConceptPanel, DesignOutputPanel,
AssetPicker, the Design Studio workstation shell, WorkTrayIndicator, shared
tokens, Airtable/API, pricing, calculator, certificates/reports, render,
catalog, Copilot, /mvp, /v2. No routes deleted — future pages remain
reachable by URL and via the collapsed «כלים עתידיים» section.

## Limitations
- The Active Session Bar's «המשך עבודה» navigates only; full restore
  (tray + brief replacement) remains in the Command Center header and the
  Projects library, as before. This avoids silently overwriting unsaved
  live work from a persistent bar.
- «Latest session» resume uses updatedAt; two sessions saved in the same
  millisecond tie-break to the most recently created.
- Real `next build` cannot run offline — Vercel confirmation required.

## Upload checklist
1. Upload the 6 files at their exact paths (root-ready, no wrapper).
2. Deploy on Vercel; confirm build passes.
3. Smoke: nav shows 6 live items + collapsed «כלים עתידיים» (opens/closes);
   nav label reads «תיקי עבודה»; session bar visible on /studio,
   /studio/inventory, /studio/tray, /studio/projects, /studio/assets and
   absent on /studio/design; bar states cycle (empty → tray stones →
   active session) as you run: Inventory → add stone → tray count updates
   in nav + bar → open studio → generate concepts → select → שמור תיק
   עבודה → bar + Command Center show the active session → Command Center
   «המשך עבודה» reopens it; saved session appears in /studio/projects and
   in the «תיקי עבודה שמורים» count.
