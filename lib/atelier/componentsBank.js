// lib/atelier/componentsBank.js
//
// LESHEM.S OS — Clean 11A.2: The Components Bank.
//
// The studio's standard default catalog of PHYSICAL components: metals,
// melee stones, settings, chains, earring backs and bails. Every entry is a
// real manufacturable component carrying real-world physical data (alloy
// purity, density, standard melee weights, default component weights) plus
// the PRICING FIELDS the studio will later fill from Airtable.
//
// STRICT RULES FOR THIS FILE
//   • Pure data + pure functions. No store, no network, no persistence key,
//     no npm package, no import from components/*.
//   • PHYSICAL constants (purity, density, melee mm->ct) are real published
//     industry values and are safe to ship as defaults.
//   • PRICES ARE NEVER INVENTED. Every cost field ships as null with
//     pricingStatus 'pendingAirtable'. The cost engine below is fully
//     functional the moment real numbers arrive, and until then it reports
//     exactly which inputs are missing instead of producing a fake number.
//   • Every record is Airtable-sync-shaped: { key, sku, source, airtableId }
//     so a later sync updates records in place instead of restructuring.

export const COMPONENT_SOURCE = Object.freeze({
  DEFAULT: 'studioDefault', // shipped with the app
  AIRTABLE: 'airtable', // synced from the studio's Airtable base
});

export const PRICING_STATUS = Object.freeze({
  PENDING: 'pendingAirtable', // field exists, real value not supplied yet
  READY: 'ready', // a real studio value is present
});

// Shared shape for the money fields every priceable component carries.
function pricingFields(extra) {
  return Object.freeze({
    pricingStatus: PRICING_STATUS.PENDING,
    currency: 'USD',
    ...extra,
  });
}

// ---------------------------------------------------------------------------
// 1. METALS — 14K & 18K (yellow / white / rose) + platinum.
// ---------------------------------------------------------------------------
// density: g/cm^3, published alloy averages. Used later to convert a CAD
// volume (Rhino / Matrix) into a real casting weight.
// purity: fine-metal fraction, used for scrap/refining and metal cost.

export const METAL_ALLOY = Object.freeze({
  GOLD_14K: 'gold14k',
  GOLD_18K: 'gold18k',
  PLATINUM_950: 'platinum950',
});

export const METAL_COLOR = Object.freeze({
  YELLOW: 'yellow',
  WHITE: 'white',
  ROSE: 'rose',
  NATURAL: 'natural', // platinum has no color variants
});

export const METAL_ALLOY_OPTIONS = Object.freeze([
  { key: METAL_ALLOY.GOLD_14K, he: '14 קראט', shortHe: '14K', purity: 0.585, hallmark: '585' },
  { key: METAL_ALLOY.GOLD_18K, he: '18 קראט', shortHe: '18K', purity: 0.75, hallmark: '750' },
  { key: METAL_ALLOY.PLATINUM_950, he: 'פלטינה', shortHe: 'Pt950', purity: 0.95, hallmark: '950' },
]);

export const METAL_COLOR_OPTIONS = Object.freeze([
  { key: METAL_COLOR.YELLOW, he: 'צהוב', swatch: 'yellow' },
  { key: METAL_COLOR.WHITE, he: 'לבן', swatch: 'white' },
  { key: METAL_COLOR.ROSE, he: 'ורוד', swatch: 'rose' },
]);

