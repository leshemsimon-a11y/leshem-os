// lib/atelier/livingAtelier.js
//
// LESHEM.S OS — Clean 11A: Living Atelier configuration layer.
// Pure data + pure helpers only. No store, no network and no persistence key.
// Structured selections are mapped into the existing Design Brief fields; the
// exact visual-control state is encoded inside the EXISTING brief.notes field
// so a saved Atelier creation can reopen without changing protected stores.

export const ATELIER_PRODUCT_OPTIONS = Object.freeze([
  { key: 'pendant', he: 'תליון', hint: 'מסלול חי מומלץ', icon: 'pendant', featured: true },
  { key: 'ring', he: 'טבעת', hint: 'אבן מרכזית או מבנה פתוח', icon: 'ring', featured: true },
  { key: 'engagementRing', he: 'טבעת אירוסין', hint: 'סוליטר, הילה או שלוש אבנים', icon: 'engagementRing' },
  { key: 'weddingBand', he: 'טבעת נישואים', hint: 'עם או בלי אבנים', icon: 'weddingBand' },
  { key: 'earrings', he: 'עגילים', hint: 'זוג, תלויים או צמודים', icon: 'earrings', featured: true },
  { key: 'necklace', he: 'שרשרת', hint: 'מרכז, קלאסטר או רצף', icon: 'necklace' },
  { key: 'bracelet', he: 'צמיד', hint: 'טניס, מרכז או חוליות', icon: 'bracelet', featured: true },
  { key: 'matchingPiece', he: 'תכשיט משלים', hint: 'המשך לשפה קיימת', icon: 'matchingPiece' },
  { key: 'noStones', he: 'ללא אבנים', hint: 'מתכת, צורה וטקסטורה', icon: 'noStones' },
  { key: 'other', he: 'יצירה חופשית', hint: 'כיוון שאינו מוגדר מראש', icon: 'other' },
]);

export const ATELIER_STYLE_OPTIONS = Object.freeze([
  { key: 'modern', he: 'מודרני', hint: 'נקי ומדויק', featured: true },
  { key: 'delicate', he: 'עדין', hint: 'פרופורציות קלות', featured: true },
  { key: 'classic', he: 'קלאסי', hint: 'מאוזן ועל־זמני', featured: true },
  { key: 'minimal', he: 'מינימליסטי', hint: 'מעט חומר, הרבה דיוק', featured: true },
  { key: 'luxury', he: 'יוקרתי', hint: 'נוכחות וגימור עשיר', featured: true },
  { key: 'statement', he: 'נוכח', hint: 'חתימה חזותית ברורה' },
  { key: 'vintage', he: 'וינטג׳', hint: 'פרטים ומסורת' },
  { key: 'halo', he: 'הילה', hint: 'מסגרת אבנים מודגשת' },
  { key: 'solitaire', he: 'סוליטר', hint: 'האבן במרכז' },
  { key: 'threeStone', he: 'שלוש אבנים', hint: 'מרכז ושתי תמיכות' },
  { key: 'tennis', he: 'טניס', hint: 'רצף מדויק' },
  { key: 'cluster', he: 'קלאסטר', hint: 'קומפוזיציית אבנים' },
  { key: 'free', he: 'חופשי', hint: 'פתוח לפרשנות' },
]);

export const ATELIER_METAL_OPTIONS = Object.freeze([
  { key: 'whiteGold', he: 'זהב לבן', shortHe: 'לבן', swatch: 'white' },
  { key: 'yellowGold', he: 'זהב צהוב', shortHe: 'צהוב', swatch: 'yellow' },
  { key: 'roseGold', he: 'זהב ורוד', shortHe: 'ורוד', swatch: 'rose' },
  { key: 'platinum', he: 'פלטינה', shortHe: 'פלטינה', swatch: 'platinum' },
  { key: 'silver', he: 'כסף', shortHe: 'כסף', swatch: 'silver' },
]);

export const PENDANT_SETTING_OPTIONS = Object.freeze([
  { key: 'prong', he: 'שיניים', hint: 'אור ונוכחות לאבן' },
  { key: 'bezel', he: 'בזל', hint: 'מסגרת נקייה ומוגנת' },
  { key: 'halo', he: 'הילה', hint: 'עוצמה וזוהר מסביב' },
  { key: 'cluster', he: 'קלאסטר', hint: 'קומפוזיציה עשירה' },
]);

