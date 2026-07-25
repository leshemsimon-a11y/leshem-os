// lib/atelier/manufacturingSpec.js
//
// LESHEM.S OS — Clean 11A.2: Manufacturing Spec + Geometry Lock.
//
// Turns the Atelier's Components Bank selections plus the real Work Tray
// stones into ONE deterministic manufacturing specification, and renders
// that specification into a strict English render prompt.
//
// WHY THIS FILE EXISTS
// The generic prompt path (lib/studio/renderPromptFinalizer.js +
// lib/studio/outputPack.js) is shared with the legacy Studio and is
// deliberately left untouched. It also hardcodes "18k" for every gold and
// passes inventory shapes through unmapped ("Round Brilliant" never matched
// its SHAPE_EN key). For a manufacturing-grade render we need the opposite
// of a flexible prompt: exact counts, exact cuts, exact alloy, exact prong
// count and material-accurate optics.
//
// So the Atelier builds its OWN authoritative prompt here and hands it to
// the bridge. Pure functions only: no store, no network, no persistence key.

import {
  metalComponent,
  meleeComponent,
  meleeSize,
  settingComponent,
  chainComponent,
  earringBackComponent,
  bailComponent,
  meleeTotalCarat,
  DEFAULT_METAL_KEY,
  DEFAULT_SETTING_KEY,
} from './componentsBank';

// ---------------------------------------------------------------------------
// 1. Gem optics — material accuracy.
// ---------------------------------------------------------------------------
// A render engine will happily draw every transparent stone as a diamond.
// These entries carry the real optical identity of each species so quartz
// reads as quartz, emerald keeps its jardin, and a lab diamond renders with
// true diamond optics rather than a "synthetic" look.

