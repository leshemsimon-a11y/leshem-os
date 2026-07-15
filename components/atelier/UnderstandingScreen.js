import styles from './atelier.module.css';

export default function UnderstandingScreen({
  understanding,
  stoneTitle,
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

  return (
    <div className={styles.understandingScreen}>
      <div className={styles.welcomeHead}>
        <span className={styles.eyebrow}>מה הבנתי</span>
        <h2 className={styles.heading}>בוא נוודא שהבנתי נכון</h2>
        <p className={styles.subheading}>
          {stoneTitle ? `סביב האבן: ${stoneTitle}` : 'לפני שיוצרים כיווני עיצוב'}
        </p>
      </div>

      <div className={styles.understandingCard}>
        {canConfirm ? (
          <p className={styles.understandingSentence}>{understanding.understandingHe}</p>
        ) : (
          <p className={styles.understandingEmpty}>
            עדיין לא זיהיתי איזה סוג תכשיט מדובר. אפשר לחזור ולהוסיף מילה כמו
            "תליון", "טבעת" או "עגילים" לבקשה.
          </p>
        )}

        {items.length > 0 && (
          <div className={styles.understandingReferences}>
            <span className={styles.controlLabel}>רפרנסים שצורפו</span>
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
          </div>
        )}

        <div className={styles.understandingActions}>
          <button type="button" className={styles.ghostBtn} onClick={onEditRequest}>
            ערוך בקשה
          </button>
          <button type="button" className={styles.ghostBtn} onClick={onReplaceStone}>
            החלף אבן
          </button>
        </div>
      </div>

      {notice ? <p className={styles.atelierNotice} role="status">{notice}</p> : null}

      <div className={styles.bottomNav}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          חזור
        </button>
        <button type="button" className={styles.continueBtn} onClick={onConfirm} disabled={!canConfirm || busy}>
          {busy ? 'שומר ומכין כיוונים…' : 'אישור והמשך'}
        </button>
      </div>
    </div>
  );
}
