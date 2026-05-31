/**
 * LESHEM.S OS — v2 Work Tray Column — v2.2
 *
 * Compact inline tray panel for desktop Inventory Studio.
 * Appears as a sticky right column when tray has items.
 * Uses same WorkTray context — no duplicate state.
 * "Expand" link opens the full WorkTray overlay.
 * Studio tray surface. Stone chip visual metaphor.
 */

import styles from './WorkTrayColumn.module.css';
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

function StoneChip({ asset }) {
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
    <div className={styles.stoneChip}>
      {imageSrc
        ? <img src={imageSrc} alt="" className={styles.stoneChipImg} />
        : <span aria-hidden="true">{icon}</span>
      }
    </div>
  );
}

export default function WorkTrayColumn({ onOpenFullTray }) {
  const { items, itemCount, totalCaratWeight, removeItem } = useWorkTray();

  if (itemCount === 0) return null;

  return (
    <div className={styles.column}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.title}>מגש עבודה</span>
          <button className={styles.expandBtn} onClick={onOpenFullTray}>
            הרחב ←
          </button>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>פריטים</span>
            <span className={styles.statValue}>{itemCount}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>קרט</span>
            <span className={styles.statValue}>
              {totalCaratWeight}
              <span className={styles.statUnit}> ct</span>
            </span>
          </div>
        </div>
      </div>

      {/* Item list */}
      <div className={styles.itemList}>
        {items.map((asset, idx) => {
          const title = getAssetDisplayTitle(asset);
          const carat = asset.caratWeight || asset.totalCaratWeight;
          return (
            <div key={asset._airtableId || idx} className={styles.item}>
              <StoneChip asset={asset} />
              <div className={styles.itemInfo}>
                <div className={styles.itemTitle}>{title}</div>
                {carat && (
                  <div className={styles.itemCarat}>{carat} קרט</div>
                )}
              </div>
              <button
                className={styles.removeBtn}
                onClick={() => removeItem(asset._airtableId || idx)}
                aria-label="הסר מהמגש"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.openTrayBtn} onClick={onOpenFullTray}>
          פתח מגש מלא
        </button>
      </div>
    </div>
  );
}
