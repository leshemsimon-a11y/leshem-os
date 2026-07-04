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
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';
import { createUseWorkTray } from '../../../../lib/studio/workTray';
import { createUseDesignBrief } from '../../../../lib/studio/designBriefStore';
import { createUseDesignProjects } from '../../../../lib/studio/designProjects';
import {
  getSelectedConcept,
  getActiveOutput,
  conceptsAreStale,
  outputIsStale,
  DESIGN_ROLE,
  normalizeRole,
} from '../../../../lib/studio/designDraft';

import DesignConceptPanel from '../DesignConceptPanel';
import DesignOutputPanel from '../DesignOutputPanel';
import AssetPicker from '../../assets/AssetPicker';

import StudioCommandBar from './StudioCommandBar';
import StudioWorkflowRail from './StudioWorkflowRail';
import StudioStoneStrip from './StudioStoneStrip';
import StudioStonePanel from './StudioStonePanel';
import StudioCanvas from './StudioCanvas';
import StudioInspectorDrawer from './StudioInspectorDrawer';
import StudioBottomStrip from './StudioBottomStrip';
import { AlertIcon } from './StudioIcons';
import { reset } from './studioResetStyle';
import { getDemoInspectStoneFromTrayItem } from '../../../../lib/studio/demoInventoryLayer';

const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);
const useDesignProjects = createUseDesignProjects(React);

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

function useActiveWork() {
  const [id, setId] = React.useState(null);
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        setId(window.localStorage.getItem('leshem_studio_current_project_v1'));
      }
    } catch (e) {
      /* non-fatal */
    }
  }, []);
  return id;
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
  const activeWorkId = useActiveWork();
  const { narrow, short } = useViewport();
  const router = useRouter();

  const [activeStep, setActiveStep] = React.useState('design');
  const [pickerOpen, setPickerOpen] = React.useState(false);
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

  const selected = getSelectedConcept(brief);
  const output = getActiveOutput(brief);
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

  // Clean 5D-R3 guided-start actions, One Tray revision: "choose stones"
  // now routes to the Inventory screen — which writes to the REAL Work Tray
  // as of this patch — so the guided empty state leads to the true stone
  // source. (Its label already says "בחרו אבנים מהמלאי".) The metal-only and
  // open-tray choices are unchanged, and the AssetPicker stays reachable via
  // the stone strip's add button. No new stores, no new routes.
  const onHeroChooseStones = () => {
    router.push('/studio/inventory');
  };
  const onHeroChooseNoStones = () => {
    setHeroDismissed(true);
  };
  const onHeroOpenTray = () => {
    router.push('/studio/tray');
  };

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
            <span style={styles.canvasHeaderTitle}>{STUDIO_5D_HE.rail[activeStep] || ''}</span>
          </div>

          {!heroActive && staleBanners}

          <StudioCanvas
            mode={canvasMode}
            selected={selected}
            hasConcepts={hasConcepts}
            hasStones={hasStones}
            onChooseStones={onHeroChooseStones}
            onChooseNoStones={onHeroChooseNoStones}
            onOpenTray={onHeroOpenTray}
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
          />
        </div>

        <StudioInspectorDrawer
          concept={selected}
          output={output}
          selectedItem={!selected ? selectedTrayItem : null}
          selectedDemoStone={!selected ? selectedDemoStone : null}
          demoMode={Boolean(selectedDemoStone)}
        />
      </div>

      <AssetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        tray={tray}
        projectsStore={projectsStore}
        currentProjectId={activeWorkId}
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