const GEM_OPTICS = Object.freeze({
  diamond: {
    en: 'diamond',
    ri: 2.417,
    opticsEn:
      'adamantine luster, very high brilliance with strong white light return and distinct spectral fire, razor-sharp facet junctions, eye-clean transparency',
  },
  labDiamond: {
    en: 'lab-grown diamond',
    ri: 2.417,
    // Physically and optically identical to natural: must NOT look different.
    opticsEn:
      'true diamond optics identical to a natural diamond: adamantine luster, high brilliance, strong spectral fire, razor-sharp facet junctions, eye-clean transparency',
  },
  moissanite: {
    en: 'moissanite',
    ri: 2.65,
    opticsEn: 'very high dispersion with pronounced rainbow fire, visible facet doubling',
  },
  sapphire: {
    en: 'sapphire',
    ri: 1.77,
    opticsEn:
      'vitreous to sub-adamantine luster, deep saturated body color with velvety internal glow, moderate brilliance and low dispersion, no diamond-like fire',
  },
  ruby: {
    en: 'ruby',
    ri: 1.77,
    opticsEn:
      'vitreous luster, rich saturated red body color with soft internal fluorescent glow, moderate brilliance, low dispersion',
  },
  emerald: {
    en: 'emerald',
    ri: 1.58,
    opticsEn:
      'vitreous luster, saturated green body color, characteristic fine internal jardin inclusions, soft subdued brilliance, low dispersion, never diamond-like fire',
  },
  aquamarine: {
    en: 'aquamarine',
    ri: 1.58,
    opticsEn: 'vitreous luster, pale cool blue body color, clean transparency, gentle brilliance',
  },
  morganite: {
    en: 'morganite',
    ri: 1.58,
    opticsEn: 'vitreous luster, soft peach-pink body color, clean transparency, gentle brilliance',
  },
  tanzanite: {
    en: 'tanzanite',
    ri: 1.7,
    opticsEn:
      'vitreous luster, violet-blue body color with visible pleochroic shifts between blue and violet, moderate brilliance',
  },
  tourmaline: {
    en: 'tourmaline',
    ri: 1.63,
    opticsEn: 'vitreous luster, saturated body color, moderate brilliance, low dispersion',
  },
  paraiba: {
    en: 'Paraiba tourmaline',
    ri: 1.63,
    opticsEn:
      'vitreous luster with an unmistakable neon cuprian blue-green glow, moderate brilliance, low dispersion',
  },
  // "Quartz must look like Quartz" — glassy and calm, never diamond-bright.
  quartz: {
    en: 'quartz',
    ri: 1.55,
    opticsEn:
      'clean glassy vitreous luster, low refractive index with calm gentle sparkle, soft light return, minimal dispersion, explicitly NOT diamond-like brilliance or fire',
  },
  amethyst: {
    en: 'amethyst',
    ri: 1.55,
    opticsEn:
      'glassy vitreous quartz luster, purple body color with visible color zoning, calm gentle sparkle, low dispersion, never diamond-like fire',
  },
  citrine: {
    en: 'citrine',
    ri: 1.55,
    opticsEn:
      'glassy vitreous quartz luster, warm golden body color, calm gentle sparkle, low dispersion',
  },
  smokyQuartz: {
    en: 'smoky quartz',
    ri: 1.55,
    opticsEn: 'glassy vitreous quartz luster, translucent brown body color, calm gentle sparkle',
  },
  roseQuartz: {
    en: 'rose quartz',
    ri: 1.55,
    opticsEn: 'milky translucent pink quartz with soft diffused internal glow, gentle luster',
  },
  topaz: {
    en: 'topaz',
    ri: 1.62,
    opticsEn: 'vitreous luster, clean transparency, moderate brilliance, low dispersion',
  },
  garnet: {
    en: 'garnet',
    ri: 1.79,
    opticsEn: 'vitreous to sub-adamantine luster, deep saturated body color, moderate brilliance',
  },
  peridot: {
    en: 'peridot',
    ri: 1.67,
    opticsEn: 'vitreous oily luster, yellow-green body color, visible facet doubling',
  },
  spinel: {
    en: 'spinel',
    ri: 1.72,
    opticsEn: 'vitreous luster, clean saturated body color, lively brilliance, low dispersion',
  },
  opal: {
    en: 'opal',
    ri: 1.45,
    opticsEn:
      'waxy to vitreous luster, smooth unfaceted cabochon dome, characteristic play-of-color flashes, no facets',
  },
  pearl: {
    en: 'pearl',
    ri: 1.53,
    opticsEn:
      'soft nacreous luster with subtle orient, smooth unfaceted surface, no facets and no transparency',
  },
  onyx: {
    en: 'onyx',
    ri: 1.55,
    opticsEn: 'fully opaque black body, smooth polished surface, no internal light return',
  },
  turquoise: {
    en: 'turquoise',
    ri: 1.62,
    opticsEn: 'opaque waxy blue-green body with fine matrix veining, smooth polished cabochon',
  },
  lapis: {
    en: 'lapis lazuli',
    ri: 1.5,
    opticsEn: 'opaque deep blue body with fine pyrite flecks, smooth polished surface',
  },
  gemstone: {
    en: 'gemstone',
    ri: null,
    opticsEn: 'clean transparent gemstone with realistic facet reflections and believable luster',
  },
});

