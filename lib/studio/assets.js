// lib/studio/assets.js
//
// LESHEM.S OS — Inventory Asset Adapter (Clean 2)
//
// Bridges the EXISTING server-side Airtable API (GET /api/airtable/stones)
// into the /studio inventory experience. This layer:
//
//   • fetches the existing route (no new API route, no schema change)
//   • tolerates several response shapes without crashing:
//       { stones: [...] } | { records: [...] } | { items: [...] } | [...]
//       | { error, stones: [] } | malformed / empty
//   • adapts the existing normalized stone object into a small, display-only
//     view-model the cards/drawer consume
//   • derives the six clean taxonomy axes for filtering, reusing the EXISTING
//     canonical label helpers (lib/labels/productLabels) so Hebrew Airtable
//     values resolve exactly as the rest of the app resolves them
//
// HARD RULES honored here:
//   • Never render the Airtable record id in the UI — it is kept only as a
//     stable React key (`key`), never surfaced as a visible field.
//   • Never expose secrets — this runs in the browser and only calls our own
//     same-origin API route; no tokens are touched here.
//   • Graceful degradation — malformed records are skipped (console.warn),
//     never thrown; a hard failure returns a clean error result.
//
// NOTE on label helpers: the existing app uses snake_case canonical keys
// (e.g. "natural_diamond", "physical_stock") in lib/labels/productLabels.js,
// which already match real Airtable data. We reuse those for display + axis
// derivation rather than re-deriving them, to stay consistent with MVP/v2.

import {
  toAppHe as toAppHeExisting,
  toReportEn as toReportEnExisting,
  toCanonical as toCanonicalExisting,
} from '../labels/productLabels';
import {
  toAppHe as toAppHeStudio,
  toReportEn as toReportEnStudio,
} from './labels';

export const STONES_ENDPOINT = '/api/airtable/stones';

// ---------------------------------------------------------------------------
// Response-shape tolerance
// ---------------------------------------------------------------------------

// Pull an array of raw stone objects out of whatever the API returned.
// Returns { list, error }. `error` is a string only on a true hard failure.
export function extractStoneList(payload) {
  if (payload == null) {
    return { list: [], error: null };
  }

  // Raw array
  if (Array.isArray(payload)) {
    return { list: payload, error: null };
  }

  if (typeof payload !== 'object') {
    return { list: [], error: null };
  }

  // Explicit error wrapper from the existing route: { error, stones: [] }
  const hasError =
    typeof payload.error === 'string' && payload.error.trim().length > 0;

  // Known wrappers, in priority order
  const wrapper =
    (Array.isArray(payload.stones) && payload.stones) ||
    (Array.isArray(payload.records) && payload.records) ||
    (Array.isArray(payload.items) && payload.items) ||
    (Array.isArray(payload.data) && payload.data) ||
    null;

  if (hasError) {
    return { list: wrapper || [], error: payload.error };
  }

  if (wrapper) {
    return { list: wrapper, error: null };
  }

  // Unknown object shape — degrade gracefully, no crash.
  return { list: [], error: null };
}

// ---------------------------------------------------------------------------
// Safe field access
// ---------------------------------------------------------------------------
function pick(obj, ...keys) {
  if (!obj || typeof obj !== 'object') return null;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return null;
}

function firstImageFrom(stone) {
  // The existing normalize.js exposes thumbnailUrl, inventoryImages[],
  // certImageUrl, and imageUrlText. Prefer the lightest first.
  const thumb = pick(stone, 'thumbnailUrl');
  if (thumb) return thumb;
  const imgs = stone && Array.isArray(stone.inventoryImages) ? stone.inventoryImages : [];
  if (imgs.length > 0) return imgs[0];
  const cert = pick(stone, 'certImageUrl');
  if (cert) return cert;
  const text = pick(stone, 'imageUrlText');
  if (text) return text;
  return null;
}

function collectImages(stone) {
  const out = [];
  const imgs = stone && Array.isArray(stone.inventoryImages) ? stone.inventoryImages : [];
  imgs.forEach((u) => u && out.push(u));
  const cert = pick(stone, 'certImageUrl');
  if (cert) out.push(cert);
  const text = pick(stone, 'imageUrlText');
  if (text && !out.includes(text)) out.push(text);
  // De-dupe while preserving order.
  return out.filter((u, i) => out.indexOf(u) === i);
}

// ---------------------------------------------------------------------------
// Clean taxonomy axis derivation (for filtering only)
// ---------------------------------------------------------------------------
// Maps the existing app's canonical keys onto the Clean 1 six-axis vocabulary.
// Filtering uses these derived axis values; display uses Hebrew labels.

function deriveStoneCategory(productTypeKey) {
  switch (productTypeKey) {
    case 'natural_diamond':
      return 'whiteDiamond';
    case 'lab_grown_diamond':
      return 'whiteDiamond';
    case 'fancy_color_diamond':
      return 'fancyColorDiamond';
    case 'colored_gemstone':
      return 'coloredGemstone';
    default:
      return 'other';
  }
}

