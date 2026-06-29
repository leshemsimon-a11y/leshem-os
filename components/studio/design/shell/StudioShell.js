// components/studio/design/shell/StudioShell.js
//
// LESHEM.S OS — Clean 5D Visual Studio Shell (orchestrator).
//
// This is the layout brain of the visual workstation. It arranges the new
// regions — command bar, left workflow rail, top stone strip, central canvas,
// right inspector drawer, bottom variant/action strip — and threads them with
// the EXISTING business logic, which is left untouched:
//
//   • Direction inputs + concept cards (generate / select / remove / refresh)
//     are still rendered by DesignConceptPanel (Clean 5B.3 logic).
//   • Output + structured render brief are still rendered by DesignOutputPanel
//     (Clean 5B + 5C logic), reached via the "הכן בריף הדמיה" primary action.
//   • Stale detection uses the SAME conceptsAreStale / outputIsStale helpers;
//     the shell only re-surfaces the warnings calmly and visually.
//
// The shell reads store data for the chrome (stone strip, inspector, variants)
// but performs NO generation and owns NO output mutations. Selection routing
// through the bottom strip uses the same brief store the panels use, so there
// is a single source of truth.
//
// Mobile-future-safe: regions are independent components and the grid collapses
// to a single column on narrow viewports. Mobile flow itself is NOT built here.

import * as React from 'react';
import { tokens } from '../../shared/tokens';
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';
import { createUseWorkTray } from '../../../../lib/studio/workTray';
import { createUseDesignBrief } from '../../../../lib/studio/designBriefStore';
import {
  getSelectedConcept,
  getActiveOutput,
  conceptsAreStale,
  outputIsStale,
} from '../../../../lib/studio/designDraft';

import DesignConceptPanel from '../DesignConceptPanel';
import DesignOutputPanel from '../DesignOutputPanel';

import StudioCommandBar from './StudioCommandBar';
import StudioWorkflowRail from './StudioWorkflowRail';
import StudioStoneStrip from './StudioStoneStrip';
import StudioCanvas from './StudioCanvas';
import StudioInspectorDrawer from './StudioInspectorDrawer';
import StudioBottomStrip from './StudioBottomStrip';
import { AlertIcon } from './StudioIcons';

const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);

function useIsNarrow(breakpoint = 980) {
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const check = () => setNarrow(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return narrow;
}

function useActiveWork() {
  const [has, setHas] = React.useState(false);
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        setHas(Boolean(window.localStorage.getItem('leshem_studio_current_project_v1')));
      }
    } catch (e) {
      /* non-fatal */
    }
  }, []);
  return has;
}

// Map a workflow-rail step to the central view the canvas should show.
const STEP_TO_VIEW = {
  stones: 'direction',
  product: 'direction',
  design: 'concepts',
  brief: 'output',
};

