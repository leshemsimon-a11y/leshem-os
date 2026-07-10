// components/studio/design/shell/StudioShell.js
//
// LESHEM.S OS — Design Studio Layout Reset (Clean 5D-R4).
//
// A FULL-VIEWPORT jewelry studio workstation, not a page. Studio Layout
// Reset structure — 4 zones:
//   1. Top Work Tray Ribbon      — StudioCommandBar + StudioStoneStrip
//   2. Left Selected Stone Panel — StudioStonePanel (NEW)
//   3. Center Work Canvas        — step indicator + title, stale banners,
//                                  StudioCanvas, StudioBottomStrip (docked
//                                  to the bottom of this column only)
//   4. Right Inspector           — StudioInspectorDrawer
//
// LOGIC IS PRESERVED. This file only arranges regions and threads them with
// the existing business logic, untouched:
//   • direction inputs + concept cards (generate / select / remove / refresh)
//     are rendered by DesignConceptPanel.
//   • output + structured render brief by DesignOutputPanel.
//   • stale detection uses the SAME conceptsAreStale / outputIsStale helpers.
// The shell performs NO generation and owns NO output mutations; the bottom
// strip and stone strip read store data, and selection routes through the
// same brief store the panels use (single source of truth).
//
// Studio Layout Reset (Clean 5D-R4) — what changed vs Clean 5D-R3:
//   • The vertical icon workflow rail (its own grid column) is gone; the
//     SAME step list/logic now renders as a compact horizontal indicator in
//     the canvas header, alongside a plain-text current-step title. See
//     StudioWorkflowRail.js (repurposed) and the new canvasHeader below.
//   • A NEW left "selected stone" panel (StudioStonePanel.js) occupies that
//     freed column: it shows the active tray-strip selection (image, rows,
//     badges) and one real, wired primary action — Add/Remove Work Tray —
//     using ONLY the existing useWorkTray hook methods (tray.addItem /
//     tray.remove). "Start Design" jumps to the existing 'design' step
//     (setActiveStep). "Create Report" / "More" are honest disabled
//     placeholders — Certificates are out of scope for this pass.
//   • Stone-strip selection (previously wired ONLY for Demo Operating Layer
//     stones) is generalized to a single `selectedItemId` that works for
//     BOTH a real Work Tray selection and a demo one, so "click selects
//     stone and updates inspector" holds regardless of which list is shown.
//     This is the one behavioral generalization in this pass — everything
//     else is layout/visual.
//   • The bottom variant strip now docks to the bottom of the CENTER column
//     only (not the full screen width), so it reads as part of Zone 3.
//   • Palette relit to near-white/graphite via ./studioResetStyle.js — NOT
//     the shared components/studio/shared/tokens.js (kept out of scope
//     deliberately; that file is imported by ~60 files across Inventory/
//     Work Tray/etc.).
//
// Core Workflow Wiring V1 — "One Tray" (Patch A): the silent Demo Operating
// Layer fallback is REMOVED from this shell. The REAL Work Tray
// (lib/studio/workTray.js, via the existing useWorkTray hook) is the single
// source of truth for the stone strip, the left stone panel, and the right
// inspector — the studio shows exactly the stones the user put in the tray,
// or the existing guided empty state (hero) when the tray is empty. The
// hero's "choose stones" action now routes to /studio/inventory (which
// writes to the real tray as of this patch) instead of opening the picker;
// the picker stays reachable from the stone strip's add button. Demo-SOURCED
// tray items (added from the demo inventory screen) still resolve their
// richer inspect view through the EXISTING getDemoInspectStoneFromTrayItem
// helper — per selected item, never as an injected list. No store internals
// were touched; concept/output logic is unchanged.

import * as React from 'react';
import { useRouter } from 'next/router';
import { STUDIO_5D_HE, CONCEPT_HE, USABILITY_D_HE, INTENT_HE, STUDIO_6A_HE, STUDIO_6B1_HE, PROJECTS_HE } from '../../../../lib/studio/labels';
import { createUseWorkTray } from '../../../../lib/studio/workTray';
import { createUseDesignBrief } from '../../../../lib/studio/designBriefStore';
import {
  createUseDesignProjects,
  getProject,
  updateProject,
} from '../../../../lib/studio/designProjects';
import { createUseActiveWork } from '../../../../lib/studio/activeWorkStore';
import {
  getSelectedConcept,
  getActiveOutput,
  conceptsAreStale,
  outputIsStale,
  DESIGN_ROLE,
  normalizeRole,
  buildDesignSnapshot,
  briefHasContent,
  trayItemTitle,
} from '../../../../lib/studio/designDraft';

