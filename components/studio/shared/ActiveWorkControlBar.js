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
  // Clean 8K — "Active Work File" is now visibly "היצירה הפעילה" (was
  // "תיק פעיל"), per the milestone's primary-terms table. Internal prop
  // names (activeProjectName etc.) are unchanged.
  activeBadge: 'היצירה הפעילה',
  noActive: 'אין יצירה פעילה',
  openProjects: 'פתח תיקי יצירה',
  clearStudio: 'סגור את היצירה הפעילה',
  // Clean 8F — Media Access From Studio. Clean 8K — "מדיה והדמיות" is now
  // visibly "הדמיות ותצוגה".
  openMedia: 'פתח הדמיות ותצוגה',
  mediaNeedsWorkFile: 'צריך לשמור או לפתוח תיק יצירה לפני ניהול הדמיות ותצוגה',
});

export default function ActiveWorkControlBar({
  activeProjectName,
  onOpenProjects,
  onClearStudio,
  // Clean 8F — OPTIONAL media action (additive; existing call sites without
  // these props render byte-for-byte the same bar as before). When
  // mediaEnabled is false the button renders disabled with the Hebrew helper
  // text; the shell owns the routing — no logic here.
  onOpenMedia,
  mediaEnabled,
  // Clean 8K — OPTIONAL compact contextual summary line ("3 אבנים · 2
  // רפרנסים · כיוון אחד נבחר"), shown under the name when provided. Existing
  // call sites without this prop render byte-for-byte the same bar as
  // before.
  contextSummary,
}) {
  const hasActive = Boolean(activeProjectName);
  const showMedia = typeof onOpenMedia === 'function';
  const mediaOn = showMedia && Boolean(mediaEnabled);
  return (
    <div style={styles.bar} dir="rtl" aria-label={HE.activeBadge}>
      <div style={styles.status}>
        <span style={{ ...styles.badge, ...(hasActive ? null : styles.badgeMuted) }}>
          {hasActive ? HE.activeBadge : HE.noActive}
        </span>
        {hasActive ? (
          <span style={styles.nameGroup}>
            <span style={styles.name} title={activeProjectName}>
              {activeProjectName}
            </span>
            {contextSummary ? <span style={styles.contextSummary}>{contextSummary}</span> : null}
          </span>
        ) : null}
      </div>
      <div style={styles.actions}>
        {/* Clean 8F — «פתח מדיה והדמיות»: enabled only with an active Work
            File; otherwise a disabled button plus the helper line. */}
        {showMedia ? (
          <span style={styles.mediaGroup}>
            <button
              type="button"
              onClick={mediaOn ? onOpenMedia : undefined}
              disabled={!mediaOn}
              style={{ ...styles.mediaBtn, ...(mediaOn ? null : styles.mediaBtnDisabled) }}
              title={mediaOn ? HE.openMedia : HE.mediaNeedsWorkFile}
            >
              {HE.openMedia}
            </button>
            {!mediaOn ? <span style={styles.mediaHint}>{HE.mediaNeedsWorkFile}</span> : null}
          </span>
        ) : null}
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
  // Clean 8K — the name + compact context-summary line stack vertically.
  nameGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    minWidth: 0,
  },
  contextSummary: {
    fontFamily: reset.font.body,
    fontSize: '11px',
    fontWeight: 500,
    color: reset.color.textMuted,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '360px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  // Clean 8F — media action styles (gold accent border so the action is
  // clearly visible; accent is never used as a background per reset rules).
  mediaGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },
  mediaBtn: {
    minHeight: '30px',
    padding: '5px 12px',
    fontFamily: reset.font.body,
    fontSize: '12px',
    fontWeight: 700,
    color: reset.color.text,
    background: reset.color.page,
    border: `1px solid ${reset.color.accent}`,
    borderRadius: reset.radius.sm,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  mediaBtnDisabled: {
    color: reset.color.textFaint,
    border: `1px solid ${reset.color.border}`,
    cursor: 'default',
  },
  mediaHint: {
    fontFamily: reset.font.body,
    fontSize: '11px',
    color: reset.color.textMuted,
    whiteSpace: 'normal',
    minWidth: 0,
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
