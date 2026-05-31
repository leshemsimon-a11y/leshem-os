/**
 * LESHEM.S OS — v2 Inventory Data Row — v2.2
 *
 * Compact single-line row for Data Mode in Inventory Studio.
 * Same data source and filters as Studio Mode card grid.
 * Same WorkTray context — add/remove works identically.
 * NEVER shows: Airtable Record ID, cost prices, internal notes.
 */

import styles from './InventoryDataRow.module.css';
import {
  getStatusLabel,
  getInventoryLayerLabel,
  getAssetDisplayTitle,
} from '../../lib/v2/taxonomyHelpers';
import { useWorkTray } from '../../lib/v2/workTrayContext';

function resolveImageSrc(imageUrl) {
  if (!imageUrl) return null;
  if (Array.isArray(imageUrl) && imageUrl[0]) {
    return imageUrl[0].thumbnails?.small?.url || imageUrl[0].url || null;
  }
  if (typeof imageUrl === 'string') return imageUrl;
  return null;
}

const PLACEHOLDER_ICONS = {
  white_diamond:       '◇',
  fancy_color_diamond: '◈',
  colored_gemstone:    '○',
  parcel:              '⊡',
  part:                '⊟',
  finished_jewelry:    '◎',
};

function getStatusBadgeClass(status, s) {
  if (status === 'available') return s.badgeAvailable;
  if (status === 'reserved')  return s.badgeReserved;
  if (status === 'in_use')    return s.badgeInUse;
  if (status === 'sold')      return s.badgeSold;
  return '';
}

function getLayerBadgeClass(layer, s) {
  if (layer === 'physical_stock')   return s.badgePhysical;
  if (layer === 'virtual_supplier') return s.badgeVirtual;
  if (layer === 'client_owned')     return s.badgeClientOwned;
  return '';
}

export default function InventoryDataRow({ asset, onViewDetail }) {
  const { addItem, removeItem, items } = useWorkTray();

  if (!asset) return null;

  const isInTray = items.some(
    (i) => i._airtableId && i._airtableId === asset._airtableId
  );

  const title      = getAssetDisplayTitle(asset);
  const imageSrc   = resolveImageSrc(asset.imageUrl);
  const carat      = asset.caratWeight || asset.totalCaratWeight;
  const statusLabel = getStatusLabel(asset.status, 'he');
  const layerLabel  = getInventoryLayerLabel(asset.inventoryLayer, 'he');
  const placeholderIcon =
    PLACEHOLDER_ICONS[asset.stoneCategory] ||
    PLACEHOLDER_ICONS[asset.assetType] ||
    '◇';

  function handleTrayToggle(e) {
    e.stopPropagation();
    if (isInTray) {
      removeItem(asset._airtableId);
    } else {
      addItem(asset);
    }
  }

  function handleLoupeClick(e) {
    e.stopPropagation();
    if (onViewDetail) onViewDetail(asset, { mode: 'inspect' });
  }

  function handleRowClick() {
    if (onViewDetail) onViewDetail(asset, { mode: 'detail' });
  }

  return (
    <div
      className={`${styles.row} ${isInTray ? styles.rowInTray : ''}`}
      onClick={handleRowClick}
      role="row"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleRowClick()}
      aria-label={title}
    >
      {/* Thumbnail */}
      <div className={styles.thumb}>
        {imageSrc ? (
          <img src={imageSrc} alt="" className={styles.thumbImg} />
        ) : (
          <span aria-hidden="true">{placeholderIcon}</span>
        )}
      </div>

      {/* Stone identity */}
      <div className={styles.identity}>
        <div className={styles.identityTitle}>{title}</div>
      </div>

      {/* Carat */}
      {carat && (
        <div className={`${styles.cell} ${styles.cellCarat}`}>{carat}</div>
      )}

      {/* Color */}
      {asset.color && (
        <div className={`${styles.cell} ${styles.cellColor}`}>{asset.color}</div>
      )}

      {/* Clarity */}
      {asset.clarity && (
        <div className={`${styles.cell} ${styles.cellClarity}`}>{asset.clarity}</div>
      )}

      {/* Lab */}
      {asset.labName && (
        <div className={`${styles.cell} ${styles.cellLab}`}>{asset.labName}</div>
      )}

      {/* Layer badge */}
      {asset.inventoryLayer && (
        <span className={`${styles.layerBadge} ${getLayerBadgeClass(asset.inventoryLayer, styles)}`}>
          {layerLabel}
        </span>
      )}

      {/* Status badge */}
      {asset.status && (
        <span className={`${styles.statusBadge} ${getStatusBadgeClass(asset.status, styles)}`}>
          {statusLabel}
        </span>
      )}

      {/* Actions — stop propagation so row click doesn't fire */}
      <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.loupeBtn}
          onClick={handleLoupeClick}
          title="בדיקה"
          aria-label="פתח בדיקה"
        >
          ◎
        </button>
        <button
          className={`${styles.trayBtn} ${isInTray ? styles.trayBtnInTray : ''}`}
          onClick={handleTrayToggle}
          aria-label={isInTray ? 'הסר מהמגש' : 'הוסף למגש'}
        >
          {isInTray ? '✓ במגש' : 'הוסף'}
        </button>
      </div>
    </div>
  );
}