import DesignConceptPanel from '../DesignConceptPanel';
import DesignOutputPanel from '../DesignOutputPanel';
import AssetPicker from '../../assets/AssetPicker';

import StudioCommandBar from './StudioCommandBar';
import StudioWorkflowRail from './StudioWorkflowRail';
// Clean 5E — Design Intent Layer: compact drawer + summary line.
import StudioIntentDrawer, { intentSummaryText } from './StudioIntentDrawer';
import StudioStoneStrip from './StudioStoneStrip';
import StudioStonePanel from './StudioStonePanel';
import StudioCanvas from './StudioCanvas';
import StudioInspectorDrawer from './StudioInspectorDrawer';
import StudioBottomStrip from './StudioBottomStrip';
// Clean 6A — Studio Entry + Multi-Stone Composition + Concept Sketches.
import CompositionBoard from './CompositionBoard';
import InlineInventoryPicker from '../../shared/InlineInventoryPicker';
import { AlertIcon, LayersIcon } from './StudioIcons';
import { reset } from './studioResetStyle';
// Clean 6A — the in-Studio "בחר אבנים מהמלאי" picker uses the SAME read-only
// demo-inventory exports + the SAME bridge (toStudioTrayItem → tray.addItem)
// the Work Tray's inline add already uses (Patch D). No new store, no new
// persistence key — additions go to the REAL Work Tray only.
import {
  getDemoInspectStoneFromTrayItem,
  getDemoInventorySnapshot,
  toStudioTrayItem,
  getSourceLabelHe,
} from '../../../../lib/studio/demoInventoryLayer';

const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);
const useDesignProjects = createUseDesignProjects(React);

// Clean 7A — Active Work chip label (local literal; labels.js untouched.
// 'תיק פעיל' is the canonical Work-File badge used across /studio/projects).
const ACTIVE_WORK_CHIP_HE = Object.freeze({ badge: 'תיק פעיל' });

// Clean 8B — Work Session Management (local literals; string values only).
const SESSION_HE = Object.freeze({
  openProjects: 'פתח תיקי עבודה',
  clearStudio: 'נקה סטודיו',
  clearConfirm:
    'ניקוי הסטודיו יסיר את העבודה הפעילה, האבנים, תפריט העיצוב וכיווני העיצוב מהמסך. תיקי עבודה שמורים לא יימחקו. להמשיך?',
  clearedToast: 'הסטודיו נוקה — תיקי העבודה השמורים לא נמחקו',
});
// Patch B — the shell now uses the EXISTING event-synced Active Work hook
// (lib/studio/activeWorkStore.js) instead of a local read-once localStorage
// read, so the command-bar status reflects a save immediately. Same key,
// same store, no internals touched.
const useActiveWork = createUseActiveWork(React);

function useViewport() {
  const [vp, setVp] = React.useState({ narrow: false, short: false });
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const check = () =>
      setVp({ narrow: window.innerWidth < 1040, short: window.innerHeight < 640 });
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return vp;
}

// Workflow-rail step → central canvas view.
const STEP_TO_VIEW = {
  stones: 'direction',
  product: 'direction',
  design: 'concepts',
  brief: 'output',
};

