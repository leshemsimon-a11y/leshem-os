import { useMemo, useState } from 'react';
import styles from './atelier.module.css';
import IntakeArea from './IntakeArea';
import PendantVisualizer from './PendantVisualizer';
import {
  ProductPanel,
  StylePanel,
  MetalPanel,
  SettingPanel,
  MeleePanel,
  FindingsPanel,
} from './DesignPalette';
import { stoneAvailabilityHe } from '../../lib/atelier/atelierBridge';

// ---------------------------------------------------------------------------
// Clean 11A.3 — guided flow.
// The intent phase used to be one long scrolling form holding the stone, the
// request, six component groups and the reference drawer at once. It is now
// four deliberate steps, one decision at a time, mobile-first.
// Nothing about the data or the selection logic changed.
// ---------------------------------------------------------------------------

const STEPS = [
  { id: 'stone', he: 'האבן', title: 'מאיזו אבן מתחילים?' },
  { id: 'piece', he: 'התכשיט', title: 'מה בונים סביבה?' },
  { id: 'metal', he: 'המתכת', title: 'באיזו מתכת נייצר?' },
  { id: 'components', he: 'הרכיבים', title: 'איך היא מוחזקת?' },
];

// The stone's own photograph is the anchor of the whole screen. When the
// inventory record genuinely has no image, we show its real gemological data
// rather than a generic stock photo — an honest card beats a fake one.
function StoneMedia({ snapshot, onOpen }) {
  const image = snapshot ? snapshot.primaryImage || snapshot.boxImage : null;
  const name = snapshot ? snapshot.titleHe || snapshot.name : null;

  if (!snapshot) {
    return (
      <button type="button" className={styles.stoneEmptyCard} onClick={onOpen}>
        <span className={styles.stoneEmptyMark} aria-hidden="true" />
        <strong>בחר אבן מהמלאי</strong>
        <small>המלאי ייפתח בלי לעזוב את היצירה</small>
      </button>
    );
  }

  if (image) {
    return (
      <div className={styles.stoneMediaFrame}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={name || ''} className={styles.stoneMediaImage} />
      </div>
    );
  }

  return (
    <div className={`${styles.stoneMediaFrame} ${styles.stoneMediaSpec}`}>
      <span className={styles.stoneSpecKicker}>אבן מהמלאי</span>
      <strong className={styles.stoneSpecName}>{name || 'אבן'}</strong>
      <span className={styles.stoneSpecMeta}>
        {[snapshot.stoneTypeHe, snapshot.shapeHe].filter(Boolean).join(' · ')}
      </span>
      {snapshot.caratWeight ? (
        <span className={styles.stoneSpecCarat}>{snapshot.caratWeight} קראט</span>
      ) : null}
      <small className={styles.stoneSpecNote}>לרשומה זו עדיין לא צורף צילום</small>
    </div>
  );
}