export const METALS = Object.freeze([
  {
    key: 'gold14kYellow',
    sku: 'MTL-14Y',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    alloy: METAL_ALLOY.GOLD_14K,
    color: METAL_COLOR.YELLOW,
    he: 'זהב צהוב 14 קראט',
    shortHe: 'צהוב 14K',
    swatch: 'yellow',
    purity: 0.585,
    densityGCm3: 13.07,
    rhodiumPlated: false,
    legacyMetalPreference: 'yellowGold',
    renderEn: '14k yellow gold',
    renderFinishEn: 'warm yellow gold with a polished finish',
    pricing: pricingFields({ costPerGram: null }),
  },
  {
    key: 'gold14kWhite',
    sku: 'MTL-14W',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    alloy: METAL_ALLOY.GOLD_14K,
    color: METAL_COLOR.WHITE,
    he: 'זהב לבן 14 קראט',
    shortHe: 'לבן 14K',
    swatch: 'white',
    purity: 0.585,
    densityGCm3: 12.9,
    rhodiumPlated: true,
    legacyMetalPreference: 'whiteGold',
    renderEn: '14k white gold',
    renderFinishEn: 'bright rhodium-plated white gold with a polished finish',
    pricing: pricingFields({ costPerGram: null, platingCost: null }),
  },
  {
    key: 'gold14kRose',
    sku: 'MTL-14R',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    alloy: METAL_ALLOY.GOLD_14K,
    color: METAL_COLOR.ROSE,
    he: 'זהב ורוד 14 קראט',
    shortHe: 'ורוד 14K',
    swatch: 'rose',
    purity: 0.585,
    densityGCm3: 13.0,
    rhodiumPlated: false,
    legacyMetalPreference: 'roseGold',
    renderEn: '14k rose gold',
    renderFinishEn: 'soft copper-toned rose gold with a polished finish',
    pricing: pricingFields({ costPerGram: null }),
  },
  {
    key: 'gold18kYellow',
    sku: 'MTL-18Y',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    alloy: METAL_ALLOY.GOLD_18K,
    color: METAL_COLOR.YELLOW,
    he: 'זהב צהוב 18 קראט',
    shortHe: 'צהוב 18K',
    swatch: 'yellow',
    purity: 0.75,
    densityGCm3: 15.58,
    rhodiumPlated: false,
    legacyMetalPreference: 'yellowGold',
    renderEn: '18k yellow gold',
    renderFinishEn: 'rich saturated yellow gold with a polished finish',
    pricing: pricingFields({ costPerGram: null }),
  },
  {
    key: 'gold18kWhite',
    sku: 'MTL-18W',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    alloy: METAL_ALLOY.GOLD_18K,
    color: METAL_COLOR.WHITE,
    he: 'זהב לבן 18 קראט',
    shortHe: 'לבן 18K',
    swatch: 'white',
    purity: 0.75,
    densityGCm3: 15.2,
    rhodiumPlated: true,
    legacyMetalPreference: 'whiteGold',
    renderEn: '18k white gold',
    renderFinishEn: 'bright rhodium-plated white gold with a polished finish',
    pricing: pricingFields({ costPerGram: null, platingCost: null }),
  },
  {
    key: 'gold18kRose',
    sku: 'MTL-18R',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    alloy: METAL_ALLOY.GOLD_18K,
    color: METAL_COLOR.ROSE,
    he: 'זהב ורוד 18 קראט',
    shortHe: 'ורוד 18K',
    swatch: 'rose',
    purity: 0.75,
    densityGCm3: 15.15,
    rhodiumPlated: false,
    legacyMetalPreference: 'roseGold',
    renderEn: '18k rose gold',
    renderFinishEn: 'deep warm rose gold with a polished finish',
    pricing: pricingFields({ costPerGram: null }),
  },
  {
    key: 'platinum950',
    sku: 'MTL-PT950',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    alloy: METAL_ALLOY.PLATINUM_950,
    color: METAL_COLOR.NATURAL,
    he: 'פלטינה 950',
    shortHe: 'פלטינה',
    swatch: 'platinum',
    purity: 0.95,
    densityGCm3: 20.9,
    rhodiumPlated: false,
    legacyMetalPreference: 'platinum',
    renderEn: '950 platinum',
    renderFinishEn: 'dense cool-grey platinum with a soft satin-to-polished luster',
    pricing: pricingFields({ costPerGram: null }),
  },
]);

