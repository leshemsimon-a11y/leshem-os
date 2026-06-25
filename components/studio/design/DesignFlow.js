// components/studio/design/DesignFlow.js
//
// LESHEM.S OS — Design Studio Flow (Clean 5B.1)
//
// A calm, premium, client-facing 3-stage flow that replaces the long scroll of
// stacked zones inside the Design Studio. It does NOT rewrite the working
// panels — it ORCHESTRATES them:
//
//   Stage 1  בחירת כיוון   — DesignConceptPanel view="direction"
//   Stage 2  כיווני עיצוב  — DesignConceptPanel view="concepts"
//   Stage 3  פלט עיצוב     — DesignOutputPanel
//
// Behavior:
//   • Only the ACTIVE stage is expanded and visually dominant.
//   • Completed/other stages collapse into elegant, reopenable summary cards.
//   • A sticky next-step bar always shows ONE obvious primary action.
//   • Stale awareness is surfaced inside the relevant panels (concepts/output),
//     and the next-step bar nudges toward the right action.
//   • Calm success toasts confirm actions (no scary overwrite language).
//
// Local only. No new packages. No network, no Airtable, no pricing, no render.
// The Active Work sync fix from Clean 5B is preserved by the panels themselves.

import * as React from 'react';
import { tokens } from '../shared/tokens';
import { FLOW_HE, CONCEPT_HE, OUTPUT_HE } from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignBrief } from '../../../lib/studio/designBriefStore';
import {
  getSelectedConcept,
  getActiveOutput,
  conceptsAreStale,
  outputIsStale,
} from '../../../lib/studio/designDraft';
import DesignConceptPanel from './DesignConceptPanel';
import DesignOutputPanel from './DesignOutputPanel';

const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);

const STAGES = ['direction', 'concepts', 'output'];

// Decide the recommended next step + which stage should be active by default.
function computeFlowState(brief, trayItems) {
  const concepts = Array.isArray(brief.concepts) ? brief.concepts : [];
  const hasConcepts = concepts.length > 0;
  const selected = getSelectedConcept(brief);
  const output = getActiveOutput(brief);
  const conceptsStale = conceptsAreStale(brief, trayItems);
  const outStale = outputIsStale(brief, trayItems);

  // Has the user begun to set a direction at all?
  const hasDirection = Boolean(
    brief.productType ||
      brief.styleDirection ||
      brief.metalPreference ||
      brief.stoneUsage ||
      (brief.designGoal && brief.designGoal.trim())
  );

  let nextKey;
  let suggestedStage;
  if (!hasConcepts) {
    nextKey = hasDirection ? 'generateConcepts' : 'fillDirection';
    suggestedStage = hasDirection ? 'concepts' : 'direction';
  } else if (conceptsStale) {
    nextKey = 'generateConcepts';
    suggestedStage = 'concepts';
  } else if (!selected) {
    nextKey = 'chooseConcept';
    suggestedStage = 'concepts';
  } else if (!output || outStale) {
    nextKey = 'generateOutput';
    suggestedStage = 'output';
  } else {
    nextKey = 'saveOutput';
    suggestedStage = 'output';
  }

  return {
    hasConcepts,
    hasDirection,
    selected,
    output,
    conceptsStale,
    outStale,
    nextKey,
    suggestedStage,
  };
}

// Collapsed summary line for a stage.
function stageSummary(stage, brief, flow) {
  if (stage === 'direction') {
    const pt = brief.productType ? CONCEPT_HE.productType[brief.productType] : null;
    return pt || FLOW_HE.summary.directionEmpty;
  }
  if (stage === 'concepts') {
    if (flow.selected) return FLOW_HE.summary.conceptChosenPrefix + flow.selected.conceptName;
    if (flow.hasConcepts) return FLOW_HE.summary.conceptsCountPrefix + brief.concepts.length;
    return FLOW_HE.summary.noConcepts;
  }
  // output
  if (flow.output) return FLOW_HE.summary.outputReady;
  return FLOW_HE.summary.noOutput;
}

function StageHeader({ index, stage, active, done, summary, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        ...styles.stageHeader,
        ...(active ? styles.stageHeaderActive : null),
      }}
      dir="rtl"
      aria-expanded={active}
    >
      <span style={styles.stageHeaderRight}>
        <span
          style={{
            ...styles.stageNum,
            ...(active ? styles.stageNumActive : done ? styles.stageNumDone : null),
          }}
          aria-hidden="true"
        >
          {done && !active ? '✓' : index}
        </span>
        <span style={styles.stageTitleWrap}>
          <span style={styles.stageTitle}>{FLOW_HE.stages[stage]}</span>
          {!active && <span style={styles.stageSummary}>{summary}</span>}
        </span>
      </span>
      {!active && <span style={styles.stageOpen}>{FLOW_HE.reopen}</span>}
    </button>
  );
}