function deriveOrigin(productTypeKey, growthMethod) {
  if (productTypeKey === 'lab_grown_diamond') return 'labGrown';
  if (productTypeKey === 'natural_diamond') return 'natural';
  if (productTypeKey === 'fancy_color_diamond') return 'natural';
  // Growth method present (CVD/HPHT) strongly implies lab-grown.
  if (growthMethod) {
    const g = String(growthMethod).toLowerCase();
    if (g.includes('cvd') || g.includes('hpht') || g.includes('lab')) {
      return 'labGrown';
    }
  }
  return 'unknown';
}

function deriveInventoryLayer(inventoryLayerKey) {
  switch (inventoryLayerKey) {
    case 'physical_stock':
      return 'physicalStock';
    case 'virtual_supplier_stock':
      return 'virtualSupplierStock';
    case 'client_owned_item':
      return 'clientOwned';
    default:
      return null; // unknown / not set — filter treats as "no layer"
  }
}

const CLEAN_STONE_TYPES = new Set([
  'diamond',
  'sapphire',
  'ruby',
  'emerald',
  'tourmaline',
  'aquamarine',
  'tanzanite',
  'spinel',
  'garnet',
  'topaz',
  'amethyst',
  'citrine',
  'peridot',
  'opal',
  'pearl',
]);

function deriveStoneType(stoneTypeKey) {
  if (!stoneTypeKey) return null;
  return CLEAN_STONE_TYPES.has(stoneTypeKey) ? stoneTypeKey : 'other';
}

function deriveShape(shapeKey) {
  switch (shapeKey) {
    case 'round':
    case 'round_brilliant':
      return 'round';
    case 'oval':
      return 'oval';
    case 'emerald':
    case 'emerald_cut':
      return 'emerald';
    case 'cushion':
      return 'cushion';
    case 'radiant':
      return 'radiant';
    case 'pear':
      return 'pear';
    case 'marquise':
      return 'marquise';
    case 'princess':
      return 'princess';
    case 'heart':
      return 'heart';
    case 'asscher':
      return 'asscher';
    case 'baguette':
      return 'baguette';
    case 'trillion':
    case 'trilliant':
      return 'trillion';
    default:
      return shapeKey ? 'other' : null;
  }
}

function studioHe(axis, value, fallback = null) {
  if (!value) return fallback;
  try {
    return toAppHeStudio(axis, value) || fallback;
  } catch (e) {
    console.warn('[assets] studio toAppHe failed for', axis, value, e);
    return fallback || value;
  }
}

function studioEn(axis, value, fallback = null) {
  if (!value) return fallback;
  try {
    return toReportEnStudio(axis, value) || fallback;
  } catch (e) {
    console.warn('[assets] studio toReportEn failed for', axis, value, e);
    return fallback || null;
  }
}

