/**
 * lib/v2/jewelryBuildDraft.js — v2.4
 *
 * Pure, serializable app-state model for a single Jewelry Build Draft.
 * No Airtable shape. No field-name coupling. No pricing. No side effects.
 * No fetch. No storage. No packages.
 *
 * A draft is built from Work Tray items (normalizeAsset shape) plus a
 * per-item role assignment. The model captures STRUCTURE only — it never
 * computes price and never collapses multiple center stones into a quantity.
 *
 * Roles (canonical English keys; Hebrew labels resolved in the UI):
 *   center    → אבן מרכזית      → one CenterStone per physical stone
 *   side      → אבני צד          → SideGroup (parcels grouped; singles qty-1)
 *   component → רכיב / חלק תכשיט → Component
 *   skip      → לא להשתמש כרגע   → excluded from the draft entirely
 */

export const BUILD_ROLES = {
  CENTER:    'center',
  SIDE:      'side',
  COMPONENT: 'component',
  SKIP:      'skip',
};

/**
 * Role options for the assignment modal.
 * label = Hebrew (UI rule). role = canonical English (code rule).
 */
export const BUILD_ROLE_OPTIONS = [
  { role: BUILD_ROLES.CENTER,    label: 'אבן מרכזית',       sub: 'Center Stone'      },
  { role: BUILD_ROLES.SIDE,      label: 'אבני צד',           sub: 'Side Stones'       },
  { role: BUILD_ROLES.COMPONENT, label: 'רכיב / חלק תכשיט',  sub: 'Component / Part'  },
  { role: BUILD_ROLES.SKIP,      label: 'לא להשתמש כרגע',    sub: 'Skip for now'      },
];

/**
 * Suggests a default role for an asset based on its type.
 * Overridable by the user in the assignment modal.
 *
 * @param {object} asset  normalizeAsset-shaped object
 * @returns {string}      one of BUILD_ROLES
 */
export function suggestRole(asset) {
  if (!asset) return BUILD_ROLES.SKIP;
  const at = asset.assetType;
  if (at === 'parcel')           return BUILD_ROLES.SIDE;       // parcels/melee → side group
  if (at === 'part')             return BUILD_ROLES.COMPONENT;  // chains, settings, findings
  if (at === 'finished_jewelry') return BUILD_ROLES.COMPONENT;  // used as a component
  // Default single stones to center
  return BUILD_ROLES.CENTER;
}

/**
 * True when an asset represents a multi-stone lot that should be ONE side group.
 * Parcels, melee, and pair/set assets are grouped; everything else is a single.
 */
function isGroupedSideAsset(asset) {
  if (!asset) return false;
  if (asset.assetType === 'parcel') return true;
  const count = parseInt(asset.stoneCount, 10);
  return Number.isFinite(count) && count > 1;
}

function safeNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

// ─── Entry builders ────────────────────────────────────────────────────────

function makeCenterStone(asset) {
  return {
    _ref:         asset._airtableId || null,
    stoneType:    asset.stoneType   || '',
    stoneCategory: asset.stoneCategory || '',
    origin:       asset.origin      || '',
    shape:        asset.shape       || '',
    caratWeight:  safeNumber(asset.caratWeight) ?? safeNumber(asset.totalCaratWeight),
    color:        asset.color       || '',
    clarity:      asset.clarity     || '',
    cut:          asset.cut         || '',
    labName:      asset.labName     || '',
    reportNumber: asset.reportNumber || '',
    imageUrl:     asset.imageUrl    || null,
    title:        asset.title       || '',
  };
}

function makeSideGroup(asset) {
  const grouped = isGroupedSideAsset(asset);
  const count   = grouped ? (parseInt(asset.stoneCount, 10) || 1) : 1;
  const totalCt = grouped
    ? (safeNumber(asset.totalCaratWeight) ?? safeNumber(asset.caratWeight))
    : (safeNumber(asset.caratWeight) ?? safeNumber(asset.totalCaratWeight));

  return {
    groupId:          `sg_${asset._airtableId || Math.random().toString(36).slice(2, 8)}`,
    _refs:            [asset._airtableId].filter(Boolean),
    stoneType:        asset.stoneType || '',
    stoneCategory:    asset.stoneCategory || '',
    origin:           asset.origin   || '',
    shape:            asset.shape     || '',
    color:            asset.color     || '',
    clarity:          asset.clarity   || '',
    quantity:         count,
    totalCaratWeight: totalCt,
    settingType:      null,            // UI selector — "סוג שיבוץ" — no pricing
    imageUrl:         asset.imageUrl  || null,
    grouped,
    title:            asset.title     || '',
  };
}

function makeComponent(asset) {
  return {
    _ref:          asset._airtableId || null,
    componentType: asset.assetType   || 'part',
    title:         asset.title       || asset.stoneType || '',
    metalHint:     asset.supplierName ? '' : '',  // reserved; no Airtable coupling
    imageUrl:      asset.imageUrl    || null,
  };
}

// ─── Draft creation ──────────────────────────────────────────────────────────

/**
 * Creates a JewelryBuildDraft from an array of { asset, role } assignments.
 * "skip" assignments are excluded. Center stones stay separate. Side stones
 * are grouped only where the asset is a parcel/multi-stone lot.
 *
 * @param {{asset: object, role: string}[]} assignments
 * @returns {object} JewelryBuildDraft
 */
