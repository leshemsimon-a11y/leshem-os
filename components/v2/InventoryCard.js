/**
 * LESHEM.S OS — v2 Inventory Card
 *
 * Displays a single asset with taxonomy labels.
 * NEVER shows: Airtable Record ID, Internal Notes, cost prices, demo notes.
 * Shape is customer-facing. Cut/Form is NOT shown on cards.
 */

import styles from './InventoryCard.module.css';
import {
  getStoneCategoryLabel,
  getOriginGrowthLabel,
  getShapeLabel,
  getInventoryLayerLabel,
  getStatusLabel,
  getAssetDisplayTitle,
} from '../../lib/v2/taxonomyHelpers';
import { useWorkTray } from '../../lib/v2/workTrayContext';

function getCategoryBadgeClass(stoneCategory, s) {
  if (stoneCategory === 'white_diamond') return s.badgeWhiteDiamond;
  if (stoneCategory === 'fancy_color_diamond') return s.badgeFancyDiamond;
  if (stoneCategory === 'colored_gemstone') return s.badgeColoredGemstone;
  return '';
}

function getLayerBadgeClass(layer, s) {
  if (layer === 'physical_stock') return s.badgePhysical;
  if (layer === 'virtual_supplier_stock') return s.badgeVirtual;
  if (layer === 'client_owned_item') return s.badgeClientOwned;
  return '';
}

function getStatusBadgeClass(status, s) {
  if (status === 'available') return s.badgeAvailable;
  if (status === 'reserved') return s.badgeReserved;
  if (status === 'in_use') return s.badgeInUse;
  if (status === 'sold') return s.badgeSold;
  return '';
}

// Category placeholder icons (no cart / shopping iconography)
const CATEGORY_ICONS = {
  white_diamond: '◇',
  fancy_color_diamond: '◈',
  colored_gemstone: '○',
  parcel: '⊡',
  part: '⊟',
  finished_jewelry: '◎',
};

function getPlaceholderIcon(asset) {
  if (asset.assetType === 'parcel') return CATEGORY_ICONS.parcel;
  if (asset.assetType === 'part' || asset.assetType === 'jewelry_part') return CATEGORY_ICONS.part;
  if (asset.assetType === 'finished_jewelry') return CATEGORY_ICONS.finished_jewelry;
  return CATEGORY_ICONS[asset.stoneCategory] || '◇';
}

export default function InventoryCard({ asset, onViewDetail }) {
  const { addItem, removeItem, items } = useWorkTray();

  if (!asset) return null;

  const isInTray = items.some(
    (i) => i._airtableId && i._airtableId === asset._airtableId
  );

  const title = getAssetDisplayTitle(asset);
  const categoryLabel = getStoneCategoryLabel(asset.stoneCategory, 'he');
  const shapeLabel = getShapeLabel(asset.shape, 'he');
  const layerLabel = getInventoryLayerLabel(asset.inventoryLayer, 'he');
  const statusLabel = getStatusLabel(asset.status, 'he');

  // Build spec string: color · clarity · carat
  const specs = [
    asset.color,
    asset.clarity,
    asset.caratWeight ? `${asset.caratWeight} קרט` : null,
  ].filter(Boolean);

  // Lab + report number
  const labInfo = asset.labName
    ? `${asset.labName}${asset.reportNumber ? ' ' + asset.reportNumber : ''}`
    : null;

  // Image src — Airtable attachments can be arrays
  let imageSrc = null;
  if (asset.imageUrl) {
    if (Array.isArray(asset.imageUrl) && asset.imageUrl[0]) {
      imageSrc = asset.imageUrl[0].url || asset.imageUrl[0].thumbnails?.large?.url;
    } else if (typeof asset.imageUrl === 'string') {
      imageSrc = asset.imageUrl;
    }
  }

  function handleAddToTray(e) {
    e.stopPropagation();
    if (!isInTray) addItem(asset);
  }

  function handleRemoveFromTray(e) {
    e.stopPropagation();
    removeItem(asset._airtableId);
  }

  function handleCardClick() {
    if (onViewDetail) onViewDetail(asset);
  }

  return (
    <div
      className={`${styles.card} ${isInTray ? styles.cardSelected : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
    >
      {/* Image / Placeholder */}
      <div className={styles.imageWrap}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            {getPlaceholderIcon(asset)}
          </div>
        )}
        {isInTray && (
          <div className={styles.inTrayBadge}>במגש</div>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Title */}
        <div className={styles.title}>{title}</div>

        {/* Spec row: color · clarity · carat */}
        {specs.length > 0 && (
          <div className={styles.specRow} dir="rtl">
            {specs.map((spec, i) => (
              <span key={i} className={styles.specItem}>
                {i > 0 && <span className={styles.specDot}> · </span>}
                {spec}
              </span>
            ))}
          </div>
        )}

        {/* Badge row */}
        <div className={styles.badgeRow}>
          {asset.stoneCategory && (
            <span
              className={`${styles.badge} ${getCategoryBadgeClass(asset.stoneCategory, styles)}`}
            >
              {categoryLabel}
            </span>
          )}
          {asset.inventoryLayer && (
            <span
              className={`${styles.badge} ${getLayerBadgeClass(asset.inventoryLayer, styles)}`}
            >
              {layerLabel}
            </span>
          )}
          {asset.status && (
            <span
              className={`${styles.badge} ${getStatusBadgeClass(asset.status, styles)}`}
            >
              {statusLabel}
            </span>
          )}
          {labInfo && (
            <span className={styles.labChip}>{labInfo}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
        {isInTray ? (
          <button
            className={`${styles.addToTrayBtn} ${styles.addToTrayBtnInTray}`}
            onClick={handleRemoveFromTray}
          >
            ✓ במגש — הסר
          </button>
        ) : (
          <button
            className={styles.addToTrayBtn}
            onClick={handleAddToTray}
          >
            הוסף למגש
          </button>
        )}
        <button
          className={styles.viewBtn}
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          פרטים
        </button>
      </div>
    </div>
  );
}
