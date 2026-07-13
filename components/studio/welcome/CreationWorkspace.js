// components/studio/welcome/CreationWorkspace.js
//
// LESHEM.S OS — Clean 8K-R3: Atelier Experience System (visual redesign of
// the Clean 8K-R2 single creation workspace).
//
// Exactly four visible layers (section 3), never more:
//   A. Compact top context bar — creation name / short state / "נשמר
//      אוטומטית" / a compact options control.
//   B. Large central canvas — the current stage's content only.
//   C. One-line professional recommendation — ALWAYS shown when available,
//      across every stage (not a multi-section advisor panel — that would
//      violate QA item 10's "without a large advisor panel"; the Clean 8K
//      AdvisorPanel component itself is untouched and still used elsewhere,
//      this file just stopped rendering it here).
//   D. Persistent Smart Command at the bottom.
//
// No permanent left/right detail panels ever render here (there were none
// to remove — this file never had them). Reuses the EXISTING protected
// panels directly for the parts that already work — DesignConceptPanel
// (directions) and DesignOutputPanel (output) — exactly the way
// components/studio/design/shell/StudioShell.js already does. This file
// adds NO new business logic for directions/output generation; it only
// arranges which existing piece is visible for the current stage and wires
// the small set of path-specific intake actions to callbacks owned by the
// caller (WelcomeCreationFlow.js).

import * as React from 'react';
import { reset } from '../design/shell/studioResetStyle';
import DesignConceptPanel from '../design/DesignConceptPanel';
import DesignOutputPanel from '../design/DesignOutputPanel';
import SmartCommandBar from '../shared/SmartCommandBar';
import {
  ENTRY_PATH,
  WORKSPACE_STAGE,
  WORKSPACE_HE,
  STONE_FIRST_HE,
  IDEA_FIRST_HE,
  COLLECTION_HE,
  EXISTING_HE,
  primaryActionHe,
  stageStateHe,
  buildWelcomeUnderstandingHe,
  buildCollectionSummaryHe,
} from '../../../lib/studio/creationOrchestrator';