export const DEFAULT_METAL_KEY = 'gold18kWhite';

// ---------------------------------------------------------------------------
// 2. MELEE STONES — natural diamond, lab-grown diamond, colored gemstones.
// ---------------------------------------------------------------------------
// Standard round melee sizing. mm -> carat values are the accepted trade
// weights used for parcel ordering and setting-labor quoting.

export const MELEE_SIZES = Object.freeze([
  { key: 'mm1_00', mm: 1.0, caratEach: 0.005, he: '1.0 מ״מ' },
  { key: 'mm1_10', mm: 1.1, caratEach: 0.006, he: '1.1 מ״מ' },
  { key: 'mm1_25', mm: 1.25, caratEach: 0.0085, he: '1.25 מ״מ' },
  { key: 'mm1_50', mm: 1.5, caratEach: 0.015, he: '1.5 מ״מ' },
  { key: 'mm1_75', mm: 1.75, caratEach: 0.022, he: '1.75 מ״מ' },
  { key: 'mm2_00', mm: 2.0, caratEach: 0.03, he: '2.0 מ״מ' },
  { key: 'mm2_50', mm: 2.5, caratEach: 0.06, he: '2.5 מ״מ' },
  { key: 'mm3_00', mm: 3.0, caratEach: 0.1, he: '3.0 מ״מ' },
]);

export const DEFAULT_MELEE_SIZE_KEY = 'mm1_50';

export const MELEE_TYPES = Object.freeze([
  {
    key: 'naturalDiamond',
    sku: 'MEL-ND',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'יהלומים טבעיים',
    shortHe: 'טבעי',
    hintHe: 'מלאי הבית · G-H / VS',
    family: 'diamond',
    origin: 'natural',
    opticsKey: 'diamond',
    defaultQuality: 'G-H VS',
    renderEn: 'natural white diamond melee',
    // Trade practice: melee is bought by carat weight, set by the stone.
    pricing: pricingFields({ costPerCarat: null, settingCostPerStone: null }),
  },
  {
    key: 'labDiamond',
    sku: 'MEL-LG',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'יהלומי מעבדה',
    shortHe: 'מעבדה',
    hintHe: 'זהה אופטית · D-F / VS',
    family: 'diamond',
    origin: 'labGrown',
    opticsKey: 'labDiamond',
    defaultQuality: 'D-F VS',
    renderEn: 'lab-grown white diamond melee',
    pricing: pricingFields({ costPerCarat: null, settingCostPerStone: null }),
  },
  {
    key: 'blueSapphire',
    sku: 'MEL-SAP',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'ספיר כחול',
    shortHe: 'ספיר',
    hintHe: 'כחול רויאל',
    family: 'coloredStone',
    origin: 'natural',
    opticsKey: 'sapphire',
    defaultQuality: 'Royal blue',
    renderEn: 'calibrated royal blue sapphire melee',
    pricing: pricingFields({ costPerCarat: null, settingCostPerStone: null }),
  },
  {
    key: 'ruby',
    sku: 'MEL-RUB',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'רובי',
    shortHe: 'רובי',
    hintHe: 'אדום עשיר',
    family: 'coloredStone',
    origin: 'natural',
    opticsKey: 'ruby',
    defaultQuality: 'Rich red',
    renderEn: 'calibrated rich red ruby melee',
    pricing: pricingFields({ costPerCarat: null, settingCostPerStone: null }),
  },
  {
    key: 'emerald',
    sku: 'MEL-EMR',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'אמרלד',
    shortHe: 'אמרלד',
    hintHe: 'ירוק חי',
    family: 'coloredStone',
    origin: 'natural',
    opticsKey: 'emerald',
    defaultQuality: 'Vivid green',
    renderEn: 'calibrated vivid green emerald melee',
    pricing: pricingFields({ costPerCarat: null, settingCostPerStone: null }),
  },
  {
    key: 'none',
    sku: 'MEL-NONE',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'ללא אבני לוואי',
    shortHe: 'ללא',
    hintHe: 'האבן המרכזית בלבד',
    family: 'none',
    origin: null,
    opticsKey: null,
    defaultQuality: null,
    renderEn: null,
    pricing: pricingFields({ costPerCarat: null, settingCostPerStone: null }),
  },
]);

