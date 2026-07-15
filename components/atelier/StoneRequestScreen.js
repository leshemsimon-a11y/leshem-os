import styles from './atelier.module.css';
import IntakeArea from './IntakeArea';
import { stoneAvailabilityHe } from '../../lib/atelier/atelierBridge';

const CHIPS = ['תליון', 'טבעת', 'עדין', 'מודרני', 'זהב לבן', 'קלאסטר'];

const EMPTY_STONE_IMAGE =
  '/assets/leshems/starter-pack-v1/05_empty_states/empty_studio_start_stones_to_jewelry_v01.png';

export default function StoneRequestScreen({
  centerStone,
  onOpenStoneDrawer,
  requestText,
  onRequestChange,
  selectedChips,
  onToggleChip,
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

  return (
    <div className={styles.stoneScreen}>
      <div className={styles.stoneColumn}>
        <div className={styles.stoneImageFrame}>
          {stoneImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={stoneImage} alt={stoneName || ''} className={styles.stoneImage} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={EMPTY_STONE_IMAGE} alt="" className={styles.stoneImageEmpty} />
          )}
          <button type="button" className={styles.replaceStoneBtn} onClick={onOpenStoneDrawer}>
            {centerStone ? 'החלף אבן' : 'בחר אבן מהמלאי'}
          </button>
        </div>
        {snapshot ? (
          <div className={styles.stoneMeta}>
            <span className={styles.stoneNavLabel}>{stoneName}</span>
            <span className={styles.stoneMetaRow}>
              {[snapshot.stoneTypeHe, snapshot.shapeHe].filter(Boolean).join(' · ')}
              {snapshot.caratWeight ? ` · ${snapshot.caratWeight} קראט` : ''}
            </span>
            {snapshot.status && (
              <span className={styles.stoneCardBadge}>{stoneAvailabilityHe(snapshot.status)}</span>
            )}
          </div>
        ) : (
          <p className={styles.stoneMetaEmpty}>עדיין לא נבחרה אבן — לחץ למעלה כדי לפתוח את המלאי.</p>
        )}
      </div>

      <div className={styles.requestColumn}>
        <span className={styles.eyebrow}>הכוונה שלך</span>
        <h2 className={styles.requestHeading}>מה תרצה ליצור סביב האבן?</h2>
        <textarea
          className={styles.requestTextarea}
          placeholder="למשל: תליון עדין ומודרני בזהב לבן…"
          value={requestText}
          onChange={(e) => onRequestChange(e.target.value)}
          rows={5}
        />
        <div className={styles.chipsRow}>
          {CHIPS.map((chip) => {
            const active = selectedChips.includes(chip);
            return (
              <button
                key={chip}
                type="button"
                className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                onClick={() => onToggleChip(chip)}
                aria-pressed={active}
              >
                {chip}
              </button>
            );
          })}
        </div>

        <IntakeArea
          items={intakeItems}
          onAddFiles={onAddFiles}
          onAddText={onAddText}
          onRemove={onRemoveIntakeItem}
        />
      </div>

      <div className={styles.bottomNav}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          חזור
        </button>
        <button
          type="button"
          className={styles.continueBtn}
          onClick={onContinue}
          disabled={!canContinue}
        >
          המשך
        </button>
      </div>
    </div>
  );
}
