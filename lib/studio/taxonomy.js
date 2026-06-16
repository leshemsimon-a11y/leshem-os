// lib/studio/taxonomy.js
//
// LESHEM.S OS — Canonical Taxonomy Layer (Clean 1, corrected)
//
// SIX ORTHOGONAL AXES. Each axis describes exactly ONE concept and they must
// never be mixed into one another. This separation is foundational — collapsing
// axes was the root cause of repeated v1 patching.
//
//   1. stoneCategory  — gemological / commercial stone category ONLY
//   2. origin         — growth / source ONLY
//   3. stoneType      — species / material ONLY
//   4. shape          — cut outline ONLY
//   5. assetType      — inventory item STRUCTURE (what kind of asset it is)
//   6. inventoryLayer — ownership / stock layer
//
// CRITICAL boundaries:
//   - origin is NOT part of stoneCategory.
//   - asset structure (pair/parcel/part/finished) is NOT part of stoneCategory.
//   - finished jewelry is NOT a stoneCategory — it is an assetType.
//
// All VALUES here are CANONICAL ENGLISH and are the only values logic compares.
// Hebrew UI text and English report text live in lib/studio/labels.js.
//
// Customer-facing output should use stoneCategory / origin / stoneType / shape
// carefully and must NEVER expose assetType or inventoryLayer unless explicitly
// needed for internal use.
//
// This layer is data only — no inventory, no Airtable, no API.

// ---------------------------------------------------------------------------
// Axis 1 — Stone Category (gemological / commercial category ONLY)
// ---------------------------------------------------------------------------
export const STONE_CATEGORY = Object.freeze({
  WHITE_DIAMOND: 'whiteDiamond',
  FANCY_COLOR_DIAMOND: 'fancyColorDiamond',
  COLORED_GEMSTONE: 'coloredGemstone',
  OTHER: 'other',
});

export const STONE_CATEGORY_VALUES = Object.freeze(
  Object.values(STONE_CATEGORY)
);

// ---------------------------------------------------------------------------
// Axis 2 — Origin (growth / source ONLY)
// ---------------------------------------------------------------------------
export const ORIGIN = Object.freeze({
  NATURAL: 'natural',
  LAB_GROWN: 'labGrown',
  UNKNOWN: 'unknown',
});

export const ORIGIN_VALUES = Object.freeze(Object.values(ORIGIN));

// ---------------------------------------------------------------------------
// Axis 3 — Stone Type (species / material ONLY)
// ---------------------------------------------------------------------------
export const STONE_TYPE = Object.freeze({
  DIAMOND: 'diamond',
  SAPPHIRE: 'sapphire',
  RUBY: 'ruby',
  EMERALD: 'emerald',
  TOURMALINE: 'tourmaline',
  AQUAMARINE: 'aquamarine',
  TANZANITE: 'tanzanite',
  SPINEL: 'spinel',
  GARNET: 'garnet',
  TOPAZ: 'topaz',
  AMETHYST: 'amethyst',
  CITRINE: 'citrine',
  PERIDOT: 'peridot',
  OPAL: 'opal',
  PEARL: 'pearl',
  OTHER: 'other',
});

export const STONE_TYPE_VALUES = Object.freeze(Object.values(STONE_TYPE));

// ---------------------------------------------------------------------------
// Axis 4 — Shape (cut outline ONLY) — corrected list, unchanged + "other"
// ---------------------------------------------------------------------------
export const SHAPE = Object.freeze({
  ROUND: 'round',
  OVAL: 'oval',
  EMERALD: 'emerald',
  CUSHION: 'cushion',
  RADIANT: 'radiant',
  PEAR: 'pear',
  MARQUISE: 'marquise',
  PRINCESS: 'princess',
  HEART: 'heart',
  ASSCHER: 'asscher',
  BAGUETTE: 'baguette',
  TRILLION: 'trillion',
  OTHER: 'other',
});

export const SHAPE_VALUES = Object.freeze(Object.values(SHAPE));

// ---------------------------------------------------------------------------
// Axis 5 — Asset Type (inventory item STRUCTURE) — internal-leaning
// ---------------------------------------------------------------------------
export const ASSET_TYPE = Object.freeze({
  SINGLE_STONE: 'singleStone',
  STONE_PAIR: 'stonePair',
  STONE_SET: 'stoneSet',
  STONE_PARCEL: 'stoneParcel',
  JEWELRY_PART: 'jewelryPart',
  FINISHED_JEWELRY: 'finishedJewelry',
  MODEL_TEMPLATE: 'modelTemplate',
  RENDER_OUTPUT: 'renderOutput',
  MEDIA_ASSET: 'mediaAsset',
});

export const ASSET_TYPE_VALUES = Object.freeze(Object.values(ASSET_TYPE));

// ---------------------------------------------------------------------------
// Axis 6 — Inventory Layer (ownership / stock layer) — internal
// ---------------------------------------------------------------------------
export const INVENTORY_LAYER = Object.freeze({
  PHYSICAL_STOCK: 'physicalStock',
  VIRTUAL_SUPPLIER_STOCK: 'virtualSupplierStock',
  CLIENT_OWNED: 'clientOwned',
  INTERNAL_DRAFT: 'internalDraft',
});

export const INVENTORY_LAYER_VALUES = Object.freeze(
  Object.values(INVENTORY_LAYER)
);

// ---------------------------------------------------------------------------
// Axis registry — iterate axes without hardcoding them.
// ---------------------------------------------------------------------------
export const TAXONOMY_AXES = Object.freeze({
  stoneCategory: STONE_CATEGORY_VALUES,
  origin: ORIGIN_VALUES,
  stoneType: STONE_TYPE_VALUES,
  shape: SHAPE_VALUES,
  assetType: ASSET_TYPE_VALUES,
  inventoryLayer: INVENTORY_LAYER_VALUES,
});

// Axes that are safe to surface in customer-facing certificate output.
// assetType and inventoryLayer are deliberately excluded.
export const CUSTOMER_FACING_AXES = Object.freeze([
  'stoneCategory',
  'origin',
  'stoneType',
  'shape',
]);

// Axes that are internal-only and must not appear on customer-facing output.
export const INTERNAL_AXES = Object.freeze(['assetType', 'inventoryLayer']);

// ---------------------------------------------------------------------------
// Validation helpers — graceful, never throw on unknown input.
// ---------------------------------------------------------------------------
export function isValidValue(axis, value) {
  const values = TAXONOMY_AXES[axis];
  if (!values) return false;
  return values.includes(value);
}

export function listValues(axis) {
  return TAXONOMY_AXES[axis] ? [...TAXONOMY_AXES[axis]] : [];
}

export function isCustomerFacingAxis(axis) {
  return CUSTOMER_FACING_AXES.includes(axis);
}
