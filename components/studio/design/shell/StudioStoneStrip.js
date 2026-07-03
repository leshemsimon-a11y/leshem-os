// components/studio/design/shell/StudioStoneStrip.js
//
// LESHEM.S OS — Design Studio Layout Reset — Zone 1: Top Work Tray Ribbon.
//
// Shows the Work Tray items as compact visual chips: SQUARE contain
// thumbnail (full stone visible, never cropped), short name, carat + color
// only, a tiny status dot, and a clear selected state. Horizontal scroll.
// Handles one stone, many stones, parcels/lots, and the metal-only empty
// state. Reads tray item snapshots only; no logic, no mutation — clicking a
// chip calls the onSelectItem callback the shell wires to its own selection
// state (works for both real and demo tray items).
//
// Studio Layout Reset (Clean 5D-R4): thumbnail shape changed from a circular
// crop (object-fit: cover) to a square contain frame per the layout reset
// spec ("square thumbnail, object-fit contain... full gemstone visible...
// not cropped"). Selected state changed from a soft gold outline to a dark
// (graphite) border. Palette relit to near-white/graphite — see
// ./studioResetStyle.js. No data, props, or click behavior changed.

import * as React from 'react';
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';
import { getStoneThumbFallback } from '../../../../lib/studio/assetPack';
import { getGemstoneThumbFallback } from '../../../../lib/studio/demoGemstoneAssets';
import { getStatusLabelHe } from '../../../../lib/studio/demoInventoryLayer';
import { reset } from './studioResetStyle';

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

// A tiny, generic status dot — present whenever the item carries a status
// (Hebrew directly on real items, or the English enum on demo items via the
// existing getStatusLabelHe translator). No new status taxonomy: the dot is
// a single neutral color; the human label is the tooltip.
function statusLabelFor(item) {
  const s = item.snapshot || {};
  if (s.statusHe) return s.statusHe;
  if (s.status) return getStatusLabelHe(s.status);
  return null;
}

function StoneChip({ item, selected, onSelect, demoMode }) {
  const s = item.snapshot || {};
  const parcel = isParcel(item);
  const carat = typeof s.caratWeight === 'number' ? `${s.caratWeight}${STUDIO_5D_HE.caratSuffix}` : '';
  const color = typeof s.color === 'string' && s.color.trim() ? s.color.trim() : '';
  const realImg = typeof s.primaryImage === 'string' && s.primaryImage.trim() ? s.primaryImage : null;
  const demoImg = !realImg ? getGemstoneThumbFallback(item, 'box') || getStoneThumbFallback(item) : null;
  const img = realImg || demoImg;
  const statusLabel = statusLabelFor(item);

  const clickable = typeof onSelect === 'function';

  return (
    <button
      type="button"
      onClick={clickable ? () => onSelect(item) : undefined}
      style={{ ...styles.chip, ...(selected ? styles.chipSelected : null), ...(clickable ? styles.chipClickable : null) }}
      dir="rtl"
      aria-pressed={selected ? 'true' : undefined}
    >
      <span style={styles.thumb}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" style={styles.thumbImg} />
        ) : (
          <span style={styles.thumbPlaceholder} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
              <path d="M6 3h12l3 6-9 12L3 9l3-6z" />
              <path d="M3 9h18" />
            </svg>
          </span>
        )}
        {parcel ? <span style={styles.parcelBadge}>{STUDIO_5D_HE.parcelChip}</span> : null}
        {statusLabel ? <span style={styles.statusDot} title={statusLabel} aria-label={statusLabel} /> : null}
        {demoMode || demoImg ? (
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
    </button>
  );
}

export default function StudioStoneStrip({ trayItems, onAddStones, onSelectItem, selectedItemId, demoMode }) {
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
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
        {demoMode ? <span style={styles.demoModePill}>DEMO</span> : null}
        {items.map((it) => (
          <StoneChip
            key={it.id}
            item={it}
            selected={selectedItemId === it.id}
            onSelect={onSelectItem}
            demoMode={demoMode}
          />
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
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
    minHeight: '48px',
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.md,
  },
  stripLabel: {
    fontFamily: reset.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: reset.color.textFaint,
    flexShrink: 0,
  },
  scroller: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '2px',
  },
  chip: {
    border: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '5px 12px 5px 5px',
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.sm,
    flexShrink: 0,
  },
  chipClickable: { cursor: 'pointer' },
  chipSelected: {
    border: `1.5px solid ${reset.color.text}`,
    background: reset.color.panel,
  },
  demoModePill: {
    display: 'inline-flex',
    alignItems: 'center',
    alignSelf: 'center',
    height: '20px',
    padding: '0 8px',
    borderRadius: reset.radius.xs,
    background: reset.color.accentFaint,
    border: `1px solid ${reset.color.accent}`,
    color: reset.color.text,
    fontFamily: reset.font.body,
    fontSize: '9px',
    fontWeight: 800,
    letterSpacing: '0.1em',
    flexShrink: 0,
  },
  thumb: {
    position: 'relative',
    width: '36px',
    height: '36px',
    borderRadius: reset.radius.xs,
    overflow: 'hidden',
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: reset.color.textFaint,
    flexShrink: 0,
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'contain' },
  thumbPlaceholder: { display: 'inline-flex' },
  parcelBadge: {
    position: 'absolute',
    bottom: 0,
    insetInlineStart: 0,
    right: 0,
    fontSize: '7px',
    fontWeight: 700,
    letterSpacing: '0.02em',
    textAlign: 'center',
    color: reset.color.primaryText,
    background: reset.color.textMuted,
    lineHeight: '11px',
  },
  statusDot: {
    position: 'absolute',
    bottom: '2px',
    insetInlineStart: '2px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: reset.color.textMuted,
    border: `1px solid ${reset.color.panel}`,
  },
  demoBadge: {
    position: 'absolute',
    top: '1px',
    insetInlineEnd: '1px',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: reset.color.accent,
    border: `1px solid ${reset.color.panel}`,
  },
  meta: { display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 },
  title: {
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    color: reset.color.text,
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
  },
  sub: {
    fontFamily: reset.font.body,
    fontSize: '10.5px',
    fontWeight: 500,
    color: reset.color.textMuted,
    whiteSpace: 'nowrap',
  },
  emptyChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '7px 14px',
    background: reset.color.page,
    border: `1px dashed ${reset.color.border}`,
    borderRadius: reset.radius.sm,
  },
  emptyDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: reset.color.textFaint,
  },
  emptyText: {
    fontFamily: reset.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: reset.color.textMuted,
  },
  addBtn: {
    marginInlineStart: 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    flexShrink: 0,
    color: reset.color.text,
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.sm,
    cursor: 'pointer',
  },
};
