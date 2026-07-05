// components/studio/shared/InlineInventoryPicker.js
//
// LESHEM.S OS — Patch D (Inventory / Tray / Studio Usability V1).
//
// A GENERIC, PRESENTATIONAL inline picker: a compact overlay sheet that lets
// the user add/remove items to the current work WITHOUT leaving the screen.
// First consumer: the Work Tray ("הוסף פריטים"). Designed to be reused later
// for side stones, accent stones (אבנים נוספות), chains, jewelry parts,
// client stones, and supplier stones — so it makes NO gemstone-only
// assumptions and owns NO business logic.
//
// Strict contract (approved):
//   • receives display entries as props        — `items`
//   • receives current membership ids as props — `selectedIds`
//   • receives callbacks as props              — `onAdd(entry)` /
//     `onRemove(entry)` / `onClose()`
//   • NO store imports, NO persistence, NO new storage keys, NO fake local
//     selection state — membership truth always comes from the caller.
//
// Each entry is a plain display object the CALLER prepares:
//   { id, title, subtitle?, image?, chips?: string[] }
// The caller keeps its own mapping back to real data; this component never
// inspects anything beyond these display fields. The only local state is the
// search query (pure presentational filtering of the provided entries).

import * as React from 'react';
import { tokens } from './tokens';
import { USABILITY_D_HE } from '../../../lib/studio/labels';

function SearchIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  );
}
function PlusIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function CheckIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12.5l5 5L20 6" />
    </svg>
  );
}
function CloseIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function entryMatches(entry, q) {
  if (!q) return true;
  const hay = [entry.title, entry.subtitle, ...(Array.isArray(entry.chips) ? entry.chips : [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(q);
}

export default function InlineInventoryPicker({
  open,
  title,
  items,
  selectedIds,
  onAdd,
  onRemove,
  onClose,
}) {
  const L = USABILITY_D_HE;
  const [query, setQuery] = React.useState('');

  if (!open) return null;

  const entries = Array.isArray(items) ? items : [];
  const ids =
    selectedIds instanceof Set
      ? selectedIds
      : new Set(Array.isArray(selectedIds) ? selectedIds : []);
  const q = query.trim().toLowerCase();
  const visible = entries.filter((e) => e && e.id != null && entryMatches(e, q));

  return (
    <div style={styles.overlay} dir="rtl" role="dialog" aria-modal="true" aria-label={title || L.pickerTitle}>
      <button type="button" style={styles.backdrop} onClick={onClose} aria-label={L.pickerClose} />
      <div style={styles.sheet}>
        <div style={styles.head}>
          <span style={styles.title}>{title || L.pickerTitle}</span>
          <button type="button" onClick={onClose} style={styles.closeBtn} aria-label={L.pickerClose}>
            <CloseIcon />
          </button>
        </div>

        <div style={styles.searchWrap}>
          <span style={styles.searchIcon} aria-hidden="true"><SearchIcon /></span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={L.pickerSearch}
            style={styles.searchInput}
            dir="rtl"
          />
        </div>

        <div style={styles.list}>
          {visible.length === 0 ? (
            <div style={styles.empty}>{L.pickerEmpty}</div>
          ) : (
            visible.map((entry) => {
              const inWork = ids.has(entry.id);
              return (
                <div key={entry.id} style={styles.rowCard}>
                  <span style={styles.thumb}>
                    {entry.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={entry.image} alt="" style={styles.thumbImg} />
                    ) : (
                      <span style={styles.thumbPlaceholder} aria-hidden="true">◆</span>
                    )}
                  </span>
                  <span style={styles.meta}>
                    <span style={styles.rowTitle}>{entry.title}</span>
                    {entry.subtitle ? <span style={styles.rowSub}>{entry.subtitle}</span> : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => (inWork ? onRemove && onRemove(entry) : onAdd && onAdd(entry))}
                    style={{ ...styles.actionBtn, ...(inWork ? styles.actionBtnOn : null) }}
                    aria-pressed={inWork ? 'true' : 'false'}
                    title={inWork ? L.pickerRemove : L.pickerAdd}
                  >
                    {inWork ? <CheckIcon /> : <PlusIcon />}
                    {inWork ? L.pickerInTray : L.pickerAdd}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div style={styles.foot}>
          <button type="button" onClick={onClose} style={styles.doneBtn}>
            {L.pickerDone}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 60,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(43,40,36,0.42)',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    margin: 0,
  },
  sheet: {
    position: 'relative',
    width: '100%',
    maxWidth: '640px',
    maxHeight: 'min(80vh, 640px)',
    display: 'flex',
    flexDirection: 'column',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: `${tokens.radius.lg} ${tokens.radius.lg} 0 0`,
    boxShadow: tokens.shadow.lift,
    margin: '0 8px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '14px 16px 10px',
    flexShrink: 0,
  },
  title: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '16px',
    color: tokens.color.charcoal,
  },
  closeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.cardEdge}`,
    background: tokens.color.ivory,
    color: tokens.color.inkSoft,
    cursor: 'pointer',
    flexShrink: 0,
  },
  searchWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px 10px',
    flexShrink: 0,
  },
  searchIcon: {
    position: 'absolute',
    insetInlineStart: '26px',
    color: tokens.color.inkFaint,
    display: 'inline-flex',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.cardEdge}`,
    background: tokens.color.ivory,
    padding: '10px 34px 10px 12px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: tokens.font.body,
    minHeight: '40px',
  },
  list: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '2px 16px 12px',
  },
  empty: {
    padding: '32px 0',
    textAlign: 'center',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.inkFaint,
  },
  rowCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    padding: '8px',
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
  },
  thumb: {
    width: '52px',
    height: '52px',
    flexShrink: 0,
    borderRadius: tokens.radius.sm,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.cardEdge}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' },
  thumbPlaceholder: { color: tokens.color.inkFaint, fontSize: '16px' },
  meta: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 },
  rowTitle: {
    fontFamily: tokens.font.body,
    fontSize: '13.5px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rowSub: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    minHeight: '38px',
    padding: '8px 13px',
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.sm,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  actionBtnOn: {
    background: tokens.color.sage,
    borderColor: tokens.color.sage,
    color: tokens.color.ivory,
  },
  foot: {
    padding: '10px 16px calc(12px + env(safe-area-inset-bottom, 0px))',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  doneBtn: {
    minHeight: '44px',
    padding: '10px 26px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
};
