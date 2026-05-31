/**
 * LESHEM.S OS — v2 Inventory Card — v2.2
 *
 * Display-case style card. Loupe/inspect button added.
 * Selected state = "lifted" card (elevation + gold border). No checkbox.
 * NEVER shows: Airtable Record ID, Internal Notes, cost prices.
 * Shape is customer-facing. Cut/Form is NOT shown.
 */

import styles from './InventoryCard.module.css';
import {
  getStoneCategoryLabel,
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
  if (layer === 'virtual_supplier') return s.badgeVirtual;
  if (layer === 'client_owned') return s.badgeClientOwned;
  return '';
}

function getStatusBadgeClass(status, s) {
  if (status === 'available') return s.badgeAvailable;
  if (status === 'reserved') return s.badgeReserved;
  if (status === 'in_use') return s.badgeInUse;
  if (status === 'sold') return s.badgeSold;
  return '';
}

const PLACEHOLDER_ICONS = {
  white_diamond:       '◇',
  fancy_color_diamond: '◈',
  colored_gemstone:    '○',
  parcel:              '⊡',
  part:                '⊟',
  finished_jewelry:    '◎',
};

function getPlaceholderIcon(asset) {
  if (asset.assetType === 'parcel') return PLACEHOLDER_ICONS.parcel;
  if (asset.assetType === 'part' || asset.assetType === 'jewelry_part') return PLACEHOLDER_ICONS.part;
  if (asset.assetType === 'finished_jewelry') return PLACEHOLDER_ICONS.finished_jewelry;
  return PLACEHOLDER_ICONS[asset.stoneCategory] || '◇';
}

function resolveImageSrc(imageUrl) {
  if (!imageUrl) return null;
  if (Array.isArray(imageUrl) && imageUrl[0]) {
    return imageUrl[0].url || imageUrl[0].thumbnails?.large?.url || null;
  }
  if (typeof imageUrl === 'string') return imageUrl;
  return null;
}

/**
 * onViewDetail(asset, { mode: 'detail' | 'inspect' })
 * mode='inspect' opens the drawer in gemological inspection layout.
 */
export default function InventoryCard({ asset, onViewDetail }) {
  const { addItem, removeItem, items } = useWorkTray();

  if (!asset) return null;

  const isInTray = items.some(
    (i) => i._airtableId && i._airtableId === asset._airtableId
  );

  const title      = getAssetDisplayTitle(asset);
  const shapeLabel = getShapeLabel(asset.shape, 'he');

  // Carat weight — primary jeweler metric, displayed separately
  const caratDisplay = asset.caratWeight
    ? `${asset.caratWeight} קרט`
    : asset.totalCaratWeight
    ? `${asset.totalCaratWeight} קרט`
    : null;

  // Gemological spec line: color · clarity (not carat — shown separately above)
  const specs = [asset.color, asset.clarity].filter(Boolean);

  // Lab
  const labInfo = asset.labName
    ? `${asset.labName}${asset.reportNumber ? ' ' + asset.reportNumber : ''}`
    : null;

  const imageSrc = resolveImageSrc(asset.imageUrl);

  function handleAddToTray(e) {
    e.stopPropagation();
    if (!isInTray) addItem(asset);
  }

  function handleRemoveFromTray(e) {
    e.stopPropagation();
    removeItem(asset._airtableId);
  }

  function handleDetailClick(e) {
    e.stopPropagation();
    if (onViewDetail) onViewDetail(asset, { mode: 'detail' });
  }

  function handleLoupeClick(e) {
    e.stopPropagation();
    if (onViewDetail) onViewDetail(asset, { mode: 'inspect' });
  }

  function handleCardClick() {
    if (onViewDetail) onViewDetail(asset, { mode: 'detail' });
  }

  return (
    <div
      className={`${styles.card} ${isInTray ? styles.cardSelected : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={title}
    >
      {/* ── Display tray / media area ── */}
      <div className={styles.imageWrap}>
        {imageSrc ? (
          <img src={imageSrc} alt={title} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            {getPlaceholderIcon(asset)}
          </div>
        )}
        {isInTray && (
          <div className={styles.inTrayBadge} aria-label="פריט במגש">במגש</div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className={styles.body}>
        {/* Stone identity */}
        <div className={styles.title}>{title}</div>

        {/* Carat weight — primary metric, styled separately */}
        {caratDisplay && (
          <div className={styles.caratLine}>{caratDisplay}</div>
        )}

        {/* Gemological spec: color · clarity */}
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

        {/* Badges: category, layer, status, lab */}
        <div className={styles.badgeRow}>
          {asset.stoneCategory && (
            <span className={`${styles.badge} ${getCategoryBadgeClass(asset.stoneCategory, styles)}`}>
              {getStoneCategoryLabel(asset.stoneCategory, 'he')}
            </span>
          )}
          {asset.inventoryLayer && (
            <span className={`${styles.badge} ${getLayerBadgeClass(asset.inventoryLayer, styles)}`}>
              {getInventoryLayerLabel(asset.inventoryLayer, 'he')}
            </span>
          )}
          {asset.status && (
            <span className={`${styles.badge} ${getStatusBadgeClass(asset.status, styles)}`}>
              {getStatusLabel(asset.status, 'he')}
            </span>
          )}
          {labInfo && (
            <span className={styles.labChip}>{labInfo}</span>
          )}
        </div>
      </div>

      {/* ── Action bar ── */}
      <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
        {isInTray ? (
          <button
            className={`${styles.addToTrayBtn} ${styles.addToTrayBtnInTray}`}
            onClick={handleRemoveFromTray}
            aria-label="הסר מהמגש"
          >
            ✓ במגש — הסר
          </button>
        ) : (
          <button
            className={styles.addToTrayBtn}
            onClick={handleAddToTray}
            aria-label="הוסף למגש עבודה"
          >
            הוסף למגש
          </button>
        )}

        {/* Loupe / Inspect — opens inspection-focused drawer */}
        <button
          className={styles.loupeBtn}
          onClick={handleLoupeClick}
          title="בדיקה"
          aria-label="פתח בדיקה"
        >
          ◎
        </button>

        <button
          className={styles.viewBtn}
          onClick={handleDetailClick}
          aria-label="פרטי פריט"
        >
          פרטים
        </button>
      </div>
    </div>
  );
}
