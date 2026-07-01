// components/studio/design/shell/StudioCommandBar.js
//
// Clean 5D-R — compact command bar (top-left cell). Studio identity + a calm
// status pill. Presentation only; status derived from props.
//
// Clean 5D-R3: relit to the light ivory/platinum chrome direction. The bar is
// no longer a heavy dark surface — it reads as a calm card, matching the
// canvas and inspector. Graphite/dark tones are used only as small text
// contrast (e.g. inside the identity mark), never as a full-width surface.
// No logic changed — status text/dot mapping is identical to 5D-R2.

import * as React from 'react';
import { tokens } from '../../shared/tokens';
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';
import { DotIcon } from './StudioIcons';

export default function StudioCommandBar({ hasActiveWork, outputState }) {
  const L = STUDIO_5D_HE;

  let statusText = L.statusDraft;
  let dot = tokens.color.inkFaint;
  if (hasActiveWork) {
    statusText = L.statusActive;
    dot = tokens.color.sage;
  }
  if (outputState === 'ready') {
    statusText = L.statusOutputReady;
    dot = tokens.color.gold;
  } else if (outputState === 'stale') {
    statusText = L.statusOutputStale;
    dot = tokens.color.ice;
  }

  return (
    <header style={styles.bar} dir="rtl">
      <div style={styles.identity}>
        <span style={styles.mark} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
            <path d="M6 3h12l3 6-9 12L3 9l3-6z" />
          </svg>
        </span>
        <span style={styles.name}>{L.appName}</span>
      </div>
      <div style={styles.status}>
        <DotIcon size={7} color={dot} />
        <span style={styles.statusText}>{statusText}</span>
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
    padding: '0 18px',
    height: '100%',
    minHeight: '52px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    color: tokens.color.charcoal,
    boxShadow: tokens.shadow.soft,
  },
  identity: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 },
  mark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    color: tokens.color.gold,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
    flexShrink: 0,
  },
  name: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: tokens.color.charcoal,
    whiteSpace: 'nowrap',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    flexShrink: 0,
    padding: '6px 12px',
    borderRadius: '999px',
    background: tokens.color.platinumSoft,
    border: `1px solid ${tokens.color.cardEdge}`,
  },
  statusText: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.03em',
    color: tokens.color.inkSoft,
    whiteSpace: 'nowrap',
  },
};