export const PENDANT_BAIL_OPTIONS = Object.freeze([
  { key: 'hidden', he: 'לולאה נסתרת', hint: 'מראה רציף ונקי' },
  { key: 'classic', he: 'לולאה קלאסית', hint: 'ברורה ופרקטית' },
  { key: 'integrated', he: 'משולבת בעיצוב', hint: 'חלק מהמבנה' },
  { key: 'side', he: 'חיבור צדדי', hint: 'תנועה וקו מודרני' },
]);

export const PENDANT_CHAIN_OPTIONS = Object.freeze([
  { key: 'fineCable', he: 'שרשרת עדינה', hint: 'קלה ונקייה' },
  { key: 'box', he: 'שרשרת קופסה', hint: 'מדויקת ויציבה' },
  { key: 'curb', he: 'גורמט עדין', hint: 'נוכחות רכה' },
  { key: 'noChain', he: 'ללא שרשרת', hint: 'תליון בלבד' },
]);

export const ATELIER_SLIDERS = Object.freeze([
  { key: 'presence', he: 'נוכחות', minHe: 'עדין', maxHe: 'בולט' },
  { key: 'modernity', he: 'שפה', minHe: 'קלאסי', maxHe: 'מודרני' },
  { key: 'richness', he: 'עושר', minHe: 'מינימלי', maxHe: 'עשיר' },
  { key: 'stoneFocus', he: 'מוקד', minHe: 'עיצוב מאוזן', maxHe: 'האבן מובילה' },
]);

const DEFAULT_SLIDERS = Object.freeze({
  presence: 34,
  modernity: 72,
  richness: 28,
  stoneFocus: 86,
});

export function createDefaultDesignConfig() {
  return {
    product: null,
    style: null,
    metalPreference: null,
    setting: 'prong',
    bail: 'hidden',
    chain: 'fineCable',
    sliders: { ...DEFAULT_SLIDERS },
  };
}

const PRODUCT_KEYS = new Set(ATELIER_PRODUCT_OPTIONS.map((x) => x.key));
const STYLE_KEYS = new Set(ATELIER_STYLE_OPTIONS.map((x) => x.key));
const METAL_KEYS = new Set(ATELIER_METAL_OPTIONS.map((x) => x.key));
const SETTING_KEYS = new Set(PENDANT_SETTING_OPTIONS.map((x) => x.key));
const BAIL_KEYS = new Set(PENDANT_BAIL_OPTIONS.map((x) => x.key));
const CHAIN_KEYS = new Set(PENDANT_CHAIN_OPTIONS.map((x) => x.key));

function clamp(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function normalizeDesignConfig(raw) {
  const fallback = createDefaultDesignConfig();
  const value = raw && typeof raw === 'object' ? raw : {};
  const sliders = value.sliders && typeof value.sliders === 'object' ? value.sliders : {};
  return {
    product: value.product == null ? null : PRODUCT_KEYS.has(value.product) ? value.product : fallback.product,
    style: value.style == null ? null : STYLE_KEYS.has(value.style) ? value.style : fallback.style,
    metalPreference:
      value.metalPreference == null
        ? null
        : METAL_KEYS.has(value.metalPreference)
        ? value.metalPreference
        : fallback.metalPreference,
    setting: SETTING_KEYS.has(value.setting) ? value.setting : fallback.setting,
    bail: BAIL_KEYS.has(value.bail) ? value.bail : fallback.bail,
    chain: CHAIN_KEYS.has(value.chain) ? value.chain : fallback.chain,
    sliders: {
      presence: clamp(sliders.presence, fallback.sliders.presence),
      modernity: clamp(sliders.modernity, fallback.sliders.modernity),
      richness: clamp(sliders.richness, fallback.sliders.richness),
      stoneFocus: clamp(sliders.stoneFocus, fallback.sliders.stoneFocus),
    },
  };
}

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
  return byKey(ATELIER_METAL_OPTIONS, key);
}

export function settingOption(key) {
  return byKey(PENDANT_SETTING_OPTIONS, key);
}

