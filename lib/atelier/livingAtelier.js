// lib/atelier/livingAtelier.js
//
// LESHEM.S OS — Clean 11A.2: Atelier configuration layer.
// Pure data + pure helpers only. No store, no network and no persistence key.
//
// WHAT CHANGED IN 11A.2
// The four abstract design sliders (presence / modernity / richness /
// stoneFocus) are GONE. They asked the client to tune an AI, not to choose a
// piece of jewelry. Every design decision is now a real component out of
// lib/atelier/componentsBank.js: an alloy, a setting head, a melee parcel, a
// chain, a bail, a back.
//
// Structured selections are still mapped into the existing Design Brief
// fields, and the exact control state is still encoded inside the EXISTING
// brief.notes field — normalizeBrief() in lib/studio/designDraft.js
// whitelists brief keys, so a new brief field would be silently dropped.
// No protected store changes; no new persistence key.

import {
  METALS,
  METAL_ALLOY_OPTIONS,
  METAL_COLOR_OPTIONS,
  MELEE_TYPES,
  MELEE_SIZES,
  SETTING_TYPES,
  CHAIN_TYPES,
  EARRING_BACKS,
  BAIL_TYPES,
  metalComponent,
  meleeComponent,
  meleeSize,
  settingComponent,
  chainComponent,
  earringBackComponent,
  bailComponent,
  findMetal,
  legacyMetalPreferenceFor,
  meleeTotalCarat,
  DEFAULT_METAL_KEY,
  DEFAULT_SETTING_KEY,
  DEFAULT_MELEE_TYPE_KEY,
  DEFAULT_MELEE_SIZE_KEY,
  DEFAULT_CHAIN_KEY,
  DEFAULT_BAIL_KEY,
  DEFAULT_EARRING_BACK_KEY,
} from './componentsBank';
import { productNeedsBail, productNeedsChain, productNeedsBacks } from './manufacturingSpec';

export const ATELIER_PRODUCT_OPTIONS = Object.freeze([
  { key: 'pendant', he: 'תליון', hint: 'אבן מרכזית ולולאה', icon: 'pendant', featured: true },
  { key: 'ring', he: 'טבעת', hint: 'אבן מרכזית או מבנה פתוח', icon: 'ring', featured: true },
  { key: 'engagementRing', he: 'טבעת אירוסין', hint: 'סוליטר, הילה או שלוש אבנים', icon: 'engagementRing', featured: true },
  { key: 'earrings', he: 'עגילים', hint: 'זוג תואם', icon: 'earrings', featured: true },
  { key: 'weddingBand', he: 'טבעת נישואים', hint: 'עם או בלי אבנים', icon: 'weddingBand' },
  { key: 'necklace', he: 'שרשרת', hint: 'מרכז, קלאסטר או רצף', icon: 'necklace' },
  { key: 'bracelet', he: 'צמיד', hint: 'טניס, מרכז או חוליות', icon: 'bracelet' },
  { key: 'matchingPiece', he: 'תכשיט משלים', hint: 'המשך לשפה קיימת', icon: 'matchingPiece' },
  { key: 'noStones', he: 'ללא אבנים', hint: 'מתכת, צורה וטקסטורה', icon: 'noStones' },
  { key: 'other', he: 'יצירה חופשית', hint: 'כיוון שאינו מוגדר מראש', icon: 'other' },
]);

export const ATELIER_STYLE_OPTIONS = Object.freeze([
  { key: 'classic', he: 'קלאסי', hint: 'מאוזן ועל־זמני', featured: true },
  { key: 'modern', he: 'מודרני', hint: 'נקי ומדויק', featured: true },
  { key: 'delicate', he: 'עדין', hint: 'פרופורציות קלות', featured: true },
  { key: 'minimal', he: 'מינימליסטי', hint: 'מעט חומר, הרבה דיוק', featured: true },
  { key: 'luxury', he: 'יוקרתי', hint: 'נוכחות וגימור עשיר', featured: true },
  { key: 'vintage', he: 'וינטג׳', hint: 'פרטים ומסורת' },
  { key: 'statement', he: 'נוכח', hint: 'חתימה חזותית ברורה' },
  { key: 'solitaire', he: 'סוליטר', hint: 'האבן במרכז' },
  { key: 'threeStone', he: 'שלוש אבנים', hint: 'מרכז ושתי תמיכות' },
  { key: 'halo', he: 'הילה', hint: 'מסגרת אבנים מודגשת' },
  { key: 'tennis', he: 'טניס', hint: 'רצף מדויק' },
  { key: 'cluster', he: 'קלאסטר', hint: 'קומפוזיציית אבנים' },
  { key: 'free', he: 'חופשי', hint: 'פתוח לפרשנות' },
]);

