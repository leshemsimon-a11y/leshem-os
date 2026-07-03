// lib/studio/demoGemstoneAssets.js
//
// LESHEM.S OS — Temporary Demo Gemstone Media Layer (Gemini / Nano Banana).
//
// Adapted from the provided src/data/demoGemstoneAssets.ts into plain
// JavaScript (this project uses no TypeScript) and relocated into
// lib/studio/ to match the project's existing structure — this is where
// labels.js and assetPack.js already live, and both are imported by studio
// components the same way this file is.
//
// This is a TEMPORARY demo activity layer only:
//   • every record keeps its original `temporaryOnly: true` flag from the
//     supplied manifest — nothing here is presented as real inventory media
//   • pure data + pure lookup functions — no store, no Airtable, no
//     localStorage/IndexedDB, no writes, no mutation
//   • does NOT touch or replace the real upload/inventory media pipeline
//   • easy to remove later: delete this file + /public/demo-media/gemstones
//     and revert the small call-sites that reference it
//
// Schema and content are IDENTICAL to the supplied
// public/demo-media/gemstones/demo-gemstone-assets.json — only the language
// (TS → JS) and file location changed, per "adapt it to the existing
// project structure."

export const demoGemstoneAssets = Object.freeze([
  {
    id: 'box-round-brilliant-diamond',
    displayName: 'Round Brilliant Diamond',
    view: 'box',
    category: 'loose-gemstone-demo-media',
    species: 'Diamond',
    variety: 'White Diamond',
    shape: 'Round Brilliant',
    color: 'Colorless / White',
    imageUrl: '/demo-media/gemstones/box-view/round-brilliant-diamond-box.webp',
    thumbUrl: '/demo-media/gemstones/box-view/round-brilliant-diamond-box-thumb.webp',
    usage: ['inventory_card', 'work_tray', 'asset_library'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'box-pear-diamond',
    displayName: 'Pear Diamond',
    view: 'box',
    category: 'loose-gemstone-demo-media',
    species: 'Diamond',
    variety: 'White Diamond',
    shape: 'Pear',
    color: 'Colorless / White',
    imageUrl: '/demo-media/gemstones/box-view/pear-diamond-box.webp',
    thumbUrl: '/demo-media/gemstones/box-view/pear-diamond-box-thumb.webp',
    usage: ['inventory_card', 'work_tray', 'asset_library'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'box-emerald-cut-diamond',
    displayName: 'Emerald-Cut Diamond',
    view: 'box',
    category: 'loose-gemstone-demo-media',
    species: 'Diamond',
    variety: 'White Diamond',
    shape: 'Emerald Cut',
    color: 'Colorless / White',
    imageUrl: '/demo-media/gemstones/box-view/emerald-cut-diamond-box.webp',
    thumbUrl: '/demo-media/gemstones/box-view/emerald-cut-diamond-box-thumb.webp',
    usage: ['inventory_card', 'work_tray', 'asset_library'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'box-cushion-diamond',
    displayName: 'Cushion Diamond',
    view: 'box',
    category: 'loose-gemstone-demo-media',
    species: 'Diamond',
    variety: 'White Diamond',
    shape: 'Cushion',
    color: 'Colorless / White',
    imageUrl: '/demo-media/gemstones/box-view/cushion-diamond-box.webp',
    thumbUrl: '/demo-media/gemstones/box-view/cushion-diamond-box-thumb.webp',
    usage: ['inventory_card', 'work_tray', 'asset_library'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'box-oval-blue-sapphire',
    displayName: 'Oval Blue Sapphire',
    view: 'box',
    category: 'loose-gemstone-demo-media',
    species: 'Corundum',
    variety: 'Blue Sapphire',
    shape: 'Oval',
    color: 'Royal Blue',
    imageUrl: '/demo-media/gemstones/box-view/oval-blue-sapphire-box.webp',
    thumbUrl: '/demo-media/gemstones/box-view/oval-blue-sapphire-box-thumb.webp',
    usage: ['inventory_card', 'work_tray', 'asset_library'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'box-oval-emerald',
    displayName: 'Oval Emerald',
    view: 'box',
    category: 'loose-gemstone-demo-media',
    species: 'Beryl',
    variety: 'Emerald',
    shape: 'Oval',
    color: 'Vivid Green',
    imageUrl: '/demo-media/gemstones/box-view/oval-emerald-box.webp',
    thumbUrl: '/demo-media/gemstones/box-view/oval-emerald-box-thumb.webp',
    usage: ['inventory_card', 'work_tray', 'asset_library'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'box-emerald-cut-emerald',
    displayName: 'Emerald-Cut Emerald',
    view: 'box',
    category: 'loose-gemstone-demo-media',
    species: 'Beryl',
    variety: 'Emerald',
    shape: 'Emerald Cut',
    color: 'Vivid Green',
    imageUrl: '/demo-media/gemstones/box-view/emerald-cut-emerald-box.webp',
    thumbUrl: '/demo-media/gemstones/box-view/emerald-cut-emerald-box-thumb.webp',
    usage: ['inventory_card', 'work_tray', 'asset_library'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'box-cushion-ruby',
    displayName: 'Cushion Ruby',
    view: 'box',
    category: 'loose-gemstone-demo-media',
    species: 'Corundum',
    variety: 'Ruby',
    shape: 'Cushion',
    color: 'Deep Red',
    imageUrl: '/demo-media/gemstones/box-view/cushion-ruby-box.webp',
    thumbUrl: '/demo-media/gemstones/box-view/cushion-ruby-box-thumb.webp',
    usage: ['inventory_card', 'work_tray', 'asset_library'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'box-oval-paraiba-tourmaline',
    displayName: 'Oval Paraiba Tourmaline',
    view: 'box',
    category: 'loose-gemstone-demo-media',
    species: 'Tourmaline',
    variety: 'Paraiba Tourmaline',
    shape: 'Oval',
    color: 'Neon Blue-Green',
    imageUrl: '/demo-media/gemstones/box-view/oval-paraiba-tourmaline-box.webp',
    thumbUrl: '/demo-media/gemstones/box-view/oval-paraiba-tourmaline-box-thumb.webp',
    usage: ['inventory_card', 'work_tray', 'asset_library'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'tweezer-round-brilliant-diamond',
    displayName: 'Round Brilliant Diamond',
    view: 'tweezer',
    category: 'loose-gemstone-demo-media',
    species: 'Diamond',
    variety: 'White Diamond',
    shape: 'Round Brilliant',
    color: 'Colorless / White',
    imageUrl: '/demo-media/gemstones/tweezer-view/round-brilliant-diamond-tweezer.webp',
    thumbUrl: '/demo-media/gemstones/tweezer-view/round-brilliant-diamond-tweezer-thumb.webp',
    usage: ['inspect_view', 'selected_state', 'asset_detail'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'tweezer-oval-diamond',
    displayName: 'Oval Diamond',
    view: 'tweezer',
    category: 'loose-gemstone-demo-media',
    species: 'Diamond',
    variety: 'White Diamond',
    shape: 'Oval',
    color: 'Colorless / White',
    imageUrl: '/demo-media/gemstones/tweezer-view/oval-diamond-tweezer.webp',
    thumbUrl: '/demo-media/gemstones/tweezer-view/oval-diamond-tweezer-thumb.webp',
    usage: ['inspect_view', 'selected_state', 'asset_detail'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'tweezer-pear-diamond',
    displayName: 'Pear Diamond',
    view: 'tweezer',
    category: 'loose-gemstone-demo-media',
    species: 'Diamond',
    variety: 'White Diamond',
    shape: 'Pear',
    color: 'Colorless / White',
    imageUrl: '/demo-media/gemstones/tweezer-view/pear-diamond-tweezer.webp',
    thumbUrl: '/demo-media/gemstones/tweezer-view/pear-diamond-tweezer-thumb.webp',
    usage: ['inspect_view', 'selected_state', 'asset_detail'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'tweezer-emerald-cut-diamond',
    displayName: 'Emerald-Cut Diamond',
    view: 'tweezer',
    category: 'loose-gemstone-demo-media',
    species: 'Diamond',
    variety: 'White Diamond',
    shape: 'Emerald Cut',
    color: 'Colorless / White',
    imageUrl: '/demo-media/gemstones/tweezer-view/emerald-cut-diamond-tweezer.webp',
    thumbUrl: '/demo-media/gemstones/tweezer-view/emerald-cut-diamond-tweezer-thumb.webp',
    usage: ['inspect_view', 'selected_state', 'asset_detail'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'tweezer-cushion-diamond',
    displayName: 'Cushion Diamond',
    view: 'tweezer',
    category: 'loose-gemstone-demo-media',
    species: 'Diamond',
    variety: 'White Diamond',
    shape: 'Cushion',
    color: 'Colorless / White',
    imageUrl: '/demo-media/gemstones/tweezer-view/cushion-diamond-tweezer.webp',
    thumbUrl: '/demo-media/gemstones/tweezer-view/cushion-diamond-tweezer-thumb.webp',
    usage: ['inspect_view', 'selected_state', 'asset_detail'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'tweezer-oval-blue-sapphire',
    displayName: 'Oval Blue Sapphire',
    view: 'tweezer',
    category: 'loose-gemstone-demo-media',
    species: 'Corundum',
    variety: 'Blue Sapphire',
    shape: 'Oval',
    color: 'Royal Blue',
    imageUrl: '/demo-media/gemstones/tweezer-view/oval-blue-sapphire-tweezer.webp',
    thumbUrl: '/demo-media/gemstones/tweezer-view/oval-blue-sapphire-tweezer-thumb.webp',
    usage: ['inspect_view', 'selected_state', 'asset_detail'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'tweezer-cushion-ruby',
    displayName: 'Cushion Ruby',
    view: 'tweezer',
    category: 'loose-gemstone-demo-media',
    species: 'Corundum',
    variety: 'Ruby',
    shape: 'Cushion',
    color: 'Deep Red',
    imageUrl: '/demo-media/gemstones/tweezer-view/cushion-ruby-tweezer.webp',
    thumbUrl: '/demo-media/gemstones/tweezer-view/cushion-ruby-tweezer-thumb.webp',
    usage: ['inspect_view', 'selected_state', 'asset_detail'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'tweezer-oval-paraiba-tourmaline',
    displayName: 'Oval Paraiba Tourmaline',
    view: 'tweezer',
    category: 'loose-gemstone-demo-media',
    species: 'Tourmaline',
    variety: 'Paraiba Tourmaline',
    shape: 'Oval',
    color: 'Neon Blue-Green',
    imageUrl: '/demo-media/gemstones/tweezer-view/oval-paraiba-tourmaline-tweezer.webp',
    thumbUrl: '/demo-media/gemstones/tweezer-view/oval-paraiba-tourmaline-tweezer-thumb.webp',
    usage: ['inspect_view', 'selected_state', 'asset_detail'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
  {
    id: 'tweezer-cushion-emerald-alt',
    displayName: 'Cushion Emerald - Alt',
    view: 'tweezer',
    category: 'loose-gemstone-demo-media',
    species: 'Beryl',
    variety: 'Emerald',
    shape: 'Cushion / Rectangular Cushion',
    color: 'Vivid Green',
    imageUrl: '/demo-media/gemstones/tweezer-view/cushion-emerald-tweezer-alt.webp',
    thumbUrl: '/demo-media/gemstones/tweezer-view/cushion-emerald-tweezer-alt-thumb.webp',
    usage: ['inspect_view', 'selected_state', 'asset_detail'],
    temporaryOnly: true,
    source: 'Gemini / Nano Banana temporary AI demo asset',
    notes:
      'Temporary UI/product-development media. Contains visible Gemini-style mark in lower-right on some images; do not treat as final inventory photography.',
  },
]);

// ---- Provided lookup helper (adapted 1:1 from the .ts source) ----
// Matches by canonical English variety/shape text (e.g. values that would
// come from Airtable canonical fields). Kept for future use by any screen
// that already has canonical English variety/shape values available.
export function findDemoGemstoneAsset(params) {
  const p = params || {};
  const normalize = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : undefined);
  const view = p.view;
  const variety = normalize(p.variety);
  const shape = normalize(p.shape);
  return demoGemstoneAssets.find((asset) => {
    const assetVariety = normalize(asset.variety);
    const assetShape = normalize(asset.shape);
    return (
      (!view || asset.view === view) &&
      (!variety || (assetVariety && assetVariety.includes(variety)) || variety.includes(assetVariety || '')) &&
      (!shape || (assetShape && assetShape.includes(shape)) || shape.includes(assetShape || ''))
    );
  });
}

// ---- Additional convenience helper (new, additive) ----
//
// The Design Studio's tray-item snapshots currently only expose Hebrew
// display text (shapeHe / stoneTypeHe — the same fields StudioStoneStrip.js
// already reads for the chip title), not canonical English variety/shape
// values. This helper matches on that Hebrew text directly, using the same
// keyword-matching approach already used by lib/studio/assetPack.js's
// getStoneThumbFallback, so it can be wired in today without depending on
// unseen upstream fields. Returns a thumbUrl (box or tweezer) or null.
const GEMSTONE_KEYWORD_MAP = [
  [/טנזניט|tanzanite/, null], // not in this pack — left unmatched on purpose
  [/פרסל|melee/, null], // parcels are not represented in this single-stone pack
  [/אזמרגד.*כרית|כרית.*אזמרגד|cushion.*emerald/, { variety: 'Emerald', shape: 'Cushion' }],
  [/אזמרגד|emerald(?!.*cut)|אמרלד/, { variety: 'Emerald', shape: 'Oval' }],
  [/ספיר|sapphire/, { variety: 'Blue Sapphire', shape: 'Oval' }],
  [/אודם|רובי|ruby/, { variety: 'Ruby', shape: 'Cushion' }],
  [/פראיבה|טורמלין|paraiba|tourmaline/, { variety: 'Paraiba Tourmaline', shape: 'Oval' }],
  [/כרית|cushion/, { variety: 'White Diamond', shape: 'Cushion' }],
  [/אגס|pear/, { variety: 'White Diamond', shape: 'Pear' }],
  [/emerald cut|קאט אזמרגד|אזמרגד קאט/, { variety: 'White Diamond', shape: 'Emerald Cut' }],
  // Note: this pack has no plain oval-diamond BOX asset (only a tweezer one),
  // so "oval diamond" is deliberately left unmatched for the box view here —
  // it falls through to lib/studio/assetPack.js's genuine oval-diamond
  // fallback instead of substituting a visually wrong round-cut photo.
  [/עגול|round|בריליאנט/, { variety: 'White Diamond', shape: 'Round Brilliant' }],
];

export function getGemstoneThumbFallback(item, view) {
  if (!item) return null;
  const s = item.snapshot || {};
  const text = [s.shapeHe, s.stoneTypeHe, s.name].filter(Boolean).join(' ');
  if (!text.trim()) return null;
  const targetView = view === 'tweezer' ? 'tweezer' : 'box';
  for (const [pattern, target] of GEMSTONE_KEYWORD_MAP) {
    if (!target) continue;
    if (pattern.test(text)) {
      const match = findDemoGemstoneAsset({ view: targetView, variety: target.variety, shape: target.shape });
      if (match) return targetView === 'box' ? match.thumbUrl : match.imageUrl;
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// Demo Operating Layer helpers — visible fallback data for an empty studio.
// -----------------------------------------------------------------------------
// These helpers are intentionally read-only. They do not write to Work Tray,
// Airtable, localStorage, uploads, projects, certificates, or reports.
// Disable by changing this constant to false, or by removing the small call-sites
// in StudioShell / StudioStoneStrip / StudioInspectorDrawer.

export const ENABLE_DEMO_GEMSTONE_LAYER = true;

const DEMO_RECORDS = Object.freeze([
  {
    key: 'round-brilliant-diamond',
    title: 'Round Brilliant Diamond',
    titleHe: 'יהלום עגול בריליאנט',
    stoneType: 'Diamond',
    stoneTypeHe: 'יהלום',
    shape: 'Round Brilliant',
    shapeHe: 'עגול בריליאנט',
    estimatedCarat: 1.21,
    color: 'D–F / Colorless',
    clarity: 'VS visual quality',
    treatment: 'None',
    sourceType: 'owned',
    status: 'selected',
    role: 'centerStone',
  },
  {
    key: 'oval-diamond',
    title: 'Oval Diamond',
    titleHe: 'יהלום אובלי',
    stoneType: 'Diamond',
    stoneTypeHe: 'יהלום',
    shape: 'Oval',
    shapeHe: 'אובלי',
    estimatedCarat: 1.55,
    color: 'F–G / White',
    clarity: 'VS visual quality',
    treatment: 'None',
    sourceType: 'supplier',
    status: 'available',
    role: 'centerStone',
  },
  {
    key: 'pear-diamond',
    title: 'Pear Diamond',
    titleHe: 'יהלום אגס',
    stoneType: 'Diamond',
    stoneTypeHe: 'יהלום',
    shape: 'Pear',
    shapeHe: 'אגס',
    estimatedCarat: 1.04,
    color: 'G / White',
    clarity: 'VS–SI visual quality',
    treatment: 'None',
    sourceType: 'owned',
    status: 'available',
    role: 'centerStone',
  },
  {
    key: 'emerald-cut-diamond',
    title: 'Emerald-Cut Diamond',
    titleHe: 'יהלום אמרלד קאט',
    stoneType: 'Diamond',
    stoneTypeHe: 'יהלום',
    shape: 'Emerald Cut',
    shapeHe: 'אמרלד קאט',
    estimatedCarat: 1.72,
    color: 'E–F / Colorless',
    clarity: 'VVS–VS visual quality',
    treatment: 'None',
    sourceType: 'client-owned',
    status: 'in-design',
    role: 'centerStone',
  },
  {
    key: 'cushion-diamond',
    title: 'Cushion Diamond',
    titleHe: 'יהלום כרית',
    stoneType: 'Diamond',
    stoneTypeHe: 'יהלום',
    shape: 'Cushion',
    shapeHe: 'כרית',
    estimatedCarat: 1.36,
    color: 'G–H / White',
    clarity: 'VS visual quality',
    treatment: 'None',
    sourceType: 'owned',
    status: 'reserved',
    role: 'centerStone',
  },
  {
    key: 'oval-emerald',
    title: 'Oval Emerald',
    titleHe: 'אמרלד אובלי',
    stoneType: 'Emerald',
    stoneTypeHe: 'אמרלד',
    shape: 'Oval',
    shapeHe: 'אובלי',
    estimatedCarat: 2.35,
    color: 'Vivid Green',
    clarity: 'Natural jardin visible',
    treatment: 'Minor oil / demo assumption',
    sourceType: 'owned',
    status: 'selected',
    role: 'centerStone',
  },
  {
    key: 'emerald-cut-emerald',
    title: 'Emerald-Cut Emerald',
    titleHe: 'אמרלד קאט אמרלד',
    stoneType: 'Emerald',
    stoneTypeHe: 'אמרלד',
    shape: 'Emerald Cut',
    shapeHe: 'אמרלד קאט',
    estimatedCarat: 2.92,
    color: 'Rich Green',
    clarity: 'Natural jardin visible',
    treatment: 'Minor oil / demo assumption',
    sourceType: 'supplier',
    status: 'available',
    role: 'centerStone',
  },
  {
    key: 'cushion-ruby',
    title: 'Cushion Ruby',
    titleHe: 'רובי כרית',
    stoneType: 'Ruby',
    stoneTypeHe: 'רובי',
    shape: 'Cushion',
    shapeHe: 'כרית',
    estimatedCarat: 2.18,
    color: 'Rich Red',
    clarity: 'Included natural character',
    treatment: 'Heat unknown / demo assumption',
    sourceType: 'owned',
    status: 'in-design',
    role: 'centerStone',
  },
  {
    key: 'oval-blue-sapphire',
    title: 'Oval Blue Sapphire',
    titleHe: 'ספיר כחול אובלי',
    stoneType: 'Sapphire',
    stoneTypeHe: 'ספיר',
    shape: 'Oval',
    shapeHe: 'אובלי',
    estimatedCarat: 2.64,
    color: 'Royal Blue',
    clarity: 'Eye-clean visual quality',
    treatment: 'Heat unknown / demo assumption',
    sourceType: 'supplier',
    status: 'available',
    role: 'centerStone',
  },
  {
    key: 'oval-paraiba-tourmaline',
    title: 'Oval Paraiba Tourmaline',
    titleHe: 'טורמלין פראיבה אובלי',
    stoneType: 'Paraiba Tourmaline',
    stoneTypeHe: 'טורמלין פראיבה',
    shape: 'Oval',
    shapeHe: 'אובלי',
    estimatedCarat: 3.08,
    color: 'Neon Blue-Green',
    clarity: 'Included natural character',
    treatment: 'Copper-bearing / demo assumption',
    sourceType: 'client-owned',
    status: 'selected',
    role: 'centerStone',
  },
]);

function firstAssetForKey(key, view) {
  const suffix = view === 'tweezer' ? '-tweezer' : '-box';
  const directId = `${view}-${key}`;
  const direct = demoGemstoneAssets.find((asset) => asset.id === directId || asset.id === `${view}-${key}${suffix}`);
  if (direct) return direct;

  // The box pack intentionally has no oval-diamond box image. Fall back to the
  // built-in starter-pack oval diamond thumbnail for card state, while still
  // using the real oval-diamond tweezer image for inspect state.
  if (view === 'box' && key === 'oval-diamond') {
    return {
      imageUrl: '/assets/leshems/starter-pack-v1/01_stones/diamonds/stone_diamond_oval_white_thumb_v01.png',
      thumbUrl: '/assets/leshems/starter-pack-v1/01_stones/diamonds/stone_diamond_oval_white_thumb_v01.png',
    };
  }

  if (view === 'tweezer' && key === 'oval-emerald') {
    return demoGemstoneAssets.find((asset) => asset.id === 'tweezer-cushion-emerald-alt') || null;
  }
  if (view === 'tweezer' && key === 'emerald-cut-emerald') {
    return demoGemstoneAssets.find((asset) => asset.id === 'tweezer-cushion-emerald-alt') || null;
  }
  return null;
}

export function getDemoGemstoneRecords() {
  return DEMO_RECORDS.map((record) => {
    const box = firstAssetForKey(record.key, 'box');
    const tweezer = firstAssetForKey(record.key, 'tweezer');
    return Object.freeze({
      ...record,
      id: `demo-${record.key}`,
      boxImage: box ? box.imageUrl : null,
      boxThumb: box ? box.thumbUrl || box.imageUrl : null,
      tweezerImage: tweezer ? tweezer.imageUrl : null,
      tweezerThumb: tweezer ? tweezer.thumbUrl || tweezer.imageUrl : null,
      isDemoAsset: true,
      temporaryOnly: true,
    });
  });
}

export function getDemoStudioTrayItems(limit = 6) {
  return getDemoGemstoneRecords()
    .slice(0, limit)
    .map((record) => ({
      id: `demo-tray-${record.key}`,
      role: record.role || 'centerStone',
      source: 'demo-operating-layer',
      isDemoAsset: true,
      temporaryOnly: true,
      snapshot: {
        name: record.titleHe || record.title,
        productTypeHe: 'אבן מרכזית',
        stoneTypeHe: record.stoneTypeHe,
        shapeHe: record.shapeHe,
        caratWeight: record.estimatedCarat,
        color: record.color,
        clarity: record.clarity,
        treatment: record.treatment,
        sourceType: record.sourceType,
        status: record.status,
        primaryImage: record.boxThumb || record.boxImage,
        boxImage: record.boxImage,
        inspectImage: record.tweezerImage || record.boxImage,
        title: record.title,
        titleHe: record.titleHe,
        stoneType: record.stoneType,
        shape: record.shape,
        isDemoAsset: true,
        temporaryOnly: true,
      },
    }));
}

export function getDemoInspectStoneFromTrayItem(item) {
  if (!item) return null;
  const s = item.snapshot || {};
  return {
    id: item.id,
    title: s.title || s.name || 'Demo Stone',
    titleHe: s.titleHe || s.name || 'אבן דמו',
    stoneType: s.stoneType || s.stoneTypeHe || 'Gemstone',
    stoneTypeHe: s.stoneTypeHe || s.stoneType || 'אבן',
    shape: s.shape || s.shapeHe || '—',
    shapeHe: s.shapeHe || s.shape || '—',
    estimatedCarat: s.caratWeight,
    color: s.color,
    clarity: s.clarity,
    treatment: s.treatment,
    sourceType: s.sourceType,
    status: s.status,
    boxImage: s.boxImage || s.primaryImage,
    inspectImage: s.inspectImage || s.primaryImage,
    isDemoAsset: true,
    temporaryOnly: true,
  };
}

export function getDemoActivityFeed() {
  return Object.freeze([
    { id: 'demo-act-1', textHe: 'אמרלד אובלי נוסף למלאי הדמו', tone: 'inventory' },
    { id: 'demo-act-2', textHe: 'רובי כרית נשלח למגש העבודה', tone: 'tray' },
    { id: 'demo-act-3', textHe: 'יהלום עגול נבחר לקונספט סוליטר', tone: 'design' },
    { id: 'demo-act-4', textHe: 'ספיר כחול אובלי סומן כזמין מספק', tone: 'supplier' },
  ]);
}
