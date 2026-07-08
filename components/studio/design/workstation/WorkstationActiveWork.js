// components/studio/design/workstation/WorkstationActiveWork.js
//
// LESHEM.S OS — Clean 6F: Continue Work File Flow — Active Work banner.
//
// Compact context card near the top of /studio/workstation, shown ONLY when
// an Active Work exists: the Work File name, its stone/item count, its
// direction status, plus "פתח תיקי עבודה" and "שמור גרסה חדשה" (the latter is
// the EXISTING Clean 6E save behavior — always a new Work File; no
// update/overwrite in this milestone).
//
// PRESENTATIONAL only: the shell resolves the active project from the
// existing stores and passes plain props. No store imports, no persistence,
// no state of its own. Stone-count wording reuses the existing
// PROJECTS_HE.itemsCount. When there is no Active Work the shell simply does
// not render this component — nothing dramatic.

import * as React from 'react';
import { ws } from './wsStyle';
import { WS_HE } from './wsLabels';
import { PROJECTS_HE } from '../../../../lib/studio/labels';

export default function WorkstationActiveWork({
  name,
  itemsCount,
  hasSelectedDirection,
  onOpenProjects,
  onSaveNew,
  canSaveNew,
}) {
  return (
    <section style={styles.banner} dir="rtl" aria-label={WS_HE.activeWork.badge}>
      <span style={styles.badge}>{WS_HE.activeWork.badge}</span>
      <div style={styles.text}>
        <span style={styles.name}>{name}</span>
        <span style={styles.meta}>
          {WS_HE.activeWork.subtitle}
          {' · '}
          {PROJECTS_HE.itemsCount(itemsCount || 0)}
          {' · '}
          {hasSelectedDirection ? WS_HE.process.selectedDirection : WS_HE.activeWork.noDirection}
        </span>
      </div>
      <div style={styles.actions}>
        <button type="button" onClick={onOpenProjects} style={styles.openBtn}>
          {WS_HE.save.openProjects}
        </button>
        <button
          type="button"
          onClick={canSaveNew ? onSaveNew : undefined}
          disabled={!canSaveNew}
          style={{ ...styles.saveNewBtn, ...(!canSaveNew ? styles.saveNewDisabled : null) }}
          title={canSaveNew ? WS_HE.activeWork.saveNew : WS_HE.save.emptyGuard}
        >
          {WS_HE.activeWork.saveNew}
        </button>
      </div>
    </section>
  );
}

const styles = {
  banner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    padding: '9px 14px',
    borderRadius: ws.radius.md,
    background: ws.color.goldFaint,
    border: `1px solid ${ws.color.gold}`,
  },
  badge: {
    padding: '3px 10px',
    borderRadius: '999px',
    background: ws.color.gold,
    color: '#14161A',
    fontFamily: ws.font.body,
    fontSize: '10.5px',
    fontWeight: 800,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    minWidth: 0,
    flex: '1 1 auto',
  },
  name: {
    fontFamily: ws.font.body,
    fontSize: '13px',
    fontWeight: 800,
    color: ws.color.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  meta: {
    fontFamily: ws.font.body,
    fontSize: '11px',
    fontWeight: 600,
    color: ws.color.textMuted,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  actions: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  openBtn: {
    minHeight: '30px',
    padding: '5px 13px',
    borderRadius: '999px',
    border: `1px solid ${ws.color.gold}`,
    background: 'transparent',
    color: ws.color.gold,
    fontFamily: ws.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  saveNewBtn: {
    minHeight: '30px',
    padding: '5px 13px',
    borderRadius: '999px',
    border: 'none',
    background: ws.color.primaryBg,
    color: ws.color.primaryText,
    fontFamily: ws.font.body,
    fontSize: '11.5px',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  saveNewDisabled: {
    background: ws.color.surfaceStrong,
    color: ws.color.textFaint,
    border: `1px solid ${ws.color.border}`,
    cursor: 'not-allowed',
  },
};
