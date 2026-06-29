// components/studio/design/shell/StudioCanvas.js
//
// Clean 5D — central canvas, the main visual focus of the workstation. It does
// NOT own logic: it frames whatever the shell puts inside (direction inputs,
// the concept cards, or a selected-concept preview) on a calm surface with a
// subtle CAD/blueprint background drawn purely in CSS — no image assets.
//
// The header gives a one-line sense of "what am I looking at"; the body is the
// passed-in children (existing DesignConceptPanel, unchanged logic).

import * as React from 'react';
import { tokens } from '../../shared/tokens';
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';

// A faint blueprint grid + diagonal, as an inline SVG data background. Keeps the
// "render prep / CAD" feeling without adding any asset files. Clean 5D.1 adds a
// finer dual-grid (major + minor lines) for a more precise CAD surface.
const BLUEPRINT_BG =
  'url("data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">' +
      '<rect width="80" height="80" fill="none"/>' +
      '<path d="M80 0H0V80" fill="none" stroke="rgba(127,168,184,0.07)" stroke-width="1"/>' +
      '<path d="M20 0V80M40 0V80M60 0V80M0 20H80M0 40H80M0 60H80" fill="none" stroke="rgba(127,168,184,0.04)" stroke-width="1"/>' +
      '</svg>'
  ) +
  '")';

export default function StudioCanvas({ title, caption, accent = false, children }) {
  return (
    <section
      style={{ ...styles.canvas, ...(accent ? styles.canvasAccent : null) }}
      dir="rtl"
    >
      <div style={styles.blueprint} aria-hidden="true" />
      <div style={styles.inner}>
        {(title || caption) && (
          <div style={styles.head}>
            <span style={styles.eyebrow} aria-hidden="true">
              <span style={styles.eyebrowTick} />
              {STUDIO_5D_HE.rail.design}
            </span>
            {title ? <span style={styles.title}>{title}</span> : null}
            {caption ? <span style={styles.caption}>{caption}</span> : null}
          </div>
        )}
        <div style={styles.body}>{children}</div>
      </div>
    </section>
  );
}

const styles = {
  canvas: {
    position: 'relative',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.xl,
    boxShadow: tokens.shadow.canvas,
    overflow: 'hidden',
    minHeight: '380px',
    minWidth: 0,
  },
  canvasAccent: {
    border: `1px solid ${tokens.color.goldSoft}`,
    boxShadow: `${tokens.shadow.canvas}, 0 0 0 1px rgba(184,151,90,0.08)`,
  },
  blueprint: {
    position: 'absolute',
    inset: 0,
    backgroundColor: tokens.color.canvas,
    backgroundImage: `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.6), transparent 60%), ${BLUEPRINT_BG}`,
    backgroundSize: 'auto, 80px 80px',
    opacity: 0.95,
    pointerEvents: 'none',
  },
  inner: { position: 'relative', padding: '22px 26px 26px' },
  head: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '18px' },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    fontFamily: tokens.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.16em',
    color: tokens.color.gold,
    marginBottom: '2px',
  },
  eyebrowTick: {
    display: 'inline-block',
    width: '14px',
    height: '1.5px',
    background: tokens.color.goldSoft,
  },
  title: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '20px',
    letterSpacing: '0.01em',
    color: tokens.color.charcoal,
    lineHeight: 1.2,
  },
  caption: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkSoft,
    letterSpacing: '0.02em',
  },
  body: { minWidth: 0 },
};