// Hebrew + English inventory labels -> optics key. The inventory is bilingual
// and free-typed, so this resolver is intentionally generous.
const STONE_TYPE_PATTERNS = [
  [/lab[\s-]?grown|מעבד[הת]|סינת|lab diamond/i, 'labDiamond'],
  [/moissanite|מויסנייט/i, 'moissanite'],
  [/diamond|יהלום/i, 'diamond'],
  [/paraiba|פראיבה|פאראיבה/i, 'paraiba'],
  [/tourmaline|טורמלין/i, 'tourmaline'],
  [/sapphire|ספיר/i, 'sapphire'],
  [/ruby|רובי|אודם/i, 'ruby'],
  [/emerald|אמרלד|אזמרגד|ברקת/i, 'emerald'],
  [/aquamarine|אקוומרין|אקווהמרין/i, 'aquamarine'],
  [/morganite|מורגנייט/i, 'morganite'],
  [/tanzanite|טנזנייט|טנזניט/i, 'tanzanite'],
  [/amethyst|אמטיסט|אחלמה/i, 'amethyst'],
  [/citrine|סיטרין/i, 'citrine'],
  [/smoky|עשן/i, 'smokyQuartz'],
  [/rose quartz|קוורץ ורוד/i, 'roseQuartz'],
  [/quartz|קוורץ|קריסטל/i, 'quartz'],
  [/topaz|טופז/i, 'topaz'],
  [/garnet|גרנט|אודם כהה/i, 'garnet'],
  [/peridot|פרידוט/i, 'peridot'],
  [/spinel|ספינל/i, 'spinel'],
  [/opal|אופל/i, 'opal'],
  [/pearl|פנינ/i, 'pearl'],
  [/onyx|אוניקס|שוהם/i, 'onyx'],
  [/turquoise|טורקיז/i, 'turquoise'],
  [/lapis|לאפיס|לפיס/i, 'lapis'],
];

export function resolveStoneOptics(stoneType, stoneTypeHe) {
  const text = [stoneType, stoneTypeHe].filter(Boolean).join(' ');
  if (!text.trim()) return GEM_OPTICS.gemstone;
  const hit = STONE_TYPE_PATTERNS.find(([pattern]) => pattern.test(text));
  return GEM_OPTICS[hit ? hit[1] : 'gemstone'] || GEM_OPTICS.gemstone;
}

// ---------------------------------------------------------------------------
// 2. Cut resolver.
// ---------------------------------------------------------------------------
// The inventory stores shapes as display text ("Round Brilliant", "אמרלד
// קאט"), not as the lowercase enum keys the shared prompt map expects. An
// unresolved cut is the single biggest source of render hallucination, so
// this resolver accepts every form the app actually produces.

const CUT_PATTERNS = [
  [/round|brilliant|עגול|בריליאנט/i, { key: 'round', en: 'round brilliant cut', facets: 57 }],
  [/oval|אובל/i, { key: 'oval', en: 'oval brilliant cut', facets: 56 }],
  [/emerald|אמרלד קאט|אזמרגד קאט|מדרגות/i, { key: 'emerald', en: 'emerald step cut', facets: 50 }],
  [/cushion|כרית|קושן/i, { key: 'cushion', en: 'cushion cut', facets: 58 }],
  [/pear|אגס|טיפה/i, { key: 'pear', en: 'pear brilliant cut', facets: 58 }],
  [/marquise|מרקיזה/i, { key: 'marquise', en: 'marquise brilliant cut', facets: 57 }],
  [/princess|נסיכה|פרינסס/i, { key: 'princess', en: 'princess cut', facets: 76 }],
  [/asscher|אשר/i, { key: 'asscher', en: 'asscher step cut', facets: 58 }],
  [/radiant|רדיאנט/i, { key: 'radiant', en: 'radiant cut', facets: 70 }],
  [/heart|לב/i, { key: 'heart', en: 'heart brilliant cut', facets: 59 }],
  [/baguette|בגט/i, { key: 'baguette', en: 'baguette step cut', facets: 14 }],
  [/trillion|triangle|משולש/i, { key: 'trillion', en: 'trillion cut', facets: 31 }],
  [/cabochon|קבושון|חלק/i, { key: 'cabochon', en: 'smooth cabochon dome with no facets', facets: 0 }],
];

export function resolveCut(shape, shapeHe) {
  const text = [shape, shapeHe].filter(Boolean).join(' ');
  if (!text.trim()) return null;
  const hit = CUT_PATTERNS.find(([pattern]) => pattern.test(text));
  return hit ? hit[1] : null;
}

// ---------------------------------------------------------------------------
// 3. Product geometry rules (cardinality).
// ---------------------------------------------------------------------------
// Each product type carries hard structural facts the render must respect —
// most importantly how many physical pieces the image should contain.

