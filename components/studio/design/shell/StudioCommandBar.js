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
    padding: '10px 16px',
    background: tokens.color.graphite,
    borderRadius: tokens.radius.md,
    color: tokens.color.platinum,
  },
  identity: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 },
  mark: { display: 'inline-flex', color: tokens.color.goldSoft },
  name: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: tokens.color.platinumSoft,
  },
  tag: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    color: tokens.color.goldSoft,
    paddingInlineStart: '10px',
    borderInlineStart: `1px solid ${tokens.color.graphiteSoft}`,
  },
  status: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  statusText: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.color.platinum,
  },
};
