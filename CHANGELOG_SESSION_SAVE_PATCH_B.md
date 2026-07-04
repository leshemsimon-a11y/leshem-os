# Patch B — Session Save / Project Birth

Core Workflow Wiring V1, step 2. The live Design Studio can now save the
current design session as a real Design Project (תיק עבודה), closing the loop:

Inventory → Work Tray → Design Studio → Direction → Concepts → Select Concept
→ **שמור תיק עבודה** → project exists in /studio/projects and Command Center.

Local only — localStorage-backed designProjects store. No Airtable, no
network, no new packages, no schema changes, no store internals touched.

## Files changed (3)

1. `components/studio/design/shell/StudioShell.js`
   - New save-session handler (create vs update) using EXISTING exports only:
     `buildDesignSnapshot`, `briefHasContent`, `trayItemTitle` (designDraft),
     `saveProject` (via existing `projectsStore.save`), `updateProject`,
     `getProject` (designProjects), `setActiveWork` (activeWorkStore hook).
   - Replaced the local read-once activeWork helper with the EXISTING
     event-synced `createUseActiveWork` hook (same localStorage key, same
     store) so the command-bar status pill reflects a save immediately.
   - Passes `onSaveSession` / `canSaveSession` to StudioCommandBar.

2. `components/studio/design/shell/StudioCommandBar.js`
   - Renders one compact «שמור תיק עבודה» button (presentation only; logic
     stays in the shell). Disabled ONLY when there is genuinely nothing to
     save (empty tray + empty brief), with a short tooltip. App-name text now
     truncates gracefully in the narrow column.

3. `lib/studio/labels.js`
   - ADDITIVE keys only in STUDIO_5D_HE: `saveSession`, `saveSessionAria`,
     `saveSessionEmptyHint`, `toastSessionSaved`, `toastSessionUpdated`,
     `defaultSessionTitlePrefix`, `defaultSessionTitleFallback`.
     No existing key removed, renamed, or repurposed (proof run in QA).

## Behavior

- **Create** (no valid active project): builds the computed snapshot, creates
  a project with default title «תיק עבודה — [סוג מוצר] [אבן מרכזית]»
  (fallback «תיק עבודה חדש»), sets it as Active Work, toasts
  «תיק העבודה נשמר».
- **Update** (activeWorkId points to an existing project): updates that
  project in place — trayItems + brief + snapshot — name preserved,
  `updatedAt` stamped, toasts «תיק העבודה עודכן». No duplicates on repeated
  save. A stale/deleted active pointer safely falls back to create.
- **What is saved**: tray items (center stones as separate items, roles
  intact), full brief (including concepts, selectedConceptId,
  conceptsSignature, designOutputs — already part of the brief schema), the
  computed design snapshot, and store-stamped createdAt/updatedAt + status.
- **Where it appears**: /studio/projects (DesignProjectsLibrary) and the
  Command Center active-project header — both read the same store and were
  NOT modified.
- **Restore**: the EXISTING open flows (Projects library `doOpen`, Command
  Center `openProject`) already restore tray + brief (including selected
  concept) and route back into the studio. Unchanged; verified by sandbox
  round-trip of the saved payload through `normalizeBrief`.

## Not touched

designProjects.js / designBriefStore.js / workTray.js / designDraft.js /
activeWorkStore.js internals, DesignConceptPanel, DesignOutputPanel,
AssetPicker, DesignProjectsLibrary, UnifiedDashboard, shared tokens,
Airtable/API/backend, pricing, certificates/reports, render, catalog,
Copilot, /mvp, /v2. No visual redesign.

## Limitations

- Default title computed at creation only; update preserves the existing
  name (renaming lives in the Projects library, as before).
- No autosave; changes after a save persist on the next explicit save.
- Offline QA cannot run a real `next build` — Vercel deployment confirmation
  required before this becomes the next baseline.

## Upload checklist

1. Upload the 3 changed files at their exact paths (root-ready, no wrapper).
2. Deploy on Vercel; confirm build passes.
3. Smoke: Inventory → add stone → Design Studio shows it → choose direction
   → generate concepts → select concept → «שמור תיק עבודה» → toast →
   status pill turns «עבודה פעילה» → project visible in /studio/projects →
   save again → «תיק העבודה עודכן», still one project → open project from
   the library → tray + brief + selected concept restored.
