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
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';
import { DotIcon, HomeIcon } from './StudioIcons';
import { reset } from './studioResetStyle';

export default function StudioCommandBar({ hasActiveWork, outputState, onExit }) {
  const L = STUDIO_5D_HE;

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
      <div style={styles.right}>
        <span style={styles.status} title={statusText} aria-label={statusText} role="status">
          <DotIcon size={8} color={dot} />
        </span>
        {typeof onExit === 'function' && (
          <button
            type="button"
            onClick={onExit}
            title={L.exitStudio}
            aria-label={L.aria.exitStudio}
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
  },
  right: { display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 },
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
