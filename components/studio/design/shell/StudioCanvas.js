// components/studio/design/shell/StudioCanvas.js
//
// Clean 5D-R — the dominant central canvas. The visual heart of the
// workstation. It frames whatever the shell passes (direction inputs, concept
// cards, output) on a calm CAD surface and, when a direction is selected,
// presents the North-Star SPLIT feeling: left = concept/jewelry preview,
// right = blueprint / technical sketch area. All drawn in CSS — no assets,
// no render generation. Logic stays in the passed-in panels.
//
// Fills its grid cell and scrolls INTERNALLY so the workstation feels like an
// app, not a page.

import * as React from 'react';
import { tokens } from '../../shared/tokens';
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';

// Faint CAD dual-grid background (no asset files).
const BLUEPRINT_BG =
  'url("data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">' +
      '<rect width="80" height="80" fill="none"/>' +
      '<path d="M80 0H0V80" fill="none" stroke="rgba(127,168,184,0.10)" stroke-width="1"/>' +
      '<path d="M20 0V80M40 0V80M60 0V80M0 20H80M0 40H80M0 60H80" fill="none" stroke="rgba(127,168,184,0.05)" stroke-width="1"/>' +
      '</svg>'
  ) +
  '")';

// A simple inline "jewel" mark used as the preview placeholder (no real render).
function JewelGlyph({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="jg" cx="42%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#EDEAE3" />
          <stop offset="100%" stopColor="#D8D3C8" />
        </radialGradient>
      </defs>
      <path
        d="M30 28h60l18 26-48 50-48-50 18-26z"
        fill="url(#jg)"
        stroke="#C9C3B6"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M12 54h96M40 28l-10 26 30 50 30-50-10-26M48 28l-8 26 20 50 20-50-8-26"
        fill="none"
        stroke="#C9C3B6"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StudioCanvas({ mode = 'concepts', selected, hasConcepts, children }) {
  const split = mode === 'selected' && selected;

  return (
    <section style={styles.canvas} dir="rtl">
      <div style={styles.blueprint} aria-hidden="true" />

      {split ? (
        <div style={styles.split}>
          {/* LEFT — concept / jewelry preview */}
          <div style={styles.previewPane}>
            <span style={styles.paneTag}>{STUDIO_5D_HE.canvasRender}</span>
            <div style={styles.previewArt}>
              <JewelGlyph size={132} />
              <span style={styles.previewHint}>{STUDIO_5D_HE.canvasPreviewSoon}</span>
            </div>
            <span style={styles.previewTitle}>{selected.conceptName}</span>
          </div>

          {/* RIGHT — blueprint / technical sketch */}
          <div style={styles.blueprintPane}>
            <span style={styles.paneTag}>{STUDIO_5D_HE.canvasBlueprint}</span>
            <div style={styles.blueprintArt} aria-hidden="true">
              <svg width="100%" height="100%" viewBox="0 0 260 260" fill="none" preserveAspectRatio="xMidYMid meet">
                <circle cx="130" cy="150" r="62" stroke="#B9C3C8" strokeWidth="1.2" />
                <circle cx="130" cy="150" r="40" stroke="#CBD3D7" strokeWidth="1" strokeDasharray="3 4" />
                <path d="M130 18v74M70 150h120M104 92l8 16h36l8-16" stroke="#B9C3C8" strokeWidth="1.1" />
                <path d="M112 92l-6 16M148 92l6 16" stroke="#CBD3D7" strokeWidth="1" />
                <path d="M130 18l-10 22M130 18l10 22" stroke="#CBD3D7" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        // Direction inputs / concept cards / output: panel body fills the canvas.
        <div style={styles.flow}>
          {(mode === 'concepts' && !hasConcepts) && (
            <span style={styles.flowEyebrow}>{STUDIO_5D_HE.canvasNoConcepts}</span>
          )}
          {children}
        </div>
      )}
    </section>
  );
}

const styles = {
  canvas: {
    position: 'relative',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.canvas,
    overflow: 'hidden',
    minHeight: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  blueprint: {
    position: 'absolute',
    inset: 0,
    backgroundColor: tokens.color.canvas,
    backgroundImage: `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.7), transparent 55%), ${BLUEPRINT_BG}`,
    backgroundSize: 'auto, 80px 80px',
    pointerEvents: 'none',
  },

  // ---- split (selected) ----
  split: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 0,
    flex: 1,
    minHeight: 0,
  },
  previewPane: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    padding: '24px',
    background:
      'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.9), rgba(244,239,230,0.5))',
  },
  blueprintPane: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    borderInlineStart: `1px solid ${tokens.color.cardEdge}`,
  },
  paneTag: {
    position: 'absolute',
    top: '14px',
    insetInlineEnd: '16px',
    fontFamily: tokens.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    color: tokens.color.inkFaint,
  },
  previewArt: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  previewHint: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
    letterSpacing: '0.02em',
  },
  previewTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '20px',
    color: tokens.color.charcoal,
    textAlign: 'center',
  },
  blueprintArt: {
    width: '100%',
    maxWidth: '300px',
    aspectRatio: '1 / 1',
    color: tokens.color.ice,
    opacity: 0.9,
  },

  // ---- flow (direction / concepts / output) ----
  flow: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '20px 22px',
  },
  flowEyebrow: {
    display: 'block',
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    color: tokens.color.gold,
    marginBottom: '12px',
  },
};
