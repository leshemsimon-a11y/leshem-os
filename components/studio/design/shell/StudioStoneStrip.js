// components/studio/design/shell/StudioStoneStrip.js
//
// Clean 5D — top selected-stones strip. Shows the Work Tray items as compact
// visual chips: image-or-placeholder, shape/type, carat, short color hint.
// Full gemological data stays hidden (Iceberg) — it lives in the inspector.
//
// Handles one stone, many stones, parcels/lots, and the metal-only empty state.
// Reads tray item snapshots only; no logic, no mutation.
//
// Clean 5D-R3: this panel was already on the light ivory chrome direction —
// only comfort/accessibility polish here (larger add-stones target, explicit
// aria-label, slightly calmer empty-state wording emphasis). No logic touched.
//
// Clean 5D-R3 + Starter Asset Pack v1: when a tray item has NO real
// snapshot.primaryImage, the chip now falls back to a best-effort demo
// illustration from the Starter Asset Pack (getStoneThumbFallback) instead
// of the generic line icon. A small gold "אילוסטרציה" dot marks these as
// non-final demo art — never mistaken for the real item photo. If nothing
// in the pack matches the item's shape/type text, the original generic icon
// fallback is used exactly as before (zero regression).

import * as React from 'react';
import { tokens } from '../../shared/tokens';
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';
import { getStoneThumbFallback } from '../../../../lib/studio/assetPack';
import { getGemstoneThumbFallback } from '../../../../lib/studio/demoGemstoneAssets';

const PARCEL_ROLES = new Set(['parcel']);

function isParcel(item) {
  if (!item) return false;
  if (PARCEL_ROLES.has(item.role)) return true;
  const s = item.snapshot || {};
  return typeof s.stoneCount === 'number' && s.stoneCount > 1;
}

function chipTitle(item) {
  const s = item.snapshot || {};
  return s.shapeHe || s.stoneTypeHe || s.name || s.productTypeHe || '—';
}

function StoneChip({ item }) {
  const s = item.snapshot || {};
  const parcel = isParcel(item);
  const carat = typeof s.caratWeight === 'number' ? `${s.caratWeight}${STUDIO_5D_HE.caratSuffix}` : '';
  const color = typeof s.color === 'string' && s.color.trim() ? s.color.trim() : '';
  const realImg = typeof s.primaryImage === 'string' && s.primaryImage.trim() ? s.primaryImage : null;
  const demoImg = !realImg ? getGemstoneThumbFallback(item, 'box') || getStoneThumbFallback(item) : null;
  const img = realImg || demoImg;

  return (
    <div style={styles.chip} dir="rtl">
      <span style={styles.thumb}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" style={styles.thumbImg} />
        ) : (
          <span style={styles.thumbPlaceholder} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
              <path d="M6 3h12l3 6-9 12L3 9l3-6z" />
              <path d="M3 9h18" />
            </svg>
          </span>
        )}
        {parcel ? <span style={styles.parcelBadge}>{STUDIO_5D_HE.parcelChip}</span> : null}
        {demoImg ? (
          <span
            style={styles.demoBadge}
            title={STUDIO_5D_HE.demoThumbBadge}
            aria-label={STUDIO_5D_HE.demoThumbBadge}
          />
        ) : null}
      </span>
      <span style={styles.meta}>
        <span style={styles.title}>{chipTitle(item)}</span>
        <span style={styles.sub}>
          {[carat, color].filter(Boolean).join(' · ') || '\u00A0'}
        </span>
      </span>
    </div>
  );
}

export default function StudioStoneStrip({ trayItems, onAddStones }) {
  const items = Array.isArray(trayItems) ? trayItems : [];

  if (items.length === 0) {
    return (
      <div style={styles.strip} dir="rtl">
        <span style={styles.stripLabel}>{STUDIO_5D_HE.stonesTitle}</span>
        <div style={styles.emptyChip}>
          <span style={styles.emptyDot} aria-hidden="true" />
          <span style={styles.emptyText}>{STUDIO_5D_HE.stonesEmpty}</span>
        </div>
        {typeof onAddStones === 'function' && (
          <button
            type="button"
            onClick={onAddStones}
            style={styles.addBtn}
            title={STUDIO_5D_HE.addStones}
            aria-label={STUDIO_5D_HE.aria.addStones}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={styles.strip} dir="rtl">
      <span style={styles.stripLabel}>{STUDIO_5D_HE.stonesTitle}</span>
      <div style={styles.scroller}>
        {items.map((it) => (
          <StoneChip key={it.id} item={it} />
        ))}
      </div>
      {typeof onAddStones === 'function' && (
        <button
          type="button"
          onClick={onAddStones}
          style={styles.addBtn}
          title={STUDIO_5D_HE.addStones}
          aria-label={STUDIO_5D_HE.aria.addStones}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      )}
    </div>
  );
}

const styles = {
  strip: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '8px 16px',
    height: '100%',
    minHeight: '52px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    boxShadow: tokens.shadow.soft,
  },
  stripLabel: {
    fontFamily: tokens.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: tokens.color.inkFaint,
    flexShrink: 0,
    writingMode: 'horizontal-tb',
  },
  scroller: {
    display: 'flex',
    gap: '9px',
    overflowX: 'auto',
    paddingBottom: '2px',
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '5px 14px 5px 5px',
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.pill,
    boxShadow: tokens.shadow.hairline,
    flexShrink: 0,
  },
  thumb: {
    position: 'relative',
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: `radial-gradient(circle at 35% 30%, ${tokens.color.platinumSoft}, ${tokens.color.iceFaint})`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.color.ice,
    flexShrink: 0,
    boxShadow: 'inset 0 1px 2px rgba(127,168,184,0.18)',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbPlaceholder: { display: 'inline-flex' },
  parcelBadge: {
    position: 'absolute',
    bottom: 0,
    insetInlineStart: 0,
    right: 0,
    fontSize: '7.5px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textAlign: 'center',
    color: tokens.color.ivory,
    background: tokens.color.ice,
    lineHeight: '12px',
  },
  demoBadge: {
    position: 'absolute',
    top: '1px',
    insetInlineEnd: '1px',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: tokens.color.gold,
    border: `1px solid ${tokens.color.ivory}`,
  },
  meta: { display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 },
  title: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
  },
  sub: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 500,
    color: tokens.color.inkSoft,
    whiteSpace: 'nowrap',
    letterSpacing: '0.02em',
  },
  emptyChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '8px 16px',
    background: tokens.color.platinumSoft,
    border: `1px dashed ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.pill,
  },
  emptyDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: tokens.color.goldSoft,
  },
  emptyText: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    letterSpacing: '0.02em',
  },
  addBtn: {
    marginInlineStart: 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    flexShrink: 0,
    color: tokens.color.gold,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
    borderRadius: '50%',
    cursor: 'pointer',
  },
};
