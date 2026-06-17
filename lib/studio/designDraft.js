// lib/studio/designDraft.js
//
// LESHEM.S OS — Jewelry Design Draft Layer (Clean 3)
//
// Product language: this is the foundation of the JEWELRY DESIGN STUDIO. The
// system is stone-first — the stone is chosen first, then the design work
// begins around it. This module supplies the ROLE vocabulary used when the
// jeweller assigns each Work-Tray item a part in the design, plus small,
// pure helpers that turn the current tray into a design-draft view-model.
//
// SCOPE (Clean 3): roles + grouping for display only. No uploads, no models,
// no renders, no pricing, no certificates, no Airtable. Helper logic only —
// the user-facing route and language stay "Design / סטודיו עיצוב".
//
// DESIGN RULES honored:
//   • Center stones remain SEPARATE items — they are NEVER collapsed into a
//     quantity field. Each center stone is addressable on its own.
//   • Side stones may be grouped ONLY for presentation; grouping never
//     destroys or merges the underlying distinct items.
//   • Roles are canonical English values; Hebrew labels live alongside for UI.

// ---------------------------------------------------------------------------
// Canonical role values (English) — the only values logic compares.
// ---------------------------------------------------------------------------
export const DESIGN_ROLE = Object.freeze({
  UNASSIGNED: 'unassigned',
  CENTER_STONE: 'centerStone',
  SIDE_STONE: 'sideStone',
  PAIR: 'pair',
  PARCEL: 'parcel',
  COMPONENT: 'component',
  REFERENCE_ONLY: 'referenceOnly',
});

export const DESIGN_ROLE_VALUES = Object.freeze(Object.values(DESIGN_ROLE));

// Roles offered in the role selector, in a deliberate order. "unassigned" is
// the starting state and is offered so a user can move an item back to it.
export const ASSIGNABLE_ROLES = Object.freeze([
  DESIGN_ROLE.UNASSIGNED,
  DESIGN_ROLE.CENTER_STONE,
  DESIGN_ROLE.SIDE_STONE,
  DESIGN_ROLE.PAIR,
  DESIGN_ROLE.PARCEL,
  DESIGN_ROLE.COMPONENT,
  DESIGN_ROLE.REFERENCE_ONLY,
]);

// ---------------------------------------------------------------------------
// Hebrew UI labels for roles (app-facing). English report wording is NOT
// produced here — Clean 3 does not emit certificates.
// ---------------------------------------------------------------------------
const ROLE_HE = {
  [DESIGN_ROLE.UNASSIGNED]: 'ללא תפקיד',
  [DESIGN_ROLE.CENTER_STONE]: 'אבן מרכזית',
  [DESIGN_ROLE.SIDE_STONE]: 'אבני צד',
  [DESIGN_ROLE.PAIR]: 'זוג',
  [DESIGN_ROLE.PARCEL]: 'חבילה / פארסל',
  [DESIGN_ROLE.COMPONENT]: 'רכיב',
  [DESIGN_ROLE.REFERENCE_ONLY]: 'רפרנס בלבד',
};

export function roleHe(role) {
  if (role == null) return ROLE_HE[DESIGN_ROLE.UNASSIGNED];
  const label = ROLE_HE[role];
  if (label == null) {
    console.warn(`[designDraft] no Hebrew label for role="${role}"`);
    return ROLE_HE[DESIGN_ROLE.UNASSIGNED];
  }
  return label;
}

export function isValidRole(role) {
  return DESIGN_ROLE_VALUES.includes(role);
}

// ---------------------------------------------------------------------------
// Grouping for the Design Studio view.
// ---------------------------------------------------------------------------
// Returns an ordered list of groups for rendering. Center stones are emitted
// as INDIVIDUAL groups (one item each) so they are never collapsed together.
// Side stones / parcels / components / reference / unassigned are gathered
// into one group per role for a calm layout, but each underlying item is kept
// intact and individually addressable (remove / re-assign still works).
//
// Group shape: { id, role, roleHe, items: [...trayItems], collapsedToQuantity:false }

const GROUP_ORDER = [
  DESIGN_ROLE.CENTER_STONE,
  DESIGN_ROLE.PAIR,
  DESIGN_ROLE.SIDE_STONE,
  DESIGN_ROLE.PARCEL,
  DESIGN_ROLE.COMPONENT,
  DESIGN_ROLE.REFERENCE_ONLY,
  DESIGN_ROLE.UNASSIGNED,
];

// Roles that are presented as ONE combined group (still distinct items inside).
const COMBINED_ROLES = new Set([
  DESIGN_ROLE.SIDE_STONE,
  DESIGN_ROLE.PARCEL,
  DESIGN_ROLE.COMPONENT,
  DESIGN_ROLE.REFERENCE_ONLY,
  DESIGN_ROLE.UNASSIGNED,
]);

export function buildDesignGroups(trayItems) {
  const items = Array.isArray(trayItems) ? trayItems : [];

  const byRole = new Map();
  items.forEach((it) => {
    const role = isValidRole(it.role) ? it.role : DESIGN_ROLE.UNASSIGNED;
    if (!byRole.has(role)) byRole.set(role, []);
    byRole.get(role).push(it);
  });

  const groups = [];

  GROUP_ORDER.forEach((role) => {
    const list = byRole.get(role);
    if (!list || list.length === 0) return;

    if (COMBINED_ROLES.has(role)) {
      // One combined group; items remain distinct (NOT a quantity collapse).
      groups.push({
        id: `group-${role}`,
        role,
        roleHe: roleHe(role),
        items: list,
        collapsedToQuantity: false,
      });
    } else {
      // CENTER_STONE (and PAIR) — emit each item as its own group so center
      // stones are never merged. PAIR is conceptually two stones; we keep it
      // as a single addressable item here (its "pair" nature is the role).
      list.forEach((it, i) => {
        groups.push({
          id: `group-${role}-${it.id}-${i}`,
          role,
          roleHe: roleHe(role),
          items: [it],
          collapsedToQuantity: false,
        });
      });
    }
  });

  return groups;
}

// A short, human, Hebrew summary line for the draft (e.g. for headers).
export function summarizeDraft(trayItems) {
  const items = Array.isArray(trayItems) ? trayItems : [];
  const total = items.length;
  const assigned = items.filter(
    (it) => isValidRole(it.role) && it.role !== DESIGN_ROLE.UNASSIGNED
  ).length;
  return { total, assigned, unassigned: total - assigned };
}

// Best-effort display title for a tray item, reusing the same precedence the
// inventory card/drawer use. Never returns the raw record id.
export function trayItemTitle(item) {
  const s = (item && item.snapshot) || {};
  return s.stoneTypeHe || s.productTypeHe || s.name || 'פריט מלאי';
}