// Re-exported so the palette imports one module.
export {
  METALS,
  METAL_ALLOY_OPTIONS,
  METAL_COLOR_OPTIONS,
  MELEE_TYPES,
  MELEE_SIZES,
  SETTING_TYPES,
  CHAIN_TYPES,
  EARRING_BACKS,
  BAIL_TYPES,
};

// ---------------------------------------------------------------------------
// Config shape
// ---------------------------------------------------------------------------

export function createDefaultDesignConfig() {
  return {
    product: null,
    style: null,
    // Components Bank selections — every one is a real orderable component.
    metalKey: DEFAULT_METAL_KEY,
    settingKey: DEFAULT_SETTING_KEY,
    meleeKey: DEFAULT_MELEE_TYPE_KEY,
    meleeSizeKey: DEFAULT_MELEE_SIZE_KEY,
    meleeCount: 0,
    chainKey: DEFAULT_CHAIN_KEY,
    bailKey: DEFAULT_BAIL_KEY,
    earringBackKey: DEFAULT_EARRING_BACK_KEY,
  };
}

const PRODUCT_KEYS = new Set(ATELIER_PRODUCT_OPTIONS.map((x) => x.key));
const STYLE_KEYS = new Set(ATELIER_STYLE_OPTIONS.map((x) => x.key));

// --- 11A.1 -> 11A.2 migration ----------------------------------------------
// Saved creations carry the old vocabulary. Map it forward so a reopened
// Work File lands on a real component instead of falling back to defaults.
const LEGACY_METAL_TO_KEY = {
  whiteGold: 'gold18kWhite',
  yellowGold: 'gold18kYellow',
  roseGold: 'gold18kRose',
  platinum: 'platinum950',
  silver: 'gold18kWhite', // silver is not a production metal in this bank
};

const LEGACY_SETTING_TO_KEY = {
  prong: 'prong4',
  bezel: 'bezel',
  halo: 'halo',
  cluster: 'halo',
};

const LEGACY_BAIL_TO_KEY = {
  hidden: 'hidden',
  classic: 'vBail',
  integrated: 'hidden',
  side: 'vBail',
};

const LEGACY_CHAIN_TO_KEY = {
  fineCable: 'cable',
  box: 'box',
  curb: 'cable',
  noChain: 'noChain',
};

function pick(resolver, value, fallback) {
  return resolver(value) ? value : fallback;
}

export function normalizeDesignConfig(raw) {
  const fallback = createDefaultDesignConfig();
  const value = raw && typeof raw === 'object' ? raw : {};

  const product = value.product == null || !PRODUCT_KEYS.has(value.product) ? null : value.product;
  const style = value.style == null || !STYLE_KEYS.has(value.style) ? null : value.style;

  // Metal: prefer an explicit bank key, then a legacy metalPreference.
  const metalKey =
    (metalComponent(value.metalKey) && value.metalKey) ||
    LEGACY_METAL_TO_KEY[value.metalPreference] ||
    fallback.metalKey;

  const settingKey =
    (settingComponent(value.settingKey) && value.settingKey) ||
    LEGACY_SETTING_TO_KEY[value.setting] ||
    fallback.settingKey;

  const bailKey =
    (bailComponent(value.bailKey) && value.bailKey) ||
    LEGACY_BAIL_TO_KEY[value.bail] ||
    fallback.bailKey;

  const chainKey =
    (chainComponent(value.chainKey) && value.chainKey) ||
    LEGACY_CHAIN_TO_KEY[value.chain] ||
    fallback.chainKey;

  const meleeKey = pick((v) => Boolean(meleeComponent(v)), value.meleeKey, fallback.meleeKey);
  const meleeSizeKey = pick((v) => Boolean(meleeSize(v)), value.meleeSizeKey, fallback.meleeSizeKey);
  const earringBackKey = pick(
    (v) => Boolean(earringBackComponent(v)),
    value.earringBackKey,
    fallback.earringBackKey
  );

  // Melee count: 0 when no melee is selected; otherwise a sane whole number.
  const setting = settingComponent(settingKey);
  const rawCount = Number(value.meleeCount);
  let meleeCount = 0;
  if (meleeKey && meleeKey !== 'none') {
    if (Number.isFinite(rawCount) && rawCount > 0) {
      meleeCount = Math.min(300, Math.round(rawCount));
    } else if (setting && setting.supportsHalo) {
      meleeCount = setting.haloStoneCount || 0;
    }
  }

  return {
    product,
    style,
    metalKey,
    settingKey,
    meleeKey,
    meleeSizeKey,
    meleeCount,
    chainKey,
    bailKey,
    earringBackKey,
  };
}

