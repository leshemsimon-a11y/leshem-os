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
