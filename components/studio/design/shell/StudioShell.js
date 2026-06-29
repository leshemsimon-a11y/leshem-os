// components/studio/design/shell/StudioShell.js
//
// LESHEM.S OS — Clean 5D-R Studio Workstation (North-Star reset).
//
// A FULL-VIEWPORT jewelry studio workstation, not a page. Structure follows the
// approved North Star: a compact top bar + selected-stones strip, a slim left
// icon workflow rail, a DOMINANT central canvas (render | blueprint split), a
// right inspector drawer (≈340px) with a pinned gold CTA, and a compact bottom
// variant/action strip.
//
// LOGIC IS PRESERVED. This file only arranges regions and threads them with the
// existing business logic, untouched:
//   • direction inputs + concept cards (generate / select / remove / refresh)
//     are rendered by DesignConceptPanel (Clean 5B.3).
//   • output + structured render brief by DesignOutputPanel (Clean 5B + 5C).
//   • stale detection uses the SAME conceptsAreStale / outputIsStale helpers.
// The shell performs NO generation and owns NO output mutations; the bottom
// strip and stone strip read store data, and selection routes through the same
// brief store the panels use (single source of truth).
//
// Full-height with safe fallbacks: regions scroll INTERNALLY; if the viewport
// is short the whole shell falls back to page scroll; on narrow widths the grid
// stacks. Mobile flow itself is NOT built here but is not blocked either.

import * as React from 'react';
import { tokens } from '../../shared/tokens';
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';
import { createUseWorkTray } from '../../../../lib/studio/workTray';
import { createUseDesignBrief } from '../../../../lib/studio/designBriefStore';
import { createUseDesignProjects } from '../../../../lib/studio/designProjects';
import {
  getSelectedConcept,
  getActiveOutput,
  conceptsAreStale,
  outputIsStale,
} from '../../../../lib/studio/designDraft';

import DesignConceptPanel from '../DesignConceptPanel';
import DesignOutputPanel from '../DesignOutputPanel';
import AssetPicker from '../../assets/AssetPicker';

import StudioCommandBar from './StudioCommandBar';
import StudioWorkflowRail from './StudioWorkflowRail';
import StudioStoneStrip from './StudioStoneStrip';
import StudioCanvas from './StudioCanvas';
import StudioInspectorDrawer from './StudioInspectorDrawer';
import StudioBottomStrip from './StudioBottomStrip';
import { AlertIcon } from './StudioIcons';

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

  const [activeStep, setActiveStep] = React.useState('design');
  const [pickerOpen, setPickerOpen] = React.useState(false);
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

  // One obvious primary action (bottom strip + drawer CTA share this).
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

  const onSelectVariant = (conceptId) => briefStore.selectConcept(conceptId);

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
    canvasMode = selected ? 'selected' : 'concepts';
    canvasBody = <DesignConceptPanel view="concepts" onToast={showToast} suppressStaleBanner />;
  }

  const staleBanners = (
    <>
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
      {/* TOP: command bar + stone strip on one compact row */}
      <div style={styles.topRow}>
        <StudioCommandBar
          hasActiveWork={Boolean(activeWorkId)}
          outputState={outputState}
          compact
        />
        <StudioStoneStrip trayItems={tray.items} onAddStones={() => setPickerOpen(true)} />
      </div>

      {/* MIDDLE: rail | canvas | inspector */}
      <div
        style={{
          ...styles.middle,
          ...(narrow ? styles.middleNarrow : null),
        }}
      >
        <StudioWorkflowRail
          active={activeStep}
          onSelect={setActiveStep}
          horizontal={narrow}
        />

        <div style={styles.canvasColumn}>
          {staleBanners}
          <StudioCanvas
            mode={canvasMode}
            selected={selected}
            hasConcepts={hasConcepts}
          >
            {canvasBody}
          </StudioCanvas>
        </div>

        <StudioInspectorDrawer
          concept={selected}
          output={output}
          primaryLabel={primaryLabel}
          primaryDisabled={primaryDisabled}
          onPrimary={onPrimary}
        />
      </div>

      {/* BOTTOM: variant strip + echoed primary action */}
      <StudioBottomStrip
        concepts={concepts}
        selectedId={brief.selectedConceptId}
        onSelectVariant={onSelectVariant}
        primaryLabel={primaryLabel}
        primaryDisabled={primaryDisabled}
        onPrimary={onPrimary}
      />

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

function StaleBanner({ tone, title, body, action, onAction }) {
  return (
    <div
      style={{ ...styles.stale, ...(tone === 'output' ? styles.staleOutput : styles.staleConcepts) }}
      dir="rtl"
      role="status"
    >
      <span style={styles.staleIcon} aria-hidden="true">
        <AlertIcon size={16} />
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

const GAP = '10px';

const styles = {
  shell: {
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
    gap: GAP,
    height: '100vh',
    padding: GAP,
    boxSizing: 'border-box',
    background: tokens.color.ivory,
    overflow: 'hidden',
  },
  // Short viewports: let the whole shell scroll instead of clipping.
  shellShort: {
    height: 'auto',
    minHeight: '100vh',
    overflow: 'visible',
  },
  loading: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    color: tokens.color.inkFaint,
    padding: '60px 0',
    textAlign: 'center',
  },

  topRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 300px) minmax(0, 1fr)',
    gap: GAP,
    alignItems: 'stretch',
  },

  middle: {
    display: 'grid',
    gridTemplateColumns: '76px minmax(0, 1fr) minmax(320px, 360px)',
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

  // Stale banners (calm, slim).
  stale: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 14px',
    borderRadius: tokens.radius.md,
    flexShrink: 0,
  },
  staleConcepts: { background: tokens.color.goldFaint, border: `1px solid ${tokens.color.gold}` },
  staleOutput: { background: tokens.color.iceFaint, border: `1px solid ${tokens.color.ice}` },
  staleIcon: { display: 'inline-flex', color: tokens.color.charcoal, flexShrink: 0 },
  staleText: { display: 'flex', flexDirection: 'column', gap: '0px', minWidth: 0, flex: '1 1 auto' },
  staleTitle: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  staleBody: { fontFamily: tokens.font.body, fontSize: '11.5px', color: tokens.color.inkSoft },
  staleBtn: {
    minHeight: '36px',
    padding: '8px 16px',
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
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