// The legacy brief field the existing schema still validates.
export function metalPreferenceFromConfig(config) {
  return legacyMetalPreferenceFor(normalizeDesignConfig(config).metalKey);
}

// ---------------------------------------------------------------------------
// Option lookups used by the screens
// ---------------------------------------------------------------------------

function byKey(list, key) {
  return list.find((x) => x.key === key) || null;
}

export function productOption(key) {
  return byKey(ATELIER_PRODUCT_OPTIONS, key);
}
export function styleOption(key) {
  return byKey(ATELIER_STYLE_OPTIONS, key);
}
export function metalOption(key) {
  return metalComponent(key);
}
export function settingOption(key) {
  return settingComponent(key);
}
export function bailOption(key) {
  return bailComponent(key);
}
export function chainOption(key) {
  return chainComponent(key);
}
export function meleeOption(key) {
  return meleeComponent(key);
}
export function meleeSizeOption(key) {
  return meleeSize(key);
}
export function earringBackOption(key) {
  return earringBackComponent(key);
}

export function metalForSelection(alloy, color) {
  return findMetal(alloy, color);
}

// Which component groups a given product actually needs. Drives the palette
// so a ring never asks about earring backs.
export function componentGroupsFor(productKey) {
  return {
    setting: productKey !== 'noStones',
    melee: productKey !== 'noStones',
    chain: productNeedsChain(productKey),
    bail: productNeedsBail(productKey),
    back: productNeedsBacks(productKey),
  };
}

// ---------------------------------------------------------------------------
// Hebrew summary + English design phrases
// ---------------------------------------------------------------------------

export function designConfigSummaryHe(raw) {
  const config = normalizeDesignConfig(raw);
  const product = productOption(config.product);
  const style = styleOption(config.style);
  const metal = metalComponent(config.metalKey);
  const groups = componentGroupsFor(config.product);

  const headline = [product ? product.he : null, style ? `בסגנון ${style.he}` : null]
    .filter(Boolean)
    .join(' ');

  const details = [];
  if (metal) details.push(metal.he);
  if (groups.setting) {
    const setting = settingComponent(config.settingKey);
    if (setting) details.push(`שיבוץ ${setting.he}`);
  }
  if (groups.melee && config.meleeKey !== 'none' && config.meleeCount > 0) {
    const melee = meleeComponent(config.meleeKey);
    const size = meleeSize(config.meleeSizeKey);
    const total = meleeTotalCarat(config.meleeSizeKey, config.meleeCount);
    if (melee) {
      details.push(
        `${config.meleeCount} ${melee.he}${size ? ` ${size.mm} מ״מ` : ''}${total ? ` (${total} ct)` : ''}`
      );
    }
  }
  if (groups.bail) {
    const bail = bailComponent(config.bailKey);
    if (bail) details.push(bail.he);
  }
  if (groups.chain) {
    const chain = chainComponent(config.chainKey);
    if (chain && chain.key !== 'noChain') details.push(chain.he);
    else if (chain) details.push('ללא שרשרת');
  }
  if (groups.back) {
    const back = earringBackComponent(config.earringBackKey);
    if (back) details.push(`סגירת ${back.he}`);
  }

  if (!headline && !details.length) return '';
  return `${headline}${headline ? '. ' : ''}${details.join(' · ')}.`;
}

