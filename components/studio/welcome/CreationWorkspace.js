// components/studio/welcome/CreationWorkspace.js
//
// LESHEM.S OS — Clean 8K-R2: Welcome Studio + One Flow Experience.
//
// The single creation workspace (section 7): top bar (creation name / short
// state / "נשמר אוטומטית"), center content (ONLY the current stage's
// content — understanding, directions, selected direction, render
// preparation, results), and a persistent bottom Smart Command field. ONE
// dominant primary action per stage (section 8); everything else lives
// under "אפשרויות נוספות".
//
// Reuses the EXISTING protected panels directly for the parts that already
// work — DesignConceptPanel (directions) and DesignOutputPanel (output) —
// exactly the way components/studio/design/shell/StudioShell.js already
// does. Reuses the Clean 8K AdvisorPanel and SmartCommandBar as-is. This
// file adds NO new business logic for directions/output generation; it only
// arranges which existing piece is visible for the current stage and wires
// the small set of path-specific intake actions (Clean 8K-R2 section 3-6)
// to callbacks owned by the caller (WelcomeCreationFlow.js).

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
              <button type="button" style={styles.choiceBtn} onClick={() => onChooseProductOffer('ring')}>
                {STONE_FIRST_HE.offerRing}
              </button>
              <button type="button" style={styles.choiceBtn} onClick={() => onChooseProductOffer('pendant')}>
                {STONE_FIRST_HE.offerPendant}
              </button>
              <button type="button" style={styles.choiceBtn} onClick={() => onChooseProductOffer('earrings')}>
                {STONE_FIRST_HE.offerEarrings}
              </button>
              <button type="button" style={styles.choiceBtn} onClick={() => onChooseProductOffer(null)}>
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
            <button type="button" style={styles.primaryChoiceBtn} onClick={onOpenStonePicker}>
              בחר מהמלאי
            </button>
            <button type="button" style={styles.choiceBtn} onClick={onOpenUpload}>
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
            <button type="button" style={styles.choiceBtn} onClick={onOpenUpload}>
              צרף קובץ
            </button>
          </div>
          <div style={styles.choiceRow}>
            <button
              type="button"
              style={styles.choiceBtn}
              onClick={() => {
                const value = ideaText.trim();
                if (value) onSubmitIdeaText(value);
                onOpenStonePicker();
              }}
            >
              {IDEA_FIRST_HE.matchStones}
            </button>
            <button type="button" style={styles.primaryChoiceBtn} onClick={submitIdea}>
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
              <button type="button" style={styles.choiceBtn} onClick={() => onChooseCollectionCharacter('commercial')}>
                {COLLECTION_HE.characterCommercial}
              </button>
              <button type="button" style={styles.choiceBtn} onClick={() => onChooseCollectionCharacter('luxury')}>
                {COLLECTION_HE.characterLuxury}
              </button>
              <button type="button" style={styles.choiceBtn} onClick={() => onChooseCollectionCharacter('capsule')}>
                {COLLECTION_HE.characterCapsule}
              </button>
              <button type="button" style={styles.choiceBtn} onClick={() => onChooseCollectionCharacter('signature')}>
                {COLLECTION_HE.characterSignature}
              </button>
            </div>
            <button type="button" style={styles.primaryChoiceBtn} onClick={onPrimaryAction}>
              {COLLECTION_HE.startDeveloping}
            </button>
          </div>
        );
      }
      return (
        <div style={styles.block}>
          <p style={styles.line}>{COLLECTION_HE.chooseStones}</p>
          <button type="button" style={styles.primaryChoiceBtn} onClick={onOpenStonePicker}>
            בחר אבנים מהמלאי
          </button>
        </div>
      );
    }

    if (path === ENTRY_PATH.EXISTING) {
      return (
        <div style={styles.block}>
          <div style={styles.choiceRow}>
            <button type="button" style={styles.primaryChoiceBtn} onClick={onOpenUpload}>
              העלה תמונה / סקיצה / מודל
            </button>
            {resumableProjectName ? (
              <button type="button" style={styles.choiceBtn} onClick={onResumeProject}>
                המשך את {resumableProjectName}
              </button>
            ) : null}
          </div>
          <p style={styles.line}>{EXISTING_HE.whatToDo}</p>
          <div style={styles.choiceRow}>
            <button type="button" style={styles.choiceBtn} onClick={() => onChooseExistingAction('change')}>
              {EXISTING_HE.changeDesign}
            </button>
            <button type="button" style={styles.choiceBtn} onClick={() => onChooseExistingAction('variation')}>
              {EXISTING_HE.developVariation}
            </button>
            <button type="button" style={styles.choiceBtn} onClick={() => onChooseExistingAction('presentation')}>
              {EXISTING_HE.prepareForPresentation}
            </button>
            <button type="button" style={styles.choiceBtn} onClick={() => onChooseExistingAction('continue')}>
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
            {advisorInsight && advisorInsight.recommendationHe ? (
              <p style={styles.advisorLine}>{advisorInsight.recommendationHe}</p>
            ) : null}
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

  return (
    <div style={styles.wrap} dir="rtl">
      <div style={styles.topBar}>
        <span style={styles.creationName}>{creationName || WORKSPACE_HE.untitled}</span>
        <span style={styles.stateLabel}>{stateLabel}</span>
        {isSaved ? <span style={styles.autoSaved}>{WORKSPACE_HE.autoSaved}</span> : null}
        <button type="button" onClick={onOpenMore} style={styles.moreLink}>
          {WORKSPACE_HE.moreOptions}
        </button>
      </div>

      <div style={styles.center}>{renderCenter()}</div>

      {showExternalActions ? (
        <div style={styles.actionsRow}>
          <button type="button" onClick={onPrimaryAction} style={styles.primaryBtn}>
            {primaryLabel}
          </button>
        </div>
      ) : null}

      <div style={styles.bottomBar}>
        <SmartCommandBar onSubmitCommand={onSubmitCommand} placeholder={WORKSPACE_HE.commandPlaceholder} />
      </div>
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
  advisorLine: {
    margin: 0,
    fontFamily: reset.font.body,
    fontSize: '13px',
    color: reset.color.textMuted,
    lineHeight: 1.5,
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
