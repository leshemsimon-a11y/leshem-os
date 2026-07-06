// components/studio/design/shell/StudioBottomStrip.js
//
// LESHEM.S OS — Design Studio Layout Reset — variant / action strip.
//
// A compact dock showing the design directions as selectable variant
// thumbnails plus ONE obvious primary action. Now docked to the bottom of
// the Center Work Canvas column only (see StudioShell.js), not the full
// screen width, so it reads as part of Zone 3 rather than a separate strip.
//
// It owns no logic: variant selection and the primary action are passed in
// as callbacks from the shell (which wires them to the existing concept/
// output handlers). The primary label/intent is computed by the shell from
// flow state — unchanged.
//
// Studio Layout Reset (Clean 5D-R4): relit to the near-white/graphite
// direction; pill shapes reduced to compact rectangular chips. No logic
// changed.

import * as React from 'react';
import { STUDIO_5D_HE, STUDIO_6A_HE } from '../../../../lib/studio/labels';
import { CheckIcon } from './StudioIcons';
import ConceptSketch from './ConceptSketch';
import { reset } from './studioResetStyle';

// Clean 6A — each variant thumb shows the direction's DERIVED schematic
// sketch (render-time only, deterministic per conceptId) instead of one
// generic gem glyph, so directions read visually distinct at a glance.
function Variant({ concept, selected, onSelect, stoneShapes, fallbackProductType }) {
  return (
    <button
      type="button"
      onClick={() => onSelect && onSelect(concept.conceptId)}
      style={{ ...styles.variant, ...(selected ? styles.variantSelected : null) }}
      dir="rtl"
      title={STUDIO_6A_HE.sketch.thumbTitle(concept.conceptName)}
    >
      <span style={styles.variantThumb} aria-hidden="true">
        <ConceptSketch
          concept={concept}
          fallbackProductType={fallbackProductType}
          stoneShapes={stoneShapes}
          size={26}
        />
        {selected ? (
          <span style={styles.selDot}>
            <CheckIcon size={11} />
          </span>
        ) : null}
      </span>
      <span style={styles.variantName}>{concept.conceptName}</span>
    </button>
  );
}

function EmptySlot() {
  return (
    <span style={styles.slot} aria-hidden="true">
      <span style={styles.slotDot} />
    </span>
  );
}

export default function StudioBottomStrip({
  concepts,
  selectedId,
  onSelectVariant,
  primaryLabel,
  primaryDisabled,
  onPrimary,
  // Clean 6A — additive, optional: current tray stone shapes + brief product
  // type so each thumb's derived sketch reflects the real composition.
  stoneShapes = [],
  fallbackProductType = null,
}) {
  const list = Array.isArray(concepts) ? concepts : [];
  return (
    <div style={styles.strip} dir="rtl">
      <div style={styles.variants}>
        <span style={styles.variantsLabel}>{STUDIO_5D_HE.variantsTitle}</span>
        <div style={styles.variantScroller}>
          {list.length === 0
            ? [0, 1, 2].map((i) => <EmptySlot key={i} />)
            : list.map((c) => (
                <Variant
                  key={c.conceptId}
                  concept={c}
                  selected={c.conceptId === selectedId}
                  onSelect={onSelectVariant}
                  stoneShapes={stoneShapes}
                  fallbackProductType={fallbackProductType}
                />
              ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        style={{ ...styles.primary, ...(primaryDisabled ? styles.primaryDisabled : null) }}
      >
        {primaryLabel}
      </button>
    </div>
  );
}

const styles = {
  strip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
    padding: '12px 16px',
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.md,
    flexShrink: 0,
  },
  variants: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: '1 1 auto' },
  variantsLabel: {
    fontFamily: reset.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: reset.color.textFaint,
    flexShrink: 0,
  },
  variantScroller: { display: 'flex', gap: '7px', overflowX: 'auto', minWidth: 0, padding: '2px' },
  variant: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minHeight: '38px',
    padding: '5px 14px 5px 5px',
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.sm,
    cursor: 'pointer',
    flexShrink: 0,
  },
  variantSelected: {
    border: `1.5px solid ${reset.color.text}`,
    background: reset.color.panel,
  },
  variantThumb: {
    position: 'relative',
    width: '28px',
    height: '28px',
    borderRadius: reset.radius.xs,
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: reset.color.textMuted,
  },
  selDot: {
    color: reset.color.text,
    display: 'inline-flex',
    position: 'absolute',
    insetInlineEnd: '-3px',
    top: '-3px',
  },
  slot: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '30px',
    borderRadius: reset.radius.sm,
    border: `1px dashed ${reset.color.border}`,
    background: reset.color.page,
    flexShrink: 0,
  },
  slotDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: reset.color.textFaint,
  },
  variantName: {
    fontFamily: reset.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: reset.color.text,
    whiteSpace: 'nowrap',
  },
  primary: {
    minHeight: '44px',
    padding: '11px 26px',
    fontFamily: reset.font.body,
    fontSize: '13.5px',
    fontWeight: 700,
    letterSpacing: '0.01em',
    color: reset.color.primaryText,
    background: reset.color.primaryBg,
    border: 'none',
    borderRadius: reset.radius.sm,
    cursor: 'pointer',
    flexShrink: 0,
  },
  primaryDisabled: {
    background: reset.color.border,
    color: reset.color.textFaint,
    opacity: 0.9,
    cursor: 'not-allowed',
  },
};
