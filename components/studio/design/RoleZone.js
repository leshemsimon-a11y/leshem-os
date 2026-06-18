// components/studio/design/RoleZone.js
//
// LESHEM.S OS — Role Zone (Clean 3.3)
//
// One role's worth of stones inside the Stones board zone. A small CSS glyph
// "token" + the Hebrew role name forms the header; below it the stones render
// as visual object cards.
//
// Dominance: CENTER STONE and PAIR groups are laid out prominently (each on
// its own dominant card, never merged), so the stone the design is built
// around is immediately obvious. Other roles (side / parcel / component /
// reference / unassigned) render as a calm wrapping grid of standard cards.
//
// Pure presentation; consumes groups from buildDesignGroups (logic unchanged).
// No network, no Airtable, no commerce language.

import { tokens } from '../shared/tokens';
import StoneObjectCard from './StoneObjectCard';
import { DESIGN_ROLE } from '../../../lib/studio/designDraft';

// A simple CSS/symbol glyph per role — no icon packages, no image files.
const ROLE_GLYPH = {
  [DESIGN_ROLE.CENTER_STONE]: '◆',
  [DESIGN_ROLE.PAIR]: '❖',
  [DESIGN_ROLE.SIDE_STONE]: '◇',
  [DESIGN_ROLE.PARCEL]: '⬡',
  [DESIGN_ROLE.COMPONENT]: '◌',
  [DESIGN_ROLE.REFERENCE_ONLY]: '▣',
  [DESIGN_ROLE.UNASSIGNED]: '○',
};

export default function RoleZone({ group }) {
  if (!group || !group.items || group.items.length === 0) return null;

  const isDominant =
    group.role === DESIGN_ROLE.CENTER_STONE || group.role === DESIGN_ROLE.PAIR;
  const glyph = ROLE_GLYPH[group.role] || '○';
  const count = group.items.length;

  return (
    <div
      style={isDominant ? { ...styles.zone, ...styles.zoneDominant } : styles.zone}
      dir="rtl"
    >
      <div style={styles.head}>
        <span
          style={isDominant ? { ...styles.token, ...styles.tokenDominant } : styles.token}
          aria-hidden="true"
        >
          {glyph}
        </span>
        <span style={isDominant ? styles.roleNameDominant : styles.roleName}>
          {group.roleHe}
        </span>
        <span style={styles.count}>{count}</span>
        {group.role === DESIGN_ROLE.CENTER_STONE && (
          <span style={styles.note}>פריט נפרד</span>
        )}
      </div>

      <div style={isDominant ? styles.gridDominant : styles.grid}>
        {group.items.map((it) => (
          <StoneObjectCard key={it.id} item={it} dominant={isDominant} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  zone: {
    padding: '4px 0',
  },
  zoneDominant: {
    padding: '4px 0 6px',
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  token: {
    width: '28px',
    height: '28px',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '50%',
  },
  tokenDominant: {
    width: '32px',
    height: '32px',
    fontSize: '16px',
    color: tokens.color.gold,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
  },
  roleName: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: tokens.color.inkSoft,
  },
  roleNameDominant: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: tokens.color.gold,
  },
  count: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    color: tokens.color.inkFaint,
    minWidth: '20px',
    height: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px',
    padding: '0 6px',
  },
  note: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
    background: tokens.color.pearl,
    borderRadius: '999px',
    padding: '2px 10px',
    marginInlineStart: 'auto',
  },
  // Standard roles: calm responsive grid that wraps; never scrolls sideways.
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px',
  },
  // Dominant roles: wider cards so the center stone reads big. Still wraps.
  gridDominant: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '14px',
  },
};