export function bailOption(key) {
  return byKey(PENDANT_BAIL_OPTIONS, key);
}

export function chainOption(key) {
  return byKey(PENDANT_CHAIN_OPTIONS, key);
}

function level(value, low, mid, high) {
  if (value <= 34) return low;
  if (value >= 67) return high;
  return mid;
}

export function designConfigSummaryHe(raw) {
  const config = normalizeDesignConfig(raw);
  const product = productOption(config.product);
  const style = styleOption(config.style);
  const metal = metalOption(config.metalPreference);
  const parts = [
    product ? product.he : null,
    style ? `בסגנון ${style.he}` : null,
    metal ? `ב${metal.he}` : null,
  ].filter(Boolean);

  const detailParts = [];
  if (config.product === 'pendant') {
    const setting = settingOption(config.setting);
    const bail = bailOption(config.bail);
    const chain = chainOption(config.chain);
    if (setting) detailParts.push(`שיבוץ ${setting.he}`);
    if (bail) detailParts.push(bail.he);
    if (chain) detailParts.push(chain.he);
  }
  detailParts.push(
    level(config.sliders.presence, 'נוכחות עדינה', 'נוכחות מאוזנת', 'נוכחות בולטת'),
    level(config.sliders.richness, 'מראה מינימלי', 'רמת פירוט מאוזנת', 'מראה עשיר'),
    level(config.sliders.stoneFocus, 'העיצוב והאבן מאוזנים', 'האבן מובילה', 'האבן היא המוקד המובהק')
  );
  return `${parts.join(' ')}. ${detailParts.filter(Boolean).join(' · ')}.`;
}

export function designConfigPromptEn(raw) {
  const config = normalizeDesignConfig(raw);
  const settingEn = {
    prong: 'refined secure prong setting with minimal visible metal',
    bezel: 'precise slim bezel setting with a clean protective rim',
    halo: 'fine diamond halo surrounding the center gemstone',
    cluster: 'balanced production-feasible cluster composition',
  }[config.setting];
  const bailEn = {
    hidden: 'concealed bail integrated behind the pendant',
    classic: 'refined classic bail above the pendant',
    integrated: 'bail integrated into the pendant architecture',
    side: 'subtle side connection for a contemporary suspended composition',
  }[config.bail];
  const chainEn = {
    fineCable: 'fine delicate cable chain',
    box: 'fine box chain',
    curb: 'fine curb chain',
    noChain: 'pendant shown without a chain',
  }[config.chain];
  const phrases = [];
  if (config.product === 'pendant') phrases.push(settingEn, bailEn, chainEn);
  phrases.push(
    level(
      config.sliders.presence,
      'subtle lightweight presence',
      'balanced refined presence',
      'confident statement presence'
    ),
    level(
      config.sliders.modernity,
      'timeless classic design language',
      'contemporary timeless design language',
      'clean modern architectural design language'
    ),
    level(
      config.sliders.richness,
      'minimal restrained detailing',
      'measured premium detailing',
      'rich but controlled luxury detailing'
    ),
    level(
      config.sliders.stoneFocus,
      'balanced relationship between gemstone and metal form',
      'gemstone-led composition',
      'center gemstone remains the unmistakable focal point'
    )
  );
  return phrases.filter(Boolean).join(', ');
}

export function freedomLevelFromConfig(raw) {
  const config = normalizeDesignConfig(raw);
  const value = config.sliders.modernity + config.sliders.richness;
  if (value >= 165) return 'exploratory';
  if (value >= 125) return 'creative';
  if (config.sliders.stoneFocus >= 88 && config.sliders.richness <= 25) return 'locked';
  return 'guided';
}

const CONFIG_PREFIX = '[[LESHEMS_ATELIER_11A:';
const CONFIG_SUFFIX = ']]';
const CONFIG_RE = /\n?\[\[LESHEMS_ATELIER_11A:([^\]]+)\]\]/g;

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
  const match = text.match(/\[\[LESHEMS_ATELIER_11A:([^\]]+)\]\]/);
  if (!match) return createDefaultDesignConfig();
  try {
    return normalizeDesignConfig(JSON.parse(decodeURIComponent(match[1])));
  } catch (e) {
    return createDefaultDesignConfig();
  }
}

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
