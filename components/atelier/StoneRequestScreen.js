import styles from './atelier.module.css';
import IntakeArea from './IntakeArea';
import DesignPalette from './DesignPalette';
import PendantVisualizer from './PendantVisualizer';
import { stoneAvailabilityHe } from '../../lib/atelier/atelierBridge';

const EMPTY_STONE_IMAGE =
  '/assets/leshems/starter-pack-v1/05_empty_states/empty_studio_start_stones_to_jewelry_v01.png';

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
  const snapshot = centerStone ? centerStone.snapshot || {} : null;
  const stoneImage = snapshot ? snapshot.primaryImage || snapshot.boxImage : null;
  const stoneName = snapshot ? snapshot.titleHe || snapshot.name : null;
  const extraStoneCount = Math.max(0, (Array.isArray(trayItems) ? trayItems.length : 0) - 1);
  const productMissing = !liveUnderstanding || !liveUnderstanding.product;

  return (
    <div className={styles.livingScreen}>
      <div className={styles.livingWorkspace}>
        <aside className={styles.creationPreviewPane}>
          <div className={styles.previewPaneHead}>
            <span className={styles.eyebrow}>האבן מובילה</span>
            <h1 className={styles.previewPaneTitle}>מתחילים מחומר אמיתי</h1>
            <p className={styles.previewPaneCopy}>בחר את האבן, תן כיוון, והמערכת תתרגם אותו לשפת תכשיט מקצועית.</p>
          </div>

          <div className={styles.stoneHeroCard}>
            <div className={styles.stoneHeroMedia}>
              {stoneImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={stoneImage} alt={stoneName || ''} className={styles.stoneHeroImage} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={EMPTY_STONE_IMAGE} alt="" className={styles.stoneHeroImageEmpty} />
              )}
              <button type="button" className={styles.replaceStoneBtn} onClick={onOpenStoneDrawer}>
                {centerStone ? 'שנה בחירת אבנים' : 'פתח את המלאי'}
              </button>
            </div>
            {snapshot ? (
              <div className={styles.stoneHeroInfo}>
                <div>
                  <span className={styles.stoneHeroName}>{stoneName}</span>
                  <span className={styles.stoneHeroMeta}>
                    {[snapshot.stoneTypeHe, snapshot.shapeHe].filter(Boolean).join(' · ')}
                    {snapshot.caratWeight ? ` · ${snapshot.caratWeight} קראט` : ''}
                  </span>
                </div>
                <div className={styles.stoneHeroBadges}>
                  <span>{stoneAvailabilityHe(snapshot.status)}</span>
                  {extraStoneCount > 0 ? <span>+{extraStoneCount} אבנים</span> : null}
                </div>
              </div>
            ) : (
              <p className={styles.stoneMetaEmpty}>עדיין לא נבחרה אבן. המלאי ייפתח בלי לעזוב את היצירה.</p>
            )}
          </div>

          <div className={styles.liveObjectStage}>
            <PendantVisualizer config={designConfig} shape={snapshot && snapshot.shape} />
            <div className={styles.liveObjectCaption}>
              <span>תצוגת מבנה חיה</span>
              <small>המחשה עיצובית — לפני רינדור</small>
            </div>
          </div>

          <div className={`${styles.liveUnderstandingCard} ${productMissing ? styles.liveUnderstandingPending : ''}`}>
            <span className={styles.liveUnderstandingLabel}>מה הבנתי כרגע</span>
            <p>
              {liveUnderstanding && liveUnderstanding.understandingHe
                ? liveUnderstanding.understandingHe
                : 'בחר סוג תכשיט או כתוב אותו בבקשה, ואעדכן את ההבנה מיד.'}
            </p>
            {liveUnderstanding && liveUnderstanding.designSummaryHe ? (
              <small>{liveUnderstanding.designSummaryHe}</small>
            ) : null}
          </div>
        </aside>

        <section className={styles.creationControlsPane}>
          <div className={styles.creationControlsIntro}>
            <span className={styles.eyebrow}>Atelier חי</span>
            <h2 className={styles.requestHeading}>ספר לי מה נכון ליצירה הזאת</h2>
            <p>אפשר לכתוב חופשי, לבחור ויזואלית, או לשלב ביניהם. הבחירות מתעדכנות מיד.</p>
          </div>

          <div className={styles.requestComposerCard}>
            <textarea
              className={styles.requestTextarea}
              placeholder="לדוגמה: תליון עדין ומודרני בזהב לבן, כשהאמרלד נשאר מוקד נקי…"
              value={requestText}
              onChange={(event) => onRequestChange(event.target.value)}
              rows={4}
            />
            <div className={styles.composerHintRow}>
              <span>כתוב בשפה טבעית</span>
              <span>{requestText.trim().length} תווים</span>
            </div>
          </div>

          <DesignPalette config={designConfig} onChange={onDesignConfigChange} />

          <details className={styles.referenceDrawer} open={intakeItems.length > 0}>
            <summary>
              <span>
                <strong>רפרנסים וחומרי עבודה</strong>
                <small>תמונה, סקיצה, PDF, מודל, קישור או טקסט נוסף</small>
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
        </section>
      </div>

      <div className={styles.bottomNav}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          חזור
        </button>
        <div className={styles.primaryActionWrap}>
          {!centerStone ? <span>בחר אבן כדי להמשיך</span> : null}
          {centerStone && productMissing ? <span>בחר סוג תכשיט</span> : null}
          <button
            type="button"
            className={styles.continueBtn}
            onClick={onContinue}
            disabled={!canContinue}
          >
            המשך למה שהבנתי
          </button>
        </div>
      </div>
    </div>
  );
}