export const DEFAULT_MELEE_TYPE_KEY = 'none';

// ---------------------------------------------------------------------------
// 3. SETTINGS — 4-prong, 6-prong, bezel, halo.
// ---------------------------------------------------------------------------
// prongCount is a REAL geometric constraint handed to the render bridge:
// a 4-prong head must render with exactly four prongs.

export const SETTING_TYPES = Object.freeze([
  {
    key: 'prong4',
    sku: 'SET-P4',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: '4 שיניים',
    shortHe: '4 שיניים',
    hintHe: 'קלאסי ופתוח לאור',
    prongCount: 4,
    surroundsCenter: false,
    supportsHalo: false,
    renderEn: 'four-prong setting head with exactly four evenly spaced prongs',
    pricing: pricingFields({ settingLaborCost: null, castingWeightG: null }),
  },
  {
    key: 'prong6',
    sku: 'SET-P6',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: '6 שיניים',
    shortHe: '6 שיניים',
    hintHe: 'אחיזה בטוחה לאבן גדולה',
    prongCount: 6,
    surroundsCenter: false,
    supportsHalo: false,
    renderEn: 'six-prong setting head with exactly six evenly spaced prongs',
    pricing: pricingFields({ settingLaborCost: null, castingWeightG: null }),
  },
  {
    key: 'bezel',
    sku: 'SET-BZL',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'בזל',
    shortHe: 'בזל',
    hintHe: 'מסגרת מלאה ומוגנת',
    prongCount: 0,
    surroundsCenter: true,
    supportsHalo: false,
    renderEn: 'continuous full bezel rim with no prongs, metal wrapping the full girdle',
    pricing: pricingFields({ settingLaborCost: null, castingWeightG: null }),
  },
  {
    key: 'halo',
    sku: 'SET-HALO',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'הילה',
    shortHe: 'הילה',
    hintHe: 'שורת מלי סביב האבן',
    prongCount: 4,
    surroundsCenter: true,
    supportsHalo: true,
    // A halo is not decoration: it is a counted ring of melee stones.
    haloStoneCount: 16,
    renderEn:
      'four-prong center head encircled by a single continuous halo row of pave-set melee stones',
    pricing: pricingFields({ settingLaborCost: null, castingWeightG: null }),
  },
]);

export const DEFAULT_SETTING_KEY = 'prong4';

// ---------------------------------------------------------------------------
// 4. FIXED COMPONENTS — chains, earring backs, pendant bails.
// ---------------------------------------------------------------------------
// defaultWeightG values are the studio's standard working weights for a
// component in 14K. They are explicitly OVERRIDABLE defaults (a real
// Airtable record replaces them), not measurements of a specific piece.

export const CHAIN_TYPES = Object.freeze([
  {
    key: 'cable',
    sku: 'CHN-CBL',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'שרשרת אנקר',
    shortHe: 'אנקר',
    hintHe: 'חוליה עגולה · קלאסי',
    defaultLengthCm: 45,
    defaultGaugeMm: 1.0,
    defaultWeightG: 1.4,
    renderEn: 'fine round-link cable chain',
    pricing: pricingFields({ costPerUnit: null }),
  },
  {
    key: 'box',
    sku: 'CHN-BOX',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'שרשרת קופסה',
    shortHe: 'קופסה',
    hintHe: 'חוליה מרובעת · יציב',
    defaultLengthCm: 45,
    defaultGaugeMm: 0.9,
    defaultWeightG: 2.1,
    renderEn: 'fine square-link box chain',
    pricing: pricingFields({ costPerUnit: null }),
  },
  {
    key: 'noChain',
    sku: 'CHN-NONE',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'ללא שרשרת',
    shortHe: 'ללא',
    hintHe: 'התליון בלבד',
    defaultLengthCm: null,
    defaultGaugeMm: null,
    defaultWeightG: 0,
    renderEn: null,
    pricing: pricingFields({ costPerUnit: null }),
  },
]);

