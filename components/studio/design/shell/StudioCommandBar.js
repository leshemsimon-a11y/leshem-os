// components/studio/design/shell/StudioCommandBar.js
//
// Clean 5D — top command bar. Compact studio identity + a calm status dot.
// Presentation only; status is derived from props, no logic here.

import * as React from 'react';
import { tokens } from '../../shared/tokens';
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';
import { DotIcon, SparkIcon } from './StudioIcons';

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
          <SparkIcon size={18} />
        </span>
        <span style={styles.name}>{L.appName}</span>
        <span style={styles.tag}>{L.studioTag}</span>
      </div>
      <div style={styles.status}>
        <DotIcon size={8} color={dot} />
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
    gap: '12px',
    padding: '13px 20px',
    background: `linear-gradient(180deg, ${tokens.color.graphiteSoft} 0%, ${tokens.color.graphite} 100%)`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.railGlow,
    color: tokens.color.platinum,
  },
  identity: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 },
  mark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    color: tokens.color.goldSoft,
    background: 'rgba(184,151,90,0.10)',
    border: '1px solid rgba(205,185,136,0.28)',
  },
  name: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    color: tokens.color.platinumSoft,
  },
  tag: {
    fontFamily: tokens.font.body,
    fontSize: '10.5px',
    fontWeight: 500,
    letterSpacing: '0.16em',
    color: tokens.color.goldSoft,
    paddingInlineStart: '12px',
    marginInlineStart: '2px',
    borderInlineStart: '1px solid rgba(205,185,136,0.22)',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    flexShrink: 0,
    padding: '6px 13px',
    borderRadius: tokens.radius.pill,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(233,230,223,0.10)',
  },
  statusText: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: tokens.color.platinum,
  },
};