// ---------------------------------------------------------------------------
// Adapt one existing-normalized stone into the studio view-model
// ---------------------------------------------------------------------------
export function adaptStone(stone, index) {
  if (!stone || typeof stone !== 'object') return null;

  // Record id kept ONLY as a React key — never displayed.
  const key = pick(stone, 'id') || `stone-${index}`;

  const productTypeKey = pick(stone, 'productTypeKey');
  const stoneTypeKey = pick(stone, 'stoneTypeKey');
  const cutFormKey = pick(stone, 'cutFormKey');
  const inventoryLayerKey = pick(stone, 'inventoryLayerKey');

  // Raw values (may be Hebrew) for Hebrew display via existing helper.
  const rawProductType = pick(stone, 'productType');
  const rawStoneType = pick(stone, 'stoneType');
  const rawShape = pick(stone, 'stoneShape', 'cutForm');
  const rawStatus = pick(stone, 'inventoryStatus');
  const rawLayer = pick(stone, 'inventoryLayer');

  const cleanStoneType = deriveStoneType(stoneTypeKey);
  const rawShapeKey = cutFormKey || toCanonicalExisting(rawShape);
  const cleanShape = deriveShape(rawShapeKey);

  const heSafe = (raw) => {
    if (!raw) return null;
    try {
      return toAppHeExisting(String(raw));
    } catch (e) {
      console.warn('[assets] toAppHe failed for', raw, e);
      return String(raw);
    }
  };

  const enSafe = (raw) => {
    if (!raw) return null;
    try {
      const v = toReportEnExisting(String(raw));
      return v && v.length > 0 ? v : null;
    } catch (e) {
      console.warn('[assets] toReportEn failed for', raw, e);
      return null;
    }
  };

  const sku = pick(stone, 'sku');
  const name = pick(stone, 'name');

  return {
    key, // React key only — NOT for display
    // Displayable identity (never the Airtable record id)
    sku: sku || null,
    name: name || null,

    // Hebrew display labels (UI)
    productTypeHe: heSafe(rawProductType),
    stoneTypeHe: heSafe(rawStoneType),
    // Shape uses the Clean 1 shape axis, so corrected Hebrew labels stay intact
    // (Pear = טיפה, Emerald = אמרלד, Trillion = טריליון).
    shapeHe: studioHe('shape', cleanShape, heSafe(rawShape)),
    statusHe: heSafe(rawStatus),
    layerHe: heSafe(rawLayer),

    // English-ready labels (future certificate / client-facing). Never Hebrew.
    productTypeEn: enSafe(rawProductType),
    stoneTypeEn: enSafe(rawStoneType),
    shapeEn: studioEn('shape', cleanShape, enSafe(rawShape)),

    // Gemological detail (raw, display as-is in drawer)
    caratWeight: pick(stone, 'caratWeight'),
    stoneCount: pick(stone, 'stoneCount'),
    color: pick(stone, 'color'),
    clarity: pick(stone, 'clarity', 'gemClarity'),
    cutGrade: pick(stone, 'cutGrade'),
    polish: pick(stone, 'polish'),
    symmetry: pick(stone, 'symmetry'),
    fluorescenceIntensity: pick(stone, 'fluorescenceIntensity'),
    fluorescenceColor: pick(stone, 'fluorescenceColor'),
    fancyColorIntensity: pick(stone, 'fancyColorIntensity'),
    fancyColorHue: pick(stone, 'fancyColorHue'),
    transparency: pick(stone, 'transparency'),
    growthMethod: pick(stone, 'growthMethod'),

    // Measurements
    measLength: pick(stone, 'measLength'),
    measWidth: pick(stone, 'measWidth'),
    measHeight: pick(stone, 'measHeight'),

    // Certificate / lab identifiers (internal display in drawer)
    certLab: pick(stone, 'certLab'),
    laserInscription: pick(stone, 'laserInscription'),
    verificationId: pick(stone, 'verificationId'),
    verificationUrl: pick(stone, 'verificationUrl'),
    certPdfUrl: pick(stone, 'certPdfUrl'),
    videoUrl: pick(stone, 'videoUrl'),

    // Internal / studio-only fields (clearly marked internal in drawer)
    costUsd: pick(stone, 'costUsd'),
    supplierName: pick(stone, 'supplierName'),
    physicalLocation: pick(stone, 'physicalLocation'),
    ownerClient: pick(stone, 'ownerClient'),
    virtualSupplier: pick(stone, 'virtualSupplier'),
    supplierAvailability: pick(stone, 'supplierAvailability'),
    memoNumber: pick(stone, 'memoNumber'),
    internalNotes: pick(stone, 'internalNotes'),

    // Media
    primaryImage: firstImageFrom(stone),
    images: collectImages(stone),

    // Derived clean taxonomy axes (filtering only)
    axes: {
      stoneCategory: deriveStoneCategory(productTypeKey),
      origin: deriveOrigin(productTypeKey, pick(stone, 'growthMethod')),
      stoneType: cleanStoneType,
      shape: cleanShape,
      inventoryLayer: deriveInventoryLayer(inventoryLayerKey),
      status: pick(stone, 'inventoryStatus'),
    },

    // Free-text bundle for search (lowercased), never displayed.
    _search: [
      sku,
      name,
      rawProductType,
      rawStoneType,
      rawShape,
      studioHe('shape', cleanShape, null),
      studioEn('shape', cleanShape, null),
      pick(stone, 'color'),
      pick(stone, 'certLab'),
      pick(stone, 'laserInscription'),
      pick(stone, 'verificationId'),
    ]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase())
      .join(' '),
  };
}

// Adapt a full list, skipping malformed records gracefully.
export function adaptStoneList(rawList) {
  if (!Array.isArray(rawList)) return [];
  const out = [];
  rawList.forEach((raw, i) => {
    const adapted = adaptStone(raw, i);
    if (adapted) out.push(adapted);
    else console.warn('[assets] skipped a malformed stone record at index', i);
  });
  return out;
}

// ---------------------------------------------------------------------------
// Fetch + adapt in one call. Always resolves (never rejects) with a clean
// result the UI can branch on: { assets, error }.
// ---------------------------------------------------------------------------
export async function fetchInventory(signal) {
  let res;
  try {
    res = await fetch(STONES_ENDPOINT, { signal });
  } catch (e) {
    if (e && e.name === 'AbortError') throw e;
    console.warn('[assets] network error fetching inventory', e);
    return {
      assets: [],
      error: 'לא ניתן להתחבר לשרת המלאי. בדקו את החיבור ונסו שוב.',
    };
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch (e) {
    console.warn('[assets] failed to parse inventory JSON', e);
    payload = null;
  }

  const { list, error } = extractStoneList(payload);

  // A real server-side failure (e.g. env not configured -> 503 with error).
  if (error) {
    return {
      assets: adaptStoneList(list),
      error:
        'המלאי אינו זמין כרגע. ייתכן שמשתני הסביבה של Airtable אינם מוגדרים.',
    };
  }

  if (!res.ok) {
    return {
      assets: adaptStoneList(list),
      error: 'המלאי אינו זמין כרגע. נסו שוב מאוחר יותר.',
    };
  }

  return { assets: adaptStoneList(list), error: null };
}
