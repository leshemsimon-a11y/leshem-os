// components/studio/shared/ActiveWorkControlBar.js
//
// LESHEM.S OS — Clean 8C: Active Work Control bar.
//
// A clearly visible control row near the top of the Studio (NOT a small
// chip): shows «תיק פעיל» + the active Work File name when available, plus
// the two session controls — «פתח תיקי עבודה» and «נקה סטודיו».
//
// PRESENTATIONAL only: the shell owns the data + the confirm-guarded clear
// logic (Clean 8B handleClearStudio, unchanged) and passes callbacks in.
// No store imports, no persistence, no routing logic here.

import * as React from 'react';
import { reset } from '../design/shell/studioResetStyle';

const HE = Object.freeze({
  activeBadge: 'תיק פעיל',
  noActive: 'אין תיק פעיל',
  openProjects: 'פתח תיקי עבודה',
  clearStudio: 'נקה סטודיו',
});

export default function ActiveWorkControlBar({
  activeProjectName,
  onOpenProjects,
  onClearStudio,
}) {
  const hasActive = Boolean(activeProjectName);
  return (
    <div style={styles.bar} dir="rtl" aria-label={HE.activeBadge}>
      <div style={styles.status}>
        <span style={{ ...styles.badge, ...(hasActive ? null : styles.badgeMuted) }}>
          {hasActive ? HE.activeBadge : HE.noActive}
        </span>
        {hasActive ? (
          <span style={styles.name} title={activeProjectName}>
            {activeProjectName}
          </span>
        ) : null}
      </div>
      <div style={styles.actions}>
        {typeof onOpenProjects === 'function' && (
          <button type="button" onClick={onOpenProjects} style={styles.openBtn}>
            {HE.openProjects}
          </button>
        )}
        {typeof onClearStudio === 'function' && (
          <button type="button" onClick={onClearStudio} style={styles.clearBtn}>
            {HE.clearStudio}
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    flexWrap: 'wrap',
    padding: '7px 12px',
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.md,
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    minWidth: 0,
  },
  badge: {
    fontFamily: reset.font.body,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: reset.color.text,
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.sm,
    padding: '3px 9px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  badgeMuted: {
    color: reset.color.textFaint,
  },
  name: {
    fontFamily: reset.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: reset.color.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
    maxWidth: '360px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  openBtn: {
    minHeight: '30px',
    padding: '5px 12px',
    fontFamily: reset.font.body,
    fontSize: '12px',
    fontWeight: 700,
    color: reset.color.text,
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.sm,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  clearBtn: {
    minHeight: '30px',
    padding: '5px 12px',
    fontFamily: reset.font.body,
    fontSize: '12px',
    fontWeight: 700,
    color: reset.color.textMuted,
    background: 'transparent',
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.sm,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};
