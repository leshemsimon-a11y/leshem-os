import styles from './atelier.module.css';
import { stoneAvailabilityHe } from '../../lib/atelier/atelierBridge';

export default function InventoryDrawer({
  open,
  stones,
  query,
  onQueryChange,
  selectedIds,
  onToggle,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  const selected = new Set(selectedIds || []);
  const list = Array.isArray(stones) ? stones : [];

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div
        className={styles.drawerPanel}
        role="dialog"
        aria-modal="true"
        aria-label="בחירת אבן מהמלאי"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.drawerHeader}>
          <h3 className={styles.drawerTitle}>בחר אבן מהמלאי</h3>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="סגור">
            ×
          </button>
        </div>

        <input
          type="text"
          className={styles.drawerSearch}
          placeholder="חיפוש לפי סוג אבן, צורה או שם…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />

        <div className={styles.drawerGrid}>
          {list.length === 0 && (
            <p className={styles.drawerEmpty}>לא נמצאו אבנים תואמות.</p>
          )}
          {list.map((stone) => {
            const isSelected = selected.has(stone.id);
            return (
              <button
                key={stone.id}
                type="button"
                className={`${styles.stoneCard} ${isSelected ? styles.stoneCardSelected : ''}`}
                onClick={() => onToggle(stone.id)}
                aria-pressed={isSelected}
              >
                <span className={styles.stoneCardImageWrap}>
                  {stone.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={stone.image} alt="" className={styles.stoneCardImage} />
                  ) : (
                    <span className={styles.stoneCardPlaceholder} aria-hidden="true" />
                  )}
                  {isSelected && <span className={styles.stoneCardCheck}>✓</span>}
                </span>
                <span className={styles.stoneCardBody}>
                  <span className={styles.stoneCardName}>{stone.title}</span>
                  <span className={styles.stoneCardMeta}>
                    {[stone.stoneTypeHe, stone.shapeHe].filter(Boolean).join(' · ')}
                  </span>
                  <span className={styles.stoneCardMetaRow}>
                    {stone.weightCt ? <span>{stone.weightCt} קראט</span> : null}
                    <span className={styles.stoneCardBadge}>{stoneAvailabilityHe(stone.availability)}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className={styles.drawerFooter}>
          <button type="button" className={styles.backBtn} onClick={onClose}>
            ביטול
          </button>
          <button
            type="button"
            className={styles.continueBtn}
            onClick={onConfirm}
            disabled={selected.size === 0}
          >
            המשך עם האבן
          </button>
        </div>
      </div>
    </div>
  );
}
