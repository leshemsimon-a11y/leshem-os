/**
 * LESHEM.S OS — v2 Asset Drawer — v2.2
 *
 * Accepts mode prop: 'detail' (default) | 'inspect'
 * Inspect mode: larger image, loupe ring, gemological details first, lab info open.
 * Detail mode: existing layout unchanged.
 *
 * NEVER shows: Airtable Record ID, cost price, demo notes.
 * Shape is customer-facing. Cut/Form is NOT shown.
 * Geographic origin is separate from Natural/Lab-Grown.
 */

import { useState } from 'react';
import styles from './AssetDrawer.module.css';
import {
  getStoneCategoryLabel,
  getOriginGrowthLabel,
  getStoneTypeLabel,
  getShapeLabel,
  getInventoryLayerLabel,
  getStatusLabel,
  getGeographicOriginLabel,
  getAssetDisplayTitle,
} from '../../lib/v2/taxonomyHelpers';
import { useWorkTray } from '../../lib/v2/workTrayContext';

/**
 * Collapsible section.
 * defaultOpen is re-evaluated on mount only — if mode changes a new drawer mounts anyway.
 */
function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setOpen((v) => !v)}>
        <div className={styles.sectionTitle}>{title}</div>
        <span className={styles.sectionToggle}>{open ? '−' : '+'}</span>
      </div>
      <div className={open ? styles.sectionContent : styles.sectionContentCollapsed}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, muted = false }) {
  if (!value && value !== 0) {
    return (
      <div className={styles.field}>
        <div className={styles.fieldLabel}>{label}</div>
        <div className={styles.fieldValueEmpty}>—</div>
      </div>
    );
  }
  return (
    <div className={styles.field}>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={muted ? styles.fieldValueMuted : styles.fieldValue}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const label = getStatusLabel(status, 'he');
  const cls = {
    available: styles.badgeAvailable,
    reserved:  styles.badgeReserved,
    in_use:    styles.badgeInUse,
    sold:      styles.badgeSold,
  }[status] || '';
  return <span className={`${styles.badge} ${cls}`}>{label}</span>;
}

const PLACEHOLDER_ICONS = {
  white_diamond:       '◇',
  fancy_color_diamond: '◈',
  colored_gemstone:    '○',
  parcel:              '⊡',
  part:                '⊟',
  finished_jewelry:    '◎',
};

export default function AssetDrawer({ asset, onClose, mode = 'detail' }) {
  const { addItem, removeItem, items } = useWorkTray();

  if (!asset) return null;

  const isInspect = mode === 'inspect';

  const isInTray = items.some(
    (i) => i._airtableId && i._airtableId === asset._airtableId
  );

  const title = getAssetDisplayTitle(asset);

  // Labels
  const categoryLabel  = getStoneCategoryLabel(asset.stoneCategory, 'he');
  const originLabel    = getOriginGrowthLabel(asset.origin, 'he');
  const typeLabel      = getStoneTypeLabel(asset.stoneType, 'he');
  const shapeLabel     = getShapeLabel(asset.shape, 'he');
  const layerLabel     = getInventoryLayerLabel(asset.inventoryLayer, 'he');
  const geoOriginLabel = asset.geographicOrigin
    ? getGeographicOriginLabel(asset.geographicOrigin)
    : null;

  // Image
  let imageSrc = null;
  if (asset.imageUrl) {
    if (Array.isArray(asset.imageUrl) && asset.imageUrl[0]) {
      imageSrc = asset.imageUrl[0].url || asset.imageUrl[0].thumbnails?.large?.url;
    } else if (typeof asset.imageUrl === 'string') {
      imageSrc = asset.imageUrl;
    }
  }

  const placeholderIcon =
    PLACEHOLDER_ICONS[asset.stoneCategory] ||
    PLACEHOLDER_ICONS[asset.assetType] ||
    '◇';

  const labInfo = [asset.labName, asset.reportNumber].filter(Boolean).join(' · ');

  const fancyColorDesc = [
    asset.fancyColorIntensity,
    asset.fancyColorHue,
    asset.fancyColorOvertone,
  ].filter(Boolean).join(' ');

  function handleTrayToggle() {
    if (isInTray) removeItem(asset._airtableId);
    else addItem(asset);
  }

  // Section open defaults differ by mode:
  // Inspect: gemological details + lab open first; key specs + inventory closed
  // Detail:  key specs open; rest collapsed (existing behaviour)
  const keySpecsOpen       = !isInspect;
  const gemoDetailsOpen    = isInspect;
  const labInfoOpen        = isInspect;
  const inventoryInfoOpen  = false;

  return (
    <div
      className={styles.drawer}
      role="dialog"
      aria-label={isInspect ? 'בדיקת פריט' : 'פרטי פריט'}
    >
      {/* Header */}
      <div className={styles.drawerHeader}>
        <div className={isInspect ? styles.drawerTitleInspect : styles.drawerTitle}>
          {isInspect ? 'בדיקה · Inspection' : 'פרטי פריט'}
        </div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="סגור">
          ×
        </button>
      </div>

      {/* Scrollable body */}
      <div className={styles.drawerBody}>

        {/* ── Image / Tray surface ── */}
        {isInspect ? (
          <>
            <div className={styles.imageSectionInspect}>
              {/* Decorative loupe ring — CSS only, no zoom */}
              <div className={styles.loupeRing} aria-hidden="true" />
              {imageSrc ? (
                <img src={imageSrc} alt={title} className={styles.drawerImage} />
              ) : (
                <div className={styles.imagePlaceholderInspect} aria-hidden="true">
                  {placeholderIcon}
                </div>
              )}
            </div>
            <div className={styles.inspectDivider} />
          </>
        ) : (
          <div className={styles.imageSection}>
            {imageSrc ? (
              <img src={imageSrc} alt={title} className={styles.drawerImage} />
            ) : (
              <div className={styles.imagePlaceholder} aria-hidden="true">
                {placeholderIcon}
              </div>
            )}
          </div>
        )}

        {/* ── Title ── */}
        <div className={styles.assetTitleSection}>
          <h2 className={styles.assetMainTitle}>{title}</h2>
          {asset.status && <StatusBadge status={asset.status} />}
        </div>

        {/* ── Key Specs (open in detail mode; closed in inspect — geo data shown in geo section) ── */}
        <Section title="מפרט עיקרי" defaultOpen={keySpecsOpen}>
          <div className={styles.fieldGrid}>
            <Field label="קטגוריה"   value={categoryLabel} />
            <Field label="מקור גידול" value={originLabel} />
            <Field label="סוג אבן"   value={typeLabel} />
            <Field label="צורה"      value={shapeLabel} />
            <Field
              label="משקל קרט"
              value={
                asset.caratWeight
                  ? `${asset.caratWeight} קרט`
                  : asset.totalCaratWeight
                  ? `${asset.totalCaratWeight} קרט (כולל)`
                  : null
              }
            />
            <Field label="צבע"   value={asset.color} />
            <Field label="ניקיון" value={asset.clarity} />
            {asset.stoneCategory === 'white_diamond' && (
              <Field label="קאט" value={asset.cut} />
            )}
          </div>
          {fancyColorDesc && (
            <div style={{ marginTop: 12 }}>
              <Field label="צבע פנסי" value={fancyColorDesc} />
            </div>
          )}
        </Section>

        {/* ── Gemological Details (open first in inspect mode) ── */}
        <Section title="פרטים גמולוגיים" defaultOpen={gemoDetailsOpen}>
          <div className={styles.fieldGrid}>
            <Field label="פוליש"        value={asset.polish}     muted />
            <Field label="סימטריה"      value={asset.symmetry}   muted />
            <Field label="פלואורסנציה"  value={asset.fluorescence} muted />
            <Field
              label="עומק %"
              value={asset.depthPercent ? `${asset.depthPercent}%` : null}
              muted
            />
            <Field
              label="שולחן %"
              value={asset.tablePercent ? `${asset.tablePercent}%` : null}
              muted
            />
          </div>
          {asset.measurements && (
            <div style={{ marginTop: 12 }}>
              <Field label="מידות" value={asset.measurements} muted />
            </div>
          )}
          {geoOriginLabel && (
            <div style={{ marginTop: 12 }}>
              {/* Geographic origin — separate from Natural/Lab-Grown */}
              <Field label="מקור גאוגרפי" value={geoOriginLabel} muted />
            </div>
          )}
        </Section>

        {/* ── Certificate / Lab Info (open first in inspect mode) ── */}
        <Section title="תעודה ומעבדה" defaultOpen={labInfoOpen}>
          <div className={styles.fieldGrid}>
            <Field label="מעבדה"      value={asset.labName} />
            <Field label="מספר תעודה" value={asset.reportNumber} />
          </div>
        </Section>

        {/* ── Inventory / Admin Info ── */}
        <Section title="פרטי מלאי" defaultOpen={inventoryInfoOpen}>
          <div className={styles.fieldGrid}>
            <Field label="שכבת מלאי" value={layerLabel} />
            <Field label="ספק"        value={asset.supplierName} muted />
            {asset.createdAt && (
              <Field
                label="נוסף בתאריך"
                value={new Date(asset.createdAt).toLocaleDateString('he-IL')}
                muted
              />
            )}
          </div>
        </Section>

        {/* ── Internal Notes — internal only ── */}
        {asset.internalNotes && (
          <Section title="הערות פנימיות" defaultOpen={false}>
            <div className={styles.internalBadge}>פנימי בלבד · לא מוצג ללקוח</div>
            <div className={styles.notesText}>{asset.internalNotes}</div>
          </Section>
        )}
      </div>

      {/* ── Footer ── */}
      <div className={styles.drawerFooter}>
        <button
          className={`${styles.primaryAction} ${isInTray ? styles.primaryActionInTray : ''}`}
          onClick={handleTrayToggle}
        >
          {isInTray ? '✓ במגש — לחץ להסרה' : 'הוסף למגש עבודה'}
        </button>

        <div className={styles.secondaryActions}>
          <button className={styles.secondaryAction} type="button" disabled>
            <span>
              השתמש במחשבון
              <span className={styles.futureLabel}>חיבור מלא — בשלב הבא</span>
            </span>
          </button>
          <button className={styles.secondaryAction} type="button" disabled>
            <span>
              צור תעודה
              <span className={styles.futureLabel}>חיבור מלא — בשלב הבא</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
