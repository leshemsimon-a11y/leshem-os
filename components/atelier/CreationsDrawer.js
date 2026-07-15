import styles from './atelier.module.css';

const STATUS_HE = {
  draft: 'טיוטה',
  inReview: 'בבדיקה',
  approved: 'מאושר',
  archived: 'בארכיון',
};

function formatUpdatedAt(ts) {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleDateString('he-IL');
  } catch (e) {
    return '';
  }
}

export default function CreationsDrawer({ open, creations, onOpenCreation, onClose }) {
  if (!open) return null;
  const list = Array.isArray(creations) ? creations : [];

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div
        className={styles.drawerPanel}
        role="dialog"
        aria-modal="true"
        aria-label="היצירות שלי"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.drawerHeader}>
          <h3 className={styles.drawerTitle}>היצירות שלי</h3>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="סגור">
            ×
          </button>
        </div>

        <div className={styles.creationsGrid}>
          {list.length === 0 && (
            <p className={styles.drawerEmpty}>עדיין לא נשמרו יצירות. כשתשמור אחת, היא תופיע כאן.</p>
          )}
          {list.map((creation) => (
            <button
              key={creation.id}
              type="button"
              className={styles.creationCard}
              onClick={() => onOpenCreation(creation.id)}
            >
              <span className={styles.creationCardImageWrap}>
                {creation.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={creation.coverImage} alt="" className={styles.creationCardImage} />
                ) : (
                  <span className={styles.stoneCardPlaceholder} aria-hidden="true" />
                )}
              </span>
              <span className={styles.creationCardBody}>
                <span className={styles.creationCardName}>{creation.name}</span>
                <span className={styles.creationCardMeta}>
                  {STATUS_HE[creation.status] || creation.status} · {formatUpdatedAt(creation.updatedAt)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