export const DEFAULT_CHAIN_KEY = 'cable';

export const EARRING_BACKS = Object.freeze([
  {
    key: 'push',
    sku: 'BCK-PSH',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'פרפר לחיצה',
    shortHe: 'לחיצה',
    hintHe: 'סטנדרט · נוח',
    defaultWeightG: 0.12,
    perPair: true,
    renderEn: 'standard push-back friction posts',
    pricing: pricingFields({ costPerPair: null }),
  },
  {
    key: 'screw',
    sku: 'BCK-SCR',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'תבריג',
    shortHe: 'תבריג',
    hintHe: 'נעילה בטוחה לאבן יקרה',
    defaultWeightG: 0.25,
    perPair: true,
    renderEn: 'threaded screw-back posts',
    pricing: pricingFields({ costPerPair: null }),
  },
  {
    key: 'alpha',
    sku: 'BCK-ALP',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'אלפא',
    shortHe: 'אלפא',
    hintHe: 'נעילה כפולה · מקסימום ביטחון',
    defaultWeightG: 0.45,
    perPair: true,
    renderEn: 'alpha locking backs',
    pricing: pricingFields({ costPerPair: null }),
  },
]);

export const DEFAULT_EARRING_BACK_KEY = 'push';

export const BAIL_TYPES = Object.freeze([
  {
    key: 'hidden',
    sku: 'BAI-HID',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'לולאה נסתרת',
    shortHe: 'נסתרת',
    hintHe: 'קו רציף ונקי מלפנים',
    defaultWeightG: 0.25,
    visibleFromFront: false,
    renderEn: 'concealed bail mounted behind the pendant, not visible from the front',
    pricing: pricingFields({ costPerUnit: null }),
  },
  {
    key: 'vBail',
    sku: 'BAI-VBL',
    source: COMPONENT_SOURCE.DEFAULT,
    airtableId: null,
    he: 'V-Bail',
    shortHe: 'V-Bail',
    hintHe: 'שתי זרועות · מייצב את התליון',
    defaultWeightG: 0.35,
    visibleFromFront: true,
    renderEn: 'V-shaped bail with two visible arms meeting above the pendant',
    pricing: pricingFields({ costPerUnit: null }),
  },
]);

export const DEFAULT_BAIL_KEY = 'hidden';

// ---------------------------------------------------------------------------
// 5. Lookups (pure).
// ---------------------------------------------------------------------------

function find(list, key) {
  return list.find((item) => item.key === key) || null;
}

export function metalComponent(key) {
  return find(METALS, key);
}
export function meleeComponent(key) {
  return find(MELEE_TYPES, key);
}
export function meleeSize(key) {
  return find(MELEE_SIZES, key);
}
export function settingComponent(key) {
  return find(SETTING_TYPES, key);
}
export function chainComponent(key) {
  return find(CHAIN_TYPES, key);
}
export function earringBackComponent(key) {
  return find(EARRING_BACKS, key);
}
export function bailComponent(key) {
  return find(BAIL_TYPES, key);
}

export function metalsForAlloy(alloy) {
  return METALS.filter((metal) => metal.alloy === alloy);
}

export function findMetal(alloy, color) {
  return (
    METALS.find((metal) => metal.alloy === alloy && metal.color === color) ||
    METALS.find((metal) => metal.alloy === alloy) ||
    null
  );
}

