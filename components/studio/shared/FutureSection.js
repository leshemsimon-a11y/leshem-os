// components/studio/shared/FutureSection.js
//
// LESHEM.S OS — Honest Future State (Clean 1)
//
// Shown for any section that is navigable but not yet implemented.
// This is deliberately NOT a fake feature: it tells the truth in Hebrew that
// the section will open later, with no misleading actions. Honest disabled
// state over silent failure.

import { tokens } from './tokens';
import { UI_HE } from '../../../lib/studio/labels';

export default function FutureSection({ titleHe, descriptionHe }) {
  return (
    <div style={styles.wrap} dir="rtl">
      <div style={styles.mark} aria-hidden="true">
        ◆
      </div>
      <span style={styles.badge}>{UI_HE.futureBadge}</span>
      <h2 style={styles.title}>{titleHe}</h2>
      <p style={styles.desc}>{descriptionHe || UI_HE.futureHint}</p>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: '60vh',
    padding: '48px 24px',
    color: tokens.color.inkSoft,
  },
  mark: {
    fontSize: '28px',
    color: tokens.color.goldSoft,
    marginBottom: '18px',
    letterSpacing: '0.1em',
  },
  badge: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: tokens.color.gold,
    background: tokens.color.goldFaint,
    borderRadius: '999px',
    padding: '5px 14px',
    marginBottom: '20px',
  },
  title: {
    fontFamily: tokens.font.display,
    fontWeight: 400,
    fontSize: '26px',
    color: tokens.color.charcoal,
    margin: '0 0 10px',
  },
  desc: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    lineHeight: 1.6,
    color: tokens.color.inkFaint,
    maxWidth: '380px',
    margin: 0,
  },
};
