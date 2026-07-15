import styles from './atelier.module.css';
import PendantVisualizer from './PendantVisualizer';
import {
  productOption,
  styleOption,
  metalOption,
  settingOption,
  bailOption,
  chainOption,
} from '../../lib/atelier/livingAtelier';

export default function UnderstandingScreen({
  understanding,
  centerStone,
  intakeItems,
  onRemoveIntakeItem,
  onEditRequest,
  onReplaceStone,
  onBack,
  onConfirm,
  busy,
  notice,
}) {
  const canConfirm = Boolean(understanding && understanding.product);
  const items = Array.isArray(intakeItems) ? intakeItems : [];
  const config = (understanding && understanding.designConfig) || {};
  const snapshot = centerStone ? centerStone.snapshot || {} : {};
  const product = productOption(config.product);
  const style = styleOption(config.style);
  const metal = metalOption(config.metalPreference);
  const setting = settingOption(config.setting);
  const bail = bailOption(config.bail);
  const chain = chainOption(config.chain);

  return (
    <div className={styles.reviewScreen}>
      <div className={styles.reviewHero}>
        <div className={styles.reviewCopy}>
          <span className={styles.eyebrow}>מה הבנתי</span>
          <h1 className={styles.heading}>הכוונה שלך הפכה לבריף עיצוב</h1>
          <p className={styles.subheading}>לפני שאני יוצר שלושה כיוונים, זו התמונה המקצועית שקיבלתי.</p>
        </div>
        <div className={styles.reviewVisual}>
          <PendantVisualizer config={config} shape={snapshot.shape} compact />
        </div>
      </div>

      <div className={styles.reviewGrid}>
        <section className={styles.reviewMainCard}>
          {canConfirm ? (
            <>
              <span className={styles.reviewCardLabel}>הגדרת היצירה</span>
              <p className={styles.understandingSentence}>{understanding.understandingHe}</p>
              <p className={styles.reviewDesignSummary}>{understanding.designSummaryHe}</p>
            </>
          ) : (
            <p className={styles.understandingEmpty}>
              עדיין לא זוהה סוג תכשיט. חזור לבקשה או בחר סוג מתוך התפריט החזותי.
            </p>
          )}

          <div className={styles.reviewFacts}>
            <div><span>סוג</span><strong>{product ? product.he : 'לא נבחר'}</strong></div>
            <div><span>סגנון</span><strong>{style ? style.he : 'פתוח'}</strong></div>
            <div><span>מתכת</span><strong>{metal ? metal.he : 'לבחירה בהמשך'}</strong></div>
            <div><span>אבן</span><strong>{snapshot.titleHe || snapshot.name || 'לא נבחרה'}</strong></div>
          </div>
        </section>

        <aside className={styles.reviewDetailsCard}>
          <span className={styles.reviewCardLabel}>החלטות מבנה</span>
          {config.product === 'pendant' ? (
            <div className={styles.reviewDetailList}>
              <div><span>שיבוץ</span><strong>{setting ? setting.he : 'פתוח'}</strong></div>
              <div><span>חיבור</span><strong>{bail ? bail.he : 'פתוח'}</strong></div>
              <div><span>שרשרת</span><strong>{chain ? chain.he : 'פתוח'}</strong></div>
              <div><span>רפרנסים</span><strong>{items.length || 'ללא'}</strong></div>
            </div>
          ) : (
            <p className={styles.reviewAsideCopy}>הכיוונים ייבנו מתוך סוג התכשיט, האבן, הסגנון והבקשה החופשית.</p>
          )}
          <div className={styles.understandingActions}>
            <button type="button" className={styles.ghostBtn} onClick={onEditRequest}>ערוך בקשה</button>
            <button type="button" className={styles.ghostBtn} onClick={onReplaceStone}>החלף אבן</button>
          </div>
        </aside>
      </div>

      {items.length > 0 ? (
        <section className={styles.reviewReferences}>
          <div className={styles.sectionHeadRow}>
            <div>
              <span className={styles.sectionKicker}>חומרי עבודה</span>
              <h3 className={styles.sectionTitle}>הרפרנסים שנכנסים לכיוונים</h3>
            </div>
          </div>
          <div className={styles.intakeChipsRow}>
            {items.map((item) => (
              <span key={item.id} className={styles.intakeChip}>
                <span className={styles.intakeChipBody}>
                  <span className={styles.intakeChipRole}>{item.roleHe}</span>
                  <span className={styles.intakeChipName}>{item.name}</span>
                </span>
                <button
                  type="button"
                  className={styles.intakeChipRemove}
                  onClick={() => onRemoveIntakeItem(item.id)}
                  aria-label={`הסר ${item.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {notice ? <p className={styles.atelierNotice} role="status">{notice}</p> : null}

      <div className={styles.bottomNav}>
        <button type="button" className={styles.backBtn} onClick={onBack}>חזור</button>
        <button type="button" className={styles.continueBtn} onClick={onConfirm} disabled={!canConfirm || busy}>
          {busy ? 'שומר ומכין כיוונים…' : 'צור שלושה כיוונים'}
        </button>
      </div>
    </div>
  );
}