export default function DesignFlow() {
  const tray = useWorkTray();
  const briefStore = useDesignBrief();
  const [activeStage, setActiveStage] = React.useState('direction');
  const [userPicked, setUserPicked] = React.useState(false);
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

  // If the user hasn't manually chosen a stage yet, follow the suggested stage
  // so the flow always opens on the most relevant step.
  const effectiveStage = userPicked ? activeStage : flow.suggestedStage;

  const openStage = (stage) => {
    setUserPicked(true);
    setActiveStage(stage);
  };

  // The next-step bar's primary action routes to the right stage (and the
  // panel inside handles the actual generate/select/save).
  const nextStageForKey = {
    fillDirection: 'direction',
    generateConcepts: 'concepts',
    chooseConcept: 'concepts',
    generateOutput: 'output',
    saveOutput: 'output',
    allDone: 'output',
  };
  const handleNext = () => {
    const target = nextStageForKey[flow.nextKey] || 'direction';
    openStage(target);
  };

  return (
    <div style={styles.flow} dir="rtl">
      {STAGES.map((stage, i) => {
        const active = stage === effectiveStage;
        const done =
          (stage === 'direction' && flow.hasDirection) ||
          (stage === 'concepts' && Boolean(flow.selected)) ||
          (stage === 'output' && Boolean(flow.output) && !flow.outStale);
        return (
          <div
            key={stage}
            style={{ ...styles.stageCard, ...(active ? styles.stageCardActive : null) }}
          >
            <StageHeader
              index={i + 1}
              stage={stage}
              active={active}
              done={done}
              summary={stageSummary(stage, brief, flow)}
              onOpen={() => openStage(stage)}
            />
            {active && (
              <div style={styles.stageBody}>
                {stage === 'direction' && (
                  <DesignConceptPanel view="direction" onToast={showToast} />
                )}
                {stage === 'concepts' && (
                  <DesignConceptPanel view="concepts" onToast={showToast} />
                )}
                {stage === 'output' && <DesignOutputPanel onToast={showToast} />}
              </div>
            )}
          </div>
        );
      })}

      {/* Sticky next-step bar — one obvious primary action */}
      <div style={styles.nextBar} dir="rtl">
        <div style={styles.nextText}>
          <span style={styles.nextPrefix}>{FLOW_HE.nextStepPrefix}</span>
          <span style={styles.nextLabel}>{FLOW_HE.next[flow.nextKey]}</span>
        </div>
        {flow.nextKey !== 'allDone' && (
          <button type="button" onClick={handleNext} style={styles.nextBtn}>
            {FLOW_HE.next[flow.nextKey]}
          </button>
        )}
      </div>

      {/* Calm success toast */}
      {toast && (
        <div style={styles.toast} dir="rtl" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

const styles = {
  flow: { display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '84px' },
  loading: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    color: tokens.color.inkFaint,
    padding: '40px 0',
    textAlign: 'center',
  },
  stageCard: {
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
  },
  stageCardActive: {
    border: `1px solid ${tokens.color.goldSoft}`,
    boxShadow: tokens.shadow.soft,
  },
  stageHeader: {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '16px 18px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'right',
  },
  stageHeaderActive: {
    background: tokens.color.pearl,
    cursor: 'default',
  },
  stageHeaderRight: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 },
  stageNum: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.cardEdge}`,
  },
  stageNumActive: {
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
  },
  stageNumDone: {
    color: tokens.color.charcoal,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
  },
  stageTitleWrap: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  stageTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '18px',
    color: tokens.color.charcoal,
  },
  stageSummary: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkSoft,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '60vw',
  },
  stageOpen: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.gold,
    flexShrink: 0,
  },
  stageBody: {
    padding: '4px 18px 20px',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
  },
  // sticky next-step bar
  nextBar: {
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
  nextText: { display: 'flex', alignItems: 'baseline', gap: '6px', minWidth: 0, flexWrap: 'wrap' },
  nextPrefix: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.goldSoft },
  nextLabel: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 700,
    color: tokens.color.ivory,
  },
  nextBtn: {
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
    bottom: '88px',
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
