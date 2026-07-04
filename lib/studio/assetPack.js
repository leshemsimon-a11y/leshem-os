// lib/studio/assetPack.js
//
// LESHEM.S OS — Starter Asset Pack v1 (First 20) registry.
//
// Pure presentation data. This module ONLY maps static file paths under
// /public/assets/leshems/starter-pack-v1/ to named studio slots, plus a few
// tiny pure lookup functions. It:
//   • reads no store, no Airtable, no localStorage/IndexedDB
//   • writes nothing, mutates nothing
//   • contains no pricing, no business rules, no certificate logic
//
// These are UI/demo/default assets only (per the pack's own usage notes) —
// NEVER final client renders or exact inventory photos. Anywhere a fallback
// asset from this pack is shown in place of a real item photo, the calling
// component is responsible for keeping the existing "preview / illustration"
// wording so nothing here is ever presented as a real render.
//
// Additive-only. Safe to import from any studio component without touching
// business logic.

const BASE = '/assets/leshems/starter-pack-v1';

// ---- Individual asset paths (Starter Pack v1 — First 20) ----
export const ASSET_PACK_V1 = Object.freeze({
  stones: Object.freeze({
    diamondRound: `${BASE}/01_stones/diamonds/stone_diamond_round_brilliant_white_thumb_v01.png`,
    diamondOval: `${BASE}/01_stones/diamonds/stone_diamond_oval_white_thumb_v01.png`,
    diamondPear: `${BASE}/01_stones/diamonds/stone_diamond_pear_white_thumb_v01.png`,
    diamondEmeraldCut: `${BASE}/01_stones/diamonds/stone_diamond_emerald_cut_white_thumb_v01.png`,
    diamondCushion: `${BASE}/01_stones/diamonds/stone_diamond_cushion_white_thumb_v01.png`,
    diamondMeleeParcel: `${BASE}/01_stones/diamonds/stone_diamond_melee_parcel_white_thumb_v01.png`,
    sapphireOval: `${BASE}/01_stones/gemstones/stone_sapphire_oval_royalblue_thumb_v01.png`,
    emeraldEmeraldCut: `${BASE}/01_stones/gemstones/stone_emerald_emeraldcut_vividgreen_thumb_v01.png`,
    rubyOval: `${BASE}/01_stones/gemstones/stone_ruby_oval_richred_thumb_v01.png`,
    tanzaniteOval: `${BASE}/01_stones/gemstones/stone_tanzanite_oval_violetblue_thumb_v01.png`,
  }),
  jewelry: Object.freeze({
    ringSolitaire: `${BASE}/02_jewelry_placeholders/jewel_ring_solitaire_round_whitegold_preview_v01.png`,
    ringHalo: `${BASE}/02_jewelry_placeholders/jewel_ring_halo_round_whitegold_preview_v01.png`,
    ringThreeStone: `${BASE}/02_jewelry_placeholders/jewel_ring_three_stone_whitegold_preview_v01.png`,
    pendantSolitaire: `${BASE}/02_jewelry_placeholders/jewel_pendant_solitaire_whitegold_preview_v01.png`,
    earringsStud: `${BASE}/02_jewelry_placeholders/jewel_earrings_stud_diamond_preview_v01.png`,
  }),
  materials: Object.freeze({
    whiteGold: `${BASE}/03_materials/metal_swatches/material_18k_white_gold_polished_swatch_v01.png`,
    yellowGold: `${BASE}/03_materials/metal_swatches/material_18k_yellow_gold_polished_swatch_v01.png`,
    roseGold: `${BASE}/03_materials/metal_swatches/material_rose_gold_polished_swatch_v01.png`,
  }),
  emptyState: `${BASE}/05_empty_states/empty_studio_start_stones_to_jewelry_v01.png`,
  blueprint: `${BASE}/06_blueprints/blueprint_ring_solitaire_top_side_light_v01.png`,
});

// ---- Best-effort stone-thumbnail lookup (Design Studio stone strip) ----
//
// Used ONLY as a fallback when a tray item has no real snapshot.primaryImage.
// Matches on the existing Hebrew display strings already read elsewhere in
// the studio (shapeHe / stoneTypeHe) — never on internal/Airtable fields,
// never written back anywhere. If nothing matches, callers keep their
// existing generic icon fallback; this function returns null rather than a
// wrong guess whenever the text is unrecognized.
const STONE_KEYWORD_MAP = [
  [/פרסל|מלאי אבנים|melee/, 'diamondMeleeParcel'],
  [/עגול|round|בריליאנט/, 'diamondRound'],
  [/אובל.*ספיר|sapphire/, 'sapphireOval'],
  [/אובל.*אודם|ruby|רובי/, 'rubyOval'],
  [/אובל.*טנזניט|tanzanite/, 'tanzaniteOval'],
  [/אזמרגד|emerald(?!.*cut)|אמרלד/, 'emeraldEmeraldCut'],
  [/אובל|oval/, 'diamondOval'],
  [/אגס|טיפה|pear/, 'diamondPear'],
  [/כרית|קושן|cushion/, 'diamondCushion'],
  [/emerald cut|קאט אזמרגד|אזמרגד קאט/, 'diamondEmeraldCut'],
];

export function getStoneThumbFallback(item) {
  if (!item) return null;
  const s = item.snapshot || {};
  const text = [s.shapeHe, s.stoneTypeHe, s.name].filter(Boolean).join(' ');
  if (!text.trim()) return null;
  for (const [pattern, key] of STONE_KEYWORD_MAP) {
    if (pattern.test(text)) return ASSET_PACK_V1.stones[key];
  }
  return null;
}

// ---- Fixed slot helpers (unambiguous — no matching needed) ----
export function getEmptyStateIllustration() {
  return ASSET_PACK_V1.emptyState;
}

export function getBlueprintPlaceholder() {
  return ASSET_PACK_V1.blueprint;
}

// Generic jewelry preview placeholder for the "selected direction" canvas
// pane. A single, calm default (solitaire ring) — matching a concept to one
// of the 5 jewelry images by product type is deferred (would need a reliable
// canonical product-type field on the concept, which is out of scope here).
export function getJewelryPreviewPlaceholder() {
  return ASSET_PACK_V1.jewelry.ringSolitaire;
}
