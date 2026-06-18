// components/studio/design/DesignBoardZone.js
//
// LESHEM.S OS — Design Board Zone (Clean 3.3)
//
// The repeating frame that gives /studio/design its "board of zones" feel.
// Each zone has a CSS glyph token, a short Hebrew title + caption, and either
// active content (the stones zone) or a clearly DISABLED future treatment.
//
// Honesty rules (unchanged philosophy): a future zone must never look active.
// It uses a dashed, muted frame, a "שלב עתידי" badge, aria-disabled, and a
// not-allowed cursor on its surface. No handlers, no fake controls.
//
// Pure presentation. No network, no Airtable, no uploads, no commerce.

import { tokens } from '../shared/tokens';
import { DESIGN_HE } from '../../../lib/studio/labels';

export default function DesignBoardZone({
  title,
  caption,
  glyph = '◆',
  future = false,
  children,
}) {
  const sectionStyle = future
    ? { ...styles.zone, ...styles.zoneFuture }
    : styles.zone;
  const tokenStyle = future
    ? { ...styles.token, ...styles.tokenFuture }
    : { ...styles.token, ...styles.tokenActive };

  return (
    <section
      style={sectionStyle}
      dir="rtl"
      aria-disabled={future ? 'true' : undefined}
      title={future ? DESIGN_HE.futureHint : undefined}
    >
      <div style={styles.head}>
        <span style={tokenStyle} aria-hidden="true">
          {glyph}
        </span>
        <div style={styles.headText}>
          <div style={styles.titleRow}>
            <h2 style={future ? styles.titleFuture : styles.title}>{title}</h2>
            {future && (
              <span style={styles.stageBadge}>{DESIGN_HE.futureStage}</span>
            )}
          </div>
          {caption && <p style={styles.caption}>{caption}</p>}
        </div>
      </div>

      {children && <div style={styles.body}>{children}</div>}
    </section>
  );
}

const styles = {
  zone: {
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.soft,
    padding: '18px',
    marginBottom: '16px',
  },
  // Future zones read calmer + dashed so they can never look active.
  zoneFuture: {
    background: tokens.color.pearl,
    border: `1px dashed ${tokens.color.cardEdge}`,
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  head: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  token: {
    width: '34px',
    height: '34px',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    borderRadius: tokens.radius.md,
  },
  tokenActive: {
    color: tokens.color.gold,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
  },
  tokenFuture: {
    color: tokens.color.inkFaint,
    background: tokens.color.canvas,
    border: `1px dashed ${tokens.color.cardEdge}`,
  },
  headText: {
    minWidth: 0,
    flex: 1,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: tokens.font.display,
    fontWeight: 400,
    fontSize: '19px',
    color: tokens.color.charcoal,
    margin: 0,
  },
  titleFuture: {
    fontFamily: tokens.font.display,
    fontWeight: 400,
    fontSize: '18px',
    color: tokens.color.inkSoft,
    margin: 0,
  },
  stageBadge: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: tokens.color.gold,
    background: tokens.color.goldFaint,
    borderRadius: '999px',
    padding: '3px 12px',
    whiteSpace: 'nowrap',
  },
  caption: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.5,
    color: tokens.color.inkFaint,
    margin: '4px 0 0',
  },
  body: {
    marginTop: '16px',
  },
};