// Short English component phrase folded into each generated direction, so a
// direction never contradicts the chosen components. The strict geometry
// lock lives in manufacturingSpec.js and is applied at render time.
export function designConfigPromptEn(raw) {
  const config = normalizeDesignConfig(raw);
  const groups = componentGroupsFor(config.product);
  const phrases = [];
  const metal = metalComponent(config.metalKey);
  if (metal) phrases.push(metal.renderEn);
  if (groups.setting) {
    const setting = settingComponent(config.settingKey);
    if (setting) phrases.push(setting.renderEn);
  }
  if (groups.melee && config.meleeKey !== 'none' && config.meleeCount > 0) {
    const melee = meleeComponent(config.meleeKey);
    if (melee && melee.renderEn) {
      phrases.push(`exactly ${config.meleeCount} ${melee.renderEn}`);
    }
  }
  if (groups.bail) {
    const bail = bailComponent(config.bailKey);
    if (bail) phrases.push(bail.renderEn);
  }
  if (groups.chain) {
    const chain = chainComponent(config.chainKey);
    if (chain && chain.renderEn) phrases.push(chain.renderEn);
  }
  if (groups.back) {
    const back = earringBackComponent(config.earringBackKey);
    if (back) phrases.push(back.renderEn);
  }
  return phrases.filter(Boolean).join(', ');
}

// With a full component specification the render must follow the spec, not
// reinterpret it. Freedom is only granted while the spec is incomplete.
export function freedomLevelFromConfig(raw) {
  const config = normalizeDesignConfig(raw);
  const groups = componentGroupsFor(config.product);
  const specified =
    Boolean(config.product) &&
    Boolean(metalComponent(config.metalKey)) &&
    (!groups.setting || Boolean(settingComponent(config.settingKey)));
  return specified ? 'locked' : 'guided';
}

// ---------------------------------------------------------------------------
// Encoded config inside the EXISTING brief.notes field
// ---------------------------------------------------------------------------

const CONFIG_PREFIX = '[[LESHEMS_ATELIER_11A2:';
const CONFIG_SUFFIX = ']]';
// Strips both the 11A.2 marker and the earlier 11A marker.
const CONFIG_RE = /\n?\[\[LESHEMS_ATELIER_11A2?:([^\]]+)\]\]/g;

export function stripEncodedConfig(notes) {
  return String(notes || '').replace(CONFIG_RE, '').trim();
}

export function encodeConfigInNotes(notes, raw) {
  const clean = stripEncodedConfig(notes);
  const payload = encodeURIComponent(JSON.stringify(normalizeDesignConfig(raw)));
  return `${clean}${clean ? '\n' : ''}${CONFIG_PREFIX}${payload}${CONFIG_SUFFIX}`;
}

export function decodeConfigFromNotes(notes) {
  const text = String(notes || '');
  // Prefer a 11A.2 payload; fall back to a 11A.1 payload and migrate it.
  const match =
    text.match(/\[\[LESHEMS_ATELIER_11A2:([^\]]+)\]\]/) ||
    text.match(/\[\[LESHEMS_ATELIER_11A:([^\]]+)\]\]/);
  if (!match) return createDefaultDesignConfig();
  try {
    return normalizeDesignConfig(JSON.parse(decodeURIComponent(match[1])));
  } catch (e) {
    return createDefaultDesignConfig();
  }
}

// ---------------------------------------------------------------------------
// Render presentation helpers (photography, not engine tuning)
// ---------------------------------------------------------------------------

export function renderPresetFromConfig(renderConfig) {
  const scene = renderConfig && renderConfig.scene;
  if (scene === 'client') return 'presentation';
  if (scene === 'macro') return 'macro';
  if (scene === 'editorial') return 'creative';
  return 'catalog';
}

export function aspectRatioFromFormat(format) {
  if (format === 'portrait') return '4:5';
  if (format === 'landscape') return '16:9';
  return '1:1';
}