export default function CreationWorkspace({
  path,
  creationName,
  isSaved,
  stage,
  hasStones,
  trayItems,
  brief,
  selected,
  advisorInsight,
  outputPackSummaryHe,
  renderPlanSummaryHe,
  onPrimaryAction,
  onOpenStonePicker,
  onOpenUpload,
  onChooseProductOffer,
  onSubmitIdeaText,
  onChooseCollectionCharacter,
  onChooseExistingAction,
  onResumeProject,
  resumableProjectName,
  onOpenMore,
  onSubmitCommand,
  onToast,
}) {
  const [ideaText, setIdeaText] = React.useState('');

  const submitIdea = () => {
    const value = ideaText.trim();
    if (!value || typeof onSubmitIdeaText !== 'function') return;
    onSubmitIdeaText(value);
    setIdeaText('');
  };

  const primaryLabel = primaryActionHe(stage);
  const stateLabel = stageStateHe(stage);

  // ------------------------------------------------------------------
  // Intake-stage content — the ONLY place this component branches on
  // `path`. Every later stage is identical across all four paths.
  // ------------------------------------------------------------------
  const renderIntake = () => {
    if (path === ENTRY_PATH.STONE) {
      if (hasStones && !brief.productType) {
        return (
          <div style={styles.block}>
            <p style={styles.line}>{STONE_FIRST_HE.afterStone}</p>
            <div style={styles.choiceRow}>
              <button type="button" className="cw-choice-btn" style={styles.choiceBtn} onClick={() => onChooseProductOffer('ring')}>
                {STONE_FIRST_HE.offerRing}
              </button>
              <button type="button" className="cw-choice-btn" style={styles.choiceBtn} onClick={() => onChooseProductOffer('pendant')}>
                {STONE_FIRST_HE.offerPendant}
              </button>
              <button type="button" className="cw-choice-btn" style={styles.choiceBtn} onClick={() => onChooseProductOffer('earrings')}>
                {STONE_FIRST_HE.offerEarrings}
              </button>
              <button type="button" className="cw-choice-btn" style={styles.choiceBtn} onClick={() => onChooseProductOffer(null)}>
                {STONE_FIRST_HE.offerLetSystemSuggest}
              </button>
            </div>
          </div>
        );
      }
      return (
        <div style={styles.block}>
          <p style={styles.line}>{STONE_FIRST_HE.chooseStone}</p>
          <div style={styles.choiceRow}>
            <button type="button" className="cw-primary-choice-btn" style={styles.primaryChoiceBtn} onClick={onOpenStonePicker}>
              בחר מהמלאי
            </button>
            <button type="button" className="cw-choice-btn" style={styles.choiceBtn} onClick={onOpenUpload}>
              הוסף תמונה
            </button>
          </div>
        </div>
      );
    }

    if (path === ENTRY_PATH.IDEA) {
      return (
        <div style={styles.block}>
          <p style={styles.line}>{IDEA_FIRST_HE.prompt}</p>
          <div style={styles.textRow}>
            <input
              type="text"
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submitIdea();
                }
              }}
              placeholder={IDEA_FIRST_HE.prompt}
              style={styles.textInput}
            />
            <button type="button" className="cw-choice-btn" style={styles.choiceBtn} onClick={onOpenUpload}>
              צרף קובץ
            </button>
          </div>
          <div style={styles.choiceRow}>
            <button
              type="button"
              className="cw-choice-btn"
              style={styles.choiceBtn}
              onClick={() => {
                const value = ideaText.trim();
                if (value) onSubmitIdeaText(value);
                onOpenStonePicker();
              }}
            >
              {IDEA_FIRST_HE.matchStones}
            </button>
            <button type="button" className="cw-primary-choice-btn" style={styles.primaryChoiceBtn} onClick={submitIdea}>
              {IDEA_FIRST_HE.continueAsConcept}
            </button>
          </div>
        </div>
      );
    }

    if (path === ENTRY_PATH.COLLECTION) {
      if (hasStones) {
        return (
          <div style={styles.block}>
            <p style={styles.line}>{buildCollectionSummaryHe(trayItems)}</p>
            <p style={styles.line}>{COLLECTION_HE.characterPrompt}</p>
            <div style={styles.choiceRow}>
              <button type="button" className="cw-choice-btn" style={styles.choiceBtn} onClick={() => onChooseCollectionCharacter('commercial')}>
                {COLLECTION_HE.characterCommercial}
              </button>
              <button type="button" className="cw-choice-btn" style={styles.choiceBtn} onClick={() => onChooseCollectionCharacter('luxury')}>
                {COLLECTION_HE.characterLuxury}
              </button>
              <button type="button" className="cw-choice-btn" style={styles.choiceBtn} onClick={() => onChooseCollectionCharacter('capsule')}>
                {COLLECTION_HE.characterCapsule}
              </button>
              <button type="button" className="cw-choice-btn" style={styles.choiceBtn} onClick={() => onChooseCollectionCharacter('signature')}>
                {COLLECTION_HE.characterSignature}
              </button>
            </div>
            <button type="button" className="cw-primary-choice-btn" style={styles.primaryChoiceBtn} onClick={onPrimaryAction}>
              {COLLECTION_HE.startDeveloping}
            </button>
          </div>
        );
      }
      return (
        <div style={styles.block}>
          <p style={styles.line}>{COLLECTION_HE.chooseStones}</p>
          <button type="button" className="cw-primary-choice-btn" style={styles.primaryChoiceBtn} onClick={onOpenStonePicker}>
            בחר אבנים מהמלאי
          </button>
        </div>
      );
    }

    if (path === ENTRY_PATH.EXISTING) {
      return (
        <div style={styles.block}>
          <div style={styles.choiceRow}>
            <button type="button" className="cw-primary-choice-btn" style={styles.primaryChoiceBtn} onClick={onOpenUpload}>
              העלה תמונה / סקיצה / מודל
            </button>
            {resumableProjectName ? (
              <button type="button" className="cw-choice-btn" style={styles.choiceBtn} onClick={onResumeProject}>
                המשך את {resumableProjectName}
              </button>
            ) : null}
          </div>
          <p style={styles.line}>{EXISTING_HE.whatToDo}</p>
          <div style={styles.choiceRow}>
            <button type="button" className="cw-choice-btn" style={styles.choiceBtn} onClick={() => onChooseExistingAction('change')}>
              {EXISTING_HE.changeDesign}
            </button>
            <button type="button" className="cw-choice-btn" style={styles.choiceBtn} onClick={() => onChooseExistingAction('variation')}>
              {EXISTING_HE.developVariation}
            </button>
            <button type="button" className="cw-choice-btn" style={styles.choiceBtn} onClick={() => onChooseExistingAction('presentation')}>
              {EXISTING_HE.prepareForPresentation}
            </button>
            <button type="button" className="cw-choice-btn" style={styles.choiceBtn} onClick={() => onChooseExistingAction('continue')}>
              {EXISTING_HE.continueExisting}
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderCenter = () => {
    switch (stage) {
      case WORKSPACE_STAGE.INTAKE:
        return renderIntake();
      case WORKSPACE_STAGE.UNDERSTANDING:
        return (
          <div style={styles.block}>
            <p style={styles.understandingLine}>
              {buildWelcomeUnderstandingHe({ trayItems, brief })}
            </p>
          </div>
        );
      case WORKSPACE_STAGE.DIRECTIONS:
        return (
          <div style={styles.panelWrap}>
            <DesignConceptPanel view="concepts" onToast={onToast} suppressStaleBanner />
          </div>
        );
      case WORKSPACE_STAGE.SELECTED:
      case WORKSPACE_STAGE.OUTPUT:
        return (
          <div style={styles.panelWrap}>
            <DesignOutputPanel onToast={onToast} suppressStaleBanner />
            {outputPackSummaryHe ? <p style={styles.autoLine}>{outputPackSummaryHe}</p> : null}
            {renderPlanSummaryHe ? <p style={styles.autoLine}>{renderPlanSummaryHe}</p> : null}
          </div>
        );
      default:
        return null;
    }
  };

  // The external primary-action bar only appears at the 'understanding'
  // stage, bridging into the existing DesignConceptPanel. Once that panel
  // (or DesignOutputPanel) is visible, it already owns its own single
  // primary action internally — showing a second, external one here would
  // be redundant and could read as non-functional.
  const showExternalActions = stage === WORKSPACE_STAGE.UNDERSTANDING;

  // Layer C — ONE short professional recommendation line, always shown
  // (any stage) when available. Deliberately just the single
  // `recommendationHe` sentence, never the full multi-section Advisor
  // Panel (QA item 10: "without a large advisor panel").
  const recommendationLine = advisorInsight ? advisorInsight.recommendationHe : null;

  return (
    <div style={styles.wrap} dir="rtl">
      <div style={styles.topBar}>
        <span style={styles.creationName}>{creationName || WORKSPACE_HE.untitled}</span>
        <span style={styles.stateLabel}>{stateLabel}</span>
        {isSaved ? <span style={styles.autoSaved}>{WORKSPACE_HE.autoSaved}</span> : null}
        <button type="button" onClick={onOpenMore} className="cw-more-link" style={styles.moreLink}>
          {WORKSPACE_HE.moreOptions}
        </button>
      </div>

      <div style={styles.center}>{renderCenter()}</div>

      {recommendationLine ? <p style={styles.recommendationLine}>{recommendationLine}</p> : null}

      {showExternalActions ? (
        <div style={styles.actionsRow}>
          <button type="button" onClick={onPrimaryAction} className="cw-primary-btn" style={styles.primaryBtn}>
            {primaryLabel}
          </button>
        </div>
      ) : null}

      <div style={styles.bottomBar}>
        <SmartCommandBar onSubmitCommand={onSubmitCommand} placeholder={WORKSPACE_HE.commandPlaceholder} />
      </div>

      {/* Real CSS hover/focus-visible states — see WelcomeStudio.js for
          why a scoped styled-jsx block is used instead of inline styles. */}
      <style jsx>{`
        .cw-more-link,
        .cw-primary-btn,
        :global(.cw-choice-btn),
        :global(.cw-primary-choice-btn) {
          transition: background ${reset.transition.fast}, border-color ${reset.transition.fast},
            opacity ${reset.transition.fast};
        }
        .cw-more-link:hover,
        .cw-more-link:focus-visible {
          border-color: ${reset.color.borderStrong};
          color: ${reset.color.text};
        }
        .cw-primary-btn:hover,
        .cw-primary-btn:focus-visible,
        :global(.cw-primary-choice-btn:hover),
        :global(.cw-primary-choice-btn:focus-visible) {
          opacity: 0.88;
        }
        :global(.cw-choice-btn:hover),
        :global(.cw-choice-btn:focus-visible) {
          border-color: ${reset.color.borderStrong};
          background: ${reset.color.page};
        }
        .cw-more-link:focus-visible,
        .cw-primary-btn:focus-visible,
        :global(.cw-choice-btn:focus-visible),
        :global(.cw-primary-choice-btn:focus-visible) {
          outline: 2px solid ${reset.color.accent};
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrap: {
    width: '100%',
    height: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    padding: '18px 24px 24px',
    boxSizing: 'border-box',
    background: reset.color.page,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  creationName: {
    fontFamily: reset.font.display,
    fontSize: '16px',
    fontWeight: 700,
    color: reset.color.text,
  },
  stateLabel: {
    fontFamily: reset.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: reset.color.textMuted,
    padding: '3px 10px',
    borderRadius: '999px',
    border: `1px solid ${reset.color.border}`,
  },
  autoSaved: {
    fontFamily: reset.font.body,
    fontSize: '11.5px',
    color: reset.color.textFaint,
  },
  moreLink: {
    marginInlineStart: 'auto',
    minHeight: '28px',
    padding: '4px 12px',
    borderRadius: '999px',
    border: `1px solid ${reset.color.border}`,
    background: 'transparent',
    color: reset.color.textMuted,
    fontFamily: reset.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  center: {
    flex: '1 1 auto',
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    // Clean 8K-R3 — generous inner breathing room so the canvas reads as
    // the visually dominant layer (section 3.B), not a cramped strip
    // between the top bar and the recommendation line.
    padding: `${reset.space.md} 0`,
  },
  // Layer C — one-line professional recommendation (section 3.C). Always
  // shown across every stage when available; deliberately just one line,
  // never a boxed panel, so it reads as a quiet aside rather than a
  // competing focal point.
  recommendationLine: {
    margin: 0,
    flexShrink: 0,
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    fontWeight: 600,
    color: reset.color.textMuted,
    paddingInlineStart: reset.space.sm,
    borderInlineStart: `2px solid ${reset.color.accent}`,
  },
  panelWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  block: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '620px',
  },
  line: {
    margin: 0,
    fontFamily: reset.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: reset.color.text,
  },
  understandingLine: {
    margin: 0,
    fontFamily: reset.font.body,
    fontSize: '15px',
    fontWeight: 600,
    color: reset.color.text,
  },
  autoLine: {
    margin: 0,
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    color: reset.color.textMuted,
  },
  choiceRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  textRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  textInput: {
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: '38px',
    padding: '8px 13px',
    borderRadius: reset.radius.md,
    border: `1px solid ${reset.color.borderStrong}`,
    background: reset.color.panel,
    color: reset.color.text,
    fontFamily: reset.font.body,
    fontSize: '13px',
  },
  choiceBtn: {
    minHeight: '34px',
    padding: '7px 15px',
    borderRadius: '999px',
    border: `1px solid ${reset.color.borderStrong}`,
    background: reset.color.panel,
    color: reset.color.text,
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  primaryChoiceBtn: {
    minHeight: '34px',
    padding: '7px 17px',
    borderRadius: '999px',
    border: 'none',
    background: reset.color.primaryBg,
    color: reset.color.primaryText,
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  primaryBtn: {
    minHeight: '38px',
    padding: '9px 22px',
    borderRadius: '999px',
    border: 'none',
    background: reset.color.primaryBg,
    color: reset.color.primaryText,
    fontFamily: reset.font.body,
    fontSize: '13.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  bottomBar: {
    flexShrink: 0,
    paddingTop: '8px',
    borderTop: `1px solid ${reset.color.border}`,
  },
};
