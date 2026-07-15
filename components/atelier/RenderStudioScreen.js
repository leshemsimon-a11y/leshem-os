import { useState } from 'react';
import styles from './atelier.module.css';

const SCENES = [
  { id: 'catalog-white', label: 'קטלוג לבן' },
  { id: 'dark-luxury', label: 'יוקרה כהה' },
  { id: 'hand-shot', label: 'צילום יד' },
  { id: 'model-lifestyle', label: 'דוגמנית' },
  { id: 'box-tray', label: 'קופסה / מגש' },
  { id: 'macro-focus', label: 'מאקרו' },
];

const ANGLES = [
  { id: 'front', label: 'חזית' },
  { id: 'three-quarter', label: '3/4' },
  { id: 'top', label: 'מלמעלה' },
  { id: 'side', label: 'צד' },
  { id: 'macro', label: 'מאקרו' },
];

const FORMATS = [
  { id: 'square', label: 'ריבוע' },
  { id: 'portrait', label: 'פורטרט' },
  { id: 'landscape', label: 'לרוחב' },
  { id: 'story', label: 'סטורי' },
];

const COUNTS = [1, 3, 6];

const CREATIVITY_LEVELS = [
  { id: 'precise', label: 'מדויק' },
  { id: 'balanced', label: 'מאוזן' },
  { id: 'creative', label: 'יצירתי' },
  { id: 'free', label: 'חופשי' },
];

const PLACEHOLDER_BASE = '/assets/leshems/starter-pack-v1/02_jewelry_placeholders/';

// Best-effort real preview: picks an existing safe placeholder image by the
// selected direction's real productType when available, falling back to the
// original static pendant preview otherwise (never breaks if productType is
// missing — Clean 10A's original behavior is preserved as the default).
function previewImageFor(productType) {
  if (productType === 'ring' || productType === 'engagementRing' || productType === 'weddingBand') {
    return `${PLACEHOLDER_BASE}jewel_ring_halo_round_whitegold_preview_v01.png`;
  }
  if (productType === 'earrings') {
    return `${PLACEHOLDER_BASE}jewel_earrings_stud_diamond_preview_v01.png`;
  }
  return `${PLACEHOLDER_BASE}jewel_pendant_solitaire_whitegold_preview_v01.png`;
}

export default function RenderStudioScreen({ direction, renderConfig, onUpdateConfig, onBack }) {
  const [confirmed, setConfirmed] = useState(false);
  const preview = previewImageFor(direction && direction.productType);

  const sceneLabel = SCENES.find((s) => s.id === renderConfig.scene)?.label;
  const angleLabel = ANGLES.find((a) => a.id === renderConfig.angle)?.label;
  const formatLabel = FORMATS.find((f) => f.id === renderConfig.format)?.label;

  return (
    <div className={styles.renderScreen}>
      <div className={styles.previewColumn}>
        <span className={styles.eyebrow}>תצוגה מקדימה</span>
        <div className={`${styles.previewFrame} ${styles[`preview_${renderConfig.scene}`] || ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={(direction && direction.conceptName) || 'תצוגת תכשיט'} className={styles.previewImage} />
        </div>
        <p className={styles.previewMeta}>
          {sceneLabel} · {angleLabel} · {formatLabel}
        </p>
        {direction && direction.conceptName && (
          <p className={styles.previewMeta}>{direction.conceptName}</p>
        )}
      </div>

      <div className={styles.controlsColumn}>
        <div className={styles.renderHeadingWrap}>
          <span className={styles.eyebrow}>הכנת הדמיה</span>
          <h2 className={styles.requestHeading}>בחר איך תרצה להציג את הכיוון</h2>
        </div>

        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>סצנה</span>
          <div className={styles.sceneGrid}>
            {SCENES.map((scene) => {
              const active = renderConfig.scene === scene.id;
              return (
                <button
                  key={scene.id}
                  type="button"
                  className={`${styles.sceneThumb} ${active ? styles.sceneThumbActive : ''}`}
                  onClick={() => onUpdateConfig({ scene: scene.id })}
                >
                  <span className={styles.sceneThumbVisual} data-scene={scene.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="" className={styles.sceneThumbImage} />
                  </span>
                  <span className={styles.sceneThumbLabel}>{scene.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.controlPair}>
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>זווית</span>
            <div className={styles.pillRow}>
              {ANGLES.map((angle) => (
                <button
                  key={angle.id}
                  type="button"
                  className={`${styles.pill} ${renderConfig.angle === angle.id ? styles.pillActive : ''}`}
                  onClick={() => onUpdateConfig({ angle: angle.id })}
                >
                  {angle.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>פורמט</span>
            <div className={styles.pillRow}>
              {FORMATS.map((format) => (
                <button
                  key={format.id}
                  type="button"
                  className={`${styles.pill} ${renderConfig.format === format.id ? styles.pillActive : ''}`}
                  onClick={() => onUpdateConfig({ format: format.id })}
                >
                  {format.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.controlPair}>
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>מספר תמונות</span>
            <div className={styles.countRow}>
              {COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  className={`${styles.countBtn} ${renderConfig.count === count ? styles.countBtnActive : ''}`}
                  onClick={() => onUpdateConfig({ count })}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>רמת יצירתיות</span>
            <div className={styles.pillRow}>
              {CREATIVITY_LEVELS.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  className={`${styles.pill} ${renderConfig.creativity === level.id ? styles.pillActive : ''}`}
                  onClick={() => onUpdateConfig({ creativity: level.id })}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomNav}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          חזור
        </button>
        <button type="button" className={styles.continueBtn} onClick={() => setConfirmed(true)}>
          הכן להצגה
        </button>
      </div>

      {confirmed && (
        <p className={styles.confirmNote} role="status">
          התצוגה מוכנה: {renderConfig.count} תמונות · {sceneLabel} · {formatLabel}
        </p>
      )}
    </div>
  );
}
