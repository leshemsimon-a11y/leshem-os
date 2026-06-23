// components/studio/inventory/LocalInventoryItemCard.js
//
// LESHEM.S OS — Local Inventory Item Card (Clean 4C)
//
// One local inventory item rendered as a selectable card: checkbox for
// multi-select, asset-linked thumbnail (if any), title, type, source/ownership,
// client/supplier context, an availability selector, and quick actions (add to
// tray, remove). Used in all three local sections (physical / supplier /
// client). Local only — no Airtable, no pricing.

import { tokens } from '../shared/tokens';
import { INV_HE } from '../../../lib/studio/labels';
import { INV_AVAILABILITY_VALUES } from '../../../lib/studio/inventoryStore';
import AssetThumbnail from '../assets/AssetThumbnail';
import { getFileUrl } from '../../../lib/studio/assetsStore';

export default function LocalInventoryItemCard({
  item,
  selected,
  onToggleSelect,
  onAvailability,
  onAddToTray,
  onRemove,
  inTray,
}) {
  const sd = item.stoneData || {};
  const stoneLine = [sd.shape, sd.weightCt ? `${sd.weightCt} ct` : null, sd.color, sd.clarity]
    .filter(Boolean)
    .join(' · ');

  const contextLine =
    item.linkedClientName
      ? `${INV_HE.clientPrefix}${item.linkedClientName}`
      : item.supplierName
      ? `${INV_HE.supplierPrefix}${item.supplierName}`
      : INV_HE.ownership[item.ownershipType] || '';

  return (
    <div style={{ ...styles.card, ...(selected ? styles.cardSelected : null) }} dir="rtl">
      <div style={styles.head}>
        <label style={styles.checkboxWrap}>
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onToggleSelect(item.inventoryItemId)}
            style={styles.checkbox}
            aria-label={`${INV_HE.select}: ${item.title}`}
          />
        </label>
        <AssetThumbnail
          fileId={item.primaryFileId}
          getFileUrl={getFileUrl}
          alt={item.title}
          size={52}
        />
        <div style={styles.idCol}>
          <span style={styles.name}>{item.title}</span>
          <span style={styles.sub}>
            {INV_HE.itemType[item.itemType] || ''}
            {contextLine ? ` · ${contextLine}` : ''}
          </span>
          {stoneLine && <span style={styles.stoneLine}>{stoneLine}</span>}
        </div>
      </div>

      <div style={styles.availRow}>
        <label style={styles.availLabel}>{INV_HE.availabilityLabel}</label>
        <select
          value={item.availabilityStatus}
          onChange={(e) => onAvailability(item.inventoryItemId, e.target.value)}
          style={styles.select}
          dir="rtl"
        >
          {INV_AVAILABILITY_VALUES.map((a) => (
            <option key={a} value={a}>{INV_HE.availability[a]}</option>
          ))}
        </select>
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          onClick={() => onAddToTray(item)}
          disabled={inTray}
          style={{ ...styles.ghost, ...(inTray ? styles.disabled : null) }}
        >
          {inTray ? INV_HE.inTray : INV_HE.addToTray}
        </button>
        <button type="button" onClick={() => onRemove(item.inventoryItemId)} style={styles.removeBtn}>
          {INV_HE.remove}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px',
    background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.lg, boxShadow: tokens.shadow.soft,
  },
  cardSelected: { border: `1px solid ${tokens.color.gold}`, background: tokens.color.goldFaint },
  head: { display: 'flex', alignItems: 'center', gap: '10px' },
  checkboxWrap: { display: 'flex', alignItems: 'center', flexShrink: 0 },
  checkbox: { width: '20px', height: '20px', cursor: 'pointer', accentColor: tokens.color.gold },
  idCol: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 },
  name: { fontFamily: tokens.font.display, fontSize: '17px', color: tokens.color.charcoal, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  sub: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint },
  stoneLine: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkSoft, direction: 'ltr', textAlign: 'right' },
  availRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  availLabel: { fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 700, color: tokens.color.inkSoft, whiteSpace: 'nowrap' },
  select: {
    flex: 1, fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.ink,
    background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '8px 10px', minHeight: '40px',
  },
  actions: { display: 'flex', gap: '8px', alignItems: 'center' },
  ghost: {
    flex: 1, minHeight: '40px', padding: '8px 14px', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600,
    color: tokens.color.inkSoft, background: 'transparent', border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, cursor: 'pointer',
  },
  removeBtn: { minHeight: '40px', padding: '8px 12px', fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 600, color: tokens.color.inkFaint, background: 'transparent', border: 'none', cursor: 'pointer' },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
};
