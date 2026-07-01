// components/studio/design/shell/StudioBottomStrip.js
//
// Clean 5D — bottom variant / action strip. A compact dock showing the design
// directions as selectable variant thumbnails plus ONE obvious primary action.
//
// It owns no logic: variant selection and the primary action are passed in as
// callbacks from the shell (which wires them to the existing concept/output
// handlers). The primary label/intent is computed by the shell from flow state.
//
// Clean 5D-R3: relit to the light ivory/platinum chrome direction (was dark
// graphite). Selected variant uses the same soft-gold recipe as the rest of
// the studio (goldFaint fill + gold border). The single gold CTA is
// unchanged — it remains the one dominant action in the whole workstation.

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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" style={{ color: tokens.color.goldSoft }}>
          <path d="M6 3h12l3 6-9 12L3 9l3-6z" />
        </svg>
        {selected ? (
          <span style={styles.selDot}>
            <CheckIcon size={13} />
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
    gap: '18px',
    flexWrap: 'wrap',
    padding: '14px 18px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.soft,
  },
  variants: { display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: '1 1 auto' },
  variantsLabel: {
    fontFamily: tokens.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: tokens.color.gold,
    flexShrink: 0,
  },
  variantScroller: { display: 'flex', gap: '8px', overflowX: 'auto', minWidth: 0, padding: '2px' },
  variant: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    minHeight: '44px',
    padding: '6px 16px 6px 6px',
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.pill,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'border-color 140ms, background 140ms',
  },
  variantSelected: {
    border: `1px solid ${tokens.color.gold}`,
    background: tokens.color.goldFaint,
  },
  variantThumb: {
    position: 'relative',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: `radial-gradient(circle at 35% 30%, ${tokens.color.platinumSoft}, ${tokens.color.iceFaint})`,
    border: `1px solid ${tokens.color.cardEdge}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selDot: { color: tokens.color.gold, display: 'inline-flex', position: 'absolute', insetInlineEnd: '-3px', top: '-3px' },
  slot: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '32px',
    borderRadius: '999px',
    border: `1px dashed ${tokens.color.goldFaint}`,
    background: 'rgba(255,255,255,0.5)',
    flexShrink: 0,
  },
  slotDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: tokens.color.goldSoft,
  },
  variantName: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    whiteSpace: 'nowrap',
    letterSpacing: '0.02em',
  },
  primary: {
    minHeight: '50px',
    padding: '13px 32px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 700,
    letterSpacing: '0.02em',
    color: tokens.color.graphite,
    background: `linear-gradient(180deg, ${tokens.color.goldSoft} 0%, ${tokens.color.gold} 100%)`,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    flexShrink: 0,
    boxShadow: '0 6px 18px rgba(184,151,90,0.28)',
    transition: 'transform 140ms, box-shadow 140ms',
  },
  primaryDisabled: {
    background: tokens.color.platinumSoft,
    color: tokens.color.inkFaint,
    opacity: 0.8,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
};