export default function StudioShell() {
  const tray = useWorkTray();
  const briefStore = useDesignBrief();
  const hasActiveWork = useActiveWork();
  const isNarrow = useIsNarrow();

  const [activeStep, setActiveStep] = React.useState('design');
  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);

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
  const selected = getSelectedConcept(brief);
  const output = getActiveOutput(brief);
  const conceptsStale = conceptsAreStale(brief, tray.items);
  const outStale = outputIsStale(brief, tray.items);

  const outputState = output ? (outStale ? 'stale' : 'ready') : 'none';
  const view = STEP_TO_VIEW[activeStep] || 'concepts';

  // Bottom-strip primary action: one obvious next step from flow state.
  let primaryLabel = STUDIO_5D_HE.primaryGenerateConcepts;
  let primaryDisabled = false;
  let onPrimary = () => setActiveStep('design');
  if (!hasConcepts) {
    primaryLabel = STUDIO_5D_HE.primaryGenerateConcepts;
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

  // Variant selection goes straight to the shared brief store (same store the
  // concept panel uses), so selecting from the strip and the cards is identical.
  const onSelectVariant = (conceptId) => {
    briefStore.selectConcept(conceptId);
  };

  // Canvas content per active view. The existing panels own all logic.
  let canvasTitle = STUDIO_5D_HE.rail.design;
  let canvasCaption = '';
  let canvasBody = null;
  if (view === 'direction') {
    canvasTitle = STUDIO_5D_HE.rail.product;
    canvasBody = <DesignConceptPanel view="direction" onToast={showToast} />;
  } else if (view === 'output') {
    canvasTitle = STUDIO_5D_HE.rail.brief;
    canvasBody = <DesignOutputPanel onToast={showToast} suppressStaleBanner />;
  } else {
    canvasTitle = selected
      ? `${STUDIO_5D_HE.canvasSelectedPrefix}: ${selected.conceptName}`
      : STUDIO_5D_HE.canvasPickDirection;
    canvasCaption = hasConcepts ? '' : STUDIO_5D_HE.canvasNoConcepts;
    canvasBody = <DesignConceptPanel view="concepts" onToast={showToast} suppressStaleBanner />;
  }

  return (
    <div style={styles.shell} dir="rtl">
      <StudioCommandBar hasActiveWork={hasActiveWork} outputState={outputState} />

      <StudioStoneStrip trayItems={tray.items} />

      {/* Calm, visual stale banners (preserved logic, re-surfaced at shell level). */}
      {conceptsStale && (
        <StaleBanner
          tone="concepts"
          title={STUDIO_5D_HE.staleConceptsTitle}
          body={STUDIO_5D_HE.staleConceptsBody}
          action={STUDIO_5D_HE.staleConceptsAction}
          onAction={() => setActiveStep('design')}
        />
      )}
      {outStale && (
        <StaleBanner
          tone="output"
          title={STUDIO_5D_HE.staleOutputTitle}
          body={STUDIO_5D_HE.staleOutputBody}
          action={STUDIO_5D_HE.staleOutputAction}
          onAction={() => setActiveStep('brief')}
        />
      )}

      <div style={{ ...styles.body, ...(isNarrow ? styles.bodyNarrow : null) }}>
        {!isNarrow && (
          <StudioWorkflowRail active={activeStep} onSelect={setActiveStep} />
        )}
        {isNarrow && (
          <StudioWorkflowRail active={activeStep} onSelect={setActiveStep} horizontal />
        )}

        <StudioCanvas title={canvasTitle} caption={canvasCaption} accent={Boolean(selected)}>
          {canvasBody}
        </StudioCanvas>

        <StudioInspectorDrawer concept={selected} output={output} />
      </div>

      <StudioBottomStrip
        concepts={concepts}
        selectedId={brief.selectedConceptId}
        onSelectVariant={onSelectVariant}
        primaryLabel={primaryLabel}
        primaryDisabled={primaryDisabled}
        onPrimary={onPrimary}
      />

      {toast && (
        <div style={styles.toast} dir="rtl" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function StaleBanner({ tone, title, body, action, onAction }) {
  return (
    <div
      style={{ ...styles.stale, ...(tone === 'output' ? styles.staleOutput : styles.staleConcepts) }}
      dir="rtl"
      role="status"
    >
      <span style={styles.staleIcon} aria-hidden="true">
        <AlertIcon size={18} />
      </span>
      <div style={styles.staleText}>
        <span style={styles.staleTitle}>{title}</span>
        <span style={styles.staleBody}>{body}</span>
      </div>
      <button type="button" onClick={onAction} style={styles.staleBtn}>
        {action}
      </button>
    </div>
  );
}

const styles = {
  shell: { display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '14px' },
  loading: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    color: tokens.color.inkFaint,
    padding: '40px 0',
    textAlign: 'center',
  },
  body: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) minmax(280px, 360px)',
    gap: '14px',
    alignItems: 'start',
  },
  bodyNarrow: {
    gridTemplateColumns: '1fr',
  },
  stale: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    padding: '13px 18px',
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.hairline,
  },
  staleConcepts: {
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
  },
  staleOutput: {
    background: tokens.color.iceFaint,
    border: `1px solid ${tokens.color.ice}`,
  },
  staleIcon: { display: 'inline-flex', color: tokens.color.charcoal, flexShrink: 0 },
  staleText: { display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0, flex: '1 1 auto' },
  staleTitle: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  staleBody: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    color: tokens.color.inkSoft,
  },
  staleBtn: {
    minHeight: '42px',
    padding: '10px 18px',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.sm,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  toast: {
    position: 'fixed',
    left: '50%',
    bottom: '24px',
    transform: 'translateX(-50%)',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    padding: '10px 20px',
    borderRadius: '999px',
    boxShadow: tokens.shadow.lift,
    zIndex: 50,
    pointerEvents: 'none',
  },
};
