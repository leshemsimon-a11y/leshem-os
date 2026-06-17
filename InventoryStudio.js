// components/studio/shared/FuturePlaceholder.js
//
// LESHEM.S OS — Future Placeholder (Clean 2.5)
//
// A subtle, clearly-disabled affordance for actions that are planned but not
// yet active (Add Stone, Upload Certificate, Add Report Link, Upload Media).
//
// Deliberately NOT a button: it is a non-interactive element with disabled
// styling and a "בקרוב" badge, so it can never be mistaken for a working
// control. Honest UI over fake functionality.

import { tokens } from './tokens';
import { INVENTORY_HE } from '../../../lib/studio/labels';

export default function FuturePlaceholder({
  label,
  glyph = '＋',
  block = false,
}) {
  return (
    <div
      style={{ ...styles.wrap, ...(block ? styles.block : null) }}
      aria-disabled="true"
      title={INVENTORY_HE.future.hint}
      dir="rtl"
    >
      <span style={styles.glyph} aria-hidden="true">
        {glyph}
      </span>
      <span style={styles.label}>{label}</span>
      <span style={styles.badge}>{INVENTORY_HE.future.badge}</span>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 14px',
    borderRadius: tokens.radius.sm,
    border: `1px dashed ${tokens.color.cardEdge}`,
    background: tokens.color.pearl,
    color: tokens.color.disabledText,
    cursor: 'not-allowed',
    userSelect: 'none',
    fontFamily: tokens.font.body,
    fontSize: '13px',
  },
  block: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: '14px',
    lineHeight: 1,
    color: tokens.color.inkFaint,
  },
  label: {
    fontWeight: 500,
  },
  badge: {
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: tokens.color.inkFaint,
    background: tokens.color.goldFaint,
    borderRadius: '999px',
    padding: '2px 8px',
    marginInlineStart: '2px',
  },
};
