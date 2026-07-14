// lib/studio/renderPrep.js
//
// LESHEM.S OS — Clean 9A: Render Preparation — pure helpers.
//
// PURE, deterministic, local logic only. NO store, NO persistence, NO
// network, NO external render engine, NO pricing/credits (the existing
// lib/studio/renderSceneLibrary.js mixes scene picking with credit-cost
// estimation for the legacy Render Studio panel — deliberately NOT reused
// here, to keep this flagship stage completely free of pricing per this
// milestone's constraints). This is render PREPARATION only: a small set of
// presets the person picks, turned into a plain-text brief + prompt line.

export const RENDER_SCENE = Object.freeze({
  CATALOG_WHITE: 'catalogWhite',
  DARK_LUXURY: 'darkLuxury',
  HAND_SHOT: 'handShot',
  MODEL_LIFESTYLE: 'modelLifestyle',
  BOX_TRAY: 'boxTray',
  MACRO_STONE: 'macroStone',
});

export const SCENE_PRESETS = Object.freeze([
  {
    key: RENDER_SCENE.CATALOG_WHITE,
    he: 'קטלוג לבן',
    en: 'clean white catalog background, professional product photography',
  },
  {
    key: RENDER_SCENE.DARK_LUXURY,
    he: 'יוקרתי כהה',
    en: 'dark graphite luxury studio background, premium editorial styling',
  },
  {
    key: RENDER_SCENE.HAND_SHOT,
    he: 'על יד',
    en: 'worn on a natural hand, realistic scale and soft studio lighting',
  },
  {
    key: RENDER_SCENE.MODEL_LIFESTYLE,
    he: 'דוגמנית / לייף-סטייל',
    en: 'lifestyle photograph on a model, elegant natural pose',
  },
  {
    key: RENDER_SCENE.BOX_TRAY,
    he: 'קופסה / מגש הצגה',
    en: 'presented in an elegant jewelry box or display tray',
  },
  {
    key: RENDER_SCENE.MACRO_STONE,
    he: 'מאקרו על האבן',
    en: 'extreme macro close-up on the center stone, crisp facet detail',
  },
]);

export const RENDER_ANGLE = Object.freeze({
  FRONT: 'front',
  THREE_QUARTER: 'threeQuarter',
  TOP: 'top',
  SIDE: 'side',
  MACRO: 'macro',
});

export const ANGLE_PRESETS = Object.freeze([
  { key: RENDER_ANGLE.FRONT, he: 'פרונטלי', en: 'front-facing composition' },
  { key: RENDER_ANGLE.THREE_QUARTER, he: '3/4', en: 'three-quarter angle composition' },
  { key: RENDER_ANGLE.TOP, he: 'מלמעלה', en: 'top-down composition' },
  { key: RENDER_ANGLE.SIDE, he: 'צד', en: 'side profile composition' },
  { key: RENDER_ANGLE.MACRO, he: 'מאקרו', en: 'extreme close-up composition' },
]);

export const RENDER_FORMAT = Object.freeze({
  SQUARE: 'square',
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape',
  STORY: 'story',
});

export const FORMAT_PRESETS = Object.freeze([
  { key: RENDER_FORMAT.SQUARE, he: 'ריבוע', aspectRatio: '1:1' },
  { key: RENDER_FORMAT.PORTRAIT, he: 'לאורך', aspectRatio: '4:5' },
  { key: RENDER_FORMAT.LANDSCAPE, he: 'לרוחב', aspectRatio: '16:9' },
  { key: RENDER_FORMAT.STORY, he: 'סטורי', aspectRatio: '9:16' },
]);

export const OUTPUT_COUNT_OPTIONS = Object.freeze([1, 3, 6]);
export const DEFAULT_OUTPUT_COUNT = 3;

export const CREATIVITY_LEVEL = Object.freeze({
  PRECISE: 'precise',
  BALANCED: 'balanced',
  CREATIVE: 'creative',
  FREE: 'free',
});

export const CREATIVITY_LEVELS = Object.freeze([
  { key: CREATIVITY_LEVEL.PRECISE, he: 'מדויק', en: 'strict adherence to the brief, minimal deviation' },
  { key: CREATIVITY_LEVEL.BALANCED, he: 'מאוזן', en: 'balanced interpretation of the brief' },
  { key: CREATIVITY_LEVEL.CREATIVE, he: 'יצירתי', en: 'creative interpretation with room for surprise' },
  { key: CREATIVITY_LEVEL.FREE, he: 'חופשי', en: 'open, free interpretation of the brief' },
]);

function findByKey(list, key) {
  return list.find((o) => o.key === key) || null;
}

export function scenePresetHe(key) {
  const o = findByKey(SCENE_PRESETS, key);
  return o ? o.he : null;
}
export function anglePresetHe(key) {
  const o = findByKey(ANGLE_PRESETS, key);
  return o ? o.he : null;
}
export function formatPresetHe(key) {
  const o = findByKey(FORMAT_PRESETS, key);
  return o ? o.he : null;
}
export function creativityLevelHe(key) {
  const o = findByKey(CREATIVITY_LEVELS, key);
  return o ? o.he : null;
}

// Default selection — deterministic, no store, no random choice.
export function defaultRenderPrepSelection(inferredCreativity) {
  return {
    sceneKey: RENDER_SCENE.CATALOG_WHITE,
    angleKey: RENDER_ANGLE.THREE_QUARTER,
    formatKey: RENDER_FORMAT.SQUARE,
    outputCount: DEFAULT_OUTPUT_COUNT,
    creativityLevel:
      inferredCreativity && findByKey(CREATIVITY_LEVELS, inferredCreativity)
        ? inferredCreativity
        : CREATIVITY_LEVEL.BALANCED,
  };
}

// Hebrew line for the render brief (professional summary) — plain text only.
export function buildRenderPrepLineHe(selection) {
  const s = selection || {};
  const parts = [
    scenePresetHe(s.sceneKey),
    anglePresetHe(s.angleKey),
    formatPresetHe(s.formatKey),
    s.outputCount ? `${s.outputCount} תוצרים` : null,
    creativityLevelHe(s.creativityLevel),
  ].filter(Boolean);
  return parts.length ? `הכנה להדמיה: ${parts.join(' · ')}` : '';
}

// English ASCII-only line for the media prompt.
export function buildRenderPrepLineEn(selection) {
  const s = selection || {};
  const scene = findByKey(SCENE_PRESETS, s.sceneKey);
  const angle = findByKey(ANGLE_PRESETS, s.angleKey);
  const format = findByKey(FORMAT_PRESETS, s.formatKey);
  const creativity = findByKey(CREATIVITY_LEVELS, s.creativityLevel);
  const parts = [
    scene ? scene.en : null,
    angle ? angle.en : null,
    format ? `${format.aspectRatio} aspect ratio` : null,
    creativity ? creativity.en : null,
  ].filter(Boolean);
  return parts.length ? `${parts.join(', ')}.` : '';
}
