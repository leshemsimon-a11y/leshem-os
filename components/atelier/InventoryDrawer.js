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

  const selectedList = Array.isArray(selectedIds) ? selectedIds : [];
  const selected = new Set(selectedList);
  const list = Array.isArray(stones) ? stones : [];

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div
        className={styles.drawerPanel}
        role="dialog"
        aria-modal="true"
        aria-label="בחירת אבן מהמלאי"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.drawerHeader}>
          <div>
            <span className={styles.sectionKicker}>מלאי האבנים</span>
            <h3 className={styles.drawerTitle}>בחר את חומרי היצירה</h3>
            <p>האבן הראשונה שתבחר תישאר האבן המרכזית.</p>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="סגור">×</button>
        </div>

        <div className={styles.drawerSearchWrap}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className={styles.drawerSearch}
            placeholder="חיפוש לפי סוג אבן, צורה או שם…"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>

        <div className={styles.drawerSelectionSummary}>
          <span>{selectedList.length ? `${selectedList.length} אבנים נבחרו` : 'עדיין לא נבחרו אבנים'}</span>
          {selectedList.length > 1 ? <small>הראשונה מרכזית · השאר אבני צד</small> : null}
        </div>

        <div className={styles.drawerGrid}>
          {list.length === 0 ? <p className={styles.drawerEmpty}>לא נמצאו אבנים תואמות.</p> : null}
          {list.map((stone) => {
            const isSelected = selected.has(stone.id);
            const selectionIndex = selectedList.indexOf(stone.id);
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
                  {isSelected ? (
                    <span className={styles.stoneCardCheck}>
                      {selectionIndex === 0 ? 'מרכזית' : selectionIndex + 1}
                    </span>
                  ) : null}
                </span>
                <span className={styles.stoneCardBody}>
                  <span className={styles.stoneCardName}>{stone.title}</span>
                  <span className={styles.stoneCardMeta}>
                    {[stone.stoneTypeHe, stone.shapeHe].filter(Boolean).join(' · ')}
                  </span>
                  <span className={styles.stoneCardMetaRow}>
                    {stone.weightCt ? <span>{stone.weightCt} קראט</span> : <span>משקל לא הוזן</span>}
                    <span className={styles.stoneCardBadge}>{stoneAvailabilityHe(stone.availability)}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className={styles.drawerFooter}>
          <button type="button" className={styles.backBtn} onClick={onClose}>ביטול</button>
          <button
            type="button"
            className={styles.continueBtn}
            onClick={onConfirm}
            disabled={selected.size === 0}
          >
            {selected.size > 1 ? `המשך עם ${selected.size} אבנים` : 'המשך עם האבן'}
          </button>
        </div>
      </div>
    </div>
  );
}
