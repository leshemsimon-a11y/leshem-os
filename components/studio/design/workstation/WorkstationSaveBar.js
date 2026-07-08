// components/studio/design/workstation/WorkstationSaveBar.js
//
// LESHEM.S OS — Clean 6E: Save Work File from Workstation.
//
// Small PRESENTATIONAL save group for the workstation header:
//   • primary action "שמור כתיק עבודה" (disabled + helper text when the Work
//     Tray is empty)
//   • after a successful save — a quiet "פתח תיקי עבודה" action
//
// No store imports, no persistence, no state of its own beyond props — the
// shell owns the actual save through the EXISTING designProjects public API.

import * as React from 'react';
import { ws } from './wsStyle';
import { WS_HE } from './wsLabels';

export default function WorkstationSaveBar({ canSave, saved, onSave, onOpenProjects }) {
  return (
    <div style={styles.wrap} dir="rtl">
      <button
        type="button"
        onClick={canSave ? onSave : undefined}
        disabled={!canSave}
        style={{ ...styles.saveBtn, ...(!canSave ? styles.saveBtnDisabled : null) }}
        title={canSave ? WS_HE.save.action : WS_HE.save.emptyGuard}
      >
        {WS_HE.save.action}
      </button>
      {!canSave ? <span style={styles.guard}>{WS_HE.save.emptyGuard}</span> : null}
      {saved && typeof onOpenProjects === 'function' ? (
        <button type="button" onClick={onOpenProjects} style={styles.openBtn}>
          {WS_HE.save.openProjects}
        </button>
      ) : null}
    </div>
  );
}

const styles = {
  wrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    minWidth: 0,
  },
  saveBtn: {
    minHeight: '32px',
    padding: '6px 15px',
    borderRadius: '999px',
    border: 'none',
    background: ws.color.primaryBg,
    color: ws.color.primaryText,
    fontFamily: ws.font.body,
    fontSize: '12px',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  saveBtnDisabled: {
    background: ws.color.surfaceStrong,
    color: ws.color.textFaint,
    border: `1px solid ${ws.color.border}`,
    cursor: 'not-allowed',
  },
  guard: {
    fontFamily: ws.font.body,
    fontSize: '11px',
    fontWeight: 600,
    color: ws.color.textFaint,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '260px',
  },
  openBtn: {
    minHeight: '32px',
    padding: '6px 13px',
    borderRadius: '999px',
    border: `1px solid ${ws.color.gold}`,
    background: 'transparent',
    color: ws.color.gold,
    fontFamily: ws.font.body,
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};