// The legacy brief field metalPreference only knows whiteGold / yellowGold /
// roseGold / platinum / silver. Map a Components Bank metal onto it so the
// EXISTING brief schema keeps receiving a valid value, while the exact alloy
// travels in the encoded Atelier config.
export function legacyMetalPreferenceFor(metalKey) {
  const metal = metalComponent(metalKey);
  return metal ? metal.legacyMetalPreference : null;
}

// ---------------------------------------------------------------------------
// 6. Melee weight math (pure, real).
// ---------------------------------------------------------------------------

export function meleeTotalCarat(sizeKey, count) {
  const size = meleeSize(sizeKey);
  const n = Number(count);
  if (!size || !Number.isFinite(n) || n <= 0) return 0;
  // Trade rounding: melee parcels are quoted to three decimals.
  return Math.round(size.caratEach * n * 1000) / 1000;
}

// Convert a CAD volume (Rhino / Matrix reports mm^3) into a casting weight.
export function metalWeightFromVolume(metalKey, volumeMm3) {
  const metal = metalComponent(metalKey);
  const volume = Number(volumeMm3);
  if (!metal || !Number.isFinite(volume) || volume <= 0) return null;
  const cm3 = volume / 1000;
  return Math.round(cm3 * metal.densityGCm3 * 100) / 100;
}

// ---------------------------------------------------------------------------
// 7. Cost engine — PREP ONLY.
// ---------------------------------------------------------------------------
// estimateCreationCost never invents a number. It consumes a `pricebook`
// (the shape Airtable will deliver) and returns a full line-item breakdown
// plus an explicit list of the inputs that are still missing. A caller can
// render a real quote when `complete` is true and a clear "needs data"
// state when it is not.
//
// pricebook shape (all optional, all supplied by the studio):
//   {
//     metalCostPerGram:      { [metalKey]: number },
//     meleeCostPerCarat:     { [meleeKey]: number },
//     meleeSettingPerStone:  { [meleeKey]: number },
//     settingLabor:          { [settingKey]: number },
//     chainCost:             { [chainKey]: number },
//     backCost:              { [backKey]: number },
//     bailCost:              { [bailKey]: number },
//     centerStoneCost:       number,
//     bench:                 { finishing?: number, rhodium?: number },
//   }

