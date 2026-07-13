// lib/studio/jewelryAdvisor.js
//
// LESHEM.S OS — Clean 8K: Human Jewelry Intelligence + Visual Workspace
// Consolidation.
//
// PURE, deterministic, local logic only. Builds the compact 3-section
// Advisor insight — "מה הבנתי" / "המלצת המעצב" / "הצעד הבא" — from data the
// Design Studio already holds (tray items, brief, concepts, selected
// concept, output). NO AI API, NO network call, NO randomness: the exact
// same inputs always produce the exact same insight.
//
// This does not duplicate business rules that already exist elsewhere — it
// reads the SAME primitives (hasStones, hasConcepts, conceptsStale,
// selected, output, outStale) the Design Studio shell already computes for
// its own primary-action button, and phrases them in the advisor's voice.

import { CONCEPT_HE, BRIEF_HE } from './labels';
import { DESIGN_ROLE, normalizeRole, trayItemTitle } from './designDraft';
import { stonesFeedbackHe, metalFeedbackHe, directionsFeedbackHe } from './humanTerms';

function centerStoneTitle(trayItems) {
  const items = Array.isArray(trayItems) ? trayItems : [];
  const center = items.find((it) => normalizeRole(it.role) === DESIGN_ROLE.CENTER_STONE);
  return center ? trayItemTitle(center) : null;
}

// ---------------------------------------------------------------------------
// "מה הבנתי" — a short summary of the current design intent. Degrades
// gracefully as fields are filled in; never invents facts not present in
// the brief/tray.
// ---------------------------------------------------------------------------
function buildUnderstanding({ trayItems, brief }) {
  const productHe =
    (brief.productType && CONCEPT_HE.productType && CONCEPT_HE.productType[brief.productType]) ||
    null;
  const styleHe = (brief.styleDirection && BRIEF_HE.style && BRIEF_HE.style[brief.styleDirection]) || null;
  const center = centerStoneTitle(trayItems);
  const stoneCount = Array.isArray(trayItems) ? trayItems.length : 0;

  if (!productHe && !styleHe && !center && stoneCount === 0) {
    return 'עדיין מדובר ביצירה כללית — נוסיף אבנים או פרטי עיצוב כדי לחדד את הכיוון.';
  }

  const productPhrase = [styleHe, productHe].filter(Boolean).join(' ') || 'תכשיט';
  if (center && stoneCount > 1) {
    return `המטרה היא ${productPhrase} שבה ${center} מוביל, לצד ${stoneCount - 1} אבנים נוספות.`;
  }
  if (center) {
    return `המטרה היא ${productPhrase} שבה ${center} מוביל.`;
  }
  if (stoneCount > 0) {
    return `המטרה היא ${productPhrase} סביב ${stoneCount === 1 ? 'האבן שנבחרה' : `${stoneCount} האבנים שנבחרו`}.`;
  }
  return `המטרה היא ${productPhrase}, עדיין ללא אבנים שנבחרו.`;
}

// ---------------------------------------------------------------------------
// "המלצת המעצב" — one useful professional suggestion, chosen by a small
// deterministic priority list. Only ever reflects existing Work File
// context — never invents a stone, metal, or direction that isn't there.
// ---------------------------------------------------------------------------
function buildRecommendation({ trayItems, brief, hasConcepts, selected }) {
  const stoneCount = Array.isArray(trayItems) ? trayItems.length : 0;
  const metalHe = (brief.metalPreference && BRIEF_HE.metal && BRIEF_HE.metal[brief.metalPreference]) || null;

  if (stoneCount > 1 && !metalHe) {
    return 'כדאי לשמור על מתכת עדינה כדי לא להכביד על הקומפוזיציה, גם אם עוד לא נבחרה מתכת סופית.';
  }
  if (stoneCount > 1) {
    return 'כדאי לשמור על מתכת עדינה כדי לא להכביד על הקומפוזיציה.';
  }
  if (!metalHe) {
    return 'עדיין לא בחרנו מתכת. אפשר להמשיך ולדייק אותה בהמשך, כשהכיוון יתבהר.';
  }
  if (!hasConcepts) {
    return 'כדאי להפיק כמה כיווני עיצוב כדי לראות אפשרויות שונות לתכשיט.';
  }
  if (!selected) {
    return 'כדאי להשוות בין הכיוונים לפי היתכנות הייצור וההתאמה לאבן המרכזית.';
  }
  return 'הכיוון הנבחר מוכן להמשך — אפשר להתקדם להכנת ערכת ההצגה או תוכנית ההדמיה.';
}