const PRODUCT_RULES = Object.freeze({
  pendant: { en: 'pendant', pieces: 1, needsBail: true, needsChain: true, needsBacks: false },
  necklace: { en: 'necklace', pieces: 1, needsBail: true, needsChain: true, needsBacks: false },
  ring: { en: 'ring', pieces: 1, needsBail: false, needsChain: false, needsBacks: false },
  engagementRing: {
    en: 'engagement ring',
    pieces: 1,
    needsBail: false,
    needsChain: false,
    needsBacks: false,
  },
  weddingBand: {
    en: 'wedding band',
    pieces: 1,
    needsBail: false,
    needsChain: false,
    needsBacks: false,
  },
  // 'en' is the bare noun; the pair phrasing is applied by the geometry lock
  // so it is never doubled ("a matched pair of matched pair of earrings").
  earrings: {
    en: 'earrings',
    pieces: 2,
    needsBail: false,
    needsChain: false,
    needsBacks: true,
  },
  bracelet: { en: 'bracelet', pieces: 1, needsBail: false, needsChain: false, needsBacks: false },
  matchingPiece: {
    en: 'matching jewelry piece',
    pieces: 1,
    needsBail: false,
    needsChain: false,
    needsBacks: false,
  },
  noStones: {
    en: 'metal-only jewelry piece',
    pieces: 1,
    needsBail: false,
    needsChain: false,
    needsBacks: false,
  },
  other: { en: 'jewelry piece', pieces: 1, needsBail: false, needsChain: false, needsBacks: false },
});

export function productRule(productKey) {
  return PRODUCT_RULES[productKey] || PRODUCT_RULES.other;
}

export function productNeedsBail(productKey) {
  return productRule(productKey).needsBail;
}
export function productNeedsChain(productKey) {
  return productRule(productKey).needsChain;
}
export function productNeedsBacks(productKey) {
  return productRule(productKey).needsBacks;
}

// ---------------------------------------------------------------------------
// 4. buildManufacturingSpec — the single source of truth.
// ---------------------------------------------------------------------------

function stoneFromTrayItem(item, role) {  const snapshot = (item && item.snapshot) || {};
  const optics = resolveStoneOptics(snapshot.stoneType, snapshot.stoneTypeHe);
  const cut = resolveCut(snapshot.shape, snapshot.shapeHe);
  const carat =
    typeof snapshot.caratWeight === 'number' && snapshot.caratWeight > 0
      ? snapshot.caratWeight
      : null;
  return {
    role,
    titleHe: snapshot.titleHe || snapshot.name || snapshot.title || null,
    stoneTypeHe: snapshot.stoneTypeHe || snapshot.stoneType || 'אבן',
    shapeHe: snapshot.shapeHe || snapshot.shape || null,
    caratWeight: carat,
    optics,
    cut,
    // English phrase used verbatim inside the geometry lock.
    renderEn: [
      carat ? `${carat} ct` : null,
      cut ? cut.en : null,
      optics.en,
    ]
      .filter(Boolean)
      .join(' '),
  };
}

