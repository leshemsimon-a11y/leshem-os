/**
 * LESHEM.S OS — v2 Work Tray — v2.2
 *
 * Studio tray feel. Stone chip item display.
 * Studio tray language only. No commerce language.
 * Calculator and Certificate: clearly marked as future/not-yet-connected.
 */

import { useState } from 'react';
import styles from './WorkTray.module.css';
import { useWorkTray } from '../../lib/v2/workTrayContext';
import { getAssetDisplayTitle } from '../../lib/v2/taxonomyHelpers';

const PLACEHOLDER_ICONS = {
  white_diamond:       '◇',
  fancy_color_diamond: '◈',
  colored_gemstone:    '○',
  parcel:              '⊡',
  part:                '⊟',
  finished_jewelry:    '◎',
};

function TrayItemThumb({ asset }) {
  let imageSrc = null;
  if (asset.imageUrl) {
    if (Array.isArray(asset.imageUrl) && asset.imageUrl[0]) {
      imageSrc = asset.imageUrl[0].thumbnails?.small?.url || asset.imageUrl[0].url;
    } else if (typeof asset.imageUrl === 'string') {
      imageSrc = asset.imageUrl;
    }
  }
  const icon = PLACEHOLDER_ICONS[asset.stoneCategory] || PLACEHOLDER_ICONS[asset.assetType] || '◇';
  return (
    <div className={styles.trayThumb}>
      {imageSrc
        ? <img src={imageSrc} alt="" className={styles.trayThumbImg} />
        : <span aria-hidden="true">{icon}</span>
      }
    </div>
  );
}

export default function WorkTray({ onClose }) {
  const { items, itemCount, totalCaratWeight, removeItem, clearTray } = useWorkTray();
  const [confirmingClear, setConfirmingClear] = useState(false);

  function handleClearConfirmed() {
    clearTray();
    setConfirmingClear(false);
  }

  const singleEligibleItem =
    itemCount === 1 &&
    items[0] &&
    (items[0].stoneCategory || items[0].assetType === 'finished_jewelry');

  return (
    <div className={styles.tray} role="dialog" aria-label="מגש עבודה">
      {/* Header */}
      <div className={styles.trayHeader}>
        <div className={styles.trayTitleGroup}>
          <div className={styles.trayTitle}>מגש עבודה</div>
          <div className={styles.traySummary}>
            {itemCount === 0 ? 'ריק' : `${itemCount} פריטים · ${totalCaratWeight} קרט`}
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="סגור מגש">
          ×
        </button>
      </div>

      {/* Stats */}
      {itemCount > 0 && (
        <div className={styles.statsRow}>
          <div className={styles.statCell}>
            <div className={styles.statLabel}>פריטים</div>
            <div className={styles.statValue}>{itemCount}</div>
          </div>
          <div className={styles.statCell}>
            <div className={styles.statLabel}>משקל קרט</div>
            <div className={styles.statValue}>
              {totalCaratWeight}
              <span className={styles.statUnit}> קרט</span>
            </div>
          </div>
        </div>
      )}

      {/* Item list */}
      <div className={styles.itemList}>
        {itemCount === 0 ? (
          <div className={styles.emptyTray}>
            <div className={styles.emptyIcon}>◇</div>
            <div>המגש ריק</div>
            <div style={{ fontSize: 11, opacity: 0.5 }}>הוסף פריטים מהמלאי</div>
          </div>
        ) : (
          items.map((asset, idx) => {
            const title = getAssetDisplayTitle(asset);
            const carat = asset.caratWeight || asset.totalCaratWeight;
            return (
              <div key={asset._airtableId || idx} className={styles.trayItem}>
                <TrayItemThumb asset={asset} />
                <div className={styles.trayItemInfo}>
                  <div className={styles.trayItemTitle}>{title}</div>
                  <div className={styles.trayItemMeta}>
                    {[asset.color, asset.clarity, carat ? `${carat} קרט` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
                <button
                  className={styles.removeItemBtn}
                  onClick={() => removeItem(asset._airtableId || idx)}
                  aria-label="הסר מהמגש"
                >
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className={styles.trayFooter}>
        {confirmingClear ? (
          <div className={styles.confirmBar}>
            <span>לנקות את המגש?</span>
            <button className={styles.confirmYes} onClick={handleClearConfirmed}>נקה</button>
            <button className={styles.confirmNo} onClick={() => setConfirmingClear(false)}>ביטול</button>
          </div>
        ) : (
          itemCount > 0 && (
            <button className={styles.clearBtn} onClick={() => setConfirmingClear(true)}>
              נקה מגש
            </button>
          )
        )}

        {/* Calculator handoff is intentionally disabled until full v2 data handoff is built. */}
        {itemCount > 0 && (
          <button className={styles.calcBtn} type="button" disabled>
            פתח במחשבון
            <span className={styles.futureNote}>חיבור מלא לפריטים — בשלב הבא</span>
          </button>
        )}

        {/* Certificate handoff is intentionally disabled until full v2 data handoff is built. */}
        {singleEligibleItem && (
          <button className={styles.certBtn} type="button" disabled>
            צור תעודה
            <span className={styles.futureNote}>חיבור מלא לפריט — בשלב הבא</span>
          </button>
        )}
      </div>
    </div>
  );
}
