// components/studio/design/DesignFlow.js
//
// LESHEM.S OS — Design Studio Compact Pro Workspace (Clean 5B.2)
//
// Replaces the old long vertical 3-stage scroll with a compact, premium,
// client-facing workspace modeled on professional design tools (ZBrush /
// CounterSketch): a fixed mental model of STATUS → CONTROL → WORK → ACTIONS,
// instead of one long page.
//
// Layout (desktop, RTL):
//   ┌───────────────────────────────────────────────────────────┐
//   │ TOP STATUS BAR: עבודה / מוצר / כיוון / מצב פלט / הצעד הבא  │
//   ├───────────────┬───────────────────────────────────────────┤
//   │ CONTROL PANEL │  CENTRAL WORK / RESULT AREA                │
//   │ (right, RTL)  │  active stage only (concepts | output)    │
//   │ • כיוון העיצוב│                                           │
//   │ • אבנים בעבודה│                                           │
//   │ • שמירה לעבודה│                                           │
//   ├───────────────┴───────────────────────────────────────────┤
//   │ FLOW-LEVEL STALE BANNERS (always visible when stale)       │
//   │ DOCKED ACTION BAR: one clear next action                   │
//   └───────────────────────────────────────────────────────────┘
//
// On small screens the control panel stacks above the work area as compact
// collapsible accordions; the action bar stays docked (sticky) but slim.
//
// IMPORTANT: This file ORCHESTRATES the existing working panels — it does not
// rewrite their logic. DesignConceptPanel (direction + concepts) and
// DesignOutputPanel keep all generate/select/cancel/save behavior, including
// the Clean 5B Active Work sync. The stale LOGIC is unchanged
// (conceptsAreStale / outputIsStale in designDraft.js); 5B.2 only makes the
// warning ALWAYS VISIBLE at the workspace level instead of hidden inside a
// stage the user may not be on.
//
// Local only. No new packages, no network, no Airtable, no pricing, no render.

import * as React from 'react';
import { tokens } from '../shared/tokens';
import {
  FLOW_HE,
  CONCEPT_HE,
  OUTPUT_HE,
  BRIEF_HE,
} from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignBrief } from '../../../lib/studio/designBriefStore';
import {
  getSelectedConcept,
  getActiveOutput,
  conceptsAreStale,
  outputIsStale,
  summarizeDraft,
} from '../../../lib/studio/designDraft';
import DesignConceptPanel from './DesignConceptPanel';
import DesignOutputPanel from './DesignOutputPanel';
import SaveProjectPanel from '../projects/SaveProjectPanel';

const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);

// ---------------------------------------------------------------------------
// Flow state (pure) — same decision model as Clean 5B.1, kept intact.
// ---------------------------------------------------------------------------
function computeFlowState(brief, trayItems) {
  const concepts = Array.isArray(brief.concepts) ? brief.concepts : [];
  const hasConcepts = concepts.length > 0;
  const selected = getSelectedConcept(brief);
  const output = getActiveOutput(brief);
  const conceptsStale = conceptsAreStale(brief, trayItems);
  const outStale = outputIsStale(brief, trayItems);

  const hasDirection = Boolean(
    brief.productType ||
      brief.styleDirection ||
      brief.metalPreference ||
      brief.stoneUsage ||
      (brief.designGoal && brief.designGoal.trim())
  );

  let nextKey;
  if (!hasConcepts) {
    nextKey = hasDirection ? 'generateConcepts' : 'fillDirection';
  } else if (conceptsStale) {
    nextKey = 'generateConcepts';
  } else if (!selected) {
    nextKey = 'chooseConcept';
  } else if (!output || outStale) {
    nextKey = 'generateOutput';
  } else {
    nextKey = 'saveOutput';
  }

  return {
    hasConcepts,
    hasDirection,
    selected,
    output,
    conceptsStale,
    outStale,
    nextKey,
  };
}

// Narrow-viewport detection so the two-column workspace stacks cleanly on
// mobile (inline styles can't carry media queries). SSR-safe: defaults to wide.
function useIsNarrow(breakpoint = 860) {
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

// Active Work label (compact). Local only; non-fatal if unavailable.
function useActiveWorkLabel() {
  const [label, setLabel] = React.useState(null);
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const id = window.localStorage.getItem('leshem_studio_current_project_v1');
        setLabel(id || null);
      }
    } catch (e) {
      /* non-fatal */
    }
  }, []);
  return label;
}