export function buildManufacturingSpec({ designConfig, trayItems }) {
  const config = designConfig && typeof designConfig === 'object' ? designConfig : {};
  const items = Array.isArray(trayItems) ? trayItems : [];

  const centerItem = items[0] || null;
  const sideItems = items.slice(1);
  const centerStone = centerItem ? stoneFromTrayItem(centerItem, 'center') : null;
  const sideStones = sideItems.map((item) => stoneFromTrayItem(item, 'side'));

  const product = config.product || null;
  const rule = productRule(product);

  const metal = metalComponent(config.metalKey) || metalComponent(DEFAULT_METAL_KEY);
  const setting = settingComponent(config.settingKey) || settingComponent(DEFAULT_SETTING_KEY);

  const meleeKey = config.meleeKey || 'none';
  const melee = meleeComponent(meleeKey);
  const hasMelee = Boolean(melee && meleeKey !== 'none');
  const sizeKey = config.meleeSizeKey || null;
  const size = meleeSize(sizeKey);

  // A halo is a counted ring of stones. If the setting is a halo and the user
  // has not overridden the count, the halo's own stone count IS the count —
  // this is what stops the engine from inventing a second decorative row.
  const requestedCount = Number(config.meleeCount);
  const haloCount = setting && setting.supportsHalo ? setting.haloStoneCount || 0 : 0;
  const meleeCount = hasMelee
    ? Number.isFinite(requestedCount) && requestedCount > 0
      ? Math.round(requestedCount)
      : haloCount
    : 0;
  const meleeTotalCt = hasMelee ? meleeTotalCarat(sizeKey, meleeCount) : 0;

  const chain = rule.needsChain ? chainComponent(config.chainKey) : null;
  const bail = rule.needsBail ? bailComponent(config.bailKey) : null;
  const back = rule.needsBacks ? earringBackComponent(config.earringBackKey) : null;

  return {
    version: '11A.2',
    product,
    productEn: rule.en,
    pieceCount: rule.pieces,
    metal: metal
      ? {
          key: metal.key,
          sku: metal.sku,
          he: metal.he,
          renderEn: metal.renderEn,
          renderFinishEn: metal.renderFinishEn,
          alloy: metal.alloy,
          color: metal.color,
          purity: metal.purity,
          densityGCm3: metal.densityGCm3,
          rhodiumPlated: metal.rhodiumPlated,
        }
      : null,
    setting: setting
      ? {
          key: setting.key,
          sku: setting.sku,
          he: setting.he,
          renderEn: setting.renderEn,
          prongCount: setting.prongCount,
          surroundsCenter: setting.surroundsCenter,
          supportsHalo: setting.supportsHalo,
        }
      : null,
    centerStone,
    sideStones,
    melee: hasMelee
      ? {
          key: melee.key,
          sku: melee.sku,
          he: melee.he,
          origin: melee.origin,
          family: melee.family,
          renderEn: melee.renderEn,
          opticsKey: melee.opticsKey,
          count: meleeCount,
          sizeMm: size ? size.mm : null,
          caratEach: size ? size.caratEach : null,
          totalCarat: meleeTotalCt,
        }
      : null,
    chain: chain && chain.key !== 'noChain'
      ? { key: chain.key, sku: chain.sku, he: chain.he, renderEn: chain.renderEn, lengthCm: chain.defaultLengthCm }
      : null,
    bail: bail ? { key: bail.key, sku: bail.sku, he: bail.he, renderEn: bail.renderEn } : null,
    earringBack: back
      ? { key: back.key, sku: back.sku, he: back.he, renderEn: back.renderEn }
      : null,
  };
}

// ---------------------------------------------------------------------------
// 5. Hebrew summary (app-facing).
// ---------------------------------------------------------------------------

export function manufacturingSpecSummaryHe(spec) {
  if (!spec) return '';
  const parts = [];
  if (spec.metal) parts.push(spec.metal.he);
  if (spec.setting) parts.push(`שיבוץ ${spec.setting.he}`);
  if (spec.centerStone) {
    parts.push(
      [
        spec.centerStone.stoneTypeHe,
        spec.centerStone.shapeHe,
        spec.centerStone.caratWeight ? `${spec.centerStone.caratWeight} קראט` : null,
      ]
        .filter(Boolean)
        .join(' ')
    );
  }
  if (spec.melee) {
    parts.push(
      `${spec.melee.count} ${spec.melee.he}${spec.melee.sizeMm ? ` · ${spec.melee.sizeMm} מ״מ` : ''}`
    );
  }
  if (spec.chain) parts.push(spec.chain.he);
  if (spec.bail) parts.push(spec.bail.he);
  if (spec.earringBack) parts.push(`סגירת ${spec.earringBack.he}`);
  return parts.filter(Boolean).join(' · ');
}

