// components/studio/design/workstation/WorkstationRibbon.js
//
// LESHEM.S OS — Clean 6D: Studio Workstation Prototype — Zone 1.
//
// Top stone/material ribbon: the REAL Work Tray items as visual thumbnails
// with role chips, a selected state, and an add affordance. Purely
// presentational — the shell passes the tray items and the callbacks; every
// mutation goes through the EXISTING useWorkTray hook in the shell. Stone
// display strings come from the EXISTING buildStoneCore view-model
// (components/studio/design/shell/stoneView.js) — reused, not modified.

import * as React from 'react';
import { ws } from './wsStyle';
import { STUDIO_5D_HE, CONCEPT_HE } from '../../../../lib/studio/labels';
import { buildStoneCore } from '../shell/stoneView';
import { normalizeRole } from '../../../../lib/studio/designDraft';
import { PlusIcon, StoneFacets } from '../shell/StudioIcons';

function StoneThumb({ item, demoStone, selected, onSelect }) {
  const core = buildStoneCore(item, demoStone);
  if (!core) return null;
  const roleHeLabel =
    CONCEPT_HE.roleLabels[normalizeRole(item.role)] || CONCEPT_HE.roleLabels.unassigned;
  return (
    <button
      type="button"
      onClick={() => onSelect && onSelect(item)}
      style={{ ...styles.thumb, ...(selected ? styles.thumbSelected : null) }}
      title={core.title}
      dir="rtl"
    >
      <span style={styles.thumbMedia} aria-hidden="true">
        {core.image ? (
          <img src={core.image} alt="" style={styles.thumbImg} />
        ) : (
          <span style={styles.thumbGlyph}>
            <StoneFacets size={26} stroke={1.2} />
          </span>
        )}
      </span>
      <span style={styles.thumbText}>
        <span style={styles.thumbTitle}>{core.title}</span>
        <span style={styles.thumbRole}>{roleHeLabel}</span>
      </span>
    </button>
  );
}

export default function WorkstationRibbon({
  trayItems,
  demoStoneFor,
  selectedItemId,
  onSelectItem,
  onAddStones,
}) {
  const items = Array.isArray(trayItems) ? trayItems : [];
  return (
    <div style={styles.ribbon} dir="rtl">
      <span style={styles.label}>{STUDIO_5D_HE.stonesTitle}</span>
      <div style={styles.scroller}>
        {items.length === 0 ? (
          <span style={styles.emptyChip}>{STUDIO_5D_HE.stonesEmpty}</span>
        ) : (
          items.map((item) => (
            <StoneThumb
              key={item.id}
              item={item}
              demoStone={demoStoneFor ? demoStoneFor(item) : null}
              selected={selectedItemId === item.id}
              onSelect={onSelectItem}
            />
          ))
        )}
      </div>
      {typeof onAddStones === 'function' && (
        <button type="button" onClick={onAddStones} style={styles.addBtn} title={STUDIO_5D_HE.addStones}>
          <PlusIcon size={14} />
          <span>{STUDIO_5D_HE.addStones}</span>
        </button>
      )}
    </div>
  );
}

const styles = {
  ribbon: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minHeight: '64px',
    padding: '8px 12px',
    borderRadius: ws.radius.lg,
    background: ws.color.surface,
    border: `1px solid ${ws.color.border}`,
    boxShadow: ws.shadow.card,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  label: {
    fontFamily: ws.font.display,
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.4px',
    color: ws.color.textMuted,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  scroller: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '8px',
    overflowX: 'auto',
    minWidth: 0,
    flex: '1 1 auto',
    padding: '2px',
  },
  emptyChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '999px',
    border: `1px dashed ${ws.color.borderStrong}`,
    color: ws.color.textFaint,
    fontFamily: ws.font.body,
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  thumb: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '5px 12px 5px 8px',
    borderRadius: ws.radius.md,
    border: `1px solid ${ws.color.border}`,
    background: ws.color.surfaceStrong,
    cursor: 'pointer',
    flexShrink: 0,
    textAlign: 'right',
  },
  thumbSelected: {
    border: `1px solid ${ws.color.gold}`,
    background: ws.color.goldSoft,
    boxShadow: `0 0 0 1px ${ws.color.gold}`,
  },
  thumbMedia: {
    width: '38px',
    height: '38px',
    borderRadius: ws.radius.sm,
    overflow: 'hidden',
    background: 'rgba(0,0,0,0.35)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  thumbGlyph: { color: ws.color.textFaint, display: 'inline-flex' },
  thumbText: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '1px',
    minWidth: 0,
    maxWidth: '150px',
  },
  thumbTitle: {
    fontFamily: ws.font.body,
    fontSize: '12px',
    fontWeight: 700,
    color: ws.color.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  thumbRole: {
    fontFamily: ws.font.body,
    fontSize: '10.5px',
    fontWeight: 600,
    color: ws.color.gold,
    whiteSpace: 'nowrap',
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    minHeight: '34px',
    padding: '6px 13px',
    borderRadius: '999px',
    border: `1px solid ${ws.color.borderStrong}`,
    background: 'transparent',
    color: ws.color.text,
    fontFamily: ws.font.body,
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
};
