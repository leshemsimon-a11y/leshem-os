// components/studio/design/shell/StudioCommandBar.js
//
// LESHEM.S OS — Design Studio Layout Reset — top command bar (top-left cell).
// Studio identity + a calm status pill + the studio exit control (moved here
// from the workflow step indicator, which is now embedded in the canvas
// header — see StudioCanvas usage in StudioShell.js). Presentation only;
// status derived from props, exit is a plain navigation callback from the
// shell (router.push('/studio')) — no business logic here.
//
// Studio Layout Reset (Clean 5D-R4): relit to the near-white / graphite
// direction (see ./studioResetStyle.js). No status logic changed.

import * as React from 'react';
import { STUDIO_5D_HE, STUDIO_6B_HE } from '../../../../lib/studio/labels';
import { DotIcon, HomeIcon, StoneIcon, TrayNavIcon } from './StudioIcons';
import { reset } from './studioResetStyle';

// Clean 6B — one calm breadcrumb escape: icon-only, quiet, always visible.
function NavBtn({ Icon: Ic, label, title, onClick, narrow }) {
  if (typeof onClick !== 'function') return null;
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title} style={styles.navBtn}>
      <Ic size={14} />
      {!narrow && <span style={styles.navLabel}>{label}</span>}
    </button>
  );
}

export default function StudioCommandBar({
  hasActiveWork,
  outputState,
  onExit,
  onSaveSession,
  canSaveSession,
  // Clean 6B — always-visible escape navigation (plain callbacks from the
  // shell; presentation only). `narrow` collapses labels to icons.
  onGoInventory,
  onGoTray,
  narrow,
}) {
  const L = STUDIO_5D_HE;
  // Patch B — Session Save. Presentation only: the shell owns the save
  // logic; this bar renders one compact action. Disabled ONLY when there is
  // genuinely nothing to save (empty tray + empty brief) — a real state,
  // explained via a short tooltip, never a fake placeholder control.
  const showSave = typeof onSaveSession === 'function';
  const saveDisabled = !canSaveSession;

  let statusText = L.statusDraft;
  let dot = reset.color.textFaint;
  if (hasActiveWork) {
    statusText = L.statusActive;
    dot = reset.color.text;
  }
  if (outputState === 'ready') {
    statusText = L.statusOutputReady;
    dot = reset.color.accent;
  } else if (outputState === 'stale') {
    statusText = L.statusOutputStale;
    dot = reset.color.textMuted;
  }

  return (
    <header style={styles.bar} dir="rtl">
      <div style={styles.identity}>
        <span style={styles.mark} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
            <path d="M6 3h12l3 6-9 12L3 9l3-6z" />
          </svg>
        </span>
        <span style={styles.name}>{L.appName}</span>
      </div>
      {/* Clean 6B — calm escape breadcrumb: מלאי · מגש עבודה. Exit to לוח
          הבקרה stays as the existing Home control in the right cluster. */}
      <nav style={styles.crumbs} aria-label={STUDIO_6B_HE.nav.dashboardTitle}>
        <NavBtn
          Icon={StoneIcon}
          label={STUDIO_6B_HE.nav.inventory}
          title={STUDIO_6B_HE.nav.inventoryTitle}
          onClick={onGoInventory}
          narrow={narrow}
        />
        <NavBtn
          Icon={TrayNavIcon}
          label={STUDIO_6B_HE.nav.tray}
          title={STUDIO_6B_HE.nav.trayTitle}
          onClick={onGoTray}
          narrow={narrow}
        />
      </nav>
      <div style={styles.right}>
        {showSave && (
          <button
            type="button"
            onClick={saveDisabled ? undefined : onSaveSession}
            disabled={saveDisabled}
            title={saveDisabled ? L.saveSessionEmptyHint : L.saveSession}
            aria-label={L.saveSessionAria}
            style={{
              ...styles.saveBtn,
              ...(saveDisabled ? styles.saveBtnDisabled : null),
            }}
          >
            {L.saveSession}
          </button>
        )}
        <span style={styles.status} title={statusText} aria-label={statusText} role="status">
          <DotIcon size={8} color={dot} />
        </span>
        {typeof onExit === 'function' && (
          <button
            type="button"
            onClick={onExit}
            title={STUDIO_6B_HE.nav.dashboardTitle}
            aria-label={STUDIO_6B_HE.nav.dashboardTitle}
            style={styles.exitBtn}
          >
            <HomeIcon size={16} />
          </button>
        )}
      </div>
    </header>
  );
}

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '0 14px',
    height: '100%',
    minHeight: '48px',
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.md,
    color: reset.color.text,
  },
  identity: { display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 },
  mark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: reset.radius.sm,
    color: reset.color.text,
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
    flexShrink: 0,
  },
  name: {
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: reset.color.text,
    whiteSpace: 'nowrap',
    // Patch B — the bar's right cluster gained a save action; the identity
    // text truncates gracefully instead of overflowing the narrow column.
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  right: { display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 },
  // Clean 6B — breadcrumb escape cluster.
  crumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    minWidth: 0,
    overflow: 'hidden',
  },
  navBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    minHeight: '28px',
    padding: '4px 9px',
    borderRadius: reset.radius.sm,
    border: `1px solid ${reset.color.border}`,
    background: reset.color.page,
    color: reset.color.textMuted,
    fontFamily: reset.font.body,
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  navLabel: { display: 'inline-block' },
  // Patch B — compact primary save action (שמור תיק עבודה).
  saveBtn: {
    minHeight: '28px',
    padding: '5px 10px',
    fontFamily: reset.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    color: reset.color.primaryText,
    background: reset.color.primaryBg,
    border: 'none',
    borderRadius: reset.radius.sm,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  saveBtnDisabled: {
    color: reset.color.textFaint,
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
    cursor: 'not-allowed',
  },
  status: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: reset.radius.sm,
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
    cursor: 'default',
  },
  exitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: reset.radius.sm,
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
    color: reset.color.textMuted,
    cursor: 'pointer',
  },
};
