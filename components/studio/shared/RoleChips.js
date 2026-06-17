// components/studio/shared/RoleChips.js
//
// LESHEM.S OS — Role Chips (Clean 3.2)
//
// A visual, mobile-first role selector for the Work Tray. Instead of a form
// <select>, the jeweller taps a chip — like choosing what an object IS on the
// tray. Reusable and shared so the role vocabulary has a single presentation.
//
// Design rules honored:
//   • Large, easy-to-tap chips (>= 44px height) — never tiny buttons.
//   • Chips WRAP onto new lines; the row never scrolls horizontally.
//   • The role can ALWAYS be changed — every chip stays tappable, including
//     the currently-selected one and "ללא תפקיד" (move back to unassigned).
//   • Selected chip reads clearly with a soft-gold fill; unselected chips are
//     calm ivory outlines. The "unassigned" selection stays visibly distinct.
//
// Pure presentation: it takes the canonical role list + labels from the design
// draft layer (single source of truth) and reports a canonical role back via
// onChange(role). No network, no Airtable, no commerce language.

import { tokens } from './tokens';
import {
  ASSIGNABLE_ROLES,
  roleHe,
  normalizeRole,
  DESIGN_ROLE,
} from '../../../lib/studio/designDraft';

export default function RoleChips({ value, onChange, ariaLabel }) {
  const selected = normalizeRole(value);

  return (
    <div
      style={styles.wrap}
      role="radiogroup"
      aria-label={ariaLabel || 'תפקיד בעיצוב'}
      dir="rtl"
    >
      {ASSIGNABLE_ROLES.map((role) => {
        const isSelected = role === selected;
        const isUnassigned = role === DESIGN_ROLE.UNASSIGNED;

        const chipStyle = {
          ...styles.chip,
          ...(isUnassigned ? styles.chipUnassigned : null),
          ...(isSelected
            ? isUnassigned
              ? styles.chipSelectedUnassigned
              : styles.chipSelected
            : null),
        };

        return (
          <button
            key={role}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange && onChange(role)}
            style={chipStyle}
          >
            {isSelected && !isUnassigned && (
              <span style={styles.tick} aria-hidden="true">
                ✓
              </span>
            )}
            <span style={styles.chipLabel}>{roleHe(role)}</span>
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexWrap: 'wrap', // chips wrap — never a horizontal scroller
    gap: '8px',
    width: '100%',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    minHeight: '44px', // comfortable tap target
    padding: '10px 16px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: 1.2,
    color: tokens.color.charcoal,
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 140ms ease, border-color 140ms ease, color 140ms ease',
  },
  // The "ללא תפקיד" chip reads softer when not selected so assigned roles pop.
  chipUnassigned: {
    color: tokens.color.inkSoft,
    borderStyle: 'dashed',
  },
  // Selected, assigned role — soft gold fill, clearly chosen.
  chipSelected: {
    color: tokens.color.charcoal,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
  },
  // Selected, but still "unassigned" — distinct, honest, not celebratory.
  chipSelectedUnassigned: {
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px dashed ${tokens.color.inkFaint}`,
  },
  tick: {
    fontSize: '13px',
    lineHeight: 1,
    color: tokens.color.gold,
  },
  chipLabel: {
    display: 'inline-block',
  },
};