export default function StudioShell() {
  const tray = useWorkTray();
  const briefStore = useDesignBrief();
  const projectsStore = useDesignProjects();
  const { activeWorkId, setActiveWork, clearActiveWork } = useActiveWork();
  const { narrow, short } = useViewport();
  const router = useRouter();

  const [activeStep, setActiveStep] = React.useState('design');
  const [pickerOpen, setPickerOpen] = React.useState(false);
  // Clean 6A — in-Studio inventory picker (UI-only state; a read-only demo
  // inventory snapshot is loaded when — and only when — the picker opens).
  const [invPickerOpen, setInvPickerOpen] = React.useState(false);
  const [invItems, setInvItems] = React.useState([]);
  // Clean 6A — Composition Board open state (UI-only).
  const [boardOpen, setBoardOpen] = React.useState(false);
  // Clean 5E — "כוונת עיצוב" drawer open state (UI-only; brief edits persist
  // through the existing designBriefStore, never through local state here).
  const [intentOpen, setIntentOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);

  // Clean 5D-R3 — local UI-only gate for the guided empty/start state
  // (State A). Never persisted, never read by any store or panel.
  const [heroDismissed, setHeroDismissed] = React.useState(false);

  // One Tray — the top-ribbon selection tracks an item id from the REAL
  // Work Tray (the only list this shell shows now).
  const [selectedItemId, setSelectedItemId] = React.useState(null);

  const showToast = React.useCallback((msg) => {
    if (!msg) return;
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);
  React.useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  if (!tray.hydrated || !briefStore.hydrated) {
    return <div style={styles.loading}>טוען את הסטודיו…</div>;
  }

  const brief = briefStore.brief;
  const concepts = Array.isArray(brief.concepts) ? brief.concepts : [];
  const hasConcepts = concepts.length > 0;
  // One Tray — the REAL Work Tray is the single source of truth. No demo
  // fallback list: an empty tray shows the guided empty state below.
  const realTrayItems = Array.isArray(tray.items) ? tray.items : [];
  const hasStones = realTrayItems.length > 0;

  // Core Flow Polish V1 — the DEFAULT (when nothing has been explicitly
  // clicked yet) prefers a center-stone-role item, since that's the more
  // sensible "active" stone to land on. Defensive: if no center stone
  // exists, falls back to the first item exactly as before. Nothing about
  // the Work Tray store or saved data is touched — this only changes which
  // already-present item the shell highlights by default.
  const explicitSelection = realTrayItems.find((it) => it.id === selectedItemId);
  const defaultTrayItem =
    realTrayItems.find((it) => normalizeRole(it.role) === DESIGN_ROLE.CENTER_STONE) ||
    realTrayItems[0] ||
    null;
  const selectedTrayItem = explicitSelection || defaultTrayItem;
  // One Tray — demo-SOURCED items (added to the real tray from the demo
  // inventory) still resolve their richer inspect view via the existing
  // helper; it reads item.demoInventoryItem / the demo snapshot and returns
  // null for any non-demo item, so the panels gracefully use the tray
  // snapshot instead. Per selected item only — never an injected list.
  const selectedDemoStone =
    selectedTrayItem && selectedTrayItem.isDemoAsset
      ? getDemoInspectStoneFromTrayItem(selectedTrayItem)
      : null;

  // Patch D — multi-stone session awareness for the canvas header: when the
  // session includes more than one stone, show a compact group line
  // ("N אבנים · מרכזית: X") so the direction/concept area clearly refers to
  // the whole selected group, not one stone. Read-only; reuses the same
  // center-stone lookup pattern used by buildDefaultSessionTitle below.
  const groupCenterItem = realTrayItems.find(
    (it) => normalizeRole(it.role) === DESIGN_ROLE.CENTER_STONE
  );
  const groupIndicator =
    realTrayItems.length > 1
      ? [
          USABILITY_D_HE.stonesCount(realTrayItems.length),
          groupCenterItem
            ? `${USABILITY_D_HE.groupCenterPrefix}: ${trayItemTitle(groupCenterItem)}`
            : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : null;

  const selected = getSelectedConcept(brief);
  const output = getActiveOutput(brief);
  // Clean 5E — compact intent summary for the canvas header (pure, Hebrew).
  const intentSummary = intentSummaryText(brief);
  const conceptsStale = conceptsAreStale(brief, realTrayItems);
  const outStale = outputIsStale(brief, realTrayItems);
  const outputState = output ? (outStale ? 'stale' : 'ready') : 'none';

  const view = STEP_TO_VIEW[activeStep] || 'concepts';

  // Once real stones exist or concepts have been generated, the guided start
  // state is moot regardless of the dismissed flag (kept in sync, never a
  // trap the user can get stuck behind or in front of).
  const heroActive = !hasStones && !hasConcepts && !heroDismissed;

  // One obvious primary action (bottom strip only — the single dominant CTA).
  // Core Flow Polish V1 — the "Generate Concepts" label previously showed
  // while still on the Stones/Product (direction) step, where clicking it
  // only navigates to the step that has the real generate button — two CTAs
  // effectively sharing one promise. Now the direction step honestly says
  // "continue", and "Generate Concepts" only appears once the user is on the
  // step where that action actually lives. No generation logic touched.
  let primaryLabel = STUDIO_5D_HE.primaryGenerateConcepts;
  let primaryDisabled = false;
  let onPrimary = () => setActiveStep('design');
  if (!hasConcepts) {
    primaryLabel =
      view === 'direction' ? STUDIO_5D_HE.primaryContinueToConcepts : STUDIO_5D_HE.primaryGenerateConcepts;
    onPrimary = () => setActiveStep('design');
  } else if (conceptsStale) {
    primaryLabel = STUDIO_5D_HE.primaryUpdateConcepts;
    onPrimary = () => setActiveStep('design');
  } else if (!selected) {
    primaryLabel = STUDIO_5D_HE.primarySelectDirection;
    primaryDisabled = true;
    onPrimary = () => setActiveStep('design');
  } else if (!output || outStale) {
    primaryLabel = STUDIO_5D_HE.primaryGenerateOutput;
    onPrimary = () => setActiveStep('brief');
  } else {
    primaryLabel = STUDIO_5D_HE.primaryPrepareBrief;
    onPrimary = () => setActiveStep('brief');
  }

  const onSelectVariant = (conceptId) => briefStore.selectConcept(conceptId);

  // Studio Layout Reset — Zone 1 ribbon selection over the real tray list.
  const onSelectItem = (item) => {
    if (item && item.id) setSelectedItemId(item.id);
  };

  // One Tray — Zone 2 primary action. Every stone this shell shows IS a real
  // Work Tray item now, so the action is always "remove from tray", wired to
  // the existing tray.remove (removeFromTray) export. After removal the
  // default-selection logic above picks the next sensible active stone, or
  // the guided empty state appears when the tray runs empty.
  const inTray = Boolean(selectedTrayItem);
  const onToggleTray = selectedTrayItem
    ? () => {
        tray.remove(selectedTrayItem.id);
        showToast(STUDIO_5D_HE.toastRemovedFromTray);
      }
    : undefined;

  // ------------------------------------------------------------------
  // Patch B — Session Save / Project Birth.
  // Persists the CURRENT design session (tray items + brief + computed
  // snapshot) as a Design Project via the EXISTING designProjects exports.
  // The brief already carries concepts / selectedConceptId / designOutputs
  // (Clean 5A/5B), so the full concept state rides along with no new schema.
  // Create vs update: if the Active Work pointer names a project that still
  // exists, that project is UPDATED in place (name preserved, updatedAt
  // stamped) — repeated saves never duplicate. Otherwise a new project is
  // created with a sensible default title and becomes the Active Work.
  // Local only — no Airtable, no network, no store internals touched.
  // ------------------------------------------------------------------
  const canSaveSession = hasStones || briefHasContent(brief);

  const buildDefaultSessionTitle = () => {
    const centerItem = realTrayItems.find(
      (it) => normalizeRole(it.role) === DESIGN_ROLE.CENTER_STONE
    );
    const centerTitle = centerItem ? trayItemTitle(centerItem) : '';
    const productHe =
      brief.productType &&
      CONCEPT_HE.productType &&
      CONCEPT_HE.productType[brief.productType]
        ? CONCEPT_HE.productType[brief.productType]
        : '';
    const detail = [productHe, centerTitle].filter(Boolean).join(' ');
    return detail
      ? `${STUDIO_5D_HE.defaultSessionTitlePrefix} — ${detail}`
      : STUDIO_5D_HE.defaultSessionTitleFallback;
  };

  const onSaveSession = () => {
    if (!canSaveSession) return;
    const snapshot = buildDesignSnapshot(realTrayItems, brief);
    const existing = activeWorkId ? getProject(activeWorkId) : null;
    if (existing) {
      const updated = updateProject(existing.id, {
        trayItems: realTrayItems,
        brief,
        snapshot,
      });
      if (updated) showToast(STUDIO_5D_HE.toastSessionUpdated);
      return;
    }
    const project = projectsStore.save({
      name: buildDefaultSessionTitle(),
      trayItems: realTrayItems,
      brief,
      snapshot,
    });
    if (project && project.id) {
      setActiveWork(project.id);
      showToast(STUDIO_5D_HE.toastSessionSaved);
    }
  };

  // Canvas content per view; existing panels own all logic.
  let canvasMode = 'concepts';
  let canvasBody = null;
  if (view === 'direction') {
    canvasMode = 'direction';
    canvasBody = <DesignConceptPanel view="direction" onToast={showToast} />;
  } else if (view === 'output') {
    canvasMode = 'output';
    canvasBody = <DesignOutputPanel onToast={showToast} suppressStaleBanner />;
  } else {
    canvasMode = heroActive ? 'hero' : selected ? 'selected' : 'concepts';
    canvasBody = <DesignConceptPanel view="concepts" onToast={showToast} suppressStaleBanner />;
  }

  // ------------------------------------------------------------------
  // Clean 6A — Studio Entry: 4-action start panel wiring.
  // ------------------------------------------------------------------
  // "בחר אבנים מהמלאי" now opens an IN-STUDIO inventory picker (the approved
  // preferred path) using the exact Patch-D Work-Tray pattern: read-only
  // demo-inventory snapshot → generic display entries → the presentational
  // InlineInventoryPicker → additions through the EXISTING bridge
  // (toStudioTrayItem → tray.addItem). Membership truth is always the real
  // Work Tray. No routing away from the Studio, no new store, no new key.
  const openInStudioInventoryPicker = () => {
    setInvItems(getDemoInventorySnapshot());
    setInvPickerOpen(true);
  };
  const onHeroChooseStones = openInStudioInventoryPicker;
  // "העלה אבן / נכס" — the EXISTING AssetPicker/upload flow, same instance
  // the stone strip's add button already opens.
  const onHeroUploadAsset = () => setPickerOpen(true);
  // "התחל ללא אבנים" — the existing metal-only flow, unchanged.
  const onHeroChooseNoStones = () => {
    setHeroDismissed(true);
  };

  // Clean 6A — generic display entries for the presentational picker. `raw`
  // keeps the original item so add goes through the EXISTING bridge unchanged
  // (identical mapping to the Work Tray's Patch-D inline add).
  const invEntries = invItems.map((item) => ({
    id: item.id,
    title: item.titleHe || item.title || '—',
    subtitle: [
      item.shapeHe,
      item.estimatedCarat != null ? `${item.estimatedCarat}ct` : null,
      item.color,
      getSourceLabelHe(item.sourceType),
    ]
      .filter(Boolean)
      .join(' · '),
    image: item.thumbImage || item.boxImage || null,
    raw: item,
  }));
  const invTrayIds = new Set(realTrayItems.map((it) => it.id));
  const onInvAdd = (entry) => {
    const trayItem = toStudioTrayItem(entry.raw);
    if (trayItem) tray.addItem(trayItem);
  };
  const onInvRemove = (entry) => {
    tray.remove(entry.id);
  };

  // Clean 6A — small SECONDARY resume chip on the hero (never one of the 4
  // primary actions). Shown only when a resumable saved session exists:
  // the Active Work project if set, otherwise the most recently touched
  // active project. Restoring uses the SAME store calls as the Command
  // Center's openProject flow (tray.replace + briefStore.set +
  // setActiveWork) — all existing exports, no navigation needed since we
  // are already in the Studio.
  const activeProject =
    activeWorkId && projectsStore.hydrated
      ? projectsStore.projects.find((p) => p.id === activeWorkId)
      : null;

  // ------------------------------------------------------------------
  // Clean 8B — "נקה סטודיו": clears ONLY the live session through EXISTING
  // public APIs — the Work Tray (tray.clear → clearTray), the design brief
  // incl. תפריט עיצוב, כיווני עיצוב, כיוון נבחר and outputs (briefStore.clear
  // → clearBrief resets to emptyBrief), and the Active Work pointer
  // (clearActiveWork). Saved Work Files, inventory, and uploaded assets are
  // NOT touched — nothing is deleted from the projects/assets stores.
  // Browser confirm is required before anything is cleared.
  // ------------------------------------------------------------------
  const handleClearStudio = () => {
    if (typeof window !== 'undefined' && !window.confirm(SESSION_HE.clearConfirm)) return;
    tray.clear();
    briefStore.clear();
    clearActiveWork();
    showToast(SESSION_HE.clearedToast);
  };
  const latestProject =
    projectsStore.hydrated && Array.isArray(projectsStore.active)
      ? projectsStore.active.reduce(
          (best, p) => (!best || (p.updatedAt || 0) > (best.updatedAt || 0) ? p : best),
          null
        )
      : null;
  const resumableProject = activeProject || latestProject;
  const onResumeProject = () => {
    if (!resumableProject) return;
    tray.replace(resumableProject.trayItems || []);
    briefStore.set(resumableProject.brief || {});
    setActiveWork(resumableProject.id);
  };
  const resumeChip =
    heroActive && resumableProject
      ? {
          text: STUDIO_6A_HE.hero.resumeChip,
          title: resumableProject.name || STUDIO_6A_HE.hero.resumeChip,
          onClick: onResumeProject,
        }
      : null;

  // Clean 6A — canonical stone shapes of the current composition, for the
  // derived concept sketches (render-time only; nothing stored).
  const stoneShapes = realTrayItems
    .map((it) => (it.snapshot && it.snapshot.axes ? it.snapshot.axes.shape : null))
    .filter(Boolean);

  const staleBanners = (
    <>
      {conceptsStale && (
        <StaleBanner
          title={STUDIO_5D_HE.staleConceptsTitle}
          body={STUDIO_5D_HE.staleConceptsBody}
          action={STUDIO_5D_HE.staleConceptsAction}
          onAction={() => setActiveStep('design')}
        />
      )}
      {outStale && (
        <StaleBanner
          title={STUDIO_5D_HE.staleOutputTitle}
          body={STUDIO_5D_HE.staleOutputBody}
          action={STUDIO_5D_HE.staleOutputAction}
          onAction={() => setActiveStep('brief')}
        />
      )}
    </>
  );

  return (
    <div
      style={{
        ...styles.shell,
        ...(short ? styles.shellShort : null),
      }}
      dir="rtl"
    >
      {/* TOP: command bar + stone strip on one compact row (Zone 1) */}
      <div style={styles.topRow}>
        <StudioCommandBar
          hasActiveWork={Boolean(activeWorkId)}
          outputState={outputState}
          onExit={() => router.push('/studio')}
          onSaveSession={onSaveSession}
          canSaveSession={canSaveSession}
        />
        <StudioStoneStrip
          trayItems={realTrayItems}
          onAddStones={() => setPickerOpen(true)}
          onSelectItem={onSelectItem}
          selectedItemId={selectedTrayItem ? selectedTrayItem.id : null}
          demoMode={false}
        />
      </div>

      {/* MIDDLE: left stone panel | center canvas | right inspector */}
      <div
        style={{
          ...styles.middle,
          ...(narrow ? styles.middleNarrow : null),
        }}
      >
        <StudioStonePanel
          item={selectedTrayItem}
          demoStone={selectedDemoStone}
          demoMode={Boolean(selectedDemoStone)}
          hasStones={hasStones}
          inTray={inTray}
          onToggleTray={onToggleTray}
          onStartDesign={() => setActiveStep('design')}
        />

        <div style={styles.canvasColumn}>
          <div style={styles.canvasHeader}>
            <StudioWorkflowRail active={activeStep} onSelect={setActiveStep} />
            <span style={styles.canvasHeaderMeta}>
              {/* Clean 7A — compact Active Work indicator: badge + name +
                  item count, tapping opens תיקי עבודה. Derived from the
                  activeProject already resolved above — no new state, no
                  restructure; one chip in the existing chip row. */}
              {activeProject ? (
                <button
                  type="button"
                  onClick={() => router.push('/studio/projects')}
                  style={styles.activeWorkChip}
                  title={`${ACTIVE_WORK_CHIP_HE.badge} · ${activeProject.name}`}
                >
                  <span style={styles.activeWorkBadge}>{ACTIVE_WORK_CHIP_HE.badge}</span>
                  <span style={styles.activeWorkName}>{activeProject.name}</span>
                  <span style={styles.activeWorkCount}>
                    {PROJECTS_HE.itemsCount(
                      Array.isArray(activeProject.trayItems) ? activeProject.trayItems.length : 0
                    )}
                  </span>
                  {/* Clean 8B — the link is now explicit, not tooltip-only */}
                  <span style={styles.activeWorkLink}>{SESSION_HE.openProjects}</span>
                </button>
              ) : null}
              {/* Clean 8B — clear the live session (confirm-guarded; saved
                  Work Files / inventory / assets are never deleted). */}
              <button
                type="button"
                onClick={handleClearStudio}
                style={styles.clearStudioBtn}
                title={SESSION_HE.clearStudio}
              >
                {SESSION_HE.clearStudio}
              </button>
              {/* Clean 5E — compact intent summary; tap to edit the intent. */}
              <button
                type="button"
                onClick={() => setIntentOpen(true)}
                style={styles.intentChip}
                title={intentSummary || INTENT_HE.summaryEmpty}
              >
                {intentSummary ? (
                  <>
                    {intentSummary}
                    <span style={styles.intentEditHint}> · {STUDIO_6B1_HE.intentCard.edit}</span>
                  </>
                ) : (
                  INTENT_HE.openIntent
                )}
              </button>
              {/* Patch D — group indicator: this session designs around N stones. */}
              {groupIndicator ? (
                <span style={styles.groupIndicator} title={groupIndicator}>
                  {groupIndicator}
                </span>
              ) : null}
              {/* Clean 6A — Composition Board toggle (visible once the
                  session has stones). Opens the role-grouped board. */}
              {hasStones ? (
                <button
                  type="button"
                  onClick={() => setBoardOpen(true)}
                  style={styles.boardChip}
                  title={STUDIO_6A_HE.board.title}
                >
                  <LayersIcon size={13} />
                  <span>{STUDIO_6A_HE.board.openLabel}</span>
                </button>
              ) : null}
              <span style={styles.canvasHeaderTitle}>{STUDIO_5D_HE.rail[activeStep] || ''}</span>
            </span>
          </div>

          {!heroActive && staleBanners}

          <StudioCanvas
            mode={canvasMode}
            selected={selected}
            hasConcepts={hasConcepts}
            hasStones={hasStones}
            onChooseStones={onHeroChooseStones}
            onChooseNoStones={onHeroChooseNoStones}
            onUploadAsset={onHeroUploadAsset}
            resumeChip={resumeChip}
            intentSummary={intentSummary}
            onOpenIntent={() => setIntentOpen(true)}
            stoneShapes={stoneShapes}
            fallbackProductType={brief.productType || null}
          >
            {canvasBody}
          </StudioCanvas>

          <StudioBottomStrip
            concepts={concepts}
            selectedId={brief.selectedConceptId}
            onSelectVariant={onSelectVariant}
            primaryLabel={primaryLabel}
            primaryDisabled={primaryDisabled}
            onPrimary={onPrimary}
            stoneShapes={stoneShapes}
            fallbackProductType={brief.productType || null}
          />
        </div>

        <StudioInspectorDrawer
          concept={selected}
          output={output}
          selectedItem={!selected ? selectedTrayItem : null}
          selectedDemoStone={!selected ? selectedDemoStone : null}
          demoMode={Boolean(selectedDemoStone)}
          trayItems={realTrayItems}
        />
      </div>

      <AssetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        tray={tray}
        projectsStore={projectsStore}
        currentProjectId={activeWorkId}
      />

      {/* Clean 5E — Design Intent drawer (bottom sheet on narrow). */}
      <StudioIntentDrawer
        open={intentOpen}
        onClose={() => setIntentOpen(false)}
        narrow={narrow}
      />

      {/* Clean 6A — Composition Board: role-grouped view of the current
          Work Tray composition. Role edits go through the EXISTING
          tray.setRole; adding stones opens the same in-Studio picker. */}
      <CompositionBoard
        open={boardOpen}
        onClose={() => setBoardOpen(false)}
        narrow={narrow}
        trayItems={realTrayItems}
        onSetRole={(id, role) => tray.setRole(id, role)}
        onAddStones={openInStudioInventoryPicker}
      />

      {/* Clean 6A — in-Studio inventory add. Presentational picker;
          membership truth and all writes go through the REAL Work Tray
          hook only (same contract as the Work Tray's Patch-D inline add). */}
      <InlineInventoryPicker
        open={invPickerOpen}
        title={USABILITY_D_HE.pickerTitle}
        items={invEntries}
        selectedIds={invTrayIds}
        onAdd={onInvAdd}
        onRemove={onInvRemove}
        onClose={() => setInvPickerOpen(false)}
      />

      {toast && (
        <div style={styles.toast} dir="rtl" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function StaleBanner({ title, body, action, onAction }) {
  return (
    <div style={styles.stale} dir="rtl" role="status" title={body}>
      <span style={styles.staleIcon} aria-hidden="true">
        <AlertIcon size={15} />
      </span>
      <span style={styles.staleTitle}>{title}</span>
      <button type="button" onClick={onAction} style={styles.staleBtn}>
        {action}
      </button>
    </div>
  );
}

const GAP = '10px';

const styles = {
  shell: {
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
    gap: GAP,
    height: '100vh',
    padding: GAP,
    boxSizing: 'border-box',
    background: reset.color.page,
    overflow: 'hidden',
  },
  // Short viewports: let the whole shell scroll instead of clipping.
  shellShort: {
    height: 'auto',
    minHeight: '100vh',
    overflow: 'visible',
  },
  loading: {
    fontFamily: reset.font.body,
    fontSize: '14px',
    color: reset.color.textFaint,
    padding: '60px 0',
    textAlign: 'center',
  },

  topRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(200px, 280px) minmax(0, 1fr)',
    gap: GAP,
    alignItems: 'stretch',
  },

  middle: {
    display: 'grid',
    gridTemplateColumns: 'minmax(230px, 270px) minmax(0, 1fr) minmax(300px, 340px)',
    gap: GAP,
    minHeight: 0,
  },
  middleNarrow: {
    gridTemplateColumns: '1fr',
    gridAutoRows: 'min-content',
  },

  canvasColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: GAP,
    minWidth: 0,
    minHeight: 0,
  },

  canvasHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexShrink: 0,
  },
  canvasHeaderMeta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
    flexShrink: 1,
  },
  // Clean 5E — tappable intent summary chip ("טבעת · יוקרתי · … · מאוזן").
  // Clean 7A — Active Work chip (canvas-header chip row; additive styles).
  activeWorkChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    minHeight: '28px',
    padding: '4px 11px',
    borderRadius: '999px',
    border: `1px solid ${reset.color.accent}`,
    background: 'transparent',
    cursor: 'pointer',
    minWidth: 0,
    flexShrink: 1,
    overflow: 'hidden',
  },
  activeWorkBadge: {
    fontFamily: reset.font.body,
    fontSize: '10.5px',
    fontWeight: 800,
    color: reset.color.accent,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  activeWorkName: {
    fontFamily: reset.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    color: reset.color.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px',
  },
  activeWorkCount: {
    fontFamily: reset.font.body,
    fontSize: '10.5px',
    fontWeight: 600,
    color: reset.color.textMuted,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // Clean 8B — explicit open-projects link inside the chip + clear-studio.
  activeWorkLink: {
    fontFamily: reset.font.body,
    fontSize: '10.5px',
    fontWeight: 700,
    color: reset.color.accent,
    textDecoration: 'underline',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  clearStudioBtn: {
    minHeight: '28px',
    padding: '4px 12px',
    borderRadius: '999px',
    border: `1px solid ${reset.color.borderStrong}`,
    background: 'transparent',
    color: reset.color.textMuted,
    fontFamily: reset.font.body,
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  intentChip: {
    display: 'inline-flex',
    alignItems: 'center',
    maxWidth: '340px',
    minHeight: '28px',
    padding: '4px 11px',
    borderRadius: '999px',
    border: `1px solid ${reset.color.borderStrong}`,
    background: reset.color.panel,
    color: reset.color.text,
    fontFamily: reset.font.body,
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
    flexShrink: 1,
  },
  // Clean 6B.1 — quiet edit affordance inside the summary chip.
  intentEditHint: {
    color: reset.color.textFaint,
    fontWeight: 700,
  },
  // Clean 6A — Composition Board toggle chip (canvas header).
  boardChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    minHeight: '28px',
    padding: '4px 11px',
    borderRadius: '999px',
    border: `1px solid ${reset.color.borderStrong}`,
    background: reset.color.panel,
    color: reset.color.text,
    fontFamily: reset.font.body,
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // Patch D — compact multi-stone group line ("N אבנים · מרכזית: X").
  groupIndicator: {
    fontFamily: reset.font.body,
    fontSize: '11px',
    fontWeight: 600,
    color: reset.color.textMuted,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  canvasHeaderTitle: {
    fontFamily: reset.font.display,
    fontWeight: 700,
    fontSize: '13px',
    color: reset.color.text,
    flexShrink: 0,
  },

  // Stale banners (calm, minimal).
  stale: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 14px',
    borderRadius: reset.radius.md,
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    flexShrink: 0,
  },
  staleIcon: { display: 'inline-flex', color: reset.color.textMuted, flexShrink: 0 },
  staleTitle: {
    flex: '1 1 auto',
    minWidth: 0,
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    color: reset.color.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  staleBtn: {
    minHeight: '34px',
    padding: '7px 14px',
    fontFamily: reset.font.body,
    fontSize: '12px',
    fontWeight: 700,
    color: reset.color.primaryText,
    background: reset.color.primaryBg,
    border: 'none',
    borderRadius: reset.radius.sm,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

  toast: {
    position: 'fixed',
    left: '50%',
    bottom: '24px',
    transform: 'translateX(-50%)',
    fontFamily: reset.font.body,
    fontSize: '13.5px',
    fontWeight: 600,
    color: reset.color.primaryText,
    background: reset.color.primaryBg,
    padding: '9px 18px',
    borderRadius: reset.radius.md,
    zIndex: 50,
    pointerEvents: 'none',
  },
};