function lookupPrice(map, key) {
  if (!map || typeof map !== 'object') return null;
  const value = map[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

export function estimateCreationCost(spec, pricebook) {
  const s = spec && typeof spec === 'object' ? spec : {};
  const book = pricebook && typeof pricebook === 'object' ? pricebook : {};
  const lines = [];
  const missing = [];

  const push = (id, labelHe, amount, detail) => {
    if (amount == null) {
      missing.push({ id, labelHe, detail: detail || null });
      lines.push({ id, labelHe, amount: null, detail: detail || null, known: false });
      return;
    }
    lines.push({ id, labelHe, amount: round2(amount), detail: detail || null, known: true });
  };

  // --- metal ---------------------------------------------------------------
  const metal = metalComponent(s.metalKey);
  const metalWeight =
    typeof s.metalWeightG === 'number' && s.metalWeightG > 0 ? s.metalWeightG : null;
  const metalPerGram = lookupPrice(book.metalCostPerGram, s.metalKey);
  push(
    'metal',
    metal ? `מתכת · ${metal.he}` : 'מתכת',
    metalWeight != null && metalPerGram != null ? metalWeight * metalPerGram : null,
    metalWeight != null ? `${metalWeight} גרם` : 'משקל יציקה מתוך הקובץ ב-Rhino/Matrix'
  );

  // --- center stone --------------------------------------------------------
  const centerCost =
    typeof book.centerStoneCost === 'number' && Number.isFinite(book.centerStoneCost)
      ? book.centerStoneCost
      : null;
  push('centerStone', 'אבן מרכזית', centerCost, s.centerStoneLabelHe || null);

  // --- melee ---------------------------------------------------------------
  const meleeCount = Number(s.meleeCount) || 0;
  if (meleeCount > 0 && s.meleeKey && s.meleeKey !== 'none') {
    const melee = meleeComponent(s.meleeKey);
    const totalCt = meleeTotalCarat(s.meleeSizeKey, meleeCount);
    const perCarat = lookupPrice(book.meleeCostPerCarat, s.meleeKey);
    const perStone = lookupPrice(book.meleeSettingPerStone, s.meleeKey);
    push(
      'meleeStones',
      melee ? `אבני לוואי · ${melee.he}` : 'אבני לוואי',
      perCarat != null ? totalCt * perCarat : null,
      `${meleeCount} אבנים · ${totalCt} קראט`
    );
    push(
      'meleeSetting',
      'עבודת שיבוץ מלי',
      perStone != null ? perStone * meleeCount : null,
      `${meleeCount} שיבוצים`
    );
  }

  // --- setting labor -------------------------------------------------------
  const setting = settingComponent(s.settingKey);
  push(
    'settingLabor',
    setting ? `שיבוץ אבן מרכזית · ${setting.he}` : 'שיבוץ אבן מרכזית',
    lookupPrice(book.settingLabor, s.settingKey),
    null
  );

  // --- findings ------------------------------------------------------------
  if (s.chainKey && s.chainKey !== 'noChain') {
    const chain = chainComponent(s.chainKey);
    push('chain', chain ? `שרשרת · ${chain.he}` : 'שרשרת', lookupPrice(book.chainCost, s.chainKey), null);
  }
  if (s.earringBackKey) {
    const back = earringBackComponent(s.earringBackKey);
    push('backs', back ? `סגירת עגיל · ${back.he}` : 'סגירת עגיל', lookupPrice(book.backCost, s.earringBackKey), null);
  }
  if (s.bailKey) {
    const bail = bailComponent(s.bailKey);
    push('bail', bail ? `לולאה · ${bail.he}` : 'לולאה', lookupPrice(book.bailCost, s.bailKey), null);
  }

  // --- bench ---------------------------------------------------------------
  const bench = book.bench && typeof book.bench === 'object' ? book.bench : {};
  if (typeof bench.finishing === 'number') {
    push('finishing', 'ליטוש וגימור', bench.finishing, null);
  }
  if (metal && metal.rhodiumPlated && typeof bench.rhodium === 'number') {
    push('rhodium', 'ציפוי רודיום', bench.rhodium, null);
  }

  const known = lines.filter((line) => line.known);
  const subtotal = known.reduce((sum, line) => sum + line.amount, 0);

  return {
    currency: 'USD',
    lines,
    missing,
    complete: missing.length === 0,
    subtotal: round2(subtotal),
    // Explicitly flagged so no screen can mistake a partial sum for a quote.
    isQuote: missing.length === 0,
    pricingStatus: missing.length === 0 ? PRICING_STATUS.READY : PRICING_STATUS.PENDING,
  };
}

// ---------------------------------------------------------------------------
// 8. Airtable sync surface (structure only — no network in this file).
// ---------------------------------------------------------------------------
// The Components Bank is deliberately flat and keyed so that a later sync can
// replace defaults record-by-record: match on `sku`, keep `key`, overwrite
// pricing and any studio-specific weights, and set source to 'airtable'.

export const COMPONENT_TABLES = Object.freeze({
  metals: 'METALS',
  melee: 'MELEE_TYPES',
  settings: 'SETTING_TYPES',
  chains: 'CHAIN_TYPES',
  earringBacks: 'EARRING_BACKS',
  bails: 'BAIL_TYPES',
});

export function componentsBankSnapshot() {
  return {
    version: '11A.2',
    source: COMPONENT_SOURCE.DEFAULT,
    metals: METALS,
    melee: MELEE_TYPES,
    meleeSizes: MELEE_SIZES,
    settings: SETTING_TYPES,
    chains: CHAIN_TYPES,
    earringBacks: EARRING_BACKS,
    bails: BAIL_TYPES,
  };
}
