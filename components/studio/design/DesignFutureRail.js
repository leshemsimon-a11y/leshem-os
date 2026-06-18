// components/studio/design/DesignFutureRail.js
//
// LESHEM.S OS — Design Studio Future Affordances (Clean 3)
//
// Renders the RESERVED future actions of the Jewelry Design Studio as clearly
// DISABLED placeholders. These reserve architecture + UI space for the future
// Reference + Stone → Jewelry Design Visualization workflow, without building
// any of it now. Nothing here is interactive: no uploads, no links, no render.
//
// Each item reuses the same honest visual language as the rest of the studio:
// a dashed, muted tile with a "בקרוב" badge. A small group caption explains
// the area in Hebrew. Mobile-first: tiles wrap and stay readable, never tiny.

import { tokens } from '../shared/tokens';
import { DESIGN_HE } from '../../../lib/studio/labels';

function FutureTile({ label, glyph }) {
  return (
    <div
      style={styles.tile}
      aria-disabled="true"
      title={DESIGN_HE.futureHint}
      dir="rtl"
    >
      <span style={styles.tileGlyph} aria-hidden="true">
        {glyph}
      </span>
      <span style={styles.tileLabel}>{label}</span>
      <span style={styles.tileBadge}>{DESIGN_HE.futureBadge}</span>
    </div>
  );
}

export default function DesignFutureRail({ variant }) {
  const F = DESIGN_HE.future;

  if (variant === 'reference') {
    return (
      <div style={styles.grid}>
        <FutureTile label={F.addReferenceImage} glyph="▣" />
        <FutureTile label={F.addSketch} glyph="✎" />
        <FutureTile label={F.add3dFile} glyph="◫" />
        <FutureTile label={F.addDesignLink} glyph="🔗" />
        <FutureTile label={F.addWrittenDirection} glyph="✑" />
      </div>
    );
  }

  if (variant === 'models') {
    return (
      <div style={styles.grid}>
        <FutureTile label={F.matchModels} glyph="◈" />
      </div>
    );
  }

  if (variant === 'render') {
    return (
      <div style={styles.grid}>
        <FutureTile label={F.generateRenderBrief} glyph="✺" />
        <FutureTile label={F.createVisualization} glyph="◆" />
      </div>
    );
  }

  // Clean 3.3 — render split into two distinct board zones.
  if (variant === 'renderBrief') {
    return (
      <div style={styles.grid}>
        <FutureTile label={F.generateRenderBrief} glyph="✺" />
      </div>
    );
  }

  if (variant === 'visualization') {
    return (
      <div style={styles.grid}>
        <FutureTile label={F.createVisualization} glyph="◆" />
      </div>
    );
  }

  if (variant === 'collection') {
    return (
      <div style={styles.grid}>
        <FutureTile label={F.buildCollection} glyph="❖" />
        <FutureTile label={F.bulkDesign} glyph="⊞" />
      </div>
    );
  }

  if (variant === 'clientOutput') {
    return (
      <div style={styles.grid}>
        <FutureTile label={F.exportClient} glyph="⇧" />
        <FutureTile label={F.clientDataTable} glyph="▦" />
      </div>
    );
  }

  return null;
}

const styles = {
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  tile: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    minHeight: '52px',
    padding: '12px 16px',
    borderRadius: tokens.radius.md,
    border: `1px dashed ${tokens.color.cardEdge}`,
    background: tokens.color.pearl,
    color: tokens.color.disabledText,
    cursor: 'not-allowed',
    userSelect: 'none',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    flex: '1 1 220px',
    minWidth: '180px',
  },
  tileGlyph: {
    fontSize: '16px',
    lineHeight: 1,
    color: tokens.color.inkFaint,
  },
  tileLabel: {
    fontWeight: 500,
    flex: 1,
  },
  tileBadge: {
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: tokens.color.inkFaint,
    background: tokens.color.goldFaint,
    borderRadius: '999px',
    padding: '2px 8px',
    whiteSpace: 'nowrap',
  },
};
