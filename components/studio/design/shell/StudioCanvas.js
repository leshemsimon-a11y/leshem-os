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
// "render prep / CAD" feeling without adding any asset files.
const BLUEPRINT_BG =
  'url("data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">' +
      '<rect width="40" height="40" fill="none"/>' +
      '<path d="M40 0H0V40" fill="none" stroke="rgba(127,168,184,0.10)" stroke-width="1"/>' +
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
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.soft,
    overflow: 'hidden',
    minHeight: '320px',
    minWidth: 0,
  },
  canvasAccent: {
    border: `1px solid ${tokens.color.goldSoft}`,
  },
  blueprint: {
    position: 'absolute',
    inset: 0,
    backgroundColor: tokens.color.canvas,
    backgroundImage: BLUEPRINT_BG,
    backgroundSize: '40px 40px',
    opacity: 0.9,
    pointerEvents: 'none',
  },
  inner: { position: 'relative', padding: '18px 20px 22px' },
  head: { display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '14px' },
  title: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '18px',
    color: tokens.color.charcoal,
  },
  caption: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkSoft,
  },
  body: { minWidth: 0 },
};