// A compact, flat, filterable record for cataloging and later pricing.
export function specToCatalogFields(spec) {
  if (!spec) return {};
  return {
    productType: spec.product || null,
    metalKey: spec.metal ? spec.metal.key : null,
    metalHe: spec.metal ? spec.metal.he : null,
    metalSku: spec.metal ? spec.metal.sku : null,
    metalAlloy: spec.metal ? spec.metal.alloy : null,
    metalColor: spec.metal ? spec.metal.color : null,
    settingKey: spec.setting ? spec.setting.key : null,
    settingHe: spec.setting ? spec.setting.he : null,
    settingSku: spec.setting ? spec.setting.sku : null,
    prongCount: spec.setting ? spec.setting.prongCount : null,
    meleeKey: spec.melee ? spec.melee.key : null,
    meleeHe: spec.melee ? spec.melee.he : null,
    meleeSku: spec.melee ? spec.melee.sku : null,
    meleeOrigin: spec.melee ? spec.melee.origin : null,
    meleeCount: spec.melee ? spec.melee.count : 0,
    meleeSizeMm: spec.melee ? spec.melee.sizeMm : null,
    meleeTotalCarat: spec.melee ? spec.melee.totalCarat : 0,
    centerStoneTypeHe: spec.centerStone ? spec.centerStone.stoneTypeHe : null,
    centerStoneCutEn: spec.centerStone && spec.centerStone.cut ? spec.centerStone.cut.en : null,
    centerStoneCarat: spec.centerStone ? spec.centerStone.caratWeight : null,
    chainKey: spec.chain ? spec.chain.key : null,
    bailKey: spec.bail ? spec.bail.key : null,
    earringBackKey: spec.earringBack ? spec.earringBack.key : null,
  };
}

// ---------------------------------------------------------------------------
// 6. Geometry lock — the strict English render instruction.
// ---------------------------------------------------------------------------
// Written as a numbered, non-negotiable specification. Diffusion models
// follow explicit cardinal counts far more reliably than adjectives, so
// every count is stated as "exactly N" and every forbidden invention is
// stated positively here and negatively in the negative prompt.

const ASCII_LINE_RE = /^[\x20-\x7E]*$/;
const asciiOnly = (lines) => lines.filter((l) => typeof l === 'string' && l && ASCII_LINE_RE.test(l));

// "an oval brilliant cut", not "a oval brilliant cut".
function article(word) {
  return /^[aeiou]/i.test(String(word || '').trim()) ? 'an' : 'a';
}

