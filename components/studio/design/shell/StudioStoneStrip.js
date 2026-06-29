// components/studio/design/shell/StudioStoneStrip.js
//
// Clean 5D — top selected-stones strip. Shows the Work Tray items as compact
// visual chips: image-or-placeholder, shape/type, carat, short color hint.
// Full gemological data stays hidden (Iceberg) — it lives in the inspector.
//
// Handles one stone, many stones, parcels/lots, and the metal-only empty state.
// Reads tray item snapshots only; no logic, no mutation.

import * as React from 'react';
import { tokens } from '../../shared/tokens';
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';

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
  const img = typeof s.primaryImage === 'string' && s.primaryImage.trim() ? s.primaryImage : null;

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

export default function StudioStoneStrip({ trayItems }) {
  const items = Array.isArray(trayItems) ? trayItems : [];

  if (items.length === 0) {
    return (
      <div style={styles.strip} dir="rtl">
        <span style={styles.stripLabel}>{STUDIO_5D_HE.stonesTitle}</span>
        <div style={styles.emptyChip}>
          <span style={styles.emptyDot} aria-hidden="true" />
          <span style={styles.emptyText}>{STUDIO_5D_HE.stonesEmpty}</span>
        </div>
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
    </div>
  );
}

const styles = {
  strip: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    boxShadow: tokens.shadow.soft,
  },
  stripLabel: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: tokens.color.inkFaint,
    flexShrink: 0,
  },
  scroller: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '2px',
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px 6px 6px',
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px',
    flexShrink: 0,
  },
  thumb: {
    position: 'relative',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: tokens.color.iceFaint,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.color.ice,
    flexShrink: 0,
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbPlaceholder: { display: 'inline-flex' },
  parcelBadge: {
    position: 'absolute',
    bottom: 0,
    insetInlineStart: 0,
    right: 0,
    fontSize: '8px',
    fontWeight: 700,
    textAlign: 'center',
    color: tokens.color.ivory,
    background: tokens.color.ice,
    lineHeight: '12px',
  },
  meta: { display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 },
  title: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    whiteSpace: 'nowrap',
  },
  sub: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkSoft,
    whiteSpace: 'nowrap',
  },
  emptyChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    background: tokens.color.platinumSoft,
    border: `1px dashed ${tokens.color.goldFaint}`,
    borderRadius: '999px',
  },
  emptyDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: tokens.color.goldSoft,
  },
  emptyText: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
  },
};
