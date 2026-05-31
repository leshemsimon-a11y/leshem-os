/**
 * LESHEM.S OS — v2 Asset Drawer
 *
 * Read-only detail view of a single asset.
 * NEVER shows: Airtable Record ID, cost price (in this v2.1 build without permission),
 * Internal Notes label exposed to client, demo notes.
 * Cut/Form is NOT shown as a customer-facing field.
 * Shape IS shown (customer-facing).
 * Geographic origin is separate from Natural/Lab-Grown origin.
 * All sections collapsible.
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
  white_diamond: '◇',
  fancy_color_diamond: '◈',
  colored_gemstone: '○',
  parcel: '⊡',
  part: '⊟',
  finished_jewelry: '◎',
};

export default function AssetDrawer({ asset, onClose }) {
  const { addItem, removeItem, items } = useWorkTray();

  if (!asset) return null;

  const isInTray = items.some(
    (i) => i._airtableId && i._airtableId === asset._airtableId
  );

  const title = getAssetDisplayTitle(asset);

  // Resolve labels
  const categoryLabel = getStoneCategoryLabel(asset.stoneCategory, 'he');
  const originLabel = getOriginGrowthLabel(asset.origin, 'he');
  const typeLabel = getStoneTypeLabel(asset.stoneType, 'he');
  const shapeLabel = getShapeLabel(asset.shape, 'he');   // customer-facing
  const layerLabel = getInventoryLayerLabel(asset.inventoryLayer, 'he');
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

  // Lab info
  const labInfo = [asset.labName, asset.reportNumber].filter(Boolean).join(' · ');

  // Fancy color
  const fancyColorDesc = [
    asset.fancyColorIntensity,
    asset.fancyColorHue,
    asset.fancyColorOvertone,
  ].filter(Boolean).join(' ');

  function handleTrayToggle() {
    if (isInTray) {
      removeItem(asset._airtableId);
    } else {
      addItem(asset);
    }
  }

  return (
    <>
      {/* Drawer panel */}
      <div className={styles.drawer} role="dialog" aria-label="פרטי פריט">
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitle}>פרטי פריט</div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="סגור">
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className={styles.drawerBody}>
          {/* Image */}
          <div className={styles.imageSection}>
            {imageSrc ? (
              <img src={imageSrc} alt={title} className={styles.drawerImage} />
            ) : (
              <div className={styles.imagePlaceholder} aria-hidden="true">
                {placeholderIcon}
              </div>
            )}
          </div>

          {/* Title */}
          <div className={styles.assetTitleSection}>
            <h2 className={styles.assetMainTitle}>{title}</h2>
            {asset.status && (
              <StatusBadge status={asset.status} />
            )}
          </div>

          {/* 1. Key Specs */}
          <Section title="מפרט עיקרי" defaultOpen={true}>
            <div className={styles.fieldGrid}>
              <Field label="קטגוריה" value={categoryLabel} />
              <Field label="מקור גידול" value={originLabel} />
              <Field label="סוג אבן" value={typeLabel} />
              <Field
                label="צורה"
                value={shapeLabel}
                /* Shape is customer-facing. Cut/Form is NOT shown here. */
              />
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
              <Field label="צבע" value={asset.color} />
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

          {/* 2. Gemological Details */}
          <Section title="פרטים גמולוגיים" defaultOpen={false}>
            <div className={styles.fieldGrid}>
              <Field label="פוליש" value={asset.polish} muted />
              <Field label="סימטריה" value={asset.symmetry} muted />
              <Field label="פלואורסנציה" value={asset.fluorescence} muted />
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
                {/*
                  Geographic origin is shown here as a separate field.
                  It is NOT the same as Natural/Lab-Grown (origin/growth).
                */}
                <Field label="מקור גאוגרפי" value={geoOriginLabel} muted />
              </div>
            )}
          </Section>

          {/* 3. Certificate / Lab Info */}
          <Section title="תעודה ומעבדה" defaultOpen={false}>
            <div className={styles.fieldGrid}>
              <Field label="מעבדה" value={asset.labName} />
              <Field label="מספר תעודה" value={asset.reportNumber} />
            </div>
          </Section>

          {/* 4. Inventory / Admin Info */}
          <Section title="פרטי מלאי" defaultOpen={false}>
            <div className={styles.fieldGrid}>
              <Field label="שכבת מלאי" value={layerLabel} />
              <Field label="ספק" value={asset.supplierName} muted />
              {asset.createdAt && (
                <Field
                  label="נוסף בתאריך"
                  value={
                    asset.createdAt
                      ? new Date(asset.createdAt).toLocaleDateString('he-IL')
                      : null
                  }
                  muted
                />
              )}
            </div>
          </Section>

          {/* 5. Internal Notes — clearly marked as internal, not customer-facing */}
          {asset.internalNotes && (
            <Section title="הערות פנימיות" defaultOpen={false}>
              <div className={styles.internalBadge}>פנימי בלבד · לא מוצג ללקוח</div>
              <div className={styles.notesText}>{asset.internalNotes}</div>
            </Section>
          )}
        </div>

        {/* ── Actions footer ── */}
        <div className={styles.drawerFooter}>
          {/* Primary action: Work Tray */}
          <button
            className={`${styles.primaryAction} ${isInTray ? styles.primaryActionInTray : ''}`}
            onClick={handleTrayToggle}
          >
            {isInTray ? '✓ במגש — לחץ להסרה' : 'הוסף למגש עבודה'}
          </button>

          {/* Secondary actions */}
          <div className={styles.secondaryActions}>
            {/* Calculator — links to existing MVP calculator */}
            <a
              className={styles.secondaryAction}
              href="/"
              title="עבור למחשבון"
            >
              <span>
                השתמש במחשבון
                <span className={styles.futureLabel}>חיבור מלא — בשלב הבא</span>
              </span>
            </a>

            {/* Certificate — links to existing MVP certificate flow */}
            <a
              className={styles.secondaryAction}
              href="/"
              title="עבור לתעודות"
            >
              <span>
                צור תעודה
                <span className={styles.futureLabel}>חיבור מלא — בשלב הבא</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