export function buildGeometryPromptEn(spec) {
  if (!spec) return '';
  const lines = [];

  lines.push('MANUFACTURING SPECIFICATION - reproduce exactly, do not add or omit any element:');

  // Piece cardinality.
  if (spec.pieceCount === 2) {
    lines.push(
      `1. SUBJECT: exactly one matched pair of ${spec.productEn} - two mirror-identical pieces, nothing else in frame.`
    );
  } else {
    lines.push(`1. SUBJECT: exactly one single ${spec.productEn}, nothing else in frame.`);
  }

  // Metal.
  if (spec.metal) {
    lines.push(
      `2. METAL: the entire piece is made of ${spec.metal.renderEn} - ${spec.metal.renderFinishEn}. No other metal color anywhere in the piece.`
    );
  }

  // Center stone: cut, weight, material optics.
  if (spec.centerStone) {
    const stone = spec.centerStone;
    const cutText = stone.cut
      ? `${article(stone.cut.en)} ${stone.cut.en}${
          stone.cut.facets ? ` with its correct ${stone.cut.facets}-facet arrangement` : ''
        }`
      : 'its existing cut preserved exactly';
    lines.push(
      `3. CENTER STONE: exactly one center stone. It is ${stone.renderEn}. Cut: ${cutText}. Preserve the exact outline, proportions and facet pattern of this cut; do not substitute another shape.`
    );
    lines.push(
      `4. CENTER STONE MATERIAL: render true ${stone.optics.en} optics - ${stone.optics.opticsEn}. The material must be unmistakably ${stone.optics.en} and must not be rendered as any other gem material.`
    );
  } else if (spec.product === 'noStones') {
    lines.push('3. STONES: none. This is a metal-only piece with no gemstones anywhere.');
  }

  // Setting with exact prong count.
  if (spec.setting) {
    if (spec.setting.prongCount > 0) {
      lines.push(
        `5. SETTING: ${spec.setting.renderEn}. Exactly ${spec.setting.prongCount} prongs, evenly spaced, each prong physically seated over the stone girdle. Do not draw more or fewer prongs.`
      );
    } else {
      lines.push(`5. SETTING: ${spec.setting.renderEn}. No prongs anywhere on the center stone.`);
    }
  }

  // Melee with exact count.
  if (spec.melee) {
    const sizeText = spec.melee.sizeMm ? ` each ${spec.melee.sizeMm} mm` : '';
    lines.push(
      `6. ACCENT STONES: exactly ${spec.melee.count} ${spec.melee.renderEn}${sizeText}, uniform in size and evenly spaced. Total accent weight ${spec.melee.totalCarat} ct. Do not add any accent stone beyond these ${spec.melee.count}.`
    );
    if (spec.setting && spec.setting.supportsHalo) {
      lines.push(
        '7. HALO: a single continuous halo row only. Do not add a second halo row, hidden halo or additional pave anywhere on the piece.'
      );
    }
  } else if (spec.centerStone) {
    lines.push('6. ACCENT STONES: none. The center stone is the only stone on the piece.');
  }

  // Findings.
  const findings = [];
  if (spec.bail) findings.push(spec.bail.renderEn);
  if (spec.chain) {
    findings.push(
      `${spec.chain.renderEn}${spec.chain.lengthCm ? ` at ${spec.chain.lengthCm} cm` : ''}`
    );
  } else if (productNeedsChain(spec.product)) {
    findings.push('shown without any chain');
  }
  if (spec.earringBack) findings.push(spec.earringBack.renderEn);
  if (findings.length) {
    lines.push(`8. FINDINGS: ${findings.join('; ')}.`);
  }

  // Manufacturability.
  lines.push(
    '9. MANUFACTURABILITY: every element must be physically producible - correct metal thickness, prongs joined to the head, seated stones, closed bezels, no floating or unsupported parts.'
  );
  lines.push(
    '10. ACCURACY: this specification overrides any stylistic instruction below. Do not invent decorative elements, extra stones, engraving or texture that is not specified above.'
  );

  return asciiOnly(lines).join('\n');
}

// ---------------------------------------------------------------------------
// 7. Strict negative prompt.
// ---------------------------------------------------------------------------

export function buildStrictNegativePromptEn(spec, basePrompt) {
  const base = typeof basePrompt === 'string' && basePrompt ? basePrompt.split(', ') : [];
  const strict = [
    'extra gemstones not in the specification',
    'incorrect number of prongs',
    'incorrect number of accent stones',
    'second halo row',
    'unspecified pave or hidden halo',
    'changed stone cut or outline',
    'mixed metal colors',
    'floating or unsupported metal',
    'unmanufacturable geometry',
    'asymmetric mismatched pair',
    'invented engraving or texture',
    'gemstone rendered as the wrong material',
  ];
  if (spec && spec.centerStone && spec.centerStone.optics && spec.centerStone.optics.ri != null) {
    // Low-RI stones must not be given diamond fire; high-RI stones must not
    // be flattened into glass.
    if (spec.centerStone.optics.ri < 1.7) {
      strict.push('diamond-like fire on a low refractive index stone');
    } else {
      strict.push('dull glassy low-brilliance center stone');
    }
  }
  if (spec && spec.pieceCount === 2) {
    strict.push('single earring', 'three or more earrings');
  } else if (spec) {
    strict.push('duplicate copies of the piece');
  }
  const seen = new Set();
  return [...strict, ...base].filter((part) => {
    const value = typeof part === 'string' ? part.trim() : '';
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  }).join(', ');
}