export default function StoneRequestScreen({
  centerStone,
  trayItems,
  onOpenStoneDrawer,
  requestText,
  onRequestChange,
  designConfig,
  onDesignConfigChange,
  liveUnderstanding,
  intakeItems,
  onAddFiles,
  onAddText,
  onRemoveIntakeItem,
  onBack,
  onContinue,
  canContinue,
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];

  const snapshot = centerStone ? centerStone.snapshot || {} : null;
  const stoneName = snapshot ? snapshot.titleHe || snapshot.name : null;
  const extraStoneCount = Math.max(0, (Array.isArray(trayItems) ? trayItems.length : 0) - 1);
  const productMissing = !liveUnderstanding || !liveUnderstanding.product;

  // Each step states its own precondition, so the user is never blocked by a
  // requirement that belongs to a different step.
  const stepReady = useMemo(() => {
    if (step.id === 'stone') return Boolean(centerStone);
    if (step.id === 'piece') return !productMissing;
    return true;
  }, [step.id, centerStone, productMissing]);

  const isLastStep = stepIndex === STEPS.length - 1;

  const handleBack = () => {
    if (stepIndex === 0) {
      onBack();
      return;
    }
    setStepIndex((value) => value - 1);
  };

  const handleForward = () => {
    if (!isLastStep) {
      setStepIndex((value) => value + 1);
      return;
    }
    onContinue();
  };

  const forwardDisabled = isLastStep ? !canContinue : !stepReady;
  const forwardLabel = isLastStep ? 'המשך למה שהבנתי' : 'המשך';

  const hintText = (() => {
    if (step.id === 'stone' && !centerStone) return 'בחר אבן כדי להמשיך';
    if (step.id === 'piece' && productMissing) return 'בחר סוג תכשיט';
    return '';
  })();

  return (
    <div className={styles.guidedScreen}>
      {/* Progress through the four decisions. */}
      <nav className={styles.guidedSteps} aria-label={`שלב ${stepIndex + 1} מתוך ${STEPS.length}`}>
        {STEPS.map((item, index) => {
          const state = index === stepIndex ? 'active' : index < stepIndex ? 'complete' : 'idle';
          return (
            <button
              key={item.id}
              type="button"
              className={styles.guidedStep}
              data-state={state}
              onClick={() => index < stepIndex && setStepIndex(index)}
              disabled={index > stepIndex}
              aria-current={index === stepIndex ? 'step' : undefined}
            >
              <span className={styles.guidedStepIndex}>{index + 1}</span>
              <span className={styles.guidedStepLabel}>{item.he}</span>
            </button>
          );
        })}
      </nav>

      <div className={styles.guidedBody}>
        {/* The piece being built stays visible at every step. */}
        <aside className={styles.guidedPreview}>
          <StoneMedia snapshot={snapshot} onOpen={onOpenStoneDrawer} />

          {snapshot ? (
            <div className={styles.guidedStoneRow}>
              <div className={styles.guidedStoneCopy}>
                <strong>{stoneName}</strong>
                <span>
                  {[snapshot.stoneTypeHe, snapshot.shapeHe].filter(Boolean).join(' · ')}
                  {snapshot.caratWeight ? ` · ${snapshot.caratWeight} קראט` : ''}
                </span>
              </div>
              <div className={styles.guidedStoneBadges}>
                <span>{stoneAvailabilityHe(snapshot.status)}</span>
                {extraStoneCount > 0 ? <span>+{extraStoneCount}</span> : null}
              </div>
            </div>
          ) : null}

          <button type="button" className={styles.ghostBtn} onClick={onOpenStoneDrawer}>
            {centerStone ? 'שנה בחירת אבנים' : 'פתח את המלאי'}
          </button>

          {stepIndex > 0 ? (
            <div className={styles.guidedStructure}>
              <PendantVisualizer
                config={designConfig}
                shape={snapshot && snapshot.shape}
                stoneType={snapshot && snapshot.stoneType}
                stoneTypeHe={snapshot && snapshot.stoneTypeHe}
                compact
              />
              <small>המחשת מבנה — לא הדמיה סופית</small>
            </div>
          ) : null}

          {liveUnderstanding && liveUnderstanding.specSummaryHe ? (
            <div className={styles.guidedSpec}>
              <span className={styles.guidedSpecLabel}>מפרט נוכחי</span>
              <p>{liveUnderstanding.specSummaryHe}</p>
            </div>
          ) : null}
        </aside>

        {/* One decision at a time. */}
        <section className={styles.guidedPanel}>
          <header className={styles.guidedPanelHead}>
            <span className={styles.eyebrow}>
              שלב {stepIndex + 1} מתוך {STEPS.length}
            </span>
            <h1 className={styles.guidedPanelTitle}>{step.title}</h1>
          </header>

          {step.id === 'stone' ? (
            <>
              <div className={styles.requestComposerCard}>
                <label className={styles.controlLabel} htmlFor="atelier-request">
                  מה חשוב ליצירה הזאת?
                </label>
                <textarea
                  id="atelier-request"
                  className={styles.requestTextarea}
                  placeholder="לדוגמה: תליון עדין ומודרני, כשהאבן נשארת מוקד נקי…"
                  value={requestText}
                  onChange={(event) => onRequestChange(event.target.value)}
                  rows={4}
                />
              </div>

              <details className={styles.referenceDrawer} open={intakeItems.length > 0}>
                <summary>
                  <span>
                    <strong>רפרנסים וחומרי עבודה</strong>
                    <small>תמונה, סקיצה, PDF, מודל, קישור או טקסט</small>
                  </span>
                  <span className={styles.referenceCount}>{intakeItems.length}</span>
                </summary>
                <IntakeArea
                  items={intakeItems}
                  onAddFiles={onAddFiles}
                  onAddText={onAddText}
                  onRemove={onRemoveIntakeItem}
                />
              </details>
            </>
          ) : null}

          {step.id === 'piece' ? (
            <>
              <ProductPanel config={designConfig} onChange={onDesignConfigChange} bare />
              <StylePanel config={designConfig} onChange={onDesignConfigChange} bare />
            </>
          ) : null}

          {step.id === 'metal' ? (
            <MetalPanel config={designConfig} onChange={onDesignConfigChange} bare />
          ) : null}

          {step.id === 'components' ? (
            <>
              <SettingPanel config={designConfig} onChange={onDesignConfigChange} bare />
              <MeleePanel config={designConfig} onChange={onDesignConfigChange} bare />
              <FindingsPanel config={designConfig} onChange={onDesignConfigChange} bare />
            </>
          ) : null}

          {liveUnderstanding && liveUnderstanding.understandingHe ? (
            <p className={styles.guidedUnderstanding}>{liveUnderstanding.understandingHe}</p>
          ) : null}
        </section>
      </div>

      <div className={styles.bottomNav}>
        <button type="button" className={styles.backBtn} onClick={handleBack}>
          {stepIndex === 0 ? 'חזור' : 'הקודם'}
        </button>
        <div className={styles.primaryActionWrap}>
          {hintText ? <span>{hintText}</span> : null}
          <button
            type="button"
            className={styles.continueBtn}
            onClick={handleForward}
            disabled={forwardDisabled}
          >
            {forwardLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