export function createDraft(assignments) {
  const list = Array.isArray(assignments) ? assignments : [];

  const centerStones    = [];
  const sideStoneGroups = [];
  const components       = [];
  const sourceWorkTrayItems = [];

  list.forEach(({ asset, role }) => {
    if (!asset || role === BUILD_ROLES.SKIP) return;
    if (asset._airtableId) sourceWorkTrayItems.push(asset._airtableId);

    if (role === BUILD_ROLES.CENTER) {
      centerStones.push(makeCenterStone(asset));        // never collapsed
    } else if (role === BUILD_ROLES.SIDE) {
      sideStoneGroups.push(makeSideGroup(asset));        // auto-grouping only
    } else if (role === BUILD_ROLES.COMPONENT) {
      components.push(makeComponent(asset));
    }
  });

  return {
    id:                  `draft_${Date.now().toString(36)}`,
    centerStones,
    sideStoneGroups,
    components,
    metal:               { metalType: null, karat: null, colorTone: null },
    settingType:         null,
    notes:               '',
    sourceWorkTrayItems,
    createdAt:           new Date().toISOString(),
  };
}

// ─── Pure mutators (return new draft objects) ─────────────────────────────────

/** Removes a center stone by its _ref. */
export function removeCenterStone(draft, ref) {
  if (!draft) return draft;
  return { ...draft, centerStones: draft.centerStones.filter((c) => c._ref !== ref) };
}

/** Removes a side group by its groupId. */
export function removeSideGroup(draft, groupId) {
  if (!draft) return draft;
  return { ...draft, sideStoneGroups: draft.sideStoneGroups.filter((g) => g.groupId !== groupId) };
}

/** Removes a component by its _ref. */
export function removeComponent(draft, ref) {
  if (!draft) return draft;
  return { ...draft, components: draft.components.filter((c) => c._ref !== ref) };
}

/**
 * Moves a center stone to a side group (single, quantity-1).
 * Used by the in-builder role change controls.
 */
export function centerToSide(draft, ref) {
  if (!draft) return draft;
  const stone = draft.centerStones.find((c) => c._ref === ref);
  if (!stone) return draft;
  const group = {
    groupId:          `sg_${ref || Math.random().toString(36).slice(2, 8)}`,
    _refs:            [ref].filter(Boolean),
    stoneType:        stone.stoneType,
    stoneCategory:    stone.stoneCategory,
    origin:           stone.origin,
    shape:            stone.shape,
    color:            stone.color,
    clarity:          stone.clarity,
    quantity:         1,
    totalCaratWeight: stone.caratWeight,
    settingType:      null,
    imageUrl:         stone.imageUrl,
    grouped:          false,
    title:            stone.title,
  };
  return {
    ...draft,
    centerStones:    draft.centerStones.filter((c) => c._ref !== ref),
    sideStoneGroups: [...draft.sideStoneGroups, group],
  };
}

/**
 * Moves a single (non-grouped) side group back to a center stone.
 * Grouped side groups (parcels) cannot be moved to center as one stone.
 */
export function sideToCenter(draft, groupId) {
  if (!draft) return draft;
  const group = draft.sideStoneGroups.find((g) => g.groupId === groupId);
  if (!group || group.grouped) return draft;  // refuse to un-group parcels
  const stone = {
    _ref:          group._refs[0] || null,
    stoneType:     group.stoneType,
    stoneCategory: group.stoneCategory,
    origin:        group.origin,
    shape:         group.shape,
    caratWeight:   group.totalCaratWeight,
    color:         group.color,
    clarity:       group.clarity,
    cut:           '',
    labName:       '',
    reportNumber:  '',
    imageUrl:      group.imageUrl,
    title:         group.title,
  };
  return {
    ...draft,
    sideStoneGroups: draft.sideStoneGroups.filter((g) => g.groupId !== groupId),
    centerStones:    [...draft.centerStones, stone],
  };
}

/** Updates a side group's setting type (UI only — no pricing). */
export function setSideGroupSetting(draft, groupId, settingType) {
  if (!draft) return draft;
  return {
    ...draft,
    sideStoneGroups: draft.sideStoneGroups.map((g) =>
      g.groupId === groupId ? { ...g, settingType } : g
    ),
  };
}

/** Updates the metal placeholder selection. */
export function setMetal(draft, metal) {
  if (!draft) return draft;
  return { ...draft, metal: { ...draft.metal, ...metal } };
}

/** Updates the free-text notes. */
export function setNotes(draft, notes) {
  if (!draft) return draft;
  return { ...draft, notes: notes || '' };
}

/**
 * True when the draft reduces to EXACTLY one center stone and nothing else.
 * This is the only case the v2.3 single-item calculator bridge can safely
 * handle in v2.4. Anything more complex stays a future label.
 */
export function isSingleCenterStoneDraft(draft) {
  if (!draft) return false;
  return (
    draft.centerStones.length === 1 &&
    draft.sideStoneGroups.length === 0 &&
    draft.components.length === 0
  );
}

/** Total count of build entries (for summaries). */
export function draftEntryCount(draft) {
  if (!draft) return 0;
  return draft.centerStones.length + draft.sideStoneGroups.length + draft.components.length;
}