// ---------------------------------------------------------------------------
// Compact status bar
// ---------------------------------------------------------------------------
function StatusBar({ brief, flow, hasActiveWork }) {
  const S = FLOW_HE.statusBar;

  const productVal = brief.productType
    ? CONCEPT_HE.productType[brief.productType] || brief.productType
    : S.productNone;

  const directionVal = flow.selected
    ? flow.selected.conceptName
    : flow.hasConcepts
    ? FLOW_HE.summary.conceptsCountPrefix + (brief.concepts ? brief.concepts.length : 0)
    : S.directionNone;

  let outputVal = S.outputNone;
  let outputTone = 'pending';
  if (flow.output && flow.outStale) {
    outputVal = S.outputStale;
    outputTone = 'stale';
  } else if (flow.output) {
    outputVal = S.outputReady;
    outputTone = 'ready';
  }

  const cells = [
    { key: 'work', label: S.activeWork, value: hasActiveWork ? S.activeWork : S.activeWorkNone },
    { key: 'product', label: S.product, value: productVal },
    { key: 'direction', label: S.direction, value: directionVal, accent: Boolean(flow.selected) },
    { key: 'output', label: S.output, value: outputVal, tone: outputTone },
    { key: 'next', label: S.nextStep, value: FLOW_HE.next[flow.nextKey], next: true },
  ];

  return (
    <div style={styles.statusBar} dir="rtl">
      {cells.map((c) => (
        <div key={c.key} style={styles.statusCell}>
          <span style={styles.statusLabel}>{c.label}</span>
          <span
            style={{
              ...styles.statusValue,
              ...(c.accent ? styles.statusValueAccent : null),
              ...(c.next ? styles.statusValueNext : null),
              ...(c.tone === 'ready' ? styles.statusValueReady : null),
              ...(c.tone === 'stale' ? styles.statusValueStale : null),
            }}
          >
            {c.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Collapsible control-panel section
// ---------------------------------------------------------------------------
function ControlSection({ title, summary, defaultOpen = false, children }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div style={styles.ctrlSection}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={styles.ctrlHeader}
        dir="rtl"
        aria-expanded={open}
      >
        <span style={styles.ctrlTitleWrap}>
          <span style={styles.ctrlTitle}>{title}</span>
          {!open && summary ? <span style={styles.ctrlSummary}>{summary}</span> : null}
        </span>
        <span style={styles.ctrlToggle}>{open ? FLOW_HE.panel.collapse : FLOW_HE.panel.expand}</span>
      </button>
      {open && <div style={styles.ctrlBody}>{children}</div>}
    </div>
  );
}

// Compact, read-only direction summary (the editable inputs live in the
// concept panel's direction view, opened via "עריכת כיוון").
function DirectionSummary({ brief, onEdit }) {
  const rows = [
    {
      k: 'pt',
      label: CONCEPT_HE.productTypeLabel,
      value: brief.productType ? CONCEPT_HE.productType[brief.productType] : '—',
    },
    {
      k: 'style',
      label: CONCEPT_HE.styleDirectionLabel,
      value: brief.styleDirection ? BRIEF_HE.style[brief.styleDirection] || brief.styleDirection : '—',
    },
    {
      k: 'metal',
      label: CONCEPT_HE.metalLabel,
      value: brief.metalPreference ? BRIEF_HE.metal[brief.metalPreference] || brief.metalPreference : '—',
    },
    {
      k: 'usage',
      label: CONCEPT_HE.stoneUsageLabel,
      value: brief.stoneUsage ? CONCEPT_HE.stoneUsage[brief.stoneUsage] : '—',
    },
  ];
  const goal = (brief.designGoal || '').trim();
  return (
    <div dir="rtl">
      <div style={styles.sumGrid}>
        {rows.map((r) => (
          <div key={r.k} style={styles.sumRow}>
            <span style={styles.sumLabel}>{r.label}</span>
            <span style={styles.sumValue}>{r.value}</span>
          </div>
        ))}
      </div>
      {goal ? <p style={styles.sumGoal}>{goal}</p> : null}
      <button type="button" onClick={onEdit} style={styles.editBtn}>
        {FLOW_HE.panel.editDirection}
      </button>
    </div>
  );
}

// Compact stones-in-work summary (role-aware counts; no Record IDs, SKU model
// unaffected). Reuses the existing summarizeDraft logic.
function StonesSummary({ trayItems }) {
  const s = summarizeDraft(trayItems);
  const chips = [
    { k: 'total', label: CONCEPT_HE.roleLabels ? 'סה״כ' : 'סה״כ', value: s.total },
    { k: 'center', label: CONCEPT_HE.roleLabels.centerStone, value: s.centerStoneCount, accent: true },
    { k: 'side', label: CONCEPT_HE.roleLabels.sideStone, value: s.sideStoneCount },
    { k: 'accent', label: CONCEPT_HE.roleLabels.accentStone, value: s.accentStoneCount, opt: true },
    { k: 'pair', label: CONCEPT_HE.roleLabels.pair, value: s.pairCount, opt: true },
    { k: 'parcel', label: CONCEPT_HE.roleLabels.parcel, value: s.parcelCount, opt: true },
  ].filter((c) => !c.opt || c.value > 0);

  if (s.total === 0) {
    return <p style={styles.stonesEmpty} dir="rtl">{CONCEPT_HE.inputsEmpty}</p>;
  }
  return (
    <div style={styles.stoneChips} dir="rtl">
      {chips.map((c) => (
        <span key={c.k} style={{ ...styles.stoneChip, ...(c.accent ? styles.stoneChipAccent : null) }}>
          <span style={styles.stoneChipValue}>{c.value}</span>
          <span style={styles.stoneChipLabel}>{c.label}</span>
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function DesignFlow() {
  const tray = useWorkTray();
  const briefStore = useDesignBrief();
  const hasActiveWork = Boolean(useActiveWorkLabel());
  const isNarrow = useIsNarrow();

  // Which area is in the central work column: 'direction' | 'concepts' | 'output'.
  const [workView, setWorkView] = React.useState(null); // null → auto
  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);

  const showToast = React.useCallback((msg) => {
    if (!msg) return;
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  React.useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  if (!tray.hydrated || !briefStore.hydrated) {
    return <div style={styles.loading}>טוען את הסטודיו…</div>;
  }

  const brief = briefStore.brief;
  const flow = computeFlowState(brief, tray.items);

  // Auto-pick the most relevant central view from the flow's next action,
  // unless the user explicitly opened one (e.g. "עריכת כיוון").
  const autoView =
    flow.nextKey === 'fillDirection'
      ? 'direction'
      : flow.nextKey === 'generateConcepts' || flow.nextKey === 'chooseConcept'
      ? 'concepts'
      : 'output';
  const effectiveView = workView || autoView;

  const openView = (v) => setWorkView(v);

  // The docked next action routes to the right central view; the panel inside
  // performs the actual generate/select/save.
  const nextViewForKey = {
    fillDirection: 'direction',
    generateConcepts: 'concepts',
    chooseConcept: 'concepts',
    generateOutput: 'output',
    saveOutput: 'output',
    allDone: 'output',
  };
  const handleNext = () => openView(nextViewForKey[flow.nextKey] || 'concepts');

  return (
    <div style={styles.shell} dir="rtl">
      {/* TOP STATUS BAR */}
      <StatusBar brief={brief} flow={flow} hasActiveWork={hasActiveWork} />

      {/* FLOW-LEVEL STALE BANNERS — always visible regardless of work view.
          This is the Clean 5B.2 stale-visibility fix. */}
      {flow.conceptsStale && (
        <div style={{ ...styles.flowStale, ...styles.flowStaleConcepts }} dir="rtl" role="status">
          <div style={styles.flowStaleText}>
            <span style={styles.flowStaleTitle}>{FLOW_HE.flowStale.conceptsTitle}</span>
            <span style={styles.flowStaleBody}>{FLOW_HE.flowStale.conceptsBody}</span>
          </div>
          <button type="button" onClick={() => openView('concepts')} style={styles.flowStaleBtn}>
            {FLOW_HE.flowStale.conceptsAction}
          </button>
        </div>
      )}
      {/* Output stale is shown INDEPENDENTLY of concepts stale (Clean 5B.2
          correction): after a product/style/metal change both the concepts AND
          an existing output can be stale, and the user must see both. Stacked
          and visually distinct (concepts = gold, output = pearl). */}
      {flow.outStale && (
        <div style={{ ...styles.flowStale, ...styles.flowStaleOutput }} dir="rtl" role="status">
          <div style={styles.flowStaleText}>
            <span style={styles.flowStaleTitle}>{FLOW_HE.flowStale.outputTitle}</span>
            <span style={styles.flowStaleBody}>{FLOW_HE.flowStale.outputBody}</span>
          </div>
          <button type="button" onClick={() => openView('output')} style={styles.flowStaleBtn}>
            {FLOW_HE.flowStale.outputAction}
          </button>
        </div>
      )}

      {/* WORKSPACE: control panel (right, RTL) + central work area */}
      <div
        style={{
          ...styles.workspace,
          ...(isNarrow ? styles.workspaceNarrow : null),
        }}
      >
        {/* CONTROL PANEL */}
        <aside
          style={{ ...styles.control, ...(isNarrow ? styles.controlNarrow : null) }}
          dir="rtl"
        >
          <span style={styles.controlTitle}>{FLOW_HE.panel.controlTitle}</span>

          <ControlSection
            title={FLOW_HE.panel.directionSummary}
            summary={
              brief.productType
                ? CONCEPT_HE.productType[brief.productType]
                : FLOW_HE.summary.directionEmpty
            }
            defaultOpen
          >
            <DirectionSummary brief={brief} onEdit={() => openView('direction')} />
          </ControlSection>

          <ControlSection
            title={FLOW_HE.panel.stonesSummary}
            summary={summarizeDraft(tray.items).total + ''}
          >
            <StonesSummary trayItems={tray.items} />
          </ControlSection>

          <ControlSection title={FLOW_HE.panel.saveTitle}>
            <SaveProjectPanel />
          </ControlSection>
        </aside>

        {/* CENTRAL WORK / RESULT AREA */}
        <section style={styles.work} dir="rtl">
          <div style={styles.workTabs}>
            <WorkTab
              label={FLOW_HE.stages.direction}
              active={effectiveView === 'direction'}
              onClick={() => openView('direction')}
            />
            <WorkTab
              label={FLOW_HE.stages.concepts}
              active={effectiveView === 'concepts'}
              onClick={() => openView('concepts')}
              done={Boolean(flow.selected)}
            />
            <WorkTab
              label={FLOW_HE.stages.output}
              active={effectiveView === 'output'}
              onClick={() => openView('output')}
              done={Boolean(flow.output) && !flow.outStale}
            />
          </div>

          <div style={styles.workBody}>
            {effectiveView === 'direction' && (
              <DesignConceptPanel view="direction" onToast={showToast} />
            )}
            {effectiveView === 'concepts' && (
              <DesignConceptPanel view="concepts" onToast={showToast} suppressStaleBanner />
            )}
            {effectiveView === 'output' && (
              <DesignOutputPanel onToast={showToast} suppressStaleBanner />
            )}
          </div>
        </section>
      </div>

      {/* DOCKED ACTION BAR — one obvious next action */}
      <div style={styles.dock} dir="rtl">
        <div style={styles.dockText}>
          <span style={styles.dockPrefix}>{FLOW_HE.nextStepPrefix}</span>
          <span style={styles.dockLabel}>{FLOW_HE.next[flow.nextKey]}</span>
        </div>
        {flow.nextKey !== 'allDone' && (
          <button type="button" onClick={handleNext} style={styles.dockBtn}>
            {FLOW_HE.next[flow.nextKey]}
          </button>
        )}
      </div>

      {toast && (
        <div style={styles.toast} dir="rtl" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function WorkTab({ label, active, done, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.workTab,
        ...(active ? styles.workTabActive : null),
      }}
      dir="rtl"
    >
      {done && !active ? '✓ ' : ''}
      {label}
    </button>
  );
}

const styles = {
  shell: { display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '88px' },
  loading: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    color: tokens.color.inkFaint,
    padding: '40px 0',
    textAlign: 'center',
  },

  // ---- top status bar ----
  statusBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    padding: '12px 14px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.soft,
  },
  statusCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: '0',
    flex: '1 1 130px',
    paddingInlineStart: '12px',
    borderInlineStart: `1px solid ${tokens.color.cardEdge}`,
  },
  statusLabel: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: tokens.color.inkFaint,
  },
  statusValue: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statusValueAccent: { color: tokens.color.gold },
  statusValueNext: { color: tokens.color.charcoal },
  statusValueReady: { color: tokens.color.sage },
  statusValueStale: { color: tokens.color.gold },

  // ---- flow-level stale banners ----
  flowStale: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    padding: '12px 16px',
    borderRadius: tokens.radius.lg,
  },
  flowStaleConcepts: {
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
  },
  flowStaleOutput: {
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldSoft}`,
  },
  flowStaleText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  flowStaleTitle: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  flowStaleBody: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkSoft,
  },
  flowStaleBtn: {
    minHeight: '44px',
    padding: '10px 20px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  // ---- workspace grid ----
  workspace: {
    display: 'grid',
    gridTemplateColumns: 'minmax(240px, 320px) 1fr',
    gap: '14px',
    alignItems: 'start',
  },
  workspaceNarrow: {
    gridTemplateColumns: '1fr',
  },

  // ---- control panel ----
  control: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    padding: '14px',
    position: 'sticky',
    top: '12px',
  },
  controlNarrow: {
    position: 'static',
  },
  controlTitle: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: tokens.color.gold,
    marginBottom: '2px',
  },
  ctrlSection: {
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    background: tokens.color.ivory,
    overflow: 'hidden',
  },
  ctrlHeader: {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '12px 14px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'right',
  },
  ctrlTitleWrap: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  ctrlTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '15px',
    color: tokens.color.charcoal,
  },
  ctrlSummary: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkSoft,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '180px',
  },
  ctrlToggle: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.color.gold,
    flexShrink: 0,
  },
  ctrlBody: {
    padding: '4px 14px 14px',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
  },

  // direction summary
  sumGrid: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' },
  sumRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px' },
  sumLabel: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkSoft },
  sumValue: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    textAlign: 'left',
  },
  sumGoal: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    margin: '10px 0 0',
  },
  editBtn: {
    marginTop: '12px',
    minHeight: '40px',
    width: '100%',
    padding: '9px 16px',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },

  // stones summary
  stoneChips: { display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '10px' },
  stoneChip: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: '5px',
    padding: '4px 10px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px',
  },
  stoneChipAccent: {
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
  },
  stoneChipValue: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '13px',
    color: tokens.color.charcoal,
  },
  stoneChipLabel: { fontFamily: tokens.font.body, fontSize: '11px', color: tokens.color.inkSoft },
  stonesEmpty: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    lineHeight: 1.6,
    color: tokens.color.inkFaint,
    margin: '10px 0 0',
  },

  // ---- central work area ----
  work: {
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.soft,
    overflow: 'hidden',
    minWidth: 0,
  },
  workTabs: {
    display: 'flex',
    gap: '4px',
    padding: '10px 12px',
    borderBottom: `1px solid ${tokens.color.cardEdge}`,
    background: tokens.color.pearl,
    flexWrap: 'wrap',
  },
  workTab: {
    padding: '8px 16px',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.inkSoft,
    background: 'transparent',
    border: `1px solid transparent`,
    borderRadius: '999px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  workTabActive: {
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.goldSoft}`,
  },
  workBody: { padding: '16px 18px 20px', minWidth: 0 },

  // ---- docked action bar ----
  dock: {
    position: 'sticky',
    bottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    padding: '12px 16px',
    background: tokens.color.charcoal,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.lift,
    zIndex: 5,
  },
  dockText: { display: 'flex', alignItems: 'baseline', gap: '6px', minWidth: 0, flexWrap: 'wrap' },
  dockPrefix: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.goldSoft },
  dockLabel: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 700,
    color: tokens.color.ivory,
  },
  dockBtn: {
    minHeight: '46px',
    padding: '11px 22px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.goldSoft,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  toast: {
    position: 'fixed',
    left: '50%',
    bottom: '92px',
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