// ---------------------------------------------------------------------------
// "הצעד הבא" — one recommended next action, mirroring the SAME decision
// order the Design Studio shell already uses for its own single dominant
// primary action (hasStones/hasConcepts/conceptsStale/selected/output),
// so the advisor never contradicts the button the user already sees.
// `target` is a step key the caller can route to (setActiveStep), or null
// when no navigation is implied.
// ---------------------------------------------------------------------------
function buildNextStep({ hasStones, hasConcepts, conceptsStale, selected, output, outStale }) {
  if (!hasStones && !hasConcepts) {
    return { text: 'הצעד הבא: נוסיף אבנים או נבחר להתחיל ממתכת בלבד.', target: null };
  }
  if (!hasConcepts) {
    return { text: 'הצעד הבא: נבחן שלושה כיוונים שמדגישים את האבן המרכזית.', target: 'design' };
  }
  if (conceptsStale) {
    return { text: 'הצעד הבא: נעדכן את הכיוונים כך שיתאימו לשינויים באבנים.', target: 'design' };
  }
  if (!selected) {
    return { text: 'הצעד הבא: נבחר כיוון עיצוב כדי להמשיך.', target: 'design' };
  }
  if (!output || outStale) {
    return { text: 'הצעד הבא: נכין את הבריף המלא לכיוון שנבחר.', target: 'brief' };
  }
  return { text: 'הצעד הבא: נכין תוכנית הדמיה או ערכת הצגה ללקוח.', target: 'brief' };
}

// ---------------------------------------------------------------------------
// buildAdvisorInsight(ctx) → { understandingHe, recommendationHe, nextStepHe,
//                              nextStepTarget }
// ctx: { trayItems, brief, hasConcepts, conceptsStale, selected, output,
//        outStale, hasStones }
// ---------------------------------------------------------------------------
export function buildAdvisorInsight(ctx) {
  const c = ctx || {};
  const trayItems = Array.isArray(c.trayItems) ? c.trayItems : [];
  const brief = c.brief || {};
  const hasStones = typeof c.hasStones === 'boolean' ? c.hasStones : trayItems.length > 0;
  const hasConcepts = Boolean(c.hasConcepts);

  const understandingHe = buildUnderstanding({ trayItems, brief });
  const recommendationHe = buildRecommendation({
    trayItems,
    brief,
    hasConcepts,
    selected: c.selected || null,
  });
  const nextStep = buildNextStep({
    hasStones,
    hasConcepts,
    conceptsStale: Boolean(c.conceptsStale),
    selected: c.selected || null,
    output: c.output || null,
    outStale: Boolean(c.outStale),
  });

  return {
    understandingHe,
    recommendationHe,
    nextStepHe: nextStep.text,
    nextStepTarget: nextStep.target,
  };
}

// ---------------------------------------------------------------------------
// Compact contextual summary line for the Active Creation Context (Clean 8K
// section 1): "3 אבנים · 2 רפרנסים · כיוון אחד נבחר". Pure — takes plain
// counts/flags, no store access.
// ---------------------------------------------------------------------------
export function buildContextSummaryHe({ stoneCount, referenceCount, hasSelectedDirection }) {
  const parts = [];
  const stones = Number.isFinite(stoneCount) ? stoneCount : 0;
  const refs = Number.isFinite(referenceCount) ? referenceCount : 0;

  if (stones > 0) {
    parts.push(stones === 1 ? 'אבן אחת' : `${stones} אבנים`);
  }
  if (refs > 0) {
    parts.push(refs === 1 ? 'רפרנס אחד' : `${refs} רפרנסים`);
  }
  parts.push(hasSelectedDirection ? 'כיוון אחד נבחר' : 'טרם נבחר כיוון');

  return parts.join(' · ');
}

// Re-exported for convenience so callers only need one import for both the
// advisor insight and the section-7 feedback phrase builders.
export { stonesFeedbackHe, metalFeedbackHe, directionsFeedbackHe };
