// components/studio/design/shell/StudioBottomStrip.js
//
// Clean 5D — bottom variant / action strip. A compact dock showing the design
// directions as selectable variant thumbnails plus ONE obvious primary action.
//
// It owns no logic: variant selection and the primary action are passed in as
// callbacks from the shell (which wires them to the existing concept/output
// handlers). The primary label/intent is computed by the shell from flow state.

import * as React from 'react';
import { tokens } from '../../shared/tokens';
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';
import { CheckIcon } from './StudioIcons';

function Variant({ concept, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect && onSelect(concept.conceptId)}
      style={{ ...styles.variant, ...(selected ? styles.variantSelected : null) }}
      dir="rtl"
      title={concept.conceptName}
    >
      <span style={styles.variantThumb} aria-hidden="true">
        {selected ? (
          <span style={styles.selDot}>
            <CheckIcon size={14} />
          </span>
        ) : null}
      </span>
      <span style={styles.variantName}>{concept.conceptName}</span>
    </button>
  );
}

export default function StudioBottomStrip({
  concepts,
  selectedId,
  onSelectVariant,
  primaryLabel,
  primaryDisabled,
  onPrimary,
}) {
  const list = Array.isArray(concepts) ? concepts : [];
  return (
    <div style={styles.strip} dir="rtl">
      <div style={styles.variants}>
        <span style={styles.variantsLabel}>{STUDIO_5D_HE.variantsTitle}</span>
        <div style={styles.variantScroller}>
          {list.length === 0 ? (
            <span style={styles.noVariants}>{STUDIO_5D_HE.canvasNoConcepts}</span>
          ) : (
            list.map((c) => (
              <Variant
                key={c.conceptId}
                concept={c}
                selected={c.conceptId === selectedId}
                onSelect={onSelectVariant}
              />
            ))
          )}
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
    background: tokens.color.graphite,
    borderRadius: tokens.radius.md,
    boxShadow: tokens.shadow.lift,
  },
  variants: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: '1 1 auto' },
  variantsLabel: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: tokens.color.goldSoft,
    flexShrink: 0,
  },
  variantScroller: { display: 'flex', gap: '8px', overflowX: 'auto', minWidth: 0 },
  noVariants: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.platinum,
    opacity: 0.7,
    whiteSpace: 'nowrap',
  },
  variant: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px 6px 8px',
    background: tokens.color.graphiteSoft,
    border: `1px solid transparent`,
    borderRadius: '999px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  variantSelected: {
    border: `1px solid ${tokens.color.gold}`,
    background: tokens.color.graphiteSoft,
  },
  variantThumb: {
    position: 'relative',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: tokens.color.graphite,
    border: `1px solid ${tokens.color.iceFaint}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selDot: { color: tokens.color.gold, display: 'inline-flex' },
  variantName: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.color.platinum,
    whiteSpace: 'nowrap',
  },
  primary: {
    minHeight: '46px',
    padding: '12px 26px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 700,
    color: tokens.color.graphite,
    background: tokens.color.goldSoft,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    flexShrink: 0,
  },
  primaryDisabled: {
    background: tokens.color.graphiteSoft,
    color: tokens.color.platinum,
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};
